# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from docx_style import *

OUT = r"C:\Users\Lenovo Thinkpad\Desktop\SIH\docs\03_Design_Specification.docx"

doc = new_doc()

add_title_page(
    doc,
    kicker="Design & UX Specification",
    title="SwasthyaSetu AI",
    subtitle="Visual identity, screen-by-screen UX, and component system",
    meta_lines=[
        "Version 1.0  •  Draft for Development Handoff",
        "Companion to: PRD, Architecture Specification, Phased Roadmap",
        "Author: Bilal  •  bilal@mail.fasttrackexp.com",
        "Date: 24 August 2026",
    ],
    accent_hex=TEAL_HEX,
)

# ---------------- 1. Design Philosophy ----------------
add_section_heading(doc, "1. Design Philosophy")
for lead, text in [
    ("Trust before delight. ", "This is a health product for first-time digital users in a moment of stress — "
     "visual calm, clarity and credibility come before cleverness. Every screen should look like it belongs to "
     "a serious public-health institution, not a consumer app."),
    ("Icon before text. ", "Every primary action is icon + short label, never icon-only and never text-only, so "
     "meaning survives both low literacy and unfamiliar language."),
    ("One primary action per screen. ", "Rural, low-digital-literacy users get lost in choice. Each screen has "
     "one obvious next step, visually dominant over secondary options."),
    ("Big, forgiving touch targets. ", "Minimum 48x48dp targets, generous spacing, large type — designed for "
     "older users, shared/older devices, and outdoor sunlight glare."),
    ("Colour carries meaning, consistently. ", "Urgency and status are colour-coded the same way everywhere "
     "(see 2.2) so a patient learns the system once and reuses that knowledge across every screen."),
    ("Attractive is not decorative. ", "Visual polish (gradients, soft shadows, rounded cards, warm imagery) is "
     "used to build institutional trust and reduce anxiety — never at the cost of contrast, legibility or load "
     "time on a 2G connection."),
]:
    bullet(doc, text, bold_lead=lead)

# ---------------- 2. Visual Identity ----------------
add_section_heading(doc, "2. Visual Identity")
add_section_heading(doc, "2.1 Colour System", level=2)
body(doc, "A calm clinical-teal system with a warm secondary blue, plus a strict, consistent semantic palette "
          "for status/urgency so colour never has to be re-learned per screen.")

color_rows = [
    ["Primary — Teal Dark", "#0B4F4A", "Headers, primary buttons (pressed), patient-app brand bar"],
    ["Primary — Teal", "#0F766E", "Primary buttons, active nav, links, doctor-app brand bar"],
    ["Primary — Teal Mid", "#149A8C", "Hover states, secondary accents, chart highlights"],
    ["Tint — Mint", "#E6F6F3", "Card backgrounds, selected states, callout backgrounds"],
    ["Secondary — Blue", "#1D4E89", "Doctor/admin surfaces, informational accents, architecture-facing UI"],
    ["Semantic — Success Green", "#1E8E5A", "Confirmed referral, completed visit, verified account"],
    ["Semantic — Amber", "#E08E1D", "Pending status, awaiting verification, medium urgency"],
    ["Semantic — Coral/Red", "#D94F4F", "High urgency, emergency SOS, rejected/expired"],
    ["Neutral — Ink", "#1F2937", "Primary body text"],
    ["Neutral — Grey", "#6B7280", "Secondary text, captions, placeholders"],
    ["Surface — White/Off-white", "#FFFFFF / #F7F9F8", "Base backgrounds"],
]
styled_table(doc, ["Token", "Hex", "Usage"], color_rows, col_widths=[1.9, 1.1, 3.4])

