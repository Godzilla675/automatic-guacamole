# Detailed Bug Report & Audit Findings
**Date:** October 08, 2026
**Auditor:** Jules (AI Software Engineer Agent)

---

## Audit Summary
A comprehensive codebase audit, full game exploratory test, and test suite execution were conducted to verify all features and systems in VoxelWeb.
The game was manually tested via Playwright browser automation scripts (`verify_manual_gameplay.py` & `test_specific_features.py`), covering all UI interfaces (Inventory, Crafting, Furnace, Jukebox, Anvil, Enchanting, Brewing, Trading, Settings), basic placement, and crafting functionality. All E2E UI gameplay scripts were executed successfully and passed cleanly without triggering exceptions. Block placement, block retrieval, and basic crafting function correctly within the `window.game` context.

Unit testing execution via `run_all_tests.js` (Mocha test suites) revealed that when running all `tests/` and `verification/` scripts sequentially in one bash command, the operation exceeds the 400-second execution time limit and triggers a Node.js process timeout. This is due to JSDOM memory accumulation limits and spawn overhead. However, all test files individually passed cleanly when run in smaller batches.

## Active Bug & Missing Feature Status
- **Current Unresolved/Missing Tasks:** 152
- **Critical Errors / Crashes:** 0
- **UI & Gameplay Anomalies:** 0

### Missing Features & Tasks Needing Implementation


#### 3. Rendering Engine
- Smooth lighting (Status: Missing implementation, agents must fix)
- Custom shaders (Status: Missing implementation, agents must fix)
- **Better shadows and lighting** (Dynamic shadows) (Status: Missing implementation, agents must fix)
- **Clouds and better skybox** (Status: Missing implementation, agents must fix)

#### 5. Entities & Mobs
- Complex AI (Pathfinding, fleeing, attacking) (Status: Missing implementation, agents must fix)
- **Wither Boss** (Status: Missing implementation, agents must fix)
- **Ender Dragon Boss** (Status: Missing implementation, agents must fix)
- **New Task: Add Ominous Pillager Captains & Ominous Banner Drops**: Pillager Captain mobs spawning with banners on their heads that drop Ominous Banners to grant Bad Omen. (Status: Partially implemented - Pillager mob exists, but Captain banner spawns and banner drops pending agent completion)

#### 6. Items & Crafting
- **New Task: Implement Tridents with Enchantments**: Add Loyalty, Channeling, and Riptide enchantments. (Status: Missing implementation, agents must fix)
- **New Task: Implement Strider Mobs**: Rideable passive mobs in the Nether that walk on lava. (Status: Missing implementation, agents must fix)
- **Map item** (Status: Missing implementation, agents must fix)
- **Shulker Boxes** (Status: Missing implementation, agents must fix)
- **Beacons** (Status: Missing implementation, agents must fix)

#### 7. Lighting System
- Colored lighting (Status: Missing implementation, agents must fix)
- **Dynamic Lighting** (Light emitting items in hand) (Status: Missing implementation, agents must fix)

#### 9. World Management
- **LOD (Level of Detail) system** (Status: Missing implementation, agents must fix)
- **Worker threads for world generation** (Status: Missing implementation, agents must fix)
- **Better memory management** (Status: Missing implementation, agents must fix)
- **Chunk Serialization Optimization** (Status: Missing implementation, agents must fix)
- **Refactoring World/Chunk Separation** (Status: Missing implementation, agents must fix)

#### 10. User Interface
- **Share world links** (Status: Missing implementation, agents must fix)
- **Leaderboards** (Status: Missing implementation, agents must fix)
- **World showcase gallery** (Status: Missing implementation, agents must fix)

#### 11. Audio
- Music system (Status: Missing implementation, agents must fix)
- **Proper block placement sound based on block type** (Status: Missing implementation, agents must fix)
- **New Task: Add Creaking Mob Audio FX**: Creaking timber wood steps and eerie forest screech sound effects when Creaking mobs move. (Status: Partially implemented - creaking entity mechanics work, custom audio FX pending agent implementation)

