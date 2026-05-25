// ============================================================
// AthleteDiary_LS_4_Next.js — iOS Lock Screen Widget
// STYLE 4: Next Session (Scheduled time and sport)
//
// HOW TO SET UP:
//   1. Paste this into a new Scriptable script named "AthleteDiary_LS_4_Next".
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
