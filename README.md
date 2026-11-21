# Penguin Friends Adventure

An expanded, single-player browser RPG with 48 connected rooms with an original four-chapter story adaptation, canvas pixel art, and optional synthesized audio. Built with Node.js and Express; no build step, external asset service, credentials, or database required.

See [Game context](GAME_CONTEXT.md) for the project history, full story walkthrough, gameplay rules, and developer handoff notes.

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
- FIGHT: stop the marker near the center for a strong hit, then move the heart to dodge until the attack timer ends (about 7 seconds for regular enemies, 8–10 seconds for bosses).
- ITEM: consume food and take an enemy attack turn.
- FLEE: locked until 28% of the enemy's original health has been dealt as damage. Major bosses cannot be fled from, except the parents.
- ACT offers enemy-specific options. When the enemy’s name turns yellow, SPARE resolves the battle peacefully and awards Gold. Two successful ACT choices in the parents’ tutorial also unlock FLEE.
- Sound starts off; its button enables the original generated melody and effects.
- Assist mode reduces projectile speed, increases heart speed, and reduces damage without changing the story.

Rest lanterns restore full health, save the game, and provide one fish if the entire inventory is empty. Chests and battle rewards supply additional food. Defeat returns you to the exploration checkpoint before that battle, restores consumed supplies and health, and guarantees at least two fish.

Saves use this browser's local storage on the current website origin. They do not transfer between browsers, devices, the Railway URL, and the custom domain. Clearing site data removes the save. Older saves migrate to the starting room of their current region while keeping story flags and inventory. Reloading during an unresolved battle resumes the exploration checkpoint. Resolved rewards and boss outcomes are saved when the result is shown.

## Expanded world and combat

There are 48 authored, connected rooms: 10 in Frostbell Island, 10 in Boonona Bay, 12 across Quiet Cove and the Sea Gate, and 16 across the Tidal Halls and Royal Halls. Each region has a room graph with backtracking, optional branches, named locations, journals, supplies, rest points, and encounters. The Drowned Archive lantern and Floodworks sluice wheel open their respective passages.

Scenery includes animated snow and sea ripples, jungle fireflies, crystal glows, footsteps, shaded character sprites, distinct enemy silhouettes, lantern lighting, bookshelves, huts, campfires, and original kingdom interiors. The minimap tracks rooms as you visit them; M opens the larger room journal.

Monsters have 39 named signature attacks across disjoint, enemy-specific sets. Snowcap Crabs use pincers, drifting frost, and burrowing claws; Boonona Bandits use ballistic seeds, rolling coconuts, and vines; Reef Nibblers use schooling fish, closing jaws, and splitting bubbles; Storm Gulls use feathers, dives, and wind; Sentries use spears, shields, and searchlights. Each boss has its own additional set of mechanics. Later phases combine only that boss’s own attacks. Gold warning lanes are safe until the attack fires. The King’s Restless Edict requires actual heart movement: holding a direction against a wall does not count.

Bosses have substantially increased health and damage. Below 65% health, they change patterns halfway through an attack turn. Below 30%, attack speed and damage increase using the earlier phase modifiers. The King has 650 health and five royal signature attacks. The parents remain a gentler tutorial, with ACT and FLEE preserved. Assist mode is still optional.

## Story route

1. **Frostbell Island:** meet Slippy in Lantern Square, return home to challenge the parents (ACT or FIGHT, then FLEE or win), follow the forest road through Windbreak Ridge, and leave from Frostbell Harbor.
2. **Boonona Bay:** gather fruit at Sunleaf Grove, Singing Falls, and Golden Orchard, defeat Baby Orca at Breakwater Beach, and follow the eastern current.
3. **Quiet Cove / Sea Gate:** Slippy is captured. Ask Pippy for help, sail to the gate, defeat Captain Undertow, and enter the kingdom.
4. **Tidal Halls / Throne Room:** defeat the Pearl and Tide wardens, use both seals to enter the throne room, defeat King Orca, and free Slippy from the cage for the ending.

Regular enemies appear automatically after a few steps (90 world pixels) in every fifth room entered. Backtracking and chapter crossings count. Homes, villages, shops, rest areas, boss chambers, and royal halls all allow these encounters. There is no timer or E prompt. A pending encounter carries forward if you leave before taking enough steps. Idle time, blocked movement, dialogue, and menus do not advance the steps. Each battle resets the five-room count. Progress is included in saves. Bosses begin when approached, with story requirements preserved. All four chapters, including the ending, are available. This expanded edition is intended for story, art, controls, and difficulty feedback.

## Routes and shops

- **Neutral** follows the rescue story with reactions to your battle outcomes.
- **Pacifist** requires peaceful resolutions for the story bosses and zero kills. You can avoid or flee optional encounters.
- **Genocide** requires 20 regular kills in each of the six regions before resolving that region’s bosses or leaving. Spare any opponent or pass a required gate early and the route closes. Exhausted regions no longer spawn regular encounters while the route is open. Track progress in the map journal. A fully qualifying run unlocks Slippy after King Orca.

Battle victories award Gold and EXP. Sparing awards Gold. Shops in all six regions sell the original food and progressively stronger weapons and armor. Open the Bag outside of battle to equip or remove one weapon and one armor piece.

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

The test server uses port 18084. Browser tests cover routes, mercy, shops, persistent rewards, all 48 rooms’ connectivity and reachable targets, safe doorway arrivals, switch locks, the complete four-chapter story and ending, ACT/FLEE rules, attack variation, boss phase escalation, warning versus active hazard damage, inventory, defeat recovery, old-save migration, current save/reload, mobile movement/layout, and asset exposure. Story progression tests accelerate combat turns; they verify progression rather than final difficulty balance.

Manual smoke test: meet Slippy in Lantern Square, return home, use ACT twice in the parents’ battle, dodge each attack, then FLEE and follow the forest road to the harbor. Visit the grotto and ring the winter bell. Open M to check room connections. Save at a lantern, reload, and Continue. On a touch device, check the direction pad, doorway interaction, dialogue, strike timing, and item menu. Optional audio requires a user gesture and browser Web Audio support.

Hosting and HTTPS certificate management remain Railway settings; changing this game does not retry or fix a custom-domain certificate.

Menu → Settings selects Easy (0.7×), Normal (1×), Hard (1.2×), or Extra Hard (1.5×). The multiplier applies to heart movement, monster projectile movement, attack cadence, and hazard timing. Difficulty is saved, defaults to Normal, and selecting it turns off the separate legacy Assist option. Exploration speed and damage remain unchanged.
