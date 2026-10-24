const { test, expect } = require("@playwright/test");
async function flush(page) {
  await page.evaluate(() => {
    for (let i = 0; dialogue && i < 40; i++) advance();
  });
}
async function begin(page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "New adventure", exact: true })
    .click();
  await flush(page);
}
async function interactWith(page, id) {
  await page.evaluate((id) => {
    nearby = targets().find((n) => n.id === id || n.to === id);
    if (!nearby) throw Error("Missing target " + id + " in " + state.room);
    interact();
  }, id);
  await flush(page);
}
async function solveRoomPuzzle(page) {
  await page.evaluate(() => {
    const r = currentRoom(),
      p = r.puzzle,
      ps = puzzleState(r),
      b = puzzleBoard(r);
    if (!p) throw Error("No puzzle in " + r.id);
    if (p.type === "sequence")
      for (const rune of p.order) interactPuzzle({ action: "rune", rune });
    if (p.type === "path")
      for (const [x, y] of p.path) {
        state.x = b.x + (x + 0.5) * 64;
        state.y = b.y + (y + 0.5) * 64;
        updatePuzzle(0.01, 0, 0);
      }
    if (p.type === "push") {
      const moves =
        r.id === "g4"
          ? [
              [0, -1],
              [0, -1],
              [1, 0],
              [1, 0],
            ]
          : [
              [1, 0],
              [1, 0],
            ];
      for (const [dx, dy] of moves) {
        state.x = b.x + (ps.block[0] + 0.5) * 64 - dx * 40;
        state.y = b.y + (ps.block[1] + 0.5) * 64 - dy * 40;
        updatePuzzle(0.3, dx, dy);
      }
    }
    if (!state.flags[p.id]) throw Error("Puzzle did not solve: " + r.id);
  });
  await flush(page);
}
async function go(page, id) {
  const route = await page.evaluate((id) => {
    const q = [[state.room]],
      seen = new Set();
    while (q.length) {
      const p = q.shift(),
        at = p.at(-1);
      if (at === id) return p.slice(1);
      if (seen.has(at)) continue;
      seen.add(at);
      for (const d of WORLD.rooms[at].doors)
        if (d.to !== "region" && (!d.requires || state.flags[d.requires]))
          q.push([...p, d.to]);
    }
    throw Error("No open route to " + id);
  }, id);
  for (const next of route) await interactWith(page, next);
}
async function endTurn(page) {
  await page.evaluate(() => {
    battle.phaseTime = battle.duration;
    updateBattle(0.01);
  });
}
async function win(page, type, id = type) {
  await page.evaluate(({ type, id }) => startBattle(type, id), { type, id });
  let turns = 0;
  while (await page.evaluate(() => battle.phase !== "result")) {
    if (turns++ > 35) throw Error("No victory");
    await page.getByRole("button", { name: "FIGHT", exact: true }).click();
    await page.evaluate(() => (battle.marker = 0.5));
    await page.keyboard.press("e");
    if (await page.evaluate(() => battle.phase === "dodge"))
      await endTurn(page);
  }
  await page.keyboard.press("e");
  await flush(page);
}

