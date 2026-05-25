// ============================================================
// AthleteDiary_LS_2_Grid.js — iOS Lock Screen Widget
// STYLE 2: Minimal Grid (7 Mood Dots, larger)
//
// HOW TO SET UP:
//   1. Paste this into a new Scriptable script named "AthleteDiary_LS_2_Grid".
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

function moodOpacity(m) {
  const map = { 1: 0.35, 2: 0.5, 3: 0.65, 4: 0.85, 5: 1.0 };
  return map[m] ?? 0.6;
}

function buildWidget(data, w) {
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
