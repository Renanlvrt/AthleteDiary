// ============================================================
// AthleteDiary_LS_5_Minimal.js — iOS Lock Screen Widget
// STYLE 5: Last Session Minimal
//
// HOW TO SET UP:
//   1. Paste this into a new Scriptable script named "AthleteDiary_LS_5_Minimal".
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
