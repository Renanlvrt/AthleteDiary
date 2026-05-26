// ============================================================
// AthleteDiary_LS_Fact.js — iOS Lock Screen Widget
//
// HOW TO SET UP:
//   1. Paste this into a new Scriptable script named "AthleteDiary_LS_Fact".
//   2. Paste your data URL below.
//   3. On Lock Screen → Add Widget → Scriptable → select this script.
//   4. Choose the "Rectangular" slot.
// ============================================================

const DATA_URL = "PASTE_YOUR_DATA_URL_HERE";

// Ultra-short facts tailored specifically for the tiny Lock Screen space
const SHORT_FACTS = [
  "Bolt's top speed was 27.78 mph.",
  "Golf is the only sport played on the moon.",
  "First Olympics in 1896 had only 43 events.",
  "A marathon is exactly 26.2 miles.",
  "Fauja Singh ran a marathon at age 100.",
  "Women joined Olympic track in 1928.",
  "Decathlon = 10 events over 2 days.",
  "Flo-Jo's 100m record is 10.49s (1988).",
  "A standard outdoor track is exactly 400m.",
  "Roger Bannister: first sub-4 minute mile.",
  "Tug-of-war was an Olympic sport (1900-1920).",
  "Kipchoge ran a marathon in under 2 hours.",
  "Javelin must land tip-first to be valid.",
  "Michael Phelps has won 28 Olympic medals.",
  "A regulation baseball has 108 red stitches.",
  "The Tour de France covers 3,500 km.",
  "Volleyball was originally called 'Mintonette'.",
  "Table tennis balls can exceed 100 km/h.",
  "Surfing joined the Olympics in Tokyo 2020.",
  "Muhammad Ali's birth name was Cassius Clay.",
  "Babe Ruth hit 714 career home runs.",
  "A basketball hoop is exactly 18 inches wide.",
  "The fastest pitch ever was 105.1 mph.",
  "Swimming was an event in the open ocean in 1896.",
  "The word 'athletics' means 'contest' in Greek.",
  "Ancient Greek athletes competed entirely naked.",
  "A half marathon is exactly 13.1 miles.",
  "Badminton shuttlecocks have 16 goose feathers.",
  "Wilt Chamberlain scored 100 points in one game.",
  "The longest tennis match lasted over 11 hours."
];

async function fetchData() {
  if (DATA_URL === "PASTE_YOUR_DATA_URL_HERE") return null;
  try {
    const req = new Request(DATA_URL);
    req.timeoutInterval = 5;
    return await req.loadJSON();
  } catch (e) { return null; }
}

function buildWidget(data, w) {
  // RULE 1: No padding on lock screen
  w.setPadding(0, 0, 0, 0);

  const streak = data ? data.streak : null;

  const root = w.addStack();
  root.layoutHorizontally();
  root.centerAlignContent();
  root.spacing = 0;

  // ==========================================
  // LEFT SIDE: Flame & Streak
  // ==========================================
  const leftBlock = root.addStack();
  leftBlock.layoutVertically();
  leftBlock.centerAlignContent();
  leftBlock.size = new Size(38, 0);

  const flameImg = leftBlock.addImage(SFSymbol.named("flame.fill").image);
  flameImg.imageSize = new Size(16, 16);
  flameImg.tintColor = Color.white(); // RULE 2: White/Monochrome for tinting

  leftBlock.addSpacer(2);

  const streakNum = leftBlock.addText(streak !== null ? String(streak) : "–");
  streakNum.font = Font.boldSystemFont(20);
  streakNum.textColor = Color.white();
  streakNum.centerAlignText();

  // Subtle visual separator
  root.addSpacer(6);
  const divider = root.addStack();
  divider.size = new Size(1, 32);
  divider.backgroundColor = new Color("#FFFFFF", 0.3); // Opacity shading
  root.addSpacer(8);

  // ==========================================
  // RIGHT SIDE: The Fact
  // ==========================================
  const rightBlock = root.addStack();
  rightBlock.layoutVertically();
  rightBlock.spacing = 2;

  // Header row with Icon
  const row1 = rightBlock.addStack();
  row1.layoutHorizontally();
  row1.centerAlignContent();
  row1.spacing = 4;

  // Use SFSymbol instead of an emoji so it matches the Lock Screen native look
  const bulbImg = row1.addImage(SFSymbol.named("lightbulb.fill").image);
  bulbImg.imageSize = new Size(10, 10);
  bulbImg.tintColor = Color.white();
  bulbImg.imageOpacity = 0.8; // Shading

  const factLbl = row1.addText("DAILY FACT");
  factLbl.font = Font.boldSystemFont(9);
  factLbl.textColor = Color.white();
  factLbl.textOpacity = 0.7; // Shading
  factLbl.lineLimit = 1;

  rightBlock.addSpacer(2);

  // Pick daily fact
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const dailyFact = SHORT_FACTS[dayOfYear % SHORT_FACTS.length];

  // Fact text
  const factTxt = rightBlock.addText(dailyFact);
  factTxt.font = Font.mediumSystemFont(10);
  factTxt.textColor = Color.white();
  factTxt.lineLimit = 3;
  factTxt.minimumScaleFactor = 0.7; // Shrinks slightly if fact is too long

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
  
  // Preview as Lock Screen Rectangular
  await w.presentAccessoryRectangular();
  Script.complete();
}
await run();
