// Supabase Edge Function: verify-hpr
//
// Verifies a doctor's ABDM Healthcare Professionals Registry (HPR) ID at
// registration time and stores the result in public.doctors, linked to the
// staff row created by the existing self-registration flow.
//
// IMPORTANT — scope of this integration:
// HPR does not offer a bulk "list/search all doctors" API for third parties.
// Its documented APIs cover a doctor creating/managing their own HPR ID and,
// separately, looking up one professional by their HPR ID for verification.
// This function does the latter: given the HPR ID a doctor enters on our own
// registration form, it asks ABDM to confirm it and return the officially
// registered name/qualification/specialization/facility.
//
// Credentials: ABDM_CLIENT_ID / ABDM_CLIENT_SECRET must be issued to a
// registered ABDM Sandbox (or production) application — see
// https://sandbox.abdm.gov.in. Until those are set as Supabase secrets, this
// function returns verification_status "unavailable" and never blocks the
// caller — the app falls back to the existing manual admin-verification flow.
//
// Set as Supabase secrets (never commit real values):
//   supabase secrets set ABDM_CLIENT_ID=... ABDM_CLIENT_SECRET=...
// Optional overrides (default to ABDM's public sandbox hosts):
//   ABDM_SESSION_URL, ABDM_HPR_SEARCH_URL

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ABDM_CLIENT_ID = Deno.env.get("ABDM_CLIENT_ID");
const ABDM_CLIENT_SECRET = Deno.env.get("ABDM_CLIENT_SECRET");
const ABDM_SESSION_URL =
  Deno.env.get("ABDM_SESSION_URL") ?? "https://dev.abdm.gov.in/gateway/v0.5/sessions";
// NOTE: ABDM has not published a stable, generally-available "search by HPR ID"
// REST path at the time this was written — sandbox endpoints have moved before
// (see the HPR swagger at https://hpridsbx.abdm.gov.in/api/swagger-ui.html#/).
// Confirm the exact path from your approved sandbox app's swagger before relying
// on this in a real demo, and update ABDM_HPR_SEARCH_URL if it differs.
const ABDM_HPR_SEARCH_URL =
  Deno.env.get("ABDM_HPR_SEARCH_URL") ??
  "https://hpridsbx.abdm.gov.in/api/v1/search/searchByHprId";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBody {
  staffId: string;
  hprId: string;
}

interface DoctorRow {
  staff_id: string;
  hpr_id: string;
  verification_status: "verified" | "failed" | "unavailable";
  verified_name?: string;
  verified_qualification?: string;
  verified_specialization?: string;
  verified_facility?: string;
  error_message?: string;
  raw_response?: unknown;
  checked_at: string;
}

async function getAbdmSessionToken(): Promise<string> {
  const res = await fetch(ABDM_SESSION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: ABDM_CLIENT_ID,
      clientSecret: ABDM_CLIENT_SECRET,
      grantType: "client_credentials",
    }),
  });
  if (!res.ok) {
    throw new Error(`ABDM session request failed: HTTP ${res.status}`);
  }
  const data = await res.json();
  const token = data.accessToken ?? data.access_token;
  if (!token) throw new Error("ABDM session response did not include an access token");
  return token;
}

async function lookupHprProfile(hprId: string, token: string) {
  const res = await fetch(ABDM_HPR_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ hprId }),
  });
  if (!res.ok) {
    throw new Error(`ABDM HPR lookup failed: HTTP ${res.status}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const { staffId, hprId } = body;
  if (!staffId || !hprId) {
    return new Response(JSON.stringify({ error: "staffId and hprId are required" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const checkedAt = new Date().toISOString();
  let row: DoctorRow;

  if (!ABDM_CLIENT_ID || !ABDM_CLIENT_SECRET) {
    row = {
      staff_id: staffId,
      hpr_id: hprId,
      verification_status: "unavailable",
      error_message: "ABDM credentials not configured — falling back to manual admin verification.",
      checked_at: checkedAt,
    };
  } else {
    try {
      const token = await getAbdmSessionToken();
      const profile = await lookupHprProfile(hprId, token);
      row = {
        staff_id: staffId,
        hpr_id: hprId,
        verification_status: "verified",
        verified_name: profile.name ?? profile.fullName,
        verified_qualification: Array.isArray(profile.qualification)
          ? profile.qualification.join(", ")
          : profile.qualification,
        verified_specialization: profile.specialization ?? profile.systemOfMedicine,
        verified_facility: profile.facilityName ?? profile.hfrFacilityName,
        raw_response: profile,
        checked_at: checkedAt,
      };
    } catch (err) {
      // Any network/auth/shape failure falls back gracefully — it never blocks
      // the doctor's self-registration flow.
      row = {
        staff_id: staffId,
        hpr_id: hprId,
        verification_status: "failed",
        error_message: err instanceof Error ? err.message : "Unknown ABDM HPR error",
        checked_at: checkedAt,
      };
    }
  }

  const { data, error } = await supabase
    .from("doctors")
    .upsert(row, { onConflict: "staff_id" })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});
