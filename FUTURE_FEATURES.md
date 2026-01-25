# Future Features for Voxel World

This document outlines features that future agents should implement to enhance the Minecraft clone game.

## High Priority Features

### 1. Multiplayer Support
- [x] WebSocket-based real-time multiplayer (Implemented `NetworkManager` in `js/network.js` and `server/server.js`)
- [x] Player synchronization across clients
- [x] Chat system
- [x] Player name tags
- [x] Server infrastructure (Node.js + WebSocket)
- [x] Player spawn points
- [x] Shared world state (Real-time sync only, no server-side persistence yet)

### 2. Advanced World Generation
- [ ] Rivers and lakes
- [x] Biomes (Implemented basic noise-based terrain)
- [x] Caves and underground systems (3D Noise holes)
- [x] Ore generation (Coal, Iron, Gold, Diamond)
- [x] Better terrain generation using Perlin/Simplex noise
- [x] World seeds for reproducible generation
- [x] **Implement Structure Manager** (System to spawn structures like Trees, Wells, Ruins)
- [x] **Implement Simple Structures** (Well, Small Ruins)
- [x] **Implement Village Generation** (Infrastructure implemented, Wells added)
- [x] **Implement Biome Manager** (Distinct regions for Desert, Forest, Snow)
- [x] **Implement Desert Biome** (Sand, Cactus)
- [x] **Implement Snow Biome** (Snow blocks, Ice, Spruce Trees)

### 3. Crafting System
- [x] Crafting table interface (UI implemented)
- [x] Recipes for tools, blocks, and items (Block and Tool recipes implemented)
- [x] Resource gathering requirements (Inventory consumption implemented)
- [x] **Smelting System (Furnace UI & Logic)**
- [x] **Implement Recipe Book UI** (Show available recipes visually)
- [ ] Crafting animations
- [ ] Recipe discovery system

### 4. Tools and Items
- [x] Pickaxes (wood, stone, iron, diamond)
- [x] Shovels for faster dirt/sand breaking
- [x] Axes for faster wood breaking
- [x] Swords for combat
- [x] Tool durability system
- [x] Different breaking speeds based on tool and block
- [ ] **Implement Tool Repair** (Anvil or crafting combination)
- [ ] **Implement Bow and Arrow** (Ranged combat)
- [ ] **Implement Shield** (Blocking mechanic)

### 5. Mobs and AI
- [x] Passive mobs (Cows, Pigs, Sheep implemented)
- [x] Hostile mobs (zombies, skeletons, spiders) - *Note: All implemented*
- [x] Mob AI pathfinding (Random movement and Chase behavior implemented)
- [x] Day/night spawn cycles
- [x] Mob drops and loot (Drops implemented: leather, porkchop, rotten flesh, bones, string, wool, mutton)
- [x] Health and combat system (Player health, Mob damage)
- [x] Mob animations (Simple billboard rendering)
- [x] Sheep Mob (Fully implemented)

### 6. Core Mechanics
- [x] Sprinting mechanic
- [x] Fall damage
- [x] Hunger system (Decay and starvation implemented)
- [x] Eating/Food Consumption (Implemented, including sound)
- [x] **Bed & Sleeping (Skip Night)**

### 7. Enhanced Building Blocks (Moved to High Priority)
- [ ] **Implement Doors and Gates** (Open/Close logic, models)
- [ ] **Implement Slabs and Stairs** (Placement logic, half-block physics)
- [ ] **Implement Windows and Fences** (Connecting logic for fences)
- [ ] **Implement Chests and Storage** (UI, persistence)
- [x] Additional block types (brick, concrete, wool colors)
- [x] Torches (Lighting system) (Basic light propagation and recipes implemented)

## Medium Priority Features

### 8. User Interface Improvements
- [x] **Settings Menu (Controls, Sound, Graphics)**
- [x] **Volume Controls**
- [ ] FOV Slider
- [ ] Mouse Sensitivity Control
- [ ] Minimap
- [x] Coordinates toggle (F3)
- [ ] Achievement system
- [ ] Tutorial/help system
- [x] Better mobile UI scaling
- [ ] Gamepad support
- [x] Dynamic Crosshair
- [ ] Non-intrusive UI notifications (replace alerts)

### 9. Advanced Building Blocks (Remaining)
- [ ] Decorative blocks
- [ ] Redstone-like logic blocks

### 10. World Saving/Loading
- [x] Save world state to browser localStorage (Implemented in `js/world.js`)
- [x] Load saved worlds
- [x] Multiple world slots
- [ ] Export/import world data
- [ ] Auto-save functionality

### 11. Advanced Graphics
- [ ] Better shadows and lighting
- [ ] Dynamic Lighting (Handheld torch light)
- [ ] Particle effects (breaking blocks, water splash)
- [x] Block breaking animation (Basic progress bar implemented)
- [ ] Ambient occlusion
- [ ] Water animations and flow
- [ ] Weather effects (rain, snow)
- [ ] Clouds
- [ ] Better skybox
- [ ] Head bobbing animation
- [ ] Sun/Moon rendering

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
- [x] **Full Inventory UI** (Data implemented, UI missing)
- [x] Drag and drop items
- [x] Item stacking (Simple stacking implemented in drops)
- [x] Hotbar number indicators
- [ ] Quick item swap
- [ ] Inventory sorting

