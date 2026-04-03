# VoxelWeb Future Features & Tasks

This file tracks the status of major gameplay features, architectural tasks, and known bugs.

## Core Features

### 1. World Generation
- [x] Perlin noise terrain generation
- [x] Biome system (Plains, Desert, Forest, Snow, Taiga)
- [x] Tree generation (Oak, Birch)
- [x] **Spruce tree generation** (Using `BLOCK.SPRUCE_WOOD` and `BLOCK.SPRUCE_LEAVES`)
- [x] Cactus generation
- [x] Basic caves
- [x] Water generation (Oceans, Lakes)
- [x] **Rivers and Lakes generation** (Improved carving and depth logic)
- [ ] Ores (Coal, Iron, Gold, Diamond)
- [x] Grass/Dirt/Stone layering
- [ ] Better cave systems (Ravines, large caves)
- [ ] Structures (Villages, Dungeons)
- [x] **Village Layouts** (Basic structure generation points exist)

### 2. Block System
- [x] Block dictionary implementation (`blocks.js`)
- [x] Transparent blocks (Glass, Leaves)
- [x] Liquid blocks (Water)
- [x] Animated blocks (Water)
- [x] Block metadata support
- [ ] **Implement Sponges** (Removes surrounding water blocks)
- [x] Custom block models (Slabs, Stairs, Fences)
- [x] **Note Blocks** (Music notes on interaction/redstone)
- [x] **Slabs and Stairs physics**
- [x] Signs (Text rendering)
- [x] **Placeable Wool**

### 3. Rendering Engine
- [x] Chunk-based meshing
- [x] Texture atlas support
- [x] Basic lighting calculations (ambient occlusion)
- [ ] Smooth lighting
- [x] Frustum culling
- [x] Transparency sorting
- [ ] Custom shaders
- [ ] Day/Night cycle rendering (Sky colors, sun/moon)
- [x] **Fix Crosshair Alignment** (Canvas-rendered crosshair dynamically aligned based on window size and `hasTarget` state)
- [x] **Configurable UI Scaling** (Dynamically adjusts HUD and Menus)
- [x] **Fix Spruce Tree Visuals**

### 4. Player Mechanics
- [x] Movement (Walk, Sprint, Jump, Sneak, Fly)
- [x] Collision detection (AABB)
- [x] Block breaking/placing
- [x] Inventory system (Hotbar + main inventory)
- [x] Drag & drop inventory UI
- [x] Health system
- [ ] Hunger system
- [x] Fall damage
- [ ] Drowning
- [x] Interactions (Doors, Chests, Crafting Tables)
- [ ] **Fix Endermen Teleportation Logic** (Avoid water and teleport randomly on attack)
- [x] **Crouch Mechanics**

### 5. Entities & Mobs
- [x] Base entity system
- [x] Passive mobs (Pig, Sheep)
- [x] Hostile mobs (Zombie, Skeleton, Creeper)
- [x] **Camel Mob** (Desert mount)
- [ ] Animal breeding (Feeding mechanics)
- [ ] Taming mechanics
- [ ] Mob drops
- [ ] Complex AI (Pathfinding, fleeing, attacking)
- [ ] Villagers (Trading system)
- [x] **Trading System** (UI and basic Emerald mechanics)
- [ ] **Implement Shears Functionality** (Shear sheep, leaves, grass)

### 6. Items & Crafting
- [x] Item system (Separate from blocks)
- [x] 2x2 Crafting (Inventory)
- [x] 3x3 Crafting (Crafting Table)
- [x] Furnace smelting
- [ ] Tool durability
- [ ] Armor system
- [x] Weapons (Swords, Bows)
- [ ] Potions and Brewing
- [x] **Bundles** (Inventory management item)
- [x] **Trading UI** (Villager trading mechanism with Emeralds)

### 7. Lighting System
- [x] Sunlight propagation
- [x] Block light (Torches, Glowstone)
- [x] Dynamic updates on block place/break
- [ ] Colored lighting
- [x] **Fix Lighting Cleanup** (Correct light cleanup for ambient light)

### 8. Physics
- [x] Gravity
- [x] Velocity and acceleration
- [x] Raycasting for block selection
- [x] Water flow logic (Spreading and source blocks)
- [x] Projectile physics (Arrows)
- [x] **Fix Projectile Collision** (Ignore non-solid blocks)

