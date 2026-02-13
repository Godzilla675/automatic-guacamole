const fs = require('fs');
const assert = require('assert');

// Mock Browser Environment
const window = {
    BLOCKS: {},
    BLOCK: {},
    TOOLS: {},
    Drop: class { constructor(g,x,y,z,t,c) { this.type = t; this.count = c; } },
    soundManager: {
        play: (sound) => { console.log(`Sound played: ${sound}`); this.lastSound = sound; },
        lastSound: null
    }
};
global.window = window;
global.Drop = window.Drop;

// Load Blocks
const blocksCode = fs.readFileSync('js/blocks.js', 'utf8');
eval(blocksCode);
global.BLOCK = window.BLOCK;
global.BLOCKS = window.BLOCKS;
global.TOOLS = window.TOOLS;

// Mock Classes
class World {
    constructor() {
        this.blocks = {};
        this.blockEntities = new Map();
    }
    getBlock(x, y, z) { return this.blocks[`${x},${y},${z}`] || 0; }
    setBlock(x, y, z, id) { this.blocks[`${x},${y},${z}`] = id; }
    getBlockEntity(x, y, z) { return this.blockEntities.get(`${x},${y},${z}`); }
    setBlockEntity(x, y, z, entity) { this.blockEntities.set(`${x},${y},${z}`, entity); }
}

class Player {
    constructor() {
        this.inventory = new Array(36).fill(null);
        this.selectedSlot = 0;
        this.gamemode = 0;
        this.x = 0; this.y = 0; this.z = 0;
    }
}

class Game {
    constructor() {
        this.world = new World();
        this.player = new Player();
        this.drops = [];
        this.chat = { addMessage: (msg) => console.log(`Chat: ${msg}`) };
    }

    updateHotbarUI() {}
}

// Load Game.interact logic (Partial)
// We will manually test the logic found in Game.interact for Jukebox
// Or we can load js/game.js if we mock enough.
// Let's copy the logic or load game.js if possible.
// Loading game.js requires huge mocks. Let's replicate the logic from my memory of reading game.js
// Actually, reading game.js shows the logic in `interact(x, y, z)`.
// It's better to load the actual file to verify "current code".
// But game.js has so many dependencies (Physics, Network, UI).
// I will just copy the relevant interact block for Jukebox to test logic *correctness* as if it were a unit test.
// Wait, I can try to instantiate Game if I mock everything.

// Let's try to minimal mock for Game.js
global.Physics = class {};
global.NetworkManager = class { connect() {} };
global.CraftingSystem = class { initUI() {} };
global.ParticleSystem = class {};
global.ChatManager = class { addMessage() {} };
global.UIManager = class {
    init() {}
    updateHotbarUI() {}
    showSignEditor() {}
    openFurnace() {}
    openChest() {}
    openBrewing() {}
    openEnchanting() {}
    openAnvil() {}
};
global.InputManager = class { setupEventListeners() {} };
global.Renderer = class { resize() {} };
global.PluginAPI = class {};
global.Minimap = class {};
global.AchievementManager = class {};
global.TutorialManager = class {};
window.PluginAPI = global.PluginAPI;
window.Minimap = global.Minimap;
window.AchievementManager = global.AchievementManager;
window.TutorialManager = global.TutorialManager;
global.Mob = class {};

// Mock document for Game constructor
global.document = {
    getElementById: () => ({ getContext: () => {}, addEventListener: () => {}, classList: { remove: () => {}, add: () => {} } })
};
global.navigator = { userAgent: '' };
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

const gameCode = fs.readFileSync('js/game.js', 'utf8');
// We need to avoid running Game.init or anything that accesses DOM heavily.
// Just load the class.
eval(gameCode);

async function testJukebox() {
    console.log("Testing Jukebox...");
    const game = new window.Game();

    // Setup Jukebox at 0,0,0
    const x = 0, y = 0, z = 0;
    game.world.setBlock(x, y, z, window.BLOCK.JUKEBOX);

    // Test 1: Insert Disc
    console.log("Test 1: Insert Disc");
    game.player.inventory[0] = { type: window.BLOCK.ITEM_MUSIC_DISC, count: 1 };
    game.player.selectedSlot = 0;

    // Interact
    let result = game.interact(x, y, z);
    assert.strictEqual(result, true, "Interaction should be handled");

    const entity = game.world.getBlockEntity(x, y, z);
    assert.ok(entity, "Block Entity should exist");
    assert.strictEqual(entity.type, 'jukebox', "Entity type should be jukebox");
    assert.strictEqual(entity.disc, window.BLOCK.ITEM_MUSIC_DISC, "Disc should be in jukebox");
    assert.strictEqual(game.player.inventory[0], null, "Disc should be removed from inventory");

    // Test 2: Eject Disc
    console.log("Test 2: Eject Disc");
    game.interact(x, y, z);

    assert.strictEqual(entity.disc, null, "Disc should be ejected");
    assert.strictEqual(game.drops.length, 1, "Drop should be spawned");
    assert.strictEqual(game.drops[0].type, window.BLOCK.ITEM_MUSIC_DISC, "Drop should be music disc");

    console.log("Jukebox tests passed!");
}

testJukebox().catch(err => {
    console.error(err);
    process.exit(1);
});
