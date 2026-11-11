"""Map the extracted book rows onto the app's Agpeya items.

Psalms: found by their heading ("Psalm N" / "Psalm N (M)"), first occurrence;
the Arabic is every row up to the next heading that carries Arabic. Psalm 118
is taken from the Midnight Prayer and split into its 22 numbered sections.

Prayers: the book's English for the litanies, gospels and fixed prayers is the
same translation as the app's, so each prayer is found by matching the app's
English against the rows' English, and its Arabic is the Arabic of the rows
that matched. A prayer with several parts is split at the row boundaries that
best line up with the app's part boundaries.

Writes agpeyaPsalms.ar.json, agpeyaPrayers.ar.json and report.json.
"""
import json, re, difflib, sys

import os
APP = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib', 'psalms') + os.sep
rows_all = json.load(open('rows.json'))
app_psalms = json.load(open(APP + 'agpeyaPsalms.json'))
app_prayers = json.load(open(APP + 'agpeyaPrayers.json'))

BOOK_FIRST_PAGE = 10   # page 9 and before are front matter


def words(s):
    return re.findall(r"[a-z]+", s.lower().replace('’', "'"))


def fix_allah(m):
    marks = m.group(1)
    case = '\u0650' if '\u0650' in marks else '\u064e'
    return '\u0627\u0644\u0644\u0651\u064e\u0647' + case


def clean_ar(s):
    s = re.sub(r'\)(\d+)\(', r'(\1)', s)          # "(1)" read as ")1("
    # The font's "lillah" ligature maps to lam-lam without the final ha when
    # it is vowelled: «اللَّهَ» comes out as «اللَََّّ». Restore the word.
    s = re.sub(r'\u0627\u0644\u0644([\u064B-\u0652]{2,})(?=[\s.،؛:!؟]|$)', fix_allah, s)
    # One combined glyph decodes as kasratan + shadda where only the kasratan
    # is drawn (checked against the page). «ربٍّ» genuinely carries a shadda.
    s = re.sub(r'(?<!\u0631\u0628)\u064d\u0651|(?<!\u0631\u0628)\u0651\u064d', '\u064d', s)
    s = re.sub(r'\s+', ' ', s).strip()
    # A letter can receive the same mark twice (from a combined glyph and from
    # a stand-alone one); keep one.
    s = re.sub(r'([\u064B-\u0652])([\u064B-\u0652]*?)\1', r'\1\2', s)
    # The tanween ending «اً» is drawn as its own glyph after a gap and reads
    # as a separate word («بار اً»); it belongs to the word before it.
    s = re.sub(r'([\u0621-\u064A][\u064B-\u0652]*) (\u0627\u064b)', r'\1\2', s)
    s = s.replace('أجْ لِ', 'أجْلِ')
    s = re.sub(r'\s+([.،؛:؟!])', r'\1', s)
    return s


els = [r for r in rows_all if r['page'] >= BOOK_FIRST_PAGE]
for i, r in enumerate(els):
    r['i'] = i


def is_section_heading(r):
    return r['kind'] == 'heading' and bool(r['ar'].strip())


# ─── Psalms ──────────────────────────────────────────────────────────────────
def psalm_heading_index(n, start=0, page_min=0):
    pat = re.compile(r'^Psalm\s+%d\b(?!\s*\(\d+\)\s*:)' % n)
    for r in els[start:]:
        if r['kind'] == 'heading' and r['page'] >= page_min and pat.match(r['en'].strip()):
            return r['i']
    return None


def rows_until_next_section(h):
    out = []
    for r in els[h + 1:]:
        if is_section_heading(r) or (r['kind'] == 'heading' and r['en'].strip().startswith('Psalm')):
            break
        if r['kind'] == 'row':
            out.append(r)
    return out


report = {'psalms': {}, 'prayers': {}}
ar_psalms = {}
for key, entry in app_psalms['psalms'].items():
    n = int(key)
    if n == 118:
        continue
    h = psalm_heading_index(n)
    if h is None:
        report['psalms'][key] = {'error': 'heading not found'}
        continue
    rs = rows_until_next_section(h)
    ar = clean_ar(' '.join(r['ar'] for r in rs if r['ar']))
    en = ' '.join(r['en'] for r in rs if r['en'])
    sm = difflib.SequenceMatcher(None, words(entry['parts'][0]), words(en), autojunk=False)
    ar_psalms[key] = {'parts': [ar]}
    report['psalms'][key] = {'page': els[h]['page'], 'rows': len(rs), 'en_similarity': round(sm.ratio(), 3),
                             'ar_words': len(ar.split()), 'en_words_app': len(words(entry['parts'][0]))}

# Psalm 118: the full psalm in the Midnight Prayer (not the Veil's excerpt).
mid = next(r['i'] for r in els if r['kind'] == 'heading' and r['en'].startswith('The Midnight Prayer'))
h118 = psalm_heading_index(118, start=mid)
sections, cur = [], None
for r in els[h118 + 1:]:
    if is_section_heading(r):
        break
    if r['kind'] != 'row':
        continue
    m = re.match(r'^\((\d+)\)\s*', r['en'])
    if m:
        if cur:
            sections.append(cur)
        cur = {'num': int(m.group(1)), 'rows': []}
    if cur is not None:
        cur['rows'].append(r)
