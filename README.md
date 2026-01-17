# 🎮 Voxel World - Minecraft Clone

A fully-featured browser-based Minecraft clone built with pure JavaScript and Canvas 2D. Play directly in your browser on both PC and mobile devices!

![Game Status](https://img.shields.io/badge/status-playable-brightgreen)
![Platform](https://img.shields.io/badge/platform-web-blue)
![Mobile](https://img.shields.io/badge/mobile-supported-success)

## 🚀 Features

### Core Gameplay
- ⛏️ **Block Building**: Place and break 8 different block types
- 🌍 **Procedural Terrain**: Infinite world generation with varied landscapes
- 🌲 **Natural Structures**: Automatically generated trees
- 💧 **Water Physics**: Water blocks with transparency
- 🌅 **Day/Night Cycle**: Dynamic lighting system with sun movement

### Player Mechanics
- 🏃 **Smooth Movement**: WASD controls with physics-based movement
- 🦘 **Jumping & Gravity**: Realistic physics simulation
- ✈️ **Flying Mode**: Toggle creative flying with F key
- 👀 **First-Person View**: Full 360° mouse look controls
- 💥 **Collision Detection**: Walk on blocks, can't walk through walls

### Block Types
1. 🟫 **Dirt** - Basic building material
2. 🔲 **Stone** - Underground foundation
3. 🟩 **Grass** - Surface blocks
4. 🪵 **Wood** - Tree trunks
5. 🌿 **Leaves** - Tree foliage (transparent)
6. 🏖️ **Sand** - Beach and desert material
7. 💧 **Water** - Liquid blocks (transparent)
8. 🔷 **Glass** - Transparent building material

### Mobile Support
- 📱 **Touch Controls**: Virtual joystick for movement
- 👆 **Swipe to Look**: Touch right side to look around
- 🎮 **Action Buttons**: Dedicated buttons for jump, break, place, and fly
- 📐 **Responsive Design**: Automatically adjusts to screen size

### User Interface
- 🎒 **Hotbar**: Quick access to 5 block types
- 📦 **Inventory System**: Full inventory with all block types
- 📊 **Debug Info**: FPS counter, position, block count
- ⏸️ **Pause Menu**: Pause and resume gameplay
- 🎯 **Crosshair**: Centered aiming reticle

## 🎯 How to Play

### PC Controls
- **W/A/S/D** - Move forward/left/backward/right
- **Mouse** - Look around
- **Space** - Jump
- **Shift** - Sneak / Descend (in flying mode)
- **F** - Toggle flying mode
- **Left Click** - Break block
- **Right Click** - Place block
- **1-5** - Select block from hotbar
- **E** - Open/close inventory
- **Esc** - Pause game

### Mobile Controls
- **Left Joystick** - Move character
- **Right Side Touch** - Look around
- **Jump Button** - Jump
- **Break Button** - Break blocks
- **Place Button** - Place blocks
- **Fly Button** - Toggle flying mode

## 🌐 Getting Started

### Play Online
Simply open `index.html` in a modern web browser:
- Chrome (recommended)
- Firefox
- Safari
- Edge

### Local Setup
1. Clone this repository
```bash
git clone https://github.com/Godzilla675/automatic-guacamole.git
cd automatic-guacamole
```

2. Open the game
```bash
# Open index.html in your browser
# Or use a simple HTTP server:
python -m http.server 8000
# Then visit http://localhost:8000
```

### Requirements
- Modern web browser with Canvas 2D support
- JavaScript enabled
- For best performance: Desktop with modern CPU
- Mobile: iOS 12+ or Android 8+
- No external dependencies or CDN required

## 📂 Project Structure

```
automatic-guacamole/
├── index.html          # Main HTML structure
├── styles.css          # All styling and responsive design
├── game.js            # Complete game engine and logic
├── README.md          # This file
└── FUTURE_FEATURES.md # Roadmap for future development
```

## 🛠️ Technical Details

### Technologies Used
- **Canvas 2D API** - 3D projection rendering (no external dependencies!)
- **Vanilla JavaScript** - Game logic (no frameworks)
- **CSS3** - UI styling and animations
- Pure web standards - Works everywhere without CDN dependencies

### Performance
- Target: 60 FPS on desktop, 30+ FPS on mobile
- Chunk-based world management
- Dynamic rendering distance (4 chunks)
- Distance-based lighting and fog
- Painter's algorithm sorting for proper transparency

### Architecture
- Object-oriented design with `VoxelWorld` class
- Event-driven input system
- Physics simulation with collision detection
- Procedural terrain generation
- Day/night cycle with dynamic lighting
- Custom 3D projection using Canvas 2D (no WebGL required)

## 🎨 Customization

The game is easily customizable:

### Add New Block Types
Edit `game.js` in the `initBlockTypes()` method:
```javascript
8: { 
    name: 'newblock', 
    color: '#FF0000',   // Color in hex string format
    top: '#FF6666',     // Top face color
    solid: true,        // Is it solid?
    transparent: false  // Is it transparent?
}
```

### Adjust World Generation
Modify `getHeightAt()` method in `game.js` to change terrain:
```javascript
const scale = 0.05;  // Smaller = smoother terrain
const noise = Math.sin(x * scale) * Math.cos(z * scale) * 5;
```

### Change Game Settings
In `game.js` constructor, adjust:
- `chunkSize`: Size of each chunk (default: 16)
- `renderDistance`: How far to render chunks (default: 4)
- `worldHeight`: Maximum build height (default: 32)
- `dayLength`: Length of day/night cycle in ms (default: 120000)

## 🐛 Known Issues

- No world persistence (reloading page resets world)
- Limited render distance to maintain performance
- Block breaking is instant (no animation yet)
- No sound effects or music
- Uses Canvas 2D instead of WebGL (good for compatibility, but lower performance)

See [FUTURE_FEATURES.md](FUTURE_FEATURES.md) for planned improvements.

## 📋 Future Development

This game is designed to be extended! Check out [FUTURE_FEATURES.md](FUTURE_FEATURES.md) for a comprehensive list of features that should be implemented, including:

- 🌐 Multiplayer support
- 🎒 Crafting system
- 👾 Mobs and AI
- 💾 World saving/loading
- 🎵 Sound effects and music
- 🏗️ Advanced building blocks
- ⚡ Performance optimizations
- And much more!

## 🤝 Contributing

Future developers should:
1. Read [FUTURE_FEATURES.md](FUTURE_FEATURES.md) for planned features
2. Maintain the existing code style
3. Test on both PC and mobile
4. Update documentation
5. Consider performance impact

## 📄 License

This project is open source and available for educational purposes.

## 🎮 Credits

Created as a browser-based Minecraft-inspired voxel game using pure web technologies.

### Technologies
- Canvas 2D API - Custom 3D projection and rendering
- Modern web standards (HTML5, CSS3, ES6+)

## 🚀 Performance Tips

### For Players
- Close other browser tabs for better FPS
- Use Chrome for best performance
- On mobile: close background apps
- Reduce render distance if laggy (edit `game.js`)

### For Developers
- Profile with browser DevTools
- Monitor draw calls and geometry count
- Use texture atlases for better performance
- Implement frustum culling for large worlds
- Consider instanced rendering for repeated blocks

## 📞 Support

For issues or questions:
1. Check [FUTURE_FEATURES.md](FUTURE_FEATURES.md) for known limitations
2. Test in different browsers
3. Check browser console for errors
4. Verify Canvas 2D support in your browser (all modern browsers support this)

## 🎉 Have Fun!

Enjoy building in your own voxel world! Whether you're on PC or mobile, create amazing structures and explore the procedurally generated terrain.

Happy crafting! ⛏️🎮