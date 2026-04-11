# VoxelWeb Future Features & Tasks

This file tracks the status of major gameplay features, architectural tasks, and known bugs.

## Core Features

### 1. World Generation
- [ ] Ores (Coal, Iron, Gold, Diamond)
- [ ] Better cave systems (Ravines, large caves)
- [ ] Structures (Villages, Dungeons)
- [x] **Jungle Biome**
- [ ] **Bamboo Jungle**
- [ ] **Nether Fortresses** (Generation logic in Nether)
- [ ] **Nether Quartz Ore Generation**
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
- [ ] **Missing UI Assets (Partial Implementation)**: Glass Panes and Fences have definitions in blocks.js but are missing from the standard HTML inventory (`index.html`). The inventory items show up correctly inside the 36 inventory slots and hotbar, however `Glass Pane` missing text is visible in the UI logs, and the block icon textures inside `inventory_items.png` failed to load/render correctly. Agents need to fix the CSS/sprite asset mapping.
- [ ] **Door Placement Bug**: The Wood Door recipe is functional in the crafting menu, but placing the door programmatically or in-game has issues that need further agent investigation/fixing.
- [x] **New Task: Add Endermen Water Avoidance**: Endermen should avoid water and take damage when touching it.
- [x] **New Task: Fix Boat Placement**: Ensure that boats can be placed on water blocks and interacted with.
- [ ] **New Task: Implement Pistons**: Add pistons and sticky pistons for moving blocks.
- [ ] **New Task: Implement Redstone Clocks**: Provide a mechanism to create looping redstone signals. (Missing block definition and world update logic).
- [ ] **New Task: Add Bookshelves**: Bookshelves for enchanting rooms. (Missing block definition).
- [ ] **New Task: Add Lava Flow**: Lava should flow slowly and set nearby blocks on fire. (Lava block exists but flow physics is missing).
- [ ] **New Task: Improve Biome Generation**: Make biome transitions smoother and add more variations. (Missing noise transitions in biome.js).
- [ ] **New Task: Add Potion Effects**: Effects like speed, strength, and fire resistance. (Potion item exists but consumption effects logic is missing).
- [x] **New Task: Add Anvils**: For repairing items and naming them.
- [ ] **New Task: Add Armor Stand**: An entity to hold and display armor.
- [ ] **New Task: Add Name Tags**: Item to name mobs to prevent despawning.
- [ ] **New Task: Add Foxes**: New animal mob that sleeps during the day and hunts at night.
- [x] **New Task: Fix Enderman Unloaded Chunk Teleport Bug**: Enderman teleportation uses `getHighestBlockY()`, which returns 0 in unloaded chunks, trapping or killing them.
- [x] **New Task: Fix Anvil Renaming UI Bug**: Anvil renaming correctly updates an item's `name` property, but there is no UI logic (like tooltips or item text rendering) to actually display the custom names to the user in the inventory.
- [x] **Enderman Teleportation NaN Audio Bug**: Enderman teleport logic throws a NaN float error on the AudioParam component in Audio.js when a teleport sends it to unloaded coordinates.
- [ ] **New Task: Implement Redstone Comparators**: Add comparator logic to read block states.
- [ ] **New Task: Add Weather Sounds**: Add rain and storm sound effects to the audio manager.
- [ ] **Bug: Furnace UI Input Validation**: Furnace does not prevent putting non-smeltable items into the input slot or non-fuel items into the fuel slot.

- [ ] **New Task: Add Horses**: Rideable mob with different speeds and jump heights.