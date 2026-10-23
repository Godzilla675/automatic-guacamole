# Future Features & Tasks

The backlog for Voxel World. **Only open work lives here** - everything already shipped is archived in
[`docs/COMPLETED_FEATURES.md`](docs/COMPLETED_FEATURES.md) (475 items and counting).

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
- [ ] **Hot-loop `window.*` lookups**: renderer/world code reads `window.BLOCKS[...]` inside per-block loops. Cache `BLOCKS`/`BLOCK` in local consts at the top of hot functions (free in browsers, 2x faster under JSDOM).
- [ ] **Block light is computed but never rendered**: `World.setBlock()` runs `recalcLocalLight()` (a 31x31x31 scan) for every gameplay block change, yet `renderer.js` ignores `b.light` (the brightness line is commented out). Either use the light values for shading or make the recalculation incremental; worldgen already skips it (see `_generating` in `js/world.js`).
- [ ] **Parked chunks are memory-only**: edited chunks that scroll out of range are kept in `World.unloadedChunks` (capped at 512, LRU) and included in saves, but a very long session can still evict old edits. Spill evicted chunks to IndexedDB instead of dropping them.
- [ ] **LOD (Level of Detail) system**
- [ ] **Worker threads for world generation**
- [ ] **Better memory management**
- [ ] **Chunk Serialization Optimization**
- [ ] **Refactoring World/Chunk Separation**
- [ ] **New Task: Add Spatial Partitioning for Entity Collisions**: Optimize entity-to-entity collision detection in `Physics.prototype` using spatial partitioning rather than N^2 distance checks.
- [ ] **New Task: Add WebAudio Sound Pool Caching**: Optimize `SoundManager` instances using reusable sound source buffer pools to reduce AudioContext memory overhead.
- [ ] **Chunk Mesh Face Culling & Instancing**: Group identical chunk block faces into instanced draw arrays to reduce render draw calls.
- [ ] **New Task: Add Particle Engine Object Pooling**: Reuse Particle objects in `ParticleSystem` (`js/particles.js`) from an array pool instead of allocating new objects on every explosion/snowball/wind effect to reduce garbage collection pressure.
- [ ] **New Task: Add Unified Container Interaction Registry**: Consolidate container opening logic for Chests, Furnaces, Hoppers, Dispensers, Droppers, Crafters, and Shulker Boxes into a unified `ContainerUI` manager in `js/ui.js`.
- [ ] **New Task: Add Spatial Quadtree Chunk Lookup**: Replace O(chunks) linear scan in `World.prototype.getChunk` with spatial 2D grid/quadtree array lookup.

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
- [ ] **New Task: Add Armor Trim Smithing Table Visual Rendering**: Render trimmed armor textures on player model when wearing smithing-trimmed armor items. (Status: Proposed feature, pending implementation)
- [ ] **New Task: Add Block Break Particle Color Matching**: Break particles dynamically sampling exact texture/block color hex values rather than default grayscale.
- [ ] **New Task: Add Mob Hitting Flash Shader Effect**: Briefly render mobs with a red tint overlay when taking damage in `js/renderer.js`.
- [ ] **New Task: Add Underwater Screen Distortion & Vignette Shader**: Render a subtle water distortion wave effect and darkened vignette overlay when player head is submerged. (Status: Partially implemented - basic water blue tint and bubbles rendered in `js/renderer.js`, but wave distortion shader and dark vignette overlay are pending implementation)
- [ ] **New Task: Add Rain Particle Ripple Effects on Liquid Surfaces**: Spawn expanding ripple ring particles on top face of water/lava blocks during rainfall in `js/particles.js` and `js/renderer.js`.
- [ ] **New Task: Add Directional Hurt Screen Shake**: Tilt player camera angle away from the direction of incoming entity damage in `js/player.js` and `js/renderer.js`.
- [ ] **New Task: Add Wind Charge Explosion Shockwave Rings**: Expanding 3D ring particles generated upon Wind Charge impact explosions.
- [ ] **New Task: Add Custom Sun Flare & Ray Occlusion Effects**: Light shafts rendering through opaque blocks around sun/moon models.
- [ ] **New Task: Add Mob Taking Damage Red Flash Overlay**: Render mobs with a subtle red tint overlay when taking damage during hit invulnerability ticks in `js/renderer.js`.
- [ ] **New Task: Add Block Placement & Breaking Particles Color Blend**: Dynamically sample average block texture colors when spawning break/place dust particles in `js/particles.js`.
- [ ] **New Task: Add Underwater Screen Distortion Wave Shader**: Render horizontal sine-wave screen distortion when player head is submerged in water in `js/renderer.js`.

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
- [ ] **New Task: Add Ancient City Deep Dark Structures**: Procedurally generated deep subterranean structures featuring Sculk Catalysts, Sculk Shriekers, and reinforced deepslate frames.
- [ ] **New Task: Add Swamp Hut Structures**: Generate Witch huts in swamp biomes containing cauldrons, crafting tables, and black cats.
- [ ] **New Task: Add Woodland Mansions**: Rare large roofed forest structures generated with Dark Oak wood and containing Illager mobs.
- [ ] **New Task: Add Lush Caves Biome**: Subterranean cave biomes filled with Moss Blocks, Spore Blossoms, Cave Vines, and Azalea bushes.
- [ ] **New Task: Add Nether Fortresses Blaze Spawner Rooms**: Procedurally generated nether brick rooms containing Blaze mob spawner blocks.
- [ ] **New Task: Add Desert Pyramid Trap Chamber Suspicious Sand**: Generate suspicious sand blocks in secret Desert Temple chambers containing archaeology rewards.
- [ ] **New Task: Add Nether Fossil Structure Bone Block Drops**: Nether fossil bone structures generating in soul sand valleys dropping bone meal and bone blocks.
- [ ] **New Task: Add Lush Caves Glow Berry Vines**: Subterranean mossy cave generation with hanging light-emitting Glow Berries.
- [ ] **New Task: Add Ocean Ruins Structures**: Submerged sandstone and stone brick ruin structures generating in ocean biomes with suspicious gravel and drowned spawns in `js/structures.js`.
- [ ] **New Task: Add Ruined Portals Structure Generation**: Obsidian and crying obsidian portal frames generating partially buried in Overworld and Nether biomes with loot chests in `js/structures.js`.
- [ ] **New Task: Add Witch Hut Structure in Swamp Biomes**: Procedurally generate 4x4 wooden Witch Huts on stilts in Swamp biomes containing Cauldrons, Crafting Tables, and Witch spawns in `js/structures.js`.
- [ ] **New Task: Add Desert Well Structures with Water Source**: Generate Sandstone Wells in Desert biomes with water source blocks and suspicious sand in `js/structures.js`.
- [ ] **New Task: Add Nether Fossil Structure Bone Meal Drops**: Generate subterranean Bone Block fossil structures in Soul Sand Valley biomes in `js/structures.js`.

