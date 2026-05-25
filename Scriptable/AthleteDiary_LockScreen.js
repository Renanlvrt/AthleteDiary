// ============================================================
// AthleteDiary_LockScreen.js — iOS Lock Screen Widget
//
// HOW TO SET UP:
//   1. Paste this ENTIRE script into a new Scriptable script.
//   2. Name it: "AthleteDiary_LockScreen"
//   3. Paste your widget data URL below where it says DATA_URL.
//   4. On the Lock Screen, long-press → Customize → Add Widget.
//   5. Choose "Scriptable" and select this script.
//   6. Choose the "Rectangular" slot (the wide one below the clock).
//
// HOW TO CHANGE WIDGET STYLE:
//   Long-press the widget on your Lock Screen -> Edit Widget.
//   In the "Parameter" field, type a number (1-5):
//   1 : Compact Dashboard (Default - Streak + Mood Dots)
//   2 : Minimal Grid (7 Mood Dots, larger)
//   3 : Streak Focus (Big Flame + Streak Number)
//   4 : Next Session (Scheduled time and sport)
//   5 : Last Session (Last sport, performance, and date)
//
// TECHNICAL NOTES (iOS Lock Screen rules):
//   - NO background colors. iOS tints the widget automatically.
//   - Colors must use white/black or opacity for shading.
//   - Use SFSymbol for icons — they render beautifully as mono masks.
//   - Keep padding minimal (0) to prevent cropping.
//   - Width is highly restricted (~160pts), keep layouts narrow.
// ============================================================

// ── ⚙️  CONFIG — paste your URL here ──────────────────────────
const DATA_URL = "PASTE_YOUR_DATA_URL_HERE";
// ─────────────────────────────────────────────────────────────

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

// ── Performance label (compact) ───────────────────────────────
function perfLabel(p) {
  const map = { 1: "POOR", 2: "LOW", 3: "AVG", 4: "GOOD", 5: "PEAK" };
  return map[p] || "–";
}

// ── Mood opacity (used as shading since iOS crushes hex colors) ─
function moodOpacity(m) {
  const map = { 1: 0.35, 2: 0.5, 3: 0.65, 4: 0.85, 5: 1.0 };
  return map[m] ?? 0.6;
}

// ── Sport SF Symbol ───────────────────────────────────────────
function sportSymbol(sport) {
  const map = {
    running:    "figure.run",
    gym:        "dumbbell.fill",
    cycling:    "bicycle",
    swimming:   "figure.pool.swim",
    football:   "soccerball",
    basketball: "basketball.fill",
    other:      "star.fill",
  };
  return map[sport] ?? "figure.run";
}

// ============================================================
// WIDGET 1: COMPACT DASHBOARD (Default)
// Narrower version to fix iOS cropping.
// ============================================================
function buildStyle1(data, w) {
  w.setPadding(0, 0, 0, 0);

  const ls = data?.lastSession ?? null;
  const streak = data ? data.streak : null;

  const root = w.addStack();
  root.layoutHorizontally();
  root.centerAlignContent();
  root.spacing = 0;

  // ── LEFT: Streak (Width ~36pts)
  const leftBlock = root.addStack();
  leftBlock.layoutVertically();
  leftBlock.centerAlignContent();
  leftBlock.size = new Size(36, 0);

  const flameImg = leftBlock.addImage(SFSymbol.named("flame.fill").image);
  flameImg.imageSize = new Size(16, 16);
  flameImg.tintColor = Color.white();

  leftBlock.addSpacer(2);

  const streakNum = leftBlock.addText(streak !== null ? String(streak) : "–");
  streakNum.font = Font.boldSystemFont(20);
  streakNum.textColor = Color.white();
  streakNum.centerAlignText();

  // ── DIVIDER
  root.addSpacer(4);
  const divider = root.addStack();
  divider.size = new Size(1, 32);
  divider.backgroundColor = new Color("#FFFFFF", 0.3);
  root.addSpacer(6);

  // ── RIGHT: Mood Dots
  const rightBlock = root.addStack();
  rightBlock.layoutVertically();
  rightBlock.spacing = 4;

  // Top row: Sport SFSymbol + Performance
  const row1 = rightBlock.addStack();
  row1.layoutHorizontally();
  row1.centerAlignContent();
  row1.spacing = 6;

  const sportIcon = row1.addImage(SFSymbol.named(ls ? sportSymbol(ls.sport) : "figure.run").image);
  sportIcon.imageSize = new Size(12, 12);
  sportIcon.tintColor = Color.white();

  const perfTxt = row1.addText(ls ? perfLabel(ls.performance) : "NO SESSIONS");
  perfTxt.font = Font.boldSystemFont(10);
  perfTxt.textColor = Color.white();
  if (ls) perfTxt.textOpacity = moodOpacity(ls.performance ?? 3);
  perfTxt.lineLimit = 1;

  // Bottom row: 7 Dots
  const row2 = rightBlock.addStack();
  row2.layoutHorizontally();
  row2.centerAlignContent();
  row2.spacing = 3;

  const moods = data?.weeklyMoods ?? Array(7).fill(0);
  for (let i = 0; i < 7; i++) {
    const m = moods[i];
    const dot = row2.addStack();
    dot.size = new Size(9, 9);
    dot.cornerRadius = 4.5;
    if (m > 0) {
      dot.backgroundColor = new Color("#FFFFFF", moodOpacity(m));
    } else {
      dot.backgroundColor = new Color("#FFFFFF", 0.15);
    }
  }

  return w;
}

