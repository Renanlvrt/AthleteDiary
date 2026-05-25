// ============================================================
// AthleteDiary_LS_3_Streak.js — iOS Lock Screen Widget
// STYLE 3: Streak Focus (Big Flame + Streak Number)
//
// HOW TO SET UP:
//   1. Paste this into a new Scriptable script named "AthleteDiary_LS_3_Streak".
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

function buildWidget(data, w) {
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
