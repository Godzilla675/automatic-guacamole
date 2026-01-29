const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html>
<body>
<div id="game-canvas"></div>
<div id="chat-container"></div>
<div id="chat-messages"></div>
<input id="chat-input" class="hidden">
<div id="hotbar"></div>
<div id="health-bar"></div>
<div id="hunger-bar"></div>
<div id="damage-overlay"></div>
<div id="fps"></div>
<div id="position"></div>
<div id="block-count"></div>
<div id="game-time"></div>
<div id="crafting-screen" class="hidden"></div>
<div id="crafting-recipes"></div>
<div id="close-crafting"></div>
<div id="inventory-screen" class="hidden"></div>
<div id="pause-screen" class="hidden"></div>
<div id="debug-info" class="hidden"></div>
<div id="crosshair"></div>
<div id="loading-screen"></div>
<div id="menu-screen"></div>
<button id="start-game"></button>
<button id="resume-game"></button>
<button id="return-menu"></button>
<button id="close-inventory"></button>
<div id="mobile-controls" class="hidden"></div>
<div id="joystick-container"></div>
<div id="joystick-stick"></div>
<button id="jump-btn"></button>
<button id="break-btn"></button>
<button id="place-btn"></button>
<button id="fly-btn"></button>
</body>`, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost/"
});

// Mock globals
dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.navigator = { userAgent: "node", maxTouchPoints: 0 };
dom.window.WebSocket = class MockWebSocket {
    constructor(url) { this.readyState = 1; }
    send() {}
    close() {}
};
dom.window.AudioContext = class {
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
    createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
    createBiquadFilter() { return { connect: () => {} }; }
    resume() {}
    get state() { return 'running'; }
};

// Mock Canvas Instance directly
const canvas = dom.window.document.getElementById('game-canvas');
canvas.getContext = () => ({
    setTransform: () => {}, fillStyle: '', fillRect: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {}, strokeRect: () => {}, font: '', fillText: () => {}, measureText: () => ({ width: 0 }), createLinearGradient: () => ({ addColorStop: () => {} }), clearRect: () => {}, save: () => {}, restore: () => {}, scale: () => {}, translate: () => {}, rotate: () => {},
});

dom.window.requestAnimationFrame = (cb) => {};
dom.window.prompt = () => "Tester";
dom.window.localStorage = { getItem: () => null, setItem: () => {}, clear: () => {}, removeItem: () => {} };
dom.window.perlin = { noise: () => 0.5 };

// Load Code
const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error("Error loading " + f, e);
    }
};

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'drop.js', 'crafting.js', 'player.js', 'mob.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'game.js'].forEach(load);

describe('New Features Verification (Fences, Gates, Trapdoors, Panes)', () => {
    let game;
    let physics;
    let world;

    before(function(done) {
        this.timeout(5000);
        game = new dom.window.Game();
        game.world.renderDistance = 2;
        game.gameLoop = () => {};
        game.init().then(() => {
            physics = game.physics;
            world = game.world;
            done();
        }).catch(e => done(e));
    });

    describe('Blocks Definitions', () => {
        it('should have new blocks defined', () => {
            assert.ok(dom.window.BLOCK.FENCE, "FENCE ID defined");
            assert.ok(dom.window.BLOCK.FENCE_GATE, "FENCE_GATE ID defined");
            assert.ok(dom.window.BLOCK.GLASS_PANE, "GLASS_PANE ID defined");
            assert.ok(dom.window.BLOCK.TRAPDOOR, "TRAPDOOR ID defined");

            assert.ok(dom.window.BLOCKS[dom.window.BLOCK.FENCE].isFence, "FENCE isFence");
            assert.ok(dom.window.BLOCKS[dom.window.BLOCK.FENCE_GATE].isFenceGate, "FENCE_GATE isFenceGate");
            assert.ok(dom.window.BLOCKS[dom.window.BLOCK.GLASS_PANE].isPane, "GLASS_PANE isPane");
            assert.ok(dom.window.BLOCKS[dom.window.BLOCK.TRAPDOOR].isTrapdoor, "TRAPDOOR isTrapdoor");
        });
    });

    describe('Physics Collision', () => {
        const x = 0, y = 50, z = 0;

        beforeEach(() => {
            world.setBlock(x, y, z, dom.window.BLOCK.AIR);
            world.setMetadata(x, y, z, 0);
        });

        it('should collide with Fence (1.5 height)', () => {
            world.setBlock(x, y, z, dom.window.BLOCK.FENCE);

            // Box at y + 1.2 (above 1.0 but below 1.5)
            const box = { x: x+0.5, y: y+1.2, z: z+0.5, width: 0.5, height: 1.0 };
            const collision = physics.checkCollision(box);
            assert.strictEqual(collision, true, "Should collide with fence at height 1.2");

            // Box at y + 1.6 (above 1.5)
            const boxHigh = { x: x+0.5, y: y+1.6, z: z+0.5, width: 0.5, height: 1.0 };
            const collisionHigh = physics.checkCollision(boxHigh);
            assert.strictEqual(collisionHigh, false, "Should NOT collide with fence at height 1.6");
        });

        it('should collide with Trapdoor (Closed vs Open)', () => {
            world.setBlock(x, y, z, dom.window.BLOCK.TRAPDOOR);
            world.setMetadata(x, y, z, 0); // Closed Bottom

            // Box inside bottom slab
            const box = { x: x+0.5, y: y+0.1, z: z+0.5, width: 0.5, height: 0.5 };
            assert.strictEqual(physics.checkCollision(box), true, "Collide closed bottom trapdoor");

            // Box above bottom slab
            const boxAbove = { x: x+0.5, y: y+0.5, z: z+0.5, width: 0.5, height: 0.5 };
            assert.strictEqual(physics.checkCollision(boxAbove), false, "Pass above closed bottom trapdoor");

            // Open Trapdoor
            world.setMetadata(x, y, z, 4); // Open
            assert.strictEqual(physics.checkCollision(box), false, "Pass open trapdoor (simplified)");
        });

        it('should collide with Pane (Center only)', () => {
            world.setBlock(x, y, z, dom.window.BLOCK.GLASS_PANE);

            // Box in center
            const boxCenter = { x: x+0.5, y: y+0.5, z: z+0.5, width: 0.1, height: 0.5 };
            assert.strictEqual(physics.checkCollision(boxCenter), true, "Collide center pane");

            // Box at edge (should pass if simplified to center column)
            // Center column is width 0.25 (0.375 to 0.625)
            // Edge box at 0.1
            const boxEdge = { x: x+0.1, y: y+0.5, z: z+0.5, width: 0.1, height: 0.5 };
            assert.strictEqual(physics.checkCollision(boxEdge), false, "Pass edge of pane");
        });
    });

    describe('Placement & Interaction', () => {
        const x = 10, y = 50, z = 10;

        beforeEach(() => {
             world.setBlock(x, y, z, dom.window.BLOCK.AIR);
        });

        it('should place Fence Gate with orientation', () => {
             // Mock player yaw South (PI/2 = 1.57) -> Meta 2?
             // Logic: if (r >= PI/4 && r < 3*PI/4) meta = 2; // South
             game.player.yaw = Math.PI / 2;

             // Mock Inventory
             game.player.inventory[game.player.selectedSlot] = { type: dom.window.BLOCK.FENCE_GATE, count: 1 };

             // Mock Raycast to hit floor
             world.setBlock(x, y-1, z, dom.window.BLOCK.STONE);
             // We need game.physics.raycast to return hit at y-1
             const originalRaycast = game.physics.raycast;
             game.physics.raycast = () => ({ x: x, y: y-1, z: z, face: {x: 0, y: 1, z: 0}, dist: 2 });

             game.placeBlock();

             assert.strictEqual(world.getBlock(x, y, z), dom.window.BLOCK.FENCE_GATE, "Fence Gate placed");
             assert.strictEqual(world.getMetadata(x, y, z), 2, "Fence Gate orientation South");

             game.physics.raycast = originalRaycast;
        });

        it('should place Trapdoor Top/Bottom based on hit', () => {
             game.player.yaw = 0;
             game.player.inventory[game.player.selectedSlot] = { type: dom.window.BLOCK.TRAPDOOR, count: 1 };

             world.setBlock(x, y-1, z, dom.window.BLOCK.STONE);

             const originalRaycast = game.physics.raycast;
             // Hit bottom face of block above? No, hit side of block.
             // Let's say we hit side of block at (x-1, y, z).
             // And hit.y is y + 0.8 (Top half).
             // This places trapdoor at x,y,z (neighbor).
             // Since we hit top half, should set Top bit (8).

             // However, my code says:
             // const hitY = eyePos.y + dir.y * hit.dist;
             // We need to mock raycast AND ensure hitY calculation works or mock raycast returns dist.

             // Let's use placed on bottom face of block above.
             // If hit.face.y === -1.
             game.physics.raycast = () => ({ x: x, y: y+1, z: z, face: {x: 0, y: -1, z: 0}, dist: 2 });

             game.placeBlock();

             assert.strictEqual(world.getBlock(x, y, z), dom.window.BLOCK.TRAPDOOR, "Trapdoor placed");
             const meta = world.getMetadata(x, y, z);
             assert.ok(meta & 8, "Trapdoor should be Top (Bit 3 set)");

             game.physics.raycast = originalRaycast;
        });

        it('should toggle Fence Gate Open/Close', () => {
            world.setBlock(x, y, z, dom.window.BLOCK.FENCE_GATE);
            world.setMetadata(x, y, z, 0); // Closed

            game.interact(x, y, z);

            assert.strictEqual(world.getMetadata(x, y, z), 4, "Gate should open (Meta 4)");

            game.interact(x, y, z);
            assert.strictEqual(world.getMetadata(x, y, z), 0, "Gate should close (Meta 0)");
        });
    });
});
