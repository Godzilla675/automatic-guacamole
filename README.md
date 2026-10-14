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
python3 -m http.server 8000   # or: npm start
# Visit http://localhost:8000
```

3. (Optional) multiplayer: `cd server && npm install && node server.js` starts the WebSocket server on port 8080.

### Requirements
- Modern browser with Canvas 2D support (Chrome, Firefox, Safari, Edge)
- No external runtime dependencies or CDN connectivity required for basic execution!

## 📂 Project Structure

```
automatic-guacamole/
├── index.html           # Main HTML shell; loads every js/ file in order (no build step)
├── styles.css           # Responsive styling & UI themes
├── js/                  # Game engine - plain browser globals, one class per file
│   ├── main.js          # Entry point & game initialization
│   ├── game.js          # Core loop, world interaction, item use & event manager
│   ├── interactions.js  # Right-click block behaviour registry (BlockInteractions)
│   ├── world.js         # World management, terrain generation, redstone/fluid ticking
│   ├── chunk.js         # Chunk block/metadata/light storage
│   ├── structures.js    # Tree & structure generator
│   ├── village.js       # Village generation
│   ├── biome.js         # Biome definitions & climate mapping
│   ├── math.js          # Noise, vectors & projection utilities
│   ├── blocks.js        # Block/item definitions, properties & drops
│   ├── crafting.js      # Crafting recipes & smelting logic
│   ├── player.js        # Player state, inventory, equipment & stats
│   ├── physics.js       # AABB physics, collision & raycasting
│   ├── entity.js        # Base entity class
│   ├── mob.js           # Mob AI, hostile/passive mobs & spawning
│   ├── drop.js          # Dropped item entity & pickup mechanics
│   ├── vehicle.js       # Boats, minecarts & mountable entities
│   ├── renderer.js      # Canvas 2D projection & block/entity drawing
│   ├── textures.js      # Procedural texture generator
│   ├── particles.js     # Particle system
│   ├── audio.js         # Sound effects engine (Web Audio API)
│   ├── ui.js            # UI management (inventories, chests, anvil, brewing, ...)
│   ├── minimap.js       # Live minimap renderer
│   ├── input.js         # Keyboard, mouse & touch input
│   ├── chat.js          # Chat system, logs & slash commands
│   ├── achievements.js  # Achievement tracking & toasts
│   ├── tutorial.js      # Onboarding guide & tips
│   ├── network.js       # Multiplayer client (WebSocket)
│   └── plugin.js        # Plugin API manager
├── server/              # Optional WebSocket multiplayer server (`npm run server`)
├── tests/               # Mocha unit tests (run with `npm test`)
│   └── helpers/game_env.js  # Shared JSDOM harness used by newer tests
├── scripts/
│   ├── run-tests.js     # Per-file test runner used by `npm test` and CI
│   └── e2e/             # Playwright / manual browser smoke scripts (not run in CI)
├── verification/        # Historical ad-hoc verification scripts (not run in CI)
├── docs/
│   ├── COMPLETED_FEATURES.md  # Archive of everything already implemented
│   └── reports/               # Historical test & audit reports
├── FUTURE_FEATURES.md   # Open backlog: bugs, engineering tasks, feature ideas
└── AGENTS.md            # Working agreement for AI agents / contributors
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

### Adding Right-Click Behaviour to a Block
Block "use" handlers are registered in `js/interactions.js` (or from a plugin) instead of being added to `Game.interact()`:

```javascript
BlockInteractions.register(BLOCK.JUKEBOX, (game, x, y, z, blockType, pos) => {
    game.ui.openJukebox(x, y, z);
    return true; // click consumed -> no block gets placed
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

```bash
npm install          # mocha + jsdom (+ the optional native `canvas` package if it can build)
npm test             # every tests/*.js file in its own process, summary at the end
npm test -- --verbose                      # stream mocha output for all files
npm test -- tests/test_hoppers.js          # one or more files / directories
npm run test:file -- tests/test_world.js   # plain mocha for a single file (fastest when iterating)
```

`npm test` runs `scripts/run-tests.js`, which executes each test file in a separate Mocha process.
This matters: most test files boot the game inside their own JSDOM and set globals such as
`window`/`document`/`BLOCK`, so running them all in one process makes them trample each other.

- Texture tests need the native [`canvas`](https://www.npmjs.com/package/canvas) package. It is an
  *optional* dependency: if it fails to build on your machine, `npm install` still succeeds and only the
  texture-related test files fail locally. CI installs it with prebuilt binaries.
- New tests should use the shared harness in `tests/helpers/game_env.js` (see
  `tests/test_block_interactions.js` for an example) instead of hand-rolling a JSDOM.
- Browser smoke scripts (Playwright) live in `scripts/e2e/` and are run manually:
  `npx playwright install chromium && node scripts/e2e/playwright_console_errors.js`.

### Continuous integration

`.github/workflows/tests.yml` runs `node --check` on every script plus the full `npm test` on each PR.
Automated agent PRs are gated on the same suite before auto-merge (`auto-merge-jules.yml`).

## 🤝 Contributing

- Pick work from `FUTURE_FEATURES.md` (bugs and engineering tasks first). Finished items move to
  `docs/COMPLETED_FEATURES.md` in the same PR.
- Add right-click block behaviour through `BlockInteractions.register(...)` in `js/interactions.js`
  rather than extending `Game.interact()`.
- Every behaviour change ships with a test; `npm test` must stay green. See `AGENTS.md` for the full
  working agreement (it applies to humans too).

## 📄 License

This project is open source and available for educational purposes.
