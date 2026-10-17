# Future Features & Tasks

The backlog for Voxel World. **Only open work lives here** - everything already shipped is archived in
[`docs/COMPLETED_FEATURES.md`](docs/COMPLETED_FEATURES.md) (471 items and counting).

How to use this file (see [`AGENTS.md`](AGENTS.md) for the full workflow):

- Pick from the top sections first: **Bugs** and **Engineering** come before new content.
- One task per PR. Check it off (`[x]`) and move the line to `docs/COMPLETED_FEATURES.md` in the same PR.
- Found a bug while working? Add it under **Bugs** with a reproduction (what you did, what happened, which file).
- Keep entries to one line: `- [ ] **Title**: what it should do. (Notes: where to start / constraints)`.
- Don't add duplicates - search this file first (several items below were listed 2-4 times before cleanup).

## 🐛 Bugs & Defects
Real defects in shipped behaviour. These outrank everything else.

*(No open bugs currently listed)*

## 🛠️ Engineering & Architecture
Structural work that makes every later feature cheaper. Each of these is a single agent-sized PR.

- [ ] **Move item-use logic out of `Game.startAction()`**: the right-click branch is ~600 lines of `if (slot.type === BLOCK.X)`. Introduce an item-use registry (same shape as `BlockInteractions` in `js/interactions.js`) and migrate the handlers one group at a time, with tests.
- [ ] **Move placement rules out of `Game.placeBlock()`**: ~400 lines of per-block placement special cases. Candidate for a `BlockPlacement` registry keyed by block id (orientation, multi-block placement, "can place on" rules).
- [ ] **Per-frame block-entity ticking registry**: `Game.update()` has a growing `if (entity.type === ...)` chain for furnaces/brewing/crops/etc. Register tick handlers by entity type instead.
- [ ] **Convert legacy tests to `tests/helpers/game_env.js`**: ~70 test files each hand-roll a JSDOM and leak globals; they only work because `npm test` isolates files per process. Migrate opportunistically whenever you touch a file, and name test files after the feature (not "batch17").
- [ ] **Hot-loop `window.*` lookups**: renderer/world code reads `window.BLOCKS[...]` inside per-block loops. Cache `BLOCKS`/`BLOCK` in local consts at the top of hot functions (free in browsers, 2x faster under JSDOM).
- [ ] **Block light is computed but never rendered**: `World.setBlock()` runs `recalcLocalLight()` (a 31x31x31 scan) for every gameplay block change, yet `renderer.js` ignores `b.light` (the brightness line is commented out). Either use the light values for shading or make the recalculation incremental; worldgen already skips it (see `_generating` in `js/world.js`).
- [ ] **Parked chunks are memory-only**: edited chunks that scroll out of range are kept in `World.unloadedChunks` (capped at 512, LRU) and included in saves, but a very long session can still evict old edits. Spill evicted chunks to IndexedDB instead of dropping them.
- [ ] **Game.update() scans 31x31x11 blocks every 20 frames at night for Eyeblossoms** (`js/game.js`, "EYEBLOSSOM" particle loop). Track eyeblossom positions when placed/generated instead of polling.
- [ ] **LOD (Level of Detail) system**
- [ ] **Worker threads for world generation**
- [ ] **Better memory management**
- [ ] **Chunk Serialization Optimization**
- [ ] **Refactoring World/Chunk Separation**

## 🎨 Rendering, Lighting & Audio