add_section_heading(doc, "2.2 Semantic Status Colours (used identically everywhere)", level=2)
status_rows = [
    ["Emergency / Critical", "Coral #D94F4F", "SOS button, emergency triage outcome, critical referral flag"],
    ["Pending / Awaiting", "Amber #E08E1D", "Pending Verification, referral pending, queue waiting"],
    ["Confirmed / In progress", "Blue #1D4E89", "Referral confirmed, consultation in progress"],
    ["Completed / Success", "Green #1E8E5A", "Referral completed, account verified, task done"],
    ["Informational / Neutral", "Teal Mid #149A8C", "General self-care advice, informational banners"],
]
styled_table(doc, ["Meaning", "Colour", "Where used"], status_rows, col_widths=[1.7, 1.6, 3.1])

add_section_heading(doc, "2.3 Typography", level=2)
for t in [
    "Primary typeface: Inter or Noto Sans (Noto Sans is essential for full glyph coverage across Devanagari and "
    "other regional scripts used in the multilingual UI).",
    "Base body size 16px minimum on mobile (never smaller — this is a low-literacy, often older-age user base).",
    "Headings: bold, high-contrast, generous line height; avoid all-caps for body copy (harder to read at speed).",
    "Numerals (queue position, wait time) rendered large and isolated — the single most time-critical piece of "
    "information on the patient home screen.",
]:
    bullet(doc, t)

add_section_heading(doc, "2.4 Iconography & Imagery", level=2)
for t in [
    "Rounded, filled icon style (not thin-line) for better visibility on low-quality/low-brightness screens.",
    "A consistent icon set maps 1:1 to the six home-screen actions and is reused across triage, reminders and "
    "SMS-referenced visuals so recognition transfers across channels.",
    "Illustration style (empty states, onboarding): warm, human, culturally representative — never clinical "
    "stock photography that feels foreign to the user's own context.",
]:
    bullet(doc, t)

add_section_heading(doc, "2.5 Elevation, Shape & Motion", level=2)
for t in [
    "Cards: 16px corner radius, soft single-direction shadow — approachable, not sharp/institutional-cold.",
    "Primary buttons: full-width on mobile, 12px radius, filled Teal with white text; secondary actions are "
    "outlined, never competing visually with the primary action.",
    "Motion is minimal and purposeful: a queue-position counter animates on change; page transitions are fast "
    "fades, never anything that costs bandwidth or battery.",
]:
    bullet(doc, t)

doc.add_page_break()

# ---------------- 3. Screen-by-Screen UX ----------------
add_section_heading(doc, "3. Screen-by-Screen UX Specification")

def screen(title, purpose, elements, notes=None):
    add_section_heading(doc, title, level=2)
    body(doc, purpose, italic=True, color=GREY)
    for e in elements:
        bullet(doc, e)
    if notes:
        add_callout(doc, "UX note  ", notes)

screen("3.1 Landing / Role Selection", "First screen on app open — the single most important fork in the entire product.",
    [
        "Two large, equal-weight cards: “Patient / Guardian” and “Doctor / Health Worker”, each with its own "
        "icon, colour accent and one-line description.",
        "Language selector accessible from this screen before any text-heavy content loads.",
        "No shared login form beneath the choice — selecting a card routes to a fully separate flow."
    ],
    "This screen must load and be usable even on the slowest connection tested — it is the first impression "
    "and the highest-traffic screen in the product.")

screen("3.2 Patient — Login / Signup", "Mobile-number + OTP entry, no email required.",
    [
        "Large numeric keypad-friendly phone input, country code pre-filled.",
        "OTP auto-read where the platform allows it, with a clear manual fallback.",
        "“Booking for someone else?” guardian toggle, so a literate family member can manage an elder or "
        "child's account without creating a confusing second identity.",
    ])

screen("3.3 Language Selection", "Sets the language for every following screen, SMS, and voice prompt.",
    [
        "Each language shown in its own script, not translated/transliterated (a Hindi speaker sees हिंदी, not "
        "'Hindi').",
        "Selection is changeable later from a persistent toggle, never locked in.",
    ])

