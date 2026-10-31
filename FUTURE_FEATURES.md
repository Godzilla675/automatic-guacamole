# Future Features & Tasks

The backlog for Voxel World. **Only open work lives here** - everything already shipped is archived in
[`docs/COMPLETED_FEATURES.md`](docs/COMPLETED_FEATURES.md) (487 items and counting).

How to use this file (see [`AGENTS.md`](AGENTS.md) for the full workflow):

- Pick from the top sections first: **Bugs** and **Engineering** come before new content.
- One task per PR. Check it off (`[x]`) and move the line to `docs/COMPLETED_FEATURES.md` in the same PR.
- Found a bug while working? Add it under **Bugs** with a reproduction (what you did, what happened, which file).
- Keep entries to one line: `- [ ] **Title**: what it should do. (Notes: where to start / constraints)`.
- Don't add duplicates - search this file first (several items below were listed 2-4 times before cleanup).

## 🐛 Bugs & Defects
Real defects in shipped behaviour. These outrank everything else.



## 🛠️ Engineering & Architecture
Structural work that makes every later feature cheaper. Each of these is a single agent-sized PR.

- [ ] **Move placement rules out of `Game.placeBlock()`**: ~400 lines of per-block placement special cases. Candidate for a `BlockPlacement` registry keyed by block id (orientation, multi-block placement, "can place on" rules).
- [ ] **Per-frame block-entity ticking registry**: `Game.update()` has a growing `if (entity.type === ...)` chain for furnaces/brewing/crops/etc. Register tick handlers by entity type instead.
- [ ] **Convert legacy tests to `tests/helpers/game_env.js`**: ~70 test files each hand-roll a JSDOM and leak globals; they only work because `npm test` isolates files per process. Migrate opportunistically whenever you touch a file, and name test files after the feature (not "batch17").
- [ ] **Parked chunks are memory-only**: edited chunks that scroll out of range are kept in `World.unloadedChunks` (capped at 512, LRU) and included in saves, but a very long session can still evict old edits. Spill evicted chunks to IndexedDB instead of dropping them.
- [ ] **LOD (Level of Detail) system**
- [ ] **Worker threads for world generation**
- [ ] **Better memory management**
- [ ] **Chunk Serialization Optimization**
- [ ] **Refactoring World/Chunk Separation**
- [ ] **New Task: Add Spatial Partitioning for Entity Collisions**: Optimize entity-to-entity collision detection in `Physics.prototype` using spatial partitioning rather than N^2 distance checks.
- [ ] **New Task: Add WebAudio Sound Pool Caching**: Optimize `SoundManager` instances using reusable sound source buffer pools to reduce AudioContext memory overhead.
- [ ] **Chunk Mesh Face Culling & Instancing**: Group identical chunk block faces into instanced draw arrays to reduce render draw calls.
- [ ] **New Task: Add Unified Container Interaction Registry**: Consolidate container opening logic for Chests, Furnaces, Hoppers, Dispensers, Droppers, Crafters, and Shulker Boxes into a unified `ContainerUI` manager in `js/ui.js`.
- [ ] **New Task: Add Spatial Quadtree Chunk Lookup**: Replace O(chunks) linear scan in `World.prototype.getChunk` with spatial 2D grid/quadtree array lookup.
- [ ] **New Task: Add Spatial Octree Node Recycling**: Pool spatial quadtree/octree node allocations during chunk updates in `js/world.js` to reduce garbage collection overhead.

## 🎨 Rendering, Lighting & Audio

