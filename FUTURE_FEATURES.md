# Future Features & Tasks

This document outlines the priorities and workflow for all agents working on this repository.

## 1. High Priority: New Features
*Focus on adding content and gameplay mechanics.*

### Nether Dimension (Major Update)
- [ ] **Implement Nether World Generation** (New `generateNetherChunk` in `world.js`, Bedrock roof/floor, Lava lakes, Glowstone)
- [ ] **Implement Dimension Switching** (Logic in `game.js` to switch `world.dimension`, clear chunks, scale coordinates 8:1)
- [ ] **Implement Nether Portal Logic** (Activation loop, Teleportation timer, Portal frame detection)
- [ ] **Implement Nether Mobs** (Pigman, Ghast, Blaze - AI & Assets in `mob.js`)

### Gameplay Extensions
- [ ] **Implement Creative Mode** (Flight, No Damage, Infinite Items)
- [ ] **Implement Enchanting System** (UI, Enchantment logic, Lapis usage)
- [ ] **Implement Anvil & Repair UI** (UI for repairing/renaming items)
- [ ] **Implement Potion Brewing Logic & UI** (Brewing Stand UI, Potion effects)
- [ ] **Implement Crafting Animations** (Visual feedback)
### Gameplay Mechanics
- [x] **Implement Armor System** (Helmet, Chestplate, Leggings, Boots; rendering and damage reduction)
- [ ] **Implement Redstone Repeaters & Comparators** (Delays, locking, signal strength logic)
- [ ] **Implement Redstone Input Devices** (Levers, Buttons, Pressure Plates)
- [ ] **Implement Cow Milking** (Use bucket on cow to get milk)
- [ ] **Implement Sheep Shearing** (Use shears on sheep to get wool)

## 2. Medium Priority: Bugs & Maintenance
*Fix reported bugs and ensure stability.*

