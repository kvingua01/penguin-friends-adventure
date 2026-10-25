"use strict";
// Penguin Friends Adventure: a self-contained, original four-chapter RPG.
const $ = (id) => document.getElementById(id),
  canvas = $("game"),
  ctx = canvas.getContext("2d");
const W = 960,
  H = 576,
  SAVE_KEY = "penguin-friends-story-v1";
const keys = new Set(),
  movement = [
    "w",
    "a",
    "s",
    "d",
    "arrowup",
    "arrowdown",
    "arrowleft",
    "arrowright",
  ];
const items = {
  fish: { name: "Silver fish", heal: 35 },
  boonona: { name: "Boonona", heal: 25 },
  soup: { name: "Pippy’s soup", heal: 65 },
};
const palettes = [
  {
    sea: "#23576c",
    land: "#e1f1ec",
    edge: "#83b6c7",
    path: "#bdd9dd",
    accent: "#5a8994",
  },
  {
    sea: "#24596b",
    land: "#e6d6a4",
    edge: "#bdac79",
    path: "#cbb984",
    accent: "#729574",
  },
  {
    sea: "#193c57",
    land: "#aebdbb",
    edge: "#6d909e",
    path: "#8b9fa7",
    accent: "#516f85",
  },
  {
    sea: "#1c314c",
    land: "#889dab",
    edge: "#536e89",
    path: "#667f98",
    accent: "#425e7f",
  },
  {
    sea: "#16263e",
    land: "#91a7ac",
    edge: "#4a6981",
    path: "#648095",
    accent: "#405a7c",
  },
  {
    sea: "#101f36",
    land: "#688292",
    edge: "#3f5977",
    path: "#526b88",
    accent: "#314b70",
  },
];
const WORLD = window.PENGUIN_WORLD;
const maps = [
  { name: "Frostbell Island", chapter: 1, tag: "A SMALL BEGINNING" },
  { name: "Boonona Bay", chapter: 2, tag: "SOMETHING BEYOND THE SNOW" },
  { name: "The Quiet Cove", chapter: 3, tag: "AN EMPTY PLACE BESIDE YOU" },
  {
    name: "Orca Kingdom · Sea Gate",
    chapter: 3,
    tag: "COURAGE IS GOING ANYWAY",
  },
  {
    name: "Orca Kingdom · Tidal Halls",
    chapter: 4,
    tag: "A PROMISE WORTH KEEPING",
  },
  { name: "The Throne of the Sea", chapter: 4, tag: "NO FRIEND LEFT BEHIND" },
];
const enemies = {
  snowcrab: {
    name: "Snowcap Crab",
    hp: 58,
    damage: 9,
    pattern: "rain",
    color: "#a4cdd7",
    intro:
      "A crab raises its frosty mittens. It has mistaken the path for its living room.",
    xp: 1,
  },
  coconut: {
    name: "Boonona Bandit",
    hp: 66,
    damage: 9,
    pattern: "fan",
    color: "#be9870",
    intro:
      "A coconut creature rattles indignantly. Apparently you interrupted its nap.",
    xp: 1,
  },
  reef: {
    name: "Reef Nibbler",
    hp: 70,
    damage: 10,
    pattern: "wave",
    color: "#95b7bc",
    intro: "Something with too many teeth wants to discuss the right of way.",
    xp: 1,
  },
  gull: {
    name: "Storm Gull",
    hp: 68,
    damage: 10,
    pattern: "aim",
    color: "#d4d1c4",
    intro: "A storm gull swoops down. It is extremely confident about this.",
    xp: 1,
  },
  guard: {
    name: "Orca Sentry",
    hp: 84,
    damage: 11,
    pattern: "fan",
    color: "#8fabbf",
    intro: "A sentry lowers its spear. You stand a little taller.",
    xp: 2,
  },
  parents: {
    name: "Mama & Papa",
    hp: 112,
    damage: 7,
    pattern: "rain",
    color: "#b4c6dc",
    boss: true,
    parents: true,
    intro:
      "“The sea is dangerous, Flippy.” Your parents block the way. Maybe you can show them you’re ready.",
    xp: 2,
  },
  baby: {
    name: "Baby Orca",
    hp: 142,
    damage: 11,
    pattern: "wave",
    color: "#91b6c6",
    boss: true,
    intro: "A baby orca splashes into the shallows. “That’s MY island lunch!”",
    xp: 3,
  },
  gate: {
    name: "Captain Undertow",
    hp: 150,
    damage: 11,
    pattern: "aim",
    color: "#aaafd4",
    boss: true,
    intro:
      "“Nobody passes the sea gate.” You think of Slippy. Somebody has to.",
    xp: 3,
  },
  key1: {
    name: "Warden of the Pearl",
    hp: 120,
    damage: 11,
    pattern: "spiral",
    color: "#b8b8d7",
    boss: true,
    intro:
      "The first warden guards a pearl seal. “You cannot open what you cannot earn.”",
    xp: 2,
  },
  key2: {
    name: "Warden of the Tide",
    hp: 128,
    damage: 11,
    pattern: "rain",
    color: "#84b8ba",
    boss: true,
    intro: "The second warden turns the tide against you.",
    xp: 2,
  },
  king: {
    name: "King Orca of the Sea",
    hp: 245,
    damage: 13,
    pattern: "king",
    color: "#adbbd8",
    boss: true,
    intro:
      "“A baby penguin crossed my kingdom?” The King rises. “Then let the sea decide.”",
    xp: 5,
  },
};
for (const [id, hp, damage] of [
  ["snowcrab", 88, 12],
  ["coconut", 98, 13],
  ["reef", 106, 14],
  ["gull", 94, 13],
  ["guard", 126, 15],
  ["parents", 150, 8],
  ["baby", 325, 16],
  ["gate", 380, 17],
  ["key1", 340, 16],
  ["key2", 360, 17],
  ["king", 650, 19],
]) {
  enemies[id].hp = hp;
  enemies[id].damage = damage;
}

let state,
  mode = "title",
  dialogue = null,
  battle = null,
  nearby = null,
  last = 0,
  time = 0,
  particles = [],
  toast = "",
  toastTime = 0,
  confirmReset = false;
let sound = false,
  audio = null,
  musicTick = 0,
  musicStep = 0;

let roomTransition = 0,
  roomTitleTime = 0,
  impact = 0,
  lastFootprint = 0;
const footprints = [];
const camera = { x: 0, y: 0 };
function projectPoint(room, x, y) {
  return [64 + (x - 64) * room.scaleX, 82 + (y - 82) * room.scaleY];
}
function roomCenter(room = currentRoom()) {
  return { x: room.width / 2, y: room.height / 2 };
}
function doorPoint(room, direction) {
  const c = roomCenter(room);
  return {
    E: [room.width - 109, c.y],
    W: [109, c.y],
    N: [c.x, 123],
    S: [c.x, room.height - 95],
  }[direction];
}
function updateCamera(dt = 1, snap = false) {
  const r = currentRoom(),
    x = Math.max(0, Math.min(r.width - W, state.x - W / 2)),
    y = Math.max(0, Math.min(r.height - H, state.y - H / 2));
  const t = snap ? 1 : Math.min(1, dt * 10);
  camera.x += (x - camera.x) * t;
  camera.y += (y - camera.y) * t;
}

function currentRoom() {
  const r =
    WORLD.rooms[state?.room] || WORLD.rooms[WORLD.starts[state?.map || 0]];
  return { ...maps[r.region], ...r };
}
function enterRoom(id, direction) {
  const r = WORLD.rooms[id];
  if (!r || r.region !== state.map) return;
  state.room = id;
  const c = roomCenter(r),
    spawns = {
      E: [160, c.y],
      W: [r.width - 160, c.y],
      N: [c.x, r.height - 155],
      S: [c.x, 175],
    };
  placePlayer(...(spawns[direction] || [c.x, c.y]));
  state.visited[id] = true;
  nearby = null;
  keys.clear();
  roomTransition = 1;
  roomTitleTime = 3;
  footprints.length = 0;
  state.encounterGrace = Math.max(state.encounterGrace || 0, 2);
  state.bossGrace = 1;
  state.encounterDistance = Number.isFinite(state.encounterDistance)
    ? state.encounterDistance
    : 1000;
  updateCamera(1, true);
  updateHud();
  save();
  tone(294, 0.07, "triangle", 0.025);
}

function placePlayer(x, y) {
  if (walkable(x, y)) {
    state.x = x;
    state.y = y;
    return;
  }
  for (let radius = 8; radius < 120; radius += 8)
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ])
      if (walkable(x + dx * radius, y + dy * radius)) {
        state.x = x + dx * radius;
        state.y = y + dy * radius;
        return;
      }
  const center = roomCenter();
  state.x = center.x;
  state.y = center.y;
}
function worldMap() {
  if (mode !== "world" || dialogue) return;
  const region = Object.values(WORLD.rooms).filter(
    (r) => r.region === state.map,
  );
  panel(
    '<div class="eyebrow">YOUR FIELD JOURNAL · CHAPTER ' +
      maps[state.map].chapter +
      "</div><h2>" +
      maps[state.map].name +
      "</h2><p>Gold is your current room. Filled rooms have been visited. Lines show connected doors. Travel by exploring — this map does not teleport you.</p>",
  );
  const grid = document.createElement("div");
  grid.className = "room-map";
  const minX = Math.min(...region.map((r) => r.gx)),
    minY = Math.min(...region.map((r) => r.gy));
  grid.style.gridTemplateColumns =
    "repeat(" +
    (Math.max(...region.map((r) => r.gx)) - minX + 1) +
    ", minmax(0,1fr))";
  for (const r of region) {
    const cell = document.createElement("div");
    cell.className =
      "map-room" +
      (r.id === state.room
        ? " current"
        : state.visited[r.id]
          ? " visited"
          : "");
    cell.style.gridColumn = r.gx - minX + 1;
    cell.style.gridRow = r.gy - minY + 1;
    cell.textContent =
      state.visited[r.id] || r.id === state.room ? r.name : "?";
    cell.title = r.name;
    const exits = document.createElement("small");
    exits.textContent = r.doors
      .map((d) => ({ N: "↑", S: "↓", E: "→", W: "←" })[d.direction])
      .join(" ");
    cell.append(exits);
    grid.append(cell);
  }
  $("overlay").firstChild.append(grid);
  panelButtons([["Back to exploring", closePanel, true]]);
}

