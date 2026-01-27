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
<div id="inventory-grid"></div>
<div id="settings-screen" class="hidden"></div>
<div id="close-settings"></div>
<input type="range" id="volume-slider">
<div id="furnace-screen" class="hidden"></div>
<div id="furnace-input"></div>
<div id="furnace-fuel"></div>
<div id="furnace-output"></div>
<div id="close-furnace"></div>
<div id="furnace-progress"></div>
<div id="furnace-burn"></div>
<div id="recipe-book-screen" class="hidden"></div>
<div id="open-recipe-book"></div>
<div id="close-recipe-book"></div>
<div id="recipe-list"></div>
</body>`, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost/"
});

// Mock globals
dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.navigator = { userAgent: "node", maxTouchPoints: 0 };

// Mock WebSocket
class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = 0;
        setTimeout(() => {
            this.readyState = 1;
            if (this.onopen) this.onopen();
        }, 10);
    }
    send(data) {
        if (MockWebSocket.lastSent) MockWebSocket.lastSent.push(data);
    }
    close() {
        this.readyState = 3;
        if (this.onclose) this.onclose();
    }
}
MockWebSocket.lastSent = [];
MockWebSocket.OPEN = 1;
dom.window.WebSocket = MockWebSocket;

// Mock AudioContext
dom.window.AudioContext = class {
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
    createBiquadFilter() { return { connect: () => {} }; }
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
    createLinearGradient: () => ({ addColorStop: () => {} }),
    clearRect: () => {},
    save: () => {},
    restore: () => {},
    scale: () => {},
    translate: () => {},
    rotate: () => {},
});
canvas.requestPointerLock = () => {};
dom.window.document.exitPointerLock = () => {};

// Mock Perlin
dom.window.perlin = { noise: () => 0 };

// Mock localStorage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: function(key) { return store[key] || null; },
        setItem: function(key, value) { store[key] = value.toString(); },
        clear: function() { store = {}; },
        removeItem: function(key) { delete store[key]; }
    };
})();
dom.window.localStorage = localStorageMock;

// Mock Prompt
dom.window.prompt = () => "Tester";

// Load Code
const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error("Error loading " + f, e);
    }
};

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures/Tree.js', 'structures/Cactus.js', 'structures/Well.js', 'structures.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'drop.js', 'crafting.js', 'player.js', 'mob.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'game.js'].forEach(load);

async function testInventoryConsumption() {
    console.log("Starting Inventory Consumption Test...");

    // Setup Game
    const game = new dom.window.Game();
    game.world.renderDistance = 1;
    game.gameLoop = () => {};
    dom.window.requestAnimationFrame = (cb) => {};

    // Init minimal systems
    // Init needs to run to setup everything, but might hang if we don't mock correctly.
    // Instead of game.init(), we manually init what we need.

    // game.init() calls:
    // this.renderer.resize() (Mocked canvas)
    // this.updateChunks() (Can run)
    // Init mobs (Can run)
    // Connect network (Mocked)
    // Prompt name (Mocked)
    // this.crafting.initUI() (Needs DOM - provided)
    // this.ui.init() (Needs DOM - provided)
    // this.updateHealthUI()
    // this.input.setupEventListeners()
    // this.updateHotbarUI()

    // Let's just call game.ui.init() and game.crafting.initUI() manually to be safe,
    // or try game.init() but break the loop.

    game.ui = new dom.window.UIManager(game);
    game.ui.init();

    // Setup Player Inventory
    const STONE = dom.window.BLOCK.STONE;
    game.player.inventory[0] = { type: STONE, count: 5 };
    game.player.selectedSlot = 0;

    // Ensure chunk exists
    game.world.generateChunk(0, 0);

    // Mock World Interaction
    game.world.setBlock(0, 49, 0, STONE);
    console.log("Block at 0,49,0:", game.world.getBlock(0, 49, 0));
    console.log("Is Solid:", dom.window.BLOCKS[game.world.getBlock(0, 49, 0)].solid);
    game.player.x = 0.5;
    game.player.y = 51; // Feet at 51
    game.player.z = 0.5;
    game.player.pitch = Math.PI / 2; // Look down
    game.player.yaw = 0;

    console.log("Placing block...");
    game.placeBlock();

    // Verify
    const slot = game.player.inventory[0];
    if (slot.count !== 4) {
        console.error(`FAILURE: Expected count 4, got ${slot ? slot.count : 'null'}`);
        process.exit(1);
    }
    console.log("SUCCESS: Count decremented to 4");

    // Test consuming last item
    slot.count = 1;
    console.log("Placing last block...");

    game.player.y = 55; // Move up to avoid self-collision prevention

    game.placeBlock();

    if (game.player.inventory[0] !== null) {
        console.error(`FAILURE: Expected slot to be null, got ${JSON.stringify(game.player.inventory[0])}`);
        process.exit(1);
    }
    console.log("SUCCESS: Item removed from inventory");

    process.exit(0);
}

testInventoryConsumption().catch(e => {
    console.error(e);
    process.exit(1);
});
