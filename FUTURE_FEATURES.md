# VoxelWeb Future Features & Tasks

This file tracks the status of major gameplay features, architectural tasks, and known bugs.

## Core Features


- [ ] **New Task: Add Fishing Mechanics**: Implement fishing rod usage and catching items/fish in water.
- [x] **New Task: Add Pistons**: Blocks that can push other blocks when powered by Redstone.
### 1. World Generation
- [ ] Better cave systems (Ravines, large caves)
- [ ] **Birch Forest Biome** (Status: Failed: BIOME.BIRCH_FOREST not defined in biome.js, agents must fix)
- [ ] **Bamboo Jungle**
- [ ] **Jungle Biome** (Status: Biome logic exists but fails to generate correctly during world creation. Biome manager defines treeChance and structures.js defines generateJungleTree, but world.js generateTree calls type='jungle' instead of calling generateJungleTree correctly, causing missing jungle trees, agents must fix)
- [ ] **New Task: Add Witches**: Hostile mob that throws splash potions.
- [ ] **Nether Fortresses** (Generation logic in Nether)
- [ ] **Swamp Biome**
- [ ] **Badlands Biome**
- [ ] **Desert Temple**

### 2. Block System
- [ ] **Top Slabs** (Status: Placement in upper half of block missing, agents must fix)
- [ ] **Decorative blocks** (Glazed Terracotta, Concrete)
- [ ] **Redstone-like logic blocks** (Comparators, Repeaters)

### 3. Rendering Engine
- [ ] Smooth lighting
- [ ] Custom shaders
- [ ] Day/Night cycle rendering (Sky colors, sun/moon)
- [ ] **Better shadows and lighting** (Dynamic shadows)
- [ ] **Clouds and better skybox**
- [ ] **Head bobbing animation**
- [ ] **Add dynamic crosshair changing on hover**

### 4. Player Mechanics
- [ ] Drowning
- [ ] **New Task: Add Wither Skeletons**: Hostile mob in Nether Fortresses that inflicts Wither effect.
- [ ] **Elytra** (Gliding mechanics)
- [ ] **Tridents** (Throwing, returning, Riptide)

### 5. Entities & Mobs
- [ ] **New Task: Add Charged Creepers**: Creepers struck by lightning with larger explosion radius.
- [ ] **New Task: Add Husk**: Desert variant of the zombie that applies hunger effect.
- [ ] Complex AI (Pathfinding, fleeing, attacking)
- [ ] **Wandering Traders**

- [ ] **Pandas**
- [ ] **Wither Boss**
- [ ] **Slime Mob**
- [ ] **Magma Cube Mob**
- [ ] **Ender Dragon Boss**
- [ ] **Rideable Pigs** (With carrot on a stick)

### 6. Items & Crafting

- [ ] **New Task: Implement Tridents with Enchantments**: Add Loyalty, Channeling, and Riptide enchantments.
- [ ] **New Task: Add Smithing Table UI**: Implement the UI and logic for upgrading gear to Netherite.
- [ ] **New Task: Add Piglins and Bartering**: Neutral mobs in the Nether that trade items for gold.
- [ ] **New Task: Implement Strider Mobs**: Rideable passive mobs in the Nether that walk on lava.
- [ ] **Add Bow and Arrows**: Ranged weapon using arrows.
- [ ] **Map item**
- [ ] **Shulker Boxes**
- [ ] **Campfire**
- [ ] **Beacons**

### 7. Lighting System
- [ ] Colored lighting
- [ ] **Dynamic Lighting** (Light emitting items in hand)

### 8. Physics
- [ ] **Fishing Rod Physics** (Bobber physics and catching logic improvements)

### 9. World Management
- [ ] **LOD (Level of Detail) system**
- [ ] **Worker threads for world generation**
- [ ] **Better memory management**
- [ ] **Implement Auto-Save Feature**
- [ ] **Chunk Serialization Optimization**
- [ ] **Refactoring World/Chunk Separation**

### 10. User Interface
- [ ] **Add Configurable UI Scaling Setting**
- [ ] **Share world links**
- [ ] **Leaderboards**
- [ ] **World showcase gallery**

### 11. Audio
- [ ] Music system
- [ ] **Proper block placement sound based on block type**