function fresh() {
  return {
    version: 3,
    facing: "down",
    encounterDistance: 1000,
    encounterGrace: 10,
    encounterSerial: 0,
    puzzles: {},
    room: "h0",
    visited: { h0: true },
    map: 0,
    x: projectPoint(WORLD.rooms.h0, 480, 350)[0],
    y: projectPoint(WORLD.rooms.h0, 480, 350)[1],
    hp: 120,
    maxHp: 120,
    inventory: { fish: 3, boonona: 0, soup: 1 },
    flags: {},
    xp: 0,
    assist: false,
    steps: 0,
  };
}
state = fresh();
function readSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (
      !s ||
      ![1, 2, 3].includes(s.version) ||
      !Number.isInteger(s.map) ||
      s.map < 0 ||
      s.map >= maps.length ||
      !Number.isFinite(s.x) ||
      !Number.isFinite(s.y) ||
      s.x < 60 ||
      s.x > 2400 ||
      s.y < 75 ||
      s.y > 1800 ||
      s.maxHp !== 120 ||
      !Number.isFinite(s.hp) ||
      s.hp <= 0 ||
      s.hp > 120 ||
      !s.inventory ||
      !s.flags ||
      typeof s.flags !== "object" ||
      Array.isArray(s.flags) ||
      !Number.isFinite(s.xp) ||
      s.xp < 0 ||
      s.xp > 1000
    )
      return null;
    for (const k of Object.keys(items))
      if (
        !Number.isInteger(s.inventory[k]) ||
        s.inventory[k] < 0 ||
        s.inventory[k] > 999
      )
        return null;
    if (
      s.version === 1 ||
      !WORLD.rooms[s.room] ||
      WORLD.rooms[s.room].region !== s.map
    ) {
      s.version = 2;
      s.room = WORLD.starts[s.map];
      s.x = 480;
      s.y = 350;
      s.visited = { [s.room]: true };
    }
    if (!s.visited || typeof s.visited !== "object" || Array.isArray(s.visited))
      s.visited = { [s.room]: true };
    if (s.version < 3) {
      [s.x, s.y] = projectPoint(WORLD.rooms[s.room], s.x, s.y);
      s.version = 3;
    }
    if (
      s.x > WORLD.rooms[s.room].width - 64 ||
      s.y > WORLD.rooms[s.room].height - 64
    )
      return null;
    if (!["up", "down", "left", "right"].includes(s.facing)) s.facing = "down";
    if (!s.puzzles || typeof s.puzzles !== "object" || Array.isArray(s.puzzles))
      s.puzzles = {};
    s.encounterDistance = Number.isFinite(s.encounterDistance)
      ? Math.max(400, s.encounterDistance)
      : 1000;
    s.encounterGrace = 8;
    s.bossGrace = 3;
    s.encounterSerial = Number.isInteger(s.encounterSerial)
      ? s.encounterSerial
      : 0;
    s.assist = !!s.assist;
    return s;
  } catch {
    return null;
  }
}
function save() {
  if (mode !== "world" || dialogue || state.hp <= 0) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    notify(
      "Browser storage unavailable. Keep this tab open to retain progress.",
    );
  }
}
function notify(text) {
  toast = text;
  toastTime = 4;
}
function tone(freq = 440, duration = 0.12, type = "sine", volume = 0.06) {
  if (!sound || !audio) return;
  const o = audio.createOscillator(),
    g = audio.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(volume, audio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  o.connect(g);
  g.connect(audio.destination);
  o.start();
  o.stop(audio.currentTime + duration);
}
function toggleSound() {
  sound = !sound;
  if (sound) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      audio.resume();
      tone(523, 0.2);
    } catch {
      sound = false;
    }
  }
  $("soundButton").textContent = "Sound: " + (sound ? "on" : "off");
  $("soundButton").setAttribute("aria-pressed", String(sound));
}
function updateHud() {
  const m = currentRoom();
  $("chapter").textContent = "CHAPTER 0" + m.chapter + " · " + m.tag;
  $("location").textContent =
    m.name +
    " · " +
    Object.keys(state.visited || {}).filter(
      (id) => WORLD.rooms[id]?.region === state.map,
    ).length +
    "/" +
    Object.values(WORLD.rooms).filter((r) => r.region === state.map).length +
    " rooms";
  $("healthText").textContent =
    "FLIPPY · " + Math.ceil(state.hp) + " / " + state.maxHp;
  $("healthBar").style.width = (state.hp / state.maxHp) * 100 + "%";
  $("healthBar").style.background = state.hp < 35 ? "#e69b83" : "#91c9a9";
  $("objective").textContent = objective();
  $("inventoryButton").disabled = mode !== "world" || !!dialogue;
  $("mapButton").disabled = mode !== "world" || !!dialogue;
}
function objective() {
  const f = state.flags;
  switch (state.map) {
    case 0:
      return !f.metSlippy
        ? "Find Slippy in Lantern Square, east of your home."
        : !f.parents
          ? "Return home and talk to Papa. Show your parents you’re ready."
          : "Follow the forest road east to Frostbell Harbor.";
    case 1:
      return fruitCount() < 3
        ? `Explore the island and gather boononas (${fruitCount()} / 3).`
        : !f.baby
          ? "Face Baby Orca at Breakwater Beach, east of Golden Orchard."
          : "Leave from the eastern side of Breakwater Beach.";
    case 2:
      return !f.pippy
        ? "Find Pippy at his mooring, beyond Shipwreck Strand and Broken Jetty."
        : "Board the ferry at Pippy’s Mooring.";
    case 3:
      return !f.gate
        ? "Explore the barracks, then challenge Captain Undertow at the Sea Gate."
        : "The sea gate is open. Enter the kingdom to the east.";
    case 4:
      return !f.key1 || !f.key2
        ? `Defeat both wardens and collect their seals (${Number(!!f.key1) + Number(!!f.key2)} / 2).`
        : "Bring both seals to the Two-Seal Door, beyond the Gallery of Crowns.";
    case 5:
      return !f.king
        ? "Cross the royal halls and face King Orca in the throne room."
        : !f.ending
          ? "Open Slippy’s cage. Keep your promise."
          : "Slippy is safe. A new horizon is waiting.";
  }
}
function fruitCount() {
  return ["fruit1", "fruit2", "fruit3"].filter((k) => state.flags[k]).length;
}
function panel(html) {
  keys.clear();
  $("overlay").innerHTML = '<section class="panel">' + html + "</section>";
  $("overlay").hidden = false;
}
function closePanel() {
  keys.clear();
  $("overlay").hidden = true;
  $("overlay").innerHTML = "";
  confirmReset = false;
  canvas.focus({ preventScroll: true });
}
function button(label, fn, primary = false) {
  const b = document.createElement("button");
  b.textContent = label;
  b.className = primary ? "primary" : "";
  b.onclick = fn;
  return b;
}
function panelButtons(buttons) {
  const div = document.createElement("div");
  div.className = "buttons";
  buttons.forEach((x) => div.append(button(...x)));
  $("overlay").firstChild.append(div);
}
function title() {
  mode = "title";
  battle = null;
  dialogue = null;
  $("dialogue").hidden = true;
  $("battleControls").hidden = true;
  updateHud();
  const saved = readSave();
  panel(
    '<div class="eyebrow">48 SCROLLING ROOMS · FOUR CHAPTERS</div><h2>A bigger world.<br>A braver little penguin.</h2><p>Explore forests, villages, caves, ruins, and royal halls as Flippy, a baby emperor penguin with a very big promise. Leave home, explore Boonona Bay, and cross the Orca Kingdom to bring your best friend back.</p><small>Move: WASD / arrows · Talk: E / Space<br>In battle, time your strike, then move the heart to dodge.<br>M opens your room map. Walking can trigger battles outside safe areas.</small>',
  );
  const bs = [];
  if (saved)
    bs.push([
      "Continue adventure",
      () => {
        state = saved;
        mode = "world";
        placePlayer(state.x, state.y);
        updateCamera(1, true);
        closePanel();
        updateHud();
      },
      true,
    ]);
  bs.push([
    "New adventure",
    () => {
      if (saved) {
        panel(
          "<h2>A fresh beginning?</h2><p>This replaces the saved adventure in this browser.</p>",
        );
        panelButtons([
          ["Start over", newGame, true],
          ["Keep my save", title],
        ]);
      } else newGame();
    },
    !saved,
  ]);
  bs.push(["How to play", instructions]);
  panelButtons(bs);
}
function newGame() {
  state = fresh();
  mode = "world";
  updateCamera(1, true);
  closePanel();
  updateHud();
  say(
    "FLIPPY",
    [
      "The sea looks bigger every morning. Today, I’m finally going to see what’s out there.",
      "Slippy said he’d meet me on the path. An adventure is better with a friend.",
    ],
    () => save(),
  );
}
function instructions() {
  panel(
    "<h2>A field guide for little flippers</h2><p>Walk with WASD, arrow keys, or the on-screen direction pad. Stand near a character or object and press E / Space or INTERACT. Regular fights happen while you walk outside safe areas; approach bosses to face them.</p><p>FIGHT starts a moving strike marker. Press Enter, E, Space, or STRIKE near the center for more damage. Then move your heart inside the battle box until the attack timer ends. Bosses change attacks mid-turn in later phases.</p><p>ITEM consumes a healing turn. FLEE unlocks after dealing enough damage in normal encounters. Major bosses cannot be fled from, except your parents, who also have ACT.</p><p>Rest lanterns fully heal you, save your journey, and supply one fish if your bag is empty. Assist mode slows attacks and reduces incoming damage. No story content changes.</p>",
  );
  panelButtons([["Back", () => (mode === "title" ? title() : menu()), true]]);
}
function menu() {
  if (dialogue) return;
  panel(
    '<div class="eyebrow">TAKE A BREATHER</div><h2>Your adventure</h2><p>' +
      objective() +
      "</p><small>Save stays on this device and browser. Live battles are not saved; reload returns to your last exploration checkpoint.</small>",
  );
  panelButtons([
    ["Resume", closePanel, true],
    [
      "Assist: " + (state.assist ? "on" : "off"),
      () => {
        state.assist = !state.assist;
        save();
        menu();
      },
    ],
    ["How to play", instructions],
    ...(mode === "world"
      ? [
          [
            "Save progress",
            () => {
              save();
              notify("Adventure saved in this browser.");
              closePanel();
            },
          ],
        ]
      : []),
    [
      "Return to title",
      () => {
        if (mode === "battle") {
          panel(
            "<h2>Leave this battle?</h2><p>You’ll return to your last saved exploration checkpoint.</p>",
          );
          panelButtons([
            [
              "Return to title",
              () => {
                closePanel();
                title();
              },
            ],
            ["Keep playing", closePanel, true],
          ]);
        } else {
          save();
          title();
        }
      },
    ],
  ]);
}
function say(name, lines, done) {
  keys.clear();
  dialogue = { name, lines, index: 0, done };
  $("dialogue").hidden = false;
  showLine();
  tone(440, 0.05, "triangle", 0.025);
  updateHud();
}
function showLine() {
  $("speaker").textContent = dialogue.name.toUpperCase();
  $("line").textContent = dialogue.lines[dialogue.index];
  $("next").textContent =
    dialogue.index === dialogue.lines.length - 1
      ? "Finish → [E / Space]"
      : "Continue → [E / Space]";
}
function advance() {
  if (!dialogue) return;
  dialogue.index++;
  tone(493, 0.04, "triangle", 0.02);
  if (dialogue.index < dialogue.lines.length) showLine();
  else {
    const done = dialogue.done;
    dialogue = null;
    $("dialogue").hidden = true;
    if (done) done();
    updateHud();
    if (mode === "world" && !dialogue) save();
  }
}
function inventory(inBattle = false) {
  if (inBattle && battle.phase !== "choice") return;
  panel(
    '<div class="eyebrow">FLIPPY’S LITTLE BAG</div><h2>Something for the road</h2><p>Health: ' +
      Math.ceil(state.hp) +
      " / " +
      state.maxHp +
      (inBattle ? " · Using an item takes your turn." : "") +
      "</p>",
  );
  for (const [id, item] of Object.entries(items)) {
    const row = document.createElement("div");
    row.className = "item";
    const label = document.createElement("span");
    label.textContent = item.name + " × " + state.inventory[id];
    const b = button("Heal " + item.heal, () => {
      if (!state.inventory[id] || state.hp >= state.maxHp) return;
      state.inventory[id]--;
      state.hp = Math.min(state.maxHp, state.hp + item.heal);
      tone(660, 0.2);
      updateHud();
      if (inBattle) {
        closePanel();
        battle.message =
          "You ate " +
          item.name.toLowerCase() +
          ". A little warmth goes a long way.";
        beginDodge();
      } else {
        save();
        inventory();
      }
    });
    b.disabled = !state.inventory[id] || state.hp >= state.maxHp;
    row.append(label, b);
    $("overlay").firstChild.append(row);
  }
  panelButtons([["Back", closePanel, true]]);
}
function activeObjects() {
  const m = currentRoom();
  return m.objects.filter((o) => {
    const [type, , , id] = o;
    if (type === "fruit" || type === "chest" || type === "boss")
      return !state.flags[id];
    return true;
  });
}
function targets() {
  const m = currentRoom();

  return [
    ...puzzleTargets(m),
    ...m.npcs.map((n) => ({
      kind: "npc",
      name: n[0],
      x: n[1],
      y: n[2],
      id: n[3],
    })),
    ...activeObjects().map((o) => ({
      kind: o[0],
      name:
        {
          shrine: "Rest lantern",
          chest: "Supply chest",
          fruit: "Boonona grove",
          boss: enemies[o[3]]?.name,
          cage: "Slippy",
          journal: "Explorer’s note",
          switch: {
            "winter-bell": "Old winter bell",
            "sea-beacon": "Beacon",
            "archive-lamp": "Archive lantern",
            "sluice-wheel": "Sluice wheel",
          }[o[3]],
        }[o[0]] || "Inspect",
      x: o[1],
      y: o[2],
      id: o[3],
    })),
    ...m.enemies
      .filter((e) => !state.flags[e[1]])
      .map((e) => ({
        kind: "enemy",
        name: enemies[e[0]].name,
        x: e[2],
        y: e[3],
        id: e[1],
        enemy: e[0],
      })),
    ...m.doors.map((d) => ({
      kind: "exit",
      name:
        d.to === "region"
          ? [
              "Sail to Boonona Bay",
              "Follow the current",
              "Board Pippy’s ferry",
              "Enter Orca Kingdom",
              "Open the royal halls",
            ][state.map]
          : WORLD.rooms[d.to].name,
      x: doorPoint(m, d.direction)[0],
      y: doorPoint(m, d.direction)[1],
      ...d,
    })),
  ];
}

function interact() {
  if (!$("overlay").hidden) return;
  if (dialogue) {
    advance();
    return;
  }
  if (mode === "battle") {
    if (battle.phase === "strike") finishStrike();
    else if (battle.phase === "result") battle.done();
    return;
  }
  if (mode !== "world" || !nearby) return;
  const n = nearby;
  switch (n.kind) {
    case "puzzle":
      interactPuzzle(n);
      break;
    case "npc":
      talk(n.id);
      break;
    case "enemy":
      break;
    case "boss":
      if (n.id === "baby" && fruitCount() < 3) {
        say("BABY ORCA", [
          "No snacks, no passage! There are three boonona groves on this island.",
        ]);
        return;
      }
      break;
    case "shrine":
      state.hp = state.maxHp;
      if (Object.values(state.inventory).every((v) => v === 0))
        state.inventory.fish = 1;
      say(
        "REST LANTERN",
        [
          "You warm your flippers by the little lantern. Somewhere, a friend is thinking of you.",
          "Health restored. Your adventure will be saved here.",
        ],
        () => {
          updateHud();
          save();
          notify("Rested & saved.");
        },
      );
      tone(587, 0.3);
      break;
    case "chest":
      state.flags[n.id] = true;
      state.inventory.fish += 2;
      state.inventory.soup++;
      say("SUPPLIES", [
        "Two silver fish and a jar of Pippy’s soup. Someone packed with love.",
      ]);
      break;
    case "fruit":
      state.flags[n.id] = true;
      state.inventory.boonona += 2;
      say("FLIPPY", [
        `Two sweet boononas! That’s grove ${fruitCount()} of 3. One for now, one for later.`,
      ]);
      break;
    case "journal":
      say("EXPLORER’S NOTE", [currentRoom().note]);
      break;
    case "switch": {
      const messages = {
        "winter-bell": [
          "The bell rings over the frozen lake. For a moment, the island rings back.",
          "A little courage, carried on the wind.",
        ],
        "sea-beacon": [
          "The beacon catches fire. Somewhere offshore, Pippy turns his boat toward the light.",
        ],
        "archive-lamp": [
          "Warm light runs along the archive shelves. The pearl chamber door unlocks to the east.",
        ],
        "sluice-wheel": [
          "You turn the heavy wheel. The flood recedes. The eastern cistern passage is open.",
        ],
      };
      if (!state.flags[n.id]) {
        state.flags[n.id] = true;
        tone(660, 0.4);
      }
      say("FLIPPY", messages[n.id] || ["Something changes in the distance."]);
      break;
    }
    case "sign":
      say("TRAIL SIGN", [signText()]);
      break;
    case "exit":
      if (n.requires && !state.flags[n.requires]) {
        say("LOCKED PASSAGE", [
          n.requires === "archive-lamp"
            ? "The pearl door is dark. Light the archive lantern first."
            : "Water blocks the way. Turn the sluice wheel in Floodworks.",
        ]);
      } else if (n.to && n.to !== "region") enterRoom(n.to, n.direction);
      else exitMap();
      break;
    case "cage":
      if (!state.flags.king)
        say("SLIPPY", [
          "Flippy! You came! The King has the cage key. Please be careful!",
        ]);
      else if (!state.flags.ending) {
        state.flags.ending = true;
        say(
          "SLIPPY",
          [
            "I knew you’d come. I tried to be brave, but… it was pretty scary.",
            "You crossed a whole kingdom for me? Next time, I’m packing enough lunch for both of us.",
          ],
          ending,
        );
      } else say("SLIPPY", ["Wherever we go next, let’s go together."]);
  }
}
function talk(id) {
  if (WORLD.conversations[id]) {
    if (!state.flags["gift-" + id]) {
      state.flags["gift-" + id] = true;
      if (id === "drift") state.inventory.soup++;
      else if (id === "moss") state.inventory.fish += 2;
    }
    say(id.toUpperCase(), WORLD.conversations[id]);
    return;
  }
  const f = state.flags;
  if (id === "slippy") {
    if (state.map === 0 && !f.metSlippy) {
      f.metSlippy = true;
      say("SLIPPY", [
        "Flippy! I heard there’s an island where boononas grow on trees. Well… all boononas do. You know what I mean.",
        "Your parents are waiting near the igloo. If we’re going to leave, we should tell them together.",
      ]);
    } else if (state.map === 0)
      say("SLIPPY", [
        "Your papa looks serious. Try talking to him. I’ll be right here.",
      ]);
    else
      say("SLIPPY", [
        fruitCount() < 3
          ? "Three boonona groves, an entire island, and absolutely no reason to skip lunch."
          : !f.baby
            ? "That baby orca is blocking the eastern shallows. I believe in you, Flippy."
            : "A new current! I wonder where it goes.",
      ]);
  } else if (id === "mama")
    say("MAMA", [
      f.parents
        ? "The world can be rough. Remember: being brave doesn’t mean being alone."
        : "We know you want to explore. Talk to Papa. We just need to know you’ll be safe.",
    ]);
  else if (id === "parents") {
    if (f.parents)
      say("PAPA", [
        "You showed us your courage. The eastern dock is ready. Take care of each other.",
      ]);
    else if (!f.metSlippy)
      say("PAPA", [
        "Find Slippy first, little one. Big plans deserve a good friend.",
      ]);
    else startBattle("parents", "parents");
  } else if (id === "pippy") {
    if (!f.pippy) {
      f.pippy = true;
      say("PIPPY", [
        "An orca patrol took your friend? Then there’s only one place they’re heading. The Orca Kingdom.",
        "I can get you to the sea gate. After that… I’m a sailor, not a soldier.",
        "Board my boat when you’re ready. There’s soup in the supply chests. Courage works better with a full belly.",
      ]);
    } else
      say("PIPPY", [
        "The boat’s waiting at the eastern dock. We sail when you’re ready.",
      ]);
  } else if (id === "pebble")
    say("PEBBLE", [
      "Not every orca agrees with the King. My name is Pebble. I keep the halls clean, mostly of terrible royal poetry.",
      "The pearl warden waits northwest. The tide warden waits southeast. You need both seals for the throne-room door.",
      "Your friend hasn’t stopped talking about you. Go prove him right.",
    ]);
}
function signText() {
  return [
    "FROSTBELL ISLAND\nHome ↑ · Eastern dock →\nRest lanterns heal and save. Supply chests contain food.",
    "BOONONA BAY\nThree fruit groves grow around the shore.\nBaby Orca guards the eastern passage.",
    "QUIET COVE\nPippy’s boat →\nA path still exists, even when you can’t see the whole thing.",
    "SEA GATE\nCaptain Undertow guards the kingdom.\nRest before you challenge him.",
    "TIDAL HALLS\nPearl seal ↖ · Tide seal ↘\nTwo seals open one door →",
    "THRONE OF THE SEA\nRest here. Your next step is yours.",
  ][state.map];
}
function exitMap() {
  const f = state.flags;
  if (state.map === 0) {
    if (!f.parents) {
      say("FLIPPY", ["I should talk to my parents before we leave."]);
      return;
    }
    changeMap(1);
    say("SLIPPY", [
      "Sand! Trees! Flippy, this place has colors I’ve never eaten before.",
      "Let’s visit all three boonona groves before we head onward.",
    ]);
  } else if (state.map === 1) {
    if (!f.baby) {
      say("FLIPPY", [
        "Baby Orca is still guarding the passage. We need to face him first.",
      ]);
      return;
    }
    changeMap(2);
    f.captured = true;
    say(
      "NARRATOR",
      [
        "A dark shape cuts through the current. Then another. Orca soldiers surround the little raft.",
        "“By order of the King!” A wave crashes between you and Slippy. When the spray clears, he is gone.",
      ],
      () =>
        say("FLIPPY", [
          "Slippy! …No. I’m not leaving without you.",
          "There’s a sailor at the far dock. Maybe he knows where they went.",
        ]),
    );
  } else if (state.map === 2) {
    if (!f.pippy) {
      say("FLIPPY", [
        "I shouldn’t borrow a stranger’s boat. I’ll talk to Pippy first.",
      ]);
      return;
    }
    changeMap(3);
    say(
      "PIPPY",
      [
        "This is as far as I go, Flippy. The sea gate is just ahead.",
        "I’m sorry. The King frightens me more than any storm. I’ll keep the boat ready.",
      ],
      () => say("FLIPPY", ["I’m frightened too. But Slippy is waiting."]),
    );
  } else if (state.map === 3) {
    if (!f.gate) {
      say("FLIPPY", ["Captain Undertow is blocking the sea gate."]);
      return;
    }
    changeMap(4);
    say("FLIPPY", [
      "Slippy’s in here somewhere. Two seals. One throne room. One friend to bring home.",
    ]);
  } else if (state.map === 4) {
    if (!f.key1 || !f.key2) {
      say("SEALED DOOR", [
        "Two hollows in the stone. A pearl and a tide. Both wardens hold a seal.",
      ]);
      return;
    }
    changeMap(5);
    say("KING ORCA OF THE SEA", [
      "So the little penguin has arrived. Come closer, then. Let me see this courage everyone whispers about.",
    ]);
  }
}
function changeMap(index) {
  state.map = index;
  state.room = WORLD.starts[index];
  const r = currentRoom();
  placePlayer(...projectPoint(r, 480, 350));
  state.visited[state.room] = true;
  nearby = null;
  keys.clear();
  roomTransition = 1;
  roomTitleTime = 3;
  state.encounterGrace = 12;
  state.encounterDistance = 900;
  updateCamera(1, true);
  updateHud();
  save();
  tone(392, 0.25);
}

