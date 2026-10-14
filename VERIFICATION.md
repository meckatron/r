# R Practice: end-to-end grading verification (all 45 questions)

Run on 2026-10-14 against `r-practice/` served by `serve.py` on :8787, webR v0.4.2,
driven through the real UI (question modal row click -> CodeMirror setValue -> #runBtn
click -> read #verdict). Full suite re-run from a clean reload after the one fix below.

## Result: 45/45 pass both cases

For every question: the Expected Output accordion rendered a table (no errors), the
question's own `solution` graded green, and a deliberate near-miss graded red with a
message naming the real difference.

| id | expected | own solution | near-miss | message the near-miss produced |
|----|----------|--------------|-----------|--------------------------------|
| e01 | table, 208 rows | ok | bad | 2 column(s) but 3 were expected |
| e02 | table, 158 rows | ok | bad | 242 row(s) but 158 were expected |
| e03 | table, 20 rows | ok | bad | 15 row(s) but 20 were expected |
| e04 | table, 25 rows | ok | bad | 17 row(s) but 25 were expected |
| e05 | table, 400 rows | ok | bad | Column 'allergies' row 3: expected 'NKA', yours NA |
| e06 | table, 400 rows | ok | bad | Column 'full_name' row 1: 'Ada Diaz' vs 'Ada, Diaz' |
| e07 | table, 400 rows | ok | bad | column names: province_name vs province_id |
| e08 | table, 1 row | ok | bad | value row 1: '6' vs '4' |
| e09 | table, 1 row | ok | bad | first_name row 1: 'James' vs 'Simone' |
| e10 | table, 5 rows | ok | bad | 4 row(s) but 5 were expected |
| e11 | table, 1 row | ok | bad | value row 1: '700' vs '400' |
| e12 | table, 26 rows | ok | bad | 21 row(s) but 26 were expected |
| e13 | table, 17 rows | ok | bad | value row 1: 'Calgary' vs 'Ottawa' (order enforced) |
| e14 | table, 66 rows | ok | bad | 52 row(s) but 66 were expected |
| e15 | table, 2 rows | ok | bad | column names: n vs count |
| e16 | table, 400 rows | ok | bad | name row 1: 'Andonuts, Blair' vs 'Blair, Andonuts' |
| e17 | table, 5 rows | ok | bad | first_name row 1: 'Simone' vs 'James' (reversed sort caught) |
| e18 | table, 1 row | ok | bad | value row 1: '31' vs '27' |
| m01 | table, 214 rows | ok | bad | 337 row(s) but 214 were expected |
| m02 | table, 18 rows | ok | bad | diagnosis row 1 (reversed sort caught) |
| m03 | table, 700 rows | ok | bad | days row 1: '13' vs '-13' |
| m04 | table, 2 rows | ok | bad | avg_height row 1: '170.2' vs '170' |
| m05 | table, 184 rows | ok | bad | 134 row(s) but 184 were expected |
| m06 | table, 5 rows | ok | bad | 3 row(s) but 5 were expected |
| m07 | table, 13 rows | ok | bad | province_name row 1 (reversed sort caught) |
| m08 | table, 122 rows | ok | bad | 234 row(s) but 122 were expected |
| m09 | table, 400 rows | ok | bad | age row 1: '73' vs '72' |
| m10 | table, 7 rows | ok | bad | year row 1: '2018' vs '2024' (reversed sort caught) |
| m11 | table, 63 rows | ok | bad | 337 row(s) but 63 were expected |
| m12 | table, 12 rows | ok | bad | n row 1: '15' vs '6' |
| m13 | table, 12 rows | ok | bad | specialty row 1 (reversed sort caught) |
| m14 | table, 115 rows | ok | bad | 209 row(s) but 115 were expected |
| m15 | table, 18 rows | ok | bad | diagnosis row 1 (min instead of max) |
| h01 | table, 87 rows | ok | bad | 214 row(s) but 87 were expected |
| h02 | table, 95 rows | ok | bad | 88 row(s) but 95 were expected |
| h03 | table, 13 rows | ok | bad | first_name row 1: 'Anika' vs 'Nora' |
| h04 | table, 18 rows | ok | bad | pct row 1: '7.71' vs '7.7' |
| h05 | table, 13 rows | ok | bad | n_female row 1: '24' vs '30' |
| h06 | table, 30 rows | ok | bad | doctor_id row 4: '30' vs '12' (duplicates not removed) |
| h07 | table, 214 rows | ok | bad | avg_gap_days row 12: '350' vs '1046' |
| h08 | table, 34 rows | ok | bad | 665 row(s) but 34 were expected |
| h09 | table, 4 rows | ok | bad | 3 row(s) but 4 were expected |
| h10 | table, 12 rows | ok | bad | specialty row 1 (mean instead of median) |
| h11 | table, 205 rows | ok | bad | 194 row(s) but 205 were expected |
| h12 | table, 18 rows | ok | bad | 7 column(s) but 8 were expected |

## Changed

`js/exercises.js`, h09 prompt only. It carried `ordered: true` but was the only
ordered question whose prompt named no row order, so a correct answer returning the
four quartile counts in another order was marked wrong for a rule the question never
stated. Prompt now ends "in order from Q1 to Q4", matching every other ordered
question in the bank. No grading code changed.

## False-negative probes (equivalent answers that must still pass)

All passed: `subset()` for e01 and e12, `as.data.frame(table(...), responseName="n")`
for e15, `transform()` for m03, `match()/is.na()` for m11, `tapply()` for h06,
`cbind(data.frame(...), m)` for h12.

## Known looseness of value-based grading (left as is, by design)

- Single-column results do not have their column name checked (`.rp_cmp` guards the
  name test with `ncol(e) > 1`). So e06 passes with `data.frame(fullname = ...)` and
  e03 passes with a bare vector instead of a one-column frame. The guard is load
  bearing: bare-vector and scalar answers (e08, e11, e13, e18) normalise to a column
  called "value", so enforcing names on one-column results would reject them.
- Those same scalar questions report differences as "Column 'value' ...", which is a
  normaliser artifact rather than a column the learner wrote.

---

## Addendum, same day, after this report was written

This report was produced by a separate verification session before the alternate
solutions existed, so its 45 rows cover each question's own reference solution
and one near-miss, not the 79 alternates added later.

Two things above are now out of date:

**The "known looseness" section is fixed, not left as is.** `.rp_norm` now records
whether it invented the single column name (attribute `rp_syn`, set for a bare
vector or a scalar). Column names are compared for one-column results too, unless
either side is synthetic, so `data.frame(fullname = ...)` on e06 is now rejected
while a bare vector on e03 still passes. Scalar mismatches no longer name a
phantom column: e08 with the wrong year now reads "Expected '6' but your code
returned '4'".

**The e15 probe line is abbreviated in a way that matters.** It reads
`as.data.frame(table(...), responseName="n")`. The argument has to be named —
`table(gender = patients$gender)` — because that is what sets `names(dimnames())`
and gives the first column the name `gender`. Without the name you get `Var1` and
the answer is correctly rejected.

Verified separately after those changes: all 45 reference solutions still grade
green, all 35 base R alternates and all 44 dplyr/tidyr alternates grade green,
and the reversed-sort, dropped-column and wrong-filter near-misses still fail.