### 12. Redstone & Mechanics
- [ ] **New Task: Implement Sticky Pistons**: Blocks that can push and pull other blocks when powered by Redstone.
- [ ] **Implement Droppers and Dispensers**
- [ ] **Implement Hoppers**
- [ ] **Redstone Repeaters & Comparators** (Status: Missing block definitions and logic, agents must fix)
- [ ] **Redstone Input Devices** (Target Block, Daylight Detector)
- [ ] **Command Block**

### 13. Networking (Multiplayer)
- [ ] Entity synchronization
- [ ] Inventory synchronization
- [ ] **Friends system**

### 14. Modding & API
- [ ] Custom block registration
- [ ] Custom item registration
- [ ] Event hooks
- [ ] Custom commands
- [ ] **Resource pack support**
- [ ] **Support for custom models**

### 15. Miscellaneous

- [ ] **New Task: Add Fireworks Rendering**: Visualize fireworks exploding in the sky with particles.
- [ ] **New Task: Add Block Dragging**: Allow players to drag and select multiple blocks in creative.
- [ ] **New Task: Add Leads**: Items to tie passive mobs to fences.
- [ ] **New Task: Add Banners**: Decorative blocks with customizable patterns.
- [ ] **New Task: Add Fireworks**: Items used for celebrations or Elytra boosting.
- [ ] **New Task: Add Dual Wielding**: Allow players to hold items in both hands.
- [ ] **New Task: Add Spyglass**: Implement zooming mechanic.
- [x] **New Task: Add Sneaking**: Allow players to crouch to avoid falling off edges and reduce height.
- [x] **New Task: Add Sprinting**: Increase movement speed and FOV when double tapping forward.
- [x] **New Task: Implement Fall Damage**: Player should take damage based on the height fallen.
- [x] **New Task: Implement Hunger Depletion**: Hunger should decrease over time and when sprinting/jumping.
- [ ] **Implement Thunderstorms and Lightning**
- [ ] Day/Night cycle implementation (Logic)
- [ ] Statistics
- [ ] **Nether Dimension** (Dimension generation, portals)
- [ ] **End Dimension** (End island generation, Ender Dragon)
- [ ] **Deprecated Items cleanup**
- [ ] **Animal Drops fixing**
- [ ] **Chat History Log toggle**

### 16. Test Suite and CI
- [ ] **Screenshot system**

