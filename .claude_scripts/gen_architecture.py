# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from docx_style import *

OUT = r"C:\Users\Lenovo Thinkpad\Desktop\SIH\docs\02_Architecture_Specification.docx"

doc = new_doc()

add_title_page(
    doc,
    kicker="Technical Architecture Specification",
    title="SwasthyaSetu AI",
    subtitle="System design, service boundaries, data model & offline-first strategy",
    meta_lines=[
        "Version 1.0  •  Draft for Development Handoff",
        "Companion to: Product Requirements Document, Design Specification, Phased Roadmap",
        "Author: Bilal  •  bilal@mail.fasttrackexp.com",
        "Date: 24 August 2026",
    ],
    accent_hex=BLUE_HEX,
)

# ---------------- 1. Architecture Principles ----------------
add_section_heading(doc, "1. Architecture Principles")
for lead, text in [
    ("Offline-first, not offline-tolerant. ", "Every core patient/doctor action is designed against a local-first "
     "data store with background sync — connectivity is treated as an enhancement, not a requirement."),
    ("Structured over free-text. ", "Diagnosis, referral specialty, facility affiliation and credential data are "
     "all constrained/coded fields, directly fixing eSanjeevani's mis-routed-referral problem."),
    ("Interoperable by design. ", "Patient identity and clinical records map onto FHIR R4 resources and ABDM/ABHA "
     "identifiers from day one, without making ABHA a hard requirement to use the app."),
    ("Progressive degradation. ", "Video → audio → async callback for consultations; full UI → low-bandwidth UI "
     "→ SMS/voice channel for every critical patient action."),
    ("Verifiable identity for staff. ", "No doctor can transact until facility affiliation is matched against a "
     "government registry and credentials are human-approved."),
    ("Strengthen, don't fragment. ", "RHC is built as a layer that can sync into ABDM's Health Information "
     "Exchange rather than a walled-garden competitor to it."),
]:
    bullet(doc, text, bold_lead=lead)

# ---------------- 2. Recommended Technology Stack ----------------
add_section_heading(doc, "2. Recommended Technology Stack")
body(doc, "Chosen for fast iteration inside AI-assisted builders (Bolt, Cursor, v0) while remaining production-"
          "credible for a government-facing rural health system.")

