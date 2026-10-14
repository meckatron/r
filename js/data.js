/* Dataset definitions and the reference material shown in the left panel.
   The hospital data frames are generated inside R from a fixed seed, so every
   visitor gets byte-identical data without downloading a data file. */

(function () {
  'use strict';

  var HOSPITAL_SETUP = [
    'set.seed(1842)',
    '',
    'province_names <- data.frame(',
    '  province_id = c("AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"),',
    '  province_name = c("Alberta","British Columbia","Manitoba","New Brunswick",',
    '                    "Newfoundland and Labrador","Nova Scotia","Northwest Territories",',
    '                    "Nunavut","Ontario","Prince Edward Island","Quebec",',
    '                    "Saskatchewan","Yukon"),',
    '  stringsAsFactors = FALSE',
    ')',
    '',
    '.rp_m <- c("Donald","Mickey","Blair","Charles","Thomas","Sonny","Cedric","Hank",',
    '           "Rick","Woody","Tom","John","Jon","Nino","Jim","Roderick","Sam","Roland",',
    '           "Anthony","James","Stone","Omar","Victor","Raj","Felix","Dmitri","Luis",',
    '           "Owen","Hugo","Marcus","Elias","Noor","Kwame","Soren","Ivan")',
    '.rp_f <- c("Maria","Priya","Elena","Nora","Grace","Ada","Ingrid","Leila","Simone",',
    '           "Beatrice","Fatima","Yuki","Harper","Rosa","Delia","Agnes","Mei","Zara",',
    '           "Claudia","Imani","Petra","Nadia","Esther","Vera","Lucia","Anika","Sofia")',
    '.rp_last <- c("Waterfield","Baasha","Sharma","Diaz","Wolfe","ONeill","Beckett",',
    '              "Coltrane","Spencer","Bennett","Bashir","Halliwell","West","Doggett",',
    '              "Andrews","Farley","Thomas","Payne","Threep","Edge","Wiggum","Maxwell",',
    '              "Sullivan","Andonuts","Edwards","Cutting","Nakamura","Okafor","Rossi",',
    '              "Lindqvist","Haddad","Moreau","Kowalski","Silva","Fitzgerald")',
    '.rp_city <- c("Toronto","Vancouver","Calgary","Halifax","Winnipeg","Ottawa",',
    '              "Montreal","Saskatoon","Edmonton","Victoria","Hamilton","Quebec City",',
    '              "Whitehorse","St. Johns","Yellowknife","Regina","Fredericton")',
    '.rp_spec <- c("Cardiology","Neurology","Oncology","Pediatrics","Orthopedics",',
    '              "Dermatology","Psychiatry","Radiology","Emergency Medicine",',
    '              "General Surgery","Endocrinology","Gastroenterology")',
    '.rp_diag <- c("Pneumonia","Appendicitis","Fractured Femur","Migraine","Asthma",',
    '              "Type 2 Diabetes","Hypertension","Influenza","Kidney Stones",',
    '              "Gallstones","Dehydration","Concussion","Cellulitis","Anemia",',
    '              "Bronchitis","Sepsis","Atrial Fibrillation","Pancreatitis")',
    '.rp_allergy <- c("Penicillin","Peanuts","Shellfish","Latex","Pollen","Sulfa Drugs",',
    '                 "Aspirin","Dust Mites")',
    '',
    '.rp_ndoc <- 30L',
    'doctors <- data.frame(',
    '  doctor_id = seq_len(.rp_ndoc),',
    '  first_name = sample(c(.rp_m, .rp_f), .rp_ndoc, TRUE),',
    '  last_name = sample(.rp_last, .rp_ndoc, TRUE),',
    '  specialty = sample(.rp_spec, .rp_ndoc, TRUE),',
    '  stringsAsFactors = FALSE',
    ')',
    '',
    '.rp_npat <- 400L',
    '.rp_gender <- sample(c("M","F"), .rp_npat, TRUE)',
    'patients <- data.frame(',
    '  patient_id = seq_len(.rp_npat),',
    '  first_name = ifelse(.rp_gender == "M",',
    '                      sample(.rp_m, .rp_npat, TRUE),',
    '                      sample(.rp_f, .rp_npat, TRUE)),',
    '  last_name = sample(.rp_last, .rp_npat, TRUE),',
    '  gender = .rp_gender,',
    '  birth_date = as.Date("1935-01-01") + sample(0:27000, .rp_npat, TRUE),',
    '  city = sample(.rp_city, .rp_npat, TRUE),',
    '  province_id = sample(province_names$province_id, .rp_npat, TRUE,',
    '                       prob = c(8,7,3,2,2,3,1,1,14,1,9,3,1)),',
    '  allergies = sample(c(.rp_allergy, NA, NA, NA, NA, NA), .rp_npat, TRUE),',
    '  height = as.integer(round(rnorm(.rp_npat, 170, 11))),',
    '  weight = as.integer(round(rnorm(.rp_npat, 76, 16))),',
    '  stringsAsFactors = FALSE',
    ')',
    '',
    '.rp_nadm <- 700L',
    '.rp_adate <- as.Date("2018-01-01") + sample(0:2200, .rp_nadm, TRUE)',
    'admissions <- data.frame(',
    '  patient_id = sample(patients$patient_id, .rp_nadm, TRUE),',
    '  admission_date = .rp_adate,',
    '  discharge_date = .rp_adate + sample(1:21, .rp_nadm, TRUE),',
    '  diagnosis = sample(.rp_diag, .rp_nadm, TRUE),',
    '  attending_doctor_id = sample(doctors$doctor_id, .rp_nadm, TRUE),',
    '  stringsAsFactors = FALSE',
    ')',
    'admissions <- admissions[order(admissions$admission_date, admissions$patient_id), ]',
    'rownames(admissions) <- NULL',
    ''
  ].join('\n');

  var HOSPITAL_TABLES = [
    {
      name: 'patients',
      rows: 400,
      note: 'One row per person registered at the hospital.',
      cols: [
        { name: 'patient_id',  type: 'integer' },
        { name: 'first_name',  type: 'character' },
        { name: 'last_name',   type: 'character' },
        { name: 'gender',      type: 'character' },
        { name: 'birth_date',  type: 'Date' },
        { name: 'city',        type: 'character' },
        { name: 'province_id', type: 'character' },
        { name: 'allergies',   type: 'character' },
        { name: 'height',      type: 'integer' },
        { name: 'weight',      type: 'integer' }
      ]
    },
    {
      name: 'admissions',
      rows: 700,
      note: 'One row per hospital stay. A patient can appear many times.',
      cols: [
        { name: 'patient_id',          type: 'integer' },
        { name: 'admission_date',      type: 'Date' },
        { name: 'discharge_date',      type: 'Date' },
        { name: 'diagnosis',           type: 'character' },
        { name: 'attending_doctor_id', type: 'integer' }
      ]
    },
    {
      name: 'doctors',
      rows: 30,
      note: 'Attending physicians.',
      cols: [
        { name: 'doctor_id',  type: 'integer' },
        { name: 'first_name', type: 'character' },
        { name: 'last_name',  type: 'character' },
        { name: 'specialty',  type: 'character' }
      ]
    },
    {
      name: 'province_names',
      rows: 13,
      note: 'Lookup table for province codes.',
      cols: [
        { name: 'province_id',   type: 'character' },
        { name: 'province_name', type: 'character' }
      ]
    }
  ];

  var RESOURCES = [
    {
      group: 'R Basics',
      items: [
        { name: 'Assignment', blurb: 'Give a value a name. <- is the conventional operator; = also works.',
          code: 'x <- 10\nname <- "patients"\nx' },
        { name: 'Vectors', blurb: 'A one-dimensional sequence of values of a single type.',
          code: 'v <- c(3, 1, 4, 1, 5)\nlength(v)\nv[2]\nv[v > 2]' },
        { name: 'Data frames', blurb: 'A table. Columns are vectors; each column has one type.',
          code: 'nrow(patients)\nncol(patients)\nnames(patients)\nstr(patients)' },
        { name: 'Pull one column', blurb: '$ returns the column as a vector. [ ] with one name returns a one-column data frame.',
          code: 'patients$city          # vector\npatients["city"]       # data frame' },
        { name: 'head and tail', blurb: 'Look at the first or last rows without printing everything.',
          code: 'head(patients)\nhead(patients, 3)\ntail(admissions, 5)' },
        { name: 'The pipe', blurb: '|> passes the value on its left into the first argument on its right. Base R, 4.1 and later.',
          code: 'patients |> head(3)\npatients$height |> mean() |> round(1)' },
        { name: 'Packages', blurb: 'library() attaches an installed package for the rest of the session.',
          code: 'library(dplyr)\n# then: filter(), mutate(), summarise(), ...' }
      ]
    },
    {
      group: 'Selecting and filtering',
      items: [
        { name: 'Pick columns', blurb: 'Give [ ] a character vector of column names after the comma.',
          code: 'patients[, c("first_name", "last_name")]' },
        { name: 'Pick rows', blurb: 'Give [ ] a logical vector before the comma.',
          code: 'patients[patients$gender == "M", ]' },
        { name: 'Rows and columns together', blurb: 'Both at once. drop = FALSE keeps a single column as a data frame.',
          code: 'patients[patients$city == "Toronto", c("first_name", "city")]' },
        { name: 'subset()', blurb: 'A convenience wrapper. Column names are looked up inside the data frame.',
          code: 'subset(patients, weight > 100, select = c(first_name, weight))' },
        { name: '%in%', blurb: 'Test membership against several values at once.',
          code: 'patients[patients$province_id %in% c("ON", "QC"), ]' },
        { name: 'Logical operators', blurb: '& is and, | is or, ! is not. Use the single forms on vectors.',
          code: 'patients[patients$height > 180 & patients$gender == "F", ]' },
        { name: 'which()', blurb: 'Turn a logical vector into the positions that are TRUE.',
          code: 'which(patients$weight > 120)\nwhich.max(patients$height)' },
        { name: 'unique() and duplicated()', blurb: 'Distinct values, and a flag for repeats.',
          code: 'unique(patients$city)\nlength(unique(admissions$patient_id))' },
        { name: 'order() and sort()', blurb: 'sort() returns sorted values; order() returns the row order to use in [ ].',
          code: 'patients[order(patients$height, decreasing = TRUE), ]\npatients[order(patients$last_name, patients$first_name), ]' }
      ]
    },
    {
      group: 'Summarising',
      items: [
        { name: 'Single numbers', blurb: 'The common summaries. na.rm = TRUE drops missing values first.',
          code: 'mean(patients$height)\nmedian(patients$weight)\nsd(patients$height)\nrange(patients$weight)' },
        { name: 'table()', blurb: 'Count rows per category. Two arguments gives a cross-tabulation.',
          code: 'table(patients$gender)\ntable(patients$province_id, patients$gender)' },
        { name: 'as.data.frame(table())', blurb: 'Turn counts back into a tidy two-column table.',
          code: 'as.data.frame(table(patients$city), stringsAsFactors = FALSE)' },
        { name: 'aggregate()', blurb: 'Split by one or more grouping columns, then apply a function.',
          code: 'aggregate(height ~ gender, data = patients, FUN = mean)\naggregate(cbind(height, weight) ~ province_id, patients, mean)' },
        { name: 'tapply()', blurb: 'Apply a function to a vector split by a factor.',
          code: 'tapply(patients$weight, patients$gender, mean)' },
        { name: 'summary()', blurb: 'A quick five-number summary of every column.',
          code: 'summary(patients$height)\nsummary(patients)' },
        { name: 'cumulative functions', blurb: 'Running totals and extremes.',
          code: 'cumsum(1:5)\ncummax(c(2, 9, 4, 11))' }
      ]
    },
    {
      group: 'dplyr',
      items: [
        { name: 'filter()', blurb: 'Keep rows matching a condition. Commas separate conditions joined by and.',
          code: 'library(dplyr)\npatients |> filter(gender == "M", height > 180)' },
        { name: 'select()', blurb: 'Keep, drop or reorder columns. Bare names, no quotes.',
          code: 'patients |> select(first_name, last_name, city)\npatients |> select(-allergies)' },
        { name: 'arrange()', blurb: 'Sort rows. desc() reverses one column.',
          code: 'patients |> arrange(desc(weight), last_name)' },
        { name: 'mutate()', blurb: 'Add or replace a column, computed from the others.',
          code: 'patients |> mutate(bmi = round(weight / (height / 100)^2, 1))' },
        { name: 'summarise()', blurb: 'Collapse rows to one summary row, or one per group.',
          code: 'patients |> summarise(n = n(), avg_h = mean(height))' },
        { name: 'group_by()', blurb: 'Set the grouping that summarise() and mutate() respect.',
          code: 'patients |> group_by(province_id) |> summarise(n = n()) |> arrange(desc(n))' },
        { name: 'count()', blurb: 'group_by plus tally, in one call. sort = TRUE orders by frequency.',
          code: 'patients |> count(city, sort = TRUE)' },
        { name: 'distinct()', blurb: 'Unique rows, optionally over chosen columns.',
          code: 'admissions |> distinct(diagnosis)' },
        { name: 'slice_max() and slice_head()', blurb: 'Take the top rows by value or by position.',
          code: 'patients |> slice_max(height, n = 5)\npatients |> slice_head(n = 3)' },
        { name: 'rename() and relocate()', blurb: 'Change a column name or move a column.',
          code: 'patients |> rename(province = province_id)\npatients |> relocate(city, .before = first_name)' }
      ]
    },
    {
      group: 'Joins',
      items: [
        { name: 'merge()', blurb: 'Base R join. by names the key; all.x = TRUE makes it a left join.',
          code: 'merge(patients, province_names, by = "province_id")' },
        { name: 'Left join', blurb: 'Keep every row on the left, fill NA where the right has no match.',
          code: 'merge(patients, province_names, by = "province_id", all.x = TRUE)' },
        { name: 'Different key names', blurb: 'by.x and by.y when the columns are not named the same.',
          code: 'merge(admissions, doctors,\n      by.x = "attending_doctor_id", by.y = "doctor_id")' },
        { name: 'dplyr joins', blurb: 'Same idea, explicit names, and the row order of the left table is kept.',
          code: 'library(dplyr)\npatients |> inner_join(province_names, by = "province_id")\nadmissions |> left_join(doctors, by = c("attending_doctor_id" = "doctor_id"))' },
        { name: 'Filtering joins', blurb: 'semi_join keeps matches, anti_join keeps rows with no match. Neither adds columns.',
          code: 'patients |> anti_join(admissions, by = "patient_id")' },
        { name: 'Stacking tables', blurb: 'rbind() needs identical columns; bind_rows() is more forgiving.',
          code: 'rbind(head(patients, 2), tail(patients, 2))' }
      ]
    },
    {
      group: 'Text',
      items: [
        { name: 'paste() and paste0()', blurb: 'Join strings. paste0 uses no separator.',
          code: 'paste(patients$first_name, patients$last_name)\npaste0(patients$last_name, ", ", patients$first_name)' },
        { name: 'nchar()', blurb: 'Number of characters in each string.',
          code: 'nchar(patients$last_name)' },
        { name: 'toupper() and tolower()', blurb: 'Change case.',
          code: 'toupper(patients$city)' },
        { name: 'substr()', blurb: 'Take a fixed slice of each string by position.',
          code: 'substr(patients$first_name, 1, 1)' },
        { name: 'grepl() and grep()', blurb: 'Pattern matching. grepl returns TRUE/FALSE, grep returns positions.',
          code: 'patients[grepl("^A", patients$first_name), ]\ngrepl("itis$", admissions$diagnosis)' },
        { name: 'sub() and gsub()', blurb: 'Replace the first match, or every match.',
          code: 'gsub(" ", "_", patients$city)' },
        { name: 'sprintf()', blurb: 'Format numbers and strings into a template.',
          code: 'sprintf("%s is %d cm", patients$first_name, patients$height)' },
        { name: 'trimws() and startsWith()', blurb: 'Strip surrounding whitespace; test a prefix.',
          code: 'startsWith(patients$city, "Van")' }
      ]
    },
    {
      group: 'Numbers',
      items: [
        { name: 'round(), floor(), ceiling()', blurb: 'Rounding. round() takes a number of digits.',
          code: 'round(72.456, 1)\nfloor(7.9)\nceiling(7.1)' },
        { name: 'abs(), sqrt(), exp(), log()', blurb: 'The usual maths functions, vectorised.',
          code: 'sqrt(144)\nlog(100, base = 10)' },
        { name: 'sum(), prod()', blurb: 'Totals and products across a vector.',
          code: 'sum(patients$weight)\nsum(patients$gender == "F")' },
        { name: 'min(), max(), pmin(), pmax()', blurb: 'The p-forms compare element by element across vectors.',
          code: 'max(patients$height)\npmax(c(1, 9), c(5, 2))' },
        { name: 'quantile()', blurb: 'Percentiles of a numeric vector.',
          code: 'quantile(patients$weight, c(0.25, 0.5, 0.75))' },
        { name: 'seq() and rep()', blurb: 'Build regular sequences and repeats.',
          code: 'seq(0, 100, by = 25)\nrep(c("a", "b"), times = 3)' }
      ]
    },
    {
      group: 'Dates',
      items: [
        { name: 'as.Date()', blurb: 'Turn text into a Date. The default format is YYYY-MM-DD.',
          code: 'as.Date("2021-07-14")\nas.Date("14/07/2021", format = "%d/%m/%Y")' },
        { name: 'format()', blurb: 'Pull a part of a date out as text. %Y year, %m month, %d day, %B month name.',
          code: 'format(patients$birth_date, "%Y")\nformat(Sys.Date(), "%B %Y")' },
        { name: 'Date arithmetic', blurb: 'Subtracting two Dates gives a difftime in days.',
          code: 'admissions$discharge_date - admissions$admission_date\nas.numeric(difftime(Sys.Date(), as.Date("2020-01-01"), units = "days"))' },
        { name: 'Sys.Date() and Sys.time()', blurb: 'Today, and now.',
          code: 'Sys.Date()' },
        { name: 'Year and month columns', blurb: 'format() returns text, so wrap it in as.integer() when you need a number.',
          code: 'as.integer(format(admissions$admission_date, "%Y"))' }
      ]
    },
    {
      group: 'Missing values',
      items: [
        { name: 'NA', blurb: 'The marker for a missing value. Any arithmetic on NA gives NA.',
          code: 'NA + 1\nmean(c(1, NA, 3))' },
        { name: 'is.na()', blurb: 'The only correct way to test for NA. == NA never works.',
          code: 'sum(is.na(patients$allergies))\npatients[is.na(patients$allergies), ]' },
        { name: 'na.rm = TRUE', blurb: 'Tell a summary function to ignore missing values.',
          code: 'mean(patients$height, na.rm = TRUE)' },
        { name: 'complete.cases()', blurb: 'TRUE for rows with no NA anywhere.',
          code: 'patients[complete.cases(patients), ]' },
        { name: 'ifelse()', blurb: 'Vectorised if. Useful for replacing NA with a label.',
          code: 'ifelse(is.na(patients$allergies), "None", patients$allergies)' }
      ]
    },
    {
      group: 'Apply family',
      items: [
        { name: 'sapply()', blurb: 'Apply a function to each element and simplify the result.',
          code: 'sapply(patients[, c("height", "weight")], mean)' },
        { name: 'lapply()', blurb: 'Same, but always returns a list.',
          code: 'lapply(patients[, c("height", "weight")], range)' },
        { name: 'apply()', blurb: 'Walk the rows (MARGIN = 1) or columns (MARGIN = 2) of a matrix.',
          code: 'apply(as.matrix(patients[, c("height", "weight")]), 2, max)' },
        { name: 'Map() and Reduce()', blurb: 'Element-wise over several vectors; fold a vector to one value.',
          code: 'Reduce(`+`, 1:5)' },
        { name: 'do.call()', blurb: 'Call a function with a list of arguments. Common with rbind.',
          code: 'do.call(rbind, list(head(patients, 1), tail(patients, 1)))' }
      ]
    },
    {
      group: 'Writing functions',
      items: [
        { name: 'function()', blurb: 'The last expression evaluated is the return value.',
          code: 'bmi <- function(w, h) round(w / (h / 100)^2, 1)\nbmi(80, 180)' },
        { name: 'Default arguments', blurb: 'Give a parameter a value to make it optional.',
          code: 'greet <- function(name, greeting = "Hello") paste0(greeting, ", ", name)\ngreet("Ada")' },
        { name: 'if and else', blurb: 'Branch on a single TRUE or FALSE, not a vector.',
          code: 'x <- 7\nif (x > 5) "big" else "small"' },
        { name: 'for loops', blurb: 'Useful, though a vectorised expression is usually shorter and faster.',
          code: 'total <- 0\nfor (v in 1:5) total <- total + v\ntotal' },
        { name: 'Factors', blurb: 'A categorical type with a fixed set of levels.',
          code: 'f <- factor(patients$gender)\nlevels(f)\ntable(f)' },
        { name: 'cut()', blurb: 'Bin a numeric vector into labelled ranges.',
          code: 'cut(patients$height, breaks = c(0, 160, 180, Inf),\n    labels = c("short", "medium", "tall"))' }
      ]
    }
  ];

  window.RP_DATA = {
    datasets: {
      hospital: {
        label: 'hospital',
        setup: HOSPITAL_SETUP,
        tables: HOSPITAL_TABLES
      }
    },
    resources: RESOURCES
  };
})();
