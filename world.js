"use strict";
// Authored room graph. Every doorway is paired; chapter crossings stay story-gated.
window.PENGUIN_WORLD = (() => {
  const rooms = {};
  const starts = ["h0", "b0", "c0", "g0", "k0", "t0"];
  const notes = {
    h0: "A little home, a big horizon. Slippy waits east in Lantern Square.",
    h1: "The forest road runs east to the harbor. Home is west. Moss’s shop is north; the frozen lake is south.",
    h2: "Tall trees shelter the old route. North: Crystal Grotto. East: Windbreak Ridge.",
    h3: "Moss keeps extra supplies for travelers. A thoughtful gift can be more useful than a shiny coin.",
    h4: "The lake remembers every footstep until the next snowfall.",
    h5: "East: the watchtower and harbor. South: the last warm camp.",
    h6: "Ring the old bell. People at the lake say it has been silent for years.",
    h7: "Beyond this tower, the ocean stops looking like a picture and starts looking like a road.",
    h8: "An old explorer wrote: “Pack food. Leave a note. Come home with stories.”",
    h9: "BOONONA FERRY · Have you spoken to your parents? The sea can wait for a goodbye.",
    b0: "Welcome to Boonona Bay. Village east. There are three fruit groves beyond the village.",
    b1: "North: Sunleaf Grove. East: Riverwalk. Slippy has already declared this the best island.",
    b2: "The first grove grows where the sun touches the leaves. Canopy Walk is east.",
    b3: "Old carvings describe a small orca learning how to make waves.",
    b4: "Follow the river south for fruit, or head east toward Golden Orchard and the eastern beach.",
    b5: "Waterfall fruit grows sweeter than the rest. At least, that is what the waterfall says.",
    b6: "The ocean once filled these ruins. The walls still hum when the tide turns.",
    b7: "The final grove. Baby Orca waits beyond the eastern shore.",
    b8: "Take a breath before the eastern beach. Stock up and save your journey.",
    b9: "BABY ORCA’S BEACH · Strong currents ahead. A splash is only the beginning.",
    c0: "Slippy was taken east. Look for a sailor along the broken coast.",
    c1: "The wreck came from the kingdom. Someone scratched “not every orca agrees” into the wood.",
    c2: "Even the deepest cave has a sound that leads outside.",
    c3: "Pippy’s dock is east. A quiet market survives to the south.",
    c4: "The merchant leaves food for anyone with a friend to find.",
    c5: "PIPPY’S FERRY · Sea Gate passage. Speak to the captain before boarding.",
    g0: "The kingdom rises from the sea like a storm that learned to stand still.",
    g1: "The stairway branches north to the cliffs and east to the barracks.",
    g2: "A beacon can guide a boat home. It cannot decide who deserves to be rescued.",
    g3: "Captain Undertow waits east. The old drain lies south.",
    g4: "You hear a small voice through the pipes: “Flippy will come.”",
    g5: "SEA GATE · Only the captain can release the lock.",
    k0: "Two seals open the throne-room door. Pearl in the north. Tide in the south.",
    k1: "The kingdom’s people have learned to whisper. Pebble has something to tell you.",
    k2: "The archive lantern controls the pearl chamber. Search the library to the east.",
    k3: "Light the archive lantern, then enter the pearl chamber to the east.",
    k4: "The Warden of the Pearl collects beautiful things. He has forgotten why.",
    k5: "A garden beneath the sea. East: the prison walk. South: the floodworks.",
    k6: "Turn the sluice wheel here to open the flooded cistern to the east.",
    k7: "The tide warden guards the chamber beyond the eastern channel.",
    k8: "TIDE SANCTUM · The tide returns, but never in quite the same way.",
    k9: "The guards moved Slippy to the throne room. Keep going east.",
    k10: "Each painting shows the King alone. The empty spaces are the saddest part.",
    k11: "The door has two hollows: one for a pearl, one for a tide.",
    t0: "No army. No grand plan. Just you, and the promise you made.",
    t1: "A faded picture: a little orca, watching other children play from far away.",
    t2: "Rest here. Stock your bag. The King will not give up his crown easily.",
    t3: "Every step led here. Slippy is waiting beyond the throne.",
  };
  function room(id, name, region, gx, gy, theme, layout = 0) {
    rooms[id] = {
      id,
      name,
      region,
      gx,
      gy,
      theme,
      layout,
      npcs: [],
      props: [],
      enemies: [],
      objects: [],
      doors: [],
      note: notes[id],
    };
    return rooms[id];
  }
  const definitions = [
    ["h0", "Flippy’s Home", 0, 0, 1, "snowhome"],
    ["h1", "Lantern Square", 0, 1, 1, "village"],
    ["h2", "Whisperpine Trail", 0, 2, 1, "forest"],
    ["h3", "Moss’s Supply Nook", 0, 1, 0, "cabin"],
    ["h4", "Mirrorfrost Lake", 0, 1, 2, "lake"],
    ["h5", "Windbreak Ridge", 0, 3, 1, "ridge"],
    ["h6", "Crystal Grotto", 0, 2, 0, "icecave"],
    ["h7", "Northwatch Tower", 0, 4, 1, "ruins"],
    ["h8", "Lastlight Camp", 0, 3, 2, "forest"],
    ["h9", "Frostbell Harbor", 0, 5, 1, "dock"],
    ["b0", "Shellwash Landing", 1, 0, 1, "shore"],
    ["b1", "Boonona Village", 1, 1, 1, "village"],
    ["b2", "Sunleaf Grove", 1, 1, 0, "jungle"],
    ["b3", "Canopy Walk", 1, 2, 0, "jungle"],
    ["b4", "Riverwalk", 1, 2, 1, "river"],
    ["b5", "Singing Falls", 1, 2, 2, "waterfall"],
    ["b6", "Sunken Courtyard", 1, 3, 0, "ruins"],
    ["b7", "Golden Orchard", 1, 3, 1, "jungle"],
    ["b8", "Firefly Camp", 1, 3, 2, "camp"],
    ["b9", "Breakwater Beach", 1, 4, 1, "shore"],
    ["c0", "The Empty Shore", 2, 0, 1, "shore"],
    ["c1", "Shipwreck Strand", 2, 1, 1, "wreck"],
    ["c2", "Echo Cave", 2, 1, 0, "cave"],
    ["c3", "Broken Jetty", 2, 2, 1, "dock"],
    ["c4", "Moonlit Market", 2, 2, 2, "village"],
    ["c5", "Pippy’s Mooring", 2, 3, 1, "dock"],
    ["g0", "Kingdom Landing", 3, 0, 1, "shore"],
    ["g1", "Saltstone Stair", 3, 1, 1, "ruins"],
    ["g2", "Beacon Cliff", 3, 1, 0, "ridge"],
    ["g3", "Guard Barracks", 3, 2, 1, "hall"],
    ["g4", "The Old Drain", 3, 2, 2, "cave"],
    ["g5", "The Sea Gate", 3, 3, 1, "gate"],
    ["k0", "Outer Vestibule", 4, 0, 1, "hall"],
    ["k1", "Whispering Plaza", 4, 1, 1, "garden"],
    ["k2", "Pearl Passage", 4, 1, 0, "hall"],
    ["k3", "The Drowned Archive", 4, 2, 0, "library"],
    ["k4", "Pearl Reliquary", 4, 3, 0, "sanctum"],
    ["k5", "The Glass Garden", 4, 2, 1, "garden"],
    ["k6", "Floodworks", 4, 2, 2, "cistern"],
    ["k7", "The Silent Cistern", 4, 3, 2, "cistern"],
    ["k8", "Tide Sanctum", 4, 4, 2, "sanctum"],
    ["k9", "Prison Walk", 4, 3, 1, "cell"],
    ["k10", "Gallery of Crowns", 4, 4, 1, "gallery"],
    ["k11", "The Two-Seal Door", 4, 5, 1, "gate"],
    ["t0", "The Royal Vestibule", 5, 0, 1, "hall"],
    ["t1", "Hall of Small Memories", 5, 1, 1, "gallery"],
    ["t2", "Before the Storm", 5, 2, 1, "sanctum"],
    ["t3", "Throne of the Sea", 5, 3, 1, "throne"],
  ];
  definitions.forEach((d, i) => room(...d, i % 7));
  function connect(a, d, b, requires = null) {
    const opposite = { E: "W", W: "E", N: "S", S: "N" };
    rooms[a].doors.push({ direction: d, to: b, requires });
    rooms[b].doors.push({ direction: opposite[d], to: a });
  }
  const links = [
    ["h0", "E", "h1"],
    ["h1", "E", "h2"],
    ["h1", "N", "h3"],
    ["h1", "S", "h4"],
    ["h2", "E", "h5"],
    ["h2", "N", "h6"],
    ["h5", "E", "h7"],
    ["h5", "S", "h8"],
    ["h7", "E", "h9"],
    ["b0", "E", "b1"],
    ["b1", "N", "b2"],
    ["b2", "E", "b3"],
    ["b1", "E", "b4"],
    ["b3", "S", "b4"],
    ["b3", "E", "b6"],
    ["b4", "S", "b5"],
    ["b4", "E", "b7"],
    ["b6", "S", "b7"],
    ["b5", "E", "b8"],
    ["b8", "N", "b7"],
    ["b7", "E", "b9"],
    ["c0", "E", "c1"],
    ["c1", "N", "c2"],
    ["c1", "E", "c3"],
    ["c3", "S", "c4"],
    ["c3", "E", "c5"],
    ["g0", "E", "g1"],
    ["g1", "N", "g2"],
    ["g1", "E", "g3"],
    ["g3", "S", "g4"],
    ["g3", "E", "g5"],
    ["k0", "E", "k1"],
    ["k1", "N", "k2"],
    ["k2", "E", "k3"],
    ["k1", "E", "k5"],
    ["k5", "S", "k6"],
    ["k7", "E", "k8"],
    ["k5", "E", "k9"],
    ["k9", "E", "k10"],
    ["k10", "S", "k8"],
    ["k10", "E", "k11"],
    ["t0", "E", "t1"],
    ["t1", "E", "t2"],
    ["t2", "E", "t3"],
  ];
  links.forEach((l) => connect(...l));
  connect("k3", "E", "k4", "archive-lamp");
  connect("k6", "E", "k7", "sluice-wheel");
  for (const id of ["h9", "b9", "c5", "g5", "k11"])
    rooms[id].doors.push({ direction: "E", to: "region" });
  // Layout shapes leave all four door approaches open and vary the terrain between rooms.
  const placements = [
    [
      [195, 185],
      [740, 395],
      [725, 165],
      [245, 425],
    ],
    [
      [230, 190],
      [670, 420],
      [740, 180],
    ],
    [
      [180, 395],
      [710, 185],
      [655, 430],
    ],
    [
      [265, 170],
      [735, 400],
      [190, 425],
    ],
    [
      [190, 180],
      [700, 430],
      [760, 185],
    ],
    [
      [265, 430],
      [745, 165],
      [200, 180],
    ],
    [
      [175, 420],
      [675, 180],
      [750, 410],
    ],
  ];
  for (const [i, r] of Object.values(rooms).entries()) {
    const natural = [
        "forest",
        "snowhome",
        "jungle",
        "camp",
        "garden",
        "village",
      ].includes(r.theme),
      cave = ["cave", "icecave"].includes(r.theme),
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
      ].includes(r.theme);
    placements[r.layout].forEach(([x, y], j) =>
      r.props.push([
        cave
          ? "crystal"
          : natural
            ? r.region === 0
              ? "pine"
              : r.region < 3
                ? "palm"
                : "coral"
            : indoor
              ? r.theme === "library" || r.theme === "cabin"
                ? "bookshelf"
                : r.theme === "gallery"
                  ? "portrait"
                  : "pillar"
              : "rock",
        x,
        y,
      ]),
    );
    r.objects.push([
      "journal",
      360 + (i % 3) * 110,
      405 + (i % 2) * 35,
      "note-" + r.id,
    ]);
    if (
      ![
        "h0",
        "h1",
        "b1",
        "c5",
        "g5",
        "k1",
        "k4",
        "k8",
        "t0",
        "t1",
        "t2",
        "t3",
      ].includes(r.id) &&
      i % 2 === 0
    ) {
      const enemy =
        r.region === 0
          ? "snowcrab"
          : r.region === 1
            ? i % 4
              ? "coconut"
              : "reef"
            : r.region === 2
              ? "gull"
              : i % 3
                ? "guard"
                : "reef";
      r.enemies.push([enemy, "room-enemy-" + r.id, 600, 315]);
    }
    if (i % 5 === 0) r.objects.push(["chest", 260, 375, "room-chest-" + r.id]);
  }
  function npc(id, ...n) {
    rooms[id].npcs.push(n);
  }
  function obj(id, ...o) {
    rooms[id].objects.push(o);
  }
  npc("h0", "Mama", 350, 230, "mama");
  npc("h0", "Papa", 610, 230, "parents");
  npc("h1", "Slippy", 580, 345, "slippy");
  npc("h3", "Moss", 550, 240, "moss");
  npc("b1", "Slippy", 580, 345, "slippy");
  npc("b3", "Tula", 560, 265, "tula");
  npc("c4", "Drift", 530, 245, "drift");
  npc("c5", "Pippy", 650, 250, "pippy");
  npc("k1", "Pebble", 570, 260, "pebble");
  npc("k9", "Nim", 565, 235, "nim");
  const rests = [
    "h0",
    "h3",
    "h8",
    "h9",
    "b0",
    "b1",
    "b8",
    "c0",
    "c4",
    "c5",
    "g0",
    "g4",
    "g5",
    "k0",
    "k1",
    "k3",
    "k7",
    "k11",
    "t0",
    "t2",
  ];
  rests.forEach((id) => obj(id, "shrine", 245, 350, "rest-" + id));
  obj("h6", "switch", 480, 220, "winter-bell");
  obj("g2", "switch", 490, 230, "sea-beacon");
  obj("k3", "switch", 650, 240, "archive-lamp");
  obj("k6", "switch", 480, 235, "sluice-wheel");
  obj("b2", "fruit", 540, 245, "fruit1");
  obj("b5", "fruit", 540, 245, "fruit2");
  obj("b7", "fruit", 540, 245, "fruit3");
  obj("b9", "boss", 665, 285, "baby");
  obj("g5", "boss", 650, 285, "gate");
  obj("k4", "boss", 640, 280, "key1");
  obj("k8", "boss", 640, 280, "key2");
  obj("t3", "boss", 610, 280, "king");
  obj("t3", "cage", 805, 320, "slippy-cage");
  rooms.h0.props.push(["igloo", 480, 170]);
  rooms.b1.props.push(["hut", 350, 185], ["hut", 680, 170]);
  rooms.c4.props.push(["hut", 380, 175]);
  rooms.h8.props.push(["fire", 480, 220]);
  rooms.b8.props.push(["fire", 480, 220]);
  rooms.h4.props.push(["pool", 480, 220]);
  rooms.b5.props.push(["pool", 400, 200]);
  rooms.c1.props.push(["wreck", 480, 220]);
  rooms.c5.props.push(["boat", 780, 425]);
  rooms.g5.props.push(["tower", 730, 160]);
  rooms.t3.props.push(["throne", 700, 235]);
  const conversations = {
    moss: [
      "You’re heading out? Brave little flippers. Have a fish on the house.",
      "The world is bigger than this village. Remember the people who make it feel like home.",
    ],
    tula: [
      "I used to think a forest was just a lot of trees. Then I learned everyone in it had a story.",
      "The waterfall grove is south of Riverwalk. Golden Orchard is east.",
    ],
    drift: [
      "The King took a little penguin through here. He kept saying his friend would come.",
      "Take this soup. You look like someone who has a promise to keep.",
    ],
    nim: [
      "I heard Slippy through the wall. They moved him toward the throne room.",
      "I’m not a fighter. But I can tell you this: the King grows reckless when his crown starts to crack.",
    ],
  };
  // Keep tall scenery from hiding characters, doorways, or collectible objects.
  for (const r of Object.values(rooms)) {
    const occupants = [
      ...r.npcs.map((n) => [n[1], n[2]]),
      ...r.objects.map((o) => [o[1], o[2]]),
    ];
    r.props = r.props.filter(([type, x, y]) => {
      const height = {
        pine: 108,
        palm: 100,
        pillar: 83,
        tower: 83,
        bookshelf: 68,
        portrait: 74,
        coral: 50,
      }[type];
      return (
        !height ||
        !occupants.some(
          ([ox, oy]) =>
            Math.abs(ox - x) < 52 && oy > y - height - 20 && oy < y + 16,
        )
      );
    });
  }
  // Enlarge geometry, not sprites: each room is a genuinely larger walking space.
  for (const [index, r] of Object.values(rooms).entries()) {
    r.width = 1536 + (index % 3) * 192;
    r.height = 960 + (index % 4) * 96;
    r.scaleX = (r.width - 128) / 832;
    r.scaleY = (r.height - 144) / 432;
    r.safe =
      ["snowhome", "village", "cabin", "camp"].includes(r.theme) ||
      r.id === "h8" ||
      r.id === "t0" ||
      r.id === "t2";
    for (const collection of [r.props, r.objects, r.npcs, r.enemies]) {
      for (const item of collection) {
        const at = collection === r.enemies ? 2 : 1;
        item[at] = Math.round(64 + (item[at] - 64) * r.scaleX);
        item[at + 1] = Math.round(82 + (item[at + 1] - 82) * r.scaleY);
      }
    }
    r.encounters =
      r.region === 0
        ? ["snowcrab"]
        : r.region === 1
          ? ["coconut", "reef"]
          : r.region === 2
            ? ["gull", "reef"]
            : r.region === 3
              ? ["guard", "gull"]
              : ["guard", "reef", "gull"];
    if (r.objects.some((o) => o[0] === "boss")) r.encounters = [];
    r.enemies = []; // Regular encounters are now triggered by distance walked.
  }

  // Add landmarks throughout the enlarged walking areas, keeping central routes clear.
  for (const r of Object.values(rooms)) {
    for (let i = 0; i < 15; i++) {
      const x = 150 + ((i * 317 + r.layout * 73) % (r.width - 300)),
        y = 160 + ((i * 211 + r.layout * 37) % (r.height - 290));
      if (Math.abs(x - r.width / 2) < 100 || Math.abs(y - r.height / 2) < 85)
        continue;
      if (
        [...r.objects, ...r.npcs].some(
          (a) => Math.hypot(a[1] - x, a[2] - y) < 115,
        ) ||
        r.props.some((a) => Math.hypot(a[1] - x, a[2] - y) < 105)
      )
        continue;
      const type = ["forest", "snowhome"].includes(r.theme)
        ? "pine"
        : ["jungle", "shore", "camp"].includes(r.theme) && r.region < 3
          ? "palm"
          : r.theme === "library"
            ? "bookshelf"
            : r.theme === "garden"
              ? "coral"
              : ["cave", "icecave"].includes(r.theme)
                ? "crystal"
                : ["hall", "gallery", "gate", "throne", "sanctum"].includes(
                      r.theme,
                    )
                  ? "pillar"
                  : "rock";
      r.props.push([type, x, y]);
    }
  }
  const puzzleDefs = [
    [
      "h4",
      "lake-cache",
      "push",
      "Lakekeeper’s Gift",
      "Push the ice block two spaces right onto the golden plate. Stand to its left and walk into it.",
      [2, 2],
      [4, 2],
    ],
    [
      "h6",
      "winter-bell",
      "sequence",
      "The Winter Chimes",
      "Ring the chimes from the quiet sky to the bright sky: Moon, Snow, Sun.",
      null,
      null,
      ["Sun", "Moon", "Snow"],
      [1, 2, 0],
    ],
    [
      "b4",
      "river-stones",
      "path",
      "Riverstone Crossing",
      "Start at the western arrow. Follow: right, up, right, right, down, right, down, right, up, right.",
    ],
    [
      "b6",
      "sun-mosaic",
      "sequence",
      "The Sunken Mosaic",
      "Life begins with water, then a leaf, then sunlight. Activate Wave, Leaf, Sun.",
      null,
      null,
      ["Leaf", "Sun", "Wave"],
      [2, 0, 1],
    ],
    [
      "g4",
      "drain-lift",
      "push",
      "The Drain Lift",
      "Push the crate up twice, then right twice onto the plate. You can walk around it. Reset it if it gets stuck.",
      [2, 3],
      [4, 1],
    ],
    [
      "k3",
      "archive-lamp",
      "push",
      "The Archive Mechanism",
      "The book cart powers the archive lantern. Push it two spaces right onto the golden plate.",
      [2, 2],
      [4, 2],
    ],
    [
      "k6",
      "sluice-wheel",
      "sequence",
      "The Three Tides",
      "The tide rises in order: Shallow, Middle, Deep. Open the three sluices in that order.",
      null,
      null,
      ["Deep", "Shallow", "Middle"],
      [1, 2, 0],
    ],
    [
      "t1",
      "memory-path",
      "path",
      "A Small Memory",
      "Remember the winding path: right, up, right, right, down, right, down, right, up, right.",
    ],
  ];
  for (const [
    room,
    id,
    type,
    name,
    hint,
    start,
    goal,
    labels,
    order,
  ] of puzzleDefs) {
    const r = rooms[room];
    r.safe = true;
    r.puzzle = {
      id,
      type,
      name,
      hint,
      start,
      goal,
      labels,
      order,
      symbols: ["◈", "○", "✧"],
      walls:
        type === "push"
          ? room === "g4"
            ? [
                [3, 3],
                [3, 2],
              ]
            : [
                [3, 1],
                [3, 3],
              ]
          : [],
      path: [
        [0, 2],
        [1, 2],
        [1, 1],
        [2, 1],
        [3, 1],
        [3, 2],
        [4, 2],
        [4, 3],
        [5, 3],
        [5, 2],
        [6, 2],
      ],
    };
    const bx = r.width / 2 - 224,
      by = r.height / 2 - 160;
    r.props = r.props.filter(
      (p) =>
        Math.abs(p[1] - r.width / 2) > 310 ||
        Math.abs(p[2] - r.height / 2) > 230,
    );
    r.objects = r.objects.filter((o) => !(o[0] === "switch" && o[3] === id));
    for (const o of r.objects)
      if (
        o[1] > bx - 50 &&
        o[1] < bx + 498 &&
        o[2] > by - 80 &&
        o[2] < by + 380
      ) {
        o[1] = bx - 110;
        o[2] = by + 55;
      }
  }
  rooms.b4.doors.find((d) => d.direction === "E").requires = "river-stones";
  rooms.k3.note =
    "Push the archive book cart onto the golden plate to light the lantern and unlock the pearl chamber.";
  rooms.k6.note =
    "The three sluices rise from shallow to deep. The western hint pedestal explains the order.";
  // Re-stage the opening around the authors' books; the kingdom ending remains.
  function storyPoint(room, id, name, x, y) {
    const r = rooms[room];
    r.objects.push([
      "story",
      Math.round(64 + (x - 64) * r.scaleX),
      Math.round(82 + (y - 82) * r.scaleY),
      id,
      name,
    ]);
  }
  rooms.h9.name = "Fishing Bay";
  rooms.h9.note =
    "Flippy and Slippy cannot swim yet. Stay near the iceberg and call your parents if you need help.";
  rooms.h1.note =
    "Slippy is one month old, just like Flippy. He was born on February 16. He likes fish.";
  rooms.h4.note =
    "Belly skating is fun with a friend. Get home before your parents return!";
  rooms.b1.name = "Green Ground";
  rooms.b1.theme = "jungle";
  rooms.b1.props = rooms.b1.props.filter((p) => p[0] !== "hut");
  rooms.b3.npcs = [];
  rooms.b3.note = "A tall green plant grows here. Slippy is curious about it.";
  rooms.b0.note =
    "The tan ground feels soft, like snow. But it is HOT! The green ground east of here looks cooler.";
  rooms.b9.name = "Shallow-water Beach";
  rooms.b9.note =
    "A baby orca lurks in the shallow water. These baby penguins cannot fish or swim yet.";
  for (const id of ["b2", "b5", "b7"])
    rooms[id].note =
      "Bent yellow things grow here. The friends will need food after their fish feast.";
  rooms.b8.note =
    "The island is quiet. Flippy and Slippy have not met any other penguins here.";
  const coastNames = {
    c0: "The Western Shore",
    c1: "Warm Sand",
    c2: "Echo Cave",
    c3: "The Boonona Pile",
    c4: "Palm-tree Shade",
    c5: "Pippy’s Iceberg",
  };
  for (const [id, name] of Object.entries(coastNames)) {
    rooms[id].name = name;
    rooms[id].safe = true;
    rooms[id].note =
      "Explore the island with Flippy, Slippy, and their new friend Pippy.";
  }
  rooms.c1.props = rooms.c1.props.filter((p) => p[0] !== "wreck");
  rooms.c4.npcs = [];
  rooms.c4.theme = "jungle";
  rooms.c4.props = rooms.c4.props.filter((p) => p[0] !== "hut");
  const mountainNames = {
    g0: "Mountain Foot",
    g1: "The Snowy Trail",
    g2: "Frost Lookout",
    g3: "Belly-slide Ridge",
    g4: "Cold Cavern",
    g5: "The Highest Peak",
  };
  for (const [id, name] of Object.entries(mountainNames)) {
    const r = rooms[id];
    r.name = name;
    r.theme = id === "g4" ? "icecave" : "ridge";
    r.note =
      "Pippy is fishing below. Flippy and Slippy climb with plenty of boononas. The highest peak lies east.";
    r.encounters = ["snowcrab", "gull"];
    r.props = r.props.map((p) => [
      ["pillar", "tower"].includes(p[0]) ? "crystal" : p[0],
      ...p.slice(1),
    ]);
    r.objects = r.objects.filter((o) => o[0] !== "boss");
  }
  rooms.g4.puzzle.name = "The Snowdrift Lift";
  rooms.g4.puzzle.hint =
    "Push the ice crate up twice, then right twice onto the plate. Reset it if it gets stuck.";
  rooms.g5.safe = true;
  rooms.g5.encounters = [];
  storyPoint("h9", "fishing-bay", "The little iceberg", 500, 340);
  storyPoint("h4", "lake-play", "Belly-skating lake", 700, 250);
  storyPoint("b1", "cool-ground", "Cool green ground", 400, 340);
  storyPoint("b3", "itchy-plant", "The tall green plant", 400, 340);
  storyPoint("b9", "fish-feast", "The fish feast", 420, 350);
  storyPoint("c3", "show-fruit", "Show Pippy the boononas", 400, 240);
  storyPoint("c4", "pippy-shade", "Rest in the palm shade", 650, 280);
  storyPoint("g5", "summit-trick", "The highest sliding peak", 640, 280);
  storyPoint("c5", "flippy-version", "Tell Flippy’s version", 480, 380);
  storyPoint("c0", "fish-ambush", "Splashing shallow water", 550, 300);
  const slippyRoom = rooms.c5;
  slippyRoom.npcs.push([
    "Slippy",
    Math.round(64 + (440 - 64) * slippyRoom.scaleX),
    Math.round(82 + (300 - 82) * slippyRoom.scaleY),
    "slippy",
  ]);
  for (const r of Object.values(rooms)) {
    const points = r.objects.filter((o) => o[0] === "story");
    r.props = r.props.filter(
      (p) => !points.some((o) => Math.hypot(p[1] - o[1], p[2] - o[2]) < 130),
    );
  }
  rooms.c5.props = rooms.c5.props.map((p) =>
    p[0] === "boat" ? ["iceberg", ...p.slice(1)] : p,
  );
  delete conversations.tula;
  delete conversations.drift;
  return { rooms, starts, conversations };
})();