function ending() {
  mode = "world";
  save();
  panel(
    '<div class="eyebrow">THE END · AND THE BEGINNING</div><h2>Some things are bigger<br>than the ocean.</h2><p>The King lowers his crown. For the first time, the throne room is quiet enough to hear a small voice.</p><p>“I only wanted a friend,” he says.</p><p>“Then ask,” Flippy answers. “You don’t have to take one.”</p><p>Pippy’s boat carries two little penguins home beneath a sky full of stars. There are boononas in the bag, stories to tell, and a place beside Flippy that will never be empty.</p><small>Thank you for playing all four chapters.<br>Original story adaptation, pixel art, and synthesized audio.<br>Expanded edition — your feedback shapes what comes next.</small>',
  );
  panelButtons([
    [
      "Keep exploring",
      () => {
        closePanel();
        changeMap(0);
      },
      true,
    ],
    ["Return to title", title],
  ]);
}
// Battle phases: choice → strike → dodge → choice, or result.
function startBattle(type, id) {
  if (mode !== "world") return;
  save();
  mode = "battle";
  keys.clear();
  const data = enemies[type];
  battle = {
    ...data,
    type,
    id,
    hp: data.hp,
    maxHp: data.hp,
    phase: "choice",
    message: data.intro,
    turn: 0,
    acts: 0,
    damageDealt: 0,
    bullets: [],
    hazards: [],
    recent: [],
    attackHistory: [],
    phaseLevel: 1,
    duration: 7.5,
    volley: 0,
    heart: { x: 480, y: 408 },
    invulnerable: 0,
    phaseTime: 0,
    spawnTime: 0,
    marker: 0,
    checkpoint: { x: state.x, y: state.y },
    done: null,
  };
  $("battleControls").hidden = false;
  updateHud();
  battleUI();
  tone(220, 0.3, "triangle");
}
function fleeAllowed() {
  return !battle.boss || battle.parents;
}
function fleeUnlocked() {
  return (
    fleeAllowed() &&
    (battle.damageDealt >= battle.maxHp * 0.28 || battle.acts >= 2)
  );
}
function battleUI() {
  if (!battle) return;
  $("battleMessage").textContent = battle.message;
  const a = $("battleActions");
  a.innerHTML = "";
  if (battle.phase === "choice") {
    a.append(
      button("FIGHT", () => {
        battle.phase = "strike";
        battle.phaseTime = 0;
        battle.marker = 0;
        battle.message =
          "Press Enter, E, Space, or STRIKE when the marker reaches the center.";
        battleUI();
      }),
    );
    a.append(button("ITEM", () => inventory(true)));
    const flee = button(
      fleeAllowed()
        ? fleeUnlocked()
          ? "FLEE"
          : "FLEE · LOCKED"
        : "FLEE · BOSS",
      () => {
        if (fleeUnlocked()) finishBattle("flee");
      },
    );
    flee.disabled = !fleeUnlocked();
    a.append(flee);
    if (battle.parents) a.append(button("ACT", act));
  } else if (battle.phase === "strike")
    a.append(button("STRIKE · ENTER / E / SPACE", finishStrike, true));
  else if (battle.phase === "dodge") {
    const b = button("MOVE THE HEART · DODGE", () => {});
    b.disabled = true;
    a.append(b);
  } else if (battle.phase === "result")
    a.append(button("Continue →", () => battle.done(), true));
}
function act() {
  if (battle.phase !== "choice") return;
  battle.acts++;
  battle.message =
    battle.acts === 1
      ? "“I’m scared, too. But I want to see the world with Slippy.” Your parents listen."
      : "“We’ll take care of each other.” Your parents step aside. FLEE is now unlocked.";
  tone(523, 0.2);
  beginDodge();
}
function finishStrike() {
  if (!battle || battle.phase !== "strike" || !$("overlay").hidden) return;
  const accuracy = 1 - Math.abs(battle.marker - 0.5) * 2;
  const damage = Math.round(
    19 + accuracy * 22 + Math.min(8, Math.floor(state.xp / 4)),
  );
  battle.hp = Math.max(0, battle.hp - damage);
  battle.damageDealt += damage;
  battle.flash = 0.3;
  battle.lastDamage = damage;
  battle.message =
    (accuracy > 0.82
      ? "Perfect timing! "
      : accuracy > 0.4
        ? "A solid hit! "
        : "A glancing hit. ") +
    damage +
    " damage.";
  tone(180 + accuracy * 300, 0.15, "triangle");
  if (battle.hp <= 0) {
    finishBattle("win");
    return;
  }
  beginDodge();
}
function beginDodge() {
  const b = battle;
  b.phase = "dodge";
  b.phaseTime = 0;
  b.spawnTime = 0;
  b.turn++;
  b.volley = 0;
  b.extraRayUsed = false;
  b.bullets = [];
  b.hazards = [];
  b.phaseLevel =
    b.parents || !b.boss
      ? 1
      : b.hp / b.maxHp < 0.3
        ? 3
        : b.hp / b.maxHp < 0.65
          ? 2
          : 1;
  b.duration = b.parents ? 6.8 : b.boss ? 8.2 + (b.phaseLevel - 1) * 0.9 : 7.2;
  chooseAttack(b);
  b.heart = { x: 480, y: 425 };
  b.invulnerable = 0.8;
  b.message +=
    " " +
    ATTACKS[b.attack].name +
    ": " +
    ATTACKS[b.attack].hint +
    (b.phaseLevel >= 2 ? " The pattern will change halfway through." : "");
  keys.clear();
  battleUI();
}

function finishBattle(outcome) {
  const b = battle;
  b.phase = "result";
  b.bullets = [];
  b.hazards = [];
  keys.clear();
  if (outcome === "win") {
    state.flags[b.id] = true;
    state.xp = Math.min(999, state.xp + b.xp);
    state.inventory.fish++;
    if (b.boss) state.inventory.soup++;
    b.message = b.parents
      ? "Your parents see your determination. The eastern dock is open."
      : b.type === "king"
        ? "The King’s crown falls silent. You found the cage key. Go to Slippy!"
        : "Victory! You found a silver fish" +
          (b.boss ? " and a jar of soup." : ".");
    tone(659, 0.4);
  } else if (outcome === "flee") {
    if (b.parents) state.flags.parents = true;
    else state.flags[b.id] = true;
    b.message = b.parents
      ? "Your parents step aside. “Be brave. Be kind. Come home.”"
      : "You slip past while the enemy catches its breath.";
  } else {
    b.message =
      "Even the bravest flippers need another chance. Retry with full health; your supplies from before this battle return.";
  }
  b.done = () => {
    if (battle !== b) return;
    if (outcome === "lose") {
      const assist = state.assist;
      const saved = readSave();
      if (saved) state = saved;
      state.assist = assist;
      state.hp = state.maxHp;
      state.inventory.fish = Math.max(2, state.inventory.fish);
    }
    mode = "world";
    battle = null;
    $("battleControls").hidden = true;
    if (walkable(state.x - 24, state.y)) state.x -= 24;
    state.encounterGrace = 14;
    state.bossGrace = 3;
    state.encounterDistance = 1100 + Math.random() * 650;
    updateCamera(1, true);
    closePanel();
    updateHud();
    save();
    if (outcome !== "lose") {
      if (b.parents)
        say("MAMA & PAPA", [
          "We can’t keep you little forever. Take care of Slippy, and let him take care of you.",
          "The eastern dock is ready. Your story belongs to you now.",
        ]);
      else if (b.type === "baby")
        say("BABY ORCA", [
          "All right! You’re tougher than you look. The current is yours.",
          "…If you see my dad, tell him I’m not ready to come home yet.",
        ]);
      else if (b.type === "gate")
        say("CAPTAIN UNDERTOW", [
          "Nobody has crossed this gate for a friend before. I hope you find yours.",
        ]);
      else if (b.type === "key1" || b.type === "key2")
        say("FLIPPY", [
          b.type === "key1"
            ? "The pearl seal. Smooth and warm, like a promise."
            : "The tide seal. One step closer to Slippy.",
        ]);
      else if (b.type === "king")
        say("KING ORCA", [
          "You could have turned back. Every time. And still you came.",
          "Take the key. I… have much to learn about friendship.",
        ]);
    }
  };
  battleUI();
  updateHud();
}
function bullet(x, y, vx, vy, r = 6, kind = "orb", extra = {}) {
  battle.bullets.push({ x, y, vx, vy, r, kind, age: 0, ...extra });
}
const arena = { x: 248, y: 307, w: 464, h: 226 };
const ATTACKS = Object.fromEntries(
  [
    ["snowcrab.claws", "Pincer Trap", "Leave the marked claw lanes.", 1.05],
    [
      "snowcrab.snow",
      "Frost Flakes",
      "Find the opening between drifting snow shards.",
      0.55,
    ],
    [
      "snowcrab.burrow",
      "Under the Ice",
      "Watch the cracking circles before the claws burst.",
      1.15,
    ],
    [
      "coconut.seeds",
      "Seed Scatter",
      "Seeds arc downward. Watch their landing paths.",
      0.68,
    ],
    [
      "coconut.roll",
      "Rolling Lunch",
      "Coconuts ricochet along the lower lanes.",
      0.9,
    ],
    [
      "coconut.vines",
      "Hungry Vines",
      "Leave the sprouting green columns.",
      1.1,
    ],
    ["reef.school", "School Rush", "Fish weave from alternating sides.", 0.72],
    [
      "reef.jaws",
      "Closing Jaws",
      "Follow the moving opening between the jaws.",
      1.3,
    ],
    [
      "reef.bubbles",
      "Bubble Trouble",
      "Rising bubbles split into sideways nibbles.",
      0.8,
    ],
    [
      "gull.feathers",
      "Featherfall",
      "Feathers drift diagonally through the box.",
      0.48,
    ],
    [
      "gull.dive",
      "Shadow Dive",
      "Leave the marked shadow before the gull dives.",
      1.12,
    ],
    [
      "gull.gust",
      "Storm Wings",
      "The wind pushes you. Steer against it.",
      0.72,
    ],
    [
      "guard.spears",
      "Sentry Spears",
      "Four walls, four spear tips. Watch your flanks.",
      0.85,
    ],
    [
      "guard.shield",
      "Shield March",
      "Move into the gap in the shield formation.",
      1.05,
    ],
    [
      "guard.watch",
      "Searchlight",
      "Stay out of the sentry’s marked sight line.",
      1.05,
    ],
    [
      "parents.snow",
      "Snowball Practice",
      "Dodge the soft, slow snowballs.",
      0.8,
    ],
    [
      "parents.lesson",
      "Follow the Safe Lane",
      "Find the wide opening Mama leaves for you.",
      1.2,
    ],
    [
      "parents.hugs",
      "Overprotective Hugs",
      "Slip between Papa’s widening snow rings.",
      1.25,
    ],
    ["baby.breach", "Little Breach", "Move out of the splash lane.", 1.16],
    [
      "baby.splash",
      "Playful Splashes",
      "Water drops rise, then fall back down.",
      0.75,
    ],
    ["baby.spout", "Baby Blowhole", "The water jets rise from below.", 0.9],
    [
      "baby.tail",
      "Tail Tantrum",
      "Thread the wobbly gaps in the tail waves.",
      1.05,
    ],
    [
      "gate.harpoon",
      "Returning Harpoon",
      "Harpoons turn around. Don’t follow them.",
      0.85,
    ],
    [
      "gate.march",
      "Captain’s Formation",
      "Find the open column between the spears.",
      1.03,
    ],
    [
      "gate.anchor",
      "Depth Anchors",
      "Anchors burst into six heavy fragments.",
      1.2,
    ],
    [
      "gate.cross",
      "Crossed Orders",
      "Diagonal spears cross in the center.",
      0.9,
    ],
    [
      "key1.orbit",
      "Pearl Satellites",
      "Pearls orbit a slowly falling center.",
      0.72,
    ],
    [
      "key1.prism",
      "Prism Reflections",
      "Watch the paired columns of light.",
      1.1,
    ],
    [
      "key1.chain",
      "Pearl Necklace",
      "Strings of pearls curl across the box.",
      0.68,
    ],
    [
      "key1.nova",
      "Shattered Pearl",
      "A turning pearl opens into star rays.",
      1.15,
    ],
    [
      "key2.sluice",
      "Open the Floodgates",
      "Find the gap in the falling columns.",
      0.7,
    ],
    [
      "key2.whirl",
      "Royal Whirlpool",
      "The current pulls while water circles you.",
      0.64,
    ],
    [
      "key2.undertow",
      "Reverse Tide",
      "Find the opening in the rising tide.",
      1.05,
    ],
    [
      "key2.surge",
      "High Water",
      "Keep moving out of the rising flood lanes.",
      1.3,
    ],
    [
      "king.crown",
      "Crown of the Deep",
      "Gold lanes mark the King’s cross of light.",
      1.12,
    ],
    [
      "king.trident",
      "Three-Pronged Promise",
      "Tridents arrive in aimed triples.",
      0.8,
    ],
    [
      "king.decree",
      "Restless Edict",
      "Keep moving: golden royal seals only hurt if you stand still.",
      0.72,
    ],
    [
      "king.eclipse",
      "The Lonely Crown",
      "Give the dark stars room before they burst.",
      1.05,
    ],
    [
      "king.storm",
      "The King’s Last Storm",
      "Ride through the shifting gap and watch for crownlight.",
      1.2,
    ],
  ].map(([id, name, hint, interval]) => [id, { name, hint, interval }]),
);
const movePools = Object.fromEntries(
  Object.keys(enemies).map((type) => [
    type,
    Object.keys(ATTACKS).filter((id) => id.startsWith(type + ".")),
  ]),
);

