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
// Yellow background · centred flame · large black streak number
// =============================================================
function buildSmallPureFire(data, w) {
  w.backgroundColor = C.yellow;
  w.setPadding(0, 0, 0, 0);  // remove all padding — spacers handle it

  const col = w.addStack();
  col.layoutVertically();
  col.centerAlignContent();

  // Push content to vertical centre
  col.addSpacer();

  // 🔥 flame — centred
  addCentredText(col, "🔥", Font.systemFont(30), C.black);

  col.addSpacer(4);

  // Streak number — centred, scales down for very large numbers
  const numEl = addCentredText(
    col,
    data ? String(data.streak) : "–",
    Font.boldSystemFont(54),
    C.black,
  );
  numEl.minimumScaleFactor = 0.4;
  numEl.lineLimit = 1;

  col.addSpacer(4);

  // "DAY STREAK" label — centred, dimmed
  addCentredText(col, "DAY STREAK", Font.boldSystemFont(9), C.black, 0.7);

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

  const sub = w.addText(ls ? `${ls.date} · ${ls.sport.toUpperCase()}` : "No sessions yet");
  sub.font      = Font.systemFont(9);
  sub.textColor = new Color("#888888");
  sub.minimumScaleFactor = 0.6;

  return w;
}

// =============================================================
// WIDGET #4 — MOOD RING (Small)
// Yellow background · streak · weekly mood dots
// =============================================================
function buildSmallMoodRing(data, w) {
  w.backgroundColor = C.yellow;
  w.setPadding(16, 16, 16, 16);

  const title = w.addText("WEEKLY MOOD");
  title.font      = Font.boldSystemFont(8);
  title.textColor = new Color("#666666");

  w.addSpacer(8);

  const streakT = w.addText("🔥 " + (data ? String(data.streak) : "–"));
  streakT.font      = Font.boldSystemFont(20);
  streakT.textColor = C.black;

  w.addSpacer();

  // 7 mood dots
  const dots = w.addStack();
  dots.layoutHorizontally();
  dots.spacing = 5;
  const moods = data?.weeklyMoods ?? Array(7).fill(0);
  for (const m of moods) {
    const dot = dots.addStack();
    dot.size = new Size(12, 12);
    dot.backgroundColor = m > 0 ? moodColor(m) : new Color("#000000", 0.15);
    dot.cornerRadius = 6;
  }

  w.addSpacer(2);

  // Day labels
  const dayRow = w.addStack();
  dayRow.layoutHorizontally();
  dayRow.spacing = 3;
  const dayLabels = ["M","T","W","T","F","S","S"];
  for (let i = 0; i < 7; i++) {
    const dlBox = dayRow.addStack();
    dlBox.size = new Size(12, 10);
    dlBox.centerAlignContent();
    const dl = dlBox.addText(dayLabels[i]);
    dl.font      = Font.boldSystemFont(8);
    dl.textColor = new Color("#666666");
    dl.centerAlignText();
    if (i < 6) dayRow.addSpacer(5);
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
// WIDGET #6 — THE DASHBOARD (Medium)
// Yellow background · streak pill · next schedule · white card recap
// =============================================================
function buildMediumDashboard(data, w) {
  w.backgroundColor = C.yellow;
  w.setPadding(16, 16, 16, 16);

  const header = w.addStack();
  header.layoutHorizontally();
  header.centerAlignContent();

  // Streak pill
  const pill = header.addStack();
  pill.backgroundColor = C.black;
  pill.cornerRadius = 100;
  pill.setPadding(4, 10, 4, 10);
  pill.layoutHorizontally();
  pill.centerAlignContent();
  const spIcon = pill.addText("🔥 ");
  spIcon.font = Font.boldSystemFont(11);
  const spNum = pill.addText(data ? String(data.streak) : "–");
  spNum.font = Font.boldSystemFont(12);
  spNum.textColor = C.yellow;

  header.addSpacer();

  // Next workout schedule text
  let schedTxt = "No workouts scheduled";
  if (data?.nextSchedule) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayName = days[data.nextSchedule.dayOfWeek] || "Today";
    const pad = (n) => String(n).padStart(2, '0');
    schedTxt = `Next: ${dayName} ${pad(data.nextSchedule.hour)}:${pad(data.nextSchedule.minute)}`;
  }
  const schedEl = header.addText(schedTxt.toUpperCase());
  schedEl.font = Font.boldSystemFont(9);
  schedEl.textColor = C.black;
  schedEl.textOpacity = 0.6;

  w.addSpacer();

  // Bottom card: white session card
  const card = w.addStack();
  card.backgroundColor = C.white;
  card.cornerRadius = 14;
  card.setPadding(12, 12, 12, 12);
  card.layoutHorizontally();
  card.centerAlignContent();

  // Icon box inside white card
  const iconBox = card.addStack();
  iconBox.backgroundColor = new Color("#F5F5F5");
  iconBox.cornerRadius = 10;
  iconBox.size = new Size(36, 36);
  iconBox.centerAlignContent();

  const ls = data?.lastSession;
  const emojiEl = iconBox.addText(ls ? sportEmoji(ls.sport) : "–");
  emojiEl.font = Font.systemFont(18);
  emojiEl.centerAlignText();

  card.addSpacer(12);

  // Card info
  const info = card.addStack();
  info.layoutVertically();
  const titleEl = info.addText(ls ? ls.sport.toUpperCase() : "NO SESSIONS");
  titleEl.font = Font.boldSystemFont(12);
  titleEl.textColor = C.black;
  const subEl = info.addText(ls ? `LAST LOGGED: ${ls.date}` : "Log your first session");
  subEl.font = Font.systemFont(9);
  subEl.textColor = new Color("#888888");

  card.addSpacer();

  // Performance tag
  if (ls) {
    const tag = card.addStack();
    tag.backgroundColor = new Color("#22C55E", 0.15);
    tag.cornerRadius = 6;
    tag.setPadding(4, 8, 4, 8);
    const tagTxt = tag.addText(perfLabel(ls.performance));
    tagTxt.font = Font.boldSystemFont(9);
    tagTxt.textColor = C.green;
  }

  return w;
}

// =============================================================
// WIDGET #7 — WEEKLY TARGET (Medium)
// Yellow background · title · weekly target circular pills
// =============================================================
function buildMediumWeeklyTarget(data, w) {
  w.backgroundColor = C.yellow;
  w.setPadding(20, 20, 20, 20);

  const title = w.addText("THIS WEEK'S TARGET");
  title.font = Font.boldSystemFont(11);
  title.textColor = C.black;
  title.textOpacity = 0.6;

  w.addSpacer();

  const circles = w.addStack();
  circles.layoutHorizontally();
  circles.centerAlignContent();

  const daysShort = ["M", "T", "W", "T", "F", "S", "S"];
  const target = data?.weeklyTarget ?? { scheduledDays: [], completedDays: [] };

  for (let i = 0; i < 7; i++) {
    const isScheduled = target.scheduledDays.includes(i);
    const isCompleted = target.completedDays.includes(i);

    const cStack = circles.addStack();
    cStack.size = new Size(36, 36);
    cStack.cornerRadius = 18;
    cStack.centerAlignContent();

    if (isCompleted) {
      cStack.backgroundColor = C.black;
      const t = cStack.addText("✓");
      t.font = Font.boldSystemFont(14);
      t.textColor = C.yellow;
      t.centerAlignText();
    } else if (isScheduled) {
      cStack.borderColor = C.black;
      cStack.borderWidth = 2;
      const t = cStack.addText(daysShort[i]);
      t.font = Font.boldSystemFont(11);
      t.textColor = C.black;
      t.centerAlignText();
    } else {
      cStack.backgroundColor = new Color("#000000", 0.08);
      const t = cStack.addText(daysShort[i]);
      t.font = Font.systemFont(11);
      t.textColor = new Color("#000000", 0.3);
      t.centerAlignText();
    }

    if (i < 6) circles.addSpacer();
  }

  return w;
}

// =============================================================
// WIDGET #8 — NEXT UP SCHEDULE (Medium)
// Split yellow/white background · next scheduled training & log button
// =============================================================
function buildMediumNextUp(data, w) {
  w.backgroundColor = C.white;
  w.setPadding(0, 0, 0, 0);

  const container = w.addStack();
  container.layoutVertically();

  // Top half: Yellow
  const topHalf = container.addStack();
  topHalf.backgroundColor = C.yellow;
  topHalf.layoutHorizontally();
  topHalf.centerAlignContent();
  topHalf.setPadding(16, 16, 16, 16);
  topHalf.size = new Size(0, 80);

  const infoStack = topHalf.addStack();
  infoStack.layoutVertically();

  const label = infoStack.addText("SCHEDULED WORKOUT");
  label.font = Font.boldSystemFont(8);
  label.textColor = C.black;
  label.textOpacity = 0.5;

  infoStack.addSpacer(2);

  let schedTime = "NONE SCHEDULED";
  let sportName = "running";
  if (data?.nextSchedule) {
    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
    const dayName = days[data.nextSchedule.dayOfWeek] || "TODAY";
    const pad = (n) => String(n).padStart(2, '0');
    schedTime = `${dayName} @ ${pad(data.nextSchedule.hour)}:${pad(data.nextSchedule.minute)}`;
    sportName = data.lastSession?.sport ?? "running";
  }
  const timeVal = infoStack.addText(schedTime);
  timeVal.font = Font.boldSystemFont(15);
  timeVal.textColor = C.black;
  timeVal.minimumScaleFactor = 0.7;

  topHalf.addSpacer();

  const emojiEl = topHalf.addText(sportEmoji(sportName));
  emojiEl.font = Font.systemFont(32);

  // Bottom half: White
  const bottomHalf = container.addStack();
  bottomHalf.backgroundColor = C.white;
  bottomHalf.layoutHorizontally();
  bottomHalf.centerAlignContent();
  bottomHalf.setPadding(14, 16, 14, 16);
  bottomHalf.size = new Size(0, 80);

  // Button style
  const btn = bottomHalf.addStack();
  btn.backgroundColor = C.black;
  btn.cornerRadius = 12;
  btn.setPadding(10, 10, 10, 10);
  btn.layoutHorizontally();
  btn.centerAlignContent();

  btn.addSpacer();
  const btnText = btn.addText("+ LOG SESSION");
  btnText.font = Font.boldSystemFont(11);
  btnText.textColor = C.yellow;
  btnText.centerAlignText();
  btn.addSpacer();

  return w;
}

// =============================================================
// WIDGET #9 — MACRO GRID (Large)
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
// WIDGET #10 — DEEP DIVE (Large)
// Yellow top (stats) · White bottom (last session notes)
// =============================================================
function buildLargeDeepDive(data, w) {
  w.backgroundColor = C.white;
  w.setPadding(0, 0, 0, 0);

  const container = w.addStack();
  container.layoutVertically();

  // Top half: Yellow (stats)
  const topHalf = container.addStack();
  topHalf.backgroundColor = C.yellow;
  topHalf.layoutHorizontally();
  topHalf.centerAlignContent();
  topHalf.setPadding(24, 20, 20, 20);
  topHalf.size = new Size(0, 140);

  // Stat 1: Streak
  const stat1 = topHalf.addStack();
  stat1.layoutVertically();
  const val1 = stat1.addText(data ? String(data.streak) : "–");
  val1.font = Font.boldSystemFont(32);
  val1.textColor = C.black;
  const lbl1 = stat1.addText("STREAK");
  lbl1.font = Font.boldSystemFont(9);
  lbl1.textColor = C.black;
  lbl1.textOpacity = 0.6;

  topHalf.addSpacer();

  // Stat 2: Weekly Completed
  const completedCount = data?.weeklyTarget?.completedDays?.length ?? 0;
  const stat2 = topHalf.addStack();
  stat2.layoutVertically();
  const val2 = stat2.addText(String(completedCount));
  val2.font = Font.boldSystemFont(32);
  val2.textColor = C.black;
  const lbl2 = stat2.addText("WEEK SESSIONS");
  lbl2.font = Font.boldSystemFont(9);
  lbl2.textColor = C.black;
  lbl2.textOpacity = 0.6;

  topHalf.addSpacer();

  // Stat 3: Last Sport
  const ls = data?.lastSession;
  const stat3 = topHalf.addStack();
  stat3.layoutVertically();
  const val3 = stat3.addText(ls ? sportEmoji(ls.sport) : "–");
  val3.font = Font.systemFont(32);
  const lbl3 = stat3.addText("LAST SPORT");
  lbl3.font = Font.boldSystemFont(9);
  lbl3.textColor = C.black;
  lbl3.textOpacity = 0.6;

  // Bottom half: White (Last Session Details & Notes)
  const bottomHalf = container.addStack();
  bottomHalf.backgroundColor = C.white;
  bottomHalf.layoutVertically();
  bottomHalf.setPadding(20, 20, 20, 20);
  bottomHalf.size = new Size(0, 204);

  // Header row of bottom half
  const row = bottomHalf.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();

  const title = row.addText("LAST SESSION");
  title.font = Font.boldSystemFont(9);
  title.textColor = new Color("#BBBBBB");

  row.addSpacer();

  if (ls) {
    const tag = row.addStack();
    tag.backgroundColor = C.black;
    tag.cornerRadius = 6;
    tag.setPadding(3, 8, 3, 8);
    const tagTxt = tag.addText(perfLabel(ls.performance));
    tagTxt.font = Font.boldSystemFont(8);
    tagTxt.textColor = C.yellow;
  }

  bottomHalf.addSpacer(10);

  // Sport and Date
  const sportRow = bottomHalf.addStack();
  sportRow.layoutHorizontally();
  sportRow.centerAlignContent();
  const sportIcon = sportRow.addText((ls ? sportEmoji(ls.sport) : "🏃") + " ");
  sportIcon.font = Font.systemFont(14);
  const sportName = sportRow.addText(ls ? ls.sport.toUpperCase() : "RUNNING");
  sportName.font = Font.boldSystemFont(14);
  sportName.textColor = C.black;

  bottomHalf.addSpacer(4);

  // Notes Box
  const notesBox = bottomHalf.addStack();
  notesBox.backgroundColor = new Color("#F5F5F5");
  notesBox.cornerRadius = 12;
  notesBox.setPadding(12, 12, 12, 12);
  notesBox.size = new Size(0, 100);
  notesBox.layoutHorizontally();

  const notesText = notesBox.addText(
    ls && ls.notes ? `"${ls.notes}"` : '"No notes recorded for this session."'
  );
  notesText.font = Font.italicSystemFont(12);
  notesText.textColor = new Color("#555555");
  notesText.lineLimit = 4;

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

// =============================================================
// RUN DIRECTLY
// =============================================================
async function run() {
  const data = await fetchData();
  let w = new ListWidget();

  if (DATA_URL === "PASTE_YOUR_DATA_URL_HERE") {
    buildSetupWidget(w);
    Script.setWidget(w);
    Script.complete();
    return;
  }

  // Directly build the widget
  buildMediumConsistencyGrid(data, w);

  // Deep-link URL
  w.url = data?.deepLinkUrl ?? "athletediary://log";

  // Refresh every 30 minutes
  const next = new Date();
  next.setMinutes(next.getMinutes() + 30);
  w.refreshAfterDate = next;

  Script.setWidget(w);

  // Present preview in-app
  await w.presentMedium();

  Script.complete();
}

await run();
