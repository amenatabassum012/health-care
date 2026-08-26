# -*- coding: utf-8 -*-
"""Shared styling helpers for the project documentation set."""
from docx import Document
from docx.shared import Pt, Inches, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.enum.style import WD_STYLE_TYPE

# ---- Brand palette (calm, trustworthy healthcare theme) ----
TEAL_DARK = RGBColor(0x0B, 0x4F, 0x4A)     # primary deep teal
TEAL = RGBColor(0x0F, 0x76, 0x6E)          # primary teal
TEAL_MID = RGBColor(0x14, 0x9A, 0x8C)      # accent teal
MINT = RGBColor(0xE6, 0xF6, 0xF3)          # light tint background
BLUE = RGBColor(0x1D, 0x4E, 0x89)          # secondary blue
AMBER = RGBColor(0xE0, 0x8E, 0x1D)         # warning / highlight
CORAL = RGBColor(0xD9, 0x4F, 0x4F)         # emergency / critical
INK = RGBColor(0x1F, 0x29, 0x37)           # body text near-black
GREY = RGBColor(0x6B, 0x72, 0x80)          # muted text
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_GREY_BG = "F2F5F4"
MINT_HEX = "E6F6F3"
TEAL_HEX = "0F766E"
TEAL_DARK_HEX = "0B4F4A"
BLUE_HEX = "1D4E89"

FONT_HEAD = "Calibri"
FONT_BODY = "Calibri"


def set_cell_shading(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)


def set_row_height(row, pts):
    trPr = row._tr.get_or_add_trPr()
    trHeight = OxmlElement('w:trHeight')
    trHeight.set(qn('w:val'), str(int(pts * 20)))
    trHeight.set(qn('w:hRule'), 'atLeast')
    trPr.append(trHeight)


def add_bottom_border(paragraph, color="0F766E", sz=18):
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), str(sz))
    bottom.set(qn('w:space'), '4')
    bottom.set(qn('w:color'), color)
    pBdr.append(bottom)
    pPr.append(pBdr)


def shade_paragraph(paragraph, hex_color):
    pPr = paragraph._p.get_or_add_pPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    pPr.append(shd)


def set_doc_defaults(doc):
    style = doc.styles['Normal']
    style.font.name = FONT_BODY
    style.font.size = Pt(10.5)
    style.font.color.rgb = INK
    style.paragraph_format.space_after = Pt(6)
    style.paragraph_format.line_spacing = 1.15
    rPr = style.element.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = OxmlElement('w:rFonts')
        rPr.append(rFonts)
    rFonts.set(qn('w:eastAsia'), FONT_BODY)

    for i, (size, color, bold, before, after) in enumerate([
        (24, TEAL_DARK, True, 0, 8),   # Heading 1
        (16, TEAL, True, 18, 6),       # Heading 2
        (13, BLUE, True, 12, 4),       # Heading 3
        (11.5, INK, True, 8, 2),       # Heading 4
    ], start=1):
        try:
            h = doc.styles[f'Heading {i}']
        except KeyError:
            continue
        h.font.name = FONT_HEAD
        h.font.size = Pt(size)
        h.font.color.rgb = color
        h.font.bold = bold
        h.paragraph_format.space_before = Pt(before)
        h.paragraph_format.space_after = Pt(after)
        h.paragraph_format.keep_with_next = True

    # section margins
    for section in doc.sections:
        section.top_margin = Cm(2.0)
        section.bottom_margin = Cm(2.0)
        section.left_margin = Cm(2.2)
        section.right_margin = Cm(2.2)


def add_title_page(doc, kicker, title, subtitle, meta_lines, accent_hex=TEAL_HEX):
    # top accent bar
    bar_table = doc.add_table(rows=1, cols=1)
    bar_table.autofit = False
    cell = bar_table.rows[0].cells[0]
    set_cell_shading(cell, accent_hex)
    cell.width = Inches(6.3)
    set_row_height(bar_table.rows[0], 6)
    cell.paragraphs[0].text = ""

    doc.add_paragraph()
    doc.add_paragraph()

    k = doc.add_paragraph()
    k.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = k.add_run(kicker.upper())
    run.font.size = Pt(12)
    run.font.color.rgb = TEAL_MID
    run.font.bold = True
    run.font.name = FONT_HEAD
    add_letter_spacing(run, 30)

    t = doc.add_paragraph()
    t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = t.add_run(title)
    run.font.size = Pt(34)
    run.font.bold = True
    run.font.color.rgb = TEAL_DARK
    run.font.name = FONT_HEAD

    s = doc.add_paragraph()
    s.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = s.add_run(subtitle)
    run.font.size = Pt(14)
    run.font.color.rgb = GREY
    run.font.italic = False
    run.font.name = FONT_BODY

    doc.add_paragraph()
    doc.add_paragraph()

    for line in meta_lines:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(line)
        run.font.size = Pt(10.5)
        run.font.color.rgb = GREY
        run.font.name = FONT_BODY

    doc.add_paragraph()
    bar_table2 = doc.add_table(rows=1, cols=1)
    bar_table2.autofit = False
    cell2 = bar_table2.rows[0].cells[0]
    set_cell_shading(cell2, accent_hex)
    cell2.width = Inches(6.3)
    set_row_height(bar_table2.rows[0], 6)
    cell2.paragraphs[0].text = ""

    doc.add_page_break()