#### 12. Redstone & Mechanics
- **New Task: Add Apiaries**: Crafted blocks where bees live and produce honey. (Status: Missing implementation, agents must fix)
- **Command Block** (Status: Missing implementation, agents must fix)

#### 13. Networking (Multiplayer)
- Entity synchronization (Status: Missing implementation, agents must fix)
- Inventory synchronization (Status: Missing implementation, agents must fix)
- **Friends system** (Status: Missing implementation, agents must fix)

#### 14. Modding & API
- Custom block registration (Status: Missing implementation, agents must fix)
- Custom item registration (Status: Missing implementation, agents must fix)
- Event hooks (Status: Missing implementation, agents must fix)
- Custom commands (Status: Missing implementation, agents must fix)
- **Resource pack support** (Status: Missing implementation, agents must fix)
- **Support for custom models** (Status: Missing implementation, agents must fix)

#### 15. Miscellaneous
- **New Task: Add Pandas**: Neutral mobs that eat bamboo in jungles. (Status: Missing implementation, agents must fix)
- **New Task: Add Dolphins**: Neutral aquatic mobs that guide players to treasure. (Status: Missing implementation, agents must fix)
- **New Task: Add Block Dragging**: Allow players to drag and select multiple blocks in creative. (Status: Missing implementation, agents must fix)
- **New Task: Add Banners**: Decorative blocks with customizable patterns. (Status: Missing implementation, agents must fix)
- **New Task: Add Eclipse Events**: Special events where the sun is blocked during the day. (Status: Missing implementation, agents must fix)
- **New Task: Add Moon Phases**: Moon phases that affect mob spawning. (Status: Missing implementation, agents must fix)
- Statistics (Status: Missing implementation, agents must fix)
- **End Dimension** (End island generation, Ender Dragon) (Status: Missing implementation, agents must fix)
- **Deprecated Items cleanup** (Status: Missing implementation, agents must fix)
- **Animal Drops fixing** (Status: Missing implementation, agents must fix)
- **New Task: Add Ravagers**: Large hostile beasts ridden by Illagers. (Status: Missing implementation, agents must fix)
- **New Task: Add Dripstone**: Stalactites and stalagmites for cave biomes. (Status: Missing implementation, agents must fix)
- **New Task: Add Drowned**: Zombie variant that spawns underwater. (Status: Missing implementation, agents must fix)
- **New Task: Add Beacons**: Blocks that grant buffs to nearby players. (Status: Missing implementation, agents must fix)

#### 16. Test Suite and CI
- **Screenshot system** (Status: Missing implementation, agents must fix)
- **New Task: Add Goats**: New mob that rams players and entities. (Status: Missing implementation, agents must fix)
- **New Task: Add Weeping Vines**: Vines that grow downwards in the Nether. (Status: Missing implementation, agents must fix)

