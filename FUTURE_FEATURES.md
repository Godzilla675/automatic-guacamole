# Future Features & Tasks

This document outlines the priorities and workflow for all agents working on this repository.

## 1. High Priority: New Features
*Focus on adding content and gameplay mechanics.*

### New Building Blocks
- [x] **Implement Stairs** (Placement logic, complex collision, visual models)
- [x] **Implement Fences and Fence Gates** (Connectivity logic, physics)
- [x] **Implement Trapdoors** (Open/close logic, physics)
- [x] **Implement Glass Panes / Windows** (Connectivity logic with neighbors)

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

### Crafting System
- [ ] Crafting animations
- [ ] Recipe discovery system
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
- [ ] **Implement Taming** (Wolves, Ocelots)

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

## 2. Medium Priority: Bugs & Maintenance
*Fix reported bugs and ensure stability.*

- [x] **Refactor Structure Manager**: Move specific structure logic (Wells, Trees) into separate classes or modules to support expanding Village generation.
- [x] **Fix Water Flow Logic**: Current implementation is basic; improve to match Minecraft mechanics (limited spread, source block creation).
- [x] **Fix Spruce Tree Visuals**: Spruce trees currently use Oak blocks (`BLOCK.WOOD` and `BLOCK.LEAVES`). Implement and use `BLOCK.SPRUCE_WOOD` and `BLOCK.SPRUCE_LEAVES`.
- [x] **Multiplayer Support**: WebSocket-based real-time multiplayer (Implemented `NetworkManager` in `js/network.js` and `server/server.js`)

## 3. Low Priority: Code Quality & Polish
*Refactors, optimization, and minor UI improvements.*

### User Interface Improvements
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

### Advanced Gameplay
- [ ] Experience points and levels
- [ ] Enchanting system
- [ ] Potions and brewing
- [x] Health regeneration (Implemented in `js/player.js`)
- [ ] **Implement Redstone Circuits** (Wire, Torch, Power logic)

### Creative Mode Features
- [ ] Unlimited blocks
- [ ] Instant block breaking
- [ ] No collision mode (noclip)
- [ ] Weather control
- [x] Fly mode toggle (Key 'F')
- [x] World edit tools (copy, paste, fill) - Fill tool implemented
- [x] Time control

### Performance Optimizations
- [ ] LOD (Level of Detail) system
- [ ] Worker threads for world generation
- [ ] Better memory management
- [ ] Greedy meshing for fewer draw calls
- [x] Chunk-based rendering optimization
- [x] Frustum culling improvements
- [x] Occlusion culling (Exposed Face Caching)

### Social Features
- [ ] Screenshot system
- [ ] Share world links
- [ ] Leaderboards
- [ ] World showcase gallery
- [ ] Friends system

### Advanced Building Tools
- [ ] Copy/paste structures
- [ ] Symmetry mode
- [ ] Fill tool
- [ ] Replace tool
- [ ] Undo/redo system

### World Interaction (Misc)
- [ ] Minecarts and rails
- [ ] Boats
- [ ] Signs and text

### Modding Support
- [ ] Plugin API
- [ ] Custom block types
- [ ] Custom mob types
- [ ] Event hooks
- [ ] Resource pack support
- [ ] Texture customization

## Completed Fixes (History)
- [x] Verified all implemented features (Crafting, Mobs, Physics, Saving, Commands) with comprehensive test suite
- [x] Fix Tree Generation at Chunk Boundaries
- [x] Fix memory management strategy
- [x] Optimize render loop
- [x] Remove dead code
- [x] Fix Crafting System
- [x] Fix Footstep Sounds
- [x] Fix Crouch Mechanics
- [x] Fix Block IDs
- [x] Implement Sheep Mob
- [x] Fix Water Physics
- [x] Implement Fall Damage
- [x] Implement Sprinting
- [x] Fix Projectile Collision
- [x] Implement Eating/Food Consumption
- [x] Implement Tool Crafting Recipes
- [x] Implement Ambient Sounds
- [x] Fix Physics Crash
- [x] Fix Fall Damage Logic
- [x] Fix Crafting System
- [x] Implement Block Entity Persistence
- [x] Implement Farming
- [x] Implement Bed & Sleep Logic
- [x] Implement Furnace UI & Smelting Logic
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
