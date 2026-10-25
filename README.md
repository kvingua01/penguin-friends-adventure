# Penguin Friends Adventure

An expanded, single-player browser RPG with 48 connected rooms with an original four-chapter story adaptation, canvas pixel art, and optional synthesized audio. Built with Node.js and Express; no build step, external asset service, credentials, or database required.

## Run locally or on Railway

Use Node.js 22 or newer:

```sh
npm ci
npm start
```

The server binds `0.0.0.0` on `process.env.PORT || 8080`. Railway's start command is `npm start`; set domain target ports to the actual application port. `/health` returns `{"status":"ok"}`. The root `index.html` loads the explicitly served `/world.js`, `/game.js`, and `/style.css`; there is no public folder. Other repository files are not exposed.

## Play

- WASD / arrow keys, or the on-screen direction pad: move.
- E / Space / INTERACT: talk, inspect objects, advance dialogue, or stop the strike marker.
- M / Map: open the region journal and see visited rooms, connections, and your current position. Use E at doorways to enter connected rooms.
- I / Bag: healing inventory. Escape / Menu: pause, instructions, assist mode, and saving.
- FIGHT: press Enter, E, Space, or STRIKE to stop the marker near the center for a strong hit, then move the heart to dodge until the attack timer ends (about 7 seconds for regular enemies, 8–10 seconds for bosses).
- ITEM: consume food and take an enemy attack turn.
- FLEE: locked until 28% of the enemy's original health has been dealt as damage. Major bosses cannot be fled from, except the parents.
- ACT appears only in the parents' tutorial. Two conversations unlock FLEE without dealing damage. There is no MERCY action.
- Sound starts off; its button enables the original generated melody and effects.
- Assist mode reduces projectile speed, increases heart speed, and reduces damage without changing the story.

Rest lanterns restore full health, save the game, and provide one fish if the entire inventory is empty. Chests and battle rewards supply additional food. Defeat returns you to the exploration checkpoint before that battle, restores consumed supplies and health, and guarantees at least two fish.

Saves use this browser's local storage on the current website origin. They do not transfer between browsers, devices, the Railway URL, and the custom domain. Clearing site data removes the save. Older saves retain their room where possible, and their coordinates are migrated to the larger geometry while keeping story flags and inventory. Only exploration state is saved; reloading during combat resumes the previous exploration checkpoint.

## Scrolling world, puzzles, and combat

There are 48 authored, connected, scrolling rooms: 10 in Frostbell Island, 10 in Boonona Bay, 12 across Quiet Cove and the Sea Gate, and 16 across the Tidal Halls and Royal Halls. Each region has a room graph with backtracking, optional branches, named locations, journals, supplies, rest points, and encounters. The Drowned Archive lantern and Floodworks sluice wheel open their respective passages.

Rooms range from 1536×960 to 1920×1248 world pixels. The 960×576 viewport follows Flippy horizontally and vertically, without enlarging characters or adding rooms. Flippy faces the direction of movement and keeps that facing when stopped. The local minimap shows the camera window, player, puzzle area, and exits.

Eight puzzles are distributed across the existing rooms: three push-block challenges, three ordered-switch challenges, and two path sequences. Read the left pedestal for hints; use the right pedestal to reset an unsolved puzzle. Mistakes do not cost health. Puzzle progress and solved mechanisms are saved.

Scenery includes animated snow and sea ripples, jungle fireflies, crystal glows, footsteps, shaded character sprites, distinct enemy silhouettes, lantern lighting, bookshelves, huts, campfires, and original kingdom interiors. The minimap tracks rooms as you visit them; M opens the larger room journal.

Monsters have 39 named signature attacks across disjoint, enemy-specific sets. Snowcap Crabs use pincers, drifting frost, and burrowing claws; Boonona Bandits use ballistic seeds, rolling coconuts, and vines; Reef Nibblers use schooling fish, closing jaws, and splitting bubbles; Storm Gulls use feathers, dives, and wind; Sentries use spears, shields, and searchlights. Each boss has its own additional set of mechanics. Later phases combine only that boss’s own attacks. Gold warning lanes are safe until the attack fires. The King’s Restless Edict requires actual heart movement: holding a direction against a wall does not count.

