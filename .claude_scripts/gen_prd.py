# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from docx_style import *
from docx.enum.text import WD_ALIGN_PARAGRAPH

OUT = r"C:\Users\Lenovo Thinkpad\Desktop\SIH\docs\01_PRD_Product_Requirements_Document.docx"

doc = new_doc()

add_title_page(
    doc,
    kicker="Product Requirements Document",
    title="Rural Health Connect",
    subtitle="An integrated care-access and quality platform for rural & underserved public healthcare",
    meta_lines=[
        "Version 1.0  •  Draft for Development Handoff",
        "Prepared for: Smart India Hackathon — Healthcare Accessibility Track",
        "Author: Bilal  •  bilal@mail.fasttrackexp.com",
        "Date: 24 August 2026",
    ],
)

# ---------------- 1. Executive Summary ----------------
add_section_heading(doc, "1. Executive Summary")
body(doc, "Rural and underserved communities in India face long travel distances, shortages of specialists, "
          "irregular diagnostics, fragmented medical records, delayed referrals, and low awareness of the "
          "services already available to them. Patients move between sub-centres, Primary Health Centres (PHCs), "
          "rural hospitals and district hospitals without any continuity of information. Connectivity, language, "
          "health literacy and affordability compound the problem.")
body(doc, "Rural Health Connect (RHC) is an integrated care-access and quality-support platform that combines "
          "assisted teleconsultation, digital triage, appointment and queue management, longitudinal patient "
          "records, referral tracking, diagnostic and medicine-availability coordination, high-risk follow-up, "
          "and facility-level quality dashboards — all designed offline-first, multilingual, and voice-assisted "
          "for low-literacy, low-connectivity rural users. The platform is designed to strengthen, not replace, "
          "the public health system, and to interoperate with national digital health infrastructure "
          "(ABDM / ABHA, FHIR).")

add_callout(doc, "Guiding principle  ",
            "Every feature must work for a patient with a basic smartphone, patchy 2G/3G network, low reading "
            "literacy, and no prior experience of digital health tools — while still giving doctors and "
            "administrators the structured, accountable workflows that eSanjeevani and ABDM currently lack.")

# ---------------- 2. Problem Statement ----------------
add_section_heading(doc, "2. Problem Statement")
body(doc, "Theme: Accessibility and quality of public healthcare services, particularly in rural and "
          "underserved areas.", bold=True)
body(doc, "Primary health facilities operate with constrained staff and equipment. Patients experience long "
          "travel and waiting times, irregular access to specialists and diagnostics, and referrals that are "
          "poorly documented and hard to track. The challenge is to improve timely access, continuity of care, "
          "clinical quality, and system accountability, using digital tools that frontline health workers and "
          "rural patients can actually use.")

add_section_heading(doc, "2.1 Why existing national platforms fall short", level=2)
body(doc, "eSanjeevani (national telemedicine platform)", bold=True, color=TEAL_DARK)
for t in [
    "Frequent call drops in low-network rural areas; no offline mode for core actions.",
    "No structured triage/screening step — leads to a high rate of wrong OPD recommendations.",
    "Referrals are frequently routed to the wrong specialty, backed by poor or free-text clinical detail.",
    "No real continuity of records as a patient moves from sub-centre → PHC → district hospital.",
    "Multilingual/translation support remains incomplete across the patient journey.",
    "Low public awareness — many eligible patients do not know the service exists.",
]:
    bullet(doc, t)

body(doc, "ABDM / ABHA (Ayushman Bharat Digital Mission)", bold=True, color=TEAL_DARK)
for t in [
    "Awareness and adoption remain low among rural and vulnerable populations despite growing infrastructure.",
    "Weak user understanding of data privacy/consent — the system assumes a self-management capability that "
    "most first-time digital-health users do not yet have.",
    "ABHA IDs get created during registration drives but see very low ongoing usage afterwards.",
    "Smaller hospitals and clinics remain paper-based and resist switching to digital records.",
    "Uneven internet connectivity and digital literacy across states limits real rural reach.",
    "Adoption is entirely voluntary — no policy mandate — so implementation stays patchy and inconsistent.",
]:
    bullet(doc, t)

add_callout(doc, "Design implication  ",
            "RHC treats every gap above as a functional requirement, not an aspiration: offline-first by "
            "default, structured (not free-text) triage and referrals, one continuous longitudinal record per "
            "patient, consent explained in plain multilingual language at the point of use, and in-app / "
            "SMS-based awareness built into onboarding rather than assumed.",
            hex_bg="FFF7E8", hex_bar=AMBER, label_color=AMBER)