screen("3.4 Patient Home", "The command centre — one screen, six clear actions.",
    [
        "Six primary cards: Book appointment, Start teleconsultation, My health records, Track referral, Check "
        "medicine availability — plus Emergency SOS visually distinct (coral, fixed position, always reachable).",
        "A persistent status strip at the top surfaces anything time-critical: an active queue position, a "
        "pending referral update, or a due follow-up.",
    ])

screen("3.5 Digital Triage", "Short, multilingual, icon-assisted questionnaire before any booking.",
    [
        "One question per screen, large icon options (e.g., body-area picker) rather than long text lists.",
        "Progress indicator so the low-literacy user always knows how much is left.",
        "Voice-input toggle available on every question.",
        "Result screen clearly states the recommended action with a colour-coded urgency badge (see 2.2) and a "
        "one-line plain-language reason — never a bare clinical term.",
    ],
    "This is the single highest-leverage screen for fixing eSanjeevani's wrong-OPD-recommendation problem — "
    "invest disproportionate design and testing time here.")

screen("3.6 Booking / Live Queue", "Facility or teleconsult slot selection with a live position counter.",
    [
        "Facility/slot list shows distance and next available time up front.",
        "Post-booking screen shows a large, animating queue-position number and estimated wait — the number a "
        "patient will check most often.",
        "Push + SMS nudge when the patient is close to being seen.",
    ])

screen("3.7 Teleconsultation", "Video-first with automatic, visible degrade on poor connection.",
    [
        "Connection-quality indicator always visible; automatic switch to audio-only is announced in-call, not "
        "silent.",
        "If audio also fails, one tap converts the session to a scheduled callback request without losing the "
        "triage/queue context already gathered.",
    ])

screen("3.8 My Health Records", "The patient's longitudinal record, portable across every facility tier.",
    [
        "Timeline view: visit, diagnosis, prescription, facility, per entry.",
        "A prominent “Show my QR” action for instant record access at any new facility desk, with a plain-"
        "language explanation of what is being shared each time it's used.",
    ])

screen("3.9 Referral Tracking", "Real-time status of any active referral.",
    [
        "Three-stage status bar: Pending → Confirmed → Completed, each stage timestamped.",
        "Receiving facility name and specialty shown clearly — visible proof the referral went to the right "
        "place, addressing the free-text mis-routing problem at the patient-trust level too.",
    ])

screen("3.10 Medicine / Diagnostic Availability", "Simple facility-level stock check.",
    [
        "Search or browse by common medicine/test name; result shows availability at the patient's usual "
        "facility and the nearest alternative if unavailable.",
    ])

screen("3.11 Emergency SOS", "One-tap, always-reachable escalation.",
    [
        "Fixed coral action, reachable via a persistent element from every patient screen (not buried in a "
        "menu).",
        "Confirms the nearest emergency-capable facility being contacted and shares live status, with an SMS "
        "fallback if the network can't sustain the in-app flow.",
    ])

doc.add_page_break()

screen("3.12 Doctor / Health Worker — Registration", "First-time, multi-step form gating all future access.",
    [
        "Step 1 — Basic details (name, mobile, email).",
        "Step 2 — Role selection (Doctor / Specialist / CHO / Facility Admin) as large descriptive cards, not a "
        "dropdown, since this decision drives everything downstream.",
        "Step 3 — Facility affiliation: type-ahead search against the verified government registry (never a "
        "free-text field).",
        "Step 4 — Specialty dropdown (required for specialists).",
        "Step 5 — Credential upload: NMC/State Medical Council ID number + certificate/ID photo capture, with "
        "an in-camera guide overlay for a clean scan.",
        "Confirmation screen clearly states the account is Pending Verification and cannot take consultations "
        "yet, with an amber status badge (see 2.2) carried through until approval.",
    ])

screen("3.13 Doctor — Login", "Separate, more secure entry point from the patient login.",
    [
        "Staff ID / registered mobile + OTP or password.",
        "Blocked with a clear explanatory state (not a generic error) if the account is still Pending "
        "Verification.",
    ])

