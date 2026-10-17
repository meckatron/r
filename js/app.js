/* R Practice — editor, R engine and grading.

   The R session runs entirely in the browser through webR (R compiled to
   WebAssembly). Answers are graded by value: the reference solution is
   evaluated in the same session and the two results are compared after
   normalising types, so a base R answer and a dplyr answer both pass. */

import { WebR } from 'https://webr.r-wasm.org/v0.4.2/webr.mjs';

const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const STORE_KEY    = 'rpractice.progress.v1';
const SETTINGS_KEY = 'rpractice.settings.v1';

/* ────────────────────────────── state ────────────────────────────── */

const state = {
  webR: null,
  shelter: null,
  ready: false,
  busy: false,
  dataset: 'hospital',
  questions: (window.RP_EXERCISES || []).map(function (q) {
    return Object.assign({}, q, {
      alternates: (window.RP_ALTERNATES || {})[q.id] || []
    });
  }),
  current: null,       // the question object being worked on
  hintsShown: 0,
  solutionShown: false,
  expectedCache: {},   // id -> {names, nrow, cols}
  lastResult: null,
  listDiff: 'easy',
  tidy: false
};

const settings = loadSettings();
const progress = loadProgress();

/* ────────────────────────── persistence ────────────────────────── */

function loadSettings() {
  const base = { theme: 'system', font: 16, rows: 100, autoCheck: true, wrap: false, sound: true };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? Object.assign(base, JSON.parse(raw)) : base;
  } catch (_) { return base; }
}

function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (_) {}
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return (obj && typeof obj === 'object') ? obj : {};
  } catch (_) { return {}; }
}

function saveProgress() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (_) {}
  renderProgress();
}

/* ─────────────────────────── small helpers ─────────────────────────── */

let toastTimer = null;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
}

/* ─────────────────────── success feedback ─────────────────────── */

/* sql-practice.com answers a correct query with a green banner over the
   question, a congratulation toast and a short chime. All three are built
   here in JS, so the feature needs no markup and no audio file of its own. */

let audioCtx = null;

function playDing() {
  if (!settings.sound) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const t = audioCtx.currentTime;
    const out = audioCtx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.2, t + 0.012);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
    out.connect(audioCtx.destination);

    /* Two sine partials a sixth apart, the upper one late and quieter, which is
       about the cheapest thing that still reads as a bell rather than a beep. */
    [[880, 0, 1], [1318.51, 0.07, 0.55]].forEach(function (spec) {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = spec[0];
      g.gain.value = spec[2];
      osc.connect(g);
      g.connect(out);
      osc.start(t + spec[1]);
      osc.stop(t + 0.95);
    });
  } catch (_) { /* no audio here; the banner and toast still show */ }
}

function ensureCelebrateStyles() {
  if ($('#winStyle')) return;
  const st = document.createElement('style');
  st.id = 'winStyle';
  st.textContent = [
    '.win-banner {',
    '  display: flex; align-items: center; gap: 6px;',
    '  margin: 0 10px 10px; padding: 12px 14px;',
    '  border: 1px solid var(--ok); border-radius: 6px;',
    '  background: color-mix(in srgb, var(--ok) 16%, var(--card));',
    '  color: var(--ok); font-size: 14px; font-weight: 600;',
    '  animation: win-pop .32s ease-out;',
    '}',
    '.win-banner > span { flex: 1; text-align: center; }',
    '.win-banner > button {',
    '  border: 0; background: transparent; color: inherit; cursor: pointer;',
    '  font-size: 13px; line-height: 1; padding: 3px 5px; border-radius: 4px; opacity: .6;',
    '}',
    '.win-banner > button:hover { opacity: 1; background: color-mix(in srgb, var(--ok) 22%, transparent); }',
    '.win-toast {',
    '  position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%);',
    '  min-width: 250px; max-width: min(420px, 92vw);',
    '  background: var(--ok); color: #fff; padding: 10px 18px;',
    '  border-radius: 8px; z-index: 110; box-shadow: 0 6px 20px rgba(0, 0, 0, .25);',
    '  animation: win-rise .3s ease-out;',
    '}',
    '.win-toast strong { display: block; font-size: 14px; }',
    '.win-toast span { font-size: 13px; opacity: .92; }',
    '.win-banner[hidden], .win-toast[hidden] { display: none; }',
    '@keyframes win-pop {',
    '  from { opacity: 0; transform: scale(.96) translateY(-4px); }',
    '  to   { opacity: 1; transform: none; }',
    '}',
    '@keyframes win-rise {',
    '  from { opacity: 0; transform: translate(-50%, 10px); }',
    '  to   { opacity: 1; transform: translate(-50%, 0); }',
    '}',
    '@media (prefers-reduced-motion: reduce) {',
    '  .win-banner, .win-toast { animation: none; }',
    '}'
  ].join('\n');
  document.head.appendChild(st);
}

/* Restart a CSS animation on an element that is already in the document. */
function replay(el) {
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
}

function paintSoundBtn(btn) {
  btn.textContent = settings.sound ? '\u{1F50A}' : '\u{1F507}';
  btn.title = settings.sound ? 'Sound on. Click to mute.' : 'Sound off. Click to unmute.';
  btn.setAttribute('aria-label', btn.title);
}