test("48 connected rooms, safe door arrivals, reachable interactions, and working locks", async ({
  page,
}) => {
  await begin(page);
  const result = await page.evaluate(() => {
    const failures = [],
      all = Object.values(WORLD.rooms);
    if (all.length !== 48) failures.push("room count");
    for (const r of all) {
      state.map = r.region;
      state.room = r.id;
      state.flags = {};
      placePlayer(480, 350);
      const start = [Math.round(state.x), Math.round(state.y)],
        q = [start],
        seen = new Set(),
        points = [];
      for (let i = 0; i < q.length; i++) {
        const [x, y] = q[i],
          key = x + "," + y;
        if (seen.has(key)) continue;
        seen.add(key);
        points.push([x, y]);
        for (const [dx, dy] of [
          [12, 0],
          [-12, 0],
          [0, 12],
          [0, -12],
        ]) {
          const xx = x + dx,
            yy = y + dy;
          if (walkable(xx, yy) && !seen.has(xx + "," + yy)) q.push([xx, yy]);
        }
      }
      for (const n of targets())
        if (!points.some(([x, y]) => Math.hypot(x - n.x, y - n.y) < 59))
          failures.push(r.id + ": unreachable " + (n.id || n.to));
      for (const d of r.doors) {
        if (d.to === "region") continue;
        state.map = r.region;
        state.room = r.id;
        enterRoom(d.to, d.direction);
        if (!walkable(state.x, state.y))
          failures.push(r.id + ": unsafe " + d.to);
        if (!WORLD.rooms[d.to].doors.some((back) => back.to === r.id))
          failures.push(r.id + ": unpaired " + d.to);
      }
    }
    for (let region = 0; region < 6; region++) {
      const pending = [WORLD.starts[region]],
        seen = new Set();
      while (pending.length) {
        const id = pending.pop();
        if (seen.has(id)) continue;
        seen.add(id);
        for (const d of WORLD.rooms[id].doors)
          if (d.to !== "region") pending.push(d.to);
      }
      if (seen.size !== all.filter((r) => r.region === region).length)
        failures.push("disconnected region " + region);
    }
    return failures;
  });
  expect(result).toEqual([]);
  await page.evaluate(() => {
    state = fresh();
    state.map = 4;
    state.room = "k3";
    mode = "world";
  });
  await interactWith(page, "k4");
  expect(await page.evaluate(() => state.room)).toBe("k3");
  await solveRoomPuzzle(page);
  await interactWith(page, "k4");
  expect(await page.evaluate(() => state.room)).toBe("k4");
  await page.evaluate(() => {
    state.room = "k6";
  });
  await interactWith(page, "k7");
  expect(await page.evaluate(() => state.room)).toBe("k6");
  await solveRoomPuzzle(page);
  await interactWith(page, "k7");
  expect(await page.evaluate(() => state.room)).toBe("k7");
});

test("complete four-chapter route, parent ACT, fruit gates, wardens, King, and ending", async ({
  page,
}) => {
  await begin(page);
  await go(page, "h1");
  await interactWith(page, "slippy");
  await go(page, "h0");
  await interactWith(page, "parents");
  expect(await page.evaluate(() => fleeUnlocked())).toBe(false);
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "ACT", exact: true }).click();
    await endTurn(page);
  }
  await page.getByRole("button", { name: "FLEE", exact: true }).click();
  await page.keyboard.press("e");
  await flush(page);
  await go(page, "h9");
  await interactWith(page, "region");
  expect(await page.evaluate(() => state.map)).toBe(1);
  await go(page, "b9");
  await interactWith(page, "baby");
  expect(await page.evaluate(() => mode)).toBe("world");
  for (const [room, id] of [
    ["b2", "fruit1"],
    ["b5", "fruit2"],
    ["b7", "fruit3"],
  ]) {
    await go(page, room);
    await interactWith(page, id);
  }
  await go(page, "b9");
  await win(page, "baby");
  await interactWith(page, "region");
  expect(await page.evaluate(() => state.flags.captured)).toBe(true);
  await go(page, "c5");
  await interactWith(page, "region");
  expect(await page.evaluate(() => state.map)).toBe(2);
  await interactWith(page, "pippy");
  await interactWith(page, "region");
  await go(page, "g5");
  await win(page, "gate");
  await interactWith(page, "region");
  await go(page, "k3");
  await solveRoomPuzzle(page);
  await go(page, "k4");
  await win(page, "key1");
  await go(page, "k6");
  await solveRoomPuzzle(page);
  await go(page, "k8");
  await win(page, "key2");
  await go(page, "k11");
  await interactWith(page, "region");
  await go(page, "t3");
  await win(page, "king");
  await interactWith(page, "slippy-cage");
  await expect(
    page.getByRole("heading", {
      name: "Some things are bigger than the ocean.",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => Object.keys(state.visited).length),
  ).toBeGreaterThan(29);
});