function chooseAttack(b) {
  const pool = movePools[b.type];
  let choices = pool.filter((p) => !b.recent.includes(p));
  if (!choices.length) choices = pool.filter((p) => p !== b.recent.at(-1));
  const selected = choices[Math.floor(Math.random() * choices.length)];
  b.recent.push(selected);
  if (b.recent.length > 2) b.recent.shift();
  b.attack = selected;
  b.attackHistory.push(selected);
  b.secondary =
    pool.find((p) => p !== selected && p !== b.recent[0]) || pool[0];
}
function hazard(kind, x, y, w, h, warning = 0.85, duration = 0.32) {
  const item = {
    kind,
    x,
    y,
    w,
    h,
    age: 0,
    warning: warning * (state.assist ? 1.35 : 1),
    duration,
    fired: false,
  };
  battle.hazards.push(item);
  return item;
}
function claimExtraRay() {
  if (battle.extraRayUsed || battle.phaseTime < 3.2) return false;
  battle.extraRayUsed = true;
  return true;
}
function spawnPattern(pattern = battle.attack) {
  const b = battle,
    a = arena,
    t = b.phaseTime,
    n = b.volley,
    rate = state.assist ? 0.7 : 1,
    speed =
      (b.parents ? 76 : b.boss ? 145 : 113) *
      (1 + (b.phaseLevel - 1) * 0.11) *
      rate,
    L = a.x,
    T = a.y,
    R = L + a.w,
    B = T + a.h;
  const aim = (x, y, count = 1, spread = 0.18, kind = "shard", extra = {}) => {
    const angle = Math.atan2(b.heart.y - y, b.heart.x - x);
    for (let i = 0; i < count; i++) {
      const v = angle + (i - (count - 1) / 2) * spread;
      bullet(x, y, Math.cos(v) * speed, Math.sin(v) * speed, 5, kind, extra);
    }
  };
  const burst = (x, y, count = 8, s = 0.9, kind = "star") => {
    const h = hazard("burst", x, y, 14, 0, 0.9, 0.08);
    h.count = count;
    h.speed = speed * s;
    h.projectileKind = kind;
  };
  switch (pattern) {
    case "snowcrab.claws": {
      const width = 22 + ((n * 61) % (a.w / 2 - 37));
      hazard("beam", L + width, T, 29, a.h, 0.9, 0.3);
      hazard("beam", R - width, T, 29, a.h, 0.9, 0.3);
      break;
    }
    case "snowcrab.snow": {
      const gap = n % 6;
      for (let i = 0; i < 7; i++)
        if (i !== gap)
          bullet(
            L + 25 + i * 66,
            T - 10,
            (i % 2 ? 1 : -1) * 15,
            speed,
            5,
            "shard",
            { curve: 15, phase: i },
          );
      break;
    }
    case "snowcrab.burrow":
      burst(L + 40 + ((n * 97) % (a.w - 80)), B - 20, 5, 0.8, "claw");
      break;
    case "coconut.seeds": {
      for (let i = 0; i < 4; i++)
        bullet(
          L + 22 + ((n * 83 + i * 107) % (a.w - 44)),
          T + 70,
          (i - 1.5) * 52 * rate,
          -65 + i * 10,
          6,
          "seed",
          { gravity: 110 * rate },
        );
      break;
    }
    case "coconut.roll":
      bullet(
        n % 2 ? L + 12 : R - 12,
        T + 30 + ((n * 53) % (a.h - 60)),
        (n % 2 ? 1 : -1) * speed,
        n % 2 ? -35 : 35,
        10,
        "shell",
        { bounces: 0, gravity: 45 },
      );
      break;
    case "coconut.vines":
      hazard("beam", L + 35 + ((n * 103) % (a.w - 70)), T, 27, a.h, 1.1, 0.4);
      break;
    case "reef.school": {
      for (let i = 0; i < 4; i++)
        bullet(
          n % 2 ? L - 10 : R + 10,
          T + 30 + i * 49,
          (n % 2 ? 1 : -1) * speed,
          0,
          7,
          "fish",
          { swayY: 42, phase: i * 0.6 },
        );
      break;
    }
    case "reef.jaws": {
      const opening = T + 50 + ((n * 37) % (a.h - 100));
      const upper = Math.max(8, opening - T - 36),
        lower = Math.min(B - 8, opening + 36);
      hazard("rush", L, T, a.w, upper, 0.85, 0.4);
      hazard("rush", L, lower, a.w, B - lower, 0.85, 0.4);
      aim(n % 2 ? L - 10 : R + 10, opening, 2, 0.18, "tooth");
      break;
    }
    case "reef.bubbles": {
      for (let i = 0; i < 3; i++)
        bullet(
          L + 50 + ((n * 67 + i * 135) % (a.w - 90)),
          B + 9,
          0,
          -speed * 0.75,
          9,
          "bubble",
          { splitAt: 1.05 },
        );
      break;
    }
    case "gull.feathers": {
      for (let i = 0; i < 4; i++)
        bullet(
          L + 20 + ((n * 83 + i * 97) % (a.w - 40)),
          T - 10,
          (n % 2 ? 1 : -1) * 50,
          speed * 0.85,
          6,
          "feather",
          { curve: 22, phase: i },
        );
      break;
    }
    case "gull.dive":
      hazard(
        "rush",
        L,
        Math.max(T + 7, Math.min(B - 34, b.heart.y - 12)),
        a.w,
        24,
        0.95,
        0.27,
      );
      break;
    case "gull.gust": {
      for (let i = 0; i < 3; i++)
        bullet(
          n % 2 ? L - 10 : R + 10,
          T + 18 + ((n * 47 + i * 71) % (a.h - 36)),
          (n % 2 ? 1 : -1) * speed,
          12,
          5,
          "feather",
        );
      break;
    }
    case "guard.spears": {
      const from = [
        [L - 9, T + 30],
        [R + 9, B - 30],
        [L + 70, T - 9],
        [R - 70, B + 9],
      ][n % 4];
      aim(...from, 2, 0.15, "spear");
      break;
    }
    case "guard.shield": {
      const gap = T + 40 + ((n * 47) % (a.h - 80));
      for (let y = T + 15; y < B; y += 26)
        if (Math.abs(y - gap) > 32)
          bullet(
            n % 2 ? L - 9 : R + 9,
            y,
            (n % 2 ? 1 : -1) * speed,
            0,
            9,
            "shield",
          );
      break;
    }
    case "guard.watch":
      hazard("beam", L + 30 + ((n * 109) % (a.w - 60)), T, 19, a.h, 0.85, 0.38);
      break;
    case "parents.snow": {
      for (let i = 0; i < 3; i++)
        bullet(
          L + 50 + ((n * 57 + i * 130) % (a.w - 90)),
          T - 8,
          Math.sin(n + i) * 20,
          speed * 0.8,
          9,
          "snow",
          { gravity: 18 },
        );
      break;
    }
    case "parents.lesson": {
      const gap = T + 60 + Math.sin(t) * 45;
      for (let y = T + 15; y < B; y += 31)
        if (Math.abs(y - gap) > 52) bullet(R + 9, y, -speed, 0, 6, "snow");
      break;
    }
    case "parents.hugs":
      burst(480, T - 10, 9, 0.65, "snow");
      break;
    case "baby.breach": {
      hazard(
        "rush",
        L,
        Math.max(T + 10, Math.min(B - 40, b.heart.y - 14)),
        a.w,
        28,
        1,
        0.27,
      );
      if (b.phaseLevel > 1)
        hazard("rush", L, T + (n % 2 ? 35 : 145), a.w, 18, 1.35, 0.2);
      break;
    }
    case "baby.splash": {
      for (let i = 0; i < 5; i++)
        bullet(
          L + 55 + ((n * 113) % (a.w - 110)),
          T + 55,
          (i - 2) * 40 * rate,
          -65,
          7,
          "water",
          { gravity: 105 * rate },
        );
      break;
    }
    case "baby.spout": {
      for (let i = -2; i <= 2; i++)
        bullet(
          L + 25 + ((n * 79) % (a.w - 50)),
          B + 8,
          i * 25,
          -speed,
          5,
          "water",
          { curve: 15, phase: i },
        );
      break;
    }
    case "baby.tail": {
      const gap = T + 50 + ((Math.sin(n * 1.3) + 1) * (a.h - 100)) / 2;
      for (let y = T + 14; y < B; y += 25)
        if (Math.abs(y - gap) > 35)
          bullet(
            n % 2 ? L - 9 : R + 9,
            y,
            (n % 2 ? 1 : -1) * speed,
            0,
            6,
            "water",
            { swayY: 18 },
          );
      break;
    }
    case "gate.harpoon":
      aim(
        n % 2 ? L - 10 : R + 10,
        T + 30 + ((n * 53) % (a.h - 60)),
        2,
        0.14,
        "spear",
        { returnAt: 2.5 },
      );
      break;
    case "gate.march": {
      const gap = L + 60 + ((n * 79) % (a.w - 120));
      for (let x = L + 20; x < R; x += 32)
        if (Math.abs(x - gap) > 39) bullet(x, T - 9, 0, speed, 6, "spear");
      break;
    }
    case "gate.anchor":
      burst(
        L + 50 + ((n * 107) % (a.w - 100)),
        T + 55 + ((n * 61) % (a.h - 100)),
        6,
        0.85,
        "anchor",
      );
      break;
    case "gate.cross": {
      for (const [x, y, sx, sy] of [
        [L, T, 1, 1],
        [R, T, -1, 1],
        [L, B, 1, -1],
        [R, B, -1, -1],
      ])
        bullet(x, y, sx * speed * 0.9, sy * speed * 0.435, 6, "spear");
      break;
    }
    case "key1.orbit": {
      const cx = L + 80 + ((n * 89) % (a.w - 160));
      for (let i = 0; i < 5; i++)
        bullet(cx, T + 15, 0, 0, 6, "pearl", {
          orbit: {
            x: cx,
            y: T + 15,
            angle: (i * Math.PI * 2) / 5,
            r: 22,
            speed: 1.8 * rate,
            fall: 82 * rate,
          },
        });
      break;
    }
    case "key1.prism": {
      const offset = 35 + ((n * 67) % (a.w / 2 - 60));
      hazard("beam", L + offset, T, 18, a.h, 0.95, 0.35);
      hazard("beam", R - offset, T, 18, a.h, 1.15, 0.25);
      break;
    }
    case "key1.chain": {
      for (let i = 0; i < 5; i++)
        bullet(
          n % 2 ? L - 10 : R + 10,
          T + 35 + i * 37,
          (n % 2 ? 1 : -1) * speed * 0.8,
          0,
          6,
          "pearl",
          { swayY: 55, phase: i * 0.55 },
        );
      break;
    }
    case "key1.nova": {
      for (let i = 0; i < 7; i++) {
        const angle = (i * Math.PI) / 7 + t * 0.35;
        bullet(
          480,
          T - 8,
          Math.cos(angle) * speed * 0.8,
          Math.abs(Math.sin(angle)) * speed,
          5,
          "pearl",
        );
      }
      break;
    }
    case "key2.sluice": {
      const gap = L + 60 + ((n * 97) % (a.w - 120));
      for (let x = L + 18; x < R; x += 29)
        if (Math.abs(x - gap) > 37)
          bullet(x, T - 8, Math.sin(n) * 15, speed, 5, "water");
      break;
    }
    case "key2.whirl": {
      for (let i = 0; i < 4; i++)
        bullet(
          480,
          T - 9,
          Math.cos(t * 2 + i) * speed * 0.65,
          75 * rate,
          6,
          "water",
          { curve: 40, phase: i },
        );
      break;
    }
    case "key2.undertow": {
      const gap = L + 70 + ((Math.sin(t) + 1) * (a.w - 140)) / 2;
      for (let x = L + 15; x < R; x += 27)
        if (Math.abs(x - gap) > 37) bullet(x, B + 9, 0, -speed, 6, "wave");
      break;
    }
    case "key2.surge": {
      hazard("rush", L, T + ((n * 59) % (a.h - 46)), a.w, 46, 0.95, 0.4);
      for (let i = 0; i < 3; i++)
        bullet(L + 60 + i * 160, T - 8, (i - 1) * 15, speed * 0.8, 6, "water");
      break;
    }
    case "king.crown": {
      const x = L + 40 + ((n * 101) % (a.w - 80)),
        y = T + 25 + ((n * 61) % (a.h - 50));
      hazard("beam", x, T, 21, a.h, 0.95, 0.3);
      hazard("rush", L, y, a.w, 20, 1.05, 0.32);
      break;
    }
    case "king.trident": {
      aim(
        n % 2 ? L - 12 : R + 12,
        T + 40 + ((n * 59) % (a.h - 80)),
        3,
        0.19,
        "royalSpear",
      );
      if (b.phaseLevel === 3) aim(480, T - 12, 1, 0.1, "royalSpear");
      break;
    }
    case "king.decree": {
      for (let i = 0; i < 4; i++)
        bullet(
          L + 40 + ((n * 77 + i * 111) % (a.w - 80)),
          T - 10,
          Math.sin(i) * 20,
          speed * 0.8,
          8,
          "seal",
          { rule: "still" },
        );
      break;
    }
    case "king.eclipse":
      burst(
        L + 60 + ((n * 113) % (a.w - 120)),
        T + 45 + ((n * 53) % (a.h - 90)),
        11,
        0.9,
        "darkStar",
      );
      break;
    case "king.storm": {
      const gap = T + 48 + ((Math.sin(n * 1.7) + 1) * (a.h - 96)) / 2;
      for (let y = T + 13; y < B; y += 23)
        if (Math.abs(y - gap) > 32)
          bullet(
            n % 2 ? L - 10 : R + 10,
            y,
            (n % 2 ? 1 : -1) * speed,
            0,
            6,
            "royalWater",
          );
      if (n % 4 === 0 && claimExtraRay())
        hazard(
          "beam",
          L + 40 + ((n * 131) % (a.w - 80)),
          T,
          16,
          a.h,
          1.15,
          0.2,
        );
      break;
    }
    default:
      throw Error("Unknown attack " + pattern);
  }
  b.volley++;
}

function hitHeart() {
  const b = battle;
  if (b.invulnerable > 0) return;
  state.hp = Math.max(
    0,
    state.hp -
      Math.ceil((b.damage + (b.phaseLevel - 1) * 2) * (state.assist ? 0.5 : 1)),
  );
  b.invulnerable = state.assist ? 0.9 : 0.62;
  b.shake = 0.2;
  impact = 0.6;
  tone(100, 0.12, "sawtooth", 0.025);
  updateHud();
  if (state.hp <= 0) finishBattle("lose");
}
function updateBattle(dt) {
  const b = battle;
  b.flash = Math.max(0, (b.flash || 0) - dt);
  b.shake = Math.max(0, (b.shake || 0) - dt);
  if (b.phase === "strike") {
    b.phaseTime += dt;
    b.marker = (b.phaseTime * (b.boss ? 0.92 : 0.8)) % 1;
    if (b.phaseTime > 3.7) finishStrike();
    return;
  }
  if (b.phase !== "dodge") return;
  b.phaseTime += dt;
  b.spawnTime += dt;
  b.invulnerable = Math.max(0, b.invulnerable - dt);
  let [dx, dy] = direction();
  const previousHeart = { x: b.heart.x, y: b.heart.y };
  const speed = state.assist ? 215 : 193;
  const activeAttack =
    b.phaseLevel >= 2 && b.phaseTime > b.duration * 0.52
      ? b.secondary
      : b.attack;
  if (activeAttack === "gull.gust")
    b.heart.x +=
      Math.sin(b.phaseTime * 1.5) * 50 * dt * (state.assist ? 0.6 : 1);
  if (activeAttack === "key2.whirl") {
    b.heart.x += Math.sin(b.phaseTime * 2) * 30 * dt;
    b.heart.y += Math.cos(b.phaseTime * 2) * 18 * dt;
  }

  b.heart.x = Math.max(
    arena.x + 8,
    Math.min(arena.x + arena.w - 8, b.heart.x + dx * speed * dt),
  );
  b.heart.y = Math.max(
    arena.y + 8,
    Math.min(arena.y + arena.h - 8, b.heart.y + dy * speed * dt),
  );
  const heartMoved =
    Math.hypot(b.heart.x - previousHeart.x, b.heart.y - previousHeart.y) > 0.01;
  const pattern =
      b.phaseLevel >= 2 && b.phaseTime > b.duration * 0.52
        ? b.secondary
        : b.attack,
    interval =
      ATTACKS[pattern].interval *
      (state.assist ? 1.35 : 1) *
      (b.phaseLevel === 3 ? 0.87 : 1);
  if (
    b.phaseTime > 0.8 &&
    b.spawnTime > interval &&
    b.phaseTime < b.duration - 1.1
  ) {
    b.spawnTime = 0;
    spawnPattern(pattern);
  }

  for (const h of b.hazards) {
    h.age += dt;
    if (h.age >= h.warning && !h.fired) {
      h.fired = true;
      if (h.kind === "burst") {
        const count = h.count || (b.phaseLevel === 3 ? 12 : 10),
          speed = h.speed || (state.assist ? 79 : 122);
        for (let i = 0; i < count; i++) {
          const angle = (i * Math.PI * 2) / count + 0.15 * b.turn;
          bullet(
            h.x,
            h.y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            5,
            h.projectileKind || "star",
          );
        }
      }
    }
    if (h.fired && h.age < h.warning + h.duration && h.kind !== "burst") {
      const inBeam =
        h.kind === "beam"
          ? Math.abs(b.heart.x - h.x) < h.w / 2 + 5 && b.heart.y >= h.y
          : b.heart.x > h.x &&
            b.heart.x < h.x + h.w &&
            b.heart.y > h.y - 5 &&
            b.heart.y < h.y + h.h + 5;
      if (inBeam) hitHeart();
      if (b.phase === "result") return;
    }
  }
  b.hazards = b.hazards.filter((h) => h.age < h.warning + h.duration);
  for (const p of b.bullets) {
    p.age += dt;
    if (p.gravity) p.vy += p.gravity * dt;
    if (p.returnAt && !p.returned && p.age > p.returnAt) {
      p.vx = -p.vx;
      p.vy = -p.vy;
      p.returned = true;
    }
    if (p.splitAt && !p.splitDone && p.age > p.splitAt) {
      p.splitDone = true;
      bullet(p.x, p.y, -95, 0, 5, "fish");
      bullet(p.x, p.y, 95, 0, 5, "fish");
      p.age = 20;
    }
    if (p.orbit) {
      p.orbit.angle += p.orbit.speed * dt;
      p.orbit.y += p.orbit.fall * dt;
      const radius = p.orbit.r + p.age * 27;
      p.x = p.orbit.x + Math.cos(p.orbit.angle) * radius;
      p.y = p.orbit.y + Math.sin(p.orbit.angle) * radius;
    } else
      p.x +=
        (p.vx +
          (p.curve ? Math.sin(p.age * 4 + (p.phase || 0)) * p.curve : 0)) *
        dt;
    if (!p.orbit)
      p.y +=
        (p.vy +
          (p.swayY ? Math.cos(p.age * 3 + (p.phase || 0)) * p.swayY : 0)) *
        dt;
    if (p.kind === "shell" && p.bounces < 3) {
      if (p.x < arena.x + p.r || p.x > arena.x + arena.w - p.r) {
        p.vx = -p.vx;
        p.bounces++;
        p.x = Math.max(arena.x + p.r, Math.min(arena.x + arena.w - p.r, p.x));
      }
      if (p.y > arena.y + arena.h - p.r) {
        p.vy = -p.vy;
        p.bounces++;
        p.y = arena.y + arena.h - p.r;
      }
      if (p.y < arena.y + p.r) {
        p.vy = Math.abs(p.vy);
        p.bounces++;
      }
    }
    if (
      p.x > arena.x &&
      p.x < arena.x + arena.w &&
      p.y > arena.y &&
      p.y < arena.y + arena.h &&
      Math.hypot(p.x - b.heart.x, p.y - b.heart.y) < p.r + 4 &&
      (p.rule !== "still" || !heartMoved)
    ) {
      hitHeart();
      if (b.phase === "result") return;
    }
  }
  b.bullets = b.bullets.filter(
    (p) =>
      p.age < 10 &&
      p.x > arena.x - 55 &&
      p.x < arena.x + arena.w + 55 &&
      p.y > arena.y - 70 &&
      p.y < arena.y + arena.h + 55,
  );
  if (b.phaseTime >= b.duration) {
    b.phase = "choice";
    b.bullets = [];
    b.hazards = [];
    b.message =
      b.parents && b.acts >= 2
        ? "Your parents believe in you. FLEE is unlocked."
        : b.phaseLevel === 3
          ? "The boss is tiring. Stay focused on the next pattern."
          : b.phaseLevel === 2
            ? "A new phase begins. Watch for the attack to change halfway through."
            : "You catch your breath. Choose your next move.";
    battleUI();
  }
}

