# Future Features for Voxel World

This document outlines features that future agents should implement to enhance the Minecraft clone game.

## 🚨 NEXT STEPS FOR AGENTS (Highest Priority)

These features are currently missing or incomplete and are the immediate next tasks.

### 1. New Building Blocks (Missing Implementation)
These blocks are currently unchecked or missing from `js/blocks.js`.
- [ ] **Implement Fences**
    - Add to `js/blocks.js` (ID ~90).
    - Update `js/physics.js`: Collision box should be 1.5 blocks high.
    - Update `js/renderer.js`: Visuals should connect to adjacent fences/blocks.
- [ ] **Implement Fence Gates**
    - Add to `js/blocks.js`.
    - Update `js/physics.js`: Handle Open/Close state (no collision when open) and 1.5 height.
    - Update `js/game.js`: Interaction logic to toggle open/close.
- [ ] **Implement Glass Panes**
    - Add to `js/blocks.js`.
    - Update `js/physics.js`: Thin collision box (center aligned).
    - Update `js/renderer.js`: Visuals should connect to neighbors.
- [ ] **Implement Trapdoors**
    - Add to `js/blocks.js`.
    - Update `js/physics.js`: Handle Open/Close and Top/Bottom placement.
    - Update `js/renderer.js`: Visuals.

### 2. Tools and Items (Missing Implementation)
- [ ] **Implement Bow and Arrow**
    - Add item to `js/blocks.js`.
    - Implement `Projectile` class update for arrows.
    - Add charging mechanic in `js/input.js` or `js/game.js`.
- [ ] **Implement Shield**
    - Add shield item to `js/blocks.js`.
    - Implement blocking mechanic (reduce damage) in `js/player.js`.

### 3. Advanced World Generation (Expansion)
- [ ] **Expand Village Generation**
    - Current: Only generates Wells (`js/structures.js`).
    - Task: Implement `StructureManager.generateHouse()` (5x5 wood/cobble).
    - Task: Generate paths between buildings.
- [ ] **Implement Rivers and Lakes**
    - Improve hydration/fluid generation in `js/world.js`.

### 4. Mobs
- [ ] **Implement Villagers**
    - Add `MOB_TYPE.VILLAGER` to `js/mob.js`.
    - Basic AI (wander, look at player).
    - (Future) Trading UI.

---

## Medium Priority Features

### 5. User Interface Improvements
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

### 6. Advanced Building Blocks (Remaining)
- [ ] Decorative blocks
- [ ] Redstone-like logic blocks

### 7. World Saving/Loading
- [ ] Export/import world data
- [ ] Auto-save functionality
- [x] Save world state to browser localStorage (Implemented in `js/world.js`)
- [x] Load saved worlds
- [x] Multiple world slots

### 8. Advanced Graphics
- [ ] Better shadows and lighting
- [ ] Dynamic Lighting (Handheld torch light)
- [ ] Particle effects (breaking blocks, water splash)
- [ ] Ambient occlusion
- [ ] Water animations and flow (Visuals implemented)
- [ ] Weather effects (rain, snow)
- [ ] Clouds
- [ ] Better skybox
- [ ] Head bobbing animation
- [ ] Sun/Moon rendering
- [x] Block breaking animation (Basic progress bar implemented)

### 9. Sound System
- [ ] **Background Music**
- [x] Block breaking sounds
- [x] Footstep sounds
- [x] Ambient sounds (water, wind) (Implemented in `js/audio.js`)
- [x] Sound effects for actions

### 10. Inventory Enhancements
- [ ] Quick item swap
- [ ] Inventory sorting
- [x] **Full Inventory UI** (Data implemented, UI missing)
- [x] Drag and drop items
- [x] Item stacking (Simple stacking implemented in drops)
- [x] Hotbar number indicators

## Low Priority / Polish Features

### 11. Advanced Gameplay
- [ ] Experience points and levels
- [ ] Enchanting system
- [ ] Potions and brewing
- [x] Health regeneration (Implemented in `js/player.js`)

