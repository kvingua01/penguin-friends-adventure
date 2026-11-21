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
  await interactWith(page, "archive-lamp");
  await interactWith(page, "k4");
  expect(await page.evaluate(() => state.room)).toBe("k4");
  await page.evaluate(() => {
    state.room = "k6";
  });
  await interactWith(page, "k7");
  expect(await page.evaluate(() => state.room)).toBe("k6");
  await interactWith(page, "sluice-wheel");
  await interactWith(page, "k7");
  expect(await page.evaluate(() => state.room)).toBe("k7");
});

async function completeStory(page, peaceful) {
  const resolve = async (type) => {
    if (!peaceful && type !== "gate") {
      await win(page, type);
      return;
    }
    await page.evaluate((type) => {
      startBattle(type, type);
      for (let index = 0; !battle.spareable; index++) {
        if (index >= MERCY[type].length) throw Error("Could not spare " + type);
        act(index);
        battle.phaseTime = battle.duration;
        updateBattle(0);
      }
      spare();
      battle.done();
    }, type);
    await flush(page);
  };
  await begin(page);
  await go(page, "h1");
  await interactWith(page, "slippy");
  await go(page, "h0");
  await interactWith(page, "parents");
  expect(await page.evaluate(() => fleeUnlocked())).toBe(false);
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "ACT", exact: true }).click();
    await page.getByRole("button", {
      name: i === 0 ? "Explain the Trip" : "Promise to Return",
      exact: true,
    }).click();
    await endTurn(page);
  }
  await page.getByRole("button", {
    name: peaceful ? "SPARE" : "FLEE", exact: true,
  }).click();
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
  await resolve("baby");
  await interactWith(page, "region");
  expect(await page.evaluate(() => state.flags.captured)).toBe(true);
  await go(page, "c5");
  await interactWith(page, "region");
  expect(await page.evaluate(() => state.map)).toBe(2);
  await interactWith(page, "pippy");
  await interactWith(page, "region");
  await go(page, "g5");
  await resolve("gate");
  await interactWith(page, "region");
  await go(page, "k3");
  await interactWith(page, "archive-lamp");
  await go(page, "k4");
  await resolve("key1");
  await go(page, "k6");
  await interactWith(page, "sluice-wheel");
  await go(page, "k8");
  await resolve("key2");
  await go(page, "k11");
  await interactWith(page, "region");
  await go(page, "t3");
  await resolve("king");
  await interactWith(page, "slippy-cage");
  await expect(
    page.getByRole("heading", {
      name: peaceful ? "Room for one more" : "Some things are bigger than the ocean.",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => Object.keys(state.visited).length),
  ).toBeGreaterThan(29);
  expect(await page.evaluate(() => readSave().route.ending)).toBe(
    peaceful ? "pacifist" : "neutral",
  );
}
test("complete the four-chapter story on Neutral with mixed outcomes", async ({ page }) => {
  await completeStory(page, false);
});
test("complete the four-chapter story without a kill on Pacifist", async ({ page }) => {
  await completeStory(page, true);
});

