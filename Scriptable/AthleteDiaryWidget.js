// ============================================================
// AthleteDiaryWidget.js — Scriptable Widget for Athlete Diary
//
// HOW TO SET UP (one-time, ~2 minutes):
//   1. Install "Scriptable" from the App Store (free).
//   2. Open Scriptable → tap the "+" button.
//   3. Paste the entire contents of THIS file.
//   4. Name the script "AthleteDiaryWidget".
//   5. Log a session in Athlete Diary to generate your widget URL.
//   6. In the Athlete Diary app, tap the ⊞ grid icon on the home
//      screen → Widget Setup → press SYNC NOW → copy the URL.
//   7. Paste that URL below where it says DATA_URL.
//   8. On your Home Screen, long-press → Add Widget → Scriptable.
//   9. Pick small/medium/large → select "AthleteDiaryWidget".
//
// TAPPING THE WIDGET:
//   Tapping any widget opens the Log Session screen directly.
//   For Expo Go, just make sure the app is running in the
//   background first (Metro server must be active).
//
// ============================================================

// ── ⚙️  CONFIG — paste your URL here ──────────────────────────
const DATA_URL = "PASTE_YOUR_DATA_URL_HERE";
// ─────────────────────────────────────────────────────────────

// ── Colour palette (matches the app exactly) ─────────────────
const C = {
  black:    new Color("#000000"),
  yellow:   new Color("#FFE500"),
  white:    new Color("#FFFFFF"),
  grey:     new Color("#333333"),
  red:      new Color("#EF4444"),
  orange:   new Color("#F97316"),
  green:    new Color("#22C55E"),
  greenLt:  new Color("#86EFAC"),
  empty:    new Color("#EBEBEB"),
};

// ── Mood → fill colour ────────────────────────────────────────
function moodColor(level) {
  switch (level) {
    case 5: return C.green;
    case 4: return C.greenLt;
    case 3: return C.orange;
    case 2: return C.red;
    case 1: return C.red;
    default: return C.empty;
  }
}

// ── Performance label ─────────────────────────────────────────
function perfLabel(p) {
  const map = { 1:"POOR", 2:"BELOW AVG", 3:"AVERAGE", 4:"GOOD", 5:"PEAK" };
  return map[p] || "—";
}

// ── Sport emoji ───────────────────────────────────────────────
function sportEmoji(sport) {
  const map = {
    running:"🏃", gym:"🏋️", cycling:"🚴", swimming:"🏊",
    football:"⚽️", basketball:"🏀", other:"🎯",
  };
  return map[sport] || "🏃";
}

// ── Helper: add a perfectly centred text row to a stack ───────
// This is the ONLY reliable way to centre content in Scriptable.
// Each text element lives in its own horizontal centred container.
function addCentredText(parent, text, font, color, opacity) {
  const row = parent.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();
  row.addSpacer();          // flex-grow left
  const t = row.addText(text);
  t.font   = font;
  t.textColor = color;
  if (opacity !== undefined) t.textOpacity = opacity;
  t.centerAlignText();
  row.addSpacer();          // flex-grow right
  return t;
}

// ── Fetch data ────────────────────────────────────────────────
async function fetchData() {
  if (DATA_URL === "PASTE_YOUR_DATA_URL_HERE") return null;
  try {
    const req = new Request(DATA_URL);
    req.timeoutInterval = 5;
    return await req.loadJSON();
  } catch (e) {
    return null;
  }
}

