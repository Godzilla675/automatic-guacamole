# 🎮 Voxel World - Minecraft Clone

A fully-featured browser-based Minecraft clone built with pure JavaScript and Canvas 2D. Play directly in your browser on both PC and mobile devices!

![Game Status](https://img.shields.io/badge/status-playable-brightgreen)
![Platform](https://img.shields.io/badge/platform-web-blue)
![Mobile](https://img.shields.io/badge/mobile-supported-success)

## 🚀 Features

### Core Gameplay & Physics
- ⛏️ **Block Building & Breaking**: Place and mine dozens of block types with tool-specific mining speeds and drop mechanics.
- 🌍 **Procedural Terrain & Biomes**: Infinite world generation with varied biomes, terrain height maps, and naturally generated structures (trees, villages, structures).
- 💧 **Fluid Dynamics & Physics**: Water and lava flow mechanics, sponge drainage, soul sand slowdowns, and realistic player/entity gravity.
- 🌅 **Day/Night Cycle & Lighting**: Dynamic day/night cycle with sun/moon positioning, custom skybox rendering, and ambient lighting.
- 🛡️ **Combat & Equipment**: Shields for blocking damage, main-hand and offhand item slots, armor equipment, weapons, and tool durability.
- 🚗 **Vehicles & Entities**: Rideable boats and minecarts (vehicles subclassed with damage and drop handling), dropped items, and mob entities.

### Systems & UI Mechanics
- 🎒 **Inventory & Hotbar**: Full inventory management, hotbar selection, offhand slot, and armor equipment.
- 📜 **Crafting, Smelting & Brewing**: 2x2 and 3x3 crafting grid UI, furnace smelting, and brewing stand interface.
- 📻 **Interactive Blocks**: Functional Jukebox, Anvil repair/naming UI, Beds (sleeping/respawn), TNT explosion mechanics, and chests.
- 🗺️ **Minimap & Navigation**: Live minimap radar displaying player orientation, surrounding terrain, and nearby entities/mobs.
- 💬 **Chat & Commands**: Interactive chat system supporting commands (`/tp`, `/time`, `/gamemode`, `/give`, `/spawn`), scrollable history log, and message toggles.
- 🏆 **Achievements & Tutorials**: In-game achievements tracking milestones and an interactive tutorial overlay.
- 🧩 **Plugin System**: Modular plugin framework (`js/plugin.js`) for custom extensions and block additions.

### Mobile & Touch Support
- 📱 **Virtual Joystick**: Dual touch controls for movement and fluid rotation.
- 👆 **Touch Controls**: Dedicated touch action buttons for jump, place, break, fly, and inventory toggles.
- 📐 **Responsive Canvas**: Dynamic scaling to fit any mobile or desktop viewports.

## 🎯 How to Play

### PC Controls
- **W / A / S / D** - Move forward / left / backward / right
- **Mouse** - Look around
- **Space** - Jump
- **Shift** - Sneak / Descend (in flying mode)
- **F** - Toggle flying mode
- **Left Click** - Break block / Attack
- **Right Click** - Place block / Interact (open UI, drive vehicle, use shield)
- **1-9** - Select hotbar slot
- **E** - Toggle Inventory / Crafting UI
- **T / /** - Open Chat window
- **Esc** - Pause game / Close UI screens

### Mobile Controls
- **Left Joystick** - Move character
- **Right Screen Drag** - Look around
- **Jump / Break / Place / Fly Buttons** - Action triggers

## 🌐 Getting Started

### Local Setup
1. Clone this repository:
```bash
git clone https://github.com/Godzilla675/automatic-guacamole.git
cd automatic-guacamole
```

2. Open `index.html` in a modern web browser, or launch a simple local HTTP server:
```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Requirements
- Modern browser with Canvas 2D support (Chrome, Firefox, Safari, Edge)
- No external runtime dependencies or CDN connectivity required for basic execution!

## 📂 Project Structure

```
automatic-guacamole/
├── index.html           # Main HTML shell & scripts loader
├── styles.css           # Responsive styling & UI themes
├── js/                  # Modular JavaScript game engine
│   ├── achievements.js  # Achievement tracking & popup toasts
│   ├── audio.js         # Sound effects engine (Web Audio API)
│   ├── biome.js         # Biome definitions & climate mapping
│   ├── blocks.js        # Block definitions, properties & drops
│   ├── chat.js          # Chat system, logs & slash commands
│   ├── chunk.js         # Chunk generation & block storage
│   ├── crafting.js      # Crafting recipes & smelting logic
│   ├── drop.js          # Dropped item entity & pickup mechanics
│   ├── entity.js        # Base entity class
│   ├── game.js          # Core loop, world interaction & event manager
│   ├── input.js         # Keyboard, mouse, & touch input handler
│   ├── main.js          # Entry point & game initialization
│   ├── math.js          # Vector math & projection utilities
│   ├── minimap.js       # Live minimap UI renderer
│   ├── mob.js           # Mob AI, hostile/passive mobs & spawning
│   ├── network.js       # Multiplayer networking stub / socket handler
│   ├── particles.js     # Particle system for breaking/effects
│   ├── physics.js       # AABB physics, collision & raycasting
│   ├── player.js        # Player state, inventory, equipment & stats
│   ├── plugin.js        # Extension / plugin API manager
│   ├── renderer.js      # Canvas 2D projection, 3D block rendering & light
│   ├── structures.js    # Tree & structure generator
│   ├── textures.js      # Procedural texture canvas generator
│   ├── tutorial.js      # Onboarding guide & interactive tips
│   ├── ui.js            # UI management (Inventories, Chests, Anvil, Brewing, Jukebox)
│   ├── vehicle.js       # Boats, Minecarts & mountable entity handling
│   ├── village.js       # Village generation logic
│   └── world.js         # World management & terrain generation
├── tests/               # Mocha / JavaScript unit test suite
├── README.md            # Project documentation
└── FUTURE_FEATURES.md   # Roadmap for upcoming features & backlog
```

## 🛠️ Customization & Plugin API

### Registering Custom Blocks via Plugin System
The engine features a modular plugin architecture (`js/plugin.js`). You can extend block definitions programmatically:

```javascript
window.gamePluginManager.registerPlugin({
    id: 'my-custom-plugin',
    name: 'Custom Blocks Plugin',
    init(game) {
        // Access game blocks and register custom logic
        console.log('Plugin loaded!');
    }
});
```

### Adding New Blocks in `js/blocks.js`
1. Define the block constant and properties in `js/blocks.js`:
```javascript
MY_CUSTOM_BLOCK: 120
```
2. Set its metadata (textures, solidity, transparency, tool drops) in `BLOCK_DEFS`.
3. Update crafting recipes in `js/crafting.js` or UI inventory slots in `js/ui.js` as needed.

## 🧪 Testing

Run unit tests via Mocha:
```bash
npx mocha tests/*.js
```

Run end-to-end automated tests with Playwright & Python:
```bash
python3 test_runner.py
```

## 📄 License

This project is open source and available for educational purposes.