### 9. World Management
- [x] Infinite terrain generation
- [x] Chunk loading/unloading
- [x] World serialization/saving (Local Storage/IndexedDB)
- [x] **Optimize Chunk Serialization** (Run-Length Encoding)

### 10. User Interface
- [x] Main menu
- [x] Pause menu
- [x] Settings menu (FOV, Render Distance, Audio)
- [x] In-game HUD (Health, Hunger, Hotbar, Crosshair)
- [x] Inventory screen
- [x] Chat interface
- [ ] **Add Configurable UI Scaling Setting**

### 11. Audio
- [x] Sound engine implementation
- [x] Block breaking/placing sounds
- [x] Footstep sounds
- [x] UI sounds
- [x] Ambient sounds
- [x] **Implement Proper Block Placement Sounds** (Varies based on block material)
- [ ] Music system
- [x] **3D Positional Audio** (Using PannerNode)

### 12. Redstone & Mechanics
- [x] Redstone dust logic (Signal strength, propagation)
- [x] Redstone torches (Powering, inversion)
- [x] **Fix Redstone NOT Gate Logic** (Signal inversion and cutoff)
- [x] **Fix Redstone Wire Propagation** (Signal spreads through adjacent wire blocks)
- [x] Doors (Wooden, Iron)
- [x] Buttons and levers
- [x] Pistons
- [ ] **Implement Droppers and Dispensers**
- [ ] **Implement Hoppers**
- [x] **Fix Redstone/Torch Structural Integrity** (Blocks break if supporting block is removed)

### 13. Networking (Multiplayer)
- [x] Server-client architecture (Node.js + WebSockets)
- [x] Player synchronization (Position, rotation)
- [x] World synchronization (Block updates)
- [x] Chat synchronization
- [ ] Entity synchronization
- [ ] Inventory synchronization

### 14. Modding & API
- [x] Plugin system architecture
- [ ] Custom block registration
- [ ] Custom item registration
- [ ] Event hooks
- [ ] Custom commands

### 15. Miscellaneous
- [x] Command system (`/gamemode`, `/tp`, `/time`)
- [x] **Particle System** (Breaking blocks, explosions)
- [ ] Weather system (Rain, Snow)
- [ ] Day/Night cycle implementation (Logic)
- [ ] Achievements
- [ ] Statistics
- [x] **Fix placeBlock() Raycast Origin** (Use eye position, not feet)

### 16. Test Suite and CI
- [x] Automated test runner (`test_runner.py`)
- [x] Core system tests (Chunk loading, Block placement)
- [x] Physics tests
- [x] UI Verification scripts
- [x] Setup comprehensive CI environment

## Known Bugs & Issues (To Be Fixed)
- [ ] **Implement Sponges**: A block that removes surrounding water blocks within a certain radius.
- [ ] **Implement Droppers and Dispensers**: Redstone interaction for items.
- [ ] **Implement Hoppers**: Add transfer logic to move items between inventories/containers.
- [ ] **Implement Item Frames**: Add wall placement logic and rendering for items inside frames.
- [ ] **Implement Fire Spread**: Add fire blocks and logic for them to spread to flammable blocks over time.
- [ ] **Implement Sleeping Through the Night**: Logic to check if all players are in beds, and skip to daytime.
- [ ] **Implement Shears Functionality**: Expand logic to shear leaves and grass directly into the inventory.
- [ ] **Implement Endermen Teleportation Logic**: Allow Endermen to randomly teleport when attacked or touched by water.
- [x] **Fix Test Suite jsdom Error**: Many tests are failing with `Cannot find module 'jsdom'` in the root test runner (`test_runner.py`). The CI environment needs to correctly resolve and import `jsdom` or mock it properly.
- [x] **Fix Verification Scripts Timeout**: `verification/verify_recipe_ui.py` fails randomly with a timeout waiting for `#start-game` when run as part of the full test suite in `test_runner.py`. Agents must fix this.
- [x] **Fix Trading UI Bug**: The trading UI fails to open, throwing `TypeError: Cannot read properties of undefined (reading 'trades')` in `js/ui.js:510`.
- [x] **Fix Brewing UI Bug**: The brewing UI fails to open, throwing `TypeError: Cannot read properties of undefined (reading 'bottles')` in `js/ui.js:543`.
- [x] **Fix tests/test_implemented_features.js Failing Due to Slab Collision & Door Logic**: Fixed strict equal variable isolation causing floating point test bugs.
