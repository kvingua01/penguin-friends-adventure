# Penguin Friends Adventure — project context

Penguin Friends Adventure is a single-player browser RPG. You play as Flippy, a young penguin who sets out with his friend Slippy and crosses the Orca Kingdom to rescue him. Exploration alternates with turn-based decisions and real-time dodging. The game has four complete story chapters, 48 connected rooms, original canvas pixel art, and optional synthesized music and effects. This document contains ending spoilers.

## How the game got here

| Milestone | What changed |
| --- | --- |
| `1fb66b3`, `696fc0e` | The project started as a small Express hosting scaffold and became a playable Flippy island exploration demo. |
| `cd23643`, `97026f3` | The demo grew into a four-chapter RPG, then expanded to 48 rooms with richer scenery, room journals, and phased bosses. |
| `c5a9980` through `e77c209` | An experimental edition added scrolling rooms, puzzles, walking encounters, and unique moves for every enemy. Combat pacing and warning rays were tuned, and Enter-to-strike was added. The earlier pace was eventually restored with the signature moves still in place. |
| `01507c6` through `849fdd7` | A book-inspired opening was tried and then reverted. The rescue ending persisted, and several changes experimented with fitting battle controls on desktop and phones. |
| `206fcbc` | The project returned to the earlier 48-room edition with fixed-size room views and a shared attack vocabulary. |
| `e233349` through `e0b1dc5` | Encounters went through walking timers, then room-based triggers. The current rule became five room entries followed by walking, with encounters allowed in every room. Four selectable difficulty speeds were added. |
| `3ba7b9f` | The 39 signature attacks, their projectile art, and their warning behavior returned from the version immediately before the rollback. The current encounter and difficulty systems stayed in place. |

Use the commit IDs to inspect earlier designs with `git show`. For changes carried forward from an experimental version, inspect the relevant subsystem and its dependencies before transplanting code. The old scrolling geometry, expanded puzzles, Enter strike shortcut, and compact battle UI belong to historical revisions.

## Routes, mercy, and equipment update

The original rescue route anchors Neutral. Pacifist resolves all story bosses peacefully without kills. Genocide requires seven regular kills in each region before any required boss is resolved or the region is left, and every required boss must be killed. The room journal tracks each quota. A qualifying run unlocks a rest lantern in the throne room after King Orca. Talk to Slippy to start the final three-phase fight when ready.

Every existing enemy has ACT actions. ACT uses a turn in any phase. Against multi-phase bosses, ACT only advances mercy in phase 3, below 30% HP. Mama and Papa teach ACT from the start. Successful sequences unlock SPARE, which earns Gold without EXP. FIGHT victories earn both. The Bag shows Gold, level, and equipped gear. Mama’s Pantry is the sole merchant for food and equipment. To shop, talk to Mama at home or interact with a physical pantry counter in the current region. Save schema 6 keeps the same storage key and migrates older saves without inventing past outcomes. Older saves with story progress or recorded EXP continue as Neutral because their earlier route history is unavailable.

During Snowcap Crab’s choice turn, clicking the first “o” in the canvas prompt “Choose an action below” opens a practice version of the Slippy finale. The challenge has maximum EXP, 5 DEF, and five soups. Its outcome returns you to the crab battle with your original stats and inventory.

## Story and progression

The story is about friendship and courage. Flippy faces danger because Slippy is counting on him. The King eventually admits that he wanted a friend, and Flippy tells him to ask instead of taking someone. Pippy takes both penguins home under the stars.

| Chapter | Regions and required events |
| --- | --- |
| 1 · A Small Beginning | **Frostbell Island** has 10 rooms. Meet Slippy in Lantern Square, return home, and clear the parents’ tutorial through ACT and FLEE, or through fighting. Follow the forest road through Windbreak Ridge and sail from Frostbell Harbor. The winter bell is an optional stop. |
| 2 · Courage on Boonona Bay | **Boonona Bay** has 10 rooms. Mark Sunleaf Grove, Singing Falls, and Golden Orchard in the journal. The three grove flags unlock Baby Orca’s encounter. Defeat Baby Orca at Breakwater Beach and take the eastern current. Orca soldiers ambush the raft and capture Slippy. |
| 3 · The rescue begins | **Quiet Cove and the Sea Gate** have 12 rooms between them. Ask Pippy for help at the dock and sail to the Sea Gate. Defeat Captain Undertow to enter the kingdom. Pippy keeps the boat ready. |
| 4 · A promise worth keeping | **Tidal Halls and Royal Halls** have 16 rooms between them. Light the Drowned Archive lantern to unlock the Pearl Warden route and turn the Floodworks sluice wheel to open the passage toward the Tide Warden. Defeat both wardens and use their seals to enter the Royal Halls. Defeat King Orca and interact with Slippy’s cage to trigger the ending. The ending offers a return to the title or more exploration from Frostbell Island. |