- [ ] Smooth lighting
- [ ] Custom shaders
- [ ] **Better shadows and lighting** (Dynamic shadows)
- [ ] **Clouds and better skybox**
- [ ] Colored lighting
- [ ] **Dynamic Lighting** (Light emitting items in hand)
- [ ] Music system
- [ ] **Screenshot system**
- [ ] **New Task: Add Ambient Sounds**: Background noises for caves, forests, and oceans.
- [ ] **New Task: Add Custom Sun Flare & Ray Occlusion Effects**: Light shafts rendering through opaque blocks around sun/moon models.
- [ ] **New Task: Add Particle Emission Rate Quality Scaling**: Settings option to scale particle density and emission caps based on GPU/device performance in `js/particles.js`.
- [ ] **New Task: Add Atmospheric Volumetric Cave Fog**: Render subtle depth-based volumetric fog density layers in subterranean cave structures below Y=30.
- [ ] **New Task: Add Sprinting Motion Blur & Flight Vignette Effects**: Canvas post-processing visual feedback effect when sprinting or gliding with Elytra.

## 🧱 World Generation & Structures

- [ ] **New Task: Add Ice Spikes Tundra Structures**: Tall packed ice and blue ice spires generating in cold tundra biomes.
- [ ] **New Task: Add Tall Birch Forest Variant Generation**: Procedurally generate 10-14 block tall birch tree variants in birch forest biomes.
- [ ] **New Task: Add End Citadel Structure**: Generate End Citadel towers in the End dimension with End Stone bricks, Purpur blocks, and Shulker spawners.
- [ ] **New Task: Add Eclipse Events**: Special events where the sun is blocked during the day.
- [ ] **New Task: Add Moon Phases**: Moon phases that affect mob spawning.
- [ ] **New Task: Add Trial Chamber Secret Vault Passages**: Hidden redstone trapdoors in Trial Chamber corridors leading to bonus Vault reward rooms. (Status: Proposed feature, pending implementation)
- [ ] **New Task: Add Trial Chamber Map Loot Tables**: Cartographer Villagers trading maps leading directly to Trial Chamber structures. (Status: Proposed feature, pending implementation)
- [ ] **New Task: Add Ocean Monument Structures**: Ocean monuments generating in deep ocean biomes containing Sea Lanterns and Elder Guardians.
- [ ] **New Task: Add End City Generation & Chorus Plants**: Generate End Cities on outer End islands with Chorus Plant flora harvesting in `js/structures.js`.
- [ ] **New Task: Improve Biome Generation**: Make biome transitions smoother and add more variations. (Status: Partially implemented - Biomes generated in biome.js, but smooth noise transitions and biome temperature gradients are pending agent implementation)
- [ ] **New Task: Add End Cities**: Generate End Cities and End Ships in the outer islands of the End dimension with Purpur blocks and Shulker mobs.
- [ ] **New Task: Structures (Dungeons)**: Generate dungeon structures in the overworld.
- [ ] **New Task: Add Cave Vines**: Growing vines in caves that can produce Glow Berries.
- [ ] **New Task: Add Nether Gold Ore**: Gold ore variant found in the Nether that drops gold nuggets.
- [ ] **New Task: Add Volcano Structures**: Natural volcanic landforms that spout lava and spawn magma cubes.
- [ ] **New Task: Add Nether Portals**: Structures made of obsidian that transport players to the Nether dimension.
- [ ] **New Task: Add Trading Posts**: Specialized structures generated in villages to trade items with villagers.
- [ ] **New Task: Add Ominous Trial Vault Key Drop Chance**: Defeating Ominous Spawner wave bosses grants an Ominous Trial Key to unlock high-tier Vault loot. (Status: Proposed feature, pending implementation)
- [ ] **New Task: Add Amethyst Geode Crystal Growth**: Amethyst Clusters gradually growing through 4 growth stages over time in geode structures.
- [ ] **New Task: Add Desert Well Structures**: Small sandstone wells generating in desert biomes containing water sources and suspicious sand.
- [ ] **New Task: Add Ancient City Deep Dark Structures**: Procedurally generated deep subterranean structures featuring Sculk Catalysts, Sculk Shriekers, and reinforced deepslate frames.
- [ ] **New Task: Add Swamp Hut Structures**: Generate Witch huts in swamp biomes containing cauldrons, crafting tables, and black cats.
- [ ] **New Task: Add Woodland Mansions**: Rare large roofed forest structures generated with Dark Oak wood and containing Illager mobs.
- [ ] **New Task: Add Lush Caves Biome**: Subterranean cave biomes filled with Moss Blocks, Spore Blossoms, Cave Vines, and Azalea bushes.
- [ ] **New Task: Add Nether Fortresses Blaze Spawner Rooms**: Procedurally generated nether brick rooms containing Blaze mob spawner blocks.
- [ ] **New Task: Add Desert Pyramid Trap Chamber Suspicious Sand**: Generate suspicious sand blocks in secret Desert Temple chambers containing archaeology rewards.
- [ ] **New Task: Add Lush Caves Glow Berry Vines**: Subterranean mossy cave generation with hanging light-emitting Glow Berries.
- [ ] **New Task: Add Ocean Ruins Structures**: Submerged sandstone and stone brick ruin structures generating in ocean biomes with suspicious gravel and drowned spawns in `js/structures.js`.
- [ ] **New Task: Add Ruined Portals Structure Generation**: Obsidian and crying obsidian portal frames generating partially buried in Overworld and Nether biomes with loot chests in `js/structures.js`.
- [ ] **New Task: Add End Ship Outer Islands Generation**: Generate flying End Ships adjacent to End Cities containing Elytra items in item frames and Dragon Heads in `js/structures.js`.
- [ ] **New Task: Add Deep Dark Ancient City Portal Frame**: Generate large central reinforced deepslate portal frame structures in Deep Dark biomes in `js/structures.js`.
- [ ] **New Task: Add Trail Ruins Archaeological Site Generation**: Subterranean gravel and mud brick structure generation in birch and taiga biomes with archaeology loot.

