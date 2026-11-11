"""Extract the Agpeya PDF (Coptic | English | Arabic table) into rows.

Output: rows.json, a list of elements in reading order across the whole book:
  {"page", "kind": "heading"|"row", "en", "ar", "cop"(len only), "top"}
A heading carries its English and Arabic heading text; a row carries the
English and Arabic cell text of one table row.

Arabic in this PDF is stored in visual order (characters left to right as
drawn). It is rebuilt by reading base letters right to left by position and
attaching each combining mark (harakat) to the base letter it sits on.
"""
import json, re, sys, unicodedata
import pdfplumber

import os
PDF = os.environ.get('AGPEYA_PDF', 'agpia-coptic-english-arabic.pdf')

COPTIC_FONT = 'CS Avva Shenouda'
AR_COL_MIN_X = 395.0   # Arabic body cells start right of this
EN_COL = (255.0, 400.0)


def _ar(o):
    return (0x0600 <= o <= 0x06FF or 0x0750 <= o <= 0x077F or 0xFB50 <= o <= 0xFDFF
            or 0xFE70 <= o <= 0xFEFF)


def is_ar_letter(text):
    return any(_ar(ord(ch)) for ch in text)


def is_mark(text):
    return bool(text) and all(unicodedata.category(ch) == 'Mn' for ch in text)


def rtl_line(chars):
    """Rebuild one visual line of Arabic into logical order."""
    bases = [c for c in chars if not is_mark(c['text'])]
    marks = [c for c in chars if is_mark(c['text'])]
    bases.sort(key=lambda c: -(c['x0'] + c['x1']) / 2)
    attach = {id(b): [] for b in bases}
    # Word draws a vowel mark immediately BEFORE the letter it sits on, so the
    # next letter in drawing order is its base. Geometry is only the fallback.
    base_ids = {id(b) for b in bases}
    leftover = []
    for m in marks:
        nxt = STREAM_NEXT.get(id(m))
        if nxt is not None and id(nxt) in base_ids and nxt['text'] != ' ' and abs(nxt['top'] - m['top']) < 6 \
                and nxt['x0'] - 1.5 <= m['x0'] <= nxt['x1'] + 1.5:
            attach[id(nxt)].append(m['text'])
        else:
            leftover.append(m)
    for m in leftover:
        mc = (m['x0'] + m['x1']) / 2
        best, bd = None, 1e9
        for b in bases:
            if b['text'] == ' ':
                continue
            if b['x0'] - 0.5 <= mc <= b['x1'] + 0.5:
                d = 0
            else:
                d = min(abs(mc - b['x0']), abs(mc - b['x1']))
            if d < bd:
                best, bd = b, d
        if best is not None:
            attach[id(best)].append(m['text'])
    out = []
    for b in bases:
        out.append(b['text'] + ''.join(attach[id(b)]))
    s = ''.join(out)
    # Runs of left-to-right characters (digits, Latin) were read backwards.
    s = re.sub(r'[0-9A-Za-z][0-9A-Za-z.:\-/]*[0-9A-Za-z]|[0-9A-Za-z]', lambda m: m.group(0)[::-1], s)
    # Mirrored brackets: drawn ')' at the right of an RTL run is a logical '('.
    s = unicodedata.normalize('NFKC', s) if any(0xFB50 <= ord(ch) <= 0xFEFF for ch in s) else s
    return unicodedata.normalize('NFC', s)


def group_lines(chars, tol=3.5):
    """Group chars into lines by vertical position. Marks may sit a few points
    above the line they belong to, so they join the nearest base line."""
    bases = sorted([c for c in chars if not is_mark(c['text'])], key=lambda c: c['top'])
    lines = []
    for c in bases:
        for ln in lines:
            if abs(ln['top'] - c['top']) <= tol:
                ln['chars'].append(c)
                break
        else:
            lines.append({'top': c['top'], 'chars': [c]})
    for m in [c for c in chars if is_mark(c['text'])]:
        if not lines:
            continue
        best = min(lines, key=lambda ln: abs(ln['top'] - m['top']) if any(
            b['x0'] - 1 <= (m['x0'] + m['x1']) / 2 <= b['x1'] + 1 for b in ln['chars']) else 1e6 + abs(ln['top'] - m['top']))
        best['chars'].append(m)
    for ln in lines:
        ln['bottom'] = max(c['bottom'] for c in ln['chars'] if not is_mark(c['text']))
        ln['x0'] = min(c['x0'] for c in ln['chars'])
        ln['x1'] = max(c['x1'] for c in ln['chars'])
    return sorted(lines, key=lambda ln: ln['top'])