## 👾 Mobs & Entities

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
- [ ] **New Task: Add Blaze Mob Entity**: Flying Nether fortress mob shooting triple fireballs at players and dropping Blaze Rods.
- [ ] **New Task: Add Ghast Mob Entity**: Floating Nether mob shooting explosive fireballs that can be deflected back with melee attacks.
- [ ] **New Task: Add Phantom Flying AI**: Flying hostile mob appearing at night when player has not slept for 3+ days, dropping Phantom Membranes.
- [ ] **New Task: Add Cat Taming & Creeping Fleeing Physics**: Stray cats spawning in villages that flee from fast player movements, can be tamed with raw fish, and repel Creepers.
- [ ] **New Task: Add Wolf Armor Protection Multiplier**: Wolf armor mitigating percentage damage taken by tamed wolves from explosions and hostile mob attacks.
- [ ] **New Task: Add Armadillo Scute Shedding Mechanics**: Armadillo mobs periodically dropping Armadillo Scutes over time when idle.
- [ ] **New Task: Add Axolotl Color Variants & Breeding**: Pink, brown, gold, cyan, and rare blue axolotl variants breedable with tropical fish.
- [ ] **New Task: Add Drowned Trident Throwing & Aquatic Aggro AI**: Drowned mobs spawning underwater with tridents and throwing projectile tridents at target players in `js/mob.js`.
- [ ] **New Task: Add Phantom Night Spawning & Flying Swoop AI**: Flying Phantoms spawning above players who haven't slept for 3+ in-game days and swooping down to attack in `js/mob.js`.
- [ ] **New Task: Add Strider Lava Walking & Cold Tremor Physics**: Striders walking rapidly across lava surfaces while shivering and slowing down when on land in `js/mob.js`.

## 🧰 Items, Equipment & Crafting

- [ ] **New Task: Add Wind Charge Enchantment Synergy**: Wind Charge projectiles triggering extra knockback or fire damage when launched using enchanted bows or crossbows.
- [ ] **New Task: Implement Tridents with Enchantments**: Add Loyalty, Channeling, and Riptide enchantments.
- [ ] **Map item**
- [ ] **Shulker Boxes**
- [ ] **New Task: Add Beacons**: Blocks that grant buffs to nearby players when placed on a pyramid.
- [ ] **New Task: Add Banners**: Decorative blocks with customizable patterns.
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
- [ ] **New Task: Add Firework Star Customization**: Crafting recipes for Firework Stars with dye color combinations and explosive effect shapes.
- [ ] **New Task: Add Crafter Slot Grid Hotbar Quick-Fill**: Quick-shifting items from inventory hotbar directly into active non-disabled Crafter UI slots.
- [ ] **New Task: Add Ominous Bottle Consumable Effects**: Consuming Ominous Bottles applying Bad Omen level I-V status effects.
- [ ] **New Task: Add Breeze Rod Mace Repair Crafting**: Repairing Mace durability at Anvil using Breeze Rod materials.
- [ ] **New Task: Add Ominous Bottle Consumable Drinking Effects**: Drinking Ominous Bottles displays particle bubble animation and grants Bad Omen level I-V.
- [ ] **New Task: Add Firework Rocket Flight Boosting for Elytra**: Right-clicking Firework Rockets while gliding with Elytra applies forward acceleration boost in `js/item_use.js` and `js/player.js`.
- [ ] **New Task: Add Trident Loyalty & Riptide Enchantment Interactions**: Throwing Loyalty Tridents automatically return to player inventory; Riptide Tridents launch player in water or rain in `js/item_use.js`.
- [ ] **New Task: Add Shulker Box Color Dyeing & Inventory Storage**: Craftable 27-slot Shulker Boxes that retain stored items when broken and can be dyed 16 colors in `js/blocks.js` and `js/crafting.js`.

