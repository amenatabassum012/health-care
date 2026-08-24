# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from docx_style import *

OUT = r"C:\Users\Lenovo Thinkpad\Desktop\SIH\docs\04_Phased_Implementation_Roadmap.docx"

doc = new_doc()

add_title_page(
    doc,
    kicker="Phased Implementation Roadmap",
    title="Rural Health Connect",
    subtitle="From MVP to a state-wide, offline-first care-access platform",
    meta_lines=[
        "Version 1.0  •  Draft for Development Handoff",
        "Companion to: PRD, Architecture Specification, Design Specification",
        "Author: Bilal  •  bilal@mail.fasttrackexp.com",
        "Date: 24 August 2026",
    ],
    accent_hex=BLUE_HEX,
)

add_section_heading(doc, "Roadmap Overview")
body(doc, "Six phases move the platform from a working hackathon-grade MVP to a rollout-ready system. Each "
          "phase is scoped so it is independently demoable, and each phase's deliverables map directly to "
          "requirements in the PRD and services in the Architecture Specification.")

add_callout(doc, "Build sequencing  ",
            "Frontend first. Every phase below is built against the UI first: screens are implemented in full "
            "against a mocked/stubbed API (static JSON + an in-memory mock server matching the real API "
            "contracts from the Architecture Specification), so the look, flow and attractiveness of the app "
            "can be reviewed and approved before any real backend service is built. The actual NestJS/Postgres "
            "backend described in the Architecture Specification is implemented afterwards, phase by phase, "
            "and simply replaces each mock behind the same contract — no frontend rework required.",
            hex_bg="FFF7E8", hex_bar=AMBER, label_color=AMBER)

overview_rows = [
    ["Phase 0", "Discovery & Foundation", "Week 1"],
    ["Phase 1", "Core MVP — Patient + Doctor happy path", "Weeks 2–4"],
    ["Phase 2", "Records, Referral Continuity & Verification", "Weeks 5–6"],
    ["Phase 3", "Offline-First & Low-Connectivity Hardening", "Weeks 7–8"],
    ["Phase 4", "Coordination, Follow-up & Facility Quality Dashboards", "Weeks 9–10"],
    ["Phase 5", "Multilingual, Voice, Emergency SOS & Interoperability Polish", "Weeks 11–12"],
]
styled_table(doc, ["Phase", "Focus", "Indicative Timeline"], overview_rows, col_widths=[1.0, 3.9, 1.8],
             header_bg=BLUE_HEX)

def phase(title, goal, deliverables, features, success):
    add_section_heading(doc, title, level=1)
    add_callout(doc, "Goal  ", goal)
    add_section_heading(doc, "Deliverables", level=3)
    for d in deliverables:
        bullet(doc, d)
    add_section_heading(doc, "Features included", level=3)
    for f in features:
        bullet(doc, f)
    add_section_heading(doc, "Success criteria", level=3)
    for s in success:
        bullet(doc, s, style='List Bullet')
    doc.add_paragraph()

phase(
    "Phase 0 — Discovery & Foundation",
    "Lock scope, stand up the technical foundation, and secure the reference data every later phase depends on.",
    [
        "Repository, CI scaffold, environment setup per the Architecture Specification stack.",
        "Design tokens (colour, type, spacing) implemented as the base Tailwind/shadcn theme from the Design "
        "Specification.",
        "Pilot dataset assembled: sample government facility registry entries and NMC/State Medical Council "
        "credential formats for the target pilot district.",
        "Core data model (Patient, StaffUser, Facility, Appointment, Referral, HealthRecord) implemented as "
        "Prisma/PostgreSQL schema.",
    ],
    [
        "No end-user features yet — this phase is infrastructure and data foundation.",
    ],
    [
        "A developer can run the app locally against seeded facility/credential data.",
        "Design tokens render identically across patient and doctor surfaces.",
    ],
)

phase(
    "Phase 1 — Core MVP: Patient + Doctor Happy Path (Frontend-First)",
    "Prove the core loop end-to-end in the UI: a patient can get triaged, booked, and seen; a doctor can see "
    "them and record a structured outcome — built and reviewed against mocked data before any real backend "
    "exists.",
    [
        "Full frontend build for both flows against a mock API layer (static/mock JSON matching the real "
        "contracts), so design and UX can be reviewed and signed off first.",
        "Landing/role selection screen with separate Patient and Doctor entry points.",
        "Patient: mobile+OTP login, language selection, home screen, digital triage (rule-based, single "
        "language first), booking with basic queue position, video/audio teleconsultation.",
        "Doctor: registration flow including facility-registry search and credential upload (verification "
        "workflow can be manual/admin-console at this stage), staff login, dashboard with today's queue, "
        "structured diagnosis + prescription entry.",
        "Real backend (NestJS/PostgreSQL services from the Architecture Specification) is implemented after "
        "the frontend is approved, swapped in behind the same mock contracts.",
    ],
    [
        "Landing/Role Selection · Patient login/signup · Language selection (1 language) · Patient home · "
        "Digital triage (core rule set) · Booking/queue (basic) · Teleconsultation (video/audio, no degrade "
        "logic yet) · Doctor registration & login · Doctor dashboard · Structured diagnosis entry.",
    ],
    [
        "A pilot patient can complete triage → booking → teleconsultation → structured diagnosis without "
        "leaving the app.",
        "A doctor cannot take a consultation before being marked verified in the admin console.",
    ],
)