# ---------------- 3. Goals & Success Metrics ----------------
add_section_heading(doc, "3. Goals & Success Metrics")
styled_table(
    doc,
    ["Goal", "Target Outcome", "Primary Metric"],
    [
        ["Reduce unnecessary travel", "Fewer avoidable in-person visits for issues resolvable via teleconsult/self-care",
         "% of triage sessions resolved without travel"],
        ["Reduce waiting time", "Patients see live queue position before leaving home", "Avg. wait time at facility (pre vs. post)"],
        ["Earlier consultation", "High-risk symptoms are escalated same-day", "Time from symptom entry to first consult"],
        ["Improve referral completion", "Referrals reach the correct specialty with structured clinical data",
         "% referrals completed end-to-end / mis-routed"],
        ["Improve continuity of care", "One record follows the patient across all facility tiers",
         "% of visits linked to existing longitudinal record"],
        ["Improve maternal/child/chronic follow-up", "High-risk patients are proactively contacted",
         "% of flagged patients reached within SLA"],
        ["Improve visibility of supply", "Staff can see medicine/diagnostic availability before referring",
         "% referrals checked against live stock"],
        ["Improve quality monitoring", "Facility admins can see load, completion & stock in one place",
         "Dashboard adoption by facility admins"],
        ["Raise awareness & adoption", "Patients and staff actually use the platform after onboarding",
         "30/60/90-day active usage retention"],
    ],
    col_widths=[1.9, 2.7, 1.9],
)

# ---------------- 4. Target Users / Personas ----------------
add_section_heading(doc, "4. Target Users & Personas")
personas = [
    ("Patient / Guardian", "Rural resident, family caregiver, or guardian booking on behalf of a child or elder.",
     "Basic Android smartphone or a relative's phone, intermittent 2G/3G, limited reading literacy in English."),
    ("Doctor / Specialist", "MBBS doctor or specialist consulting from a PHC, rural hospital, or district hospital, "
     "often remotely for teleconsultation.", "Desktop or tablet at facility, moderately reliable connectivity."),
    ("Community Health Officer (CHO) / ANM / ASHA", "Frontline worker at a sub-centre who performs assisted "
     "triage, escalates cases, and follows up with high-risk patients.", "Shared facility device, sometimes offline for stretches."),
    ("Facility Admin / PHC In-charge", "Manages staff, verifies doctor credentials, and monitors facility-level "
     "quality and supply metrics.", "Facility desktop, reliable connectivity."),
    ("District Health Authority", "Oversees referral completion, quality metrics and stock visibility across "
     "multiple facilities in a district.", "Web dashboard access."),
]
styled_table(doc, ["Persona", "Description", "Context / Device"], personas, col_widths=[1.6, 3.1, 1.8])

# ---------------- 5. Scope ----------------
add_section_heading(doc, "5. Scope")
add_section_heading(doc, "5.1 In Scope (V1 platform)", level=2)
for t in [
    "Role-based landing (Patient/Guardian vs. Doctor/Health Worker) with fully separate flows and logins.",
    "Patient: mobile+OTP auth, language selection, digital triage, appointment/teleconsult booking with live "
    "queue, video/audio consultation with auto-degrade, longitudinal health record with QR/ID sharing, "
    "referral tracking, automated high-risk follow-up reminders (app + SMS/call).",
    "Doctor/Health worker: registration with facility & credential verification, admin approval workflow, "
    "scoped dashboard (facility + specialty), structured diagnosis & referral entry, patient longitudinal "
    "history access, diagnostic/medicine availability lookup.",
    "Facility Admin: doctor verification dashboard, facility-level load/referral/stock/quality dashboard.",
    "Cross-cutting: offline-first core actions, multilingual UI + voice input, emergency SOS escalation, "
    "interoperability with ABDM/ABHA and FHIR-based health records.",
]:
    bullet(doc, t)
add_section_heading(doc, "5.2 Out of Scope (V1)", level=2)
for t in [
    "In-app payments / insurance claims processing.",
    "Full hospital ERP (billing, HR, inventory procurement workflows) beyond stock visibility.",
    "AI-based diagnosis or autonomous clinical decision-making (triage is rule-based decision support only, "
    "not a diagnostic replacement for a clinician).",
    "Native iOS app in V1 (Android + mobile-web PWA first, given rural device distribution).",
]:
    bullet(doc, t)

doc.add_page_break()

# ---------------- 6. Functional Requirements ----------------
add_section_heading(doc, "6. Functional Requirements")
body(doc, "Requirements are grouped by flow, in the order a user encounters them. Each is written as a user "
          "story with acceptance criteria suitable for direct implementation.")

def feature_block(title, stories):
    add_section_heading(doc, title, level=2)
    rows = []
    for as_a, want, so_that, accept in stories:
        rows.append([as_a, want, so_that, accept])
    styled_table(doc, ["As a...", "I want to...", "So that...", "Acceptance criteria"], rows,
                 col_widths=[1.1, 1.8, 1.6, 2.0], font_size=9)