// =============================================================
// WIDGET #1 — PURE FIRE (Small)
// Black background · centred flame · large yellow streak number
// =============================================================
function buildSmallPureFire(data, w) {
  w.backgroundColor = C.black;
  w.setPadding(0, 0, 0, 0);  // remove all padding — spacers handle it

  const col = w.addStack();
  col.layoutVertically();
  col.centerAlignContent();

  // Push content to vertical centre
  col.addSpacer();

  // 🔥 flame — centred
  addCentredText(col, "🔥", Font.systemFont(30), C.white);

  col.addSpacer(4);

  // Streak number — centred, scales down for very large numbers
  const numEl = addCentredText(
    col,
    data ? String(data.streak) : "–",
    Font.boldSystemFont(54),
    C.yellow,
  );
  numEl.minimumScaleFactor = 0.4;
  numEl.lineLimit = 1;

  col.addSpacer(4);

  // "DAY STREAK" label — centred, dimmed
  addCentredText(col, "DAY STREAK", Font.boldSystemFont(9), C.yellow, 0.7);

  // Push content to vertical centre
  col.addSpacer();

  return w;
}

// =============================================================
// WIDGET #2 — QUICK ACTION (Small)
// Yellow background · streak pill · LOG SESSION button
// =============================================================
function buildSmallQuickAction(data, w) {
  w.backgroundColor = C.yellow;
  w.setPadding(14, 14, 14, 14);

  // Streak pill
  const pill = w.addStack();
  pill.backgroundColor = C.black;
  pill.cornerRadius = 100;
  pill.setPadding(4, 10, 4, 10);
  pill.layoutHorizontally();
  pill.centerAlignContent();

  const fireT = pill.addText("🔥 ");
  fireT.font   = Font.boldSystemFont(11);
  const streakT = pill.addText(data ? String(data.streak) : "–");
  streakT.font      = Font.boldSystemFont(12);
  streakT.textColor = C.yellow;

  w.addSpacer();

  // LOG SESSION button
  const btn = w.addStack();
  btn.backgroundColor = C.black;
  btn.cornerRadius = 14;
  btn.setPadding(0, 0, 0, 0);
  btn.size = new Size(0, 56);
  btn.centerAlignContent();

  const btnTxt = btn.addStack();
  btnTxt.addSpacer();
  const btnLabel = btnTxt.addText("+ LOG SESSION");
  btnLabel.font      = Font.boldSystemFont(10);
  btnLabel.textColor = C.yellow;
  btnLabel.centerAlignText();
  btnTxt.addSpacer();

  return w;
}

// =============================================================
// WIDGET #3 — LAST SESSION RECAP (Small)
// White background · sport icon · performance dot · details
// =============================================================
function buildSmallLastSession(data, w) {
  w.backgroundColor = C.white;
  w.setPadding(16, 16, 16, 16);

  const ls = data?.lastSession;

  const title = w.addText("LAST SESSION");
  title.font      = Font.boldSystemFont(8);
  title.textColor = new Color("#BBBBBB");

  w.addSpacer();

  // Sport icon box
  const iconRow = w.addStack();
  iconRow.layoutHorizontally();
  const iconBox = iconRow.addStack();
  iconBox.backgroundColor = C.black;
  iconBox.cornerRadius = 12;
  iconBox.size = new Size(44, 44);
  iconBox.centerAlignContent();
  const emojiT = iconBox.addText(ls ? sportEmoji(ls.sport) : "–");
  emojiT.font = Font.systemFont(22);
  emojiT.centerAlignText();

  w.addSpacer();

  // Performance dot + label
  const perf = w.addStack();
  perf.layoutHorizontally();
  perf.centerAlignContent();
  const dot = perf.addStack();
  dot.size = new Size(8, 8);
  dot.backgroundColor = ls ? moodColor(ls.performance) : C.empty;
  dot.cornerRadius = 4;
  perf.addSpacer(6);
  const perfT = perf.addText(ls ? perfLabel(ls.performance) : "–");
  perfT.font      = Font.boldSystemFont(10);
  perfT.textColor = new Color("#000000");

  const sub = w.addText(ls ? `${ls.date} · ${ls.sport}` : "No sessions yet");
  sub.font      = Font.systemFont(9);
  sub.textColor = new Color("#888888");
  sub.minimumScaleFactor = 0.6;

  return w;
}