function showWinBanner() {
  let el = $('#winBanner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'winBanner';
    el.className = 'win-banner';
    el.setAttribute('role', 'status');

    const label = document.createElement('span');
    label.textContent = 'You Got The Answer Correct';

    const mute = document.createElement('button');
    mute.type = 'button';
    paintSoundBtn(mute);
    mute.addEventListener('click', () => {
      settings.sound = !settings.sound;
      saveSettings();
      paintSoundBtn(mute);
      if (settings.sound) playDing();
    });

    el.append(label, mute);
    const live = $('#qLive');
    if (live) live.insertBefore(el, live.firstChild);
    else $('#verdict').parentNode.insertBefore(el, $('#verdict'));
  }
  el.hidden = false;
  replay(el);
}

let winToastTimer = null;

function showWinToast() {
  let el = $('#winToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'winToast';
    el.className = 'win-toast';
    el.setAttribute('role', 'status');
    el.innerHTML = '<strong>You Got It Correct</strong>'
      + '<span>Congratulations on solving the question.</span>';
    document.body.appendChild(el);
  }
  el.hidden = false;
  replay(el);
  clearTimeout(winToastTimer);
  winToastTimer = setTimeout(() => { el.hidden = true; }, 3400);
}

function celebrate() {
  ensureCelebrateStyles();
  showWinBanner();
  showWinToast();
  playDing();
}

function hideCelebration() {
  const b = $('#winBanner');
  if (b) b.hidden = true;
  const t = $('#winToast');
  if (t) t.hidden = true;
}