## 👾 Mobs & Entities

- [ ] Complex AI (Pathfinding, fleeing, attacking)
- [ ] **New Task: Add Shulker Mob Entity**: Hostile End city mob that fires Levitation projectiles and drops Shulker Shells in `js/mob.js`.
- [ ] **New Task: Implement Strider Mobs**: Rideable passive mobs in the Nether that walk on lava.
- [ ] **New Task: Add Pandas**: Neutral mobs that eat bamboo in jungles.
- [ ] **New Task: Add Dolphins**: Neutral aquatic mobs in ocean biomes that guide players to treasure and grant Dolphin's Grace.
- [ ] **New Task: Add Ravagers**: Large hostile beasts ridden by Illagers.
- [ ] **New Task: Add Drowned**: Zombie variant that spawns underwater.
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
- [ ] **New Task: Add Glow Squid**: Squid variant that drops glow ink sacs.
- [ ] **New Task: Add Camel Rideable Mount Physics & Sprint Dash**: Desert camel mounts supporting two players and executing horizontal gap-clearing dash moves in `js/mob.js`.

## 🧰 Items, Equipment & Crafting

- [ ] **New Task: Add Wind Charge Throwable Projectile**: Throwable Wind Charge item launching entity knockback gusts and vertical self-propulsion upon impact in `js/item_use.js`.
- [ ] **New Task: Add Crafter Grid Quick-Shift Auto-Fill**: Shift-clicking ingredients into open Crafter GUI populates all non-disabled crafting grid slots evenly in `js/ui.js`.
- [ ] **New Task: Add Wind Charge Enchantment Synergy**: Wind Charge projectiles triggering extra knockback or fire damage when launched using enchanted bows or crossbows.
- [ ] **New Task: Implement Tridents with Enchantments**: Add Loyalty, Channeling, and Riptide enchantments.
- [ ] **Map item**
- [ ] **New Task: Add Beacons**: Blocks that grant buffs to nearby players when placed on a pyramid.
- [ ] **New Task: Add Banners**: Decorative blocks with customizable patterns.
- [ ] **New Task: Add Paraglider Equipment**: Early-game aerial glider equipment before obtaining Elytra.
- [ ] **New Task: Add Hanging Signs**: Signs that hang from underneath blocks.
- [ ] **New Task: Add Tool Icons**: Add icons for different tool types.
- [ ] **New Task: Add Enderite**: A new tier of gear found in the End dimension.
- [ ] **New Task: Add Backpacks**: Equipable items that expand player inventory space.
- [ ] **New Task: Add Grappling Hooks**: Tool to quickly traverse vertical terrain and pull entities.
- [ ] **New Task: Add Tents**: Placeable sleeping spots that don't set spawn points but allow skipping night.
- [ ] **New Task: Add Paintbrushes**: Items used to paint blocks different colors.
- [ ] **New Task: Add Netherite Armor**: Higher tier armor that resists fire.
- [ ] **New Task: Add Firework Star Customization**: Crafting recipes for Firework Stars with dye color combinations and explosive effect shapes.
- [ ] **New Task: Add Wind Charge Elytra Boost Synergy**: Launching Wind Charges while gliding with Elytra provides vertical velocity boost and radial wind burst FX in `js/item_use.js`.

