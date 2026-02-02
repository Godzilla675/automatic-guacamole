# Future Features & Tasks

This document outlines the priorities and workflow for all agents working on this repository.

## 1. High Priority: New Features
*Focus on adding content and gameplay mechanics.*

### Gameplay Modes
- [ ] **Implement Creative Mode** (Infinite items, instant break, flying, God mode, toggle via command)

### Visuals & Immersion
- [ ] **Implement Smooth Lighting** (Ambient Occlusion for block corners)
- [ ] **Implement Crafting Animations**

### Magic & Alchemy
- [ ] **Implement Enchanting Table UI & Logic** (XP cost, random enchantments)
- [ ] **Implement Potion Brewing Logic & UI** (Brewing Stand interaction, potion effects)

### Nether Dimension
- [ ] **Implement Nether World Generation** (Pending generator logic)
- [ ] **Implement Nether Mobs** (Pigman, Ghast, Blaze - AI & Assets pending)

### UI & Systems
- [ ] **Minimap**
- [ ] **Achievement system**
- [ ] **Tutorial/help system**

## 2. Medium Priority: Bugs & Maintenance
*Fix reported bugs and ensure stability.*

- [ ] **Optimize World Save System** (Use compression or delta updates to avoid localStorage quota limits)
- [ ] **Plugin API**

## 3. Low Priority: Code Quality & Polish
*Refactors, optimization, and minor UI improvements.*

- [ ] Refactor Renderer for performance (reduce draw calls if possible)

## Completed Features
*Keep a record of what works.*

### New Features & Mechanics
- [x] **Implement Recipe Discovery System** (Unlock recipes as items are gathered)
- [x] **Implement Experience System** (XP Bar, Drops, Leveling)
- [x] **Implement Weather System** (Rain, Snow, Thunderstorms)
- [x] **Implement Redstone Circuits** (Wire, Torch, Lamp, Power logic)
- [x] **Implement Pistons** (Push/Pull logic, Sticky Pistons)
- [x] **Implement TNT & Explosions** (Physics, Damage)
- [x] **Implement Farming Extensions** (Carrots, Potatoes, Melons, Pumpkins)
- [x] **Implement Saplings and Tree Propagation**
- [x] **Implement Save/Load UI** (Buttons in Pause/Main Menu to trigger world save/load)
- [x] **Implement Nether Portal** (Block added)
- [x] **Implement 3D Positional Audio** (Use PannerNode for spatial sound)

### Mobs
- [x] **Implement Chicken Mob** (Passive, drops Feathers/Chicken, lays eggs)
- [x] **Implement Creeper Mob** (Hostile, explodes)
- [x] **Implement Enderman Mob** (Neutral, teleports, picks up blocks)
- [x] **Implement Iron Golems**
- [x] **Implement Taming** (Wolves)
- [x] **Implement Villagers & Trading** (Basic AI, GUI)

### Maintenance & Fixes
- [x] **Fix Verification Suite**
- [x] **Audit and Verify All Features**
- [x] **Fix Lighting Cleanup**
- [x] **Refactor Structure Manager**
- [x] **Fix Water Flow Logic**
- [x] **Fix Spruce Tree Visuals**
- [x] **Multiplayer Support**
- [x] **Complete Settings Menu**
- [x] **Implement Village Layouts**
- [x] **Fix Tree Generation Height Limit**
- [x] **Fix Redstone/Torch Structural Integrity**
- [x] **Fix Projectile Collision**
- [x] **Implement Particle System**
- [x] **Fix verify_blocks.js logic error**

### Building & World
- [x] **Implement Stairs**
- [x] **Implement Fences and Fence Gates**
- [x] **Implement Trapdoors**
- [x] **Implement Glass Panes / Windows**
- [x] **Implement Birch Trees**
- [x] **Expand Village Generation**
- [x] **Rivers and Lakes**
- [x] **Biomes**
- [x] **Caves and underground systems**
- [x] **Ore generation**
- [x] **Structure Manager**
- [x] **Biome Manager**
- [x] **Desert, Snow, Jungle Biomes**

### Crafting & Items
- [x] **Smelting System (Furnace UI & Logic)**
- [x] **Implement Recipe Book UI**
- [x] **Implement Tool Repair**
- [x] **Implement Fishing Mechanic**
- [x] **Implement Bow and Arrow**
- [x] **Implement Shield**
- [x] **Implement Doors**
- [x] **Implement Slabs**
- [x] **Implement Chests and Storage**

### UI
- [x] **FOV Slider**
- [x] **Mouse Sensitivity Control**
- [x] **Minecarts and rails** (Blocks added)
- [x] **Boats** (Item added)
- [x] **Signs and text** (Item added)