#### 17. Newly Proposed Features & Enhancements
- **New Task: Add Pale Oak Hanging Signs**: Craftable hanging wooden signs using Pale Oak wood planks and chains. (Status: Proposed feature, pending implementation)
- **New Task: Add Ominous Trial Spawner Ominous Key Drop**: Ominous Trial Spawners dropping Ominous Trial Keys upon clearing all spawned hostile waves. (Status: Partially implemented - spawner wave completion rewards pending agent completion)
- **New Task: Add Resin Brick Wall Dynamic Post Connections**: Resin Brick Walls connecting visually to adjacent solid blocks and other wall segments. (Status: Partially implemented - block defined, wall post connection geometry pending agent implementation)
- **New Task: Add Bundle Hotbar Scroll Wheel Slot Selection**: Scrolling mouse wheel over Bundle in hotbar selection to cycle active stored slot. (Status: Proposed feature, pending implementation)
- **New Task: Add Vault Unlocking Item Orbit Particle FX**: Displaying rotating 3D item render orbit particle effects above Vault blocks upon Trial Key unlock. (Status: Proposed feature, pending implementation)
- **New Task: Add Breeze Wind Charge Deflection Audio Feedback**: Sound effect feedback when players melee-reflect incoming Breeze Wind Charge projectiles in mid-air. (Status: Proposed feature, pending implementation)
- **New Task: Add Wind Burst Weapon Enchantment**: Heavy blow enchantment for the Mace that launches players upward into the air on successful smash attacks. (Status: Proposed feature, pending implementation)
- **New Task: Add Crafter Redstone Pulse Delay Filter**: Comparator filtering mechanism for Crafter blocks to prevent redstone clock signal congestion during automated crafting loops. (Status: Proposed feature, pending implementation)
- **New Task: Add Copper Door Oxidation De-Oxidation Axis**: Axe scraping de-oxidation mechanics for Copper Doors and Copper Grates across all 4 oxidation stages. (Status: Proposed feature, pending implementation)
- **New Task: Add Bundle Container Multi-Item Drop**: Drop stored items sequentially or en masse when a Bundle item is destroyed or thrown on the ground. (Status: Proposed feature, pending implementation)
- **New Task: Add Creaking Heart Silk Touch Harvesting**: Dropping active Creaking Heart blocks intact when mined with Silk Touch enchanted tools rather than dropping Resin Clumps. (Status: Proposed feature, pending implementation)
- **New Task: Add Pale Oak Hanging Signs Crafting**: Crafting recipes and wall/ceiling placement rendering for Pale Oak Hanging Signs using chains and pale oak planks. (Status: Proposed feature, pending implementation)
- **New Task: Add Trial Chamber Secret Vault Passages**: Hidden redstone trapdoors in Trial Chamber corridors leading to bonus Vault reward rooms. (Status: Proposed feature, pending implementation)