function direction() {
  let dx =
      Number(keys.has("d") || keys.has("arrowright")) -
      Number(keys.has("a") || keys.has("arrowleft")),
    dy =
      Number(keys.has("s") || keys.has("arrowdown")) -
      Number(keys.has("w") || keys.has("arrowup"));
  const n = Math.hypot(dx, dy) || 1;
  return [dx / n, dy / n];
}
function walkable(x, y) {
  const m = currentRoom();
  if (x < 77 || x > m.width - 72 || y < 91 || y > m.height - 66) return false;
  if (
    terrainWalls(m).some(
      (r) =>
        x > r[0] - 8 &&
        x < r[0] + r[2] + 8 &&
        y > r[1] - 5 &&
        y < r[1] + r[3] + 8,
    )
  )
    return false;
  if (puzzleBlocked(m, x, y)) return false;
  for (const p of m.props) {
    const r =
      p[0] === "igloo"
        ? 43
        : p[0] === "pool"
          ? 32
          : p[0] === "throne"
            ? 28
            : p[0] === "boat"
              ? 0
              : 23;
    if (Math.hypot(x - p[1], y - p[2]) < r + 9) return false;
  }
  return !targets().some(
    (n) =>
      n.kind !== "exit" &&
      Math.hypot(x - n.x, y - n.y) < (n.kind === "boss" ? 25 : 18),
  );
}
function updateWorld(dt) {
  const [dx, dy] = direction(),
    speed = 195;
  const px = state.x,
    py = state.y;
  if (dx || dy)
    state.facing =
      Math.abs(dy) >= Math.abs(dx)
        ? dy < 0
          ? "up"
          : "down"
        : dx < 0
          ? "left"
          : "right";
  updatePuzzle(dt, dx, dy);
  if (dialogue) return;
  if (walkable(state.x + dx * speed * dt, state.y)) state.x += dx * speed * dt;
  if (walkable(state.x, state.y + dy * speed * dt)) state.y += dy * speed * dt;
  const walked = Math.hypot(state.x - px, state.y - py);
  state.steps = (state.steps || 0) + walked;
  updateCamera(dt);
  if ((dx || dy) && time - lastFootprint > 0.17) {
    footprints.push({
      x: state.x + (Math.sin(time * 16) > 0 ? 5 : -5),
      y: state.y + 2,
      life: 1,
    });
    lastFootprint = time;
    if (footprints.length > 24) footprints.shift();
  }
  for (const f of footprints) f.life -= dt * 0.15;
  roomTransition = Math.max(0, roomTransition - dt * 3);
  roomTitleTime = Math.max(0, roomTitleTime - dt);
  impact = Math.max(0, impact - dt * 3);
  nearby =
    targets()
      .filter((n) => Math.hypot(n.x - state.x, n.y - state.y) < 59)
      .sort(
        (a, b) =>
          Math.hypot(a.x - state.x, a.y - state.y) -
          Math.hypot(b.x - state.x, b.y - state.y),
      )[0] || null;
  const text =
    toastTime > 0
      ? toast
      : nearby
        ? (nearby.kind === "boss" ? "Approach · " : "E / Space · ") +
          nearby.name
        : "Explore · M opens your room map · Rest lanterns heal & save";
  if ($("hint").textContent !== text) $("hint").textContent = text;
  updateEncounters(dt, walked);
}
// All illustrations below are drawn specifically for this game, without external assets.
function updateEncounters(dt, walked) {
  const r = currentRoom();
  state.encounterGrace = Math.max(0, (state.encounterGrace || 0) - dt);
  state.bossGrace = Math.max(0, (state.bossGrace || 0) - dt);
  const boss = targets().find(
    (n) => n.kind === "boss" && Math.hypot(n.x - state.x, n.y - state.y) < 68,
  );
  if (boss && state.bossGrace <= 0) {
    if (boss.id === "baby" && fruitCount() < 3) {
      if (!state.flags["baby-warning"]) {
        state.flags["baby-warning"] = true;
        say("BABY ORCA", [
          "Bring snacks from all three groves before you cross my beach!",
        ]);
      }
      return;
    }
    startBattle(boss.id, boss.id);
    return;
  }
  if (
    !walked ||
    r.safe ||
    !r.encounters.length ||
    dialogue ||
    state.encounterGrace > 0
  )
    return;
  if (
    targets().some(
      (n) =>
        ["npc", "exit", "shrine", "boss", "puzzle", "switch"].includes(
          n.kind,
        ) && Math.hypot(n.x - state.x, n.y - state.y) < 100,
    )
  )
    return;
  state.encounterDistance -= walked;
  if (state.encounterDistance > 0) return;
  const type = r.encounters[Math.floor(Math.random() * r.encounters.length)];
  state.encounterSerial++;
  state.encounterDistance = 1000 + Math.random() * 750;
  state.encounterGrace = 14;
  startBattle(type, "encounter-" + state.encounterSerial);
}
function rect(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}
function ellipse(x, y, rx, ry, c) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
function text(s, x, y, size = 12, color = "#d8ede9", align = "left") {
  ctx.font = size + "px monospace";
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(s, x, y);
  ctx.textAlign = "left";
}
function baseTerrainWalls(room) {
  const layouts = [
    [
      [350, 145, 64, 70],
      [590, 410, 64, 48],
    ],
    [
      [335, 170, 64, 60],
      [610, 400, 96, 48],
    ],
    [
      [200, 170, 80, 48],
      [670, 410, 64, 48],
    ],
    [
      [300, 390, 64, 60],
      [650, 160, 64, 52],
    ],
    [
      [185, 195, 64, 70],
      [640, 410, 64, 50],
    ],
    [
      [325, 150, 64, 65],
      [690, 395, 64, 55],
    ],
    [
      [190, 400, 64, 48],
      [685, 155, 64, 55],
    ],
  ];
  if (["snowhome", "cabin", "throne", "sanctum", "gate"].includes(room.theme))
    return [];
  if (["river", "waterfall", "cistern"].includes(room.theme))
    return [
      [420, 100, 92, 104],
      [420, 390, 92, 112],
    ];
  return layouts[room.layout] || [];
}
function terrainWalls(room) {
  return baseTerrainWalls(room)
    .map(([x, y, w, h]) => {
      const [xx, yy] = projectPoint(room, x, y);
      return [xx, yy, w * room.scaleX, h * room.scaleY];
    })
    .filter(
      ([x, y, w, h]) =>
        !room.puzzle ||
        !insidePuzzle(room, x + w / 2, y + h / 2, Math.max(w, h) / 2 + 50),
    );
}
function seeded(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function glow(x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 1, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function penguin(x, y, color = "#d7d8ce", baby = false, hat = false) {
  x = Math.round(x);
  y = Math.round(y);
  const walking = baby && mode === "world" && keys.size && !dialogue,
    step = walking ? Math.sin(time * 15) : 0;
  ellipse(x, y + 4, 18, 6, "#10293844");
  // A shaded, pixel-drawn emperor chick with independently animated feet and scarf.
  rect(x - 12, y - 2 + step * 2, 10, 6, "#a97345");
  rect(x - 11, y - 3 + step * 2, 9, 4, "#edbc76");
  rect(x + 3, y - 2 - step * 2, 10, 6, "#a97345");
  rect(x + 3, y - 3 - step * 2, 9, 4, "#edbc76");
  rect(x - 12, y - 29, 24, 24, "#14283a");
  rect(x - 15, y - 23, 30, 16, "#14283a");
  rect(x - 11, y - 26, 22, 23, "#335064");
  rect(x - 10, y - 23, 19, 20, color);
  rect(x - 7, y - 23, 11, 20, "#ececda");
  rect(x + 7, y - 20, 3, 15, "#9eb0b2");
  rect(x - 6, y - 20, 7, 16, "#fcf5dd");
  rect(x - 16, y - 21 + step * 2, 5, 14, "#203c50");
  rect(x - 18, y - 18 + step * 2, 3, 8, "#436075");
  rect(x + 12, y - 21 - step * 2, 5, 14, "#203c50");
  rect(x + 16, y - 18 - step * 2, 3, 8, "#436075");
  rect(x - 12, y - 40, 24, 18, "#14283a");
  rect(x - 9, y - 43, 18, 6, "#14283a");
  rect(x - 7, y - 44, 5, 3, "#476174");
  if (baby && state.facing === "up") {
    rect(x - 10, y - 36, 20, 12, "#29465b");
    rect(x - 7, y - 40, 14, 7, "#496477");
    rect(x - 8, y - 29, 16, 3, "#5b7382");
    rect(x - 9, y - 23, 18, 6, "#cf806e");
    rect(x - 6, y - 18, 5, 12, "#edab86");
    return;
  }
  if (baby && (state.facing === "left" || state.facing === "right")) {
    const side = state.facing === "left" ? -1 : 1;
    rect(x - 9, y - 36, 18, 12, "#426074");
    rect(x + side * 4 - 4, y - 35, 8, 11, "#ececd9");
    rect(x + side * 6 - 1, y - 34, 3, 5, "#14283a");
    rect(x + side * 12 - 3, y - 29, 7, 3, "#ffcf7f");
    rect(x - 11, y - 24, 22, 5, "#edab85");
    rect(x - side * 10 - 3, y - 20, 5, 12, "#c97565");
    rect(x - side * 3 - 2, y - 18, 6, 13, "#29485c");
    return;
  }
  rect(x - 10, y - 36, 20, 12, "#f2f0dc");
  rect(x - 13, y - 31, 4, 6, "#e7c77d");
  rect(x + 10, y - 31, 4, 6, "#e7c77d");
  rect(x - 6, y - 34, 4, 5, "#14283a");
  rect(x + 3, y - 34, 4, 5, "#14283a");
  rect(x - 5, y - 34, 1, 2, "#fff9d9");
  rect(x + 4, y - 34, 1, 2, "#fff9d9");
  rect(x - 3, y - 28, 7, 3, "#c88f55");
  rect(x - 2, y - 28, 5, 2, "#ffcf7f");
  if (baby) {
    rect(x - 13, y - 23, 26, 5, "#a75457");
    rect(x - 12, y - 24, 24, 3, "#f0ad85");
    rect(x + 8, y - 20, 6, 10, "#cf7768");
    rect(x + 12, y - 14, 7 + Math.round(step * 2), 4, "#f0ad85");
  }
  if (hat) {
    rect(x - 15, y - 43, 30, 5, "#f2e5bb");
    rect(x - 10, y - 52, 20, 10, "#d2cfb7");
    rect(x - 8, y - 52, 15, 4, "#f5f0d3");
    rect(x - 8, y - 44, 16, 3, "#526e82");
  }
}
function orca(x, y, scale = 1, color = "#8eacbf", crown = false) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);
  ellipse(0, 5, 34, 8, "#071a2a55");
  if (crown) {
    rect(-29, -43, 58, 45, "#714a67");
    rect(-33, -22, 8, 29, "#483c60");
    rect(25, -22, 8, 29, "#483c60");
  }
  // Broad snout, white eye patches, curved dorsal fin and tail distinguish orcas from penguins.
  rect(-20, -43, 40, 41, "#10233a");
  rect(-27, -35, 54, 28, "#10233a");
  rect(-23, -40, 46, 17, "#1e3c56");
  rect(-16, -49, 32, 8, "#10233a");
  rect(-12, -54, 8, 9, "#213e57");
  rect(-10, -59, 5, 8, "#213e57");
  rect(-17, -24, 34, 23, color);
  rect(-12, -23, 24, 21, "#e5eadf");
  rect(-7, -22, 11, 19, "#f6f3dc");
  rect(15, -21, 3, 16, "#7a9cac");
  rect(-23, -36, 13, 8, "#eff2df");
  rect(11, -36, 13, 8, "#eff2df");
  rect(-17, -35, 4, 4, "#132b3e");
  rect(14, -35, 4, 4, "#132b3e");
  rect(-15, -17, 30, 3, "#234359");
  for (let i = -10; i <= 10; i += 7) rect(i, -16, 3, 4, "#f5f0d6");
  rect(-38, -25, 14, 9, "#163149");
  rect(-43, -21, 10, 8, "#284b63");
  rect(25, -25, 14, 9, "#163149");
  rect(35, -21, 10, 8, "#284b63");
  rect(-24, -2, 18, 7, "#18394f");
  rect(7, -2, 18, 7, "#18394f");
  if (crown) {
    rect(-23, -53, 46, 7, "#b38b4e");
    rect(-21, -57, 42, 6, "#f0d18a");
    for (let i = -20; i <= 20; i += 20) {
      rect(i - 3, -68 - Math.abs(i === 0 ? 5 : 0), 7, 15, "#e9be6c");
      rect(i - 1, -66 - Math.abs(i === 0 ? 5 : 0), 3, 4, "#fff1b9");
    }
    rect(-3, -55, 7, 6, "#d77985");
    rect(39, -49, 3, 61, "#cea86c");
    rect(30, -53, 21, 4, "#efd89a");
    rect(30, -62, 3, 12, "#efd89a");
    rect(40, -67, 3, 15, "#efd89a");
    rect(48, -62, 3, 12, "#efd89a");
  }
  ctx.restore();
}
function creature(type, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const c = enemies[type]?.color || "#b9cbd0";
  if (type === "parents") {
    penguin(-24, 0, "#c5b5db");
    penguin(26, 0, "#bdcdd9");
  } else if (["king", "baby", "gate", "guard", "key1", "key2"].includes(type)) {
    orca(0, 0, type === "baby" ? 0.85 : 1, c, type === "king");
    if (type === "gate" || type === "guard") {
      rect(-22, -49, 44, 6, "#bfa878");
      rect(-16, -56, 32, 9, "#71879b");
      rect(35, -50, 3, 59, "#d8c69a");
      rect(32, -56, 9, 10, "#bbc7c6");
    }
  } else if (type === "snowcrab") {
    ellipse(0, -14, 22, 16, "#467084");
    ellipse(-1, -17, 19, 13, "#a8d4d9");
    rect(-14, -25, 17, 5, "#eaf7e9");
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        rect(side * (22 + i * 3) - 3, -9 + i * 5, 8, 3, "#638c9b");
        rect(side * (26 + i * 3) - 3, -7 + i * 5, 3, 6, "#638c9b");
      }
      rect(side * 27 - 5, -27, 9, 14, "#8fbfcd");
      rect(side * 31 - 5, -34, 11, 9, "#cee8e4");
      rect(side * 31, -37, 4, 7, "#cee8e4");
      rect(side * 31 - 6, -37, 3, 7, "#cee8e4");
    }
    rect(-9, -25, 3, 5, "#1c3f52");
    rect(6, -25, 3, 5, "#1c3f52");
    rect(-7, -11, 14, 2, "#547c8a");
  } else if (type === "coconut") {
    ellipse(0, 4, 23, 5, "#142a3544");
    ellipse(0, -19, 22, 24, "#715d48");
    ellipse(-3, -22, 18, 21, "#bd9871");
    for (let i = -12; i < 15; i += 7) rect(i, -36, 2, 30, "#a8805e");
    rect(-9, -25, 4, 5, "#344b47");
    rect(5, -25, 4, 5, "#344b47");
    rect(-6, -13, 12, 3, "#584e3c");
    rect(-20, 1, 13, 5, "#5c8e64");
    rect(7, 1, 13, 5, "#5c8e64");
    rect(-4, -51, 7, 13, "#527e58");
    rect(-22, -45, 22, 6, "#7dac66");
    rect(1, -44, 24, 6, "#8fba6c");
    rect(-17, -48, 14, 4, "#add18a");
  } else if (type === "gull") {
    ellipse(0, -18, 17, 20, "#9fb5bd");
    ellipse(-2, -21, 14, 18, "#e4eddf");
    for (let side of [-1, 1]) {
      const flap = Math.sin(time * 5) * 7;
      rect(side * 24 - 12, -28 + flap, 25, 9, "#c6d6d4");
      rect(side * 39 - 8, -24 + flap, 18, 6, "#8ca5b4");
      rect(side * 47 - 5, -21 + flap, 11, 4, "#6f8f9f");
    }
    rect(-9, -27, 18, 5, "#273e54");
    rect(-2, -19, 12, 5, "#e4b76e");
    rect(-8, 1, 6, 5, "#bc8e55");
    rect(4, 1, 6, 5, "#bc8e55");
  } else {
    ellipse(0, -17, 26, 17, "#446c80");
    ellipse(-3, -20, 24, 14, c);
    rect(-29, -26, 9, 18, "#699fb0");
    rect(-37, -31, 10, 10, "#a0c5c9");
    rect(-37, -12, 10, 10, "#a0c5c9");
    rect(0, -41, 6, 10, "#5b8d9d");
    rect(-4, -35, 15, 9, "#5b8d9d");
    rect(9, -26, 5, 5, "#19384b");
    rect(10, -25, 2, 2, "#f6e9bc");
    rect(2, -12, 25, 4, "#1e445a");
    for (let i = 4; i < 23; i += 6) rect(i, -11, 3, 5, "#edf0dc");
  }
  ctx.restore();
}
function prop(p) {
  const [t, x, y] = p;
  if (t === "hut") {
    ellipse(x, y + 9, 57, 13, "#17333d33");
    rect(x - 45, y - 45, 90, 51, "#927958");
    rect(x - 40, y - 45, 80, 48, "#b49a6d");
    for (let i = 0; i < 8; i++) rect(x - 40 + i * 10, y - 40, 2, 44, "#d0b481");
    rect(x - 16, y - 26, 32, 32, "#4b514b");
    rect(x - 12, y - 24, 24, 28, "#daaa6b");
    for (let i = 0; i < 4; i++)
      rect(x - 60 + i * 8, y - 58 - i * 9, 120 - i * 16, 12, "#8e8456");
    rect(x - 31, y - 86, 62, 7, "#c7bc7a");
    rect(x - 56, y - 53, 112, 7, "#d8cb83");
    return;
  }
  if (t === "fire") {
    ellipse(x, y + 4, 25, 8, "#4f5a6044");
    for (let i = 0; i < 7; i++)
      ellipse(x + Math.cos(i) * 22, y + Math.sin(i) * 8, 7, 5, "#738a8f");
    rect(x - 21, y - 2, 42, 6, "#7a6454");
    rect(x - 15, y + 2, 31, 5, "#a18464");
    rect(x - 8, y - 25 + Math.sin(time * 9) * 3, 16, 25, "#d98e5f");
    rect(x - 4, y - 31 + Math.cos(time * 7) * 3, 9, 25, "#f8cc81");
    rect(x - 2, y - 17, 5, 15, "#fff1ba");
    glow(x, y - 10, 100, "#ffd58c33");
    return;
  }
  if (t === "pine") {
    ellipse(x, y, 38, 9, "#173e4b30");
    rect(x - 6, y - 62, 12, 65, "#6d6b61");
    for (let i = 0; i < 4; i++) {
      const yy = y - 108 + i * 23,
        ww = 18 + i * 9;
      rect(x - ww, yy + 9, ww * 2, 18, "#3e7278");
      rect(x - ww + 4, yy, ww * 2 - 8, 14, "#719c9b");
      rect(x - ww + 7, yy, ww * 2 - 14, 5, "#d8eeeb");
      rect(x - ww + 3, yy + 14, ww * 2 - 6, 5, "#507f83");
    }
    return;
  }
  if (t === "palm") {
    ellipse(x, y, 32, 7, "#183f4333");
    rect(x - 5, y - 81, 11, 84, "#8e7757");
    for (let i = 0; i < 6; i++) rect(x - 4, y - 70 + i * 12, 9, 3, "#b69968");
    for (let i = 0; i < 5; i++) {
      const d = i - 2;
      rect(x + d * 13 - 16, y - 91 + Math.abs(d) * 6, 32, 10, "#487b58");
      rect(x + d * 17 - 14, y - 97 + Math.abs(d) * 9, 28, 8, "#78a566");
    }
    rect(x - 9, y - 77, 9, 12, "#bc9a61");
    rect(x + 2, y - 80, 9, 12, "#e2bd77");
    return;
  }
  if (t === "crystal") {
    ellipse(x, y + 3, 29, 8, "#12314844");
    for (let i = 0; i < 3; i++) {
      const xx = x + (i - 1) * 17,
        hh = [35, 58, 29][i];
      rect(xx - 7, y - hh, 15, hh, "#5b8baf");
      rect(xx - 7, y - hh, 5, hh, "#a6deeb");
      rect(xx - 2, y - hh + 5, 8, hh - 5, "#80b6d2");
      rect(xx - 4, y - hh - 6, 9, 8, "#b8e5ed");
    }
    glow(x, y - 30, 62, "#8fc8ff17");
    return;
  }
  if (t === "pillar" || t === "tower") {
    ellipse(x, y + 2, 28, 8, "#0b1d3433");
    rect(x - 22, y - 79, 44, 81, "#334960");
    rect(x - 17, y - 75, 34, 72, "#75939f");
    rect(x - 14, y - 75, 6, 71, "#a0b8ba");
    rect(x + 8, y - 75, 6, 71, "#526f86");
    rect(x - 26, y - 83, 52, 10, "#a3b9b8");
    rect(x - 26, y - 4, 52, 11, "#7f999f");
    rect(x - 21, y - 1, 42, 3, "#b5c6bf");
    return;
  }
  if (t === "bookshelf") {
    rect(x - 30, y - 63, 60, 68, "#2b354c");
    rect(x - 27, y - 60, 54, 62, "#785f5a");
    for (let shelf = 0; shelf < 3; shelf++) {
      for (let i = 0; i < 7; i++)
        rect(
          x - 23 + i * 7,
          y - 55 + shelf * 20,
          5,
          14,
          ["#849ca7", "#c2a77f", "#788c91", "#b18b86"][i % 4],
        );
      rect(x - 25, y - 39 + shelf * 20, 50, 3, "#b69778");
    }
    return;
  }
  if (t === "portrait") {
    rect(x - 26, y - 74, 52, 67, "#352e46");
    rect(x - 23, y - 71, 46, 61, "#c6a86f");
    rect(x - 19, y - 67, 38, 53, "#3a506b");
    orca(x, y - 20, 0.45, "#9eb0ba", true);
    return;
  }
  if (t === "coral") {
    ellipse(x, y, 24, 6, "#18344033");
    for (let i = -2; i <= 2; i++) {
      rect(
        x + i * 8,
        y - 35 - Math.abs(i) * 5,
        5,
        35 + Math.abs(i) * 5,
        ["#8aa9b0", "#b3a2bf", "#9ab7a5"][Math.abs(i) % 3],
      );
      rect(x + i * 8 - 6, y - 28 - Math.abs(i) * 5, 8, 5, "#bad1c4");
    }
    return;
  }
  if (t === "wreck") {
    for (let i = 0; i < 8; i++)
      rect(x - 55 + i * 14, y - 25 + Math.abs(i - 4) * 3, 11, 31, "#79665f");
    rect(x - 4, y - 80, 7, 69, "#b09a77");
    rect(x - 2, y - 80, 47, 8, "#9f8b73");
    return;
  }
  if (t === "igloo") {
    ellipse(x, y + 7, 63, 15, "#294c5a33");
    rect(x - 57, y - 24, 114, 45, "#719eaf");
    ellipse(x, y - 22, 57, 43, "#c0dcdc");
    ellipse(x - 6, y - 28, 49, 36, "#eff7e9");
    for (let i = 0; i < 4; i++) {
      const yy = y - 51 + i * 15;
      rect(x - 44, yy, 88, 2, "#accbd2");
      for (let j = 0; j < 4; j++)
        rect(x - 40 + j * 25 + (i % 2) * 8, yy, 2, 13, "#bdd6d6");
    }
    ellipse(x, y, 19, 25, "#31556b");
    rect(x - 19, y, 38, 23, "#28465a");
    rect(x - 13, y + 4, 26, 19, "#e2b675");
    glow(x, y + 8, 55, "#ffe1a027");
    return;
  }
  if (t === "pool") {
    ellipse(x, y + 3, 43, 29, "#6d9bad");
    ellipse(x, y - 2, 39, 25, "#9ac5cf");
    ellipse(x, y - 4, 32, 19, "#315f7e");
    for (let i = 0; i < 3; i++)
      rect(
        x - 21 + i * 12,
        y - 8 + Math.sin(time * 2 + i) * 3,
        14,
        2,
        "#9ed0d4",
      );
    return;
  }
  if (t === "boat") {
    ellipse(x, y, 46, 17, "#344655");
    for (let i = 0; i < 5; i++)
      rect(x - 41 + i * 17, y - 14 + Math.abs(i - 2) * 3, 15, 20, "#a28a68");
    rect(x - 3, y - 92, 5, 83, "#c7b28b");
    ctx.fillStyle = "#e3d8b5";
    ctx.beginPath();
    ctx.moveTo(x + 3, y - 89);
    ctx.lineTo(x + 40, y - 27);
    ctx.lineTo(x + 3, y - 27);
    ctx.fill();
    rect(x - 38, y - 13, 76, 5, "#d7ba88");
    return;
  }
  if (t === "throne") {
    rect(x - 41, y - 99, 82, 109, "#4b3e5e");
    rect(x - 34, y - 92, 68, 88, "#b99b65");
    rect(x - 26, y - 83, 52, 71, "#5b3f62");
    rect(x - 20, y - 78, 40, 56, "#83536d");
    rect(x - 47, y - 8, 94, 21, "#a88c62");
    rect(x - 43, y - 8, 86, 6, "#e1c590");
    rect(x - 38, y + 12, 12, 12, "#c7a674");
    rect(x + 27, y + 12, 12, 12, "#c7a674");
    return;
  }
  // Layered stone outcrops.
  ellipse(x, y, 30, 10, "#12304430");
  rect(x - 24, y - 20, 48, 22, "#557c8e");
  rect(x - 18, y - 30, 36, 23, "#86a9b4");
  rect(x - 13, y - 33, 24, 7, "#c7dce0");
  rect(x - 21, y - 17, 8, 14, "#698e9f");
  rect(x + 15, y - 17, 9, 14, "#456e82");
}
function object(o) {
  const [t, x, y, id] = o;
  if (t === "boss") {
    creature(id, x, y + Math.sin(time * 2) * 2);
    return;
  }
  if (t === "journal") {
    rect(x - 12, y - 15, 25, 17, "#765e58");
    rect(x - 10, y - 17, 20, 15, "#e5d7b1");
    rect(x, y - 17, 2, 15, "#bdab87");
    rect(x - 7, y - 13, 5, 2, "#a69c81");
    rect(x + 4, y - 13, 4, 2, "#a69c81");
    return;
  }
  if (t === "switch") {
    const on = !!state.flags[id];
    rect(x - 13, y - 23, 26, 28, "#486b7c");
    rect(x - 9, y - 20, 18, 19, on ? "#99dfbd" : "#d0ae78");
    if (id === "sluice-wheel") {
      ellipse(x, y - 20, 16, 16, on ? "#b8cabb" : "#b9a782");
      ellipse(x, y - 20, 11, 11, "#3b5c70");
      rect(x - 2, y - 36, 4, 32, "#b9a782");
      rect(x - 16, y - 22, 32, 4, "#b9a782");
    } else {
      rect(x - 6, y - 41, 12, 24, on ? "#d4f4c6" : "#d3ad74");
      rect(x - 11, y - 25, 22, 4, "#e7d5a4");
    }
    glow(x, y - 24, 60, on ? "#9cf5bf33" : "#ffcc8819");
    return;
  }
  if (t === "fruit") {
    prop(["palm", x, y]);
    for (let i = 0; i < 3; i++) {
      rect(x - 18 + i * 12, y - 59 + (i % 2) * 6, 7, 17, "#e9bd61");
      rect(x - 17 + i * 12, y - 59 + (i % 2) * 6, 3, 14, "#ffe3a0");
    }
    return;
  }
  if (t === "shrine") {
    ellipse(x, y + 5, 23, 7, "#233c4944");
    rect(x - 11, y - 34, 22, 35, "#547383");
    rect(x - 16, y - 37, 32, 7, "#344e65");
    rect(x - 11, y - 31, 22, 22, "#b48c5e");
    rect(x - 8, y - 29, 16, 18, "#edcf87");
    rect(x - 4, y - 27, 8, 15, "#fff0b1");
    rect(x - 13, y - 7, 26, 5, "#acc1b8");
    glow(x, y - 21, 74 + Math.sin(time * 3) * 3, "#ffd59134");
    return;
  }
  if (t === "chest") {
    ellipse(x, y + 4, 25, 6, "#243e4933");
    rect(x - 21, y - 22, 42, 27, "#655653");
    rect(x - 19, y - 25, 38, 12, "#b39068");
    rect(x - 17, y - 23, 34, 5, "#d4b17d");
    rect(x - 17, y - 10, 34, 11, "#96714f");
    rect(x - 14, y - 24, 4, 28, "#d1b578");
    rect(x + 10, y - 24, 4, 28, "#d1b578");
    rect(x - 4, y - 13, 8, 10, "#e5ca88");
    rect(x - 1, y - 11, 2, 5, "#6a644f");
    return;
  }
  if (t === "cage") {
    penguin(x, y, "#adccdf");
    if (!state.flags.king) {
      for (let i = -25; i <= 25; i += 10) rect(x + i, y - 60, 4, 69, "#607d90");
      rect(x - 29, y - 63, 62, 6, "#b5c6c7");
      rect(x - 29, y + 6, 62, 6, "#89a3af");
      rect(x + 3, y - 22, 10, 13, "#d0b17d");
    }
  }
}
function puzzleBoard(r = currentRoom()) {
  return {
    x: r.width / 2 - 224,
    y: r.height / 2 - 160,
    w: 448,
    h: 320,
    tile: 64,
  };
}
function insidePuzzle(r, x, y, pad = 0) {
  const b = puzzleBoard(r);
  return (
    x > b.x - pad && x < b.x + b.w + pad && y > b.y - pad && y < b.y + b.h + pad
  );
}
function puzzleState(r = currentRoom()) {
  const p = r.puzzle;
  if (!p) return null;
  let ps = state.puzzles[p.id];
  if (
    !ps ||
    typeof ps !== "object" ||
    !Array.isArray(ps.block) ||
    ps.block.length !== 2 ||
    !ps.block.every(
      (n, i) => Number.isInteger(n) && n >= 0 && n < (i === 0 ? 7 : 5),
    )
  ) {
    ps = {
      block: [...(p.start || [2, 2])],
      progress: 0,
      lastCell: "",
      cooldown: 0,
    };
    state.puzzles[p.id] = ps;
  }
  if (!Number.isInteger(ps.progress) || ps.progress < 0 || ps.progress > 20)
    ps.progress = 0;
  if (state.flags[p.id] && p.type === "push") ps.block = [...p.goal];
  return ps;
}
function puzzleTargets(r = currentRoom()) {
  if (!r.puzzle) return [];
  const b = puzzleBoard(r),
    p = r.puzzle;
  const out = [
    {
      kind: "puzzle",
      name: "Puzzle hint",
      id: p.id,
      action: "hint",
      x: b.x - 65,
      y: b.y + b.h - 25,
    },
    {
      kind: "puzzle",
      name: "Reset puzzle",
      id: p.id,
      action: "reset",
      x: b.x + b.w + 65,
      y: b.y + b.h - 25,
    },
  ];
  if (p.type === "sequence")
    p.labels.forEach((label, i) =>
      out.push({
        kind: "puzzle",
        name: label,
        id: p.id,
        action: "rune",
        rune: i,
        x: b.x + 96 + i * 128,
        y: b.y + 128,
      }),
    );
  return out;
}
function interactPuzzle(n) {
  const r = currentRoom(),
    p = r.puzzle,
    ps = puzzleState(r);
  if (!p) return;
  if (n.action === "hint") {
    say(p.name, [
      p.hint,
      "The left pedestal explains the puzzle. The right pedestal resets it. No health is lost for a mistake.",
    ]);
    return;
  }
  if (state.flags[p.id]) {
    say(p.name, ["The mechanism is already solved. The way stays open."]);
    return;
  }
  if (n.action === "reset") {
    ps.block = [...(p.start || [2, 2])];
    ps.progress = 0;
    ps.lastCell = "";
    ps.cooldown = 0;
    say(p.name, [
      "The puzzle returns to its starting position. Try again when you’re ready.",
    ]);
    return;
  }
  if (n.action === "rune") {
    if (n.rune === p.order[ps.progress]) {
      ps.progress++;
      tone(330 + ps.progress * 110, 0.15);
      if (ps.progress === p.order.length) solvePuzzle(r);
      else
        notify("Rune " + ps.progress + " / " + p.order.length + " is glowing.");
    } else {
      ps.progress = 0;
      tone(170, 0.15);
      say(p.name, [
        "The lights gently go dark. Try the sequence again.",
        p.hint,
      ]);
    }
  }
}
function solvePuzzle(r = currentRoom()) {
  const p = r.puzzle;
  if (!p || state.flags[p.id]) return;
  state.flags[p.id] = true;
  state.inventory.fish++;
  state.inventory.boonona++;
  tone(784, 0.3);
  notify(p.name + " solved! A fish and a boonona were tucked inside.");
  say(p.name, [
    p.success || "Warm light runs through the mechanism. The passage is open.",
    "You found a silver fish and a boonona. Your progress is saved.",
  ]);
  updateHud();
}
function puzzleBlocked(r, x, y) {
  const p = r.puzzle;
  if (!p) return false;
  const b = puzzleBoard(r),
    ps = puzzleState(r);
  for (const [cx, cy] of p.walls || []) {
    const xx = b.x + cx * 64,
      yy = b.y + cy * 64;
    if (x > xx - 8 && x < xx + 72 && y > yy - 5 && y < yy + 72) return true;
  }
  if (p.type === "push") {
    const bx = b.x + (ps.block[0] + 0.5) * 64,
      by = b.y + (ps.block[1] + 0.5) * 64;
    if (Math.abs(x - bx) < 35 && Math.abs(y - by) < 35) return true;
  }
  return false;
}
function updatePuzzle(dt, dx, dy) {
  const r = currentRoom(),
    p = r.puzzle;
  if (!p) return;
  const b = puzzleBoard(r),
    ps = puzzleState(r);
  ps.cooldown = Math.max(0, (ps.cooldown || 0) - dt);
  if (
    p.type === "push" &&
    !state.flags[p.id] &&
    (dx || dy) &&
    ps.cooldown === 0
  ) {
    const bx = b.x + (ps.block[0] + 0.5) * 64,
      by = b.y + (ps.block[1] + 0.5) * 64,
      vertical = Math.abs(dy) > Math.abs(dx),
      sx = vertical ? 0 : Math.sign(dx),
      sy = vertical ? Math.sign(dy) : 0;
    const aligned = vertical
        ? Math.abs(state.x - bx) < 19
        : Math.abs(state.y - by) < 19,
      dist = vertical ? Math.abs(state.y - by) : Math.abs(state.x - bx),
      toward = (bx - state.x) * sx + (by - state.y) * sy > 0;
    if (aligned && dist < 43 && toward) {
      const nx = ps.block[0] + sx,
        ny = ps.block[1] + sy;
      if (
        nx >= 0 &&
        nx < 7 &&
        ny >= 0 &&
        ny < 5 &&
        !(p.walls || []).some(([x, y]) => x === nx && y === ny)
      ) {
        ps.block = [nx, ny];
        ps.cooldown = 0.22;
        tone(160, 0.06, "triangle", 0.025);
        if (nx === p.goal[0] && ny === p.goal[1]) solvePuzzle(r);
      }
    }
  }
  if (
    p.type === "path" &&
    !state.flags[p.id] &&
    insidePuzzle(r, state.x, state.y)
  ) {
    const cx = Math.floor((state.x - b.x) / 64),
      cy = Math.floor((state.y - b.y) / 64),
      cell = cx + "," + cy;
    if (cell === ps.lastCell) return;
    ps.lastCell = cell;
    const wanted = p.path[ps.progress],
      previous = p.path[ps.progress - 1];
    if (previous && previous[0] === cx && previous[1] === cy) return;
    if (wanted && wanted[0] === cx && wanted[1] === cy) {
      ps.progress++;
      tone(330 + ps.progress * 35, 0.06);
      if (ps.progress === p.path.length) solvePuzzle(r);
    } else {
      ps.progress = 0;
      ps.lastCell = "";
      state.x = b.x - 38;
      state.y = b.y + (p.path[0][1] + 0.5) * 64;
      state.encounterGrace = 5;
      notify("The path resets gently. Read the left pedestal for a hint.");
    }
  }
}
function drawPuzzles(r) {
  const p = r.puzzle;
  if (!p) return;
  const b = puzzleBoard(r),
    ps = puzzleState(r),
    solved = !!state.flags[p.id];
  rect(b.x - 8, b.y - 8, b.w + 16, b.h + 16, "#263c53");
  for (let row = 0; row < 5; row++)
    for (let col = 0; col < 7; col++) {
      const isWall = (p.walls || []).some(([x, y]) => x === col && y === row),
        isPath =
          p.type === "path" &&
          p.path.some(
            ([x, y], i) =>
              x === col && y === row && (solved || i < ps.progress),
          );
      rect(
        b.x + col * 64 + 2,
        b.y + row * 64 + 2,
        60,
        60,
        isWall ? "#45647a" : isPath ? "#8ab4a7" : "#718a92",
      );
      rect(b.x + col * 64 + 5, b.y + row * 64 + 5, 54, 2, "#bfccc044");
    }
  if (p.type === "push") {
    const gx = b.x + (p.goal[0] + 0.5) * 64,
      gy = b.y + (p.goal[1] + 0.5) * 64;
    ellipse(gx, gy, 23, 14, solved ? "#c9e5b0" : "#e6c58b");
    const x = b.x + ps.block[0] * 64,
      y = b.y + ps.block[1] * 64;
    rect(x + 7, y + 12, 50, 46, "#354c62");
    rect(x + 7, y + 7, 50, 44, "#acb6a4");
    rect(x + 12, y + 11, 39, 33, "#6e9396");
    rect(x + 28, y + 16, 6, 22, "#d6dab5");
    rect(x + 20, y + 24, 22, 6, "#d6dab5");
  }
  if (p.type === "sequence")
    p.labels.forEach((label, i) => {
      const x = b.x + 96 + i * 128,
        y = b.y + 128,
        on = solved || p.order.slice(0, ps.progress).includes(i);
      rect(x - 22, y - 35, 44, 46, "#3c566d");
      rect(x - 16, y - 30, 32, 32, on ? "#d3d7a2" : "#94a5ac");
      text(p.symbols[i], x, y - 8, 20, on ? "#496769" : "#354f64", "center");
      text(label, x, y + 34, 11, "#ebdfb9", "center");
    });
  if (p.type === "path") {
    const [startX, startY] = p.path[0];
    text("START →", b.x - 8, b.y + startY * 64 + 37, 11, "#f2d7a3", "right");
    for (let i = 0; i < p.path.length; i++) {
      const [x, y] = p.path[i];
      if (i === 0 || i === p.path.length - 1 || solved) {
        text(
          i === p.path.length - 1 ? "★" : "·",
          b.x + (x + 0.5) * 64,
          b.y + (y + 0.5) * 64 + 6,
          19,
          "#ebd9a8",
          "center",
        );
      }
    }
  }
  for (const n of puzzleTargets(r).filter((n) => n.action !== "rune")) {
    rect(n.x - 13, n.y - 28, 26, 32, "#4b6d7d");
    rect(n.x - 10, n.y - 30, 20, 17, "#d1c59d");
    text(
      n.action === "hint" ? "?" : "↻",
      n.x,
      n.y - 15,
      15,
      "#345369",
      "center",
    );
  }
  text(
    p.name.toUpperCase() + (solved ? " · SOLVED" : ""),
    b.x + b.w / 2,
    b.y - 24,
    13,
    "#eadab6",
    "center",
  );
}