screen("3.14 Doctor Dashboard", "Scoped to the doctor's own facility + specialty from the moment they log in.",
    [
        "Today's queue with urgency flags inherited from patient triage results.",
        "Referral inbox, structured the same way outbound referrals are created — specialty-tagged, not free "
        "text.",
        "Quick access to a patient's full longitudinal record from any queue entry.",
    ])

screen("3.15 Consultation Tools", "Structured clinical entry — the direct fix for free-text referral quality.",
    [
        "Diagnosis entry uses coded/structured fields with autocomplete, not an open text box.",
        "Prescription builder with common medicine autocomplete, tied to the facility's live availability data.",
        "Referral creation pulls specialty and urgency as required structured fields before it can be submitted.",
    ])

screen("3.16 Facility Dashboard (Admin)", "One screen for load, referrals, stock and quality.",
    [
        "Four summary tiles: Patient load, Referral completion rate, Medicine/diagnostic stock status, Quality "
        "metrics — each drills into detail.",
        "Doctor Verification queue is a clearly separated section: pending signups with uploaded proof, "
        "approve/reject actions with a required reason on rejection.",
    ])

# ---------------- 4. Component System ----------------
add_section_heading(doc, "4. Component System")
comp_rows = [
    ["Primary Button", "Full-width mobile, Teal fill, white text, 12px radius", "One per screen — the single "
     "next action."],
    ["Secondary Button", "Outlined Teal, transparent fill", "Alternate/back actions, never visually competing."],
    ["SOS Button", "Fixed, coral, persistent across patient screens", "Only element allowed to break normal "
     "layout flow, by design."],
    ["Status Badge", "Pill shape, semantic colour from 2.2, icon + label", "Verification state, referral state, "
     "triage urgency — used identically everywhere."],
    ["Action Card", "Icon + short label + optional subtext, 16px radius, soft shadow", "Home-screen actions, "
     "role-selection, registration role picker."],
    ["Queue Counter", "Oversized numeral, animated on change, wait-time subtext", "Live queue position — the "
     "most-glanced-at number in the app."],
    ["Timeline Item", "Left rail dot + colour, timestamp, facility/specialty tag", "Health record entries, "
     "referral status stages."],
    ["Multilingual Toggle", "Persistent, top-level, current language shown in its own script", "Present on every "
     "screen without exception."],
    ["Voice Input Control", "Mic icon adjacent to any text/questionnaire field", "Triage, search, structured "
     "entry fields."],
    ["Offline Banner", "Slim top banner, neutral tone, non-blocking", "Signals offline mode without alarming the "
     "user or blocking core actions."],
]
styled_table(doc, ["Component", "Spec", "Used for"], comp_rows, col_widths=[1.5, 2.6, 2.3], font_size=9)

# ---------------- 5. Accessibility ----------------
add_section_heading(doc, "5. Accessibility Guidelines")
for t in [
    "Contrast: minimum WCAG AA (4.5:1) for all body text; status colours re-tested against both light and "
    "outdoor-glare display conditions.",
    "Touch targets: 48x48dp minimum, 8dp minimum spacing between adjacent targets.",
    "Every icon-only affordance has a text label or an accessible name for screen readers — never icon-only in "
    "the DOM even when visually icon-first.",
    "Voice input/output available for all primary data-entry flows (triage, search), not just as a novelty.",
    "Content authored at a low reading-literacy level across every supported language, reviewed by a native "
    "speaker per language, not machine-translated only.",
]:
    bullet(doc, t)

# ---------------- 6. Responsive Approach ----------------
add_section_heading(doc, "6. Responsive & Device Approach")
for t in [
    "Mobile-first (360–414px baseline) — this is the primary device class for patients.",
    "Doctor/Admin surfaces optimise for tablet and desktop widths (facility devices), with the same component "
    "system and colour language so the product feels like one system across roles.",
    "All layouts tested at both 2G-simulated load and low-brightness/high-glare display conditions before being "
    "considered done.",
]:
    bullet(doc, t)

doc.save(OUT)
print("Saved:", OUT)
