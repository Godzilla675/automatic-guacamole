# VoxelWeb Future Features & Tasks

This file tracks the status of major gameplay features, architectural tasks, and known bugs.

## Core Features

### 1. World Generation
- [ ] Better cave systems (Ravines, large caves)
- [x] **Jungle Biome**
- [ ] **Bamboo Jungle**
- [ ] **Nether Fortresses** (Generation logic in Nether)
- [ ] **Swamp Biome**
- [ ] **Badlands Biome**
- [ ] **Desert Temple**

### 2. Block System
- [ ] **Implement Sponges** (Removes surrounding water blocks)
- [ ] **Top Slabs** (Placement in upper half of block)
- [ ] **Decorative blocks** (Glazed Terracotta, Concrete)
- [ ] **Redstone-like logic blocks** (Comparators, Repeaters)

### 3. Rendering Engine
- [ ] Smooth lighting
- [ ] Custom shaders
- [ ] Day/Night cycle rendering (Sky colors, sun/moon)
- [ ] **Better shadows and lighting** (Dynamic shadows)
- [ ] **Clouds and better skybox**
- [ ] **Head bobbing animation**
- [x] **Fix Crosshair Alignment**: Crosshair alignment is fixed, but needs to be tested on ultra-wide screens.

### 4. Player Mechanics
- [ ] Drowning
- [x] **Fix Endermen Teleportation Logic** (Avoid water and teleport randomly on attack)
- [ ] **Elytra** (Gliding mechanics)
- [ ] **Tridents** (Throwing, returning, Riptide)

### 5. Entities & Mobs
- [ ] Complex AI (Pathfinding, fleeing, attacking)
- [x] Villagers (Trading system)
- [ ] **Implement Shears Functionality** (Partial: sheep shearing implemented, missing leaves/grass directly to inventory)
- [ ] **Pandas**
- [ ] **Wither Boss**
- [ ] **Slime Mob**
- [ ] **Magma Cube Mob**
- [ ] **Ender Dragon Boss**
- [ ] **Rideable Pigs** (With carrot on a stick)

### 6. Items & Crafting
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
- [x] **Save Compression**
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
- [ ] **Implement Droppers and Dispensers**
- [ ] **Implement Hoppers**
- [ ] **Redstone Repeaters & Comparators**
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
- [x] Weather system (Rain, Snow)
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
- [ ] **Implement Sponges**: A block that removes surrounding water blocks within a certain radius.
- [ ] **Implement Droppers and Dispensers**: Redstone interaction for items.
- [ ] **Implement Hoppers**: Add transfer logic to move items between inventories/containers.
- [ ] **Implement Item Frames**: Add wall placement logic and rendering for items inside frames.
- [ ] **Implement Fire Spread**: Add fire blocks and logic for them to spread to flammable blocks over time.
- [ ] **Implement Sleeping Through the Night**: Logic to check if all players are in beds, and skip to daytime.
- [ ] **Implement Shears Functionality**: Expand logic to shear leaves and grass directly into the inventory.
- [x] **Implement Endermen Teleportation Logic**: Allow Endermen to randomly teleport when attacked or touched by water.
- [ ] **Missing UI Assets (Partial Implementation)**: Glass Panes and Fences have definitions in blocks.js but are missing from the standard HTML inventory (`index.html`). The inventory items show up correctly inside the 36 inventory slots and hotbar, however `Glass Pane` missing text is visible in the UI logs, and the block icon textures inside `inventory_items.png` failed to load/render correctly. (Status: Still missing in HTML mapping, agents must fix)
- [ ] **Door Placement Bug**: The Wood Door recipe is functional in the crafting menu, but placing the door programmatically or in-game has issues that need further agent investigation/fixing. (Status: Door placement logic exists but is failing, agents must fix)
- [x] **New Task: Add Endermen Water Avoidance**: Endermen should avoid water and take damage when touching it.
- [ ] **New Task: Endermen Block Carrying**: Endermen should randomly pick up and place certain blocks.
- [ ] **New Task: Fix Boat Placement**: Ensure that boats can be placed on water blocks and interacted with. (Status: placement logic exists but fails to spawn the entity, agents must fix)
- [ ] **New Task: Implement Redstone Clocks**: Provide a mechanism to create looping redstone signals. (Missing block definition and world update logic).
- [ ] **New Task: Add Bookshelves**: Bookshelves for enchanting rooms. (Missing block definition).
- [ ] **New Task: Add Lava Flow**: Lava should flow slowly and set nearby blocks on fire. (Lava block exists but flow physics is missing).
- [ ] **New Task: Improve Biome Generation**: Make biome transitions smoother and add more variations. (Missing noise transitions in biome.js).
- [ ] **New Task: Add Potion Effects**: Effects like speed, strength, and fire resistance. (Potion item exists but consumption effects logic is missing).
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
- [x] **Bug: Boat drops on destruction**: Destroying a boat should drop its item form instead of disappearing.

- [ ] **New Task: Add Horses**: Rideable mob with different speeds and jump heights.
- [ ] **New Task: Add Shulkers**: New hostile mob that shoots levitation projectiles in End Dimension.
- [ ] **New Task: Add Elytra**: Implement gliding mechanics when jumping in mid-air.
- [ ] **New Task: Add Villager Professions**: Different skins and trades based on claimed workstations.
- [ ] **New Task: Add End City**: Generate end city structures in the End Dimension with valuable loot.
- [x] **Bug: Player Inventory Full Drop**: When picking up items with a full inventory, they should remain on the ground instead of disappearing.
- [ ] **Bug: Mob rendering depth sorting**: When multiple mobs overlap, depth sorting sometimes renders the further mob in front.

- [x] **Bug: Missing style object verification**: When interacting with `document.documentElement.style` in UI scripts (like `js/ui.js`), verify the existence of the `style` object first to prevent `TypeError` exceptions during JSDOM testing.
- [x] **Bug: Random failures in test_implemented_features.js**: Random test failures related to slab collision and door physics logic asserting true instead of false.

- [ ] **New Task: Implement Armor Durability**: Armor should lose durability when taking damage.
- [ ] **New Task: Add Snow Golems**: Craftable utility mob using snow blocks and pumpkin.
- [ ] **New Task: Structures (Dungeons)**: Generate dungeon structures in the overworld.
- [x] **Bug: Test Runner ESM Translator Error**: Several tests fail with ESM module errors or missing dependencies when running test_runner.py, agents must fix the test environment.
- [x] **Bug: JSDOM Canvas Mock Missing Methods**: JSDOM canvas mocks require save and restore methods to prevent errors during Minimap updates.
- [ ] **New Task: Add Goats**: New mob that rams players and entities.
- [ ] **New Task: Add Warden**: A blind, powerful mob that spawns in the Deep Dark biome and hunts by sound.
- [ ] **New Task: Add Axolotls**: Passive aquatic mobs that fight hostile aquatic mobs and provide regeneration.
