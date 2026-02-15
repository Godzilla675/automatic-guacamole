const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html><body>
<canvas id="game-canvas"></canvas>
<div id="chat-input"></div><div id="chat-messages"></div>
<div id="hotbar"></div>
<button id="settings-btn"></button><button id="close-settings"></button>
<input id="volume-slider" type="range"><input id="fov-slider" type="range"><input id="render-dist-slider" type="range">
<button id="reset-controls"></button><button id="pause-btn"></button>
<button id="close-furnace"></button>
<div id="furnace-input"></div><div id="furnace-fuel"></div><div id="furnace-output"></div>
<button id="open-recipe-book"></button><button id="close-recipe-book"></button>
<button id="close-trading"></button>
<button id="close-chest"></button>
<div id="settings-screen"></div><div id="pause-screen"></div>
<div id="fov-value"></div><div id="render-dist-value"></div>
<div id="keybinds-list"></div>
<div id="chest-screen"></div><div id="inventory-screen"></div><div id="inventory-grid"></div><div id="chest-grid"></div>
<div id="crafting-screen"></div><div id="recipe-book-screen"></div><div id="recipe-list"></div>
<div id="trading-screen"></div><div id="trading-list"></div>
<div id="furnace-screen"></div><div id="furnace-progress"></div><div id="furnace-burn"></div>
<div id="health-bar"></div><div id="hunger-bar"></div><div id="damage-overlay"></div>
<div id="mobile-controls"></div>
<div id="crosshair"></div>
</body>`, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost/"
});

dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.navigator = { userAgent: "node" };
dom.window.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
dom.window.AudioContext = class {
    createGain() { return { gain: { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, setTargetAtTime: () => {} }, connect: () => {} }; }
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createPanner() { return { connect: () => {}, positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 } }; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
    createBiquadFilter() { return { connect: () => {} }; }
    createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
    resume() {}
    get state() { return 'running'; }
};
dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 16);
dom.window.soundManager = { play: () => {}, updateAmbience: () => {}, updateListener: () => {} };

// Mock Canvas
dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform: () => {},
    clearRect: () => {},
    fillRect: () => {},
    drawImage: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    fillText: () => {},
    save: () => {},
    restore: () => {},
    scale: () => {},
    rotate: () => {},
    translate: () => {},
    clip: () => {},
    createPattern: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    arc: () => {},
    closePath: () => {},
    rect: () => {},
    imageSmoothingEnabled: true
});

const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error(`Failed to load ${f}:`, e);
    }
};

// Load dependencies
['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'physics.js', 'entity.js', 'vehicle.js', 'drop.js', 'mob.js', 'player.js', 'plugin.js', 'particles.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'network.js', 'crafting.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'audio.js', 'game.js'].forEach(load);

const { Game, Physics, World, BLOCK, Player } = dom.window;

describe('Bug Reproduction Tests', () => {
    let game, world, physics, player;

    beforeEach(() => {
        game = new Game();
        world = game.world;
        physics = game.physics;
        player = game.player;

        // Mock World for simple testing
        const originalGetBlock = world.getBlock;
        world.getBlock = (x, y, z) => {
            if (x === 0 && y === 10 && z === 0) return BLOCK.FENCE;
            if (x === 10 && y === 10 && z === 10) return BLOCK.STONE; // Neighbor for trapdoor
            // Ensure path from 12 to 10 is clear
            if (x > 10) return BLOCK.AIR;
            return BLOCK.AIR;
        };
        world.getMetadata = (x, y, z) => 0;

        // Mock setBlock to just log or store in a simple map if needed
        world.changes = {};
        world.setBlock = (x, y, z, type) => { world.changes[`${x},${y},${z}`] = type; };
        world.setMetadata = (x, y, z, meta) => { world.changes[`${x},${y},${z}_meta`] = meta; };
    });

    it('reproduce Fence Collision Bug', () => {
        const playerBox = { x: 0.5, y: 11.2, z: 0.5, width: 0.6, height: 1.8 };
        const collision = physics.checkCollision(playerBox);
        assert.ok(collision, "Player at 11.2 should collide with Fence at 10 (height 1.5)");
    });

    it('reproduce Trapdoor Placement Bug', () => {
        // Place Trapdoor against Stone at 10,10,10.
        // We want to hit the +X face (West face relative to world, but normal is East +1).
        // Hit point x = 11.0.
        // Hit point y = 10.8 (Top half of face).
        // Hit point z = 10.5 (Center).

        // Setup Player to look at this point
        player.x = 12.0;
        player.z = 10.5;
        // Eye height = player.y + player.height * 0.9 = player.y + 1.62.
        // We want eye height = 10.8.
        player.y = 10.8 - 1.62; // 9.18

        // Look direction: -1, 0, 0 (West).
        // Yaw: Math.PI / 2 (West). Pitch: 0.
        player.yaw = -Math.PI / 2;
        player.pitch = 0;

        // Equip Trapdoor
        player.inventory[player.selectedSlot] = { type: BLOCK.TRAPDOOR, count: 1 };

        // Ensure we can place at 11, 10, 10 (Target block to place IN)
        // Raycast hits 10,10,10 (Stone).
        // Face normal is +1, 0, 0.
        // New block pos = 10+1, 10, 10 = 11, 10, 10.

        // Override world.getBlock to return AIR at 11,10,10 specifically if needed,
        // but our mock returns AIR for x > 10.

        // Run placeBlock
        game.placeBlock();

        // Check if Trapdoor was placed
        assert.strictEqual(world.changes['11,10,10'], BLOCK.TRAPDOOR, "Trapdoor placed at 11,10,10");

        const meta = world.changes['11,10,10_meta'];
        // We hit at y=10.8. Relative Y = 0.8. > 0.5.
        // Should have Top bit (8) set.

        assert.ok(meta !== undefined, "Metadata should be set");
        assert.strictEqual(meta & 8, 8, "Trapdoor should be placed on Top half (Meta bit 3 set)");
    });
});
