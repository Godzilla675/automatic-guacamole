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

## 2. Medium Priority: Bugs & Maintenance
*Fix reported bugs and ensure stability.*

- [ ] **Fix Verification Suite** (Many tests fail due to missing `ParticleSystem` dependency or incomplete mocks; `verify_fishing.js` fails)
- [ ] **Fix Water Flow Visuals** (Sometimes lags or doesn't update immediately)
- [ ] **Audit and Verify All Features** (Run full regression suite)

## 3. Low Priority: Code Quality & Polish
*Refactors, optimization, and minor UI improvements.*

### User Interface Improvements
- [ ] Minimap
- [ ] Achievement system
- [ ] Tutorial/help system

### Optimization
- [ ] **Optimize Chunk Serialization** (Current `btoa` approach is inefficient; use binary or compression)
- [ ] **Refactor World/Chunk Separation**

### Misc
- [ ] Plugin API

## Completed Features
*Keep a record of what works.*

### New Building Blocks
- [x] **Implement Stairs**
- [x] **Implement Fences and Fence Gates**
- [x] **Implement Trapdoors**
- [x] **Implement Glass Panes**
- [x] **Implement Birch Trees**
- [x] **Implement Pistons**
- [x] **Implement Nether Portal Block (ID 196)** (Logic pending)

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

### Mobs and AI
- [x] Passive mobs (Cows, Pigs, Sheep, Chicken)
- [x] Hostile mobs (Zombies, Skeletons, Spiders, Creepers, Endermen)
- [x] Mob AI pathfinding
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

## Contribution Guidelines
* When adding a new feature, please update this file.
* Ensure all tests pass before submitting.
* Follow the code style of the existing project.