## 🔌 Redstone, Mechanics & Functional Blocks

- [ ] **New Task: Add Apiaries**: Crafted blocks where bees live and produce honey.
- [ ] **New Task: Add Command Blocks**: Blocks that can execute server/world commands when powered by redstone.
- [ ] **New Task: Add Copper Golem Mob & Copper Button Interactivity**: A friendly construct mob crafted from copper blocks that randomly interacts with copper buttons and oxidizes into a statue over time. (Status: Proposed feature, pending implementation)
- [ ] **New Task: Add Waystones**: Blocks that allow players to teleport between them when activated.
- [ ] **New Task: Add Structure Blocks**: Technical blocks for saving and loading structures.
- [ ] **New Task: Add Jigsaw Blocks**: Technical blocks used for generating complex structures like villages.
- [ ] **New Task: Add Water Wheels and Windmills**: Multiblock mechanical power generators using environmental water flow and wind.
- [ ] **New Task: Add Dispenser Item Shooting & Projectile Launching**: Dispensers firing arrows, fireworks, snowballs, and water buckets on redstone power.
- [ ] **New Task: Add Crafter Block Comparator Pulse Stability**: Stabilize comparator signal outputs during rapid redstone auto-crafting sequences.
- [ ] **New Task: Add Crafter Redstone Pulse Lock Indicator**: Visual locking overlay indicator on Crafter UI when redstone power holds the craft cycle.
- [ ] **New Task: Add Heavy Weighted Pressure Plates**: Gold and Iron pressure plates emitting redstone signal strength proportional to entity count standing on them in `js/world.js`.
- [ ] **New Task: Add Heavy Weighted Pressure Plate Entity Power Output**: Gold (Light) and Iron (Heavy) pressure plates calculating analog signal output based on exact entity weight counts in `js/world.js`.
- [ ] **New Task: Add Dispenser Item Shooting & Projectile Launching Logic**: Dispensers firing arrows, snowballs, firework rockets, and water buckets on receiving redstone power pulses in `js/world.js`.
- [ ] **New Task: Add Redstone Repeater Lock Mechanism**: Secondary redstone repeaters powering side faces of active repeaters locking their current signal transmission state in `js/world.js`.

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
- [ ] **New Task: Add FOV Camera Slider in Settings**: Settings slider allowing players to customize camera Field of View (60° to 110°).
- [ ] **New Task: Add Dynamic Crosshair Recoil Indicator**: Crosshair visual expansion during weapon cooldowns and projectile launches.
- [ ] **New Task: Add Keybind Remapping UI Menu**: Interactive settings menu screen for customizing movement, jump, sprint, inventory, and drop key bindings in `js/ui.js`.
- [ ] **New Task: Add Dynamic Crosshair Recoil Indicator FX**: Crosshair visual expansion during weapon attack cooldowns and bow draw charging in `js/ui.js`.

## 🧩 Modding & Plugin API
The in-game plugin surface today: `window.PluginAPI` (events, `registerBlock`) and `BlockInteractions.register()` for right-click behaviour.

- [ ] Custom block registration
- [ ] Custom item registration
- [ ] Event hooks
- [ ] Custom commands
- [ ] **Resource pack support**
- [ ] **Support for custom models**
- [ ] **New Task: Add Plugin API Custom Mob Registration**: `PluginAPI.registerMob(type, config)` endpoint allowing custom mob entity behaviors and textures.
- [ ] **New Task: Add Custom Sound Effect Event Hooks**: `PluginAPI.on('sound', callback)` allowing plugins to intercept and modify in-game audio events.
- [ ] **New Task: Add Plugin API Custom Particle Registration**: `PluginAPI.registerParticle(name, config)` endpoint for custom particle effects.
- [ ] **New Task: Add Plugin API Custom UI Container Registration**: Endpoint for plugins to define custom grid GUIs and item container screens.
- [ ] **New Task: Add Plugin API World Generator Hook**: `PluginAPI.registerBiomeGenerator(name, config)` allowing custom biome structure and heightmap generation logic in `js/plugin.js`.
- [ ] **New Task: Add Plugin API Sound Effect Event Hooks**: `PluginAPI.on('sound', callback)` allowing plugins to intercept, modify, or silence sound play events in `js/plugin.js`.
