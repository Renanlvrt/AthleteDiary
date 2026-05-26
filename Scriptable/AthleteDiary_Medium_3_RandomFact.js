// ============================================================
// AthleteDiary_Medium_3_RandomFact.js
// Medium Widget (2x4)
// Left: Last Session recap
// Right: "Daily Sports Fact" that changes every day
// ============================================================

const DATA_URL = "PASTE_YOUR_DATA_URL_HERE";

// An array of 50 interesting sports facts, heavy on Track & Field
const SPORTS_FACTS = [
  "Usain Bolt's top speed during his 100m world record was 27.78 mph (44.72 km/h).",
  "The marathon distance of 26.2 miles was set at the 1908 London Olympics to finish in front of the royal box.",
  "Fauja Singh became the first 100-year-old to complete a marathon in 2011.",
  "Javier Sotomayor holds the high jump world record at 2.45m (8 ft 1/2 in), set in 1993.",
  "The first modern Olympic Games in 1896 featured only 43 events.",
  "Women were not allowed to compete in Olympic track and field events until 1928.",
  "The decathlon consists of 10 events held over two days, testing speed, stamina, and strength.",
  "Florence Griffith-Joyner's 100m world record of 10.49 seconds has stood unbeaten since 1988.",
  "Bob Beamon's 1968 long jump world record of 8.90m stood for 23 years before Mike Powell broke it.",
  "A standard outdoor running track is exactly 400 meters in lane 1.",
  "The 'Fosbury Flop', jumping backward over the bar, was popularized by Dick Fosbury in 1968.",
  "Roger Bannister was the first person to run a sub-4-minute mile in 1954.",
  "Tug-of-war was an official Olympic track and field event from 1900 to 1920.",
  "Golf is the only sport played on the moon. Alan Shepard hit two golf balls in 1971.",
  "Kenenisa Bekele holds the second-fastest marathon time and is widely considered the greatest distance runner.",
  "Wayde van Niekerk broke the 400m world record from lane 8, the outside lane, in 2016.",
  "The javelin must land tip-first to be considered a valid throw in competition.",
  "Hicham El Guerrouj holds the world record for the mile, running it in 3:43.13 in 1999.",
  "The pole vault originally used heavy wooden poles before switching to bamboo, then fiberglass.",
  "Michael Johnson wore custom gold Nike spikes when he set the 200m world record in 1996.",
  "The steeplechase originates from Britain, where runners raced from one town's church steeple to the next.",
  "Jesse Owens won four gold medals in 45 minutes at the 1935 Big Ten track meet.",
  "The longest recorded tennis match took 11 hours and 5 minutes at Wimbledon in 2010.",
  "Basketball was invented by James Naismith in 1891 using a peach basket and a soccer ball.",
  "A regulation baseball has exactly 108 red double stitches.",
  "The modern pentathlon consists of fencing, swimming, equestrian show jumping, pistol shooting, and running.",
  "Wilt Chamberlain is the only NBA player to score 100 points in a single game.",
  "Michael Phelps has won 28 Olympic medals, making him the most decorated Olympian of all time.",
  "The Tour de France covers approximately 3,500 kilometers over 21 days of racing.",
  "A soccer ball is made of 32 leather panels, representing the 32 countries in Europe.",
  "Volleyball was originally called 'Mintonette' when it was invented in 1895.",
  "The longest recorded marathon took 54 years, 8 months, and 6 days to finish by Shizo Kanakuri.",
  "Table tennis balls can travel at speeds over 100 kilometers per hour.",
  "The fastest recorded serve in tennis was hit by Sam Groth at 163.7 mph (263.4 km/h).",
  "The diameter of a basketball hoop is almost exactly double the diameter of a basketball.",
  "Only three countries have participated in every single modern Summer Olympic Games since 1896.",
  "Surfing was officially added to the Olympic Games for the first time in Tokyo 2020.",
  "Muhammad Ali's birth name was Cassius Clay before he changed it in 1964.",
  "The color of the center line in ice hockey is red to help distinguish it from the blue lines.",
  "Babe Ruth hit 714 home runs during his legendary baseball career.",
  "The term 'Grand Slam' was originally a card game term before being adopted by tennis and golf.",
  "The fastest human swimming speed recorded is around 5.3 mph.",
  "Armand Duplantis broke the pole vault world record multiple times before turning 24.",
  "Eliud Kipchoge became the first person to run a marathon in under two hours in 2019.",
  "The word 'athletics' is derived from the ancient Greek word 'athlos' meaning contest.",
  "In ancient Greece, athletes competed in the Olympics entirely naked.",
  "The official distance of a half marathon is exactly 13.1094 miles.",
  "A shuttlecock in badminton is historically made from 16 goose feathers.",
  "The fastest pitch ever recorded in Major League Baseball was 105.1 mph by Aroldis Chapman.",
  "Swimming was an event at the very first modern Olympic Games in 1896, held in the open ocean."
];

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

  // Push everything to the center
  root.addSpacer();

  // ==========================================
  // LEFT HALF: Last Session
  // ==========================================
  const left = root.addStack();
  left.size = new Size(155, 0);
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
  // VERTICAL DIVIDER
  // ==========================================
  const divider = root.addStack();
  divider.size = new Size(1, 100); 
  divider.backgroundColor = new Color("#000000", 0.08); 

  // ==========================================
  // RIGHT HALF: Daily Sports Fact
  // ==========================================
  // Calculate day of the year to pick a consistent daily fact
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const dailyFact = SPORTS_FACTS[dayOfYear % SPORTS_FACTS.length];

  const right = root.addStack();
  right.size = new Size(155, 0);
  right.setPadding(16, 16, 16, 16);
  right.layoutVertically();
  right.centerAlignContent();

  const header = right.addStack();
  header.layoutHorizontally();
  header.centerAlignContent();
  
  const hIcon = header.addText("💡");
  hIcon.font = Font.systemFont(11);
  header.addSpacer(4);
  const hTitle = header.addText("DAILY FACT");
  hTitle.font = Font.boldSystemFont(9);
  hTitle.textColor = new Color("#BBBBBB");

  right.addSpacer(8);

  const factTxt = right.addText(`"${dailyFact}"`);
  factTxt.font = Font.mediumSystemFont(11);
  factTxt.textColor = C.black;
  factTxt.lineLimit = 6;
  factTxt.minimumScaleFactor = 0.6;

  // Push everything to the center
  root.addSpacer();

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