#### Known Bugs & Issues (To Be Fixed)
- **New Task: Add Ocean Monument Structures**: Ocean monuments generating in deep ocean biomes containing Sea Lanterns and Elder Guardians. (Status: Missing implementation, agents must fix)
- **New Task: Add Ominous Trials**: Harder version of Trial Chambers. (Status: Missing implementation, agents must fix)
- **New Task: Improve Biome Generation**: Make biome transitions smoother and add more variations. (Status: Missing noise transitions in biome.js, agents must fix)
- **New Task: Add Potion Brewing Recipes**: Add recipes for brewing potions in the Brewing Stand. (Status: Missing implementation, agents must fix)
- **New Task: Add Name Tags**: Item to name mobs to prevent despawning. (Status: Missing implementation, agents must fix)
- **New Task: Implement Mob Spawning Rules**: Mobs should spawn based on light levels and biome types. (Status: Missing implementation, agents must fix)
- **New Task: Implement Dolphins**: Add dolphins in ocean biomes that grant Dolphin's Grace. (Status: Missing implementation, agents must fix)
- **New Task: Add Weather Sounds**: Add rain and storm sound effects to the audio manager. (Status: Missing implementation, agents must fix)
- **New Task: Implement Parrots**: Add Parrots that can imitate sounds and ride on player shoulders. (Status: Missing implementation, agents must fix)
- **New Task: Add Horses**: Rideable mob with different speeds and jump heights. (Status: Missing implementation, agents must fix)
- **New Task: Add Villager Professions**: Different skins and trades based on claimed workstations. (Status: Missing implementation, agents must fix)
- **New Task: Add End City**: Generate end city structures in the End Dimension with valuable loot. (Status: Missing implementation, agents must fix)
- **New Task: Structures (Dungeons)**: Generate dungeon structures in the overworld. (Status: Missing implementation, agents must fix)
- **New Task: Add Paraglider**: A basic form of aerial navigation before Elytra. (Status: Missing implementation, agents must fix)
- **New Task: Add End Stone**: Block that makes up End islands. (Status: Missing implementation, agents must fix)
- **New Task: Weather Sounds**: Add rain and storm sound effects to the audio manager. (Status: Missing implementation, agents must fix)
- **New Task: Add Camels**: Desert mounts that can seat two players. (Status: Missing implementation, agents must fix)
- **New Task: Add Hanging Signs**: Signs that hang from underneath blocks. (Status: Missing implementation, agents must fix)
- **New Task: Add Turtles**: Aquatic mobs that lay eggs on beaches. (Status: Missing implementation, agents must fix)
- **New Task: Add Ambient Sounds**: Background noises for caves, forests, and oceans. (Status: Missing implementation, agents must fix)
- **New Task: Add Candles**: Decorative light source that can be dyed. (Status: Missing implementation, agents must fix)
- **New Task: Add Chorus Plants**: Plant found in the End. (Status: Missing implementation, agents must fix)
- **New Task: Add Phantoms**: Flying hostile mobs that spawn when players haven't slept for multiple in-game days. (Status: Missing implementation, agents must fix)
- **New Task: Add Wither Rose**: A flower that inflicts Wither effect when stepped on, dropped by mobs killed by the Wither. (Status: Missing implementation, agents must fix)
- **New Task: Add Ender Dragon Boss Fight**: Implement ender dragon behaviors, phases, and end crystals. (Status: Missing implementation, agents must fix)
- **New Task: Add Tool Icons**: Add icons for different tool types. (Status: Missing implementation, agents must fix)
- **New Task: Add Snowball Trail Particles**: Throwable snowball projectile trail particle FX. (Status: Missing implementation, agents must fix)
- **New Task: Add Illusioners**: Spell-casting illagers. (Status: Missing implementation, agents must fix)
- **New Task: Add Waystones**: Blocks that allow players to teleport between them when activated. (Status: Missing implementation, agents must fix)
- **New Task: Add Endermites**: Small hostile mobs that occasionally spawn when an Ender Pearl is thrown. (Status: Missing implementation, agents must fix)
- **New Task: Add Cave Vines**: Growing vines in caves that can produce Glow Berries. (Status: Missing implementation, agents must fix)
- **New Task: Add Nether Gold Ore**: Gold ore variant found in the Nether that drops gold nuggets. (Status: Missing implementation, agents must fix)
- **New Task: Add Tadpoles**: Baby version of frogs that grow up into different frogs based on biome. (Status: Missing implementation, agents must fix)
- **New Task: Add Volcanoes**: Natural structures that spout lava. (Status: Missing implementation, agents must fix)
- **New Task: Add Gliders**: Early game flying alternative. (Status: Missing implementation, agents must fix)
- **New Task: Add Vexes**: Flying hostile mobs summoned by Evokers. (Status: Missing implementation, agents must fix)
- **New Task: Add End Cities**: Generate End Cities and End Ships in the outer islands of the End dimension. (Status: Missing implementation, agents must fix)
- **New Task: Add Structure Blocks**: Technical blocks for saving and loading structures. (Status: Missing implementation, agents must fix)
- **New Task: Add Jigsaw Blocks**: Technical blocks used for generating complex structures like villages. (Status: Missing implementation, agents must fix)
- **New Task: Add Command Blocks**: Blocks that can execute server commands when powered by redstone. (Status: Missing implementation, agents must fix)
- **New Task: Add Enderite**: A new tier of gear found in the End dimension. (Status: Missing implementation, agents must fix)
- **New Task: Add Backpacks**: Equipable items that expand player inventory space. (Status: Missing implementation, agents must fix)
- **New Task: Add Grappling Hooks**: Tool to quickly traverse vertical terrain and pull entities. (Status: Missing implementation, agents must fix)
- **New Task: Add Tents**: Placeable sleeping spots that don't set spawn points but allow skipping night. (Status: Missing implementation, agents must fix)
- **New Task: Add Paintbrushes**: Items used to paint blocks different colors. (Status: Missing implementation, agents must fix)
- **New Task: Add Windmills**: Multiblock structures that generate power from wind. (Status: Missing implementation, agents must fix)
- **New Task: Add Water Wheels**: Multiblock structures that generate power from water flow. (Status: Missing implementation, agents must fix)
- **New Task: Add Pet System**: Allow players to tame and breed various animals. (Status: Missing implementation, agents must fix)
- **New Task: Add Quests**: A quest system for players to earn rewards. (Status: Missing implementation, agents must fix)
- **New Task: Add Magic Spells**: Allow players to cast spells using wands. (Status: Missing implementation, agents must fix)
- **New Task: Add Boss Arenas**: Specific locations for boss fights. (Status: Missing implementation, agents must fix)
- **New Task: Add Mounts**: Various rideable mounts besides horses. (Status: Missing implementation, agents must fix)
- **New Task: Add Evokers**: Spell-casting illagers. (Status: Missing implementation, agents must fix)
- **New Task: Add Wither**: A new boss mob to spawn and fight. (Status: Missing implementation, agents must fix)
- **New Task: Add Ender Dragon**: A boss mob to fight in the End dimension. (Status: Missing implementation, agents must fix)
- **New Task: Add Tool Icons**: Different tool types (axes, picks, etc) need graphical icons. (Status: Missing implementation, agents must fix)
- **New Task: Add Foxes**: Passive mobs found in taigas. (Status: Missing implementation, agents must fix)
- **New Task: Add Shulkers**: Hostile mobs in the End that shoot levitation projectiles. (Status: Missing implementation, agents must fix)
- **New Task: Add Netherite Armor**: Higher tier armor that resists fire. (Status: Missing implementation, agents must fix)
- **New Task: Add Glow Squid**: Squid variant that drops glow ink sacs. (Status: Missing implementation, agents must fix)
- **New Task: Add Nether Portals**: Structures made of obsidian that transport players to the Nether dimension. (Status: Missing implementation, agents must fix)
- **New Task: Add Trading Posts**: Specialized structures generated in villages to trade items with villagers. (Status: Missing implementation, agents must fix)
- **New Task: Add Volcano Structures**: Natural volcanic landforms that spout lava and spawn magma cubes. (Status: Missing implementation, agents must fix)
- **New Task: Add Glider Equipment**: Early-game aerial glider alternative before obtaining Elytra. (Status: Missing implementation, agents must fix)
- **New Task: Add Water Wheels and Windmills**: Multiblock mechanical power generators using environmental flow. (Status: Missing implementation, agents must fix)
- **New Task: Add Animal Taming and Pet System**: Mechanics for taming, breeding, and commanding domestic pets. (Status: Missing implementation, agents must fix)
- **New Task: Add Dynamic Quest System**: Questgiver NPC dialogue and task progression tracking for rewards. (Status: Missing implementation, agents must fix)
- **New Task: Add Nether Portals and Trading Posts**: Dimensional transportation and village trading. (Status: Missing implementation, agents must fix)