stack_rows = [
    ["Frontend (Patient + Doctor web/PWA)", "React 18 + TypeScript + Vite", "Fast HMR, huge ecosystem, first-class "
     "PWA/offline tooling, plays well with AI scaffolding tools."],
    ["UI / Design system", "Tailwind CSS + shadcn/ui + Radix primitives", "Accessible-by-default components, "
     "fully themeable to the brand system in the Design Specification."],
    ["Mobile packaging", "PWA (installable) first; Capacitor wrapper for Android/iOS if a store app is needed",
     "One codebase; avoids a separate native build for V1."],
    ["State & offline data", "TanStack Query + Dexie.js (IndexedDB) + Background Sync API", "Local-first cache, "
     "queued writes, automatic replay when connectivity returns."],
    ["Backend API", "Node.js + NestJS (TypeScript)", "Modular, testable service boundaries; shares types with the "
     "React frontend."],
    ["Database", "PostgreSQL", "Relational integrity for referrals/records; native JSONB for flexible clinical "
     "fields; strong FHIR-mapping ecosystem."],
    ["ORM", "Prisma", "Type-safe schema, migrations that are easy for an AI tool or a small team to reason about."],
    ["Cache / real-time queue state", "Redis", "Live queue position, session state, rate limiting."],
    ["Real-time updates", "WebSocket (Socket.IO) over Redis pub/sub", "Live queue position, referral status, "
     "doctor dashboard updates."],
    ["Teleconsultation (video/audio)", "WebRTC via a managed SDK (e.g., Agora/Twilio) with a self-hosted "
     "fallback (Jitsi)", "Auto-degrade path: video → audio-only on the same SDK → SMS/IVR callback request."],
    ["SMS / voice / OTP", "Carrier-grade gateway (e.g., MSG91/Twilio) supporting OTP, template SMS, and IVR "
     "callback", "Reaches non-smartphone users for reminders and emergency confirmation."],
    ["Auth", "OTP-based auth (patients) + Staff ID/Facility Code + OTP or password (staff), JWT sessions", "No "
     "email required for patients; stronger verification path for staff."],
    ["File / credential storage", "S3-compatible object storage (encrypted at rest)", "Doctor certificate photos, "
     "QR-shareable record snapshots."],
    ["i18n", "react-i18next + ICU message format; voice via device TTS/STT and a cloud speech API", "Central "
     "translation catalogue; voice input/output layered on the same catalogue."],
    ["Interoperability layer", "FHIR R4 resource mapping + ABDM Health Information Provider/User (HIP/HIU) "
     "integration module", "Publishes/consumes records through ABDM's consent-managed exchange."],
    ["Facility/credential registries", "Sync jobs against government facility registry & NMC/State Medical "
     "Council datasets", "Used to populate searchable, non-free-text affiliation & credential lookups."],
    ["Infrastructure", "Containerised services (Docker) on a cloud provider, CDN for static assets, edge caching "
     "for low-connectivity regions", "Consistent deploys; fast asset delivery even on poor links."],
    ["Observability", "Structured logging + a metrics/dashboard stack (e.g., Grafana) feeding the Facility "
     "Dashboard's quality metrics", "Same telemetry powers both engineering ops and clinical-quality reporting."],
]
styled_table(doc, ["Layer", "Choice", "Why"], stack_rows, col_widths=[1.6, 2.0, 2.9], header_bg=BLUE_HEX)

doc.add_page_break()

# ---------------- 3. High-Level System Architecture ----------------
add_section_heading(doc, "3. High-Level System Architecture")
body(doc, "Layered view — client apps at the top, domain services in the middle, shared data & external "
          "national registries at the base.")

layers = [
    ["Client layer", "Patient PWA (mobile-first) · Doctor/Health-Worker Web App · Facility Admin Dashboard — "
     "all offline-capable via a local-first data cache and service worker."],
    ["Edge / gateway", "API Gateway (auth, rate limiting, request routing) · CDN + edge cache for static and "
     "low-bandwidth payloads · WebSocket gateway for live updates."],
    ["Domain services", "Identity & Verification · Triage Engine · Appointment & Queue · Teleconsultation · "
     "Health Records (EHR) · Referral · Diagnostics & Medicine Inventory · Notification & Follow-up · "
     "Facility & Quality Dashboard."],
    ["Interoperability layer", "FHIR resource mapper · ABDM HIP/HIU connector · Government Facility Registry "
     "sync · NMC/State Medical Council credential sync."],
    ["Data layer", "PostgreSQL (system of record) · Redis (real-time/cache) · Object storage (documents, "
     "certificates, QR snapshots)."],
    ["Channels", "SMS gateway · IVR/voice callback · Push notification."],
]
styled_table(doc, ["Layer", "Contains"], layers, col_widths=[1.6, 4.9], header_bg=BLUE_HEX)