// ============================================================
// WIDGET 2: MINIMAL GRID
// Just the 7 mood dots, slightly larger, centered.
// ============================================================
function buildStyle2(data, w) {
  w.setPadding(0, 0, 0, 0);

  const root = w.addStack();
  root.layoutVertically();
  root.centerAlignContent();

  const title = root.addText("WEEKLY MOOD");
  title.font = Font.boldSystemFont(9);
  title.textColor = Color.white();
  title.textOpacity = 0.7;
  title.centerAlignText();

  root.addSpacer(6);

  const dotsRow = root.addStack();
  dotsRow.layoutHorizontally();
  dotsRow.centerAlignContent();
  dotsRow.spacing = 4;

  const moods = data?.weeklyMoods ?? Array(7).fill(0);
  for (let i = 0; i < 7; i++) {
    const m = moods[i];
    const dot = dotsRow.addStack();
    dot.size = new Size(14, 14);
    dot.cornerRadius = 7;
    if (m > 0) {
      dot.backgroundColor = new Color("#FFFFFF", moodOpacity(m));
    } else {
      dot.backgroundColor = new Color("#FFFFFF", 0.15);
    }
  }

  return w;
}

// ============================================================
// WIDGET 3: STREAK FOCUS
// Huge flame and streak number.
// ============================================================
function buildStyle3(data, w) {
  w.setPadding(0, 0, 0, 0);

  const root = w.addStack();
  root.layoutHorizontally();
  root.centerAlignContent();
  root.spacing = 8;

  const flameImg = root.addImage(SFSymbol.named("flame.fill").image);
  flameImg.imageSize = new Size(28, 28);
  flameImg.tintColor = Color.white();

  const textCol = root.addStack();
  textCol.layoutVertically();

  const streakNum = textCol.addText(data ? String(data.streak) : "–");
  streakNum.font = Font.boldSystemFont(26);
  streakNum.textColor = Color.white();

  const streakLbl = textCol.addText("DAY STREAK");
  streakLbl.font = Font.boldSystemFont(9);
  streakLbl.textColor = Color.white();
  streakLbl.textOpacity = 0.7;

  return w;
}

// ============================================================
// WIDGET 4: NEXT SESSION
// Upcoming scheduled session.
// ============================================================
function buildStyle4(data, w) {
  w.setPadding(0, 0, 0, 0);

  const root = w.addStack();
  root.layoutVertically();
  root.centerAlignContent();

  const topRow = root.addStack();
  topRow.layoutHorizontally();
  topRow.centerAlignContent();
  topRow.spacing = 6;

  const sportName = data?.lastSession?.sport ?? "running";
  const sportImg = topRow.addImage(SFSymbol.named(sportSymbol(sportName)).image);
  sportImg.imageSize = new Size(16, 16);
  sportImg.tintColor = Color.white();

  const title = topRow.addText("NEXT WORKOUT");
  title.font = Font.boldSystemFont(10);
  title.textColor = Color.white();
  title.textOpacity = 0.7;

  root.addSpacer(4);

  let schedTxt = "NOT SCHEDULED";
  if (data?.nextSchedule) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayName = days[data.nextSchedule.dayOfWeek] || "Today";
    const pad = (n) => String(n).padStart(2, '0');
    schedTxt = `${dayName.toUpperCase()} ${pad(data.nextSchedule.hour)}:${pad(data.nextSchedule.minute)}`;
  }

  const timeTxt = root.addText(schedTxt);
  timeTxt.font = Font.boldSystemFont(16);
  timeTxt.textColor = Color.white();

  return w;
}