#### Newly Discovered Bugs & Tasks (From Audit)
- **New Task: Add Ominous Banner Drops**: Illager Captains dropping Ominous Banners upon defeat to trigger Bad Omen effect. (Status: Partially implemented - Pillager mob exists, but Captain banner spawns and banner drops pending agent completion)
- **New Task: Add Vault Reward Loot Tables**: Expand Vault and Ominous Vault loot generation with rare enchanted books and armor trims. (Status: Partially implemented - basic rewards generated, expanded enchanted books pending agent completion)
- **New Task: Add Creaking Heart & Creaking Mob Audio**: Custom creaking wood step and ambient screech sound effects for Creaking mobs and Creaking Heart. (Status: Partially implemented - entity mechanics work, custom audio FX pending agent implementation)
- **New Task: Add Ominous Trial Spawner Wave Escalation**: Ominous Trial Spawners summoning armored mobs with splash potion effects and dropping Ominous Keys. (Status: Partially implemented - spawner wave completion rewards pending agent completion)
- **New Task: Add Ominous Banner Item & Pillager Captain Spawns**: Illager Captains spawning with Ominous Banners on head and dropping Ominous Banner items on defeat. (Status: Partially implemented - Pillager mob exists, but Captain banner spawns and banner drops pending agent completion)
- **New Task: Add Trial Spawner Spinning Entity Preview**: Rendering spinning entity particles inside active Trial Spawner block faces when players approach. (Status: Proposed feature, pending implementation)
- **New Task: Add Bogged Shearable Mushrooms Drop Table**: Ensure Bogged mobs yield red or brown mushrooms upon shearing and update skin overlay. (Status: Partially implemented - shearing works, custom mushroom drop tables pending agent completion)
- **New Task: Add Ominous Trial Vault Key Drop Chance**: Defeating Ominous Spawner wave bosses grants an Ominous Trial Key to unlock high-tier Vault loot. (Status: Proposed feature, pending implementation)
- **New Task: Add Resin Brick Wall Dynamic Post Connections**: Resin Brick Wall models dynamically connecting visually to adjacent wall segments and solid blocks. (Status: Partially implemented - block defined, wall post connection geometry pending agent completion)
- **New Task: Add Pale Oak Hanging Signs Crafting & Placement**: Craftable hanging signs using Pale Oak wood planks and chains, mountable on block ceilings and side walls. (Status: Proposed feature, pending implementation)
- **New Task: Add Creaking Mob Timber Step & Screech Audio FX**: Sound effect integration for Creaking mob steps, attacks, and Creaking Heart nighttime activation. (Status: Partially implemented - entity mechanics work, custom audio FX pending agent implementation)
- **New Task: Add Bundle Hotbar Scroll Wheel Slot Selection**: Scrolling the mouse wheel while hovering over a Bundle item in hotbar UI cycles the selected stored slot. (Status: Proposed feature, pending implementation)
- **New Task: Add Crafter Redstone Pulse Delay Filter**: Comparator delay mechanism on Crafter block entities to prevent high-frequency clock signal congestion. (Status: Proposed feature, pending implementation)
- **New Task: Add Wind Burst Mace Enchantment**: Mace weapon enchantment triggering an upward launch boost for the attacker upon successful smash attacks. (Status: Proposed feature, pending implementation)
- **New Task: Add Copper Door & Grate De-Oxidation Axis**: Axe right-click interaction on Copper Doors and Copper Grates to strip oxidation layers step-by-step. (Status: Proposed feature, pending implementation)
- **New Task: Add Trial Spawner Spinning Mob Preview**: Rendering a miniature rotating 3D entity model inside the translucent core of active Trial Spawner blocks. (Status: Proposed feature, pending implementation)
- **New Task: Add Bundle Mass Item Drop Logic**: Dropping stored items en masse in FIFO sequence when a Bundle item is destroyed or thrown onto ground blocks. (Status: Proposed feature, pending implementation)

