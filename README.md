# Penguin Friends Adventure

A single-player browser RPG with 48 scrolling rooms, canvas pixel art, optional synthesized audio, and an adaptation of the authors’ three story parts followed by the retained rescue ending. Built with Node.js and Express; no build step, external asset service, credentials, or database required.

## Run locally or on Railway

Use Node.js 22 or newer:

```sh
npm ci
npm start
```

The server binds `0.0.0.0` on `process.env.PORT || 8080`. Railway's start command is `npm start`; set domain target ports to the actual application port. `/health` returns `{"status":"ok"}`. The root `index.html` loads the explicitly served `/world.js`, `/story.js`, `/game.js`, and `/style.css`; there is no public folder. Other repository files are not exposed.

## Play

- WASD / arrow keys, or the on-screen direction pad: move.
- E / Space / INTERACT: talk, inspect objects, advance dialogue, or stop the strike marker.
- M / Map: open the region journal and see visited rooms, connections, and your current position. Use E at doorways to enter connected rooms.
- I / Bag: healing inventory. Escape / Menu: pause, instructions, assist mode, and saving.
- FIGHT: press Enter, E, Space, or STRIKE to stop the marker near the center for a strong hit, then move the heart to dodge until the attack timer ends (about 7 seconds for regular enemies, 8–10 seconds for bosses).
- ITEM: consume food and take an enemy attack turn.
- FLEE: locked until 28% of the enemy's original health has been dealt as damage. Major bosses cannot be fled from, except Slippy’s playful tutorial.
- ACT appears only in Slippy’s playful wrestling tutorial. Two conversations unlock FLEE without dealing damage. There is no MERCY action.
- Sound starts off; its button enables the original generated melody and effects.
- Assist mode reduces projectile speed, increases heart speed, and reduces damage without changing the story.

Rest lanterns restore full health, save the game, and provide one fish if the entire inventory is empty. Chests and battle rewards supply additional food. Defeat returns you to the exploration checkpoint before that battle, restores consumed supplies and health, and guarantees at least two fish.

Saves use this browser's local storage on the current website origin. They do not transfer between browsers, devices, the Railway URL, and the custom domain. Clearing site data removes the save. This rewritten story uses `penguin-friends-books-v1`, a separate local save slot. The earlier `penguin-friends-story-v1` adventure remains stored untouched. Start a New adventure to follow the books from the beginning. Only exploration state is saved; reloading during combat resumes the previous exploration checkpoint.

## Scrolling world, puzzles, and combat

There are 48 authored, connected, scrolling rooms: 10 in Frostbell Island, 10 in Boonona Bay, 12 across Pippy’s Visit and the Snowy Mountain, and 16 across the Tidal Halls and Royal Halls. Each region has a room graph with backtracking, optional branches, named locations, journals, supplies, rest points, and encounters. The Drowned Archive lantern and Floodworks sluice wheel open their respective passages.

Rooms range from 1536×960 to 1920×1248 world pixels. The 960×576 viewport follows Flippy horizontally and vertically, without enlarging characters or adding rooms. Flippy faces the direction of movement and keeps that facing when stopped. The local minimap shows the camera window, player, puzzle area, and exits.

Eight puzzles are distributed across the existing rooms: three push-block challenges, three ordered-switch challenges, and two path sequences. Read the left pedestal for hints; use the right pedestal to reset an unsolved puzzle. Mistakes do not cost health. Puzzle progress and solved mechanisms are saved.

Scenery includes animated snow and sea ripples, jungle fireflies, crystal glows, footsteps, shaded character sprites, distinct enemy silhouettes, lantern lighting, bookshelves, huts, campfires, and original kingdom interiors. The minimap tracks rooms as you visit them; M opens the larger room journal.

Monsters have 39 named signature attacks across disjoint, enemy-specific sets. Snowcap Crabs use pincers, drifting frost, and burrowing claws; Boonona Bandits use ballistic seeds, rolling coconuts, and vines; Reef Nibblers use schooling fish, closing jaws, and splitting bubbles; Storm Gulls use feathers, dives, and wind; Sentries use spears, shields, and searchlights. Each boss has its own additional set of mechanics. Later phases combine only that boss’s own attacks. Gold warning lanes are safe until the attack fires. The King’s Restless Edict requires actual heart movement: holding a direction against a wall does not count.