function drawWorld() {
  const r = currentRoom(),
    p = palettes[state.map],
    indoor = [
      "cabin",
      "hall",
      "library",
      "sanctum",
      "cistern",
      "cell",
      "gallery",
      "throne",
      "gate",
    ].includes(r.theme),
    cave = ["cave", "icecave"].includes(r.theme),
    snow = state.map === 0 && !indoor && !cave;
  rect(0, 0, W, H, indoor || cave ? "#142335" : p.sea);
  ctx.save();
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
  const left = Math.max(0, Math.floor(camera.x / 24) * 24),
    top = Math.max(0, Math.floor(camera.y / 24) * 24),
    right = Math.min(r.width, camera.x + W + 24),
    bottom = Math.min(r.height, camera.y + H + 24);
  for (let y = top; y < bottom; y += 24)
    for (let x = left; x < right; x += 48) {
      const drift = Math.sin(time * 1.3 + y * 0.12) * 5;
      rect(x + drift, y, 21, 2, "#9ed6de14");
    }
  rect(
    56,
    90,
    r.width - 112,
    r.height - 139,
    indoor ? "#273951" : cave ? "#293e59" : p.edge,
  );
  rect(
    64,
    82,
    r.width - 128,
    r.height - 144,
    indoor ? "#617982" : cave ? "#49647c" : p.land,
  );
  const base =
    r.theme === "cabin"
      ? ["#a38667", "#a98c6e", "#9a7d63", "#b09472"]
      : r.theme === "jungle"
        ? ["#7c9d73", "#84a77a", "#73966d", "#8eac7a"]
        : indoor
          ? ["#627982", "#677e86", "#5d747e", "#6a8189"]
          : cave
            ? ["#456178", "#49677c", "#4d6980", "#405d76"]
            : state.map === 0
              ? ["#d6e9e6", "#d1e4e2", "#dbece7", "#d7e8e3"]
              : state.map === 1
                ? ["#d8c696", "#ddcc9e", "#d2c18f", "#e0cfa1"]
                : ["#829da4", "#89a4aa", "#7e98a1", "#8ca7ac"];
  for (let y = Math.max(96, top); y < Math.min(bottom, r.height - 64); y += 24)
    for (
      let x = Math.max(72, left);
      x < Math.min(right, r.width - 72);
      x += 24
    ) {
      const n = seeded(
        Math.floor(x / 24) * 7 + Math.floor(y / 24) * 37 + r.layout * 13,
      );
      rect(x, y, 24, 24, base[Math.floor(n * 4)]);
      if (indoor || cave) {
        rect(x, y, 23, 1, "#bdc9be15");
        rect(x + 23, y, 1, 24, "#203a4b33");
      } else {
        rect(x + 4 + n * 10, y + 6, 3, 2, snow ? "#aec9d04d" : "#a18e6355");
        if (n > 0.8) {
          rect(x + 15, y + 15, 3, 3, snow ? "#f4f8e999" : "#73956488");
          rect(x + 17, y + 11, 2, 6, snow ? "#dcece5" : "#73956488");
        }
      }
    }
  const center = roomCenter(r);
  ctx.strokeStyle = indoor ? "#426074" : cave ? "#59788a" : p.path;
  ctx.lineWidth = indoor ? 68 : 52;
  ctx.lineCap = "square";
  for (const d of r.doors) {
    const pos = doorPoint(r, d.direction);
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(pos[0], pos[1]);
    ctx.stroke();
  }
  for (const wall of terrainWalls(r)) {
    const [x, y, w, h] = wall,
      water = ["river", "waterfall", "cistern", "lake"].includes(r.theme);
    if (x > right || x + w < left || y > bottom || y + h < top) continue;
    rect(x, y + 9, w, h, "#162f4555");
    rect(
      x,
      y,
      w,
      h,
      water
        ? "#376f87"
        : indoor
          ? "#3e586d"
          : cave
            ? "#314e69"
            : r.region === 0
              ? "#8baeb0"
              : "#64836d",
    );
    rect(x, y, w, 5, water ? "#99c7cb" : "#bad1c5");
    for (let i = 0; i < w; i += 20)
      rect(x + i, y + h - 8, 10, 3, water ? "#72a9ba" : "#7fa19e");
    if (water)
      for (let i = 12; i < h; i += 24)
        rect(x + 14 + Math.sin(time + i) * 5, y + i, w - 28, 2, "#91bcc444");
  }
  rect(
    55,
    58,
    r.width - 110,
    36,
    indoor ? "#354a61" : cave ? "#2d4560" : p.edge,
  );
  rect(55, 90, 12, r.height - 144, "#263e5644");
  rect(r.width - 68, 90, 12, r.height - 144, "#263e5644");
  rect(55, r.height - 68, r.width - 110, 15, indoor ? "#344d65" : p.edge);
  if (!indoor && !cave)
    for (let x = 64; x < r.width - 64; x += 32) {
      rect(x, r.height - 60, 22, 3, "#bedce388");
      rect(
        x + 8,
        r.height - 51 + Math.sin(time * 2 + x) * 3,
        17,
        2,
        "#bedce355",
      );
    }
  for (const d of r.doors) {
    const [x, y] = doorPoint(r, d.direction),
      locked = !!d.requires && !state.flags[d.requires],
      vertical = d.direction === "N" || d.direction === "S";
    rect(
      x - (vertical ? 32 : 18),
      y - (vertical ? 16 : 32),
      vertical ? 64 : 36,
      vertical ? 32 : 64,
      locked ? "#795e67" : "#223c51",
    );
    rect(
      x - (vertical ? 28 : 14),
      y - (vertical ? 12 : 28),
      vertical ? 56 : 28,
      vertical ? 24 : 56,
      locked ? "#b48e77" : "#a2b5a2",
    );
    text(
      { E: "→", W: "←", N: "↑", S: "↓" }[d.direction],
      x,
      y + 5,
      19,
      locked ? "#573e50" : "#294d63",
      "center",
    );
  }
  // Dense scenery sits at the actual room edges, not at the camera edges.
  if (["forest", "snowhome", "jungle"].includes(r.theme)) {
    for (let x = 100; x < r.width - 80; x += 115) {
      if (Math.abs(x - center.x) > 65)
        prop([state.map === 0 ? "pine" : "palm", x, 110]);
    }
    for (let y = 210; y < r.height - 85; y += 105) {
      if (Math.abs(y - center.y) > 55) {
        prop([state.map === 0 ? "pine" : "palm", 68, y]);
        prop([state.map === 0 ? "pine" : "palm", r.width - 69, y]);
      }
    }
  }
  for (let i = 0; i < 140; i++) {
    const x = 100 + seeded(i * 49 + r.layout) * (r.width - 200),
      y = 135 + seeded(i * 17 + r.layout) * (r.height - 240);
    if (
      x < left ||
      x > right ||
      y < top ||
      y > bottom ||
      Math.abs(y - center.y) < 40 ||
      Math.abs(x - center.x) < 45 ||
      (r.puzzle && insidePuzzle(r, x, y, 45))
    )
      continue;
    if (["garden", "jungle", "camp", "village"].includes(r.theme)) {
      rect(x, y, 2, 7, r.region === 1 ? "#416e50" : "#5f8790");
      rect(x - 3, y + 3, 3, 2, "#81a47a");
      if (i % 4 === 0)
        rect(x - 2, y - 1, 6, 3, ["#e1c2a6", "#b7c6dc", "#dfcf94"][i % 3]);
    }
  }
  for (const f of footprints)
    if (f.life > 0) ellipse(f.x, f.y, 3, 2, snow ? "#779eae44" : "#344d5c33");
  drawPuzzles(r);
  const actors = [
    ...r.props.map((p) => ({ y: p[2], draw: () => prop(p) })),
    ...activeObjects().map((o) => ({ y: o[2], draw: () => object(o) })),
    ...r.npcs.map((n) => ({
      y: n[2],
      draw: () =>
        n[0] === "Pebble" || n[0] === "Nim"
          ? orca(n[1], n[2], 0.75, "#adbfbd")
          : penguin(
              n[1],
              n[2],
              n[0] === "Mama"
                ? "#cbb4db"
                : n[0] === "Slippy"
                  ? "#a5cddd"
                  : "#bdcfca",
              false,
              n[0] === "Pippy",
            ),
    })),
    { y: state.y, draw: () => penguin(state.x, state.y, "#deded0", true) },
  ];
  actors.sort((a, b) => a.y - b.y).forEach((a) => a.draw());
  const shade = ctx.createRadialGradient(
    state.x,
    state.y,
    100,
    state.x,
    state.y,
    700,
  );
  shade.addColorStop(0, "#081a2800");
  shade.addColorStop(
    1,
    cave ? "#081321aa" : indoor ? "#08152577" : "#0b254326",
  );
  ctx.fillStyle = shade;
  ctx.fillRect(camera.x, camera.y, W, H);
  for (const o of activeObjects())
    if (o[0] === "shrine") glow(o[1], o[2] - 20, 100, "#ffd29127");
  if (cave || r.theme === "sanctum")
    for (let i = 0; i < 18; i++) {
      const x = 100 + seeded(i * 41) * (r.width - 200),
        y = 100 + seeded(i * 13) * (r.height - 200);
      ellipse(
        x + Math.sin(time + i) * 8,
        y + Math.cos(time * 0.7 + i) * 6,
        1.5,
        1.5,
        "#b5ddf288",
      );
    }
  ctx.restore();
  if (snow)
    for (let i = 0; i < 28; i++)
      rect(
        (i * 89 + time * 12 - camera.x * 0.2 + W) % W,
        (i * 53 + time * (14 + (i % 5)) - camera.y * 0.2 + H) % H,
        2,
        2,
        "#f5f8e799",
      );
  rect(20, 17, Math.min(570, r.name.length * 9 + 39), 32, "#10263adb");
  text(r.name.toUpperCase(), 36, 39, 14, "#f2e6c7");
  // Local minimap includes the camera rectangle, so off-screen doorways stay understandable.
  const mx = 780,
    my = 23,
    mw = 153,
    mh = 90;
  rect(mx - 10, my - 10, mw + 20, mh + 28, "#10263aee");
  rect(mx, my, mw, mh, "#446371");
  for (const d of r.doors) {
    const pos = doorPoint(r, d.direction);
    rect(
      mx + (pos[0] / r.width) * mw - 2,
      my + (pos[1] / r.height) * mh - 2,
      5,
      5,
      "#dacb96",
    );
  }
  if (r.puzzle) {
    const b = puzzleBoard(r);
    rect(
      mx + (b.x / r.width) * mw,
      my + (b.y / r.height) * mh,
      (b.w / r.width) * mw,
      (b.h / r.height) * mh,
      state.flags[r.puzzle.id] ? "#a3c9a5" : "#b4a481",
    );
  }
  ctx.strokeStyle = "#a1bdc5";
  ctx.lineWidth = 1;
  ctx.strokeRect(
    mx + (camera.x / r.width) * mw,
    my + (camera.y / r.height) * mh,
    (W / r.width) * mw,
    (H / r.height) * mh,
  );
  rect(
    mx + (state.x / r.width) * mw - 2,
    my + (state.y / r.height) * mh - 2,
    4,
    4,
    "#ffe3a0",
  );
  text("M · ROOM JOURNAL", mx, my + mh + 13, 9, "#c2d5cc");
  if (nearby && !dialogue && mode === "world")
    text(
      (nearby.kind === "boss" ? "Approach · " : "E · ") + nearby.name,
      480,
      554,
      13,
      "#fff1c4",
      "center",
    );
  if (r.safe) text("SAFE AREA", 28, 554, 10, "#bed8d3");
  else if (state.assist) text("ASSIST", 28, 554, 10, "#bed8d3");
  if (roomTransition > 0)
    rect(0, 0, W, H, "rgba(6,18,33," + roomTransition * 0.8 + ")");
}