test("enemies vary attacks, bosses escalate, warnings are safe before firing, and damage is real", async ({
  page,
}) => {
  await begin(page);
  const result = await page.evaluate(() => {
    const failures = [];
    for (const type of Object.keys(enemies)) {
      mode = "world";
      state.hp = 120;
      startBattle(type, "test-" + type);
      if (movePools[type].some((id) => !id.startsWith(type + ".")))
        failures.push(type + " borrows another monster’s move");
      const played = [];
      for (let turn = 0; turn < 8; turn++) {
        battle.hp = battle.maxHp * (turn < 3 ? 0.95 : turn < 6 ? 0.5 : 0.2);
        beginDodge();
        played.push(battle.attack);
        if (turn && played[turn] === played[turn - 1])
          failures.push(type + " repeats");
        battle.invulnerable = 999;
        for (let i = 0; i < Math.ceil(battle.duration / 0.04) + 1; i++)
          updateBattle(0.04);
        if (battle.phase !== "choice")
          failures.push(type + " turn did not end");
      }
      if (new Set(played).size < 3) failures.push(type + " too few patterns");
      if (
        enemies[type].boss &&
        !enemies[type].parents &&
        battle.phaseLevel !== 3
      )
        failures.push(type + " missing final phase");
      battle = null;
    }
    for (const attack of Object.keys(ATTACKS)) {
      mode = "world";
      state.hp = 120;
      startBattle("king", "pattern-" + attack);
      beginDodge();
      battle.phaseLevel = 1;
      battle.attack = attack;
      battle.invulnerable = 999;
      let produced = false;
      for (let step = 0; step < 130; step++) {
        updateBattle(0.04);
        produced ||= battle.bullets.length > 0 || battle.hazards.length > 0;
      }
      if (!produced)
        failures.push(attack + " produced no projectiles or hazards");
      if (
        battle.bullets.some(
          (p) => ![p.x, p.y, p.vx, p.vy].every(Number.isFinite),
        )
      )
        failures.push(attack + " invalid projectile");
    }
    mode = "world";
    state.hp = 120;
    startBattle("king", "test-king");
    beginDodge();
    battle.invulnerable = 0;
    battle.spawnTime = -999;
    battle.hazards = [];
    const hp = state.hp;
    hazard("beam", battle.heart.x, arena.y, 22, arena.h, 1, 0.4);
    updateBattle(0.2);
    if (state.hp !== hp) failures.push("warning damaged heart");
    updateBattle(0.81);
    if (state.hp >= hp) failures.push("beam did no damage");
    return failures;
  });
  expect(result).toEqual([]);
});