Main characters are Flippy, Slippy, Mama and Papa, and Pippy. Baby Orca, Captain Undertow, the two wardens, and King Orca guard the main route. Side characters and explorer notes give directions, supplies, and local stories.

## Playing the game

- **Explore.** Use WASD, arrow keys, or the on-screen direction pad. Hold Shift to sprint at double speed while exploring. E, Space, or INTERACT talks, inspects objects, advances dialogue, and takes doorways. M or Map opens the room journal with the current location and visited rooms. I or Bag opens inventory. Escape or Menu opens pause options. Sound starts off and can be enabled with its button.
- **Find encounters.** Each room transition counts, including backtracking and crossing into another region. After the fifth entry, walk 90 world pixels to trigger a regular fight. If you leave first, the encounter stays pending and the walking distance starts over on entry. Idle time, blocked movement, menus, and dialogue contribute no distance. Any fight resets the encounter counter. Bosses can start on approach.
- **Fight and dodge.** Choose FIGHT and stop the moving marker near the center using E, Space, or STRIKE. Better timing deals more damage. Move the heart during the enemy turn and watch marked lanes and circles before they activate. Regular dodge turns last about seven seconds and major boss turns last roughly eight to ten.
- **Use alternatives.** ITEM consumes food and gives the enemy a turn. FLEE becomes available on regular encounters after dealing at least 28% of the enemy’s original HP. Mama and Papa also allow FLEE, and two ACT conversations unlock it without dealing damage. Other bosses must be brought to phase 3 before ACT can help, and FLEE is unavailable. All opponents offer ACT. SPARE works on the existing bosses and regular enemies after their ACT conditions are met. Slippy’s special battle cannot end in mercy or flight.
- **Recover supplies.** Flippy starts with 50 HP, three silver fish, and one soup. Fish heal 35 HP, boononas heal 25, and soup heals 65. Mama’s Pantry has a counter in all six regions. Later counters have better and more expensive equipment and meals. The first level-up costs 4 EXP, and each subsequent cost rises by 1.25. Cumulative thresholds round up to whole EXP. Starting HP increases by 8 per level-up through level 8, for a maximum of 106, while attack bonuses continue through level 15. Region also increases Gold and EXP rewards. Rest lanterns restore full health and save after the dialogue. Defeat restores all gameplay state from the last rest lantern, including supplies, route progress, and location. New adventures use home as the fallback checkpoint.
- **Set the pace.** Menu → Settings offers Easy (0.7×), Normal (1×), Hard (1.2×), and Extra Hard (1.5×). It scales heart movement, projectile motion, attack cadence, and hazard timing. Normal is the default. Selecting a difficulty disables the separate legacy Assist toggle, which slows enemy attacks, increases heart speed, and reduces damage.

### Enemy moves

Each enemy owns a distinct pool. Slippy has five additional ice attacks, with different pools for his three phases. The game avoids repeating the last two primary moves. At less than 65% HP, major bosses change to a second move from their own pool partway through the dodge turn. Below 30%, the turn gets longer, cadence and projectile speeds increase, and hits deal more damage. The parents stay at phase one. King Orca has 650 HP. His Restless Edict checks actual heart displacement, so holding a direction against the wall does not count as moving.

| Enemy | Signature moves |
| --- | --- |
| Snowcap Crab | Pincer Trap, Frost Flakes, Under the Ice |
| Boonona Bandit | Seed Scatter, Rolling Lunch, Hungry Vines |
| Reef Nibbler | School Rush, Closing Jaws, Bubble Trouble |
| Storm Gull | Featherfall, Shadow Dive, Storm Wings |
| Orca Sentry | Sentry Spears, Shield March, Searchlight |
| Mama & Papa | Snowball Practice, Follow the Safe Lane, Overprotective Hugs |
| Baby Orca | Little Breach, Playful Splashes, Baby Blowhole, Tail Tantrum |
| Captain Undertow | Returning Harpoon, Captain’s Formation, Depth Anchors, Crossed Orders |
| Warden of the Pearl | Pearl Satellites, Prism Reflections, Pearl Necklace, Shattered Pearl |
| Warden of the Tide | Open the Floodgates, Royal Whirlpool, Reverse Tide, High Water |
| King Orca | Crown of the Deep, Three-Pronged Promise, Restless Edict, The Lonely Crown, The King’s Last Storm |