add_section_heading(doc, "6.1 Landing & Role Selection", level=2)
for t in [
    "App opens directly to a binary choice: Patient/Guardian or Doctor/Health Worker — two genuinely separate "
    "navigation paths and two separate login screens, not shared forms with a toggle.",
    "Role choice determines theming, language prompts, and every subsequent screen; a user cannot accidentally "
    "land in the wrong flow.",
]:
    bullet(doc, t)

feature_block("6.2 Patient Flow", [
    ("Patient/Guardian", "sign up and log in using mobile number + OTP", "I don't need an email address to use the app",
     "OTP auth works with no email field; account can be created for self or a dependant (guardian mode)."),
    ("Patient/Guardian", "choose my preferred language at first launch", "every subsequent screen is in a language I understand",
     "Language picker is step 1, before login where possible; all core screens, SMS, and voice prompts respect it."),
    ("Patient/Guardian", "see one home screen with clear options", "I know exactly what I can do next",
     "Home shows: Book appointment, Start teleconsultation, My health records, Track referral, Check medicine "
     "availability, Emergency SOS — icon + label, large tap targets."),
    ("Patient/Guardian", "answer a short symptom-based questionnaire before booking", "the app tells me if I need self-care, "
     "a teleconsult, an in-person visit, or emergency care",
     "Triage is multilingual and icon-assisted for low literacy; produces one of 4 urgency outcomes plus a plain-language reason."),
    ("Patient/Guardian", "pick a facility or teleconsult slot and see my live queue position", "I don't have to wait "
     "physically at the facility", "Queue position updates in near-real-time; estimated wait time shown."),
    ("Patient/Guardian", "have my consultation continue even on a bad network", "a dropped call doesn't end my visit",
     "Video auto-degrades to audio-only, then to a callback-request, without losing consultation context."),
    ("Patient/Guardian", "see my health record update automatically after every visit", "I don't have to carry paper "
     "records between facilities", "Record is longitudinal, viewable anytime, shareable via QR/ID at any facility tier."),
    ("Patient/Guardian", "track the status of a referral in real time", "I know whether the bigger facility has "
     "confirmed my case", "Referral shows pending / confirmed / completed with timestamps."),
    ("Patient/Guardian", "get follow-up reminders for high-risk conditions", "I don't miss critical maternal, child, "
     "or chronic-illness check-ins even without a smartphone",
     "Reminders fire via SMS/automated call in addition to in-app notification, targeted at flagged high-risk cases."),
])

feature_block("6.3 Doctor / Health Worker Flow", [
    ("Doctor/Health Worker", "log in with a staff ID + facility code", "my access is verifiably tied to a real facility",
     "Staff login is a separate, more secure flow than patient login (ID/code + OTP or password)."),
    ("Doctor", "see today's patient queue with triage flags on login", "I can prioritise urgent cases first",
     "Dashboard shows queue, urgency flags, and a referral inbox in one view."),
    ("Doctor", "open a patient's full longitudinal history, not just this visit", "I can make an informed decision "
     "with prior context", "Record view spans all facilities the patient has visited, not just the current one."),
    ("Doctor", "enter diagnosis using structured fields instead of free text", "referrals downstream are accurate "
     "and specialty-correct", "Diagnosis, prescription and referral creation use structured/coded entry with specialty tagging."),
    ("Doctor", "check medicine/diagnostic availability before referring", "I don't send a patient somewhere that "
     "can't actually treat them", "Availability lookup covers current facility and nearest alternatives."),
    ("Facility Admin", "see load, referral completion rate, stock and quality metrics across sub-centres", "I can "
     "manage the facility proactively", "Facility dashboard aggregates these four metric groups with drill-down."),
])

add_section_heading(doc, "6.4 Doctor / Health Worker Registration & Verification", level=2)
for t in [
    "Basic details: name, mobile number, email.",
    "Role selection: Doctor / Specialist / Community Health Officer / Facility Admin — each role maps to a "
    "different permission set.",
    "Facility affiliation is selected (searched), never free-typed, from a verified government facility "
    "registry (sub-centre, PHC, rural hospital, district hospital) so affiliation cannot be faked.",
    "Specialty selection via dropdown (General Medicine, Gynaecology, Paediatrics, Cardiology, etc.) — required "
    "for specialists, optional/N-A for general health workers.",
    "Credential upload: medical registration number (NMC / State Medical Council ID) plus a photo of the "
    "certificate or ID card.",
    "Account remains in Pending Verification status — no consultations can be taken — until a facility admin "
    "or district authority approves it.",
    "Admin verification dashboard: a dedicated screen where facility admins review pending signups, inspect "
    "uploaded proof, and approve or reject with a reason.",
    "Once verified, doctor login lands on a dashboard already scoped to their facility and specialty (e.g., a "
    "gynaecologist at District Hospital X sees only relevant referrals/patients for that facility and specialty).",
]:
    bullet(doc, t)