phase(
    "Phase 2 — Records, Referral Continuity & Verification",
    "Close eSanjeevani's two biggest gaps directly: continuity of records across facility tiers, and accurate, "
    "trackable referrals — plus turn manual verification into the real admin workflow.",
    [
        "Longitudinal Health Record service with QR/ID-based retrieval across facility tiers.",
        "Structured Referral service: specialty tagging, urgency, structured clinical summary, status machine "
        "(Pending/Confirmed/Completed), visible to patient and receiving doctor.",
        "Doctor Verification Dashboard for facility admins: review, approve, reject with reason.",
        "Role-scoped doctor dashboard (facility + specialty context on login).",
    ],
    [
        "My Health Records (patient) · Referral tracking (patient) · Referral inbox & creation (doctor) · "
        "Patient longitudinal history view (doctor) · Admin verification dashboard (Facility Admin role) · "
        "Role selection (Doctor/Specialist/CHO/Facility Admin) with differentiated permissions.",
    ],
    [
        "A referral created at a sub-centre is visible, correctly specialty-tagged, and trackable at the "
        "receiving district hospital.",
        "A patient's record from a prior visit at a different facility tier is retrievable via QR/ID.",
    ],
)

phase(
    "Phase 3 — Offline-First & Low-Connectivity Hardening",
    "Make the platform actually usable in the network conditions it was designed for — this phase is what "
    "differentiates RHC from eSanjeevani's no-offline-mode gap.",
    [
        "Local-first data cache (IndexedDB/Dexie) for triage, records, and queue status.",
        "Background Sync API integration for queued offline writes.",
        "Service worker app-shell caching for instant repeat loads.",
        "Teleconsultation auto-degrade: video → audio-only → scheduled callback request, without losing triage/"
        "queue context.",
        "SMS/IVR channel integration for OTP and time-critical notices as a non-app-dependent fallback.",
    ],
    [
        "Offline-first triage & record viewing · Queued sync for offline actions · Auto-degrading "
        "teleconsultation · SMS/IVR fallback channel for OTP and notices.",
    ],
    [
        "Triage can be completed and later synced with zero live connectivity throughout.",
        "A teleconsultation started on video survives a drop to 2G by degrading to audio, then callback, "
        "without the patient losing their place in the flow.",
    ],
)

phase(
    "Phase 4 — Coordination, Follow-up & Facility Quality Dashboards",
    "Add the coordination layer that keeps high-risk patients from falling through the cracks and gives "
    "facility/district staff real operational visibility.",
    [
        "Diagnostics & Medicine Inventory service with facility-level availability lookups.",
        "Follow-up/reminder engine for maternal, child and chronic high-risk cases with SMS/call channels for "
        "non-smartphone users.",
        "Facility Dashboard: load, referral completion rate, stock visibility, quality metrics, with "
        "district-level roll-up.",
    ],
    [
        "Check medicine availability (patient) · Diagnostic/medicine coordination before referral (doctor) · "
        "Follow-up reminders (app + SMS/call) · Facility dashboard (admin) · Quality metrics reporting.",
    ],
    [
        "A flagged high-risk patient receives a follow-up reminder through at least one non-app channel.",
        "A facility admin can see referral completion rate and stock status for their facility in one screen.",
    ],
)

phase(
    "Phase 5 — Multilingual, Voice, Emergency SOS & Interoperability Polish",
    "Finish the accessibility and national-integration commitments that determine real-world adoption, "
    "directly targeting the awareness/adoption gaps seen in both eSanjeevani and ABDM.",
    [
        "Full multilingual rollout (Hindi + English + pilot-state regional language(s)) across UI, SMS, and "
        "voice prompts.",
        "Voice input/output layered onto triage and search fields.",
        "Emergency SOS: one-tap escalation bypassing the normal queue, with SMS fallback.",
        "ABDM/ABHA optional linkage and FHIR resource mapping for records; consent explained in plain "
        "multilingual language at point of sharing.",
        "In-app and ASHA/CHO-workflow awareness prompts to counter the low-adoption pattern seen with ABDM.",
    ],
    [
        "Multilingual toggle (all screens) · Voice input everywhere applicable · Emergency SOS · ABDM/ABHA "
        "linkage & FHIR mapping · Consent-at-point-of-use messaging · Onboarding awareness flow.",
    ],
    [
        "A user can complete the entire patient journey in a regional language using voice input alone.",
        "Emergency SOS reaches a routed facility even when the standard booking flow is unavailable.",
        "A record shared via ABHA/FHIR is correctly represented as a consent-managed exchange.",
    ],
)

add_section_heading(doc, "Dependencies Across Phases")
dep_rows = [
    ["Phase 1 → Phase 2", "Referral/records require the core data model and doctor dashboard from Phase 1."],
    ["Phase 1 → Phase 3", "Offline sync wraps the same triage/queue/consultation flows built in Phase 1."],
    ["Phase 2 → Phase 4", "Facility dashboards aggregate referral and verification data introduced in Phase 2."],
    ["Phase 3 → Phase 5", "SMS/IVR fallback channel built in Phase 3 is reused for follow-up (Phase 4) and "
     "emergency SOS (Phase 5)."],
    ["Phase 0 → All phases", "Facility registry and credential seed data from Phase 0 underpins every "
     "verification and referral-routing feature."],
]
styled_table(doc, ["Dependency", "Reason"], dep_rows, col_widths=[1.6, 4.9], header_bg=BLUE_HEX)

doc.save(OUT)
print("Saved:", OUT)