- [ ] Smooth lighting
- [ ] Custom shaders
- [ ] **Better shadows and lighting** (Dynamic shadows)
- [ ] **Clouds and better skybox**
- [ ] Colored lighting
- [ ] **Dynamic Lighting** (Light emitting items in hand)
- [ ] Music system
- [ ] **Screenshot system**
- [ ] **New Task: Add Sculk Shrieker Sound Vibration Level Meter**: HUD meter tracking current local noise vibration accumulation before Sculk Shrieker activation. (Status: Partially implemented - Sculk Shrieker block exists and triggers Darkness effect on proximity in world.js, but noise vibration accumulation meter UI in ui.js is pending agent implementation)
- [ ] **New Task: Add Ambient Sounds**: Background noises for caves, forests, and oceans.
- [ ] **New Task: Add Snowball Trail Particles**: Throwable snowball projectile trail particle FX.
- [ ] **New Task: Add Armor Trim Smithing Table Visual Rendering**: Render trimmed armor textures on player model when wearing smithing-trimmed armor items. (Status: Proposed feature, pending implementation)
- [ ] **New Task: Add Block Break Particle Color Matching**: Break particles dynamically sampling exact texture/block color hex values rather than default grayscale.
- [ ] **New Task: Add Mob Hitting Flash Shader Effect**: Briefly render mobs with a red tint overlay when taking damage.

## 🧱 World Generation & Structures

- [ ] **New Task: Add End Citadel Structure**: Generate End Citadel towers in the End dimension with End Stone bricks, Purpur blocks, and Shulker spawners.
- [ ] **New Task: Add Eclipse Events**: Special events where the sun is blocked during the day.
- [ ] **New Task: Add Moon Phases**: Moon phases that affect mob spawning.
- [ ] **New Task: Add Dripstone**: Stalactites and stalagmites for cave biomes.
- [ ] **New Task: Add Weeping Vines**: Vines that grow downwards in the Nether.
- [ ] **New Task: Add Trial Chamber Secret Vault Passages**: Hidden redstone trapdoors in Trial Chamber corridors leading to bonus Vault reward rooms. (Status: Proposed feature, pending implementation)
- [ ] **New Task: Add Trial Chamber Map Loot Tables**: Cartographer Villagers trading maps leading directly to Trial Chamber structures. (Status: Proposed feature, pending implementation)
- [ ] **New Task: Add Ocean Monument Structures**: Ocean monuments generating in deep ocean biomes containing Sea Lanterns and Elder Guardians.
- [ ] **New Task: Add Ominous Trials**: Harder version of Trial Chambers.
- [ ] **New Task: Improve Biome Generation**: Make biome transitions smoother and add more variations. (Status: Partially implemented - Biomes generated in biome.js, but smooth noise transitions and biome temperature gradients are pending agent implementation)
- [ ] **New Task: Add End Cities**: Generate End Cities and End Ships in the outer islands of the End dimension with Purpur blocks and Shulker mobs.
- [ ] **New Task: Structures (Dungeons)**: Generate dungeon structures in the overworld.
- [ ] **New Task: Add Chorus Plants**: Plant found in the End.
- [ ] **New Task: Add Cave Vines**: Growing vines in caves that can produce Glow Berries.
- [ ] **New Task: Add Nether Gold Ore**: Gold ore variant found in the Nether that drops gold nuggets.
- [ ] **New Task: Add Volcano Structures**: Natural volcanic landforms that spout lava and spawn magma cubes.
- [ ] **New Task: Add Nether Portals**: Structures made of obsidian that transport players to the Nether dimension.
- [ ] **New Task: Add Trading Posts**: Specialized structures generated in villages to trade items with villagers.
- [ ] **New Task: Add Ominous Trial Vault Key Drop Chance**: Defeating Ominous Spawner wave bosses grants an Ominous Trial Key to unlock high-tier Vault loot. (Status: Proposed feature, pending implementation)
- [ ] **New Task: Add Amethyst Geode Crystal Growth**: Amethyst Clusters gradually growing through 4 growth stages over time in geode structures.
- [ ] **New Task: Add Desert Well Structures**: Small sandstone wells generating in desert biomes containing water sources and suspicious sand.

## 👾 Mobs & Entities