add_section_heading(doc, "6.5 Cross-cutting Features (present on every relevant screen)", level=2)
for t in [
    "Offline-first design: core actions — viewing records, filling the triage form, viewing a booked queue "
    "position — work without live internet and sync automatically when connectivity returns.",
    "Emergency SOS: one-tap escalation available from anywhere in the patient app; bypasses the normal queue "
    "and routes to the nearest emergency-capable facility/contact.",
    "Multilingual toggle available on every screen, with voice input as an alternative to typing for "
    "low-literacy users.",
    "Interoperability: patient identity and records are structured to map onto ABHA / ABDM identifiers and "
    "FHIR resources so the platform strengthens, rather than fragments, the national digital health ecosystem.",
]:
    bullet(doc, t)

doc.add_page_break()

# ---------------- 7. Non-Functional Requirements ----------------
add_section_heading(doc, "7. Non-Functional Requirements")
nfrs = [
    ("Offline resilience", "Triage, record viewing, and queue status must be usable with zero connectivity and "
     "sync in the background without data loss or duplicate entries."),
    ("Low-bandwidth performance", "Full app must be usable on 2G/3G; video must auto-degrade to audio, then to "
     "async callback, before failing."),
    ("Accessibility & literacy", "Icon-first navigation, large tap targets, voice input/output, and content "
     "written at a low reading-literacy level in every supported language."),
    ("Multilingual coverage", "Minimum: Hindi, English, and the primary regional language(s) of the pilot state, "
     "architected for straightforward addition of further languages."),
    ("Privacy & consent", "Consent is explained in plain language at the moment data is shared, not buried in a "
     "one-time terms screen; every record share/QR view is logged."),
    ("Security", "Role-based access control; doctor accounts unusable until credential-verified; patient data "
     "encrypted at rest and in transit; facility affiliation validated against a government registry."),
    ("Interoperability", "Health records structured against FHIR resources and ABDM/ABHA identifiers where the "
     "patient has one, without requiring ABHA as a hard prerequisite for basic use."),
    ("Reliability", "Emergency SOS and queue-status features must degrade gracefully, never fail silently."),
    ("Scalability", "Facility dashboards must remain performant as sub-centres, PHCs and district hospitals are "
     "onboarded incrementally across a district/state rollout."),
]
styled_table(doc, ["Requirement", "Definition"], nfrs, col_widths=[1.7, 4.6])

# ---------------- 8. Assumptions & Constraints ----------------
add_section_heading(doc, "8. Assumptions & Constraints")
for t in [
    "Government facility registry and NMC/State Medical Council credential data are available via API or a "
    "seedable dataset for the pilot; where unavailable, a curated pilot-district dataset is used.",
    "Not all patients own a smartphone — SMS/voice-call channels are treated as first-class, not fallback-only.",
    "ABDM/ABHA integration is additive: the platform must be fully usable for a patient with no ABHA ID.",
    "Video teleconsultation depends on a third-party WebRTC-capable SDK; audio/callback must not depend on it.",
]:
    bullet(doc, t)

# ---------------- 9. Risks & Mitigations ----------------
add_section_heading(doc, "9. Risks & Mitigations")
risks = [
    ("Low awareness / adoption (as seen with ABDM)", "Onboarding awareness built into ASHA/CHO workflows, SMS "
     "campaigns, and in-facility signage QR — awareness is a designed feature, not an afterthought."),
    ("Fake or unverifiable doctor accounts", "Facility affiliation locked to a verified registry; credential "
     "upload plus mandatory human admin approval before any consultation access."),
    ("Connectivity dropouts breaking consultations", "Offline-first core + auto-degrade video→audio→callback "
     "protects the consultation from total failure."),
    ("Privacy misunderstanding among first-time users", "Plain-language, multilingual, voice-narrated consent at "
     "point of use rather than a legal document at signup."),
    ("Paper-based facility resistance", "Structured entry is designed to be faster than paper for the doctor "
     "(pre-filled specialty/facility, dropdowns over free text), reducing the incentive to bypass it."),
]
styled_table(doc, ["Risk", "Mitigation"], risks, col_widths=[2.4, 3.9])

# ---------------- 10. Appendix ----------------
add_section_heading(doc, "10. Appendix")
body(doc, "Related documents: Architecture Specification, Design System & UX Specification, Phased "
          "Implementation Roadmap, and the project .cursorrules engineering-standards file — all part of the "
          "same documentation set and intended to be handed to a development team or an AI build tool "
          "(e.g., Cursor, Bolt) together.")

doc.save(OUT)
print("Saved:", OUT)