def ltr_text(chars):
    cs = sorted(chars, key=lambda c: c['x0'])
    out, prev = [], None
    for c in cs:
        if prev is not None and c['x0'] - prev['x1'] > 1.2 and c['text'] != ' ' and out and out[-1] != ' ':
            out.append(' ')
        out.append(c['text'])
        prev = c
    return re.sub(r'\s+', ' ', ''.join(out)).strip()


STREAM_NEXT = {}


def inside_word(space, line_chars):
    """A space glyph is not a word break when it sits inside an Arabic letter
    (a vowel mark whose glyph decodes as a space, e.g. the shadda of «مزّق»)
    or where two Arabic letters touch (no visible gap)."""
    mid = (space['x0'] + space['x1']) / 2
    bases = [c for c in line_chars if not is_mark(c['text']) and is_ar_letter(c['text'])]
    # Letters in a word overlap their neighbour by a font-dependent amount
    # (about 0 in body text, about 3.5pt in the larger refrain font). Both
    # tests below allow for it, so a real space in the large font survives.
    xs = sorted(bases, key=lambda b: b['x0'])
    overlaps = sorted(a['x1'] - b['x0'] for a, b in zip(xs, xs[1:]) if b['x0'] > a['x0'])
    ov = max(0.0, overlaps[len(overlaps) // 2]) if overlaps else 0.0
    if any(b['x0'] + 0.3 + ov < mid < b['x1'] - 0.3 - ov for b in bases):
        return True
    left = [b for b in bases if b['x1'] <= mid + 0.6 + ov]
    right = [b for b in bases if b['x0'] >= mid - 0.6 - ov]
    if not left or not right:
        return False
    l = max(left, key=lambda b: b['x1'])
    r = min(right, key=lambda b: b['x0'])
    return r['x0'] - l['x1'] < 0.8 - ov


# Some shaddas and tanween are drawn as their own glyph that the PDF's text
# layer records as a zero-width SPACE. Each of the 73 in the book was looked
# at on the page (zwsheet-*.png); this file says which mark each one is.
ZW_MARKS = {(m['page'], m['x']): m['mark'] for m in json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'zero_width_marks.json')))}


