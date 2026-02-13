const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');
const assert = require('assert');

// 1. Setup JSDOM
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
    <canvas id="game-canvas" width="800" height="600"></canvas>
    <div id="ui-layer">
        <div id="hotbar"></div>
        <div id="crosshair"></div>
        <div id="chat-container"><div id="chat-messages"></div></div>
        <input id="chat-input" type="text" class="hidden">

        <!-- UI Elements required by UIManager -->
        <div id="health-bar"></div>
        <div id="hunger-bar"></div>
        <div id="damage-overlay"></div>
        <div id="inventory-screen" class="hidden"><div id="inventory-grid"></div></div>
        <div id="chest-screen" class="hidden"><div id="chest-grid"></div></div>
        <div id="furnace-screen" class="hidden">
            <div id="furnace-input"></div><div id="furnace-fuel"></div><div id="furnace-output"></div>
            <div id="furnace-progress"></div><div id="furnace-burn"></div>
        </div>
        <div id="settings-screen" class="hidden">
            <div id="keybinds-list"></div>
            <input id="fov-slider" type="range"><span id="fov-value"></span>
            <input id="render-dist-slider" type="range"><span id="render-dist-value"></span>
        </div>
        <div id="trading-screen" class="hidden"><div id="trading-list"></div></div>
        <div id="recipe-book-screen" class="hidden"><div id="recipe-list"></div></div>
        <div id="crafting-screen" class="hidden"></div>
        <div id="pause-screen" class="hidden"></div>
    </div>
</body>
</html>
`, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable"
});

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.NodeList = dom.window.NodeList;
global.navigator = dom.window.navigator;
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

// Mock AudioContext
global.window.AudioContext = class {
    createGain() { return { connect: () => {}, gain: { value: 0, linearRampToValueAtTime: () => {} } }; }
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {} } }; }
    createBufferSource() { return { buffer: null, connect: () => {}, start: () => {}, stop: () => {} }; }
    createBuffer() { return { getChannelData: () => new Float32Array(100) }; }
    decodeAudioData() { return Promise.resolve({}); }
    get destination() { return {}; }
    get currentTime() { return 0; }
};

// Mock Perlin
global.window.perlin = {
    noise: (x, y, z) => 0.5
};

// Mock SoundManager (if not loaded) or let Game load it?
// Game code calls `window.soundManager.play`.
global.window.soundManager = {
    play: (sound) => { console.log(`[Sound] ${sound}`); },
    updateAmbience: () => {}
};

// 2. Load Game Modules
// Load in order
const files = [
    'js/blocks.js',
    'js/biome.js',
    'js/structures/Tree.js', 'js/structures/Cactus.js', 'js/structures/Well.js', 'js/structures.js',
    'js/chunk.js',
    'js/world.js',
    'js/physics.js',
    'js/player.js',
    'js/crafting.js',
    'js/network.js',
    'js/chat.js',
    'js/ui.js',
    'js/input.js',
    'js/renderer.js',
    'js/mob.js', // Needed for Game
    'js/game.js'
];

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        eval(content);
        // Expose classes globally if they are attached to window
        if (window.World) global.World = window.World;
        if (window.Physics) global.Physics = window.Physics;
        if (window.Player) global.Player = window.Player;
        if (window.NetworkManager) global.NetworkManager = window.NetworkManager;
        if (window.CraftingSystem) global.CraftingSystem = window.CraftingSystem;
        if (window.ChatManager) global.ChatManager = window.ChatManager;
        if (window.UIManager) global.UIManager = window.UIManager;
        if (window.InputManager) global.InputManager = window.InputManager;
        if (window.Renderer) global.Renderer = window.Renderer;
        if (window.Mob) global.Mob = window.Mob;
        if (window.Chunk) global.Chunk = window.Chunk;
        if (window.BiomeManager) global.BiomeManager = window.BiomeManager;
        if (window.StructureManager) global.StructureManager = window.StructureManager;
        if (window.BLOCK) global.BLOCK = window.BLOCK;
        if (window.BLOCKS) global.BLOCKS = window.BLOCKS;
        if (window.TOOLS) global.TOOLS = window.TOOLS;
        if (window.MOB_TYPE) global.MOB_TYPE = window.MOB_TYPE;
    } catch (e) {
        console.error(`Error loading ${file}:`, e);
    }
});

// Mock Renderer methods to avoid WebGL errors
global.window.Renderer.prototype.resize = () => {};
global.window.Renderer.prototype.render = () => {};
global.window.Renderer.prototype.init = () => {};

// 3. Test Suite
async function runTests() {
    console.log("Running Weather & TNT Tests...");

    const game = new window.Game();
    // Initialize without starting loop to avoid async hell
    // game.init() calls gameLoop(). We just want to setup.
    // Manually setup what we need.
    game.world = new window.World();
    game.physics = new window.Physics(game.world);
    game.player = new window.Player(game);
    // Initialize chunks
    game.updateChunks();

    // Test 1: Weather
    console.log("Test 1: Weather Toggle");
    game.world.setWeather('rain');
    assert.strictEqual(game.world.weather, 'rain', "Weather should be rain");
    game.world.setWeather('clear');
    assert.strictEqual(game.world.weather, 'clear', "Weather should be clear");
    console.log("Passed: Weather Toggle");

    // Test 2: TNT Interaction & Explosion
    console.log("Test 2: TNT Logic");
    const tntX = 0, tntY = 50, tntZ = 0;

    // Ensure ground below
    game.world.setBlock(tntX, tntY - 1, tntZ, window.BLOCK.STONE);
    // Place TNT
    game.world.setBlock(tntX, tntY, tntZ, window.BLOCK.TNT);

    assert.strictEqual(game.world.getBlock(tntX, tntY, tntZ), window.BLOCK.TNT, "TNT should be placed");

    // Interact (Prime)
    const interacted = game.interact(tntX, tntY, tntZ);
    assert.strictEqual(interacted, true, "Interact should return true for TNT");

    // TNT should be replaced by Air (and entity spawned)
    assert.strictEqual(game.world.getBlock(tntX, tntY, tntZ), window.BLOCK.AIR, "TNT block should be removed after priming");
    assert.strictEqual(game.tntPrimed.length, 1, "There should be 1 primed TNT entity");

    const tntEntity = game.tntPrimed[0];
    assert.strictEqual(tntEntity.fuse, 4.0, "Fuse should be 4.0s");

    // Simulate Time Passing (4.1 seconds)
    // We must call update with small steps for physics to work
    console.log("Simulating 4.1s in steps...");
    for (let i = 0; i < 41; i++) {
        game.update(100);
    }

    // Check if exploded
    assert.strictEqual(game.tntPrimed.length, 0, "TNT entity should be gone");

    // Check crater
    // Stone below should be destroyed (or damaged? TNT destroys stone? Hardness 1.5, TNT power 4. Yes.)
    const blockBelow = game.world.getBlock(tntX, tntY - 1, tntZ);
    assert.strictEqual(blockBelow, window.BLOCK.AIR, "Block below TNT should be destroyed by explosion");

    console.log("Passed: TNT Logic");
}

try {
    runTests();
    console.log("All Weather & TNT Tests Completed.");
} catch (e) {
    console.error("Test Failed:", e);
    process.exit(1);
}