// =============================================================
// WIDGET #4 — MOOD RING (Small)
// Black background · streak · weekly mood dots
// =============================================================
function buildSmallMoodRing(data, w) {
  w.backgroundColor = C.black;
  w.setPadding(16, 16, 16, 16);

  const title = w.addText("WEEKLY MOOD");
  title.font      = Font.boldSystemFont(8);
  title.textColor = new Color("#666666");

  w.addSpacer(8);

  const streakT = w.addText("🔥 " + (data ? String(data.streak) : "–"));
  streakT.font      = Font.boldSystemFont(20);
  streakT.textColor = C.white;

  w.addSpacer();

  // 7 mood dots
  const dots = w.addStack();
  dots.layoutHorizontally();
  dots.spacing = 5;
  const moods = data?.weeklyMoods ?? Array(7).fill(0);
  for (const m of moods) {
    const dot = dots.addStack();
    dot.size = new Size(12, 12);
    dot.backgroundColor = moodColor(m);
    dot.cornerRadius = 6;
  }

  w.addSpacer(2);

  // Day labels
  const dayRow = w.addStack();
  dayRow.layoutHorizontally();
  dayRow.spacing = 3;
  for (const d of ["M","T","W","T","F","S","S"]) {
    const dl = dayRow.addText(d);
    dl.font      = Font.systemFont(7);
    dl.textColor = new Color("#555555");
  }

  return w;
}

// =============================================================
// WIDGET #5 — CONSISTENCY GRID (Medium)
// White background · streak · 28-day heatmap grid
// =============================================================
function buildMediumConsistencyGrid(data, w) {
  w.backgroundColor = C.white;
  w.setPadding(16, 16, 16, 16);

  const row = w.addStack();
  row.layoutHorizontally();
  row.spacing = 12;

  // Left column
  const left = row.addStack();
  left.layoutVertically();
  left.size = new Size(64, 0);

  const fireT = left.addText("🔥");
  fireT.font = Font.systemFont(16);

  const numT = left.addText(data ? String(data.streak) : "–");
  numT.font      = Font.boldSystemFont(26);
  numT.textColor = C.black;
  numT.minimumScaleFactor = 0.5;

  left.addSpacer();

  const btn = left.addStack();
  btn.backgroundColor = C.black;
  btn.cornerRadius = 8;
  btn.setPadding(6, 4, 6, 4);
  const btnT = btn.addText("+ LOG");
  btnT.font      = Font.boldSystemFont(9);
  btnT.textColor = C.yellow;
  btnT.centerAlignText();

  // Right: 4-week grid (7 cols × 4 rows = 28 cells)
  const right = row.addStack();
  right.layoutVertically();
  right.spacing = 4;

  const cells = data?.heatmapCells ?? Array(28).fill({ mood: 0 });
  for (let r = 0; r < 4; r++) {
    const gridRow = right.addStack();
    gridRow.layoutHorizontally();
    gridRow.spacing = 4;
    for (let c = 0; c < 7; c++) {
      const idx = r * 7 + c;
      const cell = cells[idx] ?? { mood: 0 };
      const isToday = idx === cells.length - 1;

      const box = gridRow.addStack();
      box.size = new Size(20, 20);
      box.backgroundColor = moodColor(cell.mood);
      box.cornerRadius = 4;
      if (isToday) { box.borderColor = C.black; box.borderWidth = 2; }
    }
  }

  return w;
}

