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

// Mock globals on dom.window
dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.navigator = { userAgent: "node" };

// Mock WebSocket
class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = 0; // CONNECTING
        setTimeout(() => {
            this.readyState = 1; // OPEN
            if (this.onopen) this.onopen();
        }, 10);
    }
    send(data) {
        if (MockWebSocket.lastSent) MockWebSocket.lastSent.push(data);
    }
    close() {
        this.readyState = 3; // CLOSED
        if (this.onclose) this.onclose();
    }
}
MockWebSocket.lastSent = [];
MockWebSocket.OPEN = 1;
MockWebSocket.CONNECTING = 0;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;
dom.window.WebSocket = MockWebSocket;

// Mock AudioContext
dom.window.AudioContext = class {
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {}, buffer: null }; }
    createBiquadFilter() { return { connect: () => {}, frequency: { value: 0 } }; }
    resume() {}
    get state() { return 'running'; }
};

// Mock Canvas
const canvas = dom.window.document.getElementById('game-canvas');
canvas.getContext = () => ({
    setTransform: () => {},
    fillStyle: '',
    fillRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    fill: () => {},
    strokeRect: () => {},
    font: '',
    fillText: () => {},
    measureText: () => ({ width: 0 }),
    save: () => {},
    restore: () => {},
    scale: () => {},
    translate: () => {},
    rotate: () => {},
    clearRect: () => {},
    drawImage: () => {},
});
canvas.requestPointerLock = () => {};
dom.window.document.exitPointerLock = () => {};

// Mock Perlin
dom.window.perlin = { noise: () => 0 };

// Mock localStorage
dom.window.localStorage = {
    getItem: () => null,
    setItem: () => {}
};

// Load Code
const load = (f) => {
    const code = fs.readFileSync(path.join('js', f), 'utf8');
    dom.window.eval(code);
};

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures/Tree.js', 'structures/Cactus.js', 'structures/Well.js', 'structures.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'crafting.js', 'player.js', 'mob.js', 'drop.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'game.js', 'main.js'].forEach(load);

describe('Water Flow Tests', () => {
    let game;

    beforeEach(function(done) {
        this.timeout(5000);
        MockWebSocket.lastSent = [];
        game = new dom.window.Game();
        game.world.renderDistance = 1;
        dom.window.prompt = () => "Tester";
        game.gameLoop = () => {};
        try {
            game.init();
        } catch (e) {
            console.error("game.init() failed:", e);
            done(e);
            return;
        }
        setTimeout(() => {
            done();
        }, 100);
    });

    it('should create infinite source from 2 sources', () => {
        const world = game.world;
        world.generateChunk(0, 0);

        // Ensure solid ground below so water flows sideways
        world.setBlock(0, 9, 0, dom.window.BLOCK.STONE);
        world.setBlock(1, 9, 0, dom.window.BLOCK.STONE);
        world.setBlock(2, 9, 0, dom.window.BLOCK.STONE);

        // Place 2 sources
        world.setBlock(0, 10, 0, dom.window.BLOCK.WATER);
        world.setMetadata(0, 10, 0, 8); // Source

        world.setBlock(2, 10, 0, dom.window.BLOCK.WATER);
        world.setMetadata(2, 10, 0, 8); // Source

        // Gap
        world.setBlock(1, 10, 0, dom.window.BLOCK.AIR);

        // Add neighbors to update list so updateFluids sees them
        world.activeFluids.add('0,10,0');
        world.activeFluids.add('2,10,0');

        // We also need to add the Air block to activeFluids?
        // No, updateFluids iterates activeFluids.
        // Wait, the logic for infinite source is inside updateFluids processing a WATER block.
        // If we process (0,10,0), it flows sideways to (1,10,0).
        // If (1,10,0) becomes flowing water, it is added to activeFluids.
        // Then in next pass, (1,10,0) checks its neighbors to see if it becomes source.

        // Let's run updateFluids multiple times to simulate ticks

        // Tick 1: Sources flow sideways into gap
        world.updateFluids();

        const middleBlock = world.getBlock(1, 10, 0);
        // Should be flowing water now
        assert.strictEqual(middleBlock, dom.window.BLOCK.WATER, "Middle block should become water");

        // Tick 2: Middle block checks if it becomes source
        world.updateFluids();

        const middleMeta = world.getMetadata(1, 10, 0);
        assert.strictEqual(middleMeta, 8, "Middle block should become source (meta 8)");
    });

    it('should flow down replacing non-solid blocks', () => {
        const world = game.world;
        world.generateChunk(0, 0);

        // Water Source
        world.setBlock(5, 10, 5, dom.window.BLOCK.WATER);
        world.setMetadata(5, 10, 5, 8);

        // Torch below
        world.setBlock(5, 9, 5, dom.window.BLOCK.TORCH);

        // Make sure it's scheduled
        world.activeFluids.add('5,10,5');

        world.updateFluids();

        const blockBelow = world.getBlock(5, 9, 5);
        // Should be replaced by water
        assert.strictEqual(blockBelow, dom.window.BLOCK.WATER, "Torch should be replaced by Water");

        const metaBelow = world.getMetadata(5, 9, 5);
        assert.strictEqual(metaBelow, 7, "Water below should be falling (meta 7)");
    });
});