- [ ] **New Task: Add Enderman Mob Block Pick & Teleportation**: Hostile tall mob that picks up blocks and teleports away when looked at by the player or damaged by water. (Status: Partially implemented - Enderman entity exists in mob.js with basic behavior and water teleportation, but block picking up and carrying mechanics in mob.js/world.js are pending agent implementation)
- [ ] Complex AI (Pathfinding, fleeing, attacking)
- [ ] **New Task: Add Wither Boss**: Multi-stage boss mob crafted with Soul Sand and Wither Skeleton Skulls.
- [ ] **New Task: Add Ender Dragon Boss**: Main boss mob in the End dimension with End Crystals healing mechanics.
- [ ] **New Task: Implement Strider Mobs**: Rideable passive mobs in the Nether that walk on lava.
- [ ] **New Task: Add Pandas**: Neutral mobs that eat bamboo in jungles.
- [ ] **New Task: Add Dolphins**: Neutral aquatic mobs in ocean biomes that guide players to treasure and grant Dolphin's Grace.
- [ ] **New Task: Add Ravagers**: Large hostile beasts ridden by Illagers.
- [ ] **New Task: Add Drowned**: Zombie variant that spawns underwater.
- [ ] **New Task: Add Goats**: New mob that rams players and entities.
- [ ] **New Task: Implement Mob Spawning Rules**: Mobs should spawn based on light levels and biome types.
- [ ] **New Task: Implement Parrots**: Add Parrots that can imitate sounds and ride on player shoulders.
- [ ] **New Task: Add Horses**: Rideable mob with different speeds and jump heights.
- [ ] **New Task: Add Villager Professions**: Different skins and trades based on claimed workstations.
- [ ] **New Task: Add Camels**: Desert mounts that can seat two players.
- [ ] **New Task: Add Turtles**: Aquatic mobs that lay eggs on beaches.
- [ ] **New Task: Add Phantoms**: Flying hostile mobs that spawn when players haven't slept for multiple in-game days.
- [ ] **New Task: Add Illusioners**: Spell-casting illagers.
- [ ] **New Task: Add Tadpoles**: Baby version of frogs that grow up into different frogs based on biome.
- [ ] **New Task: Add Vexes**: Flying hostile mobs summoned by Evokers.
- [ ] **New Task: Add Animal Taming and Pet System**: Mechanics for taming, breeding, and commanding domestic pets.
- [ ] **New Task: Add Boss Arenas**: Specific locations for boss fights.
- [ ] **New Task: Add Evokers**: Spell-casting illagers.
- [ ] **New Task: Add Foxes**: Passive mobs found in taigas.
- [ ] **New Task: Add Shulkers**: Hostile mobs in the End that shoot levitation projectiles.
- [ ] **New Task: Add Glow Squid**: Squid variant that drops glow ink sacs.
- [ ] **New Task: Add Allay Mob**: Friendly flying mob that collects dropped items matching the item held in its hand and deposits them near Note Blocks.
- [ ] **New Task: Add Strider Mob Lava Walking Physics**: Rideable Nether mob that walks speed-boosted across lava surfaces and slows down/turns blue on land.

## 🧰 Items, Equipment & Crafting