// =============================================================
// WIDGET — MACRO GRID (Large)
// White background · 12×7 full heatmap (84 cells)
// =============================================================
function buildLargeMacroGrid(data, w) {
  w.backgroundColor = C.white;
  w.setPadding(20, 20, 20, 20);

  // Header row
  const header = w.addStack();
  header.layoutHorizontally();
  header.centerAlignContent();

  const appName = header.addText("ATHLETE DIARY");
  appName.font      = Font.boldSystemFont(11);
  appName.textColor = new Color("#CCCCCC");

  header.addSpacer();

  // Streak pill
  const pill = header.addStack();
  pill.backgroundColor = C.black;
  pill.cornerRadius = 100;
  pill.setPadding(4, 10, 4, 10);
  pill.layoutHorizontally();
  pill.centerAlignContent();
  const pillFire = pill.addText("🔥 ");
  pillFire.font = Font.boldSystemFont(11);
  const pillNum = pill.addText(data ? String(data.streak) : "–");
  pillNum.font      = Font.boldSystemFont(12);
  pillNum.textColor = C.yellow;

  w.addSpacer(16);

  // 84-cell grid: pad the 28-day data to fill 84 slots
  const baseCells = data?.heatmapCells ?? [];
  const allCells  = [];
  for (let i = 0; i < 84; i++) {
    const offset = i - (84 - baseCells.length);
    allCells.push(offset >= 0 && offset < baseCells.length
      ? baseCells[offset]
      : { mood: 0 });
  }

  for (let r = 0; r < 7; r++) {
    const gridRow = w.addStack();
    gridRow.layoutHorizontally();
    gridRow.spacing = 4;

    for (let c = 0; c < 12; c++) {
      const idx   = r * 12 + c;
      const cell  = allCells[idx];
      const isToday = idx === allCells.length - 1;

      const box = gridRow.addStack();
      box.size  = new Size(0, 22);
      box.backgroundColor = moodColor(cell.mood);
      box.cornerRadius = 3;
      if (isToday) { box.borderColor = C.black; box.borderWidth = 2; }
    }

    if (r < 6) w.addSpacer(4);
  }

  return w;
}

// =============================================================
// WIDGET — SETUP SCREEN (shown when DATA_URL not yet configured)
// =============================================================
function buildSetupWidget(w) {
  w.backgroundColor = C.black;
  w.setPadding(0, 0, 0, 0);

  const col = w.addStack();
  col.layoutVertically();
  col.centerAlignContent();
  col.addSpacer();

  addCentredText(col, "⚙️", Font.systemFont(28), C.white);
  col.addSpacer(8);
  addCentredText(col, "SETUP NEEDED", Font.boldSystemFont(10), C.yellow);
  col.addSpacer(6);

  const row = col.addStack();
  row.layoutHorizontally();
  row.addSpacer();
  const hint = row.addText("Open Athlete Diary → ⊞ Widget tab");
  hint.font        = Font.systemFont(9);
  hint.textColor   = new Color("#888888");
  hint.centerAlignText();
  row.addSpacer();

  col.addSpacer();
  return w;
}

// =============================================================
// MAIN — route by widget family, attach the deep-link URL
// =============================================================
async function run() {
  const data = await fetchData();
  const size  = config.widgetFamily;
  let w = new ListWidget();

  // Setup screen if not yet configured
  if (DATA_URL === "PASTE_YOUR_DATA_URL_HERE") {
    buildSetupWidget(w);
    Script.setWidget(w);
    Script.complete();
    return;
  }

  switch (size) {
    case "small":
      // ← Change the function here to pick a different small widget:
      //   buildSmallPureFire | buildSmallQuickAction |
      //   buildSmallLastSession | buildSmallMoodRing
      buildSmallPureFire(data, w);
      break;
    case "medium":
      buildMediumConsistencyGrid(data, w);
      break;
    case "large":
      buildLargeMacroGrid(data, w);
      break;
    default:
      // In-app preview
      buildSmallPureFire(data, w);
  }

  // ── Deep-link: tap widget → open AthleteDiary at Log Session ─
  // athletediary://log is the standalone app's registered URL scheme.
  // Works on any WiFi, 5G, or offline — no laptop or Metro needed.
  w.url = data?.deepLinkUrl ?? "athletediary://log";

  // Refresh every 30 minutes
  const next = new Date();
  next.setMinutes(next.getMinutes() + 30);
  w.refreshAfterDate = next;

  Script.setWidget(w);

  // Comment out the line below once you add it to your Home Screen:
  await w.presentSmall();

  Script.complete();
}

await run();