## Low Priority / Polish Features

### 15. Advanced Gameplay
- [x] Health regeneration (Implemented in `js/player.js`)
- [ ] Experience points and levels
- [ ] Enchanting system
- [ ] Potions and brewing

### 16. Creative Mode Features
- [ ] Unlimited blocks
- [ ] Instant block breaking
- [ ] No collision mode (noclip)
- [x] Fly mode toggle (Key 'F')
- [x] World edit tools (copy, paste, fill) - Fill tool implemented
- [x] Time control
- [ ] Weather control

### 17. Performance Optimizations
- [x] Chunk-based rendering optimization
- [x] Frustum culling improvements
- [ ] LOD (Level of Detail) system
- [ ] Worker threads for world generation
- [ ] Better memory management
- [x] Occlusion culling (Exposed Face Caching)
- [ ] Greedy meshing for fewer draw calls

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

### 22. Critical Fixes & Bugs
- [x] **Fix Empty Inventory Screen** (Pressing 'E' opens empty overlay)
- [x] **Implement Furnace Block Logic** (Currently smelting is via Crafting Table)
- [x] **Water Flow Visuals** (Physics works, confirmed visually dynamic)
- [x] **Bug: Implement Concrete Blocks** (Verified implemented)
- [x] **Bug: Implement Colored Wool Blocks** (Verified implemented)
- [x] **Bug: Make Wool Placeable** (Verified implemented as blocks)
- [x] **Bug: Fix Infinite Blocks / Inventory Consumption on Placement** (Verified implemented in Game.placeBlock)
- [x] **Bug: Implement Water Flow Logic** (Verified implemented in World.updateFluids)
- [ ] **Bug: Implement Cactus Damage** (Collision exists, but no damage logic)

### 23. Completed Fixes (History)
- [x] Verified all implemented features (Crafting, Mobs, Physics, Saving, Commands) with comprehensive test suite
- [x] Fix Tree Generation at Chunk Boundaries (Trees can be cut off if neighbor chunk not generated)
- [x] Fix memory management strategy (Implemented Chunk-based storage)
- [x] Optimize render loop (Implemented Frustum culling, Chunk iteration, and Exposed Face Culling)
- [x] Remove dead code (Delete `game.js` in root, as `js/main.js` is the active entry point)
- [x] Fix Crafting System (Inventory consumption implemented)
- [x] Fix memory management strategy (verify chunk limit - Implemented `unloadFarChunks`)
- [x] Optimize render loop (verify culling efficiency - Implemented World-aware face culling)
- [x] Fix Footstep Sounds (Logic implemented in Player.js)
- [x] Fix Crouch Mechanics (Speed reduction implemented)
- [x] Fix Crouch Mechanics (Visual height reduction implemented)
- [x] Fix Block IDs (Dirt was 0/Air, making it invisible)
- [x] Implement Sheep Mob (Implemented in `Game.spawnMobs` and `Mob` class)
- [x] Fix Water Physics (Implemented simple player physics and visual overlay)
- [x] Implement Fall Damage
- [x] Implement Sprinting
- [x] Fix Projectile Collision (Improved hit detection with AABB Raycast)
- [x] Implement Eating/Food Consumption
- [x] Implement Tool Crafting Recipes
- [x] Implement Ambient Sounds (Water, Wind)
- [x] Fix Physics Crash (Safe block access)
- [x] Fix Fall Damage Logic (Reset fall distance in water)
- [x] Fix Crafting System (Drop items if inventory full)
- [x] Implement Block Entity Persistence (World save/load includes Furnace/Crop state)
- [x] Implement Farming (Hoe, Seeds, Crops with Growth Stages)
- [x] Implement Bed & Sleep Logic
- [x] Implement Furnace UI & Smelting Logic
- [x] Implement Settings UI & Volume Control
- [x] Implement Full Inventory UI with Drag & Drop

## Technical Improvements

### 24. Code Quality
- [x] Unit tests for core systems
- [x] Integration tests (Implemented `tests/test_features.js` covering core gameplay loops)
- [x] Code documentation
- [ ] Performance profiling
- [ ] Error handling improvements
- [x] Mobile performance optimization
- [ ] Cross-browser compatibility testing
- [x] Improve raycast accuracy (Implemented DDA algorithm in `js/physics.js`)
- [ ] Server-side world persistence

### 25. Accessibility
- [ ] Keyboard navigation for menus
- [ ] Screen reader support
- [ ] Colorblind modes
- [ ] Adjustable UI sizes
- [ ] Remappable controls
- [ ] Simplified controls option

## Contribution Guidelines
* When adding a new feature, please update this file.
* Ensure all tests pass before submitting.
* Follow the code style of the existing project.
