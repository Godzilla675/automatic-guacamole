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
dom.window.AudioContext = class { createGain() { return { gain: { value: 1, linearRampToValueAtTime: () => {} }, connect: () => {} }; } };
dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 16);
dom.window.soundManager = { play: () => {}, updateAmbience: () => {} };

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
['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'physics.js', 'drop.js', 'mob.js', 'player.js', 'plugin.js', 'particles.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'network.js', 'crafting.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'audio.js', 'game.js'].forEach(load);

const { Game, Physics, World, BLOCK, Player } = dom.window;

describe('Bug Reproduction Tests', () => {
    let game, world, physics, player;

    beforeEach(() => {
        game = new Game();
        world = game.world;
        physics = game.physics;
        player = game.player;

        // Mock World for simple testing
        world.getBlock = (x, y, z) => {
            if (x === 0 && y === 10 && z === 0) return BLOCK.FENCE;
            if (x === 10 && y === 10 && z === 10) return BLOCK.STONE; // Neighbor for trapdoor
            return BLOCK.AIR;
        };
        world.getMetadata = (x, y, z) => 0;

        // Mock setBlock to just log or store in a simple map if needed
        world.changes = {};
        world.setBlock = (x, y, z, type) => { world.changes[`${x},${y},${z}`] = type; };
        world.setMetadata = (x, y, z, meta) => { world.changes[`${x},${y},${z}_meta`] = meta; };
    });

    it('reproduce Fence Collision Bug', () => {
        // Fence at 0, 10, 0. Height is 1.5. Top is 11.5.
        // Player at 0, 11.2, 0.
        // Physics checkCollision should return true.

        const playerBox = { x: 0.5, y: 11.2, z: 0.5, width: 0.6, height: 1.8 };

        // Debug: what does checkCollision do?
        // It floors box.y (11) -> minY = 10 (because of -1 logic for tall blocks?)
        // Wait, current physics code: const minY = Math.floor(box.y) - 1;
        // If box.y = 11.2, minY = 11 - 1 = 10.
        // It checks y=10. Block at 0,10,0 is FENCE.

        // Let's verify if logic handles the vertical extent correctly.
        // In physics.js for Fence:
        // if (y < pMaxY && y + 1.5 > pMinY ...
        // Fence y=10. Top=11.5.
        // Player pMinY=11.2.
        // 11.5 > 11.2 -> True.

        // So why was it reported as a bug? Maybe my memory of the code is wrong, or the fix was already applied?
        // Let's run it and see.

        const collision = physics.checkCollision(playerBox);
        assert.ok(collision, "Player at 11.2 should collide with Fence at 10 (height 1.5)");
    });

    it('reproduce Trapdoor Placement Bug', () => {
        // Place Trapdoor against Stone at 10,10,10.
        // Click on side of Stone at 10,10,10. Face: {x:1, y:0, z:0} -> Place at 11,10,10.
        // Hit point y fraction > 0.5 -> Top trapdoor.

        // Mock raycast result
        physics.raycast = () => ({
            x: 10, y: 10, z: 10, // Hit Stone
            face: { x: 1, y: 0, z: 0 },
            dist: 2,
            point: { x: 11, y: 10.8, z: 10.5 } // Hit at y=10.8 (Top half)
        });

        // We need to simulate the exact hit position for the fractional check in placeBlock
        // In Game.placeBlock:
        // const hit = this.physics.raycast(...)
        // Trapdoor Logic: if ((hit.y - Math.floor(hit.y)) > 0.5) meta |= 8;

        // BUT wait, physics.raycast returns integer x,y,z of the BLOCK hit.
        // It does NOT currently return the exact hit vector in the returned object in `checkCollision`?
        // Let's check `physics.js` `raycast` return.
        // It returns { x, y, z, type, face, dist, (maybe point?) }

        // Looking at read_file of physics.js:
        // return { x, y, z, type: block, face: lastFace, dist: t };
        // It does NOT return the exact hit point coordinate.

        // In Game.placeBlock:
        // if (BLOCKS[slot.type].isTrapdoor) {
        //      // Check hit point relative Y
        //      let meta = 0;
        //      if ((hit.y - Math.floor(hit.y)) > 0.5) meta |= 8; // Top (Bit 3)
        // ...

        // hit.y is the integer block coordinate!
        // So hit.y - Math.floor(hit.y) is ALWAYS 0.
        // So it ALWAYS places bottom trapdoors.

        // BUG CONFIRMED by reading code.
        // Fix: Raycast needs to return the exact intersection point or we calculate it.

        // Let's verify the failure.
        // Mock raycast to return what the actual code returns
        physics.raycast = () => ({
            x: 10, y: 10, z: 10, // Integer coordinates
            face: { x: 1, y: 0, z: 0 },
            dist: 2,
            point: { x: 11, y: 10.8, z: 10.5 } // 10.8 -> Top half
        });

        // Equip Trapdoor
        player.inventory[player.selectedSlot] = { type: BLOCK.TRAPDOOR, count: 1 };

        // Override world.getBlock to allow placement at 11,10,10 (Air)
        const originalGetBlock = world.getBlock;
        world.getBlock = (x, y, z) => {
            if (x === 11 && y === 10 && z === 10) return BLOCK.AIR;
            return originalGetBlock(x,y,z);
        };

        // We want to simulate looking at the TOP half of the block.
        // But since raycast returns integer Y, the logic fails.

        game.placeBlock();

        // Check what happened at 11,10,10
        assert.strictEqual(world.changes['11,10,10'], BLOCK.TRAPDOOR, "Trapdoor placed");
        const meta = world.changes['11,10,10_meta'];

        // We expect it to FAIL to set top bit (8) because of the bug.
        // If the bug exists, meta will be 0 (or dependent on orientation), but bit 3 will be 0.
        // We WANT bit 3 to be 1 (Top).

        assert.strictEqual(meta & 8, 8, "Trapdoor should be placed on Top half (Meta bit 3 set)");
    });
});