def add_letter_spacing(run, val_20ths_pt):
    rPr = run._element.get_or_add_rPr()
    spacing = OxmlElement('w:spacing')
    spacing.set(qn('w:val'), str(val_20ths_pt))
    rPr.append(spacing)


def add_section_heading(doc, text, level=1, color_hex=None):
    h = doc.add_heading(text, level=level)
    if level == 1:
        add_bottom_border(h, color=color_hex or TEAL_HEX, sz=14)
    return h


def add_callout(doc, label, text, hex_bg=MINT_HEX, hex_bar=TEAL_HEX, label_color=TEAL_DARK):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.rows[0].cells[0]
    set_cell_shading(cell, hex_bg)
    cell.paragraphs[0].paragraph_format.space_after = Pt(2)
    p0 = cell.paragraphs[0]
    r0 = p0.add_run(label)
    r0.bold = True
    r0.font.color.rgb = label_color
    r0.font.size = Pt(10)
    p1 = cell.add_paragraph()
    r1 = p1.add_run(text)
    r1.font.size = Pt(10)
    r1.font.color.rgb = INK
    # padding via margins
    tcPr = cell._tc.get_or_add_tcPr()
    for tag, val in [('w:top', '120'), ('w:bottom', '120'), ('w:left', '160'), ('w:right', '160')]:
        pass
    doc.add_paragraph()
    return table


def styled_table(doc, headers, rows, col_widths=None, header_bg=TEAL_HEX, header_color=WHITE,
                  zebra=MINT_HEX, font_size=9.5):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    for i, htext in enumerate(headers):
        hdr_cells[i].text = ""
        p = hdr_cells[i].paragraphs[0]
        run = p.add_run(htext)
        run.bold = True
        run.font.color.rgb = header_color
        run.font.size = Pt(font_size)
        run.font.name = FONT_HEAD
        set_cell_shading(hdr_cells[i], header_bg)
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        hdr_cells[i].vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    for ridx, row in enumerate(rows):
        cells = table.add_row().cells
        for cidx, val in enumerate(row):
            cells[cidx].text = ""
            p = cells[cidx].paragraphs[0]
            run = p.add_run(str(val))
            run.font.size = Pt(font_size)
            run.font.color.rgb = INK
            cells[cidx].vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            if ridx % 2 == 1:
                set_cell_shading(cells[cidx], zebra)
    if col_widths:
        for row in table.rows:
            for i, w in enumerate(col_widths):
                row.cells[i].width = Inches(w)
    doc.add_paragraph()
    return table


def bullet(doc, text, level=0, bold_lead=None, style='List Bullet'):
    p = doc.add_paragraph(style=style if level == 0 else f'{style} 2')
    if bold_lead:
        r = p.add_run(bold_lead)
        r.bold = True
        r.font.color.rgb = TEAL_DARK
        p.add_run(text)
    else:
        p.add_run(text)
    return p


def numbered(doc, text, bold_lead=None):
    p = doc.add_paragraph(style='List Number')
    if bold_lead:
        r = p.add_run(bold_lead)
        r.bold = True
        r.font.color.rgb = TEAL_DARK
        p.add_run(text)
    else:
        p.add_run(text)
    return p


def body(doc, text, bold=False, italic=False, color=None, size=10.5, align=None):
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.bold = bold
    r.italic = italic
    r.font.size = Pt(size)
    r.font.color.rgb = color or INK
    if align:
        p.alignment = align
    return p


def add_footer_page_numbers(doc, brand_text="SwasthyaSetu AI — Confidential Draft"):
    section = doc.sections[0]
    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(brand_text + "  |  Page ")
    run.font.size = Pt(8)
    run.font.color.rgb = GREY

    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = "PAGE"
    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'end')
    run2 = p.add_run()
    run2._r.append(fldChar1)
    run2._r.append(instrText)
    run2._r.append(fldChar2)
    run2.font.size = Pt(8)
    run2.font.color.rgb = GREY


def new_doc():
    doc = Document()
    set_doc_defaults(doc)
    add_footer_page_numbers(doc)
    return doc