- [ ] **New Task: Add Wind Charge Enchantment Synergy**: Wind Charge projectiles triggering extra knockback or fire damage when launched using enchanted bows or crossbows.
- [ ] **New Task: Implement Tridents with Enchantments**: Add Loyalty, Channeling, and Riptide enchantments.
- [ ] **Map item**
- [ ] **Shulker Boxes**
- [ ] **New Task: Add Beacons**: Blocks that grant buffs to nearby players when placed on a pyramid.
- [ ] **New Task: Add Banners**: Decorative blocks with customizable patterns.
- [ ] **New Task: Add Pale Garden Eyeblossom Suspicious Stew Nausea Effect**: Crafting Eyeblossom stew granting short-duration Nausea status effect alongside Poison. (Status: Proposed feature, pending implementation)
- [ ] **New Task: Add Creaking Heart Resin Yield Multiplier**: Mined Creaking Hearts near active Pale Garden canopy trees yield boosted Resin Clumps and Resin Bricks. (Status: Proposed feature, pending implementation)
- [ ] **New Task: Add Potion Brewing Recipes**: Add recipes for brewing potions in the Brewing Stand.
- [ ] **New Task: Add Name Tags**: Item to name mobs to prevent despawning.
- [ ] **New Task: Add Paraglider Equipment**: Early-game aerial glider equipment before obtaining Elytra.
- [ ] **New Task: Add Hanging Signs**: Signs that hang from underneath blocks.
- [ ] **New Task: Add Candles**: Decorative light source that can be dyed.
- [ ] **New Task: Add Tool Icons**: Add icons for different tool types.
- [ ] **New Task: Add Enderite**: A new tier of gear found in the End dimension.
- [ ] **New Task: Add Backpacks**: Equipable items that expand player inventory space.
- [ ] **New Task: Add Grappling Hooks**: Tool to quickly traverse vertical terrain and pull entities.
- [ ] **New Task: Add Tents**: Placeable sleeping spots that don't set spawn points but allow skipping night.
- [ ] **New Task: Add Paintbrushes**: Items used to paint blocks different colors.
- [ ] **New Task: Add Netherite Armor**: Higher tier armor that resists fire.
- [ ] **New Task: Add Spyglass Zoom Mechanic**: Equippable/useable Spyglass item that narrows camera field of view for distant scouting.
- [ ] **New Task: Add Recovery Compass**: Compass variant pointing to the player's last death position.

## 🔌 Redstone, Mechanics & Functional Blocks

- [ ] **New Task: Add Apiaries**: Crafted blocks where bees live and produce honey.
- [ ] **New Task: Add Command Blocks**: Blocks that can execute server/world commands when powered by redstone.
- [ ] **New Task: Add Copper Golem Mob & Copper Button Interactivity**: A friendly construct mob crafted from copper blocks that randomly interacts with copper buttons and oxidizes into a statue over time. (Status: Proposed feature, pending implementation)
- [ ] **New Task: Add Waystones**: Blocks that allow players to teleport between them when activated.
- [ ] **New Task: Add Structure Blocks**: Technical blocks for saving and loading structures.
- [ ] **New Task: Add Jigsaw Blocks**: Technical blocks used for generating complex structures like villages.
- [ ] **New Task: Add Water Wheels and Windmills**: Multiblock mechanical power generators using environmental water flow and wind.
- [ ] **New Task: Add Crafter Block Automatic Crafting Cycle**: Redstone-pulsed Crafter assembling items from its 3x3 internal grid and dispensing the crafted result into adjacent containers.
- [ ] **New Task: Add Redstone Comparator Container Signal Scaling**: Comparators outputting signal strength (1-15) based on percentage fullness of adjacent containers (Chests, Furnaces, Hoppers, Crafters).

## 🖥️ UI, Multiplayer & Meta

- [ ] **Share world links**
- [ ] **Leaderboards**
- [ ] **World showcase gallery**
- [ ] Entity synchronization
- [ ] Inventory synchronization
- [ ] **Friends system**
- [ ] **New Task: Add Block Dragging**: Allow players to drag and select multiple blocks in creative.
- [ ] **New Task: Add Dynamic Quest System**: Questgiver NPC dialogue, quest tracking, and task completion rewards.
- [ ] **New Task: Add Magic Spells**: Allow players to cast spells using wands.
- [ ] Statistics
- [ ] **New Task: Add In-Game Keybind Remapping UI**: Settings screen menu allowing players to customize keybindings for movement, inventory, and hotbar controls.
- [ ] **New Task: Add Subtitles Display for Audio Events**: On-screen subtitle indicators showing direction and sound type for nearby mob footsteps, block breaks, and redstone triggers.

## 🧩 Modding & Plugin API
The in-game plugin surface today: `window.PluginAPI` (events, `registerBlock`) and `BlockInteractions.register()` for right-click behaviour.

- [ ] Custom block registration
- [ ] Custom item registration
- [ ] Event hooks
- [ ] Custom commands
- [ ] **Resource pack support**
- [ ] **Support for custom models**