test("keyboard and touch movement, map, old save migration, current saves, healing and defeat recovery", async ({
  page,
}) => {
  await begin(page);
  await page.locator("#game").focus();
  const x = await page.evaluate(() => state.x);
  await page.keyboard.down("d");
  await page.waitForTimeout(200);
  await page.keyboard.up("d");
  expect(await page.evaluate(() => state.x)).toBeGreaterThan(x);
  await page.keyboard.press("m");
  await expect(page.locator(".room-map")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    state.hp = 60;
  });
  await page.keyboard.press("i");
  await page.getByRole("button", { name: "Heal 35", exact: true }).click();
  expect(await page.evaluate(() => state.hp)).toBe(95);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await go(page, "h1");
  await page.reload();
  await page
    .getByRole("button", { name: "Continue adventure", exact: true })
    .click();
  expect(await page.evaluate(() => state.room)).toBe("h1");
  await page.evaluate(() => {
    save();
    startBattle("snowcrab", "recovery");
    state.inventory.fish = 0;
    state.hp = 0;
    finishBattle("lose");
    battle.done();
  });
  expect(await page.evaluate(() => state.hp)).toBe(120);
  expect(
    await page.evaluate(() => state.inventory.fish),
  ).toBeGreaterThanOrEqual(2);
  await page.evaluate(() => {
    const old = fresh();
    delete old.room;
    delete old.visited;
    old.version = 1;
    old.map = 4;
    old.flags = { key1: true };
    mode = "title";
    localStorage.setItem(SAVE_KEY, JSON.stringify(old));
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Continue adventure", exact: true })
    .click();
  expect(await page.evaluate(() => state.room)).toBe("k0");
  expect(await page.evaluate(() => state.flags.key1)).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  const oldX = await page.evaluate(() => state.x);
  const right = page.getByRole("button", { name: "Right", exact: true });
  await right.dispatchEvent("pointerdown", {
    pointerId: 1,
    pointerType: "touch",
  });
  await page.waitForTimeout(200);
  await right.dispatchEvent("pointerup", { pointerId: 1 });
  expect(await page.evaluate(() => state.x)).toBeGreaterThan(oldX);
});

test("game assets load and repository files stay private", async ({
  page,
  request,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await begin(page);
  for (const id of ["h6", "b3", "b5", "c1", "g5", "k3", "k9", "t3"]) {
    await page.evaluate((id) => {
      state.room = id;
      state.map = WORLD.rooms[id].region;
      updateHud();
    }, id);
    await page.waitForTimeout(35);
  }
  expect(errors).toEqual([]);
  for (const asset of ["/game.js", "/world.js", "/style.css", "/health"])
    expect((await request.get(asset)).status()).toBe(200);
  for (const file of ["/server.js", "/package.json", "/.git/config"])
    expect((await request.get(file)).status()).toBe(404);
});

test("Flippy turns in all four directions and camera follows on both axes without zooming sprites", async ({
  page,
}) => {
  await begin(page);
  await page.locator("#game").focus();
  for (const [key, facing] of [
    ["d", "right"],
    ["w", "up"],
    ["a", "left"],
    ["s", "down"],
  ]) {
    await page.keyboard.down(key);
    await page.waitForTimeout(90);
    await page.keyboard.up(key);
    expect(await page.evaluate(() => state.facing)).toBe(facing);
  }
  const before = await page.evaluate(() => ({ ...camera }));
  await page.keyboard.down("d");
  await page.keyboard.down("s");
  await page.waitForTimeout(400);
  await page.keyboard.up("d");
  await page.keyboard.up("s");
  const after = await page.evaluate(() => ({ ...camera }));
  expect(after.x).toBeGreaterThan(before.x);
  expect(after.y).toBeGreaterThan(before.y);
  const result = await page.evaluate(() => {
    const r = currentRoom();
    const sizes = Object.values(WORLD.rooms).every(
      (room) => room.width > W && room.height > H,
    );
    placePlayer(r.width - 170, r.height - 170);
    updateCamera(1, true);
    return {
      sizes,
      x: camera.x,
      y: camera.y,
      width: canvas.width,
      height: canvas.height,
      maxX: r.width - W,
      maxY: r.height - H,
    };
  });
  expect(result.sizes).toBe(true);
  expect(result.x).toBeGreaterThan(0);
  expect(result.y).toBeGreaterThan(0);
  expect(result.x).toBeLessThanOrEqual(result.maxX);
  expect(result.y).toBeLessThanOrEqual(result.maxY);
  expect([result.width, result.height]).toEqual([960, 576]);
});

test("walking triggers random fights with no E, villages and idle time stay safe, and recovery has a cooldown", async ({
  page,
}) => {
  await begin(page);
  await page.evaluate(() => {
    state.room = "h2";
    state.map = 0;
    const r = currentRoom();
    placePlayer(r.width / 2, r.height / 2);
    state.encounterDistance = 5;
    state.encounterGrace = 0;
    updateCamera(1, true);
  });
  await page.locator("#game").focus();
  await page.keyboard.down("d");
  await page.waitForTimeout(130);
  await page.keyboard.up("d");
  expect(await page.evaluate(() => mode)).toBe("battle");
  expect(await page.evaluate(() => battle.type)).toBe("snowcrab");
  await page.evaluate(() => {
    battle.damageDealt = battle.maxHp * 0.4;
    finishBattle("flee");
    battle.done();
  });
  expect(await page.evaluate(() => state.encounterGrace)).toBeGreaterThan(10);
  await page.keyboard.down("d");
  await page.waitForTimeout(130);
  await page.keyboard.up("d");
  expect(await page.evaluate(() => mode)).toBe("world");
  await page.evaluate(() => {
    state.room = "h1";
    state.map = 0;
    const r = currentRoom();
    placePlayer(r.width / 2, r.height / 2);
    state.encounterDistance = 0;
    state.encounterGrace = 0;
  });
  await page.keyboard.down("d");
  await page.waitForTimeout(150);
  await page.keyboard.up("d");
  expect(await page.evaluate(() => mode)).toBe("world");
  await page.evaluate(() => {
    state.room = "h2";
    state.encounterGrace = 0;
    state.encounterDistance = 5;
  });
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => mode)).toBe("world");
  expect(await page.evaluate(() => state.encounterDistance)).toBe(5);
  await page.evaluate(() => {
    state.room = "b9";
    state.map = 1;
    Object.assign(state.flags, { fruit1: true, fruit2: true, fruit3: true });
    const boss = targets().find((n) => n.kind === "boss");
    state.x = boss.x - 65;
    state.y = boss.y;
    state.bossGrace = 0;
  });
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => mode)).toBe("battle");
  expect(await page.evaluate(() => battle.type)).toBe("baby");
});

