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
  await interactWith(page, "archive-lamp");
  await go(page, "k4");
  await win(page, "key1");
  await go(page, "k6");
  await interactWith(page, "sluice-wheel");
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

test("every room triggers encounters after one minute of walking without E", async ({
  page,
}) => {
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
      state.encounterWalking = 0;
      updateWalkingEncounters(59);
      if (mode !== "world") failures.push(room.id + " triggered early");
      updateWalkingEncounters(0);
      if (state.encounterWalking !== 59)
        failures.push(room.id + " counted idle time");
      updateWalkingEncounters(1);
      if (mode !== "battle" || battle.boss)
        failures.push(room.id + " missing regular encounter");
      if (state.encounterWalking !== 0)
        failures.push(room.id + " failed to reset");
    }
    return failures;
  });
  expect(failures).toEqual([]);
});

test("walking in a wilderness room without old monster placements still triggers combat", async ({
  page,
}) => {
  await begin(page);
  const result = await page.evaluate(() => {
    state.room = "h5";
    state.map = 0;
    state.x = 480;
    state.y = 350;
    state.encounterWalking = 59.9;
    const oldPlacements = currentRoom().enemies.length;
    keys.add("d");
    for (let i = 0; i < 5 && mode === "world"; i++) updateWorld(0.04);
    keys.clear();
    return { oldPlacements, mode, enemy: battle?.type };
  });
  expect(result.oldPlacements).toBe(0);
  expect(result.mode).toBe("battle");
  expect(result.enemy).toBe("snowcrab");
});