function setStatus(text, stateName) {
  const el = $('#engineStatus');
  el.textContent = text;
  el.dataset.state = stateName;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* Convert webR's toJs() output into plain JavaScript values. */
function plain(o) {
  if (o === null || o === undefined) return null;
  if (Array.isArray(o)) return o.map(plain);
  if (typeof o !== 'object') return o;
  if (o.type === 'list' || o.type === 'object' || o.type === 'environment') {
    if (o.names && o.names.length) {
      const out = {};
      o.names.forEach((n, i) => { out[n] = plain(o.values[i]); });
      return out;
    }
    return (o.values || []).map(plain);
  }
  if ('values' in o) return o.values;
  return o;
}

/* ───────────────────────── R helper definitions ───────────────────────── */

const R_HELPERS = String.raw`
.rp_norm <- function(x) {
  syn <- FALSE
  if (is.data.frame(x)) {
    d <- as.data.frame(x, stringsAsFactors = FALSE)
  } else if (inherits(x, "table")) {
    if (length(dim(x)) == 2L) {
      m <- as.data.frame.matrix(x)
      d <- data.frame(name = rownames(x), m, check.names = FALSE, stringsAsFactors = FALSE)
    } else {
      d <- data.frame(name = names(x), value = as.vector(unname(x)), stringsAsFactors = FALSE)
    }
  } else if (is.matrix(x)) {
    d <- as.data.frame(x, stringsAsFactors = FALSE)
  } else if (is.null(x)) {
    d <- data.frame()
  } else if (is.atomic(x) && is.null(dim(x))) {
    if (!is.null(names(x))) {
      d <- data.frame(name = names(x), value = unname(x), stringsAsFactors = FALSE)
    } else {
      d <- data.frame(value = x, stringsAsFactors = FALSE)
      syn <- TRUE
    }
  } else if (is.list(x)) {
    d <- data.frame(
      name = if (is.null(names(x))) as.character(seq_along(x)) else names(x),
      value = vapply(x, function(e) paste(format(e), collapse = ", "), character(1)),
      stringsAsFactors = FALSE)
  } else {
    d <- data.frame(value = paste(format(x), collapse = " "), stringsAsFactors = FALSE)
    syn <- TRUE
  }
  if (ncol(d)) {
    for (j in seq_along(d)) {
      col <- d[[j]]
      if (is.factor(col)) d[[j]] <- as.character(col)
      else if (inherits(col, "Date")) d[[j]] <- format(col, "%Y-%m-%d")
      else if (inherits(col, "difftime")) d[[j]] <- as.numeric(col)
      else if (is.list(col)) d[[j]] <- vapply(col, function(e) paste(format(e), collapse = ", "), character(1))
    }
  }
  rownames(d) <- NULL
  attr(d, "rp_syn") <- syn
  d
}

.rp_cells <- function(x) {
  d <- .rp_norm(x)
  cols <- lapply(d, function(col) {
    s <- if (is.numeric(col)) format(col, trim = TRUE, scientific = FALSE, digits = 7)
         else as.character(col)
    s[is.na(col)] <- NA_character_
    s
  })
  names(cols) <- names(d)
  list(names = as.character(names(d)), nrow = nrow(d), cols = cols)
}

.rp_cmp <- function(user, expect, ordered) {
  u <- .rp_norm(user)
  e <- .rp_norm(expect)
  # TRUE when the normaliser invented the single column name, which it does for a
  # bare vector or a scalar. There is then no name the learner chose, so names are
  # not compared and differences are reported as values rather than as a column.
  syn <- isTRUE(attr(u, "rp_syn")) || isTRUE(attr(e, "rp_syn"))
  if (ncol(u) != ncol(e))
    return(sprintf("Your result has %d column(s) but %d %s expected.",
                   ncol(u), ncol(e), if (ncol(e) == 1) "was" else "were"))
  if (!syn && !identical(names(u), names(e)))
    return(sprintf("The column names do not match. Expected: %s. You returned: %s.",
                   paste(names(e), collapse = ", "), paste(names(u), collapse = ", ")))
  if (nrow(u) != nrow(e))
    return(sprintf("Your result has %d row(s) but %d %s expected.",
                   nrow(u), nrow(e), if (nrow(e) == 1) "was" else "were"))
  if (ncol(e) == 0L) return("")
  names(u) <- names(e)
  if (!isTRUE(ordered) && nrow(e) > 0L) {
    u <- u[do.call(order, lapply(u, as.character)), , drop = FALSE]
    e <- e[do.call(order, lapply(e, as.character)), , drop = FALSE]
  }
  for (j in seq_along(e)) {
    a <- u[[j]]; b <- e[[j]]
    if (is.numeric(a) && is.numeric(b)) {
      bad <- which(!((abs(a - b) < 1e-8) %in% TRUE | (is.na(a) & is.na(b))))
    } else {
      a <- as.character(a); b <- as.character(b)
      bad <- which(!((a == b) %in% TRUE | (is.na(a) & is.na(b))))
    }
    if (length(bad)) {
      i <- bad[1]
      want <- if (is.na(b[i])) "NA" else paste0("'", format(b[i], trim = TRUE), "'")
      got  <- if (is.na(a[i])) "NA" else paste0("'", format(a[i], trim = TRUE), "'")
      if (syn && nrow(e) == 1L)
        return(sprintf("Expected %s but your code returned %s.", want, got))
      if (syn)
        return(sprintf("The values do not match. At position %d the expected value is %s but yours is %s.",
                       i, want, got))
      return(sprintf("Column '%s' does not match. In row %d the expected value is %s but yours is %s.",
                     names(e)[j], i, want, got))
    }
  }
  ""
}
`;

/* ─────────────────────────── engine ─────────────────────────── */

async function bootEngine() {
  setStatus('Starting R…', 'boot');
  const webR = new WebR({ interactive: false });
  state.webR = webR;
  await webR.init();

  setStatus('Loading data…', 'boot');
  await webR.evalRVoid('options(stringsAsFactors = FALSE, warn = 1, digits = 7)');
  await webR.evalRVoid(window.RP_DATA.datasets[state.dataset].setup);
  await webR.evalRVoid(R_HELPERS);

  state.shelter = await new webR.Shelter();
  state.ready = true;
  setStatus('R ready', 'ready');
  $('#runBtn').disabled = false;
}

/* Run arbitrary R code. Returns {error, parts, cells}.

   webR reports an R error by writing it to the captured stderr stream and
   handing back a NULL result, rather than by throwing, so the stream has to be
   inspected. Warnings also arrive on stderr, so only lines that actually begin
   with "Error" count as a failure. */
async function runR(code) {
  const sh = state.shelter;
  let cap;
  try {
    cap = await sh.captureR(code, {
      withAutoprint: true,
      captureStreams: true,
      captureConditions: false
    });
  } catch (err) {
    return { error: cleanRError(err), parts: [], cells: null };
  }

  const parts = (cap.output || []).map((o) => ({
    type: o.type === 'stderr' ? 'stderr' : 'stdout',
    data: String(o.data)
  }));

  const errText = parts
    .filter((p) => p.type === 'stderr' && /^\s*Error\b/.test(p.data))
    .map((p) => p.data)
    .join('\n')
    .trim();

  if (errText) {
    try { await sh.purge(); } catch (_) {}
    return { error: errText, parts, cells: null };
  }

  let cells = null;
  try {
    await state.webR.objs.globalEnv.bind('.rp_user', cap.result);
    const obj = await state.webR.evalR('.rp_cells(.rp_user)');
    cells = plain(await obj.toJs());
    state.webR.destroy(obj);
  } catch (_) { /* a value we cannot tabulate; the printed output still shows */ }

  try { await sh.purge(); } catch (_) {}
  return { error: null, parts, cells };
}

/* Paint the captured stdout/stderr into the console pane, marking stderr. */
function renderConsole(parts, fallback) {
  const host = $('#consoleOut');
  host.textContent = '';
  if (!parts || !parts.length) {
    host.textContent = fallback || '(no printed output)';
    return;
  }
  parts.forEach((p, i) => {
    const span = document.createElement('span');
    if (p.type === 'stderr') span.className = 'err';
    span.textContent = p.data + (i < parts.length - 1 ? '\n' : '');
    host.appendChild(span);
  });
}

function cleanRError(err) {
  let m = (err && err.message) ? err.message : String(err);
  m = m.replace(/^Error in .*?:\s*/, 'Error: ');
  if (!/^Error/.test(m)) m = 'Error: ' + m;
  return m.trim();
}

async function evalExpected(q) {
  if (state.expectedCache[q.id]) return state.expectedCache[q.id];
  await state.webR.evalRVoid('.rp_expect <- local({\n' + q.solution + '\n})');
  const obj = await state.webR.evalR('.rp_cells(.rp_expect)');
  const cells = plain(await obj.toJs());
  state.webR.destroy(obj);
  state.expectedCache[q.id] = cells;
  return cells;
}

async function gradeCurrent() {
  const q = state.current;
  if (!q) return;
  // .rp_expect may hold another question's result, so rebuild it for this one.
  await state.webR.evalRVoid('.rp_expect <- local({\n' + q.solution + '\n})');
  const obj = await state.webR.evalR(
    `.rp_cmp(.rp_user, .rp_expect, ${q.ordered ? 'TRUE' : 'FALSE'})`
  );
  const msg = (plain(await obj.toJs()) || [''])[0] || '';
  state.webR.destroy(obj);

  const v = $('#verdict');
  v.hidden = false;
  if (msg === '') {
    v.dataset.v = 'ok';
    v.innerHTML = '<strong>Correct</strong>Your result matches the expected output.';
    celebrate();
    if (!progress[q.id] || !progress[q.id].solved) {
      progress[q.id] = {
        solved: true,
        at: new Date().toISOString(),
        usedHint: state.hintsShown > 0,
        usedSolution: state.solutionShown
      };
      saveProgress();
    }
  } else {
    hideCelebration();
    v.dataset.v = 'bad';
    v.innerHTML = '<strong>Not quite</strong>' + esc(msg);
  }
  renderQuestionList();
}

/* ─────────────────────────── editor ─────────────────────────── */

let cm = null;

function initEditor() {
  cm = CodeMirror.fromTextArea($('#editor'), {
    mode: 'text/x-rsrc',
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    lineWrapping: settings.wrap,
    indentUnit: 2,
    tabSize: 2,
    extraKeys: {
      'Ctrl-Enter': run,
      'Cmd-Enter': run,
      'Ctrl-/': toggleComment,
      'Cmd-/': toggleComment
    }
  });

  cm.setValue(
    '# Welcome to R Practice.\n' +
    '#\n' +
    '# The data frames patients, admissions, doctors and province_names are\n' +
    '# already loaded. Press Start on the right to pick a question, write your\n' +
    '# answer here, and run it with Ctrl+Enter.\n' +
    '#\n' +
    '# Your answer is graded on the value your code returns, so base R and\n' +
    '# dplyr are equally acceptable.\n\n' +
    'head(patients)\n'
  );
  applyFontSize();
}

function toggleComment() {
  const from = cm.getCursor('from').line;
  const to = cm.getCursor('to').line;
  const lines = [];
  let allCommented = true;
  for (let i = from; i <= to; i++) {
    const t = cm.getLine(i);
    lines.push(t);
    if (t.trim() !== '' && !/^\s*#/.test(t)) allCommented = false;
  }
  for (let i = from; i <= to; i++) {
    const t = lines[i - from];
    cm.replaceRange(
      allCommented ? t.replace(/^(\s*)#\s?/, '$1') : t.replace(/^(\s*)/, '$1# '),
      { line: i, ch: 0 },
      { line: i, ch: t.length }
    );
  }
}

function applyFontSize() {
  document.documentElement.style.setProperty('--editor-font', settings.font + 'px');
  if (cm) cm.refresh();
}

/* ─────────────────────────── running ─────────────────────────── */

async function run() {
  if (!state.ready || state.busy) return;
  state.busy = true;
  setStatus('Running…', 'busy');
  $('#runBtn').disabled = true;
  $('#outputStatus').textContent = '';
  hideCelebration();

  const code = cm.getValue();
  const t0 = performance.now();
  const res = await runR(code);
  const ms = Math.round(performance.now() - t0);

  if (res.error) {
    renderConsole(res.parts, res.error);
    if (!res.parts || !res.parts.length) {
      const span = document.createElement('span');
      span.className = 'err';
      span.textContent = res.error;
      $('#consoleOut').appendChild(span);
    }
    showOutputTab('console');
    $('#resultTable').innerHTML = '';
    $('#resultPlaceholder').hidden = false;
    $('#outputStatus').textContent = 'error · ' + ms + ' ms';
    const v = $('#verdict');
    if (state.current) {
      v.hidden = false;
      v.dataset.v = 'info';
      v.innerHTML = '<strong>Your code did not run</strong>Fix the error shown in the Console tab, then run again.';
    }
  } else {
    renderConsole(res.parts);
    state.lastResult = res.cells;
    renderResult(res.cells);
    showOutputTab('result');
    const n = res.cells ? (Array.isArray(res.cells.nrow) ? res.cells.nrow[0] : res.cells.nrow) : 0;
    $('#outputStatus').textContent = n + (n === 1 ? ' row · ' : ' rows · ') + ms + ' ms';

    if (state.current && settings.autoCheck) {
      try { await gradeCurrent(); }
      catch (e) {
        const v = $('#verdict');
        v.hidden = false;
        v.dataset.v = 'info';
        v.innerHTML = '<strong>Could not check this answer</strong>' + esc(cleanRError(e));
      }
    }
  }

  setStatus('R ready', 'ready');
  $('#runBtn').disabled = false;
  state.busy = false;
}

/* ─────────────────────────── tables ─────────────────────────── */

function renderResult(cells) {
  const host = $('#resultTable');
  host.innerHTML = '';
  if (!cells || !cells.names || !cells.names.length) {
    $('#resultPlaceholder').hidden = false;
    return;
  }
  $('#resultPlaceholder').hidden = true;
  host.appendChild(buildTable(cells, 'result'));
}

const pagerState = {};

function buildTable(cells, key) {
  const names = cells.names || [];
  const nrow = Array.isArray(cells.nrow) ? cells.nrow[0] : (cells.nrow || 0);
  const per = settings.rows;
  const pages = Math.max(1, Math.ceil(nrow / per));
  if (!pagerState[key] || pagerState[key].sig !== key + nrow + names.join()) {
    pagerState[key] = { page: 1, sig: key + nrow + names.join() };
  }
  const page = Math.min(pagerState[key].page, pages);
  pagerState[key].page = page;

  const start = (page - 1) * per;
  const end = Math.min(nrow, start + per);

  const frag = document.createElement('div');

  const wrap = document.createElement('div');
  wrap.className = 'dt-wrap';
  const table = document.createElement('table');
  table.className = 'dt';

  const thead = document.createElement('thead');
  const hr = document.createElement('tr');
  const corner = document.createElement('th');
  corner.textContent = '';
  hr.appendChild(corner);
  names.forEach((n) => {
    const th = document.createElement('th');
    th.textContent = n;
    hr.appendChild(th);
  });
  thead.appendChild(hr);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (let i = start; i < end; i++) {
    const tr = document.createElement('tr');
    const rn = document.createElement('td');
    rn.className = 'rownum';
    rn.textContent = String(i + 1);
    tr.appendChild(rn);
    names.forEach((n) => {
      const td = document.createElement('td');
      const col = cells.cols ? cells.cols[n] : null;
      const val = col ? col[i] : null;
      if (val === null || val === undefined) {
        td.textContent = 'NA';
        td.className = 'na';
      } else {
        td.textContent = val;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  wrap.appendChild(table);
  frag.appendChild(wrap);

  const foot = document.createElement('div');
  foot.className = 'dt-foot';
  foot.appendChild(document.createTextNode(
    nrow === 0
      ? 'No rows'
      : 'Showing ' + (start + 1) + ' to ' + end + ' of ' + nrow + ' row' + (nrow === 1 ? '' : 's')
  ));

  if (pages > 1) {
    const pager = document.createElement('div');
    pager.className = 'pager';
    const mk = (label, target, disabled, active) => {
      const b = document.createElement('button');
      b.textContent = label;
      if (disabled) b.disabled = true;
      if (active) b.className = 'is-active';
      b.addEventListener('click', () => {
        pagerState[key].page = target;
        const parent = frag.parentNode;
        const fresh = buildTable(cells, key);
        parent.replaceChild(fresh, frag);
      });
      return b;
    };
    pager.appendChild(mk('Prev', page - 1, page === 1, false));
    const nums = [];
    for (let p = 1; p <= pages; p++) {
      if (p === 1 || p === pages || Math.abs(p - page) <= 2) nums.push(p);
      else if (nums[nums.length - 1] !== '…') nums.push('…');
    }
    nums.forEach((p) => {
      if (p === '…') {
        const s = document.createElement('button');
        s.textContent = '…';
        s.disabled = true;
        pager.appendChild(s);
      } else {
        pager.appendChild(mk(String(p), p, false, p === page));
      }
    });
    pager.appendChild(mk('Next', page + 1, page === pages, false));
    foot.appendChild(pager);
  }

  frag.appendChild(foot);
  return frag;
}

/* ─────────────────────────── questions ─────────────────────────── */

function questionsOf(diff) {
  return state.questions.filter((q) => q.d === diff);
}

async function loadQuestion(q) {
  state.current = q;
  state.hintsShown = 0;
  state.solutionShown = false;

  $('#qStart').hidden = true;
  $('#qLive').hidden = false;
  $('#verdict').hidden = true;
  hideCelebration();

  const list = questionsOf(q.d);
  const idx = list.indexOf(q);

  $('#qDiff').textContent = q.d;
  $('#qDiff').dataset.d = q.d;
  $('#qTopic').textContent = q.topic;
  $('#qNum').textContent = (idx + 1) + ' / ' + list.length;
  $('#qPrompt').innerHTML = q.prompt;

  $('#qTables').innerHTML = (q.tables || [])
    .map((name) => schemaBlock(name))
    .join('');

  renderHints();
  $('#qExpected').innerHTML = '<p class="muted">Computing expected output…</p>';

  try {
    const cells = await evalExpected(q);
    $('#qExpected').innerHTML = '';
    $('#qExpected').appendChild(buildTable(cells, 'expected-' + q.id));
  } catch (e) {
    $('#qExpected').innerHTML = '<p class="muted">Could not compute the expected output: '
      + esc(cleanRError(e)) + '</p>';
  }

  renderQuestionList();
}

function renderHints() {
  const q = state.current;
  const host = $('#qHints');
  host.innerHTML = '';
  if (state.hintsShown === 0) {
    host.innerHTML = '<p class="muted">No hints revealed yet. Press <strong>Get Hint</strong> above.</p>';
  }
  for (let i = 0; i < state.hintsShown && i < q.hints.length; i++) {
    const d = document.createElement('div');
    d.className = 'hint';
    d.innerHTML = '<strong>Hint ' + (i + 1) + '.</strong> ' + esc(q.hints[i]);
    host.appendChild(d);
  }
  if (state.solutionShown) host.appendChild(solutionBlock(q));
}

/* Where each way of writing the answer sits on a simplest-to-most-involved
   ramp. Entries arrive in that order already: the reference solution first,
   then the alternates as they are authored. With only one way on show there is
   nothing to rank against, so the caller leaves the ramp off entirely. */
function complexityChip(i, n) {
  const chip = document.createElement('span');
  chip.className = 'sol-rank';
  chip.title = 'Complexity ' + (i + 1) + ' of ' + n + ', simplest first';

  const bars = document.createElement('span');
  bars.className = 'sol-bars';
  for (let b = 0; b < n; b++) {
    const bar = document.createElement('i');
    if (b <= i) bar.className = 'on';
    bars.appendChild(bar);
  }

  chip.append(bars, document.createTextNode(
    i === 0 ? 'Simplest' : i === n - 1 ? 'Most involved' : 'More involved'
  ));
  return chip;
}

function ensureRankStyles() {
  if ($('#rankStyle')) return;
  const st = document.createElement('style');
  st.id = 'rankStyle';
  st.textContent = [
    '.sol-rank {',
    '  display: inline-flex; align-items: center; gap: 5px;',
    '  margin: 0 0 4px 6px; vertical-align: middle;',
    '  font: 400 11px/1 var(--font-ui); color: var(--fg-faint);',
    '}',
    '.sol-bars { display: inline-flex; align-items: flex-end; gap: 2px; height: 10px; }',
    '.sol-bars i { width: 3px; height: 4px; border-radius: 1px; background: var(--card-line); }',
    '.sol-bars i:nth-child(2) { height: 6px; }',
    '.sol-bars i:nth-child(3) { height: 8px; }',
    '.sol-bars i:nth-child(n+4) { height: 10px; }',
    '.sol-bars i.on { background: var(--accent); }'
  ].join('\n');
  document.head.appendChild(st);
}

/* The reference solution plus every alternate way of writing it. */
function solutionBlock(q) {
  ensureRankStyles();
  const wrap = document.createElement('div');
  wrap.className = 'sol';

  /* Entries are shown simplest first, which is NOT the order they are authored
     in: the reference has to be base R so grading needs no packages, and on the
     harder questions that makes it the most involved way of all. Each entry
     carries an explicit complexity rank, so the ramp reflects the code rather
     than the position in the array. */
  const entries = [{
    label: q.style || 'Base R',
    code: q.solution,
    note: 'The reference solution. This is what the expected output is built from.',
    complexity: (window.RP_REF_COMPLEXITY || {})[q.id] || 1
  }].concat(q.alternates || [])
    .map((e, i) => Object.assign({ _i: i }, e))
    .sort((a, b) => (a.complexity || 99) - (b.complexity || 99) || a._i - b._i);

  const head = document.createElement('div');
  head.className = 'sol-head';
  head.textContent = entries.length > 1
    ? 'Solutions (' + entries.length + ' ways)'
    : 'Solution';
  wrap.appendChild(head);

  entries.forEach((entry, i) => {
    const label = document.createElement('span');
    label.className = 'sol-label';
    label.textContent = entry.label;
    if (entry.needs) {
      const warn = document.createElement('span');
      warn.className = 'needs-pkg';
      warn.textContent = 'needs ' + entry.needs;
      label.appendChild(warn);
    }
    wrap.appendChild(label);
    if (entries.length > 1) wrap.appendChild(complexityChip(i, entries.length));

    const pre = document.createElement('pre');
    pre.textContent = entry.code;
    wrap.appendChild(pre);

    if (entry.note) {
      const note = document.createElement('p');
      note.className = 'sol-note';
      note.textContent = entry.note;
      wrap.appendChild(note);
    }

    const copy = document.createElement('button');
    copy.className = 'sol-copy';
    copy.textContent = 'Load into editor';
    copy.addEventListener('click', () => {
      cm.setValue(entry.code);
      cm.focus();
      toast('Loaded the ' + entry.label + ' version');
    });
    wrap.appendChild(copy);
  });

  return wrap;
}

function tableMarkup(t, interactive) {
  return '<div class="tbl">'
    + '<' + (interactive ? 'button' : 'div') + ' class="tbl-name"'
    + (interactive ? ' data-peek="' + esc(t.name) + '"' : '') + '>'
    + esc(t.name)
    + '<span class="dims">' + t.rows + ' &times; ' + t.cols.length + '</span>'
    + '</' + (interactive ? 'button' : 'div') + '>'
    + '<table class="db-table"><tbody>'
    + t.cols.map((c) => '<tr><td>' + esc(c.name) + '</td>'
        + '<td class="ctype">' + esc(c.type) + '</td></tr>').join('')
    + '</tbody></table></div>';
}

function schemaBlock(name) {
  const t = (window.RP_DATA.datasets[state.dataset].tables || [])
    .find((x) => x.name === name);
  return t ? tableMarkup(t, false) : '';
}

function renderQuestionList() {
  const host = $('#qList');
  const term = ($('#qSearch').value || '').toLowerCase().trim();
  const list = questionsOf(state.listDiff).filter((q) => {
    if (!term) return true;
    return (q.prompt + ' ' + q.topic + ' ' + q.id).toLowerCase().includes(term);
  });

  host.innerHTML = '';
  if (!list.length) {
    host.innerHTML = '<p class="empty-note">No questions match that filter.</p>';
    return;
  }

  list.forEach((q, i) => {
    const row = document.createElement('button');
    row.className = 'qrow' + (state.current && state.current.id === q.id ? ' is-current' : '');

    const done = progress[q.id] && progress[q.id].solved;
    const tick = document.createElement('span');
    tick.className = 'tick' + (done ? '' : ' empty');
    tick.textContent = done ? '✔' : '○';

    const idx = document.createElement('span');
    idx.className = 'idx';
    idx.textContent = String(questionsOf(q.d).indexOf(q) + 1);

    const txt = document.createElement('span');
    txt.className = 'qtxt';
    txt.innerHTML = q.prompt;

    const topic = document.createElement('span');
    topic.className = 'qtopic';
    topic.textContent = q.topic;

    row.append(tick, idx, txt, topic);
    row.addEventListener('click', async () => {
      closeModal($('#questionModal'));
      await loadQuestion(q);
    });
    host.appendChild(row);
  });
}

function renderProgress() {
  const total = state.questions.length;
  const done = state.questions.filter((q) => progress[q.id] && progress[q.id].solved).length;
  const byDiff = ['easy', 'medium', 'hard'].map((d) => {
    const qs = questionsOf(d);
    const n = qs.filter((q) => progress[q.id] && progress[q.id].solved).length;
    return '<div class="prog-line"><span>' + d + '</span><span>' + n + ' / ' + qs.length + '</span></div>';
  }).join('');

  $('#progressBox').innerHTML =
    '<div class="prog-line"><strong>' + done + ' of ' + total + ' solved</strong>'
    + '<span>' + Math.round(total ? (done / total) * 100 : 0) + '%</span></div>'
    + '<div class="bar"><span style="width:' + (total ? (done / total) * 100 : 0) + '%"></span></div>'
    + byDiff;
}

/* ─────────────────────────── left panel ─────────────────────────── */

function renderSchema() {
  const tables = window.RP_DATA.datasets[state.dataset].tables || [];
  $('#schemaList').innerHTML = tables.map((t) => tableMarkup(t, true)).join('');

  $$('#schemaList .tbl-name').forEach((el) => {
    el.addEventListener('click', () => {
      const name = el.dataset.peek;
      cm.replaceSelection('head(' + name + ')');
      cm.focus();
    });
  });
}

function renderResources() {
  const host = $('#resourceTree');
  host.innerHTML = (window.RP_DATA.resources || []).map((g) => (
    '<details class="res-group"><summary>' + esc(g.group) + '</summary>'
    + g.items.map((it, i) =>
        '<button class="res-item" data-g="' + esc(g.group) + '" data-i="' + i + '">'
        + esc(it.name) + '</button>').join('')
    + '<div class="res-slot"></div></details>'
  )).join('');

  $$('#resourceTree .res-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = (window.RP_DATA.resources || []).find((g) => g.group === btn.dataset.g);
      const item = group.items[Number(btn.dataset.i)];
      const slot = btn.closest('details').querySelector('.res-slot');
      slot.innerHTML =
        '<div class="res-detail"><strong>' + esc(item.name) + '</strong>'
        + '<p style="margin:4px 0 0">' + esc(item.blurb) + '</p>'
        + '<pre>' + esc(item.code) + '</pre>'
        + '<button class="btn btn-sm" data-insert>Insert into editor</button></div>';
      slot.querySelector('[data-insert]').addEventListener('click', () => {
        cm.replaceSelection(item.code + '\n');
        cm.focus();
        toast('Inserted example');
      });
    });
  });
}

/* ─────────────────────────── layout ─────────────────────────── */

function initGutters() {
  dragGutter($('#gutterLeft'), 'x', (dx, startW) => {
    const w = Math.min(520, Math.max(150, startW + dx));
    document.documentElement.style.setProperty('--left-w', w + 'px');
  }, () => $('#leftPanel').getBoundingClientRect().width);

  dragGutter($('#gutterRight'), 'x', (dx, startW) => {
    const w = Math.min(640, Math.max(200, startW - dx));
    document.documentElement.style.setProperty('--right-w', w + 'px');
  }, () => $('#rightPanel').getBoundingClientRect().width);

  dragGutter($('#gutterH'), 'y', (dy, startH) => {
    const h = Math.min(window.innerHeight - 220, Math.max(90, startH - dy));
    document.documentElement.style.setProperty('--out-h', h + 'px');
    if (cm) cm.refresh();
  }, () => $('#output').getBoundingClientRect().height);
}

function dragGutter(el, axis, apply, measure) {
  let startPos = 0, startSize = 0;

  const onMove = (ev) => {
    const p = axis === 'x' ? ev.clientX : ev.clientY;
    apply(p - startPos, startSize);
  };
  const onUp = () => {
    el.classList.remove('is-dragging');
    document.body.style.userSelect = '';
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    if (cm) cm.refresh();
  };

  el.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    startPos = axis === 'x' ? ev.clientX : ev.clientY;
    startSize = measure();
    el.classList.add('is-dragging');
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });

  el.addEventListener('keydown', (ev) => {
    const step = ev.shiftKey ? 40 : 12;
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') { apply(-step, measure()); ev.preventDefault(); }
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') { apply(step, measure()); ev.preventDefault(); }
  });
}

function showOutputTab(which) {
  $$('.otab').forEach((t) => t.classList.toggle('is-active', t.dataset.otab === which));
  $('#outPaneResult').hidden = which !== 'result';
  $('#outPaneConsole').hidden = which !== 'console';
}

function applyTheme() {
  const root = document.documentElement;
  if (settings.theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', settings.theme);
}

function openModal(el) { el.hidden = false; }
function closeModal(el) { el.hidden = true; }

/* ─────────────────────────── wiring ─────────────────────────── */

function wire() {
  $('#runBtn').addEventListener('click', run);
  $('#runBtn').disabled = true;

  $$('.otab').forEach((t) => t.addEventListener('click', () => showOutputTab(t.dataset.otab)));

  $$('[data-acc]').forEach((head) => {
    head.addEventListener('click', () => {
      const acc = head.closest('.box');
      acc.dataset.open = acc.dataset.open === 'true' ? 'false' : 'true';
    });
  });

  $('#toggleLeft').addEventListener('click', () => {
    $('#workspace').classList.toggle('no-left');
    if (cm) cm.refresh();
  });
  $('#toggleRight').addEventListener('click', () => {
    $('#workspace').classList.toggle('no-right');
    if (cm) cm.refresh();
  });

  $('#startBtn').addEventListener('click', async () => {
    const diff = $('#difficultySel').value;
    const list = questionsOf(diff);
    const next = list.find((q) => !(progress[q.id] && progress[q.id].solved)) || list[0];
    if (next) await loadQuestion(next);
  });

  const openQuestionList = () => {
    state.listDiff = state.current ? state.current.d : $('#difficultySel').value;
    $$('#qTabs .tab').forEach((t) => t.classList.toggle('is-active', t.dataset.diff === state.listDiff));
    renderQuestionList();
    openModal($('#questionModal'));
    $('#qSearch').focus();
  };
  $('#questionsBtn').addEventListener('click', openQuestionList);
  $('#questionsBtn2').addEventListener('click', openQuestionList);

  $('#aboutBtn').addEventListener('click', () => openModal($('#aboutModal')));

  $('#peekAllBtn').addEventListener('click', () => {
    const names = (window.RP_DATA.datasets[state.dataset].tables || []).map((t) => t.name);
    cm.setValue(names.map((n) => 'str(' + n + ')').join('\n') + '\n');
    cm.focus();
    run();
  });

  $$('#qTabs .tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      state.listDiff = tab.dataset.diff;
      $$('#qTabs .tab').forEach((t) => t.classList.toggle('is-active', t === tab));
      renderQuestionList();
    });
  });

  $('#qSearch').addEventListener('input', renderQuestionList);

  $('#hintBtn').addEventListener('click', () => {
    const q = state.current;
    if (!q) return;
    if (state.hintsShown >= q.hints.length) { toast('That was the last hint'); return; }
    state.hintsShown++;
    const acc = $('#qHints').closest('.box');
    acc.dataset.open = 'true';
    renderHints();
  });

  $('#solutionBtn').addEventListener('click', () => {
    if (!state.current) return;
    state.solutionShown = true;
    $('#qHints').closest('.box').dataset.open = 'true';
    renderHints();
  });

  $('#prevQBtn').addEventListener('click', async () => {
    const list = questionsOf(state.current.d);
    const i = list.indexOf(state.current);
    if (i > 0) await loadQuestion(list[i - 1]);
  });
  $('#nextQBtn').addEventListener('click', async () => {
    const list = questionsOf(state.current.d);
    const i = list.indexOf(state.current);
    if (i < list.length - 1) await loadQuestion(list[i + 1]);
  });

  $('#settingsBtn').addEventListener('click', () => openModal($('#settingsModal')));

  $$('[data-close]').forEach((b) =>
    b.addEventListener('click', () => closeModal(b.closest('.modal'))));

  $$('.modal').forEach((m) =>
    m.addEventListener('click', (ev) => { if (ev.target === m) closeModal(m); }));

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') $$('.modal').forEach((m) => closeModal(m));
  });

  /* settings */
  $('#setTheme').value = settings.theme;
  $('#setFont').value = String(settings.font);
  $('#setRows').value = String(settings.rows);
  $('#setAutoCheck').checked = settings.autoCheck;
  $('#setWrap').checked = settings.wrap;

  $('#setTheme').addEventListener('change', (e) => {
    settings.theme = e.target.value; saveSettings(); applyTheme();
  });
  $('#setFont').addEventListener('change', (e) => {
    settings.font = Number(e.target.value); saveSettings(); applyFontSize();
  });
  $('#setRows').addEventListener('change', (e) => {
    settings.rows = Number(e.target.value); saveSettings();
    if (state.lastResult) renderResult(state.lastResult);
  });
  $('#setAutoCheck').addEventListener('change', (e) => {
    settings.autoCheck = e.target.checked; saveSettings();
  });
  $('#setWrap').addEventListener('change', (e) => {
    settings.wrap = e.target.checked; saveSettings();
    if (cm) cm.setOption('lineWrapping', settings.wrap);
  });

  $('#loadTidyBtn').addEventListener('click', async () => {
    if (!state.ready || state.tidy) return;
    const btn = $('#loadTidyBtn');
    btn.disabled = true;
    $('#tidyStatus').textContent = 'downloading…';
    try {
      await state.webR.installPackages(['dplyr', 'tidyr']);
      await state.webR.evalRVoid('suppressMessages({library(dplyr); library(tidyr)})');
      state.tidy = true;
      $('#tidyStatus').textContent = 'ready';
      toast('dplyr and tidyr are loaded');
    } catch (e) {
      $('#tidyStatus').textContent = 'failed';
      btn.disabled = false;
      toast('Could not install the packages');
    }
  });

  /* progress import / export */
  $('#exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'r-practice-progress.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  });

  $('#importBtn').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result));
        if (!obj || typeof obj !== 'object') throw new Error('bad file');
        Object.keys(obj).forEach((k) => { progress[k] = obj[k]; });
        saveProgress();
        renderQuestionList();
        toast('Progress imported');
      } catch (_) {
        toast('That file is not a progress export');
      }
      ev.target.value = '';
    };
    reader.readAsText(file);
  });

  $('#resetBtn').addEventListener('click', () => {
    const btn = $('#resetBtn');
    if (btn.dataset.armed !== 'yes') {
      btn.dataset.armed = 'yes';
      btn.textContent = 'Really reset?';
      setTimeout(() => { btn.dataset.armed = 'no'; btn.textContent = 'Reset'; }, 4000);
      return;
    }
    Object.keys(progress).forEach((k) => delete progress[k]);
    saveProgress();
    renderQuestionList();
    btn.dataset.armed = 'no';
    btn.textContent = 'Reset';
    toast('Progress cleared');
  });
}

/* ─────────────────────────── start ─────────────────────────── */

applyTheme();
initEditor();
wire();
renderSchema();
renderResources();
renderProgress();
renderQuestionList();

bootEngine().catch((err) => {
  setStatus('R failed to start', 'error');
  $('#consoleOut').textContent =
    'The R engine could not start.\n\n' + cleanRError(err) +
    '\n\nwebR needs to be served over http. Open the site through the included ' +
    'server script rather than by double-clicking index.html.';
  showOutputTab('console');
});