def page_elements(page, pn):
    for c in page.chars:
        if c['text'] == ' ' and c['x1'] - c['x0'] < 0.2 and c['x0'] > 400:
            mark = ZW_MARKS.get((pn, round(c['x0'], 2)))
            if mark:
                c['text'] = mark
    # For each mark, the next non-mark character in drawing order.
    STREAM_NEXT.clear()
    pending = []
    for c in page.chars:
        if is_mark(c['text']):
            pending.append(c)
        else:
            for m in pending:
                STREAM_NEXT[id(m)] = c
            pending = []
    chars = [c for c in page.chars if c['text'].strip() or c['text'] == ' ']
    chars = [c for c in chars if c['top'] < page.height - 72]   # drop page number
    ar = [c for c in chars if is_ar_letter(c['text']) or (is_mark(c['text']))]
    lat = [c for c in chars if c not in ar]
    cop = [c for c in lat if COPTIC_FONT in c['fontname']]
    lat = [c for c in lat if COPTIC_FONT not in c['fontname']]

    # Arabic lines: include spaces / punctuation / digits that sit inside the
    # Arabic column on the same line.
    ar_lines = group_lines(ar)
    # Spaces, punctuation and digits inside the Arabic column belong to it;
    # Latin letters there are the tail of an English word that ran long.
    extra = [c for c in lat if c['x0'] >= AR_COL_MIN_X + 7 and not re.search(r'[A-Za-z]', c['text'])]
    lat = [c for c in lat if not (c['x0'] >= AR_COL_MIN_X + 7 and not re.search(r'[A-Za-z]', c['text']))]
    for c in extra:
        if c['text'] == ',':
            continue   # Arabic uses «،»; an ASCII comma here spilled from the English column
        best = min(ar_lines, key=lambda ln: abs(ln['top'] - c['top']), default=None)
        if best is None or abs(best['top'] - c['top']) > 4:
            continue
        if c['text'] == ' ' and inside_word(c, best['chars']):
            continue
        best['chars'].append(c)
    # Arabic headings are centred and start left of the Arabic column; their
    # spaces/punct were filed under Latin, so pull those in too.
    for ln in ar_lines:
        if ln['x0'] < AR_COL_MIN_X - 2:
            near = [c for c in lat if abs(c['top'] - ln['top']) <= 4 and ln['x0'] - 3 <= c['x0'] <= ln['x1'] + 3]
            ln['chars'].extend(near)
            for c in near:
                lat.remove(c)
            ln['heading'] = True
    lat_lines = group_lines(lat)

    els = []
    for ln in lat_lines:
        txt = ltr_text(ln['chars'])
        if not txt:
            continue
        bold = sum('Bold' in c['fontname'] for c in ln['chars']) > 0.6 * len(ln['chars'])
        centred = ln['x0'] < EN_COL[0] + 5 and ln['x1'] > EN_COL[1] - 60 or (ln['x0'] > 120 and ln['x1'] < 500 and bold and abs((ln['x0'] + ln['x1']) / 2 - 306) < 70)
        els.append({'col': 'enh' if (bold and centred) else 'en', 'top': ln['top'], 'bottom': ln['bottom'], 'text': txt})
    for ln in ar_lines:
        txt = re.sub(r'\s+', ' ', rtl_line(ln['chars'])).strip()
        if not txt:
            continue
        els.append({'col': 'arh' if ln.get('heading') else 'ar', 'top': ln['top'], 'bottom': ln['bottom'], 'text': txt})
    for ln in group_lines(cop):
        els.append({'col': 'cop', 'top': ln['top'], 'bottom': ln['bottom'], 'text': 'x'})
    els.sort(key=lambda e: (e['top'], {'enh': 0, 'arh': 1, 'cop': 2, 'en': 3, 'ar': 4}[e['col']]))

    # Bands: a table row starts where a line begins below everything above it.
    out, band = [], None
    for e in els:
        if e['col'] in ('enh', 'arh'):
            if band:
                out.append(band)
                band = None
            if out and out[-1]['kind'] == 'heading' and e['top'] - out[-1]['bottom'] < 30:
                h = out[-1]
            else:
                h = {'kind': 'heading', 'page': pn, 'top': e['top'], 'bottom': e['bottom'], 'en': '', 'ar': ''}
                out.append(h)
            key = 'en' if e['col'] == 'enh' else 'ar'
            h[key] = (h[key] + ' ' + e['text']).strip()
            h['bottom'] = max(h['bottom'], e['bottom'])
            continue
        if band is None or e['top'] > band['bottom'] + 6:
            if band:
                out.append(band)
            band = {'kind': 'row', 'page': pn, 'top': e['top'], 'bottom': e['bottom'], 'en': [], 'ar': [], 'cop': 0}
        band['bottom'] = max(band['bottom'], e['bottom'])
        if e['col'] == 'cop':
            band['cop'] += 1
        else:
            band[e['col']].append(e['text'])
    if band:
        out.append(band)
    for r in out:
        if r['kind'] == 'row':
            r['en'] = ' '.join(r['en'])
            r['ar'] = ' '.join(r['ar'])
    return out


def main():
    first = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    last = int(sys.argv[2]) if len(sys.argv) > 2 else None
    pdf = pdfplumber.open(PDF)
    last = last or len(pdf.pages)
    allrows = []
    for pn in range(first, last + 1):
        allrows.extend(page_elements(pdf.pages[pn - 1], pn))
    json.dump(allrows, open('rows.json', 'w'), ensure_ascii=False, indent=0)
    print(len(allrows), 'elements')


if __name__ == '__main__':
    main()