## Developer notes

| File | Responsibility |
| --- | --- |
| [`index.html`](index.html) | Screen shell and controls, 960×576 canvas, HUD, dialogue, and overlays. Loads `world.js` before `game.js`. |
| [`style.css`](style.css) | Responsive canvas, desktop and touch controls, panels, and overlays. |
| [`world.js`](world.js) | Publishes `window.PENGUIN_WORLD` with room data, six region starts, and supplemental NPC dialogue. Rooms contain exits, scenery, NPCs, interactive objects, and enemy pools. |
| [`game.js`](game.js) | State and saves, input, movement and collision, story flags, battle mechanics, drawing, and Web Audio. A `requestAnimationFrame` loop drives exploration or battle and pauses simulation behind menus, dialogue, or hidden tabs. |
| [`server.js`](server.js) | Express routes for the game page, three public assets, and `/health`. The explicit route list keeps other repository files private. |
| [`playwright.config.js`](playwright.config.js) and [`tests/adventure.spec.js`](tests/adventure.spec.js) | Browser test setup and gameplay regression suite. |

### Where to make changes

- **Rooms and navigation.** Begin in `world.js`. The room ID prefixes are `h` (Frostbell), `b` (Boonona), `c` (Quiet Cove), `g` (Sea Gate), `k` (Tidal Halls), and `t` (Royal Halls). Use the existing room and connection helpers. Verify reciprocal exits, arrival points, pathing, and reachable interactions using the graph test. Check `targets()`, `enterRoom()`, and `walkable()` in `game.js` if coordinates or collision behavior change.
- **Story and gates.** Check `talk()`, `interact()`, `objective()`, `exitMap()`, `finishBattle()`, and `ending()`. A flag added to a gate usually needs a way to set it, an appropriate objective or hint, and coverage in the story test. Keep existing room and flag IDs compatible with saved games.
- **Encounters.** `countEncounterRoom()` keeps the count capped at five and resets walking distance per entry. `updateWorld()` passes actual movement to `updateWalkingEncounters()`. The latter checks for a nearby boss first, then chooses from the room’s enemies or a region fallback. `startBattle()` resets the counters and saves before switching modes.
- **Combat.** The battle runs through choice, strike, dodge, and result. Enemy stats are in `enemies`. Add new moves to `ATTACKS` and `spawnPattern()`; IDs use the `enemy.move` format to build the pools. `updateBattle()` handles projectile motion, warnings, collisions, and phase timing. `drawBattle()` renders those hazards and projectiles. Preserve the distinction between real time for the dodge-turn clock and difficulty-scaled time for enemy patterns. Check attack ownership, warning safety, and late-phase behavior when tuning.
- **Saves.** `fresh()`, `readSave()`, and `save()` manage the browser-local key `penguin-friends-story-v1`. The current schema is version 6. Older saves and missing or mismatched room IDs resolve to the current region’s start with valid story flags and inventory preserved. Invalid data is rejected, and missing or invalid difficulty defaults to Normal. Saves record exploration state and resolved rewards. Reloading before a battle is resolved returns to the latest exploration save. The separate lantern snapshot persists across sessions and replaces the exploration save on defeat. Saves are scoped to the browser profile and exact site origin. The custom domain and Railway URL have separate slots.

### Run and verify

Use Node.js 22 or newer. Run from the repository root.

```sh
npm ci
npm start
```

Express binds to `0.0.0.0` and defaults to port 8080. Set `PORT` to override it. Check that `/health` returns `{"status":"ok"}` and that the root page loads the three assets. The project requires no build step, database, or credentials. Railway can run `npm start`; configure the service’s target port, domains, and HTTPS there.

```sh
npx playwright install chromium
npm test
```

Use `CHROMIUM_EXECUTABLE=/usr/bin/chromium npm test` if system Chromium is already available. Playwright runs its own app server on port 18084. Its tests cover routes, mercy, Slippy, shops, persistent rewards, room connectivity and locks, the full story, all signature attacks and warnings, keyboard and touch input, saves and defeat recovery, asset routes, encounter scheduling, and difficulty multipliers. The story test accelerates combat, so use a manual run at normal speed for balance changes. For a quick smoke test, meet Slippy, clear the parents’ tutorial with ACT and FLEE, check the map, then rest at a lantern and reload with Continue.