## 🔌 Redstone, Mechanics & Functional Blocks

- [ ] **New Task: Add Sculk Sensor Redstone Signal Frequency Calibration**: Sculk Sensor and Calibrated Sculk Sensor emitting distinct redstone power levels (1-15) based on vibration event types in `js/world.js`.
- [ ] **New Task: Add Apiaries**: Crafted blocks where bees live and produce honey.
- [ ] **New Task: Add Command Blocks**: Blocks that can execute server/world commands when powered by redstone.
- [ ] **New Task: Add Copper Golem Mob & Copper Button Interactivity**: A friendly construct mob crafted from copper blocks that randomly interacts with copper buttons and oxidizes into a statue over time. (Status: Proposed feature, pending implementation)
- [ ] **New Task: Add Waystones**: Blocks that allow players to teleport between them when activated.
- [ ] **New Task: Add Structure Blocks**: Technical blocks for saving and loading structures.
- [ ] **New Task: Add Jigsaw Blocks**: Technical blocks used for generating complex structures like villages.
- [ ] **New Task: Add Water Wheels and Windmills**: Multiblock mechanical power generators using environmental water flow and wind.
- [ ] **New Task: Add Calibrated Sculk Sensor Output Latching**: Allow side-powered Calibrated Sculk Sensors to hold their redstone signal output until reset in `js/world.js`.

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
- [ ] **New Task: Add In-Game Keybind Remapping UI**: Settings screen menu allowing players to customize keybindings for movement, inventory, and hotbar controls.
- [ ] **New Task: Add Audio Subtitles Directional Radar Indicator**: Visual HUD compass rose showing directional sound source markers in `js/ui.js`.

## 🧩 Modding & Plugin API
The in-game plugin surface today: `window.PluginAPI` (events, `registerBlock`) and `BlockInteractions.register()` for right-click behaviour.

- [ ] Custom block registration
- [ ] Custom item registration
- [ ] Event hooks
- [ ] Custom commands
- [ ] **Resource pack support**
- [ ] **Support for custom models**
- [ ] **New Task: Add Plugin API Custom Mob Registration**: `PluginAPI.registerMob(type, config)` endpoint allowing custom mob entity behaviors and textures.
- [ ] **New Task: Add Plugin API Custom Particle Registration**: `PluginAPI.registerParticle(name, config)` endpoint for custom particle effects.
- [ ] **New Task: Add Plugin API Custom UI Container Registration**: Endpoint for plugins to define custom grid GUIs and item container screens.
- [ ] **New Task: Add Plugin API World Generator Hook**: `PluginAPI.registerBiomeGenerator(name, config)` allowing custom biome structure and heightmap generation logic in `js/plugin.js`.
- [ ] **New Task: Add Plugin API Custom Recipe Registration**: `PluginAPI.registerRecipe(output, ingredients, matrix)` endpoint for plugins to register shaped/shapeless crafting recipes in `js/plugin.js`.