## Known Bugs & Issues (To Be Fixed)
- [ ] **Bug: Player Death Loop**: Player continuously dies every few seconds. Investigate spawn height and fall damage. (Status: Fall damage not properly calculated and safe spawn height not guaranteed, agents must fix)
- [ ] **Bug: Crosshair Alignment Issue**: The crosshair is rendered via CSS in the center of the screen, but may not perfectly align with the 3D raycast target depending on aspect ratio. (Status: Raycast logic needs update to center ray based on screen resolution, agents must fix)
- [ ] **New Task: Add Frogs**: Add frogs to swamp biomes.
- [ ] **Bug: Node ESM Translator Error**: `test_runner.py` encounters `node:internal/modules/esm/translators` errors. (Status: Known configuration issue, agents must fix using dependencies like `jsdom`).
- [ ] **Implement Droppers and Dispensers**: Redstone interaction for items. (Status: Missing implementation, agents must fix)
- [ ] **Implement Hoppers**: Add transfer logic to move items between inventories/containers. (Status: Missing implementation, agents must fix)
- [ ] **Implement Item Frames**: Add wall placement logic and rendering for items inside frames. (Status: Missing implementation, agents must fix)
- [ ] **Implement Fire Spread**: Add fire blocks and logic for them to spread to flammable blocks over time. (Status: Missing implementation, agents must fix)
- [ ] **Implement Sleeping Through the Night**: Logic to check if all players are in beds, and skip to daytime. (Status: Missing implementation, agents must fix)
- [ ] **Implement Shears Functionality**: Expand logic to shear leaves and grass directly into the inventory. (Status: Partial implementation: sheep shearing works, missing leaves/grass, agents must fix)
- [ ] **New Task: Add Bamboo**: Fast growing plant that can be crafted into scaffolding.
- [ ] **Bug: Missing UI Assets (Partial Implementation)**: Glass Panes and Fences have definitions in blocks.js but are missing from the standard HTML inventory (`index.html`). The inventory items show up correctly inside the 36 inventory slots and hotbar, however `Glass Pane` missing text is visible in the UI logs, and the block icon textures inside `inventory_items.png` failed to load/render correctly. (Status: Still missing in HTML mapping, agents must fix)
- [ ] **Bug: Door Placement Bug**: The Wood Door recipe is functional in the crafting menu, but placing the door programmatically or in-game has issues that need further agent investigation/fixing. (Status: Door placement logic exists but is failing, agents must fix)
- [ ] **New Task: Add Pandas**: Neutral mob found in bamboo jungles.
- [ ] **New Task: Endermen Block Carrying**: Endermen should randomly pick up and place certain blocks.
- [ ] **New Task: Implement Redstone Clocks**: Provide a mechanism to create looping redstone signals. (Status: Missing block definition and world update logic, agents must fix)
- [ ] **New Task: Add Bookshelves**: Bookshelves for enchanting rooms. (Status: Missing block definition, agents must fix)
- [ ] **New Task: Add Lava Flow**: Lava should flow slowly and set nearby blocks on fire. (Status: Lava block exists but flow physics is missing, agents must fix)
- [ ] **New Task: Improve Biome Generation**: Make biome transitions smoother and add more variations. (Status: Missing noise transitions in biome.js, agents must fix)
- [ ] **New Task: Add Potion Effects**: Effects like speed, strength, and fire resistance. (Status: Potion item exists but consumption effects logic is missing, agents must fix)
- [ ] **New Task: Implement Llamas**: Add Llamas mob with caravan mechanic.
- [ ] **New Task: Enchantment Table**: Add an enchantment table to spend XP for tool/armor upgrades.
- [ ] **New Task: Add Armor Stand**: An entity to hold and display armor.
- [ ] **New Task: Add Name Tags**: Item to name mobs to prevent despawning.
- [ ] **New Task: Add Foxes**: New animal mob that sleeps during the day and hunts at night.
- [ ] **New Task: Implement Polar Bears**: Add Polar Bears in snowy biomes.
- [ ] **New Task: Implement Mob Spawning Rules**: Mobs should spawn based on light levels and biome types.
- [ ] **New Task: Add Shields**: Add craftable shields to block incoming entity attacks and projectiles.
- [ ] **New Task: Implement Dolphins**: Add dolphins in ocean biomes that grant Dolphin's Grace.
- [ ] **New Task: Implement Redstone Comparators**: Add comparator logic to read block states.
- [ ] **New Task: Add Weather Sounds**: Add rain and storm sound effects to the audio manager.
- [ ] **New Task: Implement Parrots**: Add Parrots that can imitate sounds and ride on player shoulders.

- [ ] **New Task: Add Horses**: Rideable mob with different speeds and jump heights.
- [ ] **New Task: Add Shulkers**: New hostile mob that shoots levitation projectiles in End Dimension.
- [ ] **New Task: Add Elytra**: Implement gliding mechanics when jumping in mid-air.
- [ ] **New Task: Add Villager Professions**: Different skins and trades based on claimed workstations.
- [ ] **New Task: Add End City**: Generate end city structures in the End Dimension with valuable loot.
- [ ] **New Task: Add Drowned**: Zombie variant that spawns underwater.
- [ ] **Bug: Mob rendering depth sorting**: When multiple mobs overlap, depth sorting sometimes renders the further mob in front.

- [ ] **New Task: Add Honey Blocks**: Blocks that reduce fall damage and slow movement.
- [ ] **New Task: Add Bees**: Neutral flying mob that pollinates crops and produces honey.

- [ ] **New Task: Implement Armor Durability**: Armor should lose durability when taking damage.
- [ ] **New Task: Add Snow Golems**: Craftable utility mob using snow blocks and pumpkin.
- [ ] **New Task: Structures (Dungeons)**: Generate dungeon structures in the overworld.
- [ ] **Bug: JSDOM Canvas Mock Missing Methods**: JSDOM canvas mocks require save and restore methods to prevent errors during Minimap updates. (Note: Currently fails because ctx.rotate, ctx.scale, ctx.fill, etc., are missing in mock).
- [ ] **New Task: Add Goats**: New mob that rams players and entities.
- [ ] **New Task: Add Warden**: A blind, powerful mob that spawns in the Deep Dark biome and hunts by sound.
- [ ] **New Task: Add Axolotls**: Passive aquatic mobs that fight hostile aquatic mobs and provide regeneration.

- [ ] **New Task: Add Paraglider**: A basic form of aerial navigation before Elytra.