// ============================================================
// WIDGET 5: LAST SESSION MINIMAL
// ============================================================
function buildStyle5(data, w) {
  w.setPadding(0, 0, 0, 0);

  const root = w.addStack();
  root.layoutVertically();
  root.centerAlignContent();

  const ls = data?.lastSession ?? null;

  if (!ls) {
    const title = root.addText("NO SESSIONS");
    title.font = Font.boldSystemFont(12);
    title.textColor = Color.white();
    return w;
  }

  const topRow = root.addStack();
  topRow.layoutHorizontally();
  topRow.centerAlignContent();
  topRow.spacing = 6;

  const sportImg = topRow.addImage(SFSymbol.named(sportSymbol(ls.sport)).image);
  sportImg.imageSize = new Size(16, 16);
  sportImg.tintColor = Color.white();

  const sportTxt = topRow.addText(ls.sport.toUpperCase());
  sportTxt.font = Font.boldSystemFont(12);
  sportTxt.textColor = Color.white();

  root.addSpacer(4);

  const bottomRow = root.addStack();
  bottomRow.layoutHorizontally();
  bottomRow.spacing = 4;

  const perfTxt = bottomRow.addText(perfLabel(ls.performance));
  perfTxt.font = Font.boldSystemFont(10);
  perfTxt.textColor = Color.white();
  perfTxt.textOpacity = moodOpacity(ls.performance ?? 3);

  const dot = bottomRow.addText("·");
  dot.font = Font.boldSystemFont(10);
  dot.textColor = Color.white();
  dot.textOpacity = 0.5;

  const dateTxt = bottomRow.addText(ls.date);
  dateTxt.font = Font.systemFont(10);
  dateTxt.textColor = Color.white();
  dateTxt.textOpacity = 0.7;
  dateTxt.lineLimit = 1;

  return w;
}

// ── Fallback: no data yet ─────────────────────────────────────
function buildLockScreenSetup(w) {
  w.setPadding(0, 0, 0, 0);

  const col = w.addStack();
  col.layoutHorizontally();
  col.centerAlignContent();
  col.spacing = 8;

  const sym = SFSymbol.named("gearshape.fill");
  const icon = col.addImage(sym.image);
  icon.imageSize = new Size(20, 20);
  icon.tintColor = Color.white();

  const textStack = col.addStack();
  textStack.layoutVertically();

  const t1 = textStack.addText("SETUP NEEDED");
  t1.font = Font.boldSystemFont(11);
  t1.textColor = Color.white();

  const t2 = textStack.addText("Open app → ⊞ Widget tab");
  t2.font = Font.systemFont(9);
  t2.textColor = Color.white();
  t2.textOpacity = 0.7;

  return w;
}

// ── MAIN ──────────────────────────────────────────────────────
async function run() {
  const data = await fetchData();
  const w = new ListWidget();

  if (!data) {
    buildLockScreenSetup(w);
  } else {
    const param = (args.widgetParameter || "").toLowerCase().trim();
    if (param === "2") {
      buildStyle2(data, w);
    } else if (param === "3") {
      buildStyle3(data, w);
    } else if (param === "4") {
      buildStyle4(data, w);
    } else if (param === "5") {
      buildStyle5(data, w);
    } else {
      buildStyle1(data, w);
    }
  }

  // Deep link: tap widget → opens Log Session directly
  w.url = data?.deepLinkUrl ?? "athletediary://log";

  // Refresh every 15 minutes
  const next = new Date();
  next.setMinutes(next.getMinutes() + 15);
  w.refreshAfterDate = next;

  Script.setWidget(w);

  // ── Preview inside the app ─────────────────────────────────
  await w.presentAccessoryRectangular();

  Script.complete();
}

await run();
