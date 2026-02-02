# Future Features & Tasks

This document outlines the priorities and workflow for all agents working on this repository.

## 1. High Priority: New Features
*Focus on adding content and gameplay mechanics.*

### Missing Mobs
- [x] **Implement Chicken Mob** (Passive, drops Feathers/Chicken, lays eggs)
- [x] **Implement Creeper Mob** (Hostile, explodes)
- [x] **Implement Enderman Mob** (Neutral, teleports, picks up blocks)

### Advanced Mechanics
- [x] **Implement Weather System** (Rain, Snow, Thunderstorms)
- [x] **Implement Redstone Circuits** (Wire, Torch, Lamp, Power logic)
- [x] **Implement Pistons** (Push/Pull logic, Sticky Pistons)
- [x] **Implement TNT & Explosions** (Physics, Damage)
- [x] **Implement Farming Extensions** (Carrots, Potatoes, Melons, Pumpkins)
- [x] **Implement Saplings and Tree Propagation**
- [x] **Implement Experience & Enchanting** (XP Bar, Drops, Enchanting Table Block added - UI/Logic pending)
- [x] **Implement Save/Load UI** (Buttons in Pause/Main Menu to trigger world save/load)

### Crafting & Inventory
- [ ] **Implement Crafting Animations**
- [ ] **Implement Recipe Discovery System** (Unlock recipes as items are gathered, currently shows all)
- [x] **Implement Potion Brewing** (Blocks/Items added, UI/Logic pending)

### Nether Dimension
- [x] **Implement Nether Portal** (Block added)
- [ ] **Implement Nether World Generation** (Pending generator logic)
- [ ] **Implement Nether Mobs** (Pigman, Ghast, Blaze - IDs added, AI pending)

## 2. Medium Priority: Bugs & Maintenance
*Fix reported bugs and ensure stability.*

- [x] **Audit and Verify All Features** (Run full regression suite)
- [x] **Fix verify_blocks.js logic error**
- [x] **Fix Lighting Cleanup**
- [x] **Refactor Structure Manager**
- [x] **Fix Water Flow Logic**
- [x] **Fix Spruce Tree Visuals**
- [x] **Multiplayer Support**
- [x] **Complete Settings Menu**
- [x] **Implement Village Layouts**
- [x] **Fix Tree Generation Height Limit**
- [x] **Fix Redstone/Torch Structural Integrity** (Implemented integrity checks)
- [x] **Fix Projectile Collision** (Arrows ignore non-solid blocks)
- [ ] **Implement 3D Positional Audio** (Use PannerNode for spatial sound)
- [x] **Implement Particle System** (Visuals for breaking blocks, explosions)

## 3. Low Priority: Code Quality & Polish
*Refactors, optimization, and minor UI improvements.*

### User Interface Improvements
- [x] FOV Slider (Backend done, verified UI hook)
- [x] Mouse Sensitivity Control
- [ ] Minimap
- [ ] Achievement system
- [ ] Tutorial/help system

### Misc
- [x] Minecarts and rails (Blocks added)
- [x] Boats (Item added)
- [x] Signs and text (Item added)
- [ ] Plugin API

## Completed Features
*Keep a record of what works.*

### New Building Blocks
- [x] **Implement Stairs** (Placement logic, complex collision, visual models)
- [x] **Implement Fences and Fence Gates** (Connectivity logic, physics)
- [x] **Implement Trapdoors** (Open/close logic, physics)
- [x] **Implement Glass Panes / Windows** (Connectivity logic with neighbors)
- [x] **Implement Birch Trees** (Blocks & Generation)
- [x] **Implement Pistons** (Logic & Blocks)

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
- [x] **Implement Chicken Mob**
- [x] **Implement Creeper Mob**
- [x] **Implement Enderman Mob**

### Core Mechanics
- [x] Sprinting mechanic
- [x] Fall damage
- [x] Hunger system (Decay and starvation implemented)
- [x] Eating/Food Consumption (Implemented, including sound)
- [x] **Bed & Sleeping (Skip Night)**
- [x] **Experience System** (XP Drops & Leveling)

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
- [x] **Implement Weather System**
- [x] **Implement TNT & Explosions**
- [x] **Implement Farming Extensions**
- [x] **Fix Redstone NOT Gate Logic** (Implemented signal inversion and signal cutoff)
- [x] **Implement Particle System**
- [x] **Fix Redstone Integrity**

## Contribution Guidelines
* When adding a new feature, please update this file.
* Ensure all tests pass before submitting.
* Follow the code style of the existing project.
