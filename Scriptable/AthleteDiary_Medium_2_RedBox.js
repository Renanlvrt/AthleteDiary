// ============================================================
// AthleteDiary_Medium_2_RedBox.js
// Medium Widget (2x4)
// All White Background with a floating RED BOX for the streak.
// ============================================================

const DATA_URL = "PASTE_YOUR_DATA_URL_HERE";

const C = {
  black:    new Color("#000000"),
  yellow:   new Color("#FFE500"),
  white:    new Color("#FFFFFF"),
  red:      new Color("#EF4444"),
  orange:   new Color("#F97316"),
  green:    new Color("#22C55E"),
  greenLt:  new Color("#86EFAC"),
  empty:    new Color("#EBEBEB"),
};

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

function perfLabel(p) {
  const map = { 1:"POOR", 2:"BELOW AVG", 3:"AVERAGE", 4:"GOOD", 5:"PEAK" };
  return map[p] || "—";
}

function sportEmoji(sport) {
  const map = {
    running:"🏃", gym:"🏋️", cycling:"🚴", swimming:"🏊",
    football:"⚽️", basketball:"🏀", other:"🎯",
  };
  return map[sport] || "🏃";
}

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

function buildWidget(data, w) {
  w.backgroundColor = C.white; 
  w.setPadding(0, 0, 0, 0);

  const root = w.addStack();
  root.layoutHorizontally();
  root.centerAlignContent(); 

  // ==========================================
  // LEFT HALF: Last Session
  // ==========================================
  const left = root.addStack();
  left.setPadding(16, 16, 16, 16);
  left.layoutVertically();

  const ls = data?.lastSession;

  const title = left.addText("LAST SESSION");
  title.font = Font.boldSystemFont(8);
  title.textColor = new Color("#BBBBBB");

  left.addSpacer();

  const iconRow = left.addStack();
  iconRow.layoutHorizontally();
  const iconBox = iconRow.addStack();
  iconBox.backgroundColor = C.black;
  iconBox.cornerRadius = 12;
  iconBox.size = new Size(44, 44);
  iconBox.centerAlignContent();
  const emojiT = iconBox.addText(ls ? sportEmoji(ls.sport) : "–");
  emojiT.font = Font.systemFont(22);
  emojiT.centerAlignText();

  left.addSpacer();

  const perf = left.addStack();
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

  const sub = left.addText(ls ? `${ls.date} · ${ls.sport.toUpperCase()}` : "No sessions yet");
  sub.font = Font.systemFont(9);
  sub.textColor = new Color("#888888");
  sub.minimumScaleFactor = 0.6;

  // ==========================================
  // RIGHT HALF: Floating Red Box
  // ==========================================
  // Outer stack acts as margin so the red box floats
  const rightOuter = root.addStack();
  rightOuter.layoutVertically();
  rightOuter.centerAlignContent();
  rightOuter.setPadding(12, 16, 12, 16); // Padding pushes the red box inwards

  // The actual floating red card
  const rightCard = rightOuter.addStack();
  rightCard.backgroundColor = C.red; // Solid Red Box
  rightCard.cornerRadius = 16;       // Rounded corners
  rightCard.setPadding(12, 12, 12, 12);
  rightCard.layoutVertically();
  rightCard.centerAlignContent();

  rightCard.addSpacer();

  const flameStack = rightCard.addStack();
  flameStack.layoutHorizontally();
  flameStack.centerAlignContent();
  flameStack.addSpacer();
  const flameT = flameStack.addText("🔥");
  flameT.font = Font.systemFont(28);
  flameT.centerAlignText();
  flameStack.addSpacer();

  rightCard.addSpacer(4);

  const streakStack = rightCard.addStack();
  streakStack.layoutHorizontally();
  streakStack.centerAlignContent();
  streakStack.addSpacer();
  const numT = streakStack.addText(data ? String(data.streak) : "–");
  numT.font = Font.boldSystemFont(38);
  numT.textColor = C.white; // White text on Red background
  numT.centerAlignText();
  streakStack.addSpacer();

  rightCard.addSpacer(4);

  const lblStack = rightCard.addStack();
  lblStack.layoutHorizontally();
  lblStack.centerAlignContent();
  lblStack.addSpacer();
  const lblT = lblStack.addText("DAY STREAK");
  lblT.font = Font.boldSystemFont(8);
  lblT.textColor = new Color("#FFFFFF", 0.8); 
  lblT.textOpacity = 1.0;
  lblStack.addSpacer();

  rightCard.addSpacer();

  return w;
}

function buildSetupWidget(w) {
  w.backgroundColor = C.black;
  w.setPadding(0, 0, 0, 0);

  const col = w.addStack();
  col.layoutVertically();
  col.centerAlignContent();
  col.addSpacer();

  const row1 = col.addStack(); row1.addSpacer();
  row1.addText("⚙️").font = Font.systemFont(28);
  row1.addSpacer();

  col.addSpacer(8);

  const row2 = col.addStack(); row2.addSpacer();
  const t = row2.addText("SETUP NEEDED");
  t.font = Font.boldSystemFont(10);
  t.textColor = C.yellow;
  row2.addSpacer();

  col.addSpacer();
  return w;
}

async function run() {
  const data = await fetchData();
  let w = new ListWidget();

  if (!data) {
    buildSetupWidget(w);
  } else {
    buildWidget(data, w);
  }

  w.url = data?.deepLinkUrl ?? "athletediary://log";
  const next = new Date();
  next.setMinutes(next.getMinutes() + 30);
  w.refreshAfterDate = next;

  Script.setWidget(w);
  await w.presentMedium();
  Script.complete();
}
await run();