- [ ] **Fix Verification Suite** (Many tests fail due to missing `ParticleSystem` dependency or incomplete mocks; `verify_fishing.js` fails)
- [ ] **Fix Water Flow Visuals** (Sometimes lags or doesn't update immediately)
- [ ] **Audit and Verify All Features** (Run full regression suite)
- [ ] **Fix Node.js Test Environment** (Install/Configure jsdom for UI tests)
- [ ] **Fix Verification Suite** (Global Fix: Entity, AudioContext, ParticleSystem missing in tests)
- [ ] **Fix World Saving / Chunk Serialization** (Test failed: chunk.pack is not a function)
- [ ] **Fix Fall Damage Verification** (Test failed)
- [ ] **Fix Signs Verification** (Test failed: AudioContext)
- [ ] **Fix Projectiles Verification** (Test failed: Entity not defined)
- [ ] **Fix Water Flow Verification** (Test failed)
- [ ] **Fix Mobs & Drops Verification** (Test failed)
- [ ] **Fix Cactus Damage Verification** (Test failed)
- [ ] **Implement Note Blocks** (Musical notes based on interaction/redstone)
- [ ] **Cleanup Deprecated Items** (Remove unused IDs like ITEM_WOOL)
- [x] **Implement Day/Night Cycle Visuals** (Sun/Moon movement, sky gradients)
- [x] **Improve Mob AI** (Better pathfinding, aggressive behavior refinements)

## 3. Low Priority: Code Quality & Polish
*Refactors, optimization, and minor UI improvements.*

### User Interface Improvements
- [ ] Minimap
- [ ] Achievement system
- [ ] Tutorial/help system
- [ ] **Implement Save Compression** (Reduce save file size using pako/gzip)
- [x] FOV Slider (Backend done, verified UI hook)
- [x] Mouse Sensitivity Control
- [x] Minimap
- [x] Achievement system
- [x] Tutorial/help system

### Optimization
- [ ] **Optimize Chunk Serialization** (Current `btoa` approach is inefficient; use binary or compression)
- [ ] **Refactor World/Chunk Separation**

### Misc
- [ ] Plugin API
- [x] Plugin API (Basic event system implemented)

## Completed Features
*Keep a record of what works.*

### New Features (Recently Completed)
- [x] **Implement Armor System** (Helmet, Chestplate, Leggings, Boots; rendering and damage reduction) - *Verified*
- [x] **Implement Hunger Effects** (Sprint limiting, health regeneration) - *Verified*
- [x] **Implement Entity/Vehicle System** (Base system for Minecarts, Boats, etc.) - *Verified*
- [x] **Implement Minecarts and Rails** (Physics, riding logic, rail connectivity) - *Verified*
- [x] **Implement Boats** (Water physics, riding logic) - *Verified*
- [x] **Implement Anvils** (Repair/Rename items, combining enchantments) - *Verified*
- [x] **Refactor Physics for Entities** (Raycast/Collision for non-block entities) - *Verified*
- [x] **Implement Jukebox & Music Discs** - *Verified*
- [x] **Implement Signs** (Placement, Text Input UI, Rendering Text)
- [x] **Implement Creative Mode** (Flying, God Mode, Infinite Inventory)
- [x] **Expand Command System** (Implement `/gamemode`, `/give`, `/tp`)
- [x] **Implement Enchanting Table UI & Logic** (Fully Implemented)
- [x] **Implement Player Skins & Nametags** (Visual differentiation)
- [x] **Implement Recipe Discovery System** (Unlock recipes as items are gathered)
- [x] **Implement Crafting Animations**
- [x] **Implement Potion Brewing Logic & UI**
- [x] **Implement Nether World Generation** (Basic generation implemented)
- [x] **Implement Nether Mobs** (Pigman, Ghast, Blaze implemented)
- [x] **Implement Nether Portal**
- [x] **Implement Chicken Mob**
- [x] **Implement Creeper Mob**
- [x] **Implement Enderman Mob**
- [x] **Implement Weather System** (Rain, Snow)
- [x] **Implement Redstone Circuits** (Wire, Torch, Lamp, Power logic)
- [x] **Implement Pistons** (Push/Pull logic, Sticky Pistons)
- [x] **Implement TNT & Explosions** (Physics, Damage)
- [x] **Implement Farming Extensions** (Carrots, Potatoes, Melons, Pumpkins)
- [x] **Implement Saplings and Tree Propagation**
- [x] **Implement Experience System** (XP Drops & Leveling)
- [x] **Implement Save/Load UI**

### New Building Blocks
- [x] **Implement Stairs**
- [x] **Implement Fences and Fence Gates**
- [x] **Implement Trapdoors**
- [x] **Implement Glass Panes**
- [x] **Implement Birch Trees**
- [x] **Implement Pistons**
- [x] **Implement Nether Portal Block (ID 196)** (Logic pending)
- [x] **Implement Stairs** (Placement logic, complex collision, visual models)
- [ ] **Implement Fences and Fence Gates** (Connectivity logic, physics)
- [ ] **Implement Glass Panes / Windows** (Connectivity logic with neighbors)
- [ ] **Implement Trapdoors** (Open/close logic, physics)
- [ ] **Implement Birch Wood & Leaves**
- [ ] **Implement Top Slabs** (Placement logic & Physics)

### 2. Advanced World Generation
- [ ] **Expand Village Generation** (Generate Houses, Paths, and Layouts - currently only Wells exist)
- [ ] **Rivers and Lakes** (Hydrology system)
- [ ] **Generate Birch Trees**
- [x] Biomes (Implemented basic noise-based terrain)
- [x] Caves and underground systems (3D Noise holes)
- [x] Ore generation (Coal, Iron, Gold, Diamond)
- [x] Better terrain generation using Perlin/Simplex noise
- [x] World seeds for reproducible generation
- [x] **Implement Structure Manager** (System to spawn structures like Trees, Wells, Ruins)
- [x] **Implement Basic Structure Generation** (Wells, Trees, Cacti)
- [x] **Implement Biome Manager** (Distinct regions for Desert, Forest, Snow)
- [x] **Implement Desert Biome** (Sand, Cactus)
- [x] **Implement Snow Biome** (Snow blocks, Ice, Spruce Trees)

### 3. Crafting System
- [ ] Crafting animations
- [ ] Recipe discovery system
- [x] Crafting table interface (UI implemented)
- [x] Recipes for tools, blocks, and items (Block and Tool recipes implemented)
- [x] Resource gathering requirements (Inventory consumption implemented)
- [x] **Implement Fences and Fence Gates** (Connectivity logic, physics)
- [x] **Implement Trapdoors** (Open/close logic, physics)
- [x] **Implement Glass Panes / Windows** (Connectivity logic with neighbors)
- [x] **Implement Birch Trees** (Blocks & Generation)
- [x] **Implement Concrete Blocks**
- [x] **Implement Colored Wool Blocks**
- [x] Additional block types (brick, concrete, wool colors)

### Advanced World Generation
- [x] **Expand Village Generation**
- [x] **Rivers and Lakes**
- [x] Biomes
- [x] Caves and underground systems
- [x] Ore generation
- [x] Better terrain generation
- [x] World seeds
- [x] **Implement Structure Manager**
- [x] **Implement Basic Structure Generation**
- [x] **Implement Biome Manager**
- [x] **Implement Desert/Snow/Jungle Biomes**

### Crafting System
- [x] Crafting table interface
- [x] Recipes for tools, blocks, and items
- [x] Resource gathering requirements
- [x] **Smelting System (Furnace UI & Logic)**
- [x] **Implement Recipe Book UI**

### Tools and Items
- [x] **Implement Bow and Arrow**
- [x] **Implement Shield**
- [x] Pickaxes, Shovels, Axes, Swords
- [x] Tool durability system
- [x] **Implement Tool Repair Logic** (UI pending Anvil, Crafting grid repair works)
- [x] **Implement Fishing Mechanic**

### 5. Mobs and AI
- [ ] **Implement Villagers**
- [ ] **Implement Iron Golem**
### Mobs and AI
- [x] Passive mobs (Cows, Pigs, Sheep, Chicken)
- [x] Hostile mobs (Zombies, Skeletons, Spiders, Creepers, Endermen)
- [x] Mob AI pathfinding
- [x] **Implement Animal Breeding** (Feeding animals to spawn babies)
- [x] Passive mobs (Cows, Pigs, Sheep implemented)
- [x] Hostile mobs (zombies, skeletons, spiders)
- [x] Mob AI pathfinding (Random movement and Chase behavior implemented)
- [x] Day/night spawn cycles
- [x] Mob drops and loot
- [x] Health and combat system
- [x] **Implement Taming** (Wolves)
- [x] **Implement Villagers & Trading**
- [x] **Implement Iron Golems**

### Core Mechanics
- [x] Sprinting mechanic
- [x] Fall damage
- [x] Hunger system
- [x] Eating/Food Consumption
- [x] **Bed & Sleeping**
- [x] **Experience System** (XP Drops & Leveling)
- [x] **Save/Load UI**

### Enhanced Building Blocks
- [x] **Implement Doors**
- [x] **Implement Slabs**
- [x] **Implement Chests and Storage**
- [x] Torches (Lighting system)

### General Fixes & Improvements
- [x] **Implement Weather System**
- [x] **Implement Redstone Circuits**
- [x] **Implement TNT & Explosions**
- [x] **Implement Farming Extensions**
- [x] **Implement Particle System**
- [x] **Fix Redstone Integrity**
- [x] **Fix Projectile Collision**
- [x] **3D Positional Audio**
- [x] Hunger system (Decay and starvation implemented)
- [x] Eating/Food Consumption (Implemented, including sound)
- [x] **Bed & Sleeping (Skip Night)**

### Enhanced Building Blocks
- [x] **Implement Doors** (Open/Close logic, models)
- [x] **Implement Slabs** (Placement logic, half-block physics)
- [x] **Implement Chests and Storage** (UI, persistence)
- [x] Torches (Lighting system) (Basic light propagation and recipes implemented)

## Medium Priority Features

### 8. User Interface Improvements
- [ ] FOV Slider
- [ ] Mouse Sensitivity Control
- [ ] Minimap
- [ ] Achievement system
- [ ] Tutorial/help system
- [x] **Settings Menu (Controls, Sound, Graphics)**
- [x] **Volume Controls**
- [x] Coordinates toggle (F3)
- [x] Better mobile UI scaling
- [x] Dynamic Crosshair

### 9. Advanced Building Blocks (Remaining)
- [ ] Decorative blocks
- [ ] Redstone-like logic blocks

### 10. World Saving/Loading
- [ ] Export/import world data
- [ ] Auto-save functionality
- [x] Save world state to browser localStorage (Implemented in `js/world.js`)
- [x] Load saved worlds
- [x] Multiple world slots

### 11. Advanced Graphics
- [ ] Better shadows and lighting
- [ ] Dynamic Lighting (Handheld torch light)
- [ ] Particle effects (breaking blocks, water splash)
- [ ] Ambient occlusion
- [ ] Water animations and flow (Visuals implemented)
- [ ] Weather effects (rain, snow)
- [ ] Clouds
- [ ] Better skybox
- [ ] Head bobbing animation
- [ ] Sun/Moon rendering
- [x] Block breaking animation (Basic progress bar implemented)

### 12. Sound System
- [ ] **Background Music**
- [x] Block breaking sounds
- [x] Footstep sounds
- [x] Ambient sounds (water, wind) (Implemented in `js/audio.js`)
- [x] Sound effects for actions

### 13. Farming & Nature
- [x] **Farming System (Hoe, Seeds, Wheat, Crops)**
- [x] **Animal Breeding**
- [x] **Fishing**

### 14. Inventory Enhancements
- [ ] Quick item swap
- [ ] Inventory sorting
- [x] **Full Inventory UI** (Data implemented, UI missing)
- [x] Drag and drop items
- [x] Item stacking (Simple stacking implemented in drops)
- [x] Hotbar number indicators

## Low Priority / Polish Features

### 15. Advanced Gameplay
- [ ] Experience points and levels
- [ ] Enchanting system
- [ ] Potions and brewing
- [x] Health regeneration (Implemented in `js/player.js`)

### 16. Creative Mode Features
- [ ] Unlimited blocks
- [ ] Instant block breaking
- [ ] No collision mode (noclip)
- [ ] Weather control
- [x] Fly mode toggle (Key 'F')
- [x] World edit tools (copy, paste, fill) - Fill tool implemented
- [x] Time control

### 17. Performance Optimizations
- [ ] LOD (Level of Detail) system
- [ ] Worker threads for world generation
- [ ] Better memory management
- [ ] Greedy meshing for fewer draw calls
- [x] Chunk-based rendering optimization
- [x] Frustum culling improvements
- [x] Occlusion culling (Exposed Face Caching)

### 18. Social Features
- [ ] Screenshot system
- [ ] Share world links
- [ ] Leaderboards
- [ ] World showcase gallery
- [ ] Friends system

### 19. Advanced Building Tools
- [ ] Copy/paste structures
- [ ] Symmetry mode
- [ ] Fill tool
- [ ] Replace tool
- [ ] Undo/redo system

### 20. World Interaction (Misc)
- [ ] Minecarts and rails
- [ ] Boats
- [ ] Signs and text

### 21. Modding Support
- [ ] Plugin API
- [ ] Custom block types
- [ ] Custom mob types
- [ ] Event hooks
- [ ] Resource pack support
- [ ] Texture customization

## Bugs & Maintenance

### 22. Known Bugs & Issues
- [ ] **Implement Beef Item and Cow Drops** (Cows currently drop nothing or leather only; need ITEM_BEEF/STEAK)
- [x] **Refactor Structure Manager**: Move specific structure logic (Wells, Trees) into separate classes or modules to support expanding Village generation.
- [ ] **Fix Verification Scripts**: Several verification scripts in `verification/` (e.g., `verify_lighting.js`, `verify_projectile.js`, `verify_blocks.js`) are failing due to environment setup issues or outdated logic, despite the features working. Update them to correctly mock the environment (e.g., `window` globals, dependent modules).
- [x] **Fix Water Flow Logic**: Current implementation is basic; improve to match Minecraft mechanics (limited spread, source block creation).
- [x] **Fix Spruce Tree Visuals**: Spruce trees currently use Oak blocks (`BLOCK.WOOD` and `BLOCK.LEAVES`). Implement and use `BLOCK.SPRUCE_WOOD` and `BLOCK.SPRUCE_LEAVES`.

### 23. Multiplayer Support (Completed)
- [x] WebSocket-based real-time multiplayer (Implemented `NetworkManager` in `js/network.js` and `server/server.js`)
- [x] Player synchronization across clients
- [x] Chat system
- [x] Player name tags
- [x] Server infrastructure (Node.js + WebSocket)
- [x] Player spawn points
- [x] Shared world state (Real-time sync only, no server-side persistence yet)

### 24. Completed Fixes (History)
- [x] Verified all implemented features (Crafting, Mobs, Physics, Saving, Commands) with comprehensive test suite
- [x] **Fix Water Flow Logic**: Current implementation is basic; improve to match Minecraft mechanics (limited spread, source block creation).
- [x] **Fix Spruce Tree Visuals**: Spruce trees currently use Oak blocks (`BLOCK.WOOD` and `BLOCK.LEAVES`). Implement and use `BLOCK.SPRUCE_WOOD` and `BLOCK.SPRUCE_LEAVES`.
### General Fixes & Improvements
- [x] **Verify Multiplayer Sync** (Ensure positions/actions sync correctly across clients)
- [x] **Optimize Chunk Serialization** (Use binary/compressed format instead of Base64 strings to save space)
- [x] **Implement 3D Positional Audio** (Use PannerNode for spatial sound)
- [ ] **Fix Verification Suite** (Many tests fail due to missing `ParticleSystem` dependency or incomplete mocks; includes `verify_tool_repair.js`)
- [x] **Fix Redstone Wire Propagation** (Signal does not propagate between wire blocks)
- [x] **Fix Verification Suite Mocks** (AudioContext mocks missing createPanner/createOscillator)
- [ ] **Audit and Verify All Features** (Run full regression suite)
- [x] **Fix verify_blocks.js logic error**
- [x] **Fix Lighting Cleanup**
- [x] **Refactor Structure Manager**
- [x] **Fix Water Flow Logic**
- [x] **Fix Spruce Tree Visuals**
- [x] **Multiplayer Support** (Basic WebSocket implementation exists)
- [x] **Complete Settings Menu**
- [x] **Implement Village Layouts**
- [x] **Fix Tree Generation Height Limit**
- [x] **Fix Redstone/Torch Structural Integrity** (Implemented integrity checks)
- [x] **Fix Projectile Collision** (Arrows ignore non-solid blocks)
- [x] **Implement Particle System** (Visuals for breaking blocks, explosions)
- [ ] Verified all implemented features (Crafting, Mobs, Physics, Saving, Commands) with comprehensive test suite
- [x] Fix Tree Generation at Chunk Boundaries
- [x] Fix memory management strategy
- [x] Optimize render loop
- [x] Remove dead code
- [x] Fix Crafting System
- [x] Fix Footstep Sounds
- [x] Fix Crouch Mechanics
- [x] Fix Block IDs
- [x] Fix Water Physics
- [x] Fix Projectile Collision
- [x] Implement Ambient Sounds
- [x] Fix Physics Crash
- [x] Fix Fall Damage Logic
- [x] Implement Block Entity Persistence
- [x] Implement Farming
- [x] Implement Settings UI & Volume Control
- [x] Implement Full Inventory UI with Drag & Drop
- [x] Fix Empty Inventory Screen
- [x] Implement Furnace Block Logic
- [x] Water Flow Visuals
- [x] Make Wool Placeable
- [x] Fix Infinite Blocks / Inventory Consumption on Placement
- [x] Implement Water Flow Logic
- [x] Implement Cactus Damage
- [x] Implement Rivers and Lakes
- [x] Fix Renderer Syntax Error (Illegal continue)
- [x] **Fix Redstone NOT Gate Logic** (Implemented signal inversion and signal cutoff)

## Contribution Guidelines
* When adding a new feature, please update this file.
* Ensure all tests pass before submitting.
* Follow the code style of the existing project.
