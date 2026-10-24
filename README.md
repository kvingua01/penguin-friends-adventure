# Penguin Friends Adventure

A first playable, single-player browser RPG with an original four-chapter story adaptation, canvas pixel art, and optional synthesized audio. Built with Node.js and Express; no build step, external asset service, credentials, or database required.

## Run locally or on Railway

Use Node.js 22 or newer:

```sh
npm ci
npm start
```

The server binds `0.0.0.0` on `process.env.PORT || 8080`. Railway's start command is `npm start`; set domain target ports to the actual application port. `/health` returns `{"status":"ok"}`. The root `index.html` loads the explicitly served `/game.js` and `/style.css`; there is no public folder. Other repository files are not exposed.

## Play

- WASD / arrow keys, or the on-screen direction pad: move.
- E / Space / INTERACT: talk, inspect objects, advance dialogue, or stop the strike marker.
- I / Bag: healing inventory. Escape / Menu: pause, instructions, assist mode, and saving.
- FIGHT: stop the marker near the center for a strong hit, then move the heart to dodge for approximately six seconds.
- ITEM: consume food and take an enemy attack turn.
- FLEE: locked until 28% of the enemy's original health has been dealt as damage. Major bosses cannot be fled from, except the parents.
- ACT appears only in the parents' tutorial. Two conversations unlock FLEE without dealing damage. There is no MERCY action.
- Sound starts off; its button enables the original generated melody and effects.
- Assist mode reduces projectile speed, increases heart speed, and reduces damage without changing the story.

Rest lanterns restore full health, save the game, and provide one fish if the entire inventory is empty. Chests and battle rewards supply additional food. Defeat returns you to the exploration checkpoint before that battle, restores consumed supplies and health, and guarantees at least two fish.

Saves use this browser's local storage on the current website origin. They do not transfer between browsers, devices, the Railway URL, and the custom domain. Clearing site data removes the save. Only exploration state is saved; reloading during combat resumes the previous exploration checkpoint.

## Story route

1. **Frostbell Island:** meet Slippy, challenge the parents (ACT or FIGHT, then FLEE or win), and leave by the eastern dock.
2. **Boonona Bay:** gather fruit at three groves, defeat Baby Orca, and follow the eastern current.
3. **Quiet Cove / Sea Gate:** Slippy is captured. Ask Pippy for help, sail to the gate, defeat Captain Undertow, and enter the kingdom.
4. **Tidal Halls / Throne Room:** defeat the Pearl and Tide wardens, use both seals to enter the throne room, defeat King Orca, and free Slippy from the cage for the ending.

Enemies are visible encounters: approach and interact to fight. Victory or a successful escape clears that encounter from the save. All four chapters, including the ending, are available. This is a compact first playable version intended for story, art, controls, and difficulty feedback, not a final polished release.

## Validation

Browser validation covers story progression through the ending, timing attacks, heart movement, projectile damage, healing turns, parent ACT/FLEE, normal escape thresholds, boss escape restrictions, saved-game restoration, defeat recovery, target reachability, and mobile overflow. Progression tests accelerate attack phases and supply test healing; they do not establish final difficulty balance.

Manual smoke test: start a new adventure, talk to Slippy, use ACT twice in the parents' battle, dodge each attack, then FLEE and reach Boonona Bay. Use the rest lantern, reload, and Continue. On a touch device, check the direction pad, dialogue advancement, STRIKE button, and item menu. Optional audio requires a user gesture and browser Web Audio support.

Hosting and HTTPS certificate management remain Railway settings; changing this game does not retry or fix a custom-domain certificate.
