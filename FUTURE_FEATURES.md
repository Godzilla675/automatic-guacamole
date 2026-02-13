# Future Features & Tasks

This document outlines the priorities and workflow for all agents working on this repository.

## 1. High Priority: New Features
*Focus on adding content and gameplay mechanics.*

### Gameplay Mechanics
- [x] **Implement Armor System** (Helmet, Chestplate, Leggings, Boots; rendering and damage reduction)
- [ ] **Implement Redstone Repeaters & Comparators** (Delays, locking, signal strength logic)
- [ ] **Implement Redstone Input Devices** (Levers, Buttons, Pressure Plates)
- [ ] **Implement Cow Milking** (Use bucket on cow to get milk)
- [ ] **Implement Sheep Shearing** (Use shears on sheep to get wool)

## 2. Medium Priority: Bugs & Maintenance
*Fix reported bugs and ensure stability.*

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
- [ ] **Implement Save Compression** (Reduce save file size using pako/gzip)
- [x] FOV Slider (Backend done, verified UI hook)
- [x] Mouse Sensitivity Control
- [x] Minimap
- [x] Achievement system
- [x] Tutorial/help system

### Misc
- [x] Plugin API (Basic event system implemented)

## Completed Features
*Keep a record of what works.*

### New Features (Recently Completed)
- [x] **Add Block & Mob Textures** (Procedural 16x16 pixel-art textures for all blocks and mob sprites)
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
- [x] **Implement Stairs** (Placement logic, complex collision, visual models)
- [x] **Implement Fences and Fence Gates** (Connectivity logic, physics)
- [x] **Implement Trapdoors** (Open/close logic, physics)
- [x] **Implement Glass Panes / Windows** (Connectivity logic with neighbors)
- [x] **Implement Birch Trees** (Blocks & Generation)
- [x] **Implement Concrete Blocks**
- [x] **Implement Colored Wool Blocks**
- [x] Additional block types (brick, concrete, wool colors)

### Advanced World Generation
- [x] **Expand Village Generation** (Generate Houses, Paths, and Layouts)
- [x] **Rivers and Lakes** (Hydrology system)
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
- [x] **Implement Jungle Biome** (Jungle Wood, Ocelots, Cocoa Beans)

### Crafting System
- [x] Crafting table interface (UI implemented)
- [x] Recipes for tools, blocks, and items (Block and Tool recipes implemented)
- [x] Resource gathering requirements (Inventory consumption implemented)
- [x] **Smelting System (Furnace UI & Logic)**
- [x] **Implement Recipe Book UI** (Show available recipes visually)

### Tools and Items
- [x] **Implement Bow and Arrow** (Ranged combat)
- [x] **Implement Shield** (Blocking mechanic)
- [x] Pickaxes (wood, stone, iron, diamond)
- [x] Shovels for faster dirt/sand breaking
- [x] Axes for faster wood breaking
- [x] Swords for combat
- [x] Tool durability system
- [x] Different breaking speeds based on tool and block
- [x] **Implement Tool Repair** (Crafting combination)
- [x] **Implement Fishing Mechanic** (Fishing Rod, Bobber physics, catching fish)

### Mobs and AI
- [x] **Implement Animal Breeding** (Feeding animals to spawn babies)
- [x] Passive mobs (Cows, Pigs, Sheep implemented)
- [x] Hostile mobs (zombies, skeletons, spiders)
- [x] Mob AI pathfinding (Random movement and Chase behavior implemented)
- [x] Day/night spawn cycles
- [x] Mob drops and loot (Drops implemented: leather, porkchop, rotten flesh, bones, string, wool, mutton)
- [x] Health and combat system (Player health, Mob damage)
- [x] Mob animations (Simple billboard rendering)
- [x] Sheep Mob (Fully implemented)
- [x] **Implement Taming** (Wolves)
- [x] **Implement Villagers & Trading** (Basic AI, GUI)
- [x] **Implement Iron Golems**

### Core Mechanics
- [x] Sprinting mechanic
- [x] Fall damage
- [x] Hunger system (Decay and starvation implemented)
- [x] Eating/Food Consumption (Implemented, including sound)
- [x] **Bed & Sleeping (Skip Night)**

### Enhanced Building Blocks
- [x] **Implement Doors** (Open/Close logic, models)
- [x] **Implement Slabs** (Placement logic, half-block physics)
- [x] **Implement Chests and Storage** (UI, persistence)
- [x] Torches (Lighting system) (Basic light propagation and recipes implemented)

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
