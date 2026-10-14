# R Practice

A rebuild of [sql-practice.com](https://www.sql-practice.com/) for learning R instead of SQL.
Real R runs in the browser, against a hospital dataset, with 45 graded exercises.

## Running it

```bash
python r-practice/serve.py
```

Then open http://localhost:8787. The first load pulls the R runtime (about 30 MB)
from `webr.r-wasm.org`, so it needs a connection and takes a few seconds; after
that the browser caches it.

Opening `index.html` by double-clicking will not work. WebAssembly modules cannot
be loaded over `file://`, and webR also needs the two cross-origin isolation
headers that `serve.py` sends.

## How it maps onto the original

| sql-practice.com | here |
| --- | --- |
| SQL editor, Ctrl+Enter to run | R editor, Ctrl+Enter to run |
| sql.js running `hospital.db` | webR running real R 4.x |
| Schema browser for the database | Data frame browser for the loaded objects |
| Learning Resources tree (SQL clauses) | Learning Resources tree (R functions), with insertable examples |
| Question panel: prompt, Get Hint, View Solution | the same |
| Table Info / Hints / Expected Output accordions | Data Info / Hints / Expected Output |
| Alternate ways of writing the solution | the same, each labelled and loadable into the editor |
| Success banner and sound on a correct answer | the same, with a speaker toggle in the banner |
| Expected output table, 100 rows per page | the same, page size configurable |
| Easy / Medium / Hard question list with ticks | the same, plus a text filter |
| Answer checked on every run | the same |
| Progress in local storage | the same, with JSON export and import |
| Resizable panels, collapsible side menus | the same |

## The data

Four data frames are created in R from a fixed seed, so everyone gets identical
data without downloading a data file:

- `patients` — 400 rows: ids, names, gender, birth date, city, province, allergies, height, weight
- `admissions` — 700 rows: patient, admission and discharge dates, diagnosis, attending doctor
- `doctors` — 30 rows: names and specialty
- `province_names` — 13 rows: province code to full name

The generator lives in `js/data.js` as an R script. Change the seed or the row
counts there and every question re-grades against the new data automatically,
because expected answers are computed at runtime rather than stored.

## How grading works

The exercises are graded on the value your code returns, not on the code itself.
When you run:

1. Your code is evaluated and the value of the last expression is kept.
2. The reference solution is evaluated in the same session.
3. Both are normalised — factors to character, dates to `YYYY-MM-DD`, matrices
   and tables to data frames, a bare vector to a one-column frame — and compared
   column by column, with a tolerance of 1e-8 on numbers.

So base R, `subset()`, and a dplyr pipeline all pass if they produce the same
table. Questions that name a sort order are compared in order; the rest are
compared after sorting both sides, so row order does not matter.

Column names are compared whenever both sides have names the author chose. They
are not compared when the result is a bare vector or a single number, because
the normaliser has to invent a name for those; a question answered with a vector
where the reference returns a one-column data frame is therefore accepted. For
those results a mismatch is reported as a value rather than as a column, so a
wrong count reads "Expected '6' but your code returned '4'".

Mismatches report the first difference found: wrong column count, wrong column
names, wrong row count, or the specific row and value that differs.

## Alternate solutions

View Solution shows the reference solution plus every alternate way of writing
it, each with a label (`subset()`, `tapply()`, `dplyr`, `xtabs()` and so on), a
note on why you would reach for it, and a button that loads it into the editor.
There are 79 alternates across the 45 questions.

They are shown simplest first, with a small ramp marking each one Simplest,
More involved or Most involved. That order is **not** the order they are written
in. The reference solution has to be base R so grading needs no packages, and on
21 of the 45 questions that makes it the most involved way of all, while the
dplyr version is the simplest. So every entry carries an explicit `complexity`
rank and the panel sorts on it; the reference's own rank lives in
`RP_REF_COMPLEXITY` at the foot of the same file. Ranking by array position
would mislabel 30 of the 45 questions.

They live in `js/alternates.js`, keyed by question id, separate from the question
bank:

```js
e01: [
  { complexity: 2, label: 'subset()', code: 'subset(patients, gender == "M", ...)',
    note: 'why you would write it this way' },
  { complexity: 3, label: 'dplyr', needs: 'dplyr', code: 'patients |> filter(...)' }
]
```

An entry with `needs` is marked in the panel and only runs once those packages
are installed from Settings.

All 79 were run through the grader and all return the expected result: the 35
base R ones against a plain session, the 44 tidyverse ones after installing
dplyr and tidyr.

## Base R and dplyr

Base R is ready as soon as the page loads. All reference solutions are base R so
that nothing has to be downloaded for grading to work.

To answer in dplyr instead, open **Settings → Install dplyr + tidyr**. That pulls
roughly 15 MB from the webR package repository and lasts until you reload the
page. Any dplyr answer that returns the same table is accepted.

## Layout

```
index.html              markup for the three-pane workspace
css/app.css             tokens, light and dark themes, layout
js/data.js              R setup script, schema metadata, Learning Resources
js/exercises.js         the 45 questions: prompt, hints, reference solution
js/alternates.js        alternate solutions, keyed by question id
js/app.js               webR boot, run and grade, tables, panels, settings
serve.py                static server with the COOP/COEP headers webR needs
vendor/codemirror/      editor, vendored so the page needs no CDN at runtime
```

## Adding a question

Append to the array in `js/exercises.js`:

```js
{
  id: 'm16', d: 'medium', topic: 'Grouping', tables: ['patients'],
  prompt: 'Show ... as columns <code>a</code> and <code>b</code>.',
  hints: ['first nudge', 'second nudge'],
  ordered: true,              // omit when row order should not matter
  solution: 'base R code whose value is the expected answer'
}
```

The expected output table is produced by running `solution`, so there is nothing
else to keep in sync. Alternates for the new question go in `js/alternates.js`
under the same id.

## Verification record

`VERIFICATION.md` holds an end-to-end pass over all 45 questions: for each one,
the expected-output table rendered, the reference solution graded green, and a
deliberate near-miss graded red with the message it produced. It was produced by
a separate verification session before the alternates existed, and carries an
addendum covering what changed afterwards.

## Known limits

- The first load is slow, because R itself is being downloaded.
- Plots are not displayed. Exercises are about data manipulation, and a value
  comparison is what the grader is built on.
- Progress lives in this browser's local storage. Use Export to move it.