- [x] **New Task: Add Pause Menu logic**: The game should pause simulation and background music/sounds when the escape key is pressed and show a "Game Paused" menu.
- [ ] **New Task: Add Sniffers**: Ancient mobs that dig up rare seeds.
- [ ] **New Task: Add Archaeology System**: Use a brush on suspicious sand/gravel to find items.
- [ ] **New Task: Add Trial Chambers**: New procedural combat structures.
- [ ] **New Task: Implement Tricky Trials**: Expand Trial Chambers with Trial Spawners.
- [ ] **Bug: UI Scaling broken on ultra-wide screens**: The hotbar doesn't center properly on very wide displays.
- [ ] **Bug: Missing Hitboxes for Fences, Stairs, and Slabs**: Incomplete block hitboxes allowing players to phase through them. (Status: Hitbox code for stairs is completely missing from physics.js, agents must fix)

- [ ] **New Task: Foxes**: New animal mob that sleeps during the day and hunts at night.
- [ ] **New Task: Weather Sounds**: Add rain and storm sound effects to the audio manager.
- [ ] **New Task: Add Camels**: Desert mounts that can seat two players.
- [ ] **New Task: Add Chiseled Bookshelf**: A bookshelf variant that stores actual books.
- [ ] **New Task: Add Hanging Signs**: Signs that hang from underneath blocks.
- [ ] **New Task: Add Cherry Grove Biome**: A biome featuring pink cherry blossom trees.
- [ ] **Bug: Item drops clipping**: Item drops sometimes clip through solid blocks when spawned.

- [ ] **New Task: Add target lock-on mechanics for hostile mobs**: Hostile mobs currently just walk towards the player. Add a line-of-sight check before aggroing.
- [ ] **New Task: Add block breaking animations**: Show cracking stages when a player is mining a block.
- [ ] **New Task: Add Turtles**: Aquatic mobs that lay eggs on beaches.

- [ ] **New Task: Add Spectator Mode**: Allow players to fly through blocks and observe the world without interacting.
- [ ] **New Task: Add Chat Commands**: Implement basic server-side and client-side chat commands like `/gamemode`, `/tp`, and `/give`.
- [ ] **New Task: Add Ambient Sounds**: Background noises for caves, forests, and oceans.

- [ ] **New Task: Add Ender Chests**: Chests that share inventory across all instances for a player.
- [ ] **New Task: Add Armor Trims**: Customization options for armor using smithing templates.

- [ ] **Bug: Potion effects logic missing**: Potion items exist but effect consumption is not fully implemented.
- [ ] **Bug: Bookshelves missing**: Bookshelves are required for enchanting rooms but block definition/logic is missing.
- [ ] **Bug: Redstone Repeaters and Clocks missing**: Redstone repeaters and clocks are missing from the codebase.

- [ ] **New Task: Add Redstone Torch**: Add redstone torches to provide power to adjacent redstone blocks.
- [ ] **New Task: Add Daylight Sensor**: Add a block that emits a redstone signal based on the time of day.
- [ ] **New Task: Add Copper Blocks**: Blocks that oxidize over time.
- [ ] **New Task: Add Lightning Rods**: Attracts lightning strikes and provides redstone signals.
- [ ] **New Task: Add Candles**: Decorative light source that can be dyed.
- [x] **New Task: Add Armor Slots**: Allow players to equip helmets, chestplates, leggings, and boots.
- [ ] **New Task: Add Redstone Lamps**: Light emitting blocks toggled by redstone.
- [ ] **New Task: Add Slime Blocks**: Bouncy blocks that stick to other blocks when moved by pistons.
- [ ] **New Task: Add Note Blocks**: Blocks that play musical notes when hit or powered.
- [ ] **New Task: Implement Trading System**: Add villagers with different professions that offer item trades using emeralds as currency.
- [ ] **New Task: Add Crossbows**: Implement ranged weapon that takes longer to charge than bows but holds the arrow, and can shoot fireworks.
- [ ] **Bug: Glass Pane HTML Mapping**: Glass Pane block icon rendering fails in inventory UI due to missing HTML setup in index.html.

- [ ] **Bug: Test Suite Collision Random Failures**: Slab and door collision tests randomly fail due to Perlin noise terrain generation overlapping test coordinates. (Status: Clear test area with BLOCK.AIR in beforeEach, agents must fix)
- [ ] **Bug: Player JSDOM LocalStorage Mock Missing**: localStorage needs to be mocked when testing player.js via JSDOM to avoid ReferenceError when reading skin color preferences.
