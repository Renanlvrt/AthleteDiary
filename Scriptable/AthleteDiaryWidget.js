// ============================================================
// AthleteDiaryWidget.js — Scriptable Widget for Athlete Diary
//
// HOW TO SET UP (one-time, ~2 minutes):
//   1. Install "Scriptable" from the App Store (free).
//   2. Open Scriptable → tap the "+" button.
//   3. Paste the entire contents of THIS file.
//   4. Name the script "AthleteDiaryWidget".
//   5. Log a session in Athlete Diary to generate your widget URL.
//   6. In the Athlete Diary app, go to the Widget tab to copy
//      your personal DATA_URL (looks like jsonblob.com/api/...).
//   7. Paste that URL below where it says DATA_URL.
//   8. On your Home Screen, long-press → Add Widget → Scriptable.
//   9. Pick small/medium/large and select "AthleteDiaryWidget".
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

// ── Mood → colour mapping ─────────────────────────────────────
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

// ── Day abbreviation (Mon-based index 0–6) ────────────────────
function dayAbbr(i) {
  return ["MON","TUE","WED","THU","FRI","SAT","SUN"][i] || "";
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
// Black background · large yellow streak number · flame
// =============================================================
function buildSmallPureFire(data, w) {
  w.backgroundColor = C.black;
  w.setPadding(16, 16, 16, 16);

  const stack = w.addStack();
  stack.layoutVertically();
  stack.centerAlignContent();

  // Flame
  const flame = stack.addText("🔥");
  flame.font = Font.systemFont(32);
  flame.centerAlignText();

  stack.addSpacer(2);

  // Streak number
  const num = stack.addText(data ? String(data.streak) : "–");
  num.font = Font.boldSystemFont(52);
  num.textColor = C.yellow;
  num.centerAlignText();
  num.minimumScaleFactor = 0.5;

  stack.addSpacer(2);

  // Label
  const lbl = stack.addText("DAY STREAK");
  lbl.font = Font.boldSystemFont(9);
  lbl.textColor = C.yellow;
  lbl.textOpacity = 0.7;
  lbl.centerAlignText();
  lbl.letterSpacing = 2;

  return w;
}

// =============================================================
// WIDGET #2 — QUICK ACTION (Small)
// Yellow background · streak pill · LOG SESSION button
// =============================================================
function buildSmallQuickAction(data, w) {
  w.backgroundColor = C.yellow;
  w.setPadding(14, 14, 14, 14);

  // Streak pill (black bg)
  const pill = w.addStack();
  pill.backgroundColor = C.black;
  pill.cornerRadius = 100;
  pill.setPadding(4, 10, 4, 10);
  pill.layoutHorizontally();
  pill.centerAlignContent();

  const fireT = pill.addText("🔥 ");
  fireT.font = Font.boldSystemFont(11);
  const streakT = pill.addText(data ? String(data.streak) : "–");
  streakT.font = Font.boldSystemFont(12);
  streakT.textColor = C.yellow;

  w.addSpacer();

  // Button
  const btn = w.addStack();
  btn.backgroundColor = C.black;
  btn.cornerRadius = 14;
  btn.setPadding(0, 0, 0, 0);
  btn.size = new Size(0, 56);

  const btnTxt = btn.addText("+ LOG SESSION");
  btnTxt.font = Font.boldSystemFont(10);
  btnTxt.textColor = C.yellow;
  btnTxt.centerAlignText();
  btnTxt.minimumScaleFactor = 0.7;

  // Deep-link: tapping the widget opens the app
  if (config.widgetURL) {
    w.url = "athletediary://log";
  }

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

  // Title
  const title = w.addText("LAST SESSION");
  title.font = Font.boldSystemFont(8);
  title.textColor = new Color("#BBBBBB");

  w.addSpacer();

  // Sport icon box
  const iconBox = w.addStack();
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
  perfT.font = Font.boldSystemFont(10);
  perfT.textColor = new Color("#000000");

  // Sub-info (date · sport)
  const sub = w.addText(
    ls ? `${ls.date} · ${ls.sport}` : "No sessions yet"
  );
  sub.font = Font.systemFont(9);
  sub.textColor = new Color("#888888");
  sub.minimumScaleFactor = 0.6;

  return w;
}

// =============================================================
// WIDGET #4 — MOOD RING (Small)
// Black background · weekly mood dots
// =============================================================
function buildSmallMoodRing(data, w) {
  w.backgroundColor = C.black;
  w.setPadding(16, 16, 16, 16);

  const title = w.addText("WEEKLY MOOD");
  title.font = Font.boldSystemFont(8);
  title.textColor = new Color("#666666");
  title.letterSpacing = 2;

  w.addSpacer(8);

  // Streak
  const streakT = w.addText("🔥 " + (data ? String(data.streak) : "–"));
  streakT.font = Font.boldSystemFont(20);
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

  // Day labels
  w.addSpacer(2);
  const dayRow = w.addStack();
  dayRow.layoutHorizontally();
  dayRow.spacing = 1;
  const days = ["M","T","W","T","F","S","S"];
  for (const d of days) {
    const dl = dayRow.addText(d);
    dl.font = Font.systemFont(7);
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

  // Left column: streak + log button
  const left = row.addStack();
  left.layoutVertically();
  left.size = new Size(68, 0);

  const fireT = left.addText("🔥");
  fireT.font = Font.systemFont(16);

  const numT = left.addText(data ? String(data.streak) : "–");
  numT.font = Font.boldSystemFont(26);
  numT.textColor = C.black;
  numT.minimumScaleFactor = 0.5;

  left.addSpacer();

  const btn = left.addStack();
  btn.backgroundColor = C.black;
  btn.cornerRadius = 8;
  btn.setPadding(6, 4, 6, 4);
  const btnT = btn.addText("+ LOG");
  btnT.font = Font.boldSystemFont(9);
  btnT.textColor = C.yellow;
  btnT.centerAlignText();

  // Right column: 4-week grid (7 cols × 4 rows = 28 cells)
  const right = row.addStack();
  right.layoutVertically();
  right.spacing = 3;

  const cells = data?.heatmapCells ?? Array(28).fill({ mood: 0 });
  // 4 rows of 7
  for (let row = 0; row < 4; row++) {
    const gridRow = right.addStack();
    gridRow.layoutHorizontally();
    gridRow.spacing = 3;
    for (let col = 0; col < 7; col++) {
      const idx = row * 7 + col;
      const cell = cells[idx] ?? { mood: 0 };
      const isToday = idx === cells.length - 1;

      const box = gridRow.addStack();
      box.size = new Size(18, 18);
      box.backgroundColor = moodColor(cell.mood);
      box.cornerRadius = 3;

      if (isToday) {
        // Highlight today with a border-like overlay (Scriptable hack)
        box.borderColor = C.black;
        box.borderWidth = 2;
      }
    }
  }

  w.url = "athletediary://log";
  return w;
}

// =============================================================
// WIDGET #9 / LARGE — MACRO GRID
// White background · 12-col × 7-row full heatmap (84 cells)
// (Replaces the 4 sessions / 12km stat block with the grid)
// =============================================================
function buildLargeMacroGrid(data, w) {
  w.backgroundColor = C.white;
  w.setPadding(20, 20, 20, 20);

  // Header row
  const header = w.addStack();
  header.layoutHorizontally();

  const appName = header.addText("ATHLETE DIARY");
  appName.font = Font.boldSystemFont(11);
  appName.textColor = new Color("#CCCCCC");
  appName.letterSpacing = 3;

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
  pillNum.font = Font.boldSystemFont(12);
  pillNum.textColor = C.yellow;

  w.addSpacer(16);

  // 84-cell grid (12 cols × 7 rows)
  // We use all available heatmap cells (last 28 days data padded to 84)
  const baseCells = data?.heatmapCells ?? [];
  // Build 84 cells: older cells filled as empty
  const allCells = [];
  for (let i = 0; i < 84; i++) {
    const offset = i - (84 - baseCells.length);
    if (offset >= 0 && offset < baseCells.length) {
      allCells.push(baseCells[offset]);
    } else {
      allCells.push({ mood: 0 });
    }
  }

  for (let row = 0; row < 7; row++) {
    const gridRow = w.addStack();
    gridRow.layoutHorizontally();
    gridRow.spacing = 4;

    for (let col = 0; col < 12; col++) {
      const idx = row * 12 + col;
      const cell = allCells[idx];
      const isToday = idx === allCells.length - 1;

      const box = gridRow.addStack();
      box.size = new Size(0, 20);  // width auto via flex
      box.backgroundColor = moodColor(cell.mood);
      box.cornerRadius = 3;

      if (isToday) {
        box.borderColor = C.black;
        box.borderWidth = 2;
      }
    }

    if (row < 6) w.addSpacer(4);
  }

  return w;
}

// =============================================================
// WIDGET — SETUP SCREEN (shown when DATA_URL is not configured)
// =============================================================
function buildSetupWidget(w) {
  w.backgroundColor = C.black;
  w.setPadding(16, 16, 16, 16);

  const t1 = w.addText("⚙️");
  t1.font = Font.systemFont(28);
  t1.centerAlignText();

  w.addSpacer(8);

  const t2 = w.addText("WIDGET SETUP NEEDED");
  t2.font = Font.boldSystemFont(10);
  t2.textColor = C.yellow;
  t2.centerAlignText();

  w.addSpacer(6);

  const t3 = w.addText("Open Athlete Diary → Widget tab to copy your URL, then paste it in this script.");
  t3.font = Font.systemFont(9);
  t3.textColor = new Color("#888888");
  t3.centerAlignText();

  return w;
}

// =============================================================
// MAIN — choose widget based on size
// =============================================================
async function run() {
  const data = await fetchData();
  const size  = config.widgetFamily;
  let w = new ListWidget();

  // If not configured yet — show setup screen
  if (DATA_URL === "PASTE_YOUR_DATA_URL_HERE") {
    buildSetupWidget(w);
    Script.setWidget(w);
    Script.complete();
    return;
  }

  switch (size) {
    case "small":
      // Change the function below to pick a different small widget:
      // buildSmallPureFire | buildSmallQuickAction |
      // buildSmallLastSession | buildSmallMoodRing
      buildSmallPureFire(data, w);
      break;

    case "medium":
      buildMediumConsistencyGrid(data, w);
      break;

    case "large":
      buildLargeMacroGrid(data, w);
      break;

    default:
      // Running in-app preview — show the small Pure Fire widget
      buildSmallPureFire(data, w);
  }

  // Refresh every 30 minutes
  const nextRefresh = new Date();
  nextRefresh.setMinutes(nextRefresh.getMinutes() + 30);
  w.refreshAfterDate = nextRefresh;

  Script.setWidget(w);
  w.presentSmall();   // comment out when installed on Home Screen
  Script.complete();
}

await run();
