# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from docx_style import *

OUT = r"C:\Users\Lenovo Thinkpad\Desktop\SIH\docs\05_Engineering_Standards_Cursorrules_Reference.docx"

doc = new_doc()

add_title_page(
    doc,
    kicker="Engineering Standards Reference",
    title="SwasthyaSetu AI",
    subtitle="AI-coding-tool rules (.cursorrules) — documented for the wider dev handoff",
    meta_lines=[
        "Version 1.0  •  Mirrors the functional .cursorrules file at the project root",
        "Companion to: PRD, Architecture Specification, Design Specification, Phased Roadmap",
        "Author: Bilal  •  bilal@mail.fasttrackexp.com",
        "Date: 24 August 2026",
    ],
    accent_hex=TEAL_HEX,
)

add_callout(doc, "How to use this document  ",
            "The authoritative, machine-read version of these rules is the plain-text .cursorrules file at "
            "the project root — Cursor, and most AI coding tools that support project-level rule files, pick "
            "it up automatically. This document is the same content formatted for human review and for "
            "pasting into tools (like Bolt) that accept a project brief instead of a rules file.")

add_section_heading(doc, "0. Build Sequencing — Frontend First")
body(doc, "We are building the frontend first, against a mocked API layer, before any real backend exists.")
for t in [
    "Every API call goes through a single typed client with a contract matching the Architecture "
    "Specification's service boundaries; mock implementations sit behind the same interface the real "
    "backend will later fulfil, so swapping it in never requires touching UI/component code.",
    "Mock data lives in a dedicated mocks module, shaped exactly like the real API responses — never "
    "hardcoded inline inside components.",
    "Do not build backend services (NestJS/PostgreSQL/etc.) unless explicitly asked — assume that comes later.",
]:
    bullet(doc, t)

add_section_heading(doc, "1. Technology Stack (do not deviate without being asked)")
for t in [
    "React 18 + TypeScript + Vite. Functional components + hooks only.",
    "Tailwind CSS + shadcn/ui (Radix primitives) for all UI — no other component library.",
    "TanStack Query for server-state; Dexie.js (IndexedDB) for the offline-first local cache; local React "
    "state/context only for UI state — no Redux.",
    "react-i18next for all user-facing copy — no hardcoded English strings in components.",
    "react-router for navigation.",
    "react-hook-form + zod for every form.",
]:
    bullet(doc, t)

add_section_heading(doc, "2. Two Apps, Two Identities — Never Blur Them")
for t in [
    "Patient/Guardian and Doctor/Health-Worker are separate flows with separate layouts, separate login "
    "screens, and separate route trees — never a shared login form with a role toggle.",
    "Route guards enforce role scope; a doctor route must never be reachable from a patient session or "
    "vice versa. A verified doctor's session is additionally scoped to their facility + specialty.",
]:
    bullet(doc, t)

add_section_heading(doc, "3. Design System Discipline")
body(doc, "Full specification lives in the Design Specification document. Summary rules for code:")
for t in [
    "Colour tokens are defined once in the Tailwind config — never inline hex values in components.",
    "One primary action per screen, visually dominant; secondary actions are outlined, never competing.",
    "Every icon-first action ships with a visible text label — never icon-only.",
    "Minimum 48x48px touch targets, minimum 16px mobile body text, Noto Sans (or equivalent) for full "
    "Devanagari/regional-script coverage.",
    "Status/urgency colour meaning is fixed project-wide and never redefined per screen.",
    "Reusable primitives (Button, Card, StatusBadge, ActionCard, QueueCounter, TimelineItem, "
    "OfflineBanner) are built before screen-specific layouts.",
]:
    bullet(doc, t)

color_rows = [
    ["Primary", "Teal Dark #0B4F4A / Teal #0F766E / Teal Mid #149A8C / Mint #E6F6F3"],
    ["Secondary", "Blue #1D4E89"],
    ["Semantic", "Success #1E8E5A · Pending #E08E1D · Emergency/Critical #D94F4F"],
    ["Neutral", "Ink #1F2937 · Grey #6B7280"],
]
styled_table(doc, ["Group", "Tokens"], color_rows, col_widths=[1.3, 5.2])

add_section_heading(doc, "4. Accessibility & Low-Literacy Requirements (Non-negotiable)")
for t in [
    "WCAG AA contrast minimum on every colour pairing introduced.",
    "Every questionnaire/search input gets a voice-input affordance slot, even before it's wired up.",
    "Never ship a screen that is text-only with no icon, or icon-only with no label.",
    "All user-facing copy is simple, short-sentence language, enforced via the translation catalogue.",
]:
    bullet(doc, t)

add_section_heading(doc, "5. Structured Data, Never Free Text")
body(doc, "This is the core fix over eSanjeevani's mis-routed-referral problem — do not regress it with a "
          "shortcut.")
for t in [
    "Diagnosis, referral specialty, facility affiliation, and doctor credentials are never free-text "
    "inputs — always dropdown/typeahead against a fixed or registry-backed dataset.",
    "Facility affiliation during doctor registration is a searchable select against a facility dataset, "
    "never a typed string.",
]:
    bullet(doc, t)

add_section_heading(doc, "6. Offline-First Patterns")
for t in [
    "Any screen flagged offline-capable in the PRD reads/writes through the local cache first, with sync "
    "as a background concern — never blocking the UI on a network round-trip.",
    "Offline state shows a non-blocking, neutral OfflineBanner — never a blocking error modal for a "
    "feature that is supposed to work offline.",
]:
    bullet(doc, t)

add_section_heading(doc, "7. Code Conventions")
for t in [
    "PascalCase.tsx for components, camelCase.ts for hooks/utils; one component per file.",
    "No comments explaining what code does — only genuinely non-obvious constraints get a comment.",
    "No new dependency without a clear justification tied to a PRD/Architecture requirement.",
    "Shared UI primitives stay free of screen-specific logic.",
]:
    bullet(doc, t)

add_section_heading(doc, "8. What NOT to Do")
for t in [
    "No payment, insurance, or billing UI — explicitly out of scope.",
    "No unified/shared patient+doctor login.",
    "No replacing structured fields with free text to move faster.",
    "No native iOS scaffolding in V1 — PWA/Android-first per the roadmap.",
    "No new brand colours outside the token set in Section 3.",
]:
    bullet(doc, t)

doc.save(OUT)
print("Saved:", OUT)