# ---------------- 4. Domain Services ----------------
add_section_heading(doc, "4. Domain Services (bounded contexts)")
services = [
    ("Identity & Verification", "Patient OTP auth; staff registration (role, facility, specialty, credential "
     "upload); Pending Verification state machine; admin approval workflow; scoped session issuance "
     "(facility + specialty context baked into the doctor's token)."),
    ("Triage Engine", "Multilingual, icon-assisted rule-based questionnaire; maps symptoms + risk flags "
     "(e.g., pregnancy, chronic illness, paediatric) to one of: self-care / teleconsult / in-person / "
     "emergency; versioned decision rules so clinical logic can be audited and updated."),
    ("Appointment & Queue", "Slot management per facility/doctor; live queue-position computation; teleconsult "
     "vs. in-person booking; feeds real-time position to the patient client over WebSocket."),
    ("Teleconsultation", "Session orchestration for video/audio; automatic quality-based degrade to audio-only, "
     "then to a scheduled callback request, without losing the linked triage/queue context."),
    ("Health Records (EHR)", "Longitudinal, patient-owned record; visit history, prescriptions, diagnoses; "
     "QR/ID-based retrieval so any facility tier can pull the same record; FHIR-mapped for ABDM exchange."),
    ("Referral", "Structured referral object (specialty tag, urgency, structured clinical summary, originating "
     "and receiving facility); status machine — pending / confirmed / completed; visible to both patient and "
     "receiving doctor, closing eSanjeevani's referral-accuracy and tracking gaps."),
    ("Diagnostics & Medicine Inventory", "Facility-level stock/availability feed for common medicines and "
     "diagnostic tests; queried by doctors before referring and by patients from the home screen."),
    ("Notification & Follow-up", "Rules-based high-risk flagging (maternal, child, chronic) driving scheduled "
     "SMS/IVR/app reminders; delivery-channel fallback for non-smartphone users."),
    ("Facility & Quality Dashboard", "Aggregates load, referral completion rate, stock visibility and quality "
     "metrics per sub-centre/PHC/district hospital for admins and district authorities."),
    ("Emergency SOS", "One-tap, always-available escalation that bypasses standard queue/booking flow and "
     "routes to the nearest emergency-capable facility/contact, with SMS fallback if the app can't complete "
     "the request online."),
]
for name, desc in services:
    p = doc.add_paragraph()
    r = p.add_run(name)
    r.bold = True
    r.font.color.rgb = TEAL_DARK
    r.font.size = Pt(11)
    body(doc, desc)

doc.add_page_break()

# ---------------- 5. Core Data Model ----------------
add_section_heading(doc, "5. Core Data Model (key entities)")
entities = [
    ("Patient", "id, abha_id (nullable), name, dob, gender, guardian_of[], preferred_language, phone"),
    ("StaffUser", "id, name, phone, email, role[Doctor|Specialist|CHO|FacilityAdmin], specialty, "
     "facility_id, nmc_registration_no, credential_doc_url, verification_status"),
    ("Facility", "id (registry-linked), name, tier[SubCentre|PHC|RuralHospital|DistrictHospital], "
     "location, registry_ref"),
    ("TriageSession", "id, patient_id, answers[], computed_urgency, recommended_action, created_at"),
    ("Appointment", "id, patient_id, facility_id/doctor_id, type[Teleconsult|InPerson], slot, "
     "queue_position, status"),
    ("Consultation", "id, appointment_id, mode[Video|Audio|Callback], structured_diagnosis, prescription, "
     "notes, started_at, ended_at"),
    ("Referral", "id, patient_id, from_facility_id, to_facility_id, specialty, urgency, structured_summary, "
     "status[Pending|Confirmed|Completed]"),
    ("HealthRecord", "id, patient_id, source_consultation/referral, fhir_resource_refs[], shareable_qr_token"),
    ("MedicineStock / DiagnosticAvailability", "id, facility_id, item, available_qty/status, updated_at"),
    ("FollowUpTask", "id, patient_id, risk_category[Maternal|Child|Chronic], due_at, channel[App|SMS|Call], "
     "status"),
    ("EmergencySOSEvent", "id, patient_id, location, triggered_at, routed_facility_id, status"),
]
styled_table(doc, ["Entity", "Key fields"], entities, col_widths=[1.8, 4.7], header_bg=BLUE_HEX, font_size=9)