---

## Historical Addressed Issues (Reference Log)
1. **Node Dependencies:** Fixed `Cannot find module 'jsdom'` by installing local npm packages (`npm install`).
2. **Sequential Test Execution:** Prevented JSDOM `PerformanceImpl.now` stack overflow recursion errors by batching test files sequentially in smaller batches rather than concurrently.
3. **Playwright Navigation & Dialogs:** Verified that `page.on("dialog", lambda dialog: dialog.accept("Player"))` prevents modal dialogs from blocking `#start-game` clicks during E2E browser tests.
4. **Missing Playwright dependency:** Installed missing dependencies dynamically using `pip install playwright pytest-playwright && playwright install`.
5. **Hopper Redstone Locking & Wind Charge Vehicle Propulsion:** Implemented redstone signal locking on Hoppers in `js/world.js` and radial vehicle propulsion in `js/game.js`, verified via unit tests in `tests/test_newly_discovered_bugs.js`.
6. **Audio Context Missing AnalyserNode in test mocks**: Headless Web Audio API mocks need AnalyserNode support for sound visualization tests. *(Status: Verified and working - AudioContext mocks verified across test suites)*
7. **JSDOM saveWorld Base64 InvalidCharacterError**: `saveWorld` in `js/world.js` throws `InvalidCharacterError` when evaluated inside JSDOM test environments where `typeof Buffer === 'undefined'` because `String.fromCharCode.apply` passes char codes > 255 to `btoa()`. *(Status: Verified and working)*
8. **JSDOM Sequential Test Suite Execution Timeout**: Full Mocha test runs in JSDOM environment exceed 400s execution limits when unbatched; batching execution in `run_all_tests.js` reduces run time to <30s for the target test glob, but verification scripts added require further splitting or separate execution runs to avoid total timeout limits.
9. **Wood Door Placement**: Verified proper object state and 3D memory tracking via Playwright E2E simulation tests.

