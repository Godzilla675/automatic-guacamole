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
- [x] Biomes (Implemented basic noise-based terrain)
- [x] Caves and underground systems (3D Noise holes)
- [x] Ore generation (Coal, Iron, Gold, Diamond)
- [ ] Villages and structures
- [ ] Rivers and lakes
- [x] Better terrain generation using Perlin/Simplex noise
- [x] World seeds for reproducible generation

### 3. Crafting System
- [x] Crafting table interface (UI implemented)
- [x] Recipes for tools, blocks, and items (Basic system in `js/crafting.js`)
- [x] Resource gathering requirements (Inventory consumption implemented)
- [ ] Crafting animations
- [ ] Recipe discovery system

### 4. Tools and Items
- [x] Pickaxes (wood, stone, iron, diamond)
- [x] Shovels for faster dirt/sand breaking
- [x] Axes for faster wood breaking
- [x] Swords for combat
- [x] Tool durability system
- [x] Different breaking speeds based on tool and block

### 5. Mobs and AI
- [x] Passive mobs (Cows, Pigs implemented; Sheep missing)
- [x] Hostile mobs (zombies, skeletons, spiders) - *Note: All implemented*
- [x] Mob AI pathfinding (Random movement and Chase behavior implemented)
- [x] Day/night spawn cycles
- [x] Mob drops and loot (Drops implemented: leather, porkchop, rotten flesh, bones, string)
- [x] Health and combat system (Player health, Mob damage)
- [x] Mob animations (Simple billboard rendering)
- [x] Sheep Mob (Missing implementation)

### 6. Core Mechanics
- [x] Sprinting mechanic
- [x] Fall damage
- [x] Hunger system

## Medium Priority Features

### 7. Enhanced Building Blocks
- [x] Additional block types (brick, concrete, wool colors)
- [ ] Slabs and stairs
- [ ] Doors and gates
- [ ] Windows and fences
- [ ] Decorative blocks
- [ ] Redstone-like logic blocks

### 8. World Saving/Loading
- [x] Save world state to browser localStorage (Implemented in `js/world.js`)
- [x] Load saved worlds
- [x] Multiple world slots
- [ ] Export/import world data
- [ ] Auto-save functionality

### 9. Advanced Graphics
- [ ] Better shadows and lighting
- [ ] Particle effects (breaking blocks, water splash)
- [ ] Block breaking animation (Basic progress bar implemented)
- [ ] Ambient occlusion
- [ ] Water animations and flow
- [ ] Weather effects (rain, snow)
- [ ] Clouds
- [ ] Better skybox
- [ ] Head bobbing animation
- [ ] Sun/Moon rendering

### 10. Sound System
- [ ] Background music
- [x] Block breaking sounds
- [x] Footstep sounds
- [x] Ambient sounds (water, wind) (Basic implementation in `SoundManager`)
- [x] Sound effects for actions
- [ ] Volume controls

### 11. Inventory Enhancements
- [ ] Larger inventory (3x9 grid)
- [ ] Drag and drop items
- [ ] Item stacking
- [x] Hotbar number indicators
- [ ] Quick item swap
- [ ] Inventory sorting

### 12. User Interface Improvements
- [ ] Settings menu (graphics, controls, sound)
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

## Low Priority / Polish Features

### 13. Advanced Gameplay
- [ ] Health regeneration
- [ ] Experience points and levels
- [ ] Enchanting system
- [ ] Potions and brewing
- [ ] Farming (crops, animals)
- [ ] Fishing

### 14. Creative Mode Features
- [ ] Unlimited blocks
- [ ] Instant block breaking
- [ ] No collision mode (noclip)
- [x] Fly mode toggle (Key 'F')
- [ ] World edit tools (copy, paste, fill)
- [ ] Time control
- [ ] Weather control

### 15. Performance Optimizations
- [x] Chunk-based rendering optimization
- [x] Frustum culling improvements
- [ ] LOD (Level of Detail) system
- [ ] Worker threads for world generation
- [ ] Better memory management
- [x] Occlusion culling (Exposed Face Caching)
- [ ] Greedy meshing for fewer draw calls

### 16. Social Features
- [ ] Screenshot system
- [ ] Share world links
- [ ] Leaderboards
- [ ] World showcase gallery
- [ ] Friends system

### 17. Advanced Building
- [ ] Copy/paste structures
- [ ] Symmetry mode
- [ ] Fill tool
- [ ] Replace tool
- [ ] Undo/redo system

### 18. World Interaction
- [ ] Chests and storage
- [ ] Furnaces for smelting
- [ ] Beds for sleeping
- [ ] Portals to other dimensions
- [ ] Minecarts and rails
- [ ] Boats
- [ ] Signs and text

### 19. Modding Support
- [ ] Plugin API
- [ ] Custom block types
- [ ] Custom mob types
- [ ] Event hooks
- [ ] Resource pack support
- [ ] Texture customization

## Bugs & Maintenance

### 20. Critical Fixes & Bugs
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
- [x] Implement Sheep Mob (Missing in `Game.spawnMobs` and `Mob` class)
- [x] Fix Water Physics (Implemented simple player physics and visual overlay)
- [x] Implement Fall Damage
- [x] Implement Sprinting
- [x] Fix Projectile Collision (Improved hit detection with AABB Raycast)

## Technical Improvements

### 21. Code Quality
- [x] Unit tests for core systems
- [ ] Integration tests
- [x] Code documentation
- [ ] Performance profiling
- [ ] Error handling improvements
- [x] Mobile performance optimization
- [ ] Cross-browser compatibility testing
- [x] Improve raycast accuracy (Implemented DDA algorithm in `js/physics.js`)
- [ ] Server-side world persistence

### 22. Accessibility
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
