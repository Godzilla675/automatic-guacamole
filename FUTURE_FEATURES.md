# Future Features & Tasks

This document outlines the priorities and workflow for all agents working on this repository.

## 1. High Priority: New Features
*Focus on adding content and gameplay mechanics.*

### Missing Mobs
- [ ] **Implement Chicken Mob** (Passive, drops Feathers/Chicken, lays eggs)
- [ ] **Implement Creeper Mob** (Hostile, explodes)
- [ ] **Implement Enderman Mob** (Neutral, teleports, picks up blocks)

### Advanced Mechanics
- [ ] **Implement Weather System** (Rain, Snow, Thunderstorms)
- [ ] **Implement Redstone Circuits** (Wire, Torch, Power logic, Pistons)
- [ ] **Implement TNT & Explosions** (Physics, Damage)
- [ ] **Implement Farming Extensions** (Carrots, Potatoes, Melons, Pumpkins)
- [ ] **Implement Experience & Enchanting**

### Crafting & Inventory
- [ ] **Implement Crafting Animations**
- [ ] **Implement Recipe Discovery System**
- [ ] **Implement Brewing**

### Nether Dimension
- [ ] **Implement Nether Portal**
- [ ] **Implement Nether World Generation**
- [ ] **Implement Nether Mobs** (Pigman, Ghast, Blaze)

## 2. Medium Priority: Bugs & Maintenance
*Fix reported bugs and ensure stability.*

- [ ] **Audit and Verify All Features** (Run full regression suite)
- [x] **Refactor Structure Manager**: Move specific structure logic (Wells, Trees) into separate classes or modules to support expanding Village generation.
- [x] **Fix Water Flow Logic**: Current implementation is basic; improve to match Minecraft mechanics (limited spread, source block creation).
- [x] **Fix Spruce Tree Visuals**: Spruce trees currently use Oak blocks (`BLOCK.WOOD` and `BLOCK.LEAVES`). Implement and use `BLOCK.SPRUCE_WOOD` and `BLOCK.SPRUCE_LEAVES`.
- [x] **Multiplayer Support**: WebSocket-based real-time multiplayer (Implemented `NetworkManager` in `js/network.js` and `server/server.js`)
- [x] **Complete Settings Menu**: Add missing Graphics (Render Distance, FOV) and Controls (Key remapping) configuration to the Settings screen.
- [x] **Implement Village Layouts** (Roads, Houses, coherent generation)
- [x] **Fix Tree Generation Height Limit** (Trees cut off at world height)

## 3. Low Priority: Code Quality & Polish
*Refactors, optimization, and minor UI improvements.*

### User Interface Improvements
- [ ] FOV Slider (Backend done, needs UI hook verification)
- [ ] Mouse Sensitivity Control
- [ ] Minimap
- [ ] Achievement system
- [ ] Tutorial/help system

### Misc
- [ ] Minecarts and rails
- [ ] Boats
- [ ] Signs and text
- [ ] Plugin API

## Completed Features
*Keep a record of what works.*

### New Building Blocks
- [x] **Implement Stairs** (Placement logic, complex collision, visual models)
- [x] **Implement Fences and Fence Gates** (Connectivity logic, physics)
- [x] **Implement Trapdoors** (Open/close logic, physics)
- [x] **Implement Glass Panes / Windows** (Connectivity logic with neighbors)
- [x] **Implement Birch Trees** (Blocks & Generation)

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
- [x] Additional block types (brick, concrete, wool colors)
- [x] Torches (Lighting system) (Basic light propagation and recipes implemented)

### General Fixes & Improvements
- [x] Verified all implemented features (Crafting, Mobs, Physics, Saving, Commands) with comprehensive test suite
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
- [x] Implement Concrete Blocks
- [x] Implement Colored Wool Blocks
- [x] Make Wool Placeable
- [x] Fix Infinite Blocks / Inventory Consumption on Placement
- [x] Implement Water Flow Logic
- [x] Implement Cactus Damage
- [x] Implement Rivers and Lakes
- [x] Fix Renderer Syntax Error (Illegal continue)

## Contribution Guidelines
* When adding a new feature, please update this file.
* Ensure all tests pass before submitting.
* Follow the code style of the existing project.