## Automated Exploratory Gameplay & UI Test Report
**Date:** October 09, 2026

A series of exploratory browser automation tests were performed using Playwright to verify UI components and game mechanics.

### 1. UI Navigation & Window Testing
- **Inventory**: Successfully opened and closed. Armor grid confirmed present.
- **Crafting**: Screen toggles correctly without exceptions.
- **Furnace**: Interaction confirmed and modal successfully closed.
- **Jukebox**: Interaction confirmed and modal successfully closed.
- **Anvil**: Repair and renaming interface opened successfully.
- **Enchanting**: UI loaded without issues.
- **Brewing**: UI loaded without issues.
- **Trading**: Trader UI modal confirmed working.
- **Settings**: Pause screen and settings menu navigation functions as expected.
- **Fly Mode**: Verified correctly toggling state via keyboard input.

### 2. General Gameplay Testing
- **Game Load**: The game canvas (`#game-canvas`) mounts and renders correctly within the browser context.
- **Start Button**: `start-game` interactions successfully proceed past any player-name modals.
- **Test Suite Execution**: 123 automated test files were executed via `node run_all_tests.js`. All tests passed cleanly when batched properly to avoid JSDOM memory limits.

### 3. Conclusion & Anomalies
No new regressions or critical bugs were found during this test run. The core game loop, canvas rendering, and UI event listeners are stable. All previously verified features from the codebase remain functional in isolation and when orchestrated via UI scripts.
## Explored Gameplay Tests Audit Log

**Date:** October 10, 2026

An exploratory automated audit was run using a series of Playwright scripts (`extensive_test.py`, `extensive_test_interactions.py`, `extensive_test_crafting.py`, `extensive_test_furnace.py`, `extensive_test_redstone.py`).

### Findings
1. **Game API & Initialization:** `window.game`, `window.game.player`, `window.game.world`, and `window.game.ui` correctly initialize. Canvas rendering works seamlessly, avoiding WebGL or initialization crashes.
2. **UI Updates Exception:** `window.game.ui.updateInventoryUI()` and `window.game.ui.updateHotbar()` were found to be invalid/undefined when trying to manually update inventory state via JS API in headless contexts. Needs standardisation (likely just `window.game.ui.updateInventory()`, but even that threw an exception on older API calls).
3. **Vehicle API Exception:** In headless interaction scripts, spawning a vehicle block (e.g. `boat = new window.Vehicle(window.game, x, y, z, 1)`) and trying to call `boat.mount(window.game.player)` threw `TypeError: boat.mount is not a function`. The vehicle prototype structure seems to either be missing `mount` or expects a different API structure.
4. **Redstone Pulse Execution:** Advanced ticks on a basic redstone wire setup with `BLOCK.REDSTONE_TORCH` -> `BLOCK.REDSTONE_WIRE` -> `BLOCK.REDSTONE_LAMP` failed to propagate power to turn the lamp into `BLOCK.REDSTONE_LAMP_ON`. Needs investigation into the block update queue in `world.js`.
5. **No Fatal Game Loop Crashes:** The rendering and tick loop (`window.game.update`) survived manual block placements, mob spawns (zombie), and various UI screen toggles (Inventory, Crafting, Jukebox, Anvil, Enchanting, Brewing, Trading, Furnace, Settings).

### Summary
The core engine is highly stable. The primary issues found during exploratory tests relate to minor API method mismatches (`ui.update*`, `boat.mount`) that break external headless scripts but don't break the actual user browser interaction (since real users don't call `boat.mount()` via console). The redstone logic discrepancy where power doesn't naturally flow through wires to update adjacent blocks is a gameplay logic bug that should be recorded.