# ---------------- 6. Offline-First & Sync Strategy ----------------
add_section_heading(doc, "6. Offline-First & Sync Strategy")
for lead, text in [
    ("Local-first store. ", "Triage forms, the patient's own health record, and current appointment/queue state "
     "are cached in IndexedDB (via Dexie.js) after first successful load."),
    ("Queued writes. ", "Actions taken offline (completing a triage form, requesting a callback) are queued "
     "locally and replayed via the Background Sync API once connectivity returns, with optimistic UI + "
     "conflict resolution favouring the server's canonical record on sync."),
    ("Service worker caching. ", "App shell and static assets are cached for instant load on repeat visits even "
     "with no network."),
    ("Graceful channel fallback. ", "If the app itself cannot reach the network, critical flows (emergency "
     "escalation, high-risk follow-up) fall back to SMS/IVR, which does not depend on the patient's data "
     "connection at all."),
    ("Low-bandwidth payloads. ", "API responses are paginated/trimmed for low-bandwidth clients; images (e.g., "
     "credential photos) are compressed client-side before upload."),
]:
    bullet(doc, text, bold_lead=lead)

# ---------------- 7. Security & Compliance Architecture ----------------
add_section_heading(doc, "7. Security & Compliance Architecture")
for lead, text in [
    ("Role-based access control (RBAC). ", "Every StaffUser role (Doctor/Specialist/CHO/Facility Admin) maps to "
     "an explicit permission set enforced at the API layer, not just hidden in the UI."),
    ("Verified-identity gate for staff. ", "A StaffUser cannot create consultations, prescriptions or referrals "
     "while verification_status is Pending — enforced server-side, independent of the UI."),
    ("Facility-truth from a registry, not free text. ", "Facility affiliation is selected from a synced "
     "government registry dataset; the API rejects any facility_id not present in that registry."),
    ("Encryption. ", "TLS in transit; encryption at rest for the database and object storage (credential photos, "
     "QR snapshots)."),
    ("Consent logging. ", "Every health-record view/share (including QR-based access at a new facility) is "
     "logged with who/when/why, and explained to the patient in plain multilingual language at the point of "
     "sharing — directly addressing the ABDM privacy-understanding gap."),
    ("ABDM alignment. ", "Records map to FHIR R4 resources; sharing across facilities is designed to be "
     "expressible as an ABDM consent-managed Health Information Exchange transaction where the patient has an "
     "ABHA ID, while remaining fully functional without one."),
]:
    bullet(doc, text, bold_lead=lead)

# ---------------- 8. External Integrations ----------------
add_section_heading(doc, "8. External Integrations")
integ = [
    ["ABDM / ABHA", "Optional patient identity linkage; FHIR-based record exchange via HIP/HIU APIs."],
    ["Government Facility Registry", "Source of truth for facility search/selection during staff registration."],
    ["NMC / State Medical Council registry", "Validates doctor registration numbers where an API is available; "
     "otherwise credential photo + human admin approval is the source of truth."],
    ["SMS / IVR gateway", "OTP, appointment/queue notices, high-risk follow-up reminders, emergency confirmations."],
    ["WebRTC video/audio SDK", "Teleconsultation session transport, with graceful degrade logic owned by RHC, "
     "not the SDK."],
]
styled_table(doc, ["Integration", "Purpose"], integ, col_widths=[1.8, 4.7], header_bg=BLUE_HEX)

# ---------------- 9. Deployment & Scalability ----------------
add_section_heading(doc, "9. Deployment & Scalability View")
for lead, text in [
    ("Containerised services. ", "Each domain service ships as an independently deployable container behind the "
     "API gateway, so a pilot district's load doesn't require scaling the whole platform."),
    ("CDN + edge caching. ", "Static assets and cacheable low-bandwidth payloads are served from the edge closest "
     "to the rural client."),
    ("Horizontal scale on the hot paths. ", "Queue/real-time (Redis + WebSocket gateway) and Triage Engine are "
     "the first services scaled out, since they see the highest concurrent patient traffic."),
    ("Incremental facility onboarding. ", "Facility Dashboard and registries are designed to onboard one "
     "district/state at a time without a schema change, matching a phased rollout."),
]:
    bullet(doc, text, bold_lead=lead)

doc.save(OUT)
print("Saved:", OUT)