Bosses have substantially increased health and damage. Below 65% health, they change patterns halfway through an attack turn. Below 30%, attack speed and damage increase using the earlier phase modifiers. The King has 650 health and five royal signature attacks. Slippy’s playful wrestling remains a gentler tutorial, with ACT and FLEE preserved. Assist mode is still optional.

### Restored combat difficulty

The earlier combat pace is restored while retaining all 39 monster-specific attacks: regular projectile speed is based on 113 pixels/second, bosses on 145 (with the original phase multipliers), and volleys use their normal timing. The later anti-camping pursuit system and extra overlapping late-phase volleys have been removed. Enemy health, damage, healing, Assist mode, and Slippy’s playful tutorial rules retain their earlier values.

The newer full-arena pattern paths remain, as do scrolling rooms, puzzles, saves, instant Enter strikes, and the reduction to supplementary rays. Different signature attacks cannot have exactly identical difficulty to the old shared patterns; this restores the earlier speed and pressure settings for feedback.

## Story route

The dialogue data in `story.js` adapts the story supplied by the authors: Book One by Hudson and Kenny; Book Two by Kenny, Hudson, and Rowan; and the continuation narrated by Flippy, Slippy, and Pippy. The original game’s Orca Kingdom rescue ending remains as the later continuation.

1. **Book One:** Flippy (one month old) meets Slippy (also one month old; birthday February 16). Go to Fishing Bay, climb the iceberg when neither can swim, and be rescued by their mothers. Talk to Mama at home, belly skate at the frozen lake, come home for fish, and sleep standing up. Next morning, playfully wrestle Slippy, invent secret squeaks, and return to the iceberg. This time it drifts away with no way home.
2. **Book Two:** arrive on hot sand and run to green ground. Slippy touches an itchy plant. Visit the shallow water and peck Baby Orca away. The frightened orca throws up fish; share the fish feast and rest. Only afterward, find the squirting yellow fruit, name it boononas, gather more, and spot the mysterious shape in the distance.
3. **Pippy’s visit:** meet Pippy, a sailor from Iceberg. Show him the boononas, rest in palm shade, and take an iceberg tour. Pippy fishes while the friends climb the snowy mountain with boononas. At the highest peak, try Flippy’s spinning slide and crash into Slippy, then Pippy. Hear Pippy’s and Slippy’s versions and tell Flippy’s version. Go to the western shore for the fish ambush. The book portion ends with “Let the games begin.”
4. **Retained rescue ending:** return to Pippy. Orca soldiers capture Slippy. Pippy takes Flippy to the kingdom, then flees. Collect the pearl and tide seals, defeat King Orca, free Slippy, and bring him home.

Story choices pause the action until selected. Story checkpoints can be resumed after a reload; after Baby Orca, the fish-feast marker remains available until the next-day choice is completed. The initial tutorial is a friendly wrestling match, not a fight against the parents. Healing foods, puzzles, and random enemies remain game adaptations around the authored scenes.

Regular fights trigger automatically after sufficient walking in unsafe areas; E is not required. Standing still never rolls a battle. Villages, homes, camps, and puzzle areas are safe. Doorways and NPCs have encounter-free approach space. A time and walking-distance cooldown separates fights. Bosses trigger on approach; Slippy’s playful tutorial begins through their story conversation. All four chapters, including the ending, are available. This expanded edition is intended for story, art, controls, and difficulty feedback.

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

The test server uses port 18084. Fourteen browser tests cover all 48 rooms’ connectivity and reachable targets, safe doorway arrivals, switch locks, all eight puzzle solutions and reset/mistake handling, random walking encounters and safe-area/cooldown behavior, four-direction facing, scrolling-camera bounds, unique monster move ownership, the complete book sequence and retained rescue ending, ACT/FLEE rules, attack variation, boss phase escalation, warning versus active hazard damage, inventory, defeat recovery, old-save migration, current save/reload, mobile movement/layout, and asset exposure. Story progression tests accelerate combat turns; they verify progression rather than final difficulty balance.

Manual smoke test: meet Slippy, visit Fishing Bay, choose to climb the iceberg, and confirm the rescue returns Flippy home. Follow the objective through lake play, bedtime, wrestling, and the drifting iceberg. In Book Two, verify Baby Orca comes before boononas. In Pippy’s visit, verify Slippy stays with Flippy until after the fish ambush. Check the original rescue ending still works. Open M for room connections. Use a lantern, reload, and Continue. Optional audio requires a user gesture and Web Audio support.

Hosting and HTTPS certificate management remain Railway settings; changing this game does not retry or fix a custom-domain certificate.
