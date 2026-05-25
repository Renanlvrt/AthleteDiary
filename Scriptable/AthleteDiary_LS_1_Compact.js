// ============================================================
// AthleteDiary_LS_1_Compact.js — iOS Lock Screen Widget
// STYLE 1: Compact Dashboard (Streak + Mood Dots)
//
// HOW TO SET UP:
//   1. Paste this into a new Scriptable script named "AthleteDiary_LS_1_Compact".
//   2. Paste your data URL below.
//   3. On Lock Screen → Add Widget → Scriptable → select this script.
// ============================================================

const DATA_URL = "PASTE_YOUR_DATA_URL_HERE";

async function fetchData() {
  if (DATA_URL === "PASTE_YOUR_DATA_URL_HERE") return null;
  try {
    const req = new Request(DATA_URL);
    req.timeoutInterval = 5;
    return await req.loadJSON();
  } catch (e) { return null; }
}

function perfLabel(p) {
  const map = { 1: "POOR", 2: "LOW", 3: "AVG", 4: "GOOD", 5: "PEAK" };
  return map[p] || "–";
}

function moodOpacity(m) {
  const map = { 1: 0.35, 2: 0.5, 3: 0.65, 4: 0.85, 5: 1.0 };
  return map[m] ?? 0.6;
}

function sportSymbol(sport) {
  const map = {
    running: "figure.run", gym: "dumbbell.fill", cycling: "bicycle",
    swimming: "figure.pool.swim", football: "soccerball",
    basketball: "basketball.fill", other: "star.fill",
  };
  return map[sport] ?? "figure.run";
}

function buildWidget(data, w) {
  w.setPadding(0, 0, 0, 0);

  const ls = data?.lastSession ?? null;
  const streak = data ? data.streak : null;

  const root = w.addStack();
  root.layoutHorizontally();
  root.centerAlignContent();
  root.spacing = 0;

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

  root.addSpacer(4);
  const divider = root.addStack();
  divider.size = new Size(1, 32);
  divider.backgroundColor = new Color("#FFFFFF", 0.3);
  root.addSpacer(6);

  const rightBlock = root.addStack();
  rightBlock.layoutVertically();
  rightBlock.spacing = 4;

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
    dot.backgroundColor = m > 0 ? new Color("#FFFFFF", moodOpacity(m)) : new Color("#FFFFFF", 0.15);
  }

  return w;
}

function buildSetup(w) {
  w.setPadding(0, 0, 0, 0);
  const col = w.addStack();
  col.layoutHorizontally();
  col.centerAlignContent();
  col.spacing = 8;
  const icon = col.addImage(SFSymbol.named("gearshape.fill").image);
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

async function run() {
  const data = await fetchData();
  const w = new ListWidget();
  if (!data) buildSetup(w);
  else buildWidget(data, w);
  
  w.url = data?.deepLinkUrl ?? "athletediary://log";
  const next = new Date();
  next.setMinutes(next.getMinutes() + 15);
  w.refreshAfterDate = next;
  
  Script.setWidget(w);
  await w.presentAccessoryRectangular();
  Script.complete();
}
await run();