Bosses have substantially increased health and damage. Below 65% health, they change patterns halfway through an attack turn. Below 30%, attack speed and damage increase, and additional signature moves mix into the patterns. The King has 650 health and five royal signature attacks. The parents remain a gentler tutorial, with ACT and FLEE preserved. Assist mode is still optional.

### Harder combat update

Normal-mode projectiles are faster and attack volleys arrive more frequently. Pincers sweep toward the center; seed arcs start across the box; rolling coconuts enter at different heights; jaw openings move; shield waves alternate sides; and harpoons travel across the box before returning. Crown attacks threaten both axes even before the King’s later phases.

Staying in the same ninth of the arena for too long triggers a warned, enemy-specific pursuit attack. Crabs crack the ice beneath you, gulls dive at your lane, reef monsters chase with fish, and bosses pursue with their own weapons. Moving between regions resets that pursuit timer. Parents’ tutorial attacks remain gentler, and Assist mode keeps slower projectiles and longer warnings. Damage and boss health were not inflated for this update.

Supplementary rays are limited to one late event per dodge turn when a ray is not the active main attack. Most pursuit uses the monster’s own projectiles instead. The King’s storm shares the same extra-ray limit. Primary ray attacks retain their regular pattern.

The coverage regression checks each of the 36 non-tutorial attack patterns against stationary hearts in nine different positions (324 cases), plus a test that a warned pursuit attack can be escaped. These tests catch permanent safe corners; human playtesting is still needed for difficulty balance.

## Story route

1. **Frostbell Island:** meet Slippy in Lantern Square, return home to challenge the parents (ACT or FIGHT, then FLEE or win), follow the forest road through Windbreak Ridge, and leave from Frostbell Harbor.
2. **Boonona Bay:** gather fruit at Sunleaf Grove, Singing Falls, and Golden Orchard, defeat Baby Orca at Breakwater Beach, and follow the eastern current.
3. **Quiet Cove / Sea Gate:** Slippy is captured. Ask Pippy for help, sail to the gate, defeat Captain Undertow, and enter the kingdom.
4. **Tidal Halls / Throne Room:** defeat the Pearl and Tide wardens, use both seals to enter the throne room, defeat King Orca, and free Slippy from the cage for the ending.

Regular fights trigger automatically after sufficient walking in unsafe areas; E is not required. Standing still never rolls a battle. Villages, homes, camps, and puzzle areas are safe. Doorways and NPCs have encounter-free approach space. A time and walking-distance cooldown separates fights. Bosses trigger on approach; the parents’ tutorial begins through their story conversation. All four chapters, including the ending, are available. This expanded edition is intended for story, art, controls, and difficulty feedback.

## Validation

```sh
npm ci
npx playwright install chromium
npm test
```

If Chromium is already installed, use its executable instead of downloading a browser:

```sh
CHROMIUM_EXECUTABLE=/usr/bin/chromium npm test
```

The test server uses port 18084. Thirteen browser tests cover all 48 rooms’ connectivity and reachable targets, safe doorway arrivals, switch locks, all eight puzzle solutions and reset/mistake handling, random walking encounters and safe-area/cooldown behavior, four-direction facing, scrolling-camera bounds, unique monster move ownership, the complete four-chapter story and ending, ACT/FLEE rules, attack variation, boss phase escalation, warning versus active hazard damage, inventory, defeat recovery, old-save migration, current save/reload, mobile movement/layout, and asset exposure. Story progression tests accelerate combat turns; they verify progression rather than final difficulty balance.

Manual smoke test: meet Slippy in Lantern Square, return home, use ACT twice in the parents’ battle, dodge each attack, then FLEE and follow the forest road to the harbor. Visit the grotto and ring the winter bell. Open M to check room connections. Save at a lantern, reload, and Continue. On a touch device, check the direction pad, doorway interaction, dialogue, strike timing, and item menu. Optional audio requires a user gesture and browser Web Audio support.

Hosting and HTTPS certificate management remain Railway settings; changing this game does not retry or fix a custom-domain certificate.