test("enemies vary attacks, bosses escalate, warnings are safe before firing, and damage is real", async ({
  page,
}) => {
  await begin(page);
  const result = await page.evaluate(() => {
    const failures = [];
    const attackIds = Object.keys(ATTACKS);
    if (attackIds.filter((id) => !id.startsWith("slippy.")).length !== 39) failures.push("missing signature attacks");
    for (const type of Object.keys(enemies)) {
      mode = "world";
      state.hp = 120;
      startBattle(type, "test-" + type);
      const played = [];
      for (let turn = 0; turn < 8; turn++) {
        battle.hp = battle.maxHp * (turn < 3 ? 0.95 : turn < 6 ? 0.5 : 0.2);
        beginDodge();
        played.push(battle.attack);
        if (
          !battle.attack.startsWith(type + ".") ||
          !battle.secondary.startsWith(type + ".") ||
          battle.attack === battle.secondary
        )
          failures.push(type + " selected an invalid signature attack");
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
    for (const attack of attackIds) {
      mode = "world";
      state.hp = 120;
      startBattle(attack.split(".")[0], "pattern-" + attack);
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

test("every fifth room triggers a battle after a few steps, including backtracking and chapter crossings", async ({
  page,
}) => {
  await begin(page);
  const result = await page.evaluate(() => {
    enterRoom("h1", "E");
    updateWalkingEncounters(100);
    const first = mode;
    enterRoom("h0", "W");
    updateWalkingEncounters(100);
    const second = mode;
    enterRoom("h1", "E");
    updateWalkingEncounters(100);
    if (mode !== "world") throw Error("Third room triggered a battle");
    enterRoom("h0", "W");
    updateWalkingEncounters(100);
    if (mode !== "world") throw Error("Fourth room triggered a battle");
    changeMap(1);
    updateWalkingEncounters(0);
    const idle = mode;
    updateWalkingEncounters(0.3);
    const few = mode;
    save();
    const saved = readSave();
    state = saved;
    updateWalkingEncounters(0.31);
    const fought = mode === "battle" && !battle.boss;
    const reset = state.encounterRooms;
    mode = "world";
    battle = null;
    updateWalkingEncounters(100);
    return { first, second, idle, few, fought, reset, noRepeat: mode };
  });
  expect(result).toEqual({
    first: "world",
    second: "world",
    idle: "world",
    few: "world",
    fought: true,
    reset: 0,
    noRepeat: "world",
  });
});

test("all rooms allow scheduled encounters without E", async ({ page }) => {
  await begin(page);
  const failures = await page.evaluate(() => {
    const failures = [];
    for (const room of Object.values(WORLD.rooms)) {
      mode = "world";
      battle = null;
      state.room = room.id;
      state.map = room.region;
      state.x = 100;
      state.y = 300;
      state.encounterRooms = 5;
      state.encounterSteps = 0;
      updateWalkingEncounters(0.61);
      if (mode !== "battle" || battle.boss) failures.push(room.id);
    }
    return failures;
  });
  expect(failures).toEqual([]);
});

test("settings apply and save exact heart and attack speed multipliers", async ({
  page,
}) => {
  await begin(page);
  await page.evaluate(() => menu());
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  for (const [name, factor] of [
    ["Easy", 0.7],
    ["Normal", 1],
    ["Hard", 1.2],
    ["Extra Hard", 1.5],
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    const actual = await page.evaluate(() => {
      const savedDifficulty = readSave().difficulty;
      closePanel();
      mode = "world";
      startBattle("snowcrab", "speed-test");
      beginDodge();
      battle.bullets = [];
      battle.hazards = [];
      battle.spawnTime = 0;
      bullet(300, 330, 100, 0);
      const before = battle.heart.x;
      keys.add("d");
      updateBattle(0.1);
      keys.clear();
      const result = {
        heart: (battle.heart.x - before) / 19.3,
        attack: (battle.bullets[0].x - 300) / 10,
        cadence: battle.spawnTime / 0.1,
        saved: savedDifficulty === state.difficulty,
      };
      mode = "world";
      battle = null;
      settings();
      return result;
    });
    expect(actual.heart).toBeCloseTo(factor);
    expect(actual.attack).toBeCloseTo(factor);
    expect(actual.cadence).toBeCloseTo(factor);
    expect(actual.saved).toBe(true);
  }
});

test("each regular enemy and story boss can be spared for Gold without EXP", async ({ page }) => {
  await begin(page);
  const result = await page.evaluate(() => {
    const failures = [];
    for (const [type, actions] of Object.entries(MERCY)) {
      startBattle(type, type);
      spare();
      if (battle.phase !== "dodge") failures.push(type + ": unearned spare");
      battle.phaseTime = battle.duration;
      updateBattle(0);
      for (let index = 0; index < actions.length - 1 && !battle.spareable; index++) {
        act(index);
        battle.phaseTime = battle.duration;
        updateBattle(0);
      }
      const gold = state.gold;
      spare();
      if (!battle.spareable || battle.phase !== "result" || state.gold <= gold || state.xp)
        failures.push(type + ": mercy outcome");
      battle.done();
      while (dialogue) advance();
    }
    return { failures, route: storyRoute(), eligible: state.route.possible,
      spared: readSave().route.spared, kills: state.route.total };
  });
  expect(result).toEqual({ failures: [], route: "pacifist", eligible: false, spared: 11, kills: 0 });
  await page.evaluate(() => ending());
  await expect(page.getByRole("heading", { name: "Room for one more" })).toBeVisible();
});

test("regional grinding exhausts each pool and unlocks Slippy after King Orca", async ({ page }) => {
  await begin(page);
  await page.keyboard.press("m");
  await expect(page.getByText(/Genocide progress.*Frostbell 0\/1.*Royal Halls 0\/1/)).toBeVisible();
  await page.keyboard.press("Escape");
  const report = await page.evaluate(() => {
    const failures = [];
    for (let map = 0; map < 6; map++) {
      changeMap(map);
      const otherRoom = currentRoom().doors.find((door) => door.to !== "region").to;
      for (let kill = 0; kill < REGION_QUOTA; kill++) {
        for (let entry = 0; entry < 5; entry++) {
          const nextRoom = state.room === WORLD.starts[map] ? otherRoom : WORLD.starts[map];
          const door = currentRoom().doors.find((door) => door.to === nextRoom);
          enterRoom(nextRoom, door.direction);
        }
        updateWalkingEncounters(0.61);
        if (mode !== "battle" || battle.boss) throw Error("Missing regular encounter in " + map);
        finishBattle("win");
        battle.done();
      }
      state.encounterRooms = 5;
      updateWalkingEncounters(0.61);
      if (mode !== "world" || state.route.kills[map] !== 1) failures.push(map);
      while (dialogue) advance();
      for (const type of [["parents"], ["baby"], [], ["gate"], ["key1", "key2"], ["king"]][map]) {
        if (slippyPending()) failures.push("early Slippy");
        startBattle(type, type);
        finishBattle("win");
        battle.done();
        while (dialogue) advance();
      }
    }
    const phases = [];
    for (const fraction of [1, 0.6, 0.2]) {
      battle.hp = battle.maxHp * fraction;
      spare();
      if (battle.spareable || fleeAllowed() || battle.phase !== "dodge") failures.push("Slippy mercy");
      phases.push(battle.phaseLevel);
      battle.phaseTime = battle.duration;
      updateBattle(0);
      actMenu();
      if (battle.spareable || battle.phase !== "dodge") failures.push("Slippy ACT");
      battle.phaseTime = battle.duration;
      updateBattle(0);
    }
    const result = { failures, phases, boss: battle.type, route: storyRoute(),
      kills: state.route.kills, total: state.route.total };
    finishBattle("win");
    battle.done();
    return result;
  });
  expect(report).toEqual({ failures: [], phases: [1, 2, 3], boss: "slippy", route: "genocide",
    kills: [1, 1, 1, 1, 1, 1], total: 12 });
  await expect(page.getByRole("heading", { name: "No one on the shore" })).toBeVisible();
});

test("fleeing preserves eligibility, while an early boss kill or crossing closes the route", async ({ page }) => {
  await begin(page);
  const result = await page.evaluate(() => {
    const status = [];
    startBattle("snowcrab", "walking-encounter");
    finishBattle("flee");
    battle.done();
    status.push(state.route.possible);
    startBattle("parents", "parents");
    finishBattle("win");
    battle.done();
    while (dialogue) advance();
    status.push(state.route.possible, storyRoute(), slippyPending());
    state = fresh();
    state.map = 2;
    state.room = "c5";
    state.flags.pippy = true;
    exitMap();
    status.push(state.route.possible, state.map);
    return status;
  });
  expect(result).toEqual([true, false, "neutral", false, false, 3]);
});

test("shopping, equipment, and battle results persist without duplicate rewards", async ({ page }) => {
  await begin(page);
  await page.evaluate(() => {
    state.gold = 100;
  });
  await interactWith(page, "mama");
  const stick = page.locator(".item").filter({ hasText: "Wooden Stick" });
  await stick.getByRole("button").click();
  await expect(stick.getByRole("button")).toBeDisabled();
  await page.locator(".item").filter({ hasText: "Warm Scarf" }).getByRole("button").click();
  await page.getByRole("button", { name: "Exit shop" }).click();
  await page.keyboard.press("i");
  await page.getByRole("button", { name: "Equip Wooden Stick" }).click();
  await page.getByRole("button", { name: "Equip Warm Scarf" }).click();
  await expect(page.getByText(/35 G · Level 1.*ATK 22 · DEF 3/)).toBeVisible();
  await page.keyboard.press("Escape");
  const saved = await page.evaluate(() => {
    startBattle("parents", "parents");
    finishBattle("win");
    const gold = state.gold;
    finishBattle("win");
    if (gold !== state.gold) throw Error("Repeated result paid twice");
    return { gold, xp: state.xp };
  });
  await page.reload();
  await page.getByRole("button", { name: "Continue adventure" }).click();
  const loaded = await page.evaluate(() => {
    startBattle("parents", "parents");
    return { gold: state.gold, xp: state.xp, mode, atk: attackBonus(), def: defense(),
      outcome: state.route.bosses.parents };
  });
  expect(loaded).toEqual({ ...saved, mode: "world", atk: 3, def: 3, outcome: "kill" });
});

test("version 2 saves preserve inventory and story without restoring removed chests", async ({ page }) => {
  await begin(page);
  const migrated = await page.evaluate(() => {
    const old = fresh();
    old.version = 2;
    old.map = 1;
    old.room = "b1";
    old.flags = { parents: true };
    old.xp = 4;
    old.inventory = { fish: 4, boonona: 2, soup: 1 };
    for (const field of ["route", "equipment", "gear", "gold"]) delete old[field];
    localStorage.setItem(SAVE_KEY, JSON.stringify(old));
    const updated = readSave();
    const objects = Object.values(WORLD.rooms).flatMap((room) => room.objects);
    return {
      version: updated.version, room: updated.room, xp: updated.xp,
      inventory: updated.inventory, flags: updated.flags, route: updated.route,
      chests: objects.some(([type]) => type === "chest"),
      rests: objects.some(([type]) => type === "shrine"),
      storage: objects.some(([type]) => /storage|crate/i.test(type)),
    };
  });
  expect(migrated).toEqual({
    version: 3, room: "b1", xp: 4, inventory: { fish: 4, boonona: 2, soup: 1 },
    flags: { parents: true },
    route: { possible: false, legacy: true, kills: [0, 0, 0, 0, 0, 0], total: 0,
      spared: 0, bosses: {}, ending: null },
    chests: false, rests: true, storage: false,
  });
});

test("Mama alone sells additional food, including through her order book later in the story", async ({ page }) => {
  await begin(page);
  await page.evaluate(() => {
    state.inventory = { fish: 0, boonona: 0, soup: 0 };
    state.gold = 100;
    state.hp = 45;
  });
  await interactWith(page, "rest-h0");
  expect(await page.evaluate(() => state.hp)).toBe(120);
  await go(page, "h3");
  await interactWith(page, "moss");
  await page.evaluate(() => {
    startBattle("snowcrab", "walking-encounter");
    finishBattle("win");
    battle.done();
    startBattle("snowcrab", "walking-encounter");
    state.hp = 0;
    finishBattle("lose");
    battle.done();
    changeMap(1);
  });
  await go(page, "b2");
  await interactWith(page, "fruit1");
  expect(await page.evaluate(() => ({ inventory: state.inventory, groves: fruitCount() })))
    .toEqual({ inventory: { fish: 0, boonona: 0, soup: 0 }, groves: 1 });
  await page.evaluate(() => {
    changeMap(5);
    state.route.bosses.parents = "kill";
  });
  await page.keyboard.press("m");
  await page.getByRole("button", { name: "Order from Mama’s Pantry" }).click();
  await expect(page.getByRole("heading", { name: "Mama’s Pantry" })).toBeVisible();
  await expect(page.getByText("Arctic Armor", { exact: false })).toBeVisible();
  await page.locator(".item").filter({ hasText: "Silver fish" }).getByRole("button").click();
  expect(await page.evaluate(() => readSave().inventory.fish)).toBe(1);
});
