# Arabic Agpeya text

`lib/psalms/agpeyaPsalms.ar.json` and `agpeyaPrayers.ar.json` hold the Arabic
text of every psalm and prayer the app offers for memorisation. It comes from
the Arabic column of:

> *Book of Agpeya* (Coptic · English · Arabic), compiled by Fr. Jacob B.
> Nadian, St. Bishoy Coptic Orthodox Church of Toronto, Stouffville, ON.
> PDF dated 2014-12-29.

Nothing in it is translated or written by us. The scripts here read the PDF and
put the book's Arabic beside the app's English items.

## Regenerate

Needs Python 3 with `pdfplumber`. Run from this folder:

```bash
AGPEYA_PDF=/path/to/agpia-coptic-english-arabic.pdf python3 extract.py 1 334
python3 match.py
```

That writes `agpeyaPsalms.ar.json`, `agpeyaPrayers.ar.json` and `report.json`
here. Copy the two JSON files' `psalms` / `prayers` objects into
`lib/psalms/`, keeping the `source` block, then run `npm test`.

## How it works

- `extract.py` reads each page's three columns (Coptic, English, Arabic) into
  table rows. The PDF stores Arabic in drawing order, left to right; each line
  is rebuilt right to left, and each vowel mark is attached to the letter drawn
  right after it. Some shaddas and tanween are drawn as glyphs the PDF records
  as a zero-width space; `zero_width_marks.json` lists all 73 in the book and
  which mark each is, as seen on the page.
- `match.py` finds psalms by their heading and prayers by matching the app's
  English to the book's English (the same translation for the prayers), takes
  the Arabic from the same rows, and splits Psalm 118 into its 22 numbered
  sections.

## What was checked

Every passage was compared word by word against the page images (2026-11-11).
All differences found were extraction errors and were fixed in the scripts,
except printing artefacts in the book itself. The test
`lib/psalms/agpeya-arabic.test.ts` checks coverage and Psalm 118's sections.