### 12. Creative Mode Features
- [ ] Unlimited blocks
- [ ] Instant block breaking
- [ ] No collision mode (noclip)
- [ ] Weather control
- [x] Fly mode toggle (Key 'F')
- [x] World edit tools (copy, paste, fill) - Fill tool implemented
- [x] Time control

### 13. Performance Optimizations
- [ ] LOD (Level of Detail) system
- [ ] Worker threads for world generation
- [ ] Better memory management
- [ ] Greedy meshing for fewer draw calls
- [x] Chunk-based rendering optimization
- [x] Frustum culling improvements
- [x] Occlusion culling (Exposed Face Caching)

### 14. Social Features
- [ ] Screenshot system
- [ ] Share world links
- [ ] Leaderboards
- [ ] World showcase gallery
- [ ] Friends system

### 15. Advanced Building Tools
- [ ] Copy/paste structures
- [ ] Symmetry mode
- [ ] Fill tool
- [ ] Replace tool
- [ ] Undo/redo system

### 16. World Interaction (Misc)
- [ ] Minecarts and rails
- [ ] Boats
- [ ] Signs and text

### 17. Modding Support
- [ ] Plugin API
- [ ] Custom block types
- [ ] Custom mob types
- [ ] Event hooks
- [ ] Resource pack support
- [ ] Texture customization

## Bugs & Maintenance

### 18. Known Bugs & Issues
- [ ] **Refactor Structure Manager**: Move specific structure logic (Wells, Trees) into separate classes or modules to support expanding Village generation.
- [x] **Fix Water Flow Logic**: Current implementation is basic; improve to match Minecraft mechanics (limited spread, source block creation).
- [x] **Fix Spruce Tree Visuals**: Spruce trees currently use Oak blocks (`BLOCK.WOOD` and `BLOCK.LEAVES`). Implement and use `BLOCK.SPRUCE_WOOD` and `BLOCK.SPRUCE_LEAVES`.

### 19. Completed Fixes (History)
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
- [x] **Implement Stairs** (Placement logic, complex collision, visual models)
- [x] **Implement Structure Manager** (System to spawn structures like Trees, Wells, Ruins)
- [x] **Implement Basic Structure Generation** (Wells, Trees, Cacti)
- [x] **Implement Biome Manager** (Distinct regions for Desert, Forest, Snow)
- [x] **Implement Desert Biome** (Sand, Cactus)
- [x] **Implement Snow Biome** (Snow blocks, Ice, Spruce Trees)
- [x] **Smelting System (Furnace UI & Logic)**
- [x] **Implement Recipe Book UI** (Show available recipes visually)
- [x] Pickaxes (wood, stone, iron, diamond)
- [x] Shovels for faster dirt/sand breaking
- [x] Axes for faster wood breaking
- [x] Swords for combat
- [x] Tool durability system
- [x] Different breaking speeds based on tool and block
- [x] **Implement Tool Repair** (Crafting combination)
- [x] Passive mobs (Cows, Pigs, Sheep implemented)
- [x] Hostile mobs (zombies, skeletons, spiders)
- [x] Mob AI pathfinding (Random movement and Chase behavior implemented)
- [x] Day/night spawn cycles
- [x] Mob drops and loot (Drops implemented: leather, porkchop, rotten flesh, bones, string, wool, mutton)
- [x] Health and combat system (Player health, Mob damage)
- [x] Mob animations (Simple billboard rendering)
- [x] Sheep Mob (Fully implemented)
- [x] Sprinting mechanic
- [x] Fall damage
- [x] Hunger system (Decay and starvation implemented)
- [x] Eating/Food Consumption (Implemented, including sound)
- [x] **Bed & Sleeping (Skip Night)**
- [x] **Implement Doors** (Open/Close logic, models)
- [x] **Implement Slabs** (Placement logic, half-block physics)
- [x] **Implement Chests and Storage** (UI, persistence)
- [x] Additional block types (brick, concrete, wool colors)
- [x] Torches (Lighting system) (Basic light propagation and recipes implemented)

## Contribution Guidelines
* When adding a new feature, please update this file.
* Ensure all tests pass before submitting.
* Follow the code style of the existing project.
