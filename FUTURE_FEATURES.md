# Future Features for Voxel World

This document outlines features that future agents should implement to enhance the Minecraft clone game.

## Critical Fixes & Technical Debt

### 0. Bugs & Maintenance
- [x] Fix memory management strategy (Implemented Chunk-based storage)
- [x] Optimize render loop (Implemented Frustum culling, Chunk iteration, and Exposed Face Caching)

## High Priority Features

### 1. Multiplayer Support
- [ ] WebSocket-based real-time multiplayer (Stubbed `NetworkManager`, needs backend)
- [ ] Player synchronization across clients
- [ ] Chat system
- [ ] Player name tags
- [ ] Server infrastructure (Node.js + WebSocket)
- [ ] Player spawn points
- [ ] Shared world state

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
- [ ] Resource gathering requirements
- [ ] Crafting animations
- [ ] Recipe discovery system

### 4. Tools and Items
- [ ] Pickaxes (wood, stone, iron, diamond)
- [ ] Shovels for faster dirt/sand breaking
- [ ] Axes for faster wood breaking
- [ ] Swords for combat
- [ ] Tool durability system
- [ ] Different breaking speeds based on tool and block

### 5. Mobs and AI
- [x] Passive mobs (Basic Mob class implemented)
- [ ] Hostile mobs (zombies, skeletons, spiders)
- [x] Mob AI pathfinding (Random movement implemented)
- [ ] Day/night spawn cycles
- [ ] Mob drops and loot
- [ ] Health and combat system
- [x] Mob animations (Simple billboard rendering)

## Medium Priority Features

### 6. Enhanced Building Blocks
- [x] Additional block types (brick, concrete, wool colors)
- [ ] Slabs and stairs
- [ ] Doors and gates
- [ ] Windows and fences
- [ ] Decorative blocks
- [ ] Redstone-like logic blocks

### 7. World Saving/Loading
- [x] Save world state to browser localStorage (Full chunk data serialized to Base64)
- [x] Load saved worlds
- [ ] Multiple world slots
- [ ] Export/import world data
- [ ] Auto-save functionality

### 8. Advanced Graphics
- [ ] Better shadows and lighting
- [ ] Particle effects (breaking blocks, water splash)
- [ ] Block breaking animation
- [ ] Ambient occlusion
- [ ] Water animations and flow
- [ ] Weather effects (rain, snow)
- [ ] Clouds
- [ ] Better skybox
- [ ] Head bobbing animation

### 9. Sound System
- [ ] Background music
- [x] Block breaking sounds
- [x] Footstep sounds
- [x] Ambient sounds (water, wind) (Stubbed in `SoundManager`)
- [x] Sound effects for actions
- [ ] Volume controls

### 10. Inventory Enhancements
- [ ] Larger inventory (3x9 grid)
- [ ] Drag and drop items
- [ ] Item stacking
- [ ] Hotbar number indicators
- [ ] Quick item swap
- [ ] Inventory sorting

### 11. User Interface Improvements
- [ ] Settings menu (graphics, controls, sound)
- [ ] Minimap
- [ ] Coordinates toggle
- [ ] Achievement system
- [ ] Tutorial/help system
- [x] Better mobile UI scaling
- [ ] Gamepad support
- [ ] Dynamic Crosshair
- [ ] Non-intrusive UI notifications (replace alerts)

## Low Priority / Polish Features

### 12. Advanced Gameplay
- [ ] Hunger system
- [ ] Health regeneration
- [ ] Fall damage
- [ ] Experience points and levels
- [ ] Enchanting system
- [ ] Potions and brewing
- [ ] Farming (crops, animals)
- [ ] Fishing
- [ ] Sprinting mechanic

### 13. Creative Mode Features
- [ ] Unlimited blocks
- [ ] Instant block breaking
- [ ] No collision mode (noclip)
- [ ] World edit tools (copy, paste, fill)
- [ ] Time control
- [ ] Weather control

### 14. Performance Optimizations
- [x] Chunk-based rendering optimization
- [x] Frustum culling improvements
- [ ] LOD (Level of Detail) system
- [ ] Worker threads for world generation
- [ ] Better memory management
- [x] Occlusion culling (Exposed Face Caching)
- [ ] Greedy meshing for fewer draw calls

### 15. Social Features
- [ ] Screenshot system
- [ ] Share world links
- [ ] Leaderboards
- [ ] World showcase gallery
- [ ] Friends system

### 16. Advanced Building
- [ ] Copy/paste structures
- [ ] Symmetry mode
- [ ] Fill tool
- [ ] Replace tool
- [ ] Undo/redo system

### 17. World Interaction
- [ ] Chests and storage
- [ ] Furnaces for smelting
- [ ] Beds for sleeping
- [ ] Portals to other dimensions
- [ ] Minecarts and rails
- [ ] Boats
- [ ] Signs and text

### 18. Modding Support
- [ ] Plugin API
- [ ] Custom block types
- [ ] Custom mob types
- [ ] Event hooks
- [ ] Resource pack support
- [ ] Texture customization

## Technical Improvements

### 19. Code Quality
- [x] Unit tests for core systems (Added `tests/test_logic.js`)
- [ ] Integration tests
- [x] Code documentation
- [ ] Performance profiling
- [ ] Error handling improvements
- [x] Mobile performance optimization
- [ ] Cross-browser compatibility testing

### 20. Accessibility
- [ ] Keyboard navigation for menus
- [ ] Screen reader support
- [ ] Colorblind modes
- [ ] Adjustable UI sizes
- [ ] Remappable controls
- [ ] Simplified controls option