function heart(x, y) {
  const c = "#eea58c";
  rect(x - 6, y - 4, 5, 4, c);
  rect(x + 1, y - 4, 5, 4, c);
  rect(x - 7, y, 14, 4, c);
  rect(x - 5, y + 4, 10, 3, c);
  rect(x - 2, y + 7, 4, 3, c);
}
function drawBattle() {
  const b = battle;
  ctx.save();
  if (b.shake > 0)
    ctx.translate(Math.sin(time * 90) * 3, Math.cos(time * 85) * 2);
  rect(0, 0, W, H, "#091b2b");
  for (let i = 0; i < 24; i++) {
    rect((i * 149) % W, 35 + ((i * 53) % 220), 2, 2, "#49728a");
  }
  text(currentRoom().name.toUpperCase(), 35, 34, 11, "#83a6b7");
  text(b.name, 480, 64, 23, "#eee2bf", "center");
  const king = b.type === "king";
  glow(480, 180, 210, b.phaseLevel === 3 ? "#c17ea129" : "#82bacb1f");
  for (let i = 0; i < 6; i++) {
    rect(110 + i * 143, 95, 3, 135, "#466b8118");
    rect(105 + i * 143, 226, 13, 2, "#87a6b233");
  }
  ellipse(480, 232, 130, 13, "#294b6144");
  if (b.boss) {
    text(
      "PHASE " + b.phaseLevel + (b.phaseLevel === 3 ? " · DESPERATION" : ""),
      775,
      35,
      11,
      b.phaseLevel === 3 ? "#efadad" : "#c9cfb5",
    );
  }
  if (b.flash > 0) {
    text(
      "-" + b.lastDamage,
      568,
      125 - (0.3 - b.flash) * 50,
      22,
      "#ffe2a4",
      "center",
    );
  }
  creature(b.type, 480, king ? 232 : 218, king ? 2.1 : b.boss ? 1.9 : 1.9);
  rect(365, 253, 230, 7, "#253e54");
  rect(365, 253, (230 * b.hp) / b.maxHp, 7, "#a3c3ba");
  text(b.hp + " / " + b.maxHp, 480, 279, 11, "#b8d1d5", "center");
  const a = arena;
  if (b.phase === "dodge")
    text(
      (b.phaseLevel >= 2 && b.phaseTime > b.duration * 0.52
        ? ATTACKS[b.secondary].name
        : ATTACKS[b.attack].name
      ).toUpperCase(),
      480,
      298,
      12,
      "#e8d9ac",
      "center",
    );
  rect(a.x - 3, a.y - 3, a.w + 6, a.h + 6, "#bed4d5");
  rect(a.x, a.y, a.w, a.h, "#0c2335");
  if (b.phase === "dodge") {
    ctx.save();
    ctx.beginPath();
    ctx.rect(a.x, a.y, a.w, a.h);
    ctx.clip();
    for (const h of b.hazards) {
      const active = h.age >= h.warning,
        pulse = 0.35 + Math.sin(h.age * 18) * 0.15;
      if (h.kind === "burst") {
        ctx.strokeStyle = active ? "#fff0b2" : "#edc68a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          h.x,
          h.y,
          h.w + (1 - Math.min(1, h.age / h.warning)) * 18,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
        text("✧", h.x, h.y + 5, 20, "#f4d8a0", "center");
      } else {
        const x = h.kind === "beam" ? h.x - h.w / 2 : h.x,
          y = h.y,
          w = h.w,
          hh = h.h;
        rect(
          x,
          y,
          w,
          hh,
          active ? "#eaf9ecdd" : "rgba(243,187,106," + pulse + ")",
        );
        if (active) {
          glow(x + w / 2, y + hh / 2, 55, "#b9ecff66");
          rect(
            x + 3,
            y + 3,
            Math.max(1, w - 6),
            Math.max(1, hh - 6),
            "#98d8f1aa",
          );
        } else {
          ctx.strokeStyle = "#f1cf88";
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(x, y, w, hh);
          ctx.setLineDash([]);
        }
      }
    }
    for (const p of b.bullets) {
      if (["seed", "snow", "bubble", "water", "royalWater"].includes(p.kind)) {
        const c =
          p.kind === "seed"
            ? "#bd9768"
            : p.kind === "snow"
              ? "#e9f3ed"
              : p.kind === "royalWater"
                ? "#b9a3d8"
                : "#a8d3e0";
        ellipse(p.x, p.y, p.r, p.r, c);
        ellipse(
          p.x - 2,
          p.y - 2,
          Math.max(2, p.r - 4),
          Math.max(2, p.r - 4),
          "#eff8e1",
        );
      } else if (p.kind === "fish") {
        rect(p.x - 7, p.y - 3, 14, 7, "#9ebdc7");
        rect(p.x - 11, p.y - 6, 4, 11, "#c3d6ce");
        rect(p.x + 4, p.y - 2, 2, 2, "#28475d");
      } else if (p.kind === "feather") {
        rect(p.x - 2, p.y - 9, 4, 18, "#dfe6d5");
        rect(p.x - 5, p.y - 5, 9, 8, "#a9c5cd");
      } else if (["spear", "royalSpear", "tooth", "claw"].includes(p.kind)) {
        rect(
          p.x - 2,
          p.y - 10,
          4,
          20,
          p.kind === "royalSpear" ? "#ead09b" : "#c5d9db",
        );
        rect(
          p.x - 5,
          p.y - 10,
          10,
          4,
          p.kind === "royalSpear" ? "#f7e1a7" : "#f1f4e1",
        );
      } else if (p.kind === "seal") {
        ctx.strokeStyle = "#edce89";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.stroke();
        text("◇", p.x, p.y + 4, 14, "#f8df9e", "center");
      } else if (p.kind === "shield") {
        rect(p.x - 8, p.y - 9, 16, 18, "#7d9eaf");
        rect(p.x - 3, p.y - 7, 6, 14, "#b5c8c9");
      } else if (p.kind === "shell") {
        ellipse(p.x, p.y, 8, 8, "#506b86");
        ellipse(p.x - 1, p.y - 2, 6, 6, "#b2d1dd");
        rect(p.x - 3, p.y - 5, 2, 7, "#e7efdd");
      } else if (["star", "darkStar", "anchor"].includes(p.kind)) {
        text("✦", p.x, p.y + 5, 17, "#e9cc94", "center");
      } else if (p.kind === "shard") {
        ctx.fillStyle = "#c5dfeb";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.r - 3);
        ctx.lineTo(p.x + p.r, p.y + 4);
        ctx.lineTo(p.x - p.r, p.y + 4);
        ctx.fill();
      } else {
        ellipse(p.x, p.y, p.r, p.r, "#c3d6ec");
        ellipse(p.x - 2, p.y - 2, 2, 2, "#f0f3e4");
      }
    }
    if (b.invulnerable <= 0 || Math.floor(time * 15) % 2 === 0)
      heart(b.heart.x, b.heart.y);
    ctx.restore();
    text(
      "DODGE · " + Math.max(0, b.duration - b.phaseTime).toFixed(1) + "s",
      480,
      551,
      12,
      "#f3d9a3",
      "center",
    );
  } else if (b.phase === "strike") {
    text("TIME YOUR STRIKE", 480, 363, 15, "#f4dfb1", "center");
    rect(320, 398, 320, 35, "#394a58");
    rect(448, 398, 64, 35, "#6a9b92");
    rect(474, 395, 12, 41, "#edd18b");
    rect(320 + b.marker * 320 - 3, 389, 6, 53, "#fff8df");
    text("CENTER = STRONGEST HIT", 480, 480, 11, "#b5c8cb", "center");
  } else {
    heart(480, 399);
    text(
      b.phase === "result"
        ? state.hp <= 0
          ? "TRY AGAIN"
          : "THE TIDE TURNS"
        : "TAKE YOUR NEXT STEP",
      480,
      451,
      14,
      "#e9d5a6",
      "center",
    );
    text(
      b.phase === "choice"
        ? "Choose an action below."
        : "Continue below or press E.",
      480,
      478,
      11,
      "#a3c1ca",
      "center",
    );
  }
  text("FLIPPY", 55, 380, 13, "#f0dfb6");
  text(Math.ceil(state.hp) + " / " + state.maxHp, 55, 405, 13);
  text("TURN " + b.turn, 770, 380, 12, "#bad3d7");
  if (b.phase === "dodge") {
    text("WATCH THE GAPS", 770, 413, 10, "#f2d5a1");
    text("MOVE TO SURVIVE", 770, 432, 10, "#b6cccf");
  }
  if (b.parents) text("ACT can open a path.", 770, 406, 11, "#decda5");
  ctx.restore();
}
function tick(now) {
  const dt = Math.min((now - last) / 1000 || 0, 0.04);
  last = now;
  const paused = !$("overlay").hidden || !!dialogue || document.hidden;
  if (!paused) {
    time += dt;
    toastTime = Math.max(0, toastTime - dt);
    if (mode === "world") updateWorld(dt);
    else if (mode === "battle") updateBattle(dt);
    if (sound) {
      musicTick += dt;
      if (musicTick > 0.65) {
        musicTick = 0;
        const notes =
          mode === "battle"
            ? [196, 233, 294, 233, 174, 220, 261, 220]
            : [261, 329, 392, 329, 293, 349, 440, 349];
        tone(notes[musicStep++ % notes.length], 0.55, "sine", 0.018);
      }
    }
  } else if (mode === "title") time += dt * 0.3;
  if (mode === "battle" && battle) drawBattle();
  else drawWorld();
  requestAnimationFrame(tick);
}
window.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  const k = e.key.toLowerCase();
  if (!$("overlay").hidden) {
    if (k === "escape" && mode !== "title") {
      e.preventDefault();
      closePanel();
    }
    return;
  }
  // Enter must resolve the timing strike on keydown, even after FIGHT replaces
  // its focused button. Otherwise the browser has no control to activate and
  // the strike waits for its automatic timeout.
  if (
    k === "enter" &&
    mode === "battle" &&
    ["strike", "result"].includes(battle.phase)
  ) {
    const focusedButton = e.target.closest?.("button");
    const battleInput =
      !focusedButton ||
      focusedButton.closest("#battleActions") ||
      focusedButton.id === "interactButton";
    if (battleInput) {
      e.preventDefault();
      if (!e.repeat && !e.isComposing) interact();
      return;
    }
  }
  if (movement.includes(k)) {
    e.preventDefault();
    if ($("overlay").hidden && !dialogue) keys.add(k);
  }
  if (e.repeat) return;
  if (k === "e" || k === " ") {
    e.preventDefault();
    interact();
  } else if (k === "m" && mode === "world" && !dialogue) {
    worldMap();
  } else if (k === "i" && mode === "world" && !dialogue) {
    if ($("overlay").hidden) inventory();
    else closePanel();
  } else if (k === "escape" && mode !== "title" && !dialogue) {
    if ($("overlay").hidden) menu();
    else closePanel();
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
window.addEventListener("blur", () => keys.clear());
document.addEventListener("visibilitychange", () => keys.clear());
window.addEventListener("pagehide", () => {
  if (mode === "world") save();
});
document.querySelectorAll("[data-key]").forEach((b) => {
  b.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    if ($("overlay").hidden && !dialogue) keys.add(b.dataset.key);
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    b.addEventListener(event, () => keys.delete(b.dataset.key));
});
$("mapButton").onclick = worldMap;
$("interactButton").onclick = interact;
$("next").onclick = advance;
$("inventoryButton").onclick = () => {
  if (mode === "world" && !dialogue) {
    if ($("overlay").hidden) inventory();
    else closePanel();
  }
};
$("menuButton").onclick = () => {
  if (mode !== "title" && !dialogue) {
    if ($("overlay").hidden) menu();
    else closePanel();
  }
};
$("soundButton").onclick = toggleSound;
canvas.addEventListener("pointerdown", () =>
  canvas.focus({ preventScroll: true }),
);
title();
requestAnimationFrame(tick);
