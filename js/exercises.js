/* The question bank.
   Every solution is written in base R so that the expected result can be produced
   without downloading any package. Answers are graded on the value they produce,
   not on the code, so a dplyr answer that returns the same table also passes. */

(function () {
  'use strict';

  window.RP_EXERCISES = [

    /* ─────────────────────────── EASY ─────────────────────────── */

    {
      id: 'e01', d: 'easy', topic: 'Subsetting', tables: ['patients'],
      prompt: 'Show the <code>first_name</code>, <code>last_name</code> and <code>gender</code> of every patient whose gender is <code>"M"</code>.',
      hints: [
        'Inside [ ], what comes before the comma picks rows and what comes after picks columns.',
        'patients$gender == "M" gives you a TRUE/FALSE vector the same length as the table.'
      ],
      solution: 'patients[patients$gender == "M", c("first_name", "last_name", "gender")]'
    },
    {
      id: 'e02', d: 'easy', topic: 'Missing values', tables: ['patients'],
      prompt: 'Show the <code>first_name</code> and <code>last_name</code> of patients who have no allergy on record.',
      hints: [
        'A missing allergy is stored as NA.',
        'Comparing with == NA always gives NA. Use is.na() instead.'
      ],
      solution: 'patients[is.na(patients$allergies), c("first_name", "last_name")]'
    },
    {
      id: 'e03', d: 'easy', topic: 'Text', tables: ['patients'],
      prompt: 'Show the <code>first_name</code> of patients whose first name starts with the letter <code>C</code>. Return a one-column data frame.',
      hints: [
        'substr(x, 1, 1) takes the first character of every string.',
        'Add drop = FALSE so a single column stays a data frame instead of collapsing to a vector.'
      ],
      solution: 'patients[substr(patients$first_name, 1, 1) == "C", "first_name", drop = FALSE]'
    },
    {
      id: 'e04', d: 'easy', topic: 'Subsetting', tables: ['patients'],
      prompt: 'Show the <code>first_name</code>, <code>last_name</code> and <code>weight</code> of patients whose weight is between 100 and 120 kg, inclusive.',
      hints: [
        'Join two conditions with & for "and".',
        'Inclusive means >= and <=.'
      ],
      solution: 'patients[patients$weight >= 100 & patients$weight <= 120, c("first_name", "last_name", "weight")]'
    },
    {
      id: 'e05', d: 'easy', topic: 'Missing values', tables: ['patients'],
      prompt: 'Show <code>first_name</code>, <code>last_name</code> and <code>allergies</code> for all patients, but replace every missing allergy with the text <code>"NKA"</code>.',
      hints: [
        'Take the three columns first, then overwrite the allergies column.',
        'ifelse(is.na(x), "NKA", x) works element by element.'
      ],
      solution: 'out <- patients[, c("first_name", "last_name", "allergies")]\nout$allergies <- ifelse(is.na(out$allergies), "NKA", out$allergies)\nout'
    },
    {
      id: 'e06', d: 'easy', topic: 'Text', tables: ['patients'],
      prompt: 'Build a one-column data frame named <code>full_name</code> holding each patient’s first and last name separated by a single space.',
      hints: [
        'paste() joins two character vectors with a space by default.',
        'data.frame(full_name = ...) names the column for you.'
      ],
      solution: 'data.frame(full_name = paste(patients$first_name, patients$last_name))'
    },
    {
      id: 'e07', d: 'easy', topic: 'Joins', tables: ['patients', 'province_names'],
      prompt: 'Show each patient’s <code>first_name</code>, <code>last_name</code> and the full <code>province_name</code> they live in.',
      hints: [
        'The two tables share the column province_id.',
        'merge(x, y, by = "province_id") joins them, then pick the three columns you want.'
      ],
      solution: 'merge(patients, province_names, by = "province_id")[, c("first_name", "last_name", "province_name")]'
    },
    {
      id: 'e08', d: 'easy', topic: 'Dates', tables: ['patients'],
      prompt: 'How many patients were born in 1970? Return a single number.',
      hints: [
        'format(date, "%Y") pulls the year out as text.',
        'sum() over a TRUE/FALSE vector counts the TRUEs.'
      ],
      solution: 'sum(format(patients$birth_date, "%Y") == "1970")'
    },
    {
      id: 'e09', d: 'easy', topic: 'Summarising', tables: ['patients'],
      prompt: 'Show the <code>first_name</code>, <code>last_name</code> and <code>height</code> of the tallest patient.',
      hints: [
        'which.max() gives the position of the largest value.',
        'That position goes before the comma in [ ].'
      ],
      solution: 'patients[which.max(patients$height), c("first_name", "last_name", "height")]'
    },
    {
      id: 'e10', d: 'easy', topic: 'Subsetting', tables: ['patients'],
      prompt: 'Show the <code>patient_id</code>, <code>first_name</code> and <code>last_name</code> of the patients with ids 1, 45, 234, 310 and 400.',
      hints: [
        'Build the list of ids with c().',
        '%in% tests membership against all of them at once.'
      ],
      solution: 'patients[patients$patient_id %in% c(1, 45, 234, 310, 400), c("patient_id", "first_name", "last_name")]'
    },
    {
      id: 'e11', d: 'easy', topic: 'Data frames', tables: ['admissions'],
      prompt: 'How many admissions are recorded in total? Return a single number.',
      hints: ['nrow() counts the rows of a data frame.'],
      solution: 'nrow(admissions)'
    },
    {
      id: 'e12', d: 'easy', topic: 'Subsetting', tables: ['patients'],
      prompt: 'Show every column for patients who live in <code>"Toronto"</code>.',
      hints: [
        'Leave the part after the comma empty to keep all columns.',
        'Remember the comma: patients[condition, ].'
      ],
      solution: 'patients[patients$city == "Toronto", ]'
    },
    {
      id: 'e13', d: 'easy', topic: 'Summarising', tables: ['patients'],
      prompt: 'Show every distinct city, sorted alphabetically. Return a character vector.',
      hints: [
        'unique() removes repeats.',
        'sort() puts the result in alphabetical order.'
      ],
      ordered: true,
      solution: 'sort(unique(patients$city))'
    },
    {
      id: 'e14', d: 'easy', topic: 'Dates', tables: ['patients'],
      prompt: 'Show the <code>first_name</code>, <code>last_name</code> and <code>birth_date</code> of patients born in the 1980s (1980 to 1989).',
      hints: [
        'Pull the year out with format(), then turn it into a number with as.integer().',
        'Two conditions joined by & bracket the decade.'
      ],
      solution: 'yr <- as.integer(format(patients$birth_date, "%Y"))\npatients[yr >= 1980 & yr <= 1989, c("first_name", "last_name", "birth_date")]'
    },
    {
      id: 'e15', d: 'easy', topic: 'Summarising', tables: ['patients'],
      prompt: 'Count the patients of each gender. Return a data frame with the columns <code>gender</code> and <code>n</code>.',
      hints: [
        'table() counts occurrences of each value.',
        'names(tab) are the categories and as.integer(tab) are the counts.'
      ],
      solution: 'tab <- table(patients$gender)\ndata.frame(gender = names(tab), n = as.integer(tab))'
    },
    {
      id: 'e16', d: 'easy', topic: 'Text', tables: ['patients'],
      prompt: 'Build a one-column data frame named <code>name</code> holding every patient as <code>"Last, First"</code>, sorted by last name and then first name.',
      hints: [
        'Sort the table first with order(), then build the column from the sorted rows.',
        'paste0() joins without adding a separator, so write the ", " yourself.'
      ],
      ordered: true,
      solution: 'p <- patients[order(patients$last_name, patients$first_name), ]\ndata.frame(name = paste0(p$last_name, ", ", p$first_name))'
    },
    {
      id: 'e17', d: 'easy', topic: 'Sorting', tables: ['patients'],
      prompt: 'Show the <code>first_name</code>, <code>last_name</code> and <code>height</code> of the five shortest patients, shortest first.',
      hints: [
        'order() returns the row positions in sorted order.',
        'Take the first five rows afterwards with [1:5, ].'
      ],
      ordered: true,
      solution: 'patients[order(patients$height), c("first_name", "last_name", "height")][1:5, ]'
    },
    {
      id: 'e18', d: 'easy', topic: 'Missing values', tables: ['patients'],
      prompt: 'How many patients are allergic to <code>"Penicillin"</code>? Return a single number.',
      hints: [
        'The allergies column contains NA for most patients.',
        'sum() returns NA unless you pass na.rm = TRUE.'
      ],
      solution: 'sum(patients$allergies == "Penicillin", na.rm = TRUE)'
    },

    /* ────────────────────────── MEDIUM ────────────────────────── */

    {
      id: 'm01', d: 'medium', topic: 'Grouping', tables: ['admissions'],
      prompt: 'Show <code>patient_id</code> and the number of admissions <code>n</code> for every patient admitted more than once, most admissions first, breaking ties by <code>patient_id</code>.',
      hints: [
        'table(admissions$patient_id) counts admissions per patient.',
        'names() of that table are the ids as text, so wrap them in as.integer().',
        'order(-out$n, out$patient_id) sorts descending then ascending.'
      ],
      ordered: true,
      solution: 'tab <- table(admissions$patient_id)\nout <- data.frame(patient_id = as.integer(names(tab)), n = as.integer(tab))\nout <- out[out$n > 1, ]\nout[order(-out$n, out$patient_id), ]'
    },
    {
      id: 'm02', d: 'medium', topic: 'Grouping', tables: ['admissions'],
      prompt: 'Show each <code>diagnosis</code> and how many admissions <code>n</code> it accounts for, most common first, breaking ties alphabetically.',
      hints: [
        'Count with table(), then rebuild a data frame from it.',
        'order(-n, diagnosis) gives descending counts with an alphabetical tie-break.'
      ],
      ordered: true,
      solution: 'tab <- table(admissions$diagnosis)\nout <- data.frame(diagnosis = names(tab), n = as.integer(tab))\nout[order(-out$n, out$diagnosis), ]'
    },
    {
      id: 'm03', d: 'medium', topic: 'Dates', tables: ['admissions'],
      prompt: 'Show <code>patient_id</code>, <code>diagnosis</code> and the length of stay in whole days as a column named <code>days</code>, for every admission.',
      hints: [
        'Subtracting two Date columns gives a difftime measured in days.',
        'as.integer() turns that difftime into a plain number.'
      ],
      solution: 'data.frame(patient_id = admissions$patient_id,\n           diagnosis = admissions$diagnosis,\n           days = as.integer(admissions$discharge_date - admissions$admission_date))'
    },
    {
      id: 'm04', d: 'medium', topic: 'Grouping', tables: ['patients'],
      prompt: 'Show the average height and weight for each gender, as columns <code>gender</code>, <code>avg_height</code> and <code>avg_weight</code>, both rounded to one decimal.',
      hints: [
        'aggregate(cbind(height, weight) ~ gender, data = patients, FUN = mean) does the grouping.',
        'Rename and round the two result columns afterwards.'
      ],
      solution: 'a <- aggregate(cbind(height, weight) ~ gender, data = patients, FUN = mean)\ndata.frame(gender = a$gender,\n           avg_height = round(a$height, 1),\n           avg_weight = round(a$weight, 1))'
    },
    {
      id: 'm05', d: 'medium', topic: 'Joins', tables: ['patients', 'admissions'],
      prompt: 'Show every column of <code>admissions</code> for patients who live in Ontario (<code>province_id</code> is <code>"ON"</code>).',
      hints: [
        'First collect the patient ids living in Ontario.',
        'Then keep the admissions whose patient_id is %in% that set.'
      ],
      solution: 'on <- patients$patient_id[patients$province_id == "ON"]\nadmissions[admissions$patient_id %in% on, ]'
    },
    {
      id: 'm06', d: 'medium', topic: 'Joins', tables: ['admissions', 'doctors'],
      prompt: 'Show the five busiest doctors as columns <code>doctor</code> (first and last name, space separated) and <code>n</code>, most admissions first, breaking ties by name.',
      hints: [
        'Count admissions per attending_doctor_id first.',
        'merge() that count onto doctors using by = "doctor_id".',
        'head(x, 5) takes the top five once sorted.'
      ],
      ordered: true,
      solution: 'tab <- table(admissions$attending_doctor_id)\nd <- data.frame(doctor_id = as.integer(names(tab)), n = as.integer(tab))\nd <- merge(d, doctors, by = "doctor_id")\nd$doctor <- paste(d$first_name, d$last_name)\nd <- d[order(-d$n, d$doctor), c("doctor", "n")]\nhead(d, 5)'
    },
    {
      id: 'm07', d: 'medium', topic: 'Joins', tables: ['patients', 'province_names'],
      prompt: 'Show <code>province_name</code> and the number of patients <code>n</code> living there, most patients first, breaking ties by province name.',
      hints: [
        'Count by province_id, then merge the counts onto province_names.',
        'Provinces with no patients will not appear, which is fine here.'
      ],
      ordered: true,
      solution: 'tab <- table(patients$province_id)\np <- data.frame(province_id = names(tab), n = as.integer(tab))\np <- merge(p, province_names, by = "province_id")\np <- p[order(-p$n, p$province_name), c("province_name", "n")]\nrownames(p) <- NULL\np'
    },
    {
      id: 'm08', d: 'medium', topic: 'Calculations', tables: ['patients'],
      prompt: 'Show <code>first_name</code>, <code>last_name</code> and <code>bmi</code> for patients whose BMI is above 30, heaviest BMI first. BMI is weight in kg divided by height in metres squared, rounded to one decimal.',
      hints: [
        'Height is stored in centimetres, so divide it by 100 first.',
        'Round before you filter, so the comparison matches the value you show.'
      ],
      ordered: true,
      solution: 'bmi <- round(patients$weight / (patients$height / 100)^2, 1)\nout <- data.frame(first_name = patients$first_name,\n                  last_name = patients$last_name,\n                  bmi = bmi)\nout <- out[out$bmi > 30, ]\nout[order(-out$bmi), ]'
    },
    {
      id: 'm09', d: 'medium', topic: 'Dates', tables: ['patients'],
      prompt: 'Show <code>first_name</code>, <code>last_name</code> and <code>age</code> in whole years as of 1 January 2024.',
      hints: [
        'Subtract the birth date from as.Date("2024-01-01").',
        'Divide the number of days by 365.25 and take floor() to get completed years.'
      ],
      solution: 'ref <- as.Date("2024-01-01")\nage <- as.integer(floor(as.numeric(ref - patients$birth_date) / 365.25))\ndata.frame(first_name = patients$first_name,\n           last_name = patients$last_name,\n           age = age)'
    },
    {
      id: 'm10', d: 'medium', topic: 'Dates', tables: ['admissions'],
      prompt: 'Show how many admissions happened in each year, as columns <code>year</code> (a number) and <code>n</code>, earliest year first.',
      hints: [
        'format(date, "%Y") gives the year as text; as.integer() makes it a number.',
        'table() on that vector already comes back in ascending order.'
      ],
      ordered: true,
      solution: 'yr <- as.integer(format(admissions$admission_date, "%Y"))\ntab <- table(yr)\ndata.frame(year = as.integer(names(tab)), n = as.integer(tab))'
    },
    {
      id: 'm11', d: 'medium', topic: 'Joins', tables: ['patients', 'admissions'],
      prompt: 'Show the <code>patient_id</code>, <code>first_name</code> and <code>last_name</code> of patients who have never been admitted.',
      hints: [
        'This is an anti-join: rows on the left with no match on the right.',
        'Negate the membership test with ! in front of the whole condition.'
      ],
      solution: 'patients[!(patients$patient_id %in% admissions$patient_id), c("patient_id", "first_name", "last_name")]'
    },
    {
      id: 'm12', d: 'medium', topic: 'Dates', tables: ['admissions'],
      prompt: 'For admissions in 2020 only, show the number per calendar month as columns <code>month</code> (the full month name) and <code>n</code>, in calendar order. Include months with zero admissions.',
      hints: [
        'Filter to 2020 first, then take the month name with format(date, "%B").',
        'month.name is a built-in vector of the twelve names in order.',
        'Making the month a factor with those levels keeps empty months in the table.'
      ],
      ordered: true,
      solution: 'a <- admissions[format(admissions$admission_date, "%Y") == "2020", ]\nm <- factor(format(a$admission_date, "%B"), levels = month.name)\ntab <- table(m)\ndata.frame(month = names(tab), n = as.integer(tab))'
    },
    {
      id: 'm13', d: 'medium', topic: 'Grouping', tables: ['doctors'],
      prompt: 'Show each <code>specialty</code> and the number of doctors <code>n</code> practising it, largest first, breaking ties alphabetically.',
      hints: ['Same shape as the diagnosis count: table(), rebuild, order().'],
      ordered: true,
      solution: 'tab <- table(doctors$specialty)\nout <- data.frame(specialty = names(tab), n = as.integer(tab))\nout[order(-out$n, out$specialty), ]'
    },
    {
      id: 'm14', d: 'medium', topic: 'Text', tables: ['patients'],
      prompt: 'Show the <code>first_name</code> and <code>last_name</code> of patients whose last name is longer than 7 characters.',
      hints: ['nchar() returns the length of every string in a vector.'],
      solution: 'patients[nchar(patients$last_name) > 7, c("first_name", "last_name")]'
    },
    {
      id: 'm15', d: 'medium', topic: 'Grouping', tables: ['admissions'],
      prompt: 'For each <code>diagnosis</code>, show the longest stay in days as <code>max_days</code>, longest first, breaking ties alphabetically.',
      hints: [
        'Build a small data frame of diagnosis and length of stay first.',
        'aggregate(days ~ diagnosis, data = a, FUN = max) does the rest.'
      ],
      ordered: true,
      solution: 'a <- data.frame(diagnosis = admissions$diagnosis,\n                days = as.integer(admissions$discharge_date - admissions$admission_date))\nagg <- aggregate(days ~ diagnosis, data = a, FUN = max)\nnames(agg)[2] <- "max_days"\nagg[order(-agg$max_days, agg$diagnosis), ]'
    },

    /* ─────────────────────────── HARD ─────────────────────────── */

    {
      id: 'h01', d: 'hard', topic: 'Grouping', tables: ['admissions'],
      prompt: 'For patients with at least three admissions, show <code>patient_id</code>, <code>first_admission</code> and <code>last_admission</code> (their earliest and latest admission dates), ordered by <code>patient_id</code>.',
      hints: [
        'Count admissions per patient with aggregate(... , FUN = length) to find who qualifies.',
        'Then aggregate the same column twice, once with min and once with max.',
        'merge() the two results on patient_id and rename the columns.'
      ],
      ordered: true,
      solution: 'cnt <- aggregate(admission_date ~ patient_id, admissions, length)\nids <- cnt$patient_id[cnt$admission_date >= 3]\na <- admissions[admissions$patient_id %in% ids, ]\nf <- aggregate(admission_date ~ patient_id, a, min)\nl <- aggregate(admission_date ~ patient_id, a, max)\nout <- merge(f, l, by = "patient_id")\nnames(out) <- c("patient_id", "first_admission", "last_admission")\nout[order(out$patient_id), ]'
    },
    {
      id: 'h02', d: 'hard', topic: 'Window logic', tables: ['admissions'],
      prompt: 'For admissions in 2018, show <code>admission_date</code>, the number of admissions that day as <code>n</code>, and the running total as <code>cumulative</code>, in date order.',
      hints: [
        'Count per date with table(), then convert the names back with as.Date().',
        'Sort by date before you accumulate.',
        'cumsum() produces the running total.'
      ],
      ordered: true,
      solution: 'a <- admissions[format(admissions$admission_date, "%Y") == "2018", ]\ntab <- table(a$admission_date)\nout <- data.frame(admission_date = as.Date(names(tab)), n = as.integer(tab))\nout <- out[order(out$admission_date), ]\nout$cumulative <- cumsum(out$n)\nrownames(out) <- NULL\nout'
    },
    {
      id: 'h03', d: 'hard', topic: 'Window logic', tables: ['patients'],
      prompt: 'Show the heaviest patient in each province as columns <code>province_id</code>, <code>first_name</code>, <code>last_name</code> and <code>weight</code>, ordered by <code>province_id</code>. If two patients tie, keep the lower <code>patient_id</code>.',
      hints: [
        'Sort the whole table so the row you want comes first within each province.',
        'duplicated() is TRUE for every repeat of a value after the first one.',
        '!duplicated(province_id) therefore keeps exactly the first row per province.'
      ],
      ordered: true,
      solution: 'p <- patients[order(patients$province_id, -patients$weight, patients$patient_id), ]\nout <- p[!duplicated(p$province_id), c("province_id", "first_name", "last_name", "weight")]\nrownames(out) <- NULL\nout'
    },
    {
      id: 'h04', d: 'hard', topic: 'Calculations', tables: ['admissions'],
      prompt: 'Show each <code>diagnosis</code> and the share of all admissions it represents as <code>pct</code>, a percentage rounded to two decimals, largest share first, breaking ties alphabetically.',
      hints: [
        'Divide each count by nrow(admissions), then multiply by 100.',
        'Round to two decimals before sorting so the order matches what you show.'
      ],
      ordered: true,
      solution: 'tab <- table(admissions$diagnosis)\nout <- data.frame(diagnosis = names(tab),\n                  pct = round(100 * as.integer(tab) / nrow(admissions), 2))\nout[order(-out$pct, out$diagnosis), ]'
    },
    {
      id: 'h05', d: 'hard', topic: 'Reshaping', tables: ['patients'],
      prompt: 'Build a wide table with one row per province: columns <code>province_id</code>, <code>n_female</code> and <code>n_male</code>, ordered by <code>province_id</code>.',
      hints: [
        'table() with two arguments gives a cross-tabulation.',
        'rownames() of that table are the provinces; index the columns by "F" and "M".'
      ],
      ordered: true,
      solution: 'tab <- table(patients$province_id, patients$gender)\ndata.frame(province_id = rownames(tab),\n           n_female = as.integer(tab[, "F"]),\n           n_male = as.integer(tab[, "M"]))'
    },
    {
      id: 'h06', d: 'hard', topic: 'Grouping', tables: ['admissions'],
      prompt: 'Show <code>doctor_id</code> and the number of <em>distinct</em> patients each has attended as <code>n_patients</code>, most first, breaking ties by <code>doctor_id</code>.',
      hints: [
        'A doctor can see the same patient more than once, so remove repeated pairs first.',
        'unique() on a two-column data frame drops duplicate rows.'
      ],
      ordered: true,
      solution: 'u <- unique(admissions[, c("attending_doctor_id", "patient_id")])\ntab <- table(u$attending_doctor_id)\nout <- data.frame(doctor_id = as.integer(names(tab)), n_patients = as.integer(tab))\nout[order(-out$n_patients, out$doctor_id), ]'
    },
    {
      id: 'h07', d: 'hard', topic: 'Window logic', tables: ['admissions'],
      prompt: 'For every patient with at least two admissions, show <code>patient_id</code> and <code>avg_gap_days</code>: the mean number of days between consecutive admissions, rounded to one decimal, ordered by <code>patient_id</code>.',
      hints: [
        'Sort by patient and date, then split() the dates into one vector per patient.',
        'diff() on a sorted Date vector gives the gaps between neighbours.',
        'Keep only the patients whose vector has length 2 or more.'
      ],
      ordered: true,
      solution: 'a <- admissions[order(admissions$patient_id, admissions$admission_date), ]\nsp <- split(a$admission_date, a$patient_id)\nsp <- sp[sapply(sp, length) >= 2]\ngaps <- sapply(sp, function(d) round(mean(as.numeric(diff(d))), 1))\nout <- data.frame(patient_id = as.integer(names(gaps)), avg_gap_days = as.numeric(gaps))\nout[order(out$patient_id), ]'
    },
    {
      id: 'h08', d: 'hard', topic: 'Grouping', tables: ['admissions'],
      prompt: 'Find every case where a patient was admitted more than once with the same diagnosis. Show <code>patient_id</code>, <code>diagnosis</code> and the count <code>n</code>, ordered by <code>patient_id</code> then <code>diagnosis</code>.',
      hints: [
        'aggregate() accepts more than one grouping column: value ~ a + b.',
        'Use FUN = length to count the rows in each group.',
        'Do not build a key by pasting the columns together; some diagnoses contain spaces.'
      ],
      ordered: true,
      solution: 'a <- aggregate(admission_date ~ patient_id + diagnosis, admissions, length)\nnames(a)[3] <- "n"\na <- a[a$n > 1, ]\na[order(a$patient_id, a$diagnosis), c("patient_id", "diagnosis", "n")]'
    },
    {
      id: 'h09', d: 'hard', topic: 'Calculations', tables: ['patients'],
      prompt: 'Split patients into weight quartiles labelled <code>Q1</code> to <code>Q4</code> and show how many fall in each, as columns <code>quartile</code> and <code>n</code>, in order from <code>Q1</code> to <code>Q4</code>.',
      hints: [
        'quantile(x, probs = c(0, .25, .5, .75, 1)) gives the four cut points plus both ends.',
        'cut() turns a numeric vector into labelled bins.',
        'include.lowest = TRUE keeps the smallest value from becoming NA.'
      ],
      ordered: true,
      solution: 'q <- quantile(patients$weight, probs = c(0, 0.25, 0.5, 0.75, 1))\ngrp <- cut(patients$weight, breaks = q, labels = c("Q1", "Q2", "Q3", "Q4"), include.lowest = TRUE)\ntab <- table(grp)\ndata.frame(quartile = names(tab), n = as.integer(tab))'
    },
    {
      id: 'h10', d: 'hard', topic: 'Joins', tables: ['admissions', 'doctors'],
      prompt: 'For each <code>specialty</code>, show the median length of stay in days as <code>median_days</code>, longest first, breaking ties alphabetically.',
      hints: [
        'Join admissions to doctors with by.x = "attending_doctor_id" and by.y = "doctor_id".',
        'Compute the stay length, then aggregate it by specialty with FUN = median.'
      ],
      ordered: true,
      solution: 'a <- merge(admissions, doctors, by.x = "attending_doctor_id", by.y = "doctor_id")\na$days <- as.integer(a$discharge_date - a$admission_date)\nagg <- aggregate(days ~ specialty, a, median)\nnames(agg)[2] <- "median_days"\nagg[order(-agg$median_days, agg$specialty), ]'
    },
    {
      id: 'h11', d: 'hard', topic: 'Window logic', tables: ['patients'],
      prompt: 'Show <code>first_name</code>, <code>last_name</code>, <code>province_id</code> and <code>height</code> for every patient taller than the average height of their own province.',
      hints: [
        'tapply() gives you one average per province, named by province code.',
        'Indexing that named vector by patients$province_id lines the averages up row by row.'
      ],
      solution: 'avg <- tapply(patients$height, patients$province_id, mean)\nout <- patients[patients$height > avg[patients$province_id],\n                c("first_name", "last_name", "province_id", "height")]\nrownames(out) <- NULL\nout'
    },
    {
      id: 'h12', d: 'hard', topic: 'Reshaping', tables: ['admissions'],
      prompt: 'Build a wide table of admissions by diagnosis and year: a <code>diagnosis</code> column followed by one column per year, holding counts, with zeros where a diagnosis did not occur that year. Order the rows by <code>diagnosis</code>.',
      hints: [
        'table(diagnosis, year) already fills missing combinations with zero.',
        'as.data.frame.matrix() keeps a table in its wide shape.',
        'data.frame(..., check.names = FALSE) stops R from prefixing the year columns with X.'
      ],
      ordered: true,
      solution: 'yr <- as.integer(format(admissions$admission_date, "%Y"))\ntab <- table(admissions$diagnosis, yr)\nout <- as.data.frame.matrix(tab)\nout <- data.frame(diagnosis = rownames(out), out, check.names = FALSE)\nrownames(out) <- NULL\nout'
    }

  ];
})();