if cur:
    sections.append(cur)
parts118 = []
for s in sections:
    ar = clean_ar(' '.join(r['ar'] for r in s['rows'] if r['ar']))
    ar = re.sub(r'^\(\d+\)\s*', '', ar)
    parts118.append(ar)
ar_psalms['118'] = {'parts': parts118}
report['psalms']['118'] = {'page': els[h118]['page'], 'sections': [s['num'] for s in sections],
                           'section_words': [len(p.split()) for p in parts118]}

# ─── Prayers ─────────────────────────────────────────────────────────────────
rows = [r for r in els if r['kind'] == 'row']
row_words = [words(r['en']) for r in rows]


def best_span(target):
    """Find the run of rows whose English best matches `target` (word list)."""
    k = min(10, len(target))
    head = target[:k]
    cands = []
    for i in range(len(rows)):
        acc = []
        j = i
        while len(acc) < k and j < len(rows):
            acc += row_words[j]
            j += 1
        if not row_words[i]:
            continue
        r = difflib.SequenceMatcher(None, head, acc[:k], autojunk=False).ratio()
        if r >= 0.7:
            cands.append((r, i))
    best = None
    for r0, i in sorted(cands, key=lambda c: (-c[0], c[1]))[:12]:
        acc, best_here = [], None
        for j in range(i, min(len(rows), i + 80)):
            acc = acc + row_words[j]
            if len(acc) > len(target) * 1.35 + 10:
                break
            ratio = difflib.SequenceMatcher(None, target, acc, autojunk=False).ratio()
            if best_here is None or ratio > best_here[0] + 1e-9:
                best_here = (ratio, i, j)
        if best_here and (best is None or best_here[0] > best[0] + 1e-9
                          or (abs(best_here[0] - best[0]) < 1e-9 and best_here[1] < best[1])):
            best = best_here
    return best


def split_parts(parts, i, j):
    """Assign rows i..j to the app's parts, cutting at row boundaries."""
    span = rows[i:j + 1]
    if len(parts) == 1:
        return [span]
    target, bounds = [], []
    for p in parts:
        target += words(p)
        bounds.append(len(target))
    span_words, row_end = [], []
    for r in span:
        span_words += words(r['en'])
        row_end.append(len(span_words))
    sm = difflib.SequenceMatcher(None, target, span_words, autojunk=False)
    # map a target index to a span-word index
    blocks = sm.get_matching_blocks()

    def to_span(t):
        best = None
        for a, b, size in blocks:
            if size == 0:
                continue
            if a <= t <= a + size:
                return b + (t - a)
            d = min(abs(t - a), abs(t - a - size))
            pos = b if t < a else b + size
            if best is None or d < best[0]:
                best = (d, pos)
        return best[1] if best else 0

    cuts = []
    for bnd in bounds[:-1]:
        s = to_span(bnd)
        k = min(range(len(row_end)), key=lambda x: abs(row_end[x] - s))
        cuts.append(k)
    out, start = [], 0
    for c in cuts:
        c = max(c, start - 1)
        out.append(span[start:c + 1])
        start = c + 1
    out.append(span[start:])
    return out


ar_prayers = {}
ORPHANS = {}
for pid, pr in app_prayers['prayers'].items():
    target = []
    for p in pr['parts']:
        target += words(p)
    found = best_span(target)
    if not found:
        report['prayers'][pid] = {'error': 'no match'}
        continue
    ratio, i, j = found
    groups = split_parts(pr['parts'], i, j)
    REF = re.compile(r'^[\u0600-\u06FF ]+\d+\s*:\s*\d+(\s*-\s*\d+)?\.?$')
    groups = [[r for r in g if not (r['ar'] and not r['en'].strip() and REF.match(r['ar'].strip()))] for g in groups]
    ar_parts = [clean_ar(' '.join(r['ar'] for r in g if r['ar'])) for g in groups]
    # Where one book row carries several of the app's short paragraphs, the
    # Arabic for them is in the neighbouring part; an empty part is dropped.
    ar_parts = [a for a in ar_parts if a]
    ORPHANS[pid] = [(r['page'], r['ar']) for g in groups for r in g if r['ar'] and not r['en'].strip()]
    part_ratios = []
    for p, g in zip(pr['parts'], groups):
        part_ratios.append(round(difflib.SequenceMatcher(None, words(p), words(' '.join(r['en'] for r in g)), autojunk=False).ratio(), 3))
    ar_prayers[pid] = {'parts': ar_parts}
    report['prayers'][pid] = {'title': pr['title'], 'page': rows[i]['page'], 'rows': j - i + 1,
                              'en_similarity': round(ratio, 3), 'part_similarity': part_ratios,
                              'empty_parts': sum(1 for a in ar_parts if not a)}

json.dump({'psalms': ar_psalms}, open('agpeyaPsalms.ar.json', 'w'), ensure_ascii=False, indent=1)
json.dump({'prayers': ar_prayers}, open('agpeyaPrayers.ar.json', 'w'), ensure_ascii=False, indent=1)
json.dump(report, open('report.json', 'w'), ensure_ascii=False, indent=1)
json.dump(ORPHANS, open('orphans.json', 'w'), ensure_ascii=False, indent=1)
print('psalms', len(ar_psalms), 'prayers', len(ar_prayers))
