# VoxelWeb Future Features & Tasks

This file tracks the status of major gameplay features, architectural tasks, and known bugs.

## Core Features

### 1. World Generation
- [ ] Ores (Coal, Iron, Gold, Diamond)
- [ ] Better cave systems (Ravines, large caves)
- [ ] Structures (Villages, Dungeons)
- [ ] **Jungle Biome**
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
- [ ] **Fix Crosshair Alignment** (Reported as Unresolved in bug_report.md - depending on aspect ratio, it does not align perfectly)

### 4. Player Mechanics
- [ ] Drowning
- [ ] **Fix Endermen Teleportation Logic** (Avoid water and teleport randomly on attack)
- [ ] **Elytra** (Gliding mechanics)
- [ ] **Tridents** (Throwing, returning, Riptide)

### 5. Entities & Mobs
- [ ] Complex AI (Pathfinding, fleeing, attacking)
- [x] Villagers (Trading system)
- [ ] **Implement Shears Functionality** (Shear sheep, leaves, grass)
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
- [ ] **Save Compression**
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
- [ ] **Implement Endermen Teleportation Logic**: Allow Endermen to randomly teleport when attacked or touched by water.
- [ ] **Missing UI Assets**: Glass Panes and Fences have definitions in blocks.js but are missing from the standard HTML inventory (`index.html`). (Note: Tested via `test_specific_features.py`. The inventory items show up correctly inside the 36 inventory slots and hotbar, however `Glass Pane` missing text is visible in the UI logs, and the block icon textures inside `inventory_items.png` failed to load/render correctly. Needs CSS/sprite asset review.)
- [ ] **Missing Wood Door Recipe**: Game has wood door block but lacks a recipe mapping in `js/crafting.js` to create them from wooden planks. (Note: The feature script `test_specific_features.py` failed to programmatically place the door. A manual review via `door_placed.png` confirms the Wood Door recipe is indeed functional in the crafting menu, but placing the door programmatically or in-game has issues that need further agent investigation/fixing).
- [x] **Crosshair Alignment Unresolved Bug**: The crosshair alignment is still reported as unresolved in `bug_report.md` because it may not perfectly align with the target center depending on aspect ratio and scale.
- [ ] **Minecarts and Boats**: Missing implementations.
- [ ] **Jukebox & Music Discs**: Missing implementations.
- [ ] **Signs**: Missing implementations.
- [ ] **Saplings**: Missing implementations.
- [ ] **Animal Breeding**: Missing implementations.
- [ ] **Water Flow Visuals**: Missing implementations.
