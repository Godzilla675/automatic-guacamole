# Future Features & Agent Tasks

This document outlines the roadmap for Voxel World.
**Prioritization Rule:** Agents must strictly follow this priority order:
1. **New Features & Gameplay Improvements** (Highest Priority)
2. **Bug Fixes**
3. **Code Quality, Refactors & Backend Tasks** (Lowest Priority)

## 1. High Priority: New Features & Gameplay Improvements

### Core Mechanics
- [ ] **Sprinting Mechanic**: Implement running speed multiplier (e.g., Ctrl key) and FOV change.
- [ ] **Hunger System**: Implement hunger decay, food consumption, and starvation consequences.
- [ ] **Fall Damage**: Implement damage calculation based on fall distance.
- [ ] **Water Physics**: Implement swimming (buoyancy), fluid drag, and water flow logic.
- [ ] **Sheep Mob**: Implement Sheep visual, spawning, and behavior (missing in `Mob` class).

### World & Environment
- [ ] **Rivers and Lakes**: Improve world generation to include water bodies.
- [ ] **Villages and Structures**: Generate simple structures or NPC villages.
- [ ] **Day/Night Cycle Improvements**: Sun/Moon rendering, smooth transitions, sky color gradients.
- [ ] **Weather Effects**: Rain and snow (visuals and gameplay effects).
- [ ] **Clouds**: Render procedural clouds in the sky.

### Interaction & UI
- [ ] **Drag and Drop Inventory**: Implement full mouse interaction for the inventory.
- [ ] **Item Stacking**: Allow items to stack properly in inventory slots.
- [ ] **Chests and Storage**: Implement persistent storage blocks.
- [ ] **Furnaces**: Implement smelting logic for ores and food.
- [ ] **Settings Menu**: FOV slider, Mouse Sensitivity, Volume controls.
- [ ] **Minimap**: on-screen map display.

### Sound & Audio
- [ ] **Background Music**: Add ambient music tracks.
- [ ] **Volume Controls**: UI to adjust sound levels.

### Creative Mode Tools
- [ ] **World Edit Tools**: Copy/Paste, Fill command, Replace tool.
- [ ] **Time Control**: Commands or UI to set time of day.
- [ ] **No-Clip Mode**: Allow moving through blocks in spectator/creative mode.

## 2. Medium Priority: Bug Fixes

- [ ] **Projectile Collision**: Improve hit detection for projectiles (currently simple distance check).
- [ ] **Physics Glitches**: Fix any player sticking to walls or incorrect collision resolution.
- [ ] **Mob Pathfinding**: Improve mob navigation around obstacles (jumping over holes, etc.).

## 3. Low Priority: Code Quality, Refactors & Backend

- [ ] **Server-Side World Persistence**: Save world state to disk on the Node.js server.
- [ ] **Player Spawn Points**: Manage spawn points server-side.
- [ ] **Unit Tests**: Add more comprehensive unit tests for physics and logic.
- [ ] **Integration Tests**: End-to-end testing improvements.
- [ ] **Performance Profiling**: Analyze and optimize render loop further (LOD, greedy meshing).
- [ ] **Worker Threads**: Move world generation to web workers.
- [ ] **Modding API**: Plugin support (very low priority).

---

## Completed Features (Verified)

### Multiplayer
- [x] WebSocket-based real-time multiplayer
- [x] Player synchronization
- [x] Chat system
- [x] Player name tags
- [x] Server infrastructure
- [x] Shared world state (Real-time block updates)

### World Generation
- [x] Biomes (Basic noise-based)
- [x] Caves and underground systems
- [x] Ore generation
- [x] World seeds

### Crafting & Items
- [x] Crafting table UI
- [x] Basic Recipes
- [x] Resource consumption
- [x] Tool durability
- [x] Tools: Pickaxes, Shovels, Axes, Swords

### Mobs
- [x] Cows, Pigs, Zombies, Skeletons, Spiders
- [x] Basic AI (Wander, Chase, Shoot)
- [x] Mob Drops

### Graphics & Engine
- [x] Chunk-based rendering
- [x] Frustum culling
- [x] Face culling (Occlusion)
- [x] Dynamic Crosshair
- [x] Fly mode (Key 'F')
- [x] LocalStorage World Saving

### Audio
- [x] Footstep sounds
- [x] Block break/place sounds

---

## Contribution Guidelines
* When adding a new feature, please update this file.
* Ensure all tests pass before submitting.
* Follow the code style of the existing project.
