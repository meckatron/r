/* Alternate solutions, keyed by exercise id.

   Kept separate from exercises.js so the question bank and the worked
   alternatives can be edited independently. app.js merges these onto each
   question at start-up.

   Each entry: { label, code, note?, needs? }
   `needs` names packages the snippet requires; the panel marks those, and they
   only run once dplyr and tidyr are installed from Settings. */

(function () {
  'use strict';

  window.RP_ALTERNATES = {

    /* ─────────────── EASY ─────────────── */

    e01: [
      { complexity: 2, label: 'subset()', code: 'subset(patients, gender == "M", select = c(first_name, last_name, gender))',
        note: 'subset() looks column names up inside the data frame, so no patients$ prefix is needed.' },
      { complexity: 3, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  filter(gender == "M") |>\n  select(first_name, last_name, gender)' }
    ],
    e02: [
      { complexity: 2, label: 'subset()', code: 'subset(patients, is.na(allergies), select = c(first_name, last_name))' },
      { complexity: 3, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  filter(is.na(allergies)) |>\n  select(first_name, last_name)' }
    ],
    e03: [
      { complexity: 2, label: 'startsWith()', code: 'patients[startsWith(patients$first_name, "C"), "first_name", drop = FALSE]',
        note: 'Reads more directly than slicing the first character off every name.' },
      { complexity: 3, label: 'Regular expression', code: 'patients[grepl("^C", patients$first_name), "first_name", drop = FALSE]',
        note: '^C anchors the match to the start of the string.' },
      { complexity: 4, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  filter(startsWith(first_name, "C")) |>\n  select(first_name)' }
    ],
    e04: [
      { complexity: 2, label: 'subset()', code: 'subset(patients, weight >= 100 & weight <= 120,\n       select = c(first_name, last_name, weight))' },
      { complexity: 3, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  filter(between(weight, 100, 120)) |>\n  select(first_name, last_name, weight)',
        note: 'between() is inclusive at both ends.' }
    ],
    e05: [
      { complexity: 1, label: 'transform()', code: 'transform(patients[, c("first_name", "last_name", "allergies")],\n          allergies = ifelse(is.na(allergies), "NKA", allergies))',
        note: 'transform() adds or replaces a column and hands back the whole data frame.' },
      { complexity: 2, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  select(first_name, last_name, allergies) |>\n  mutate(allergies = coalesce(allergies, "NKA"))',
        note: 'coalesce() takes the first value that is not NA.' }
    ],
    e06: [
      { complexity: 2, label: 'with()', code: 'with(patients, data.frame(full_name = paste(first_name, last_name)))' },
      { complexity: 3, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  transmute(full_name = paste(first_name, last_name))',
        note: 'transmute() is mutate() that keeps only the columns it creates.' }
    ],
    e07: [
      { complexity: 3, label: 'match()', code: 'data.frame(\n  first_name = patients$first_name,\n  last_name = patients$last_name,\n  province_name = province_names$province_name[\n    match(patients$province_id, province_names$province_id)]\n)',
        note: 'A lookup rather than a join. match() gives the row of province_names for each patient.' },
      { complexity: 2, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  inner_join(province_names, by = "province_id") |>\n  select(first_name, last_name, province_name)' }
    ],
    e08: [
      { complexity: 2, label: 'length(which())', code: 'length(which(as.integer(format(patients$birth_date, "%Y")) == 1970))' },
      { complexity: 3, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  filter(format(birth_date, "%Y") == "1970") |>\n  nrow()' }
    ],
    e09: [
      { complexity: 2, label: 'order()', code: 'patients[order(patients$height, decreasing = TRUE)[1],\n         c("first_name", "last_name", "height")]' },
      { complexity: 3, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  slice_max(height, n = 1, with_ties = FALSE) |>\n  select(first_name, last_name, height)',
        note: 'with_ties = FALSE keeps one row when several patients share the top height.' }
    ],
    e10: [
      { complexity: 2, label: 'subset()', code: 'subset(patients, patient_id %in% c(1, 45, 234, 310, 400),\n       select = c(patient_id, first_name, last_name))' },
      { complexity: 3, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  filter(patient_id %in% c(1, 45, 234, 310, 400)) |>\n  select(patient_id, first_name, last_name)' }
    ],
    e11: [
      { complexity: 2, label: 'dim()', code: 'dim(admissions)[1]' },
      { complexity: 3, label: 'length()', code: 'length(admissions$patient_id)',
        note: 'Every column is a vector as long as the table, so this works too.' }
    ],
    e12: [
      { complexity: 2, label: 'subset()', code: 'subset(patients, city == "Toronto")' },
      { complexity: 3, label: 'dplyr', needs: 'dplyr', code: 'patients |>\n  filter(city == "Toronto")' }
    ],
    e13: [
      { complexity: 2, label: 'factor levels', code: 'levels(factor(patients$city))',
        note: 'Factor levels are stored in sorted order, so this is unique() and sort() in one step.' },
      { complexity: 3, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  distinct(city) |>\n  arrange(city) |>\n  pull(city)',
        note: 'pull() takes the column back out as a plain vector.' }
    ],
    e14: [
      { complexity: 1, label: 'Date comparison', code: 'subset(patients,\n       birth_date >= as.Date("1980-01-01") & birth_date <= as.Date("1989-12-31"),\n       select = c(first_name, last_name, birth_date))',
        note: 'Dates compare directly, so the year never has to become text.' },
      { complexity: 2, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  filter(between(birth_date, as.Date("1980-01-01"), as.Date("1989-12-31"))) |>\n  select(first_name, last_name, birth_date)' }
    ],
    e15: [
      { complexity: 3, label: 'aggregate()', code: 'a <- aggregate(patient_id ~ gender, patients, length)\nnames(a) <- c("gender", "n")\na' },
      { complexity: 1, label: 'dplyr', needs: 'dplyr', code: 'patients |>\n  count(gender)',
        note: 'count() names the column n for you, which is where that convention comes from.' }
    ],
    e16: [
      { complexity: 3, label: 'with()', code: 'p <- patients[order(patients$last_name, patients$first_name), ]\ndata.frame(name = with(p, paste0(last_name, ", ", first_name)))' },
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  arrange(last_name, first_name) |>\n  transmute(name = paste0(last_name, ", ", first_name))' }
    ],
    e17: [
      { complexity: 2, label: 'head()', code: 'head(patients[order(patients$height), c("first_name", "last_name", "height")], 5)',
        note: 'head() is clearer than [1:5, ] and does not fail when there are fewer than five rows.' },
      { complexity: 3, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  arrange(height) |>\n  slice_head(n = 5) |>\n  select(first_name, last_name, height)' }
    ],
    e18: [
      { complexity: 2, label: 'which()', code: 'length(which(patients$allergies == "Penicillin"))',
        note: 'which() quietly drops NA, so no na.rm is needed.' },
      { complexity: 3, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  filter(allergies == "Penicillin") |>\n  nrow()' }
    ],

    /* ─────────────── MEDIUM ─────────────── */

    m01: [
      { complexity: 2, label: 'aggregate()', code: 'out <- aggregate(admission_date ~ patient_id, admissions, length)\nnames(out) <- c("patient_id", "n")\nout <- out[out$n > 1, ]\nout[order(-out$n, out$patient_id), ]' },
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'admissions |>\n  count(patient_id) |>\n  filter(n > 1) |>\n  arrange(desc(n), patient_id)' }
    ],
    m02: [
      { complexity: 2, label: 'aggregate()', code: 'out <- aggregate(patient_id ~ diagnosis, admissions, length)\nnames(out) <- c("diagnosis", "n")\nout[order(-out$n, out$diagnosis), ]' },
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'admissions |>\n  count(diagnosis) |>\n  arrange(desc(n), diagnosis)' }
    ],
    m03: [
      { complexity: 3, label: 'Add a column', code: 'out <- admissions[, c("patient_id", "diagnosis")]\nout$days <- as.integer(admissions$discharge_date - admissions$admission_date)\nout' },
      { complexity: 2, label: 'dplyr', needs: 'dplyr',
        code: 'admissions |>\n  transmute(patient_id, diagnosis,\n            days = as.integer(discharge_date - admission_date))' }
    ],
    m04: [
      { complexity: 3, label: 'tapply()', code: 'h <- tapply(patients$height, patients$gender, mean)\nw <- tapply(patients$weight, patients$gender, mean)\ndata.frame(gender = names(h),\n           avg_height = round(as.numeric(h), 1),\n           avg_weight = round(as.numeric(w), 1))' },
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  group_by(gender) |>\n  summarise(avg_height = round(mean(height), 1),\n            avg_weight = round(mean(weight), 1))' }
    ],
    m05: [
      { complexity: 3, label: 'merge()', code: 'on <- patients[patients$province_id == "ON", "patient_id", drop = FALSE]\nmerge(admissions, on, by = "patient_id")',
        note: 'Joining against a one-column table is another way to express a filter.' },
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'admissions |>\n  semi_join(filter(patients, province_id == "ON"), by = "patient_id")',
        note: 'semi_join keeps matching rows without adding any columns.' }
    ],
    m06: [
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'admissions |>\n  count(attending_doctor_id) |>\n  inner_join(doctors, by = c("attending_doctor_id" = "doctor_id")) |>\n  mutate(doctor = paste(first_name, last_name)) |>\n  arrange(desc(n), doctor) |>\n  select(doctor, n) |>\n  head(5)' }
    ],
    m07: [
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  count(province_id) |>\n  inner_join(province_names, by = "province_id") |>\n  arrange(desc(n), province_name) |>\n  select(province_name, n)' }
    ],
    m08: [
      { complexity: 2, label: 'transform()', code: 'out <- transform(patients, bmi = round(weight / (height / 100)^2, 1))\nout <- out[out$bmi > 30, c("first_name", "last_name", "bmi")]\nout[order(-out$bmi), ]' },
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  mutate(bmi = round(weight / (height / 100)^2, 1)) |>\n  filter(bmi > 30) |>\n  arrange(desc(bmi)) |>\n  select(first_name, last_name, bmi)' }
    ],
    m09: [
      { complexity: 2, label: 'difftime()', code: 'days <- as.numeric(difftime(as.Date("2024-01-01"), patients$birth_date, units = "days"))\ndata.frame(first_name = patients$first_name,\n           last_name = patients$last_name,\n           age = as.integer(floor(days / 365.25)))' },
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  transmute(first_name, last_name,\n            age = as.integer(floor(as.numeric(as.Date("2024-01-01") - birth_date) / 365.25)))' }
    ],
    m10: [
      { complexity: 2, label: 'aggregate()', code: 'yr <- as.integer(format(admissions$admission_date, "%Y"))\naggregate(list(n = yr), list(year = yr), length)',
        note: 'Naming the lists is what gives the result its column names.' },
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'admissions |>\n  mutate(year = as.integer(format(admission_date, "%Y"))) |>\n  count(year)' }
    ],
    m11: [
      { complexity: 3, label: 'setdiff()', code: 'ids <- setdiff(patients$patient_id, admissions$patient_id)\npatients[patients$patient_id %in% ids, c("patient_id", "first_name", "last_name")]' },
      { complexity: 2, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  anti_join(admissions, by = "patient_id") |>\n  select(patient_id, first_name, last_name)',
        note: 'anti_join is exactly this idea with a name.' }
    ],
    m12: [
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'admissions |>\n  filter(format(admission_date, "%Y") == "2020") |>\n  mutate(month = factor(format(admission_date, "%B"), levels = month.name)) |>\n  count(month, .drop = FALSE)',
        note: '.drop = FALSE is what keeps months with no admissions in the result.' }
    ],
    m13: [
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'doctors |>\n  count(specialty) |>\n  arrange(desc(n), specialty)' }
    ],
    m14: [
      { complexity: 2, label: 'subset()', code: 'subset(patients, nchar(last_name) > 7, select = c(first_name, last_name))' },
      { complexity: 3, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  filter(nchar(last_name) > 7) |>\n  select(first_name, last_name)' }
    ],
    m15: [
      { complexity: 3, label: 'tapply()', code: 'los <- as.integer(admissions$discharge_date - admissions$admission_date)\nm <- tapply(los, admissions$diagnosis, max)\nout <- data.frame(diagnosis = names(m), max_days = as.integer(m))\nout[order(-out$max_days, out$diagnosis), ]' },
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'admissions |>\n  mutate(days = as.integer(discharge_date - admission_date)) |>\n  group_by(diagnosis) |>\n  summarise(max_days = max(days)) |>\n  arrange(desc(max_days), diagnosis)' }
    ],

    /* ─────────────── HARD ─────────────── */

    h01: [
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'admissions |>\n  group_by(patient_id) |>\n  filter(n() >= 3) |>\n  summarise(first_admission = min(admission_date),\n            last_admission = max(admission_date)) |>\n  arrange(patient_id)',
        note: 'filter() inside a group sees the whole group, so n() counts that patient’s admissions.' }
    ],
    h02: [
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'admissions |>\n  filter(format(admission_date, "%Y") == "2018") |>\n  count(admission_date) |>\n  arrange(admission_date) |>\n  mutate(cumulative = cumsum(n))' }
    ],
    h03: [
      { complexity: 3, label: 'split() and lapply()', code: 'sp <- split(patients, patients$province_id)\nout <- do.call(rbind, lapply(sp, function(d) {\n  d <- d[order(-d$weight, d$patient_id), ]\n  d[1, c("province_id", "first_name", "last_name", "weight")]\n}))\nrownames(out) <- NULL\nout',
        note: 'Handle one province at a time, then stack the pieces back together.' },
      { complexity: 2, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  arrange(province_id, desc(weight), patient_id) |>\n  group_by(province_id) |>\n  slice_head(n = 1) |>\n  ungroup() |>\n  select(province_id, first_name, last_name, weight)' }
    ],
    h04: [
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'admissions |>\n  count(diagnosis) |>\n  mutate(pct = round(100 * n / sum(n), 2)) |>\n  arrange(desc(pct), diagnosis) |>\n  select(diagnosis, pct)',
        note: 'sum(n) inside mutate() totals the counts, so nrow() is not needed.' }
    ],
    h05: [
      { complexity: 2, label: 'xtabs()', code: 'tab <- xtabs(~ province_id + gender, data = patients)\ndata.frame(province_id = rownames(tab),\n           n_female = as.integer(tab[, "F"]),\n           n_male = as.integer(tab[, "M"]))',
        note: 'xtabs() states the cross-tabulation as a formula.' },
      { complexity: 3, label: 'dplyr + tidyr', needs: 'dplyr, tidyr',
        code: 'patients |>\n  count(province_id, gender) |>\n  tidyr::pivot_wider(names_from = gender, values_from = n, values_fill = 0) |>\n  rename(n_female = `F`, n_male = `M`) |>\n  arrange(province_id) |>\n  select(province_id, n_female, n_male)' }
    ],
    h06: [
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'admissions |>\n  distinct(attending_doctor_id, patient_id) |>\n  count(attending_doctor_id, name = "n_patients") |>\n  rename(doctor_id = attending_doctor_id) |>\n  arrange(desc(n_patients), doctor_id)' }
    ],
    h07: [
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'admissions |>\n  arrange(patient_id, admission_date) |>\n  group_by(patient_id) |>\n  filter(n() >= 2) |>\n  summarise(avg_gap_days = round(mean(as.numeric(diff(admission_date))), 1)) |>\n  arrange(patient_id)' }
    ],
    h08: [
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'admissions |>\n  count(patient_id, diagnosis) |>\n  filter(n > 1) |>\n  arrange(patient_id, diagnosis)',
        note: 'count() takes several grouping columns, which is the whole question in one line.' }
    ],
    h09: [
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  mutate(quartile = cut(weight,\n                        breaks = quantile(weight, probs = c(0, 0.25, 0.5, 0.75, 1)),\n                        labels = c("Q1", "Q2", "Q3", "Q4"),\n                        include.lowest = TRUE)) |>\n  count(quartile)' }
    ],
    h10: [
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'admissions |>\n  inner_join(doctors, by = c("attending_doctor_id" = "doctor_id")) |>\n  mutate(days = as.integer(discharge_date - admission_date)) |>\n  group_by(specialty) |>\n  summarise(median_days = median(days)) |>\n  arrange(desc(median_days), specialty)' }
    ],
    h11: [
      { complexity: 2, label: 'ave()', code: 'avg <- ave(patients$height, patients$province_id, FUN = mean)\nout <- patients[patients$height > avg,\n                c("first_name", "last_name", "province_id", "height")]\nrownames(out) <- NULL\nout',
        note: 'ave() returns the group average repeated down the rows, already lined up.' },
      { complexity: 1, label: 'dplyr', needs: 'dplyr',
        code: 'patients |>\n  group_by(province_id) |>\n  filter(height > mean(height)) |>\n  ungroup() |>\n  select(first_name, last_name, province_id, height)' }
    ],
    h12: [
      { complexity: 2, label: 'xtabs()', code: 'yr <- as.integer(format(admissions$admission_date, "%Y"))\ntab <- xtabs(~ admissions$diagnosis + yr)\nout <- as.data.frame.matrix(tab)\ndata.frame(diagnosis = rownames(out), out, check.names = FALSE, row.names = NULL)' },
      { complexity: 1, label: 'dplyr + tidyr', needs: 'dplyr, tidyr',
        code: 'admissions |>\n  mutate(year = format(admission_date, "%Y")) |>\n  count(diagnosis, year) |>\n  tidyr::pivot_wider(names_from = year, values_from = n,\n                     values_fill = 0, names_sort = TRUE) |>\n  arrange(diagnosis)',
        note: 'names_sort = TRUE puts the year columns in order instead of order of appearance.' }
    ]

  };
  /* Where the reference solution sits on each question's complexity ramp.
     The reference is always base R so grading needs no packages, which on the
     harder questions makes it the most involved way rather than the simplest. */
  window.RP_REF_COMPLEXITY = {
    e01: 1,
    e02: 1,
    e03: 1,
    e04: 1,
    e05: 3,
    e06: 1,
    e07: 1,
    e08: 1,
    e09: 1,
    e10: 1,
    e11: 1,
    e12: 1,
    e13: 1,
    e14: 3,
    e15: 2,
    e16: 2,
    e17: 1,
    e18: 1,
    m01: 3,
    m02: 3,
    m03: 1,
    m04: 2,
    m05: 2,
    m06: 2,
    m07: 2,
    m08: 3,
    m09: 3,
    m10: 3,
    m11: 1,
    m12: 2,
    m13: 2,
    m14: 1,
    m15: 2,
    h01: 2,
    h02: 2,
    h03: 1,
    h04: 2,
    h05: 1,
    h06: 2,
    h07: 2,
    h08: 2,
    h09: 2,
    h10: 2,
    h11: 3,
    h12: 3
  };
})();