test("all eight puzzles solve through their mechanics, reset safely, and reject wrong path and rune choices", async ({
  page,
}) => {
  await begin(page);
  const puzzleRooms = await page.evaluate(() =>
    Object.values(WORLD.rooms)
      .filter((r) => r.puzzle)
      .map((r) => r.id),
  );
  expect(puzzleRooms).toHaveLength(8);
  for (const id of puzzleRooms) {
    await page.evaluate((id) => {
      state.room = id;
      state.map = WORLD.rooms[id].region;
      const p = currentRoom().puzzle;
      delete state.flags[p.id];
      delete state.puzzles[p.id];
      mode = "world";
    }, id);
    await solveRoomPuzzle(page);
  }
  await page.evaluate(() => {
    state.room = "h6";
    state.map = 0;
    delete state.flags["winter-bell"];
    delete state.puzzles["winter-bell"];
    interactPuzzle({ action: "rune", rune: 0 });
  });
  await flush(page);
  expect(await page.evaluate(() => puzzleState().progress)).toBe(0);
  await page.evaluate(() => {
    state.room = "b4";
    state.map = 1;
    delete state.flags["river-stones"];
    delete state.puzzles["river-stones"];
    const b = puzzleBoard();
    state.x = b.x + 32;
    state.y = b.y + 32;
    updatePuzzle(0.01, 0, 0);
  });
  expect(await page.evaluate(() => puzzleState().progress)).toBe(0);
  expect(await page.evaluate(() => state.hp)).toBe(120);
  await page.evaluate(() => {
    state.room = "g4";
    state.map = 3;
    delete state.flags["drain-lift"];
    delete state.puzzles["drain-lift"];
    const ps = puzzleState();
    ps.block = [0, 0];
    interactPuzzle({ action: "reset" });
  });
  await flush(page);
  expect(await page.evaluate(() => puzzleState().block)).toEqual([2, 3]);
});

test("the King’s movement rule uses actual motion and push blocks work with held movement keys", async ({
  page,
}) => {
  await begin(page);
  const rule = await page.evaluate(() => {
    startBattle("king", "rule-check");
    beginDodge();
    battle.attack = "king.decree";
    battle.secondary = "king.decree";
    battle.spawnTime = -999;
    battle.invulnerable = 0;
    state.hp = 120;
    keys.add("d");
    bullet(battle.heart.x, battle.heart.y, 0, 0, 8, "seal", { rule: "still" });
    updateBattle(0.04);
    const moving = state.hp;
    battle.bullets = [];
    battle.heart.x = arena.x + arena.w - 8;
    battle.invulnerable = 0;
    bullet(battle.heart.x, battle.heart.y, 0, 0, 8, "seal", { rule: "still" });
    updateBattle(0.04);
    const againstWall = state.hp;
    keys.clear();
    battle = null;
    mode = "world";
    $("battleControls").hidden = true;
    return { moving, againstWall };
  });
  expect(rule.moving).toBe(120);
  expect(rule.againstWall).toBeLessThan(120);
  await page.evaluate(() => {
    state.room = "k3";
    state.map = 4;
    delete state.flags["archive-lamp"];
    delete state.puzzles["archive-lamp"];
    const b = puzzleBoard(),
      ps = puzzleState();
    placePlayer(
      b.x + (ps.block[0] + 0.5) * 64 - 44,
      b.y + (ps.block[1] + 0.5) * 64,
    );
    updateCamera(1, true);
  });
  await page.locator("#game").focus();
  await page.keyboard.down("d");
  await page.waitForTimeout(900);
  await page.keyboard.up("d");
  expect(await page.evaluate(() => state.flags["archive-lamp"])).toBe(true);
  await flush(page);
  await page.evaluate(() => {
    state.room = "g4";
    state.map = 3;
    const ps = puzzleState();
    ps.block = [2, 2];
    save();
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Continue adventure", exact: true })
    .click();
  expect(await page.evaluate(() => puzzleState().block)).toEqual([2, 2]);
  await page.evaluate(() => {
    const old = fresh();
    old.version = 2;
    old.room = "k3";
    old.map = 4;
    old.x = 480;
    old.y = 350;
    old.flags = { key1: true };
    delete old.puzzles;
    mode = "title";
    localStorage.setItem(SAVE_KEY, JSON.stringify(old));
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Continue adventure", exact: true })
    .click();
  expect(await page.evaluate(() => state.version)).toBe(3);
  expect(await page.evaluate(() => state.room)).toBe("k3");
  expect(await page.evaluate(() => state.flags.key1)).toBe(true);
  expect(await page.evaluate(() => state.x)).toBeGreaterThan(480);
});
