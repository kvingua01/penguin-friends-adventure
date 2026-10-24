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
const maps = [
  {
    name: "Frostbell Island",
    chapter: 1,
    tag: "A SMALL BEGINNING",
    spawn: [230, 350],
    exit: [859, 290, "Set sail"],
    npcs: [
      ["Slippy", 470, 350, "slippy"],
      ["Mama", 285, 200, "mama"],
      ["Papa", 345, 200, "parents"],
    ],
    props: [
      ["igloo", 310, 135],
      ["pool", 163, 335],
      ["rock", 190, 205],
      ["pine", 550, 145],
      ["pine", 630, 440],
    ],
    enemies: [
      ["snowcrab", "frost-crab", 660, 350],
      ["snowcrab", "frost-crab2", 530, 210],
    ],
    objects: [
      ["shrine", 125, 440, "frost-rest"],
      ["chest", 398, 450, "frost-chest"],
      ["sign", 390, 255, "frost-sign"],
    ],
  },
  {
    name: "Boonona Bay",
    chapter: 2,
    tag: "SOMETHING BEYOND THE SNOW",
    spawn: [140, 360],
    exit: [860, 215, "Follow the current"],
    npcs: [["Slippy", 225, 380, "slippy"]],
    props: [
      ["palm", 220, 150],
      ["palm", 450, 130],
      ["palm", 590, 430],
      ["pool", 467, 330],
      ["rock", 685, 385],
    ],
    enemies: [
      ["coconut", "bay-coconut", 370, 205],
      ["reef", "bay-reef", 630, 280],
    ],
    objects: [
      ["fruit", 300, 290, "fruit1"],
      ["fruit", 510, 440, "fruit2"],
      ["fruit", 700, 145, "fruit3"],
      ["boss", 790, 213, "baby"],
      ["shrine", 155, 440, "bay-rest"],
      ["chest", 440, 220, "bay-chest"],
      ["sign", 135, 270, "bay-sign"],
    ],
  },
  {
    name: "The Quiet Cove",
    chapter: 3,
    tag: "AN EMPTY PLACE BESIDE YOU",
    spawn: [160, 350],
    exit: [860, 295, "Board Pippy’s boat"],
    npcs: [["Pippy", 740, 300, "pippy"]],
    props: [
      ["palm", 290, 150],
      ["rock", 400, 380],
      ["rock", 570, 170],
      ["boat", 865, 330],
    ],
    enemies: [
      ["reef", "cove-reef", 490, 265],
      ["gull", "cove-gull", 330, 390],
    ],
    objects: [
      ["shrine", 155, 440, "cove-rest"],
      ["chest", 590, 400, "cove-chest"],
      ["sign", 240, 250, "cove-sign"],
    ],
  },
  {
    name: "Orca Kingdom · Sea Gate",
    chapter: 3,
    tag: "COURAGE IS GOING ANYWAY",
    spawn: [140, 340],
    exit: [860, 275, "Enter the kingdom"],
    npcs: [],
    props: [
      ["tower", 765, 120],
      ["tower", 765, 430],
      ["rock", 350, 170],
      ["rock", 460, 420],
    ],
    enemies: [
      ["guard", "gate-patrol", 390, 300],
      ["gull", "gate-gull", 600, 160],
    ],
    objects: [
      ["boss", 780, 275, "gate"],
      ["shrine", 155, 440, "gate-rest"],
      ["chest", 550, 385, "gate-chest"],
      ["sign", 220, 230, "gate-sign"],
    ],
  },
  {
    name: "Orca Kingdom · Tidal Halls",
    chapter: 4,
    tag: "A PROMISE WORTH KEEPING",
    spawn: [140, 295],
    exit: [860, 290, "Open the throne room"],
    npcs: [["Pebble", 450, 295, "pebble"]],
    props: [
      ["tower", 370, 130],
      ["tower", 630, 450],
      ["pool", 490, 170],
    ],
    enemies: [
      ["guard", "hall-patrol", 400, 410],
      ["reef", "hall-reef", 660, 250],
    ],
    objects: [
      ["boss", 270, 170, "key1"],
      ["boss", 700, 400, "key2"],
      ["shrine", 155, 440, "hall-rest"],
      ["chest", 570, 370, "hall-chest"],
      ["sign", 230, 295, "hall-sign"],
    ],
  },
  {
    name: "The Throne of the Sea",
    chapter: 4,
    tag: "NO FRIEND LEFT BEHIND",
    spawn: [150, 300],
    exit: null,
    npcs: [],
    props: [
      ["throne", 720, 255],
      ["tower", 400, 120],
      ["tower", 400, 450],
    ],
    enemies: [],
    objects: [
      ["boss", 665, 300, "king"],
      ["cage", 835, 300, "slippy-cage"],
      ["shrine", 160, 440, "throne-rest"],
      ["sign", 290, 295, "throne-sign"],
    ],
  },
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
function fresh() {
  return {
    version: 1,
    map: 0,
    x: 230,
    y: 350,
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
      s.version !== 1 ||
      !Number.isInteger(s.map) ||
      s.map < 0 ||
      s.map >= maps.length ||
      !Number.isFinite(s.x) ||
      !Number.isFinite(s.y) ||
      s.x < 60 ||
      s.x > 905 ||
      s.y < 75 ||
      s.y > 525 ||
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
  const m = maps[state.map];
  $("chapter").textContent = "CHAPTER 0" + m.chapter + " · " + m.tag;
  $("location").textContent = m.name;
  $("healthText").textContent =
    "FLIPPY · " + Math.ceil(state.hp) + " / " + state.maxHp;
  $("healthBar").style.width = (state.hp / state.maxHp) * 100 + "%";
  $("healthBar").style.background = state.hp < 35 ? "#e69b83" : "#91c9a9";
  $("objective").textContent = objective();
  $("inventoryButton").disabled = mode !== "world" || !!dialogue;
}
function objective() {
  const f = state.flags;
  switch (state.map) {
    case 0:
      return !f.metSlippy
        ? "Find Slippy on the snowy path."
        : !f.parents
          ? "Talk to Papa. Show your parents you’re ready to leave."
          : "Take the eastern dock to Boonona Bay.";
    case 1:
      return fruitCount() < 3
        ? `Explore the island and gather boononas (${fruitCount()} / 3).`
        : !f.baby
          ? "Face Baby Orca at the eastern shallows."
          : "Follow the eastern current with Slippy.";
    case 2:
      return !f.pippy
        ? "Slippy has been captured. Find Pippy by the eastern dock."
        : "Board Pippy’s boat at the eastern dock.";
    case 3:
      return !f.gate
        ? "Defeat Captain Undertow to enter the Orca Kingdom."
        : "The sea gate is open. Head east.";
    case 4:
      return !f.key1 || !f.key2
        ? `Defeat both wardens and collect their seals (${Number(!!f.key1) + Number(!!f.key2)} / 2).`
        : "Use the two seals at the eastern throne-room door.";
    case 5:
      return !f.king
        ? "Face King Orca of the Sea. Slippy is counting on you."
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
    '<div class="eyebrow">FOUR CHAPTERS · ONE UNBREAKABLE FRIENDSHIP</div><h2>Every ocean begins<br>with a little courage.</h2><p>Play as Flippy, a baby emperor penguin with a very big promise. Leave home, explore Boonona Bay, and cross the Orca Kingdom to bring your best friend back.</p><small>Move: WASD / arrows · Talk: E / Space<br>In battle, time your strike, then move the heart to dodge.<br>Progress saves in this browser at milestones and rest lanterns.</small>',
  );
  const bs = [];
  if (saved)
    bs.push([
      "Continue adventure",
      () => {
        state = saved;
        mode = "world";
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
    "<h2>A field guide for little flippers</h2><p>Walk with WASD, arrow keys, or the on-screen direction pad. Stand near a character or object and press E / Space or INTERACT.</p><p>FIGHT starts a moving strike marker. Press E / Space or STRIKE near the center for more damage. Then move your heart inside the battle box until the attack ends.</p><p>ITEM consumes a healing turn. FLEE unlocks after dealing enough damage in normal encounters. Major bosses cannot be fled from, except your parents, who also have ACT.</p><p>Rest lanterns fully heal you, save your journey, and supply one fish if your bag is empty. Assist mode slows attacks and reduces incoming damage. No story content changes.</p>",
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
  const m = maps[state.map];
  return m.objects.filter((o) => {
    const [type, , , id] = o;
    if (type === "fruit" || type === "chest" || type === "boss")
      return !state.flags[id];
    return true;
  });
}
function targets() {
  const m = maps[state.map];
  return [
    ...m.npcs.map((n) => ({
      kind: "npc",
      name: n[0],
      x: n[1],
      y: n[2],
      id: n[3],
    })),
    ...activeObjects().map((o) => ({
      kind: o[0],
      name: {
        shrine: "Rest lantern",
        chest: "Supply chest",
        sign: "Trail sign",
        fruit: "Boonona",
        boss: enemies[o[3]]?.name,
        cage: state.flags.king ? "Slippy" : "Slippy’s cage",
      }[o[0]],
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
    ...(m.exit
      ? [{ kind: "exit", name: m.exit[2], x: m.exit[0], y: m.exit[1] }]
      : []),
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
    case "npc":
      talk(n.id);
      break;
    case "enemy":
      startBattle(n.enemy, n.id);
      break;
    case "boss":
      if (n.id === "baby" && fruitCount() < 3) {
        say("BABY ORCA", [
          "No snacks, no passage! There are three boonona groves on this island.",
        ]);
        return;
      }
      startBattle(n.id, n.id);
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
    case "sign":
      say("TRAIL SIGN", [signText()]);
      break;
    case "exit":
      exitMap();
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
  [state.x, state.y] = maps[index].spawn;
  nearby = null;
  keys.clear();
  state.hp = Math.min(state.maxHp, state.hp + 20);
  updateHud();
  save();
  tone(392, 0.25);
}
function ending() {
  mode = "world";
  save();
  panel(
    '<div class="eyebrow">THE END · AND THE BEGINNING</div><h2>Some things are bigger<br>than the ocean.</h2><p>The King lowers his crown. For the first time, the throne room is quiet enough to hear a small voice.</p><p>“I only wanted a friend,” he says.</p><p>“Then ask,” Flippy answers. “You don’t have to take one.”</p><p>Pippy’s boat carries two little penguins home beneath a sky full of stars. There are boononas in the bag, stories to tell, and a place beside Flippy that will never be empty.</p><small>Thank you for playing all four chapters.<br>Original story adaptation, pixel art, and synthesized audio.<br>First playable edition — your feedback shapes what comes next.</small>',
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
          "Press E / Space or STRIKE when the marker reaches the center.";
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
    a.append(button("STRIKE · E / SPACE", finishStrike, true));
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
  battle.phase = "dodge";
  battle.phaseTime = 0;
  battle.spawnTime = 0;
  battle.turn++;
  battle.bullets = [];
  battle.heart = { x: 480, y: 416 };
  battle.invulnerable = 0.65;
  battle.message += " Move your heart to dodge!";
  keys.clear();
  battleUI();
}
function finishBattle(outcome) {
  const b = battle;
  b.phase = "result";
  b.bullets = [];
  keys.clear();
  if (outcome === "win") {
    state.flags[b.id] = true;
    state.xp += b.xp;
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
    state.x = Math.max(90, state.x - 36);
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
function bullet(x, y, vx, vy, r = 7, kind = "orb") {
  battle.bullets.push({ x, y, vx, vy, r, kind, age: 0 });
}
const arena = { x: 288, y: 316, w: 384, h: 204 };
function spawnPattern() {
  const b = battle,
    a = arena,
    t = b.phaseTime,
    rate = state.assist ? 0.78 : 1;
  let pattern = b.pattern;
  if (pattern === "king")
    pattern = ["fan", "spiral", "wave", "rain"][(b.turn - 1) % 4];
  const speed = (b.boss ? 105 : 88) * rate;
  if (pattern === "rain") {
    const gap = (b.turn * 43 + Math.floor(t * 2) * 61) % 260;
    for (let i = 0; i < 5; i++) {
      const x = a.x + 20 + i * 84;
      if (Math.abs(x - (a.x + gap + 50)) < 48) continue;
      bullet(x, a.y - 10, Math.sin(t * 2 + i) * 15, speed, 7, "shard");
    }
  } else if (pattern === "fan") {
    const sx = a.x + a.w / 2 + Math.sin(t * 2) * 95;
    for (let i = -2; i <= 2; i++)
      bullet(
        sx,
        a.y - 12,
        Math.sin(i * 0.38) * speed,
        Math.cos(i * 0.38) * speed,
        6,
      );
  } else if (pattern === "aim") {
    const side = Math.floor(t * 2) % 2 === 0,
      x = side ? a.x - 10 : a.x + a.w + 10,
      y = a.y + 20 + ((Math.sin(t * 2) + 1) * (a.h - 40)) / 2,
      angle = Math.atan2(b.heart.y - y, b.heart.x - x);
    for (let i = -1; i <= 1; i++)
      bullet(
        x,
        y,
        Math.cos(angle + i * 0.22) * speed,
        Math.sin(angle + i * 0.22) * speed,
        6,
        "shard",
      );
  } else if (pattern === "wave") {
    const fromLeft = Math.floor(t * 1.3) % 2 === 0,
      gap = a.y + 35 + (Math.sin(t * 1.2) + 1) * 65;
    for (let y = a.y + 12; y < a.y + a.h; y += 29) {
      if (Math.abs(y - gap) < 40) continue;
      bullet(
        fromLeft ? a.x - 10 : a.x + a.w + 10,
        y,
        (fromLeft ? 1 : -1) * speed,
        0,
        7,
      );
    }
  } else if (pattern === "spiral") {
    for (let i = 0; i < 4; i++) {
      const angle = t * 1.7 + (i * Math.PI) / 2;
      bullet(
        a.x + a.w / 2,
        a.y - 8,
        Math.cos(angle) * speed,
        Math.abs(Math.sin(angle) * speed) + 30,
        6,
      );
    }
  }
}
function updateBattle(dt) {
  const b = battle;
  if (b.phase === "strike") {
    b.phaseTime += dt;
    b.marker = (b.phaseTime * 0.7) % 1;
    if (b.phaseTime > 4.1) finishStrike();
  } else if (b.phase === "dodge") {
    b.phaseTime += dt;
    b.spawnTime += dt;
    b.invulnerable = Math.max(0, b.invulnerable - dt);
    let [dx, dy] = direction();
    const speed = state.assist ? 205 : 190;
    b.heart.x = Math.max(
      arena.x + 8,
      Math.min(arena.x + arena.w - 8, b.heart.x + dx * speed * dt),
    );
    b.heart.y = Math.max(
      arena.y + 8,
      Math.min(arena.y + arena.h - 8, b.heart.y + dy * speed * dt),
    );
    const interval = state.assist ? 0.84 : 0.62;
    if (b.spawnTime > interval && b.phaseTime < 5.6) {
      b.spawnTime = 0;
      spawnPattern();
    }
    for (const p of b.bullets) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.age += dt;
      if (
        b.invulnerable <= 0 &&
        p.x > arena.x &&
        p.x < arena.x + arena.w &&
        p.y > arena.y &&
        p.y < arena.y + arena.h &&
        Math.hypot(p.x - b.heart.x, p.y - b.heart.y) < p.r + 5
      ) {
        state.hp = Math.max(
          0,
          state.hp - Math.ceil(b.damage * (state.assist ? 0.55 : 1)),
        );
        b.invulnerable = 0.85;
        tone(110, 0.12, "sawtooth", 0.025);
        updateHud();
        if (state.hp <= 0) {
          finishBattle("lose");
          return;
        }
      }
    }
    b.bullets = b.bullets.filter(
      (p) =>
        p.age < 8 &&
        p.x > arena.x - 50 &&
        p.x < arena.x + arena.w + 50 &&
        p.y < arena.y + arena.h + 50,
    );
    if (b.phaseTime >= 6.3) {
      b.phase = "choice";
      b.bullets = [];
      b.message =
        b.parents && b.acts >= 2
          ? "Your parents believe in you. FLEE is unlocked."
          : b.type === "king" && b.hp < b.maxHp / 2
            ? "The King’s confidence cracks. You think of Slippy."
            : "You catch your breath. Choose your next move.";
      battleUI();
    }
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
  if (x < 77 || x > 888 || y < 91 || y > 510) return false;
  const m = maps[state.map];
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
    speed = 150;
  const px = state.x,
    py = state.y;
  if (walkable(state.x + dx * speed * dt, state.y)) state.x += dx * speed * dt;
  if (walkable(state.x, state.y + dy * speed * dt)) state.y += dy * speed * dt;
  state.steps = (state.steps || 0) + Math.hypot(state.x - px, state.y - py);
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
        ? "E / Space · " + nearby.name
        : "Explore · Rest lanterns heal & save · I opens your bag";
  if ($("hint").textContent !== text) $("hint").textContent = text;
}
// All illustrations below are drawn specifically for this game, without external assets.
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
function penguin(x, y, color = "#d7d8ce", baby = false, hat = false) {
  x = Math.round(x);
  y = Math.round(y);
  ellipse(x, y + 4, 15, 5, "#10293844");
  if (baby && keys.size && !dialogue) y += Math.sin(time * 13) * 2;
  rect(x - 10, y - 25, 20, 26, "#193448");
  rect(x - 13, y - 18, 26, 17, "#193448");
  rect(x - 8, y - 17, 16, 19, color);
  rect(x - 10, y - 30, 20, 14, "#193448");
  rect(x - 8, y - 27, 16, 9, "#f4f3dc");
  rect(x - 6, y - 25, 3, 3, "#152a39");
  rect(x + 3, y - 25, 3, 3, "#152a39");
  rect(x - 2, y - 21, 5, 3, "#efb76c");
  rect(x - 11, y, 9, 4, "#efb76c");
  rect(x + 3, y, 9, 4, "#efb76c");
  rect(x - 17, y - 15, 5, 13, "#193448");
  rect(x + 13, y - 15, 5, 13, "#193448");
  if (baby) {
    rect(x - 11, y - 13, 22, 5, "#e99b7d");
    rect(x + 7, y - 8, 5, 10, "#e99b7d");
  }
  if (hat) {
    rect(x - 13, y - 33, 26, 5, "#f2e5bb");
    rect(x - 8, y - 39, 16, 7, "#f2e5bb");
  }
}
function orca(x, y, scale = 1, color = "#8eacbf", crown = false) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);
  ellipse(0, 4, 24, 7, "#071a2a55");
  ellipse(0, -15, 21, 29, "#132b40");
  ellipse(0, -10, 14, 21, color);
  ellipse(-10, -27, 6, 5, "#f5f1d9");
  ellipse(10, -27, 6, 5, "#f5f1d9");
  rect(-11, -29, 3, 3, "#1c334b");
  rect(8, -29, 3, 3, "#1c334b");
  rect(-6, -17, 12, 3, "#dbe8df");
  rect(-29, -19, 11, 17, "#132b40");
  rect(18, -19, 11, 17, "#132b40");
  if (crown) {
    rect(-18, -49, 36, 8, "#e5bd6e");
    rect(-18, -59, 7, 14, "#e5bd6e");
    rect(-4, -64, 8, 18, "#e5bd6e");
    rect(11, -59, 7, 14, "#e5bd6e");
    rect(-2, -52, 4, 4, "#e99484");
  }
  ctx.restore();
}
function creature(type, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const c = enemies[type]?.color || "#b9cbd0";
  if (["parents"].includes(type)) {
    penguin(-19, 0, "#c5b5db");
    penguin(20, 0, "#bdcdd9");
  } else if (["king", "baby", "gate", "guard", "key1", "key2"].includes(type))
    orca(0, 0, 1, c, type === "king");
  else if (type === "snowcrab") {
    ellipse(0, -10, 18, 12, c);
    for (const s of [-1, 1]) {
      rect(s * 18 - 4, -17, 8, 10, "#e3eeee");
      rect(s * 23 - 4, -24, 8, 8, c);
      rect(s * 15 - 3, 0, 6, 7, c);
    }
    rect(-8, -14, 3, 3, "#244258");
    rect(5, -14, 3, 3, "#244258");
  } else if (type === "coconut") {
    ellipse(0, -15, 18, 20, c);
    rect(-8, -20, 4, 4, "#344b47");
    rect(5, -20, 4, 4, "#344b47");
    rect(-6, -9, 12, 3, "#6c614a");
    rect(-18, 2, 10, 5, "#708c6a");
    rect(7, 2, 10, 5, "#708c6a");
  } else if (type === "gull") {
    ellipse(0, -12, 13, 15, "#dfe5da");
    rect(-8, -17, 16, 5, "#243f56");
    rect(-2, -10, 8, 4, "#d8b675");
    rect(-35, -19 + Math.sin(time * 5) * 4, 25, 7, "#bdcbd0");
    rect(10, -19 + Math.sin(time * 5) * 4, 25, 7, "#bdcbd0");
  } else {
    ellipse(0, -10, 20, 12, c);
    rect(-9, -15, 4, 4, "#183e50");
    rect(5, -15, 4, 4, "#183e50");
    rect(-10, -4, 20, 3, "#eee8cf");
  }
  ctx.restore();
}
function prop(p) {
  const [t, x, y] = p;
  if (t === "rock") {
    ellipse(x, y, 25, 17, "#74919e");
    rect(x - 17, y - 13, 23, 5, "#c5dce0");
  } else if (t === "pool") {
    ellipse(x, y, 38, 26, "#89bdca");
    ellipse(x, y - 2, 31, 19, "#2b6c8b");
    rect(x - 15, y - 5, 18, 2, "#75aebb");
  } else if (t === "igloo") {
    ellipse(x, y, 57, 43, "#a0c4d2");
    ellipse(x, y - 6, 53, 39, "#f3f8e9");
    for (let yy = y - 25; yy < y + 25; yy += 13)
      rect(x - 44, yy, 88, 2, "#c7dfdf");
    ellipse(x, y + 3, 16, 18, "#315a70");
    rect(x - 16, y + 3, 32, 30, "#315a70");
  } else if (t === "pine" || t === "palm") {
    rect(x - 5, y - 40, 10, 47, "#8f826a");
    ctx.fillStyle = t === "pine" ? "#709c98" : "#568c70";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y - 78 + i * 17);
      ctx.lineTo(x - 31 + i * 3, y - 33 + i * 13);
      ctx.lineTo(x + 31 - i * 3, y - 33 + i * 13);
      ctx.fill();
    }
    if (t === "pine") rect(x - 12, y - 65, 25, 5, "#d7ece8");
  } else if (t === "tower") {
    rect(x - 28, y - 65, 56, 70, "#354c68");
    rect(x - 23, y - 59, 46, 60, "#5d7890");
    for (let i = 0; i < 3; i++)
      rect(x - 28 + i * 22, y - 77, 12, 17, "#5d7890");
    rect(x - 7, y - 40, 14, 23, "#19334e");
    rect(x - 24, y - 15, 48, 2, "#88a2b2");
  } else if (t === "boat") {
    ellipse(x, y, 40, 14, "#725f58");
    ellipse(x, y - 5, 35, 10, "#c3aa81");
    rect(x - 2, y - 70, 4, 65, "#bcb99b");
    ctx.fillStyle = "#e1d6b1";
    ctx.beginPath();
    ctx.moveTo(x + 3, y - 70);
    ctx.lineTo(x + 34, y - 16);
    ctx.lineTo(x + 3, y - 16);
    ctx.fill();
  } else if (t === "throne") {
    rect(x - 36, y - 70, 72, 80, "#5a5875");
    rect(x - 27, y - 62, 54, 60, "#b79a69");
    rect(x - 20, y - 52, 40, 43, "#3b4b6c");
    rect(x - 40, y - 9, 80, 20, "#ae956b");
  }
}
function object(o) {
  const [t, x, y, id] = o;
  if (t === "boss") {
    creature(id, x, y + Math.sin(time * 2) * 2);
    return;
  }
  if (t === "fruit") {
    rect(x - 4, y - 30, 8, 33, "#8c8563");
    ellipse(x, y - 33, 24, 22, "#6d9d74");
    rect(x - 12, y - 30, 8, 15, "#efd18a");
    rect(x + 2, y - 27, 8, 15, "#efd18a");
  } else if (t === "shrine") {
    ellipse(x, y + 3, 19, 7, "#304e5e33");
    rect(x - 8, y - 32, 16, 35, "#799293");
    rect(x - 14, y - 35, 28, 7, "#4b6a74");
    rect(x - 9, y - 29, 18, 19, "#edce8b");
    rect(x - 5, y - 26, 10, 13, "#fff0b7");
    ellipse(x, y - 21, 25 + Math.sin(time * 3) * 3, 25, "#ffe0a013");
  } else if (t === "chest") {
    rect(x - 17, y - 20, 34, 24, "#8c7762");
    rect(x - 17, y - 20, 34, 7, "#c3a87c");
    rect(x - 3, y - 13, 6, 9, "#efcf84");
  } else if (t === "sign") {
    rect(x - 2, y - 14, 4, 20, "#867761");
    rect(x - 20, y - 34, 40, 24, "#a18b6a");
    rect(x - 14, y - 27, 28, 2, "#efddb2");
    rect(x - 14, y - 21, 20, 2, "#efddb2");
  } else if (t === "cage") {
    penguin(x, y, "#adccdf");
    if (!state.flags.king) {
      for (let i = -22; i <= 22; i += 11) rect(x + i, y - 45, 4, 54, "#63798b");
      rect(x - 24, y - 45, 52, 5, "#92a5ad");
      rect(x - 24, y + 5, 52, 5, "#92a5ad");
    }
  }
}
function drawWorld() {
  const m = maps[state.map],
    p = palettes[state.map];
  rect(0, 0, W, H, p.sea);
  for (let y = 24; y < H; y += 29)
    for (let x = 0; x < W; x += 63) {
      rect(x + Math.sin(time + y) * 4, y, 21, 2, "#8bb9c51c");
      rect(x + 30, y + 13, 9, 2, "#98cbd21a");
    }
  rect(60, 89, 840, 449, "#0b213a55");
  rect(63, 75, 834, 450, p.edge);
  rect(76, 82, 808, 430, p.land);
  rect(86, 93, 788, 410, p.land);
  ctx.strokeStyle = p.path;
  ctx.lineWidth = 36;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(120, 300);
  ctx.lineTo(835, 300);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(300, 160);
  ctx.lineTo(300, 430);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(690, 160);
  ctx.lineTo(690, 430);
  ctx.stroke();
  for (let i = 0; i < 80; i++) {
    const x = 95 + ((i * 131) % 766),
      y = 105 + ((i * 59) % 382);
    rect(x, y, 3, 2, p.accent + "44");
  }
  if (m.exit) {
    rect(843, m.exit[1] - 24, 69, 48, "#8d8875");
    for (let i = 0; i < 5; i++)
      rect(847 + i * 13, m.exit[1] - 21, 2, 42, "#c4b58f");
    text("→", 857, m.exit[1] - 34, 20, "#fff0bb");
  }
  text(m.name.toUpperCase(), 112, 60, 12, "#d8e9e3");
  const actors = [
    ...m.props.map((p) => ({ y: p[2], draw: () => prop(p) })),
    ...activeObjects().map((o) => ({ y: o[2], draw: () => object(o) })),
    ...m.npcs.map((n) => ({
      y: n[2],
      draw: () =>
        n[0] === "Pebble"
          ? orca(n[1], n[2], 0.7, "#b5c7b5")
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
    ...m.enemies
      .filter((e) => !state.flags[e[1]])
      .map((e) => ({
        y: e[3],
        draw: () => {
          creature(e[0], e[2], e[3] + Math.sin(time * 2 + e[2]) * 2);
          text("!", e[2], e[3] - 43, 15, "#a67e64", "center");
        },
      })),
    { y: state.y, draw: () => penguin(state.x, state.y, "#deded0", true) },
  ];
  actors.sort((a, b) => a.y - b.y).forEach((a) => a.draw());
  if (nearby && !dialogue && mode === "world") {
    const label = "E · " + nearby.name,
      w = ctx.measureText(label).width + 22,
      x = Math.min(W - w / 2 - 8, Math.max(w / 2 + 8, nearby.x)),
      y = nearby.y - 59;
    rect(x - w / 2, y - 14, w, 25, "#0b2638");
    text(label, x, y + 3, 12, "#fff0c5", "center");
  }
  if (state.assist) text("ASSIST", 807, 552, 10, "#bed8d3");
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
  rect(0, 0, W, H, "#091b2b");
  for (let i = 0; i < 24; i++) {
    rect((i * 149) % W, 35 + ((i * 53) % 220), 2, 2, "#49728a");
  }
  text(maps[state.map].name.toUpperCase(), 35, 34, 11, "#83a6b7");
  text(b.name, 480, 64, 23, "#eee2bf", "center");
  const king = b.type === "king";
  creature(b.type, 480, king ? 222 : 208, king ? 2.6 : b.boss ? 2.3 : 2.1);
  rect(365, 253, 230, 7, "#253e54");
  rect(365, 253, (230 * b.hp) / b.maxHp, 7, "#a3c3ba");
  text(b.hp + " / " + b.maxHp, 480, 279, 11, "#b8d1d5", "center");
  const a = arena;
  rect(a.x - 3, a.y - 3, a.w + 6, a.h + 6, "#bed4d5");
  rect(a.x, a.y, a.w, a.h, "#0c2335");
  if (b.phase === "dodge") {
    ctx.save();
    ctx.beginPath();
    ctx.rect(a.x, a.y, a.w, a.h);
    ctx.clip();
    for (const p of b.bullets) {
      if (p.kind === "shard") {
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
      "DODGE · " + Math.max(0, 6.3 - b.phaseTime).toFixed(1) + "s",
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
  if (b.parents) text("ACT can open a path.", 770, 406, 11, "#decda5");
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
  if (movement.includes(k)) {
    e.preventDefault();
    if ($("overlay").hidden && !dialogue) keys.add(k);
  }
  if (e.repeat) return;
  if (k === "e" || k === " ") {
    e.preventDefault();
    interact();
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
