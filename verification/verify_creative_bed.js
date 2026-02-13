const fs = require('fs');
const assert = require('assert');

// Mock Browser Environment
global.window = {
    addEventListener: () => {},
    requestAnimationFrame: () => {},
    BLOCKS: {},
    TOOLS: {},
    AudioContext: class {},
    soundManager: { play: () => {}, updateListener: () => {}, updateAmbience: () => {} }
};
global.document = {
    getElementById: () => ({
        getContext: () => ({}),
        classList: { remove: () => {}, add: () => {} },
        addEventListener: () => {},
        appendChild: () => {},
        style: {},
        value: "",
        children: [],
        scrollTop: 0,
        scrollHeight: 0
    }),
    createElement: () => ({
        style: {},
        classList: { add: () => {}, remove: () => {} },
        appendChild: () => {},
        addEventListener: () => {}
    }),
    body: { appendChild: () => {} }
};
global.localStorage = {
    getItem: () => null,
    setItem: () => {}
};
global.navigator = { userAgent: 'Node' };

// Load Code
const load = (file) => {
    const content = fs.readFileSync(file, 'utf8');
    eval(content);
};

load('js/math.js');
load('js/blocks.js');
global.BLOCK = window.BLOCK;
global.BLOCKS = window.BLOCKS;
global.TOOLS = window.TOOLS; // TOOLS might be needed

load('js/biome.js'); // Dependency for World
load('js/structures/Tree.js', 'js/structures/Cactus.js', 'js/structures/Well.js', 'js/structures.js'); // Dependency for World
global.StructureManager = window.StructureManager; // Should be global if used in World? Or attached to window?

load('js/chunk.js');
global.Chunk = window.Chunk;

load('js/world.js');
global.World = window.World;

load('js/physics.js');
global.Physics = window.Physics;

load('js/entity.js');
global.Entity = window.Entity;

load('js/drop.js');
global.Drop = window.Drop;

load('js/mob.js');
global.Mob = window.Mob;
global.MOB_TYPE = window.MOB_TYPE;

load('js/player.js');
global.Player = window.Player;

load('js/crafting.js');
global.CraftingSystem = window.CraftingSystem;

load('js/network.js');
global.NetworkManager = window.NetworkManager;

load('js/chat.js');
global.ChatManager = window.ChatManager;

load('js/particles.js');
global.ParticleSystem = window.ParticleSystem;

// Mock UIManager/InputManager for Game
window.UIManager = class {
    init() {}
    updateHealthUI() {}
    updateHotbarUI() {}
    toggleInventory() {}
    craftingUI() {}
    resumeGame() {}
};
global.UIManager = window.UIManager;

window.InputManager = class { setupEventListeners() {} setupMobileControls() {} };
global.InputManager = window.InputManager;

window.Renderer = class { resize() {} render() {} };
global.Renderer = window.Renderer;

window.PluginAPI = class { emit() {} };
global.PluginAPI = window.PluginAPI; // Note: js/plugin.js might define this too, but we haven't loaded it.

window.Minimap = class { update() {} };
global.Minimap = window.Minimap;

window.AchievementManager = class { update() {} };
global.AchievementManager = window.AchievementManager;

window.TutorialManager = class { update() {} };
global.TutorialManager = window.TutorialManager;

window.SoundManager = class { play() {} updateListener() {} updateAmbience() {} };
global.SoundManager = window.SoundManager;

load('js/game.js');

// Test Suite
async function runTests() {
    console.log("Starting Creative Mode & Bed Verification...");

    const game = new window.Game();
    // Mock canvas stuff for game init
    game.canvas = { getContext: () => ({}) };
    game.ctx = {};

    // Init world
    game.world.generateChunk(0, 0);
    game.player.x = 8;
    game.player.y = 50;
    game.player.z = 8;

    // Test 1: Creative Mode (Infinite Items)
    console.log("Test 1: Creative Mode Infinite Items");
    game.player.gamemode = 1; // Creative
    game.player.inventory[0] = { type: window.BLOCK.DIRT, count: 1 };
    game.player.selectedSlot = 0;

    // Place block
    // Mock physics raycast to hit something
    game.physics.raycast = () => ({ x: 8, y: 49, z: 8, face: {x:0, y:1, z:0} });
    game.world.setBlock(8, 49, 8, window.BLOCK.STONE); // Floor

    game.placeBlock(); // Should place dirt at 8, 50, 8

    const placed = game.world.getBlock(8, 50, 8);
    assert.strictEqual(placed, window.BLOCK.DIRT, "Block should be placed");

    // Check inventory count
    assert.strictEqual(game.player.inventory[0].count, 1, "Creative mode should not consume items");
    console.log("Passed: Infinite Items");

    // Test 2: Creative Mode (Instant Break)
    console.log("Test 2: Creative Mode Instant Break");
    // Mock hit
    const hit = { x: 8, y: 50, z: 8 };
    game.physics.raycast = () => hit;

    // In creative, startAction calls finalizeBreakBlock immediately
    game.startAction(true); // Left click

    const broken = game.world.getBlock(8, 50, 8);
    assert.strictEqual(broken, window.BLOCK.AIR, "Block should be broken instantly");
    console.log("Passed: Instant Break");

    // Test 3: God Mode (Damage Immunity)
    console.log("Test 3: God Mode");
    const initialHealth = game.player.health;
    game.player.takeDamage(10);
    assert.strictEqual(game.player.health, initialHealth, "Creative player should not take damage");
    console.log("Passed: God Mode");

    // Test 4: Bed Logic
    console.log("Test 4: Bed Logic");
    game.player.gamemode = 0; // Survival
    game.world.setBlock(10, 50, 10, window.BLOCK.BED);

    // Set time to Day
    game.gameTime = 1000;
    game.dayLength = 24000;

    // Interact (Day)
    game.interact(10, 50, 10);
    // Should NOT sleep (time shouldn't jump)
    assert.ok(game.gameTime < 12000, "Should not sleep during day");

    // Set time to Night
    game.gameTime = 13000;

    // Interact (Night)
    game.interact(10, 50, 10);

    // Should sleep (time jumps to morning)
    // Morning is 0 (or mod dayLength). Code adds time to reach next morning (0.1 of dayLength?)
    // Game code: timeToMorning = dayLength - time + (dayLength * 0.1)
    // 24000 - 13000 + 2400 = 13400 added. New time = 26400.
    assert.ok(game.gameTime > 20000, "Time should advance to morning");
    console.log(`Passed: Bed Logic (Time is now ${game.gameTime})`);

    console.log("All Verification Tests Passed!");
}

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});
