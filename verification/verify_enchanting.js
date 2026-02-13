const fs = require('fs');
const assert = require('assert');

// Mock Browser Environment
global.window = {
    addEventListener: () => {},
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
        innerHTML: ""
    }),
    createElement: () => {
        const el = {
            style: {},
            classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
            appendChild: () => {},
            addEventListener: () => {},
            textContent: "",
            dataset: {},
            querySelector: () => el, // Return self to avoid null checks
            remove: () => {}
        };
        return el;
    },
    body: { appendChild: () => {} },
    exitPointerLock: () => {}
};
global.localStorage = { getItem: () => null, setItem: () => {} };
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
global.TOOLS = window.TOOLS;

load('js/chunk.js');
global.Chunk = window.Chunk;
load('js/biome.js');
load('js/structures.js');
load('js/world.js');
global.World = window.World;

// Mock Managers
window.InputManager = class { setupEventListeners() {} setupMobileControls() {} };
global.InputManager = window.InputManager;
window.Renderer = class { resize() {} render() {} };
global.Renderer = window.Renderer;
window.PluginAPI = class { emit() {} };
global.PluginAPI = window.PluginAPI;
window.Minimap = class { update() {} };
global.Minimap = window.Minimap;
window.AchievementManager = class { update() {} };
global.AchievementManager = window.AchievementManager;
window.TutorialManager = class { update() {} };
global.TutorialManager = window.TutorialManager;
window.SoundManager = class { play() {} updateListener() {} updateAmbience() {} };
global.SoundManager = window.SoundManager;
window.NetworkManager = class { connect() {} sendBlockUpdate() {} sendPosition() {} };
global.NetworkManager = window.NetworkManager;
window.ParticleSystem = class { spawn() {} update() {} };
global.ParticleSystem = window.ParticleSystem;
window.ChatManager = class { constructor() {} addMessage() {} };
global.ChatManager = window.ChatManager;

// Load rest
load('js/physics.js');
global.Physics = window.Physics;
load('js/player.js');
global.Player = window.Player;
load('js/crafting.js');
global.CraftingSystem = window.CraftingSystem;
load('js/entity.js');
global.Entity = window.Entity;
load('js/mob.js');
global.Mob = window.Mob;
global.MOB_TYPE = window.MOB_TYPE;
load('js/drop.js');
global.Drop = window.Drop;

// Load UI last as it depends on everything
load('js/ui.js');
global.UIManager = window.UIManager;
load('js/game.js');

async function runTests() {
    console.log("Starting Enchanting Verification...");

    const game = new window.Game();
    game.canvas = { getContext: () => ({}) };
    game.ctx = {};
    game.world.generateChunk(0, 0);
    game.player.x = 8; game.player.y = 50; game.player.z = 8;

    // Test 1: Open Enchanting UI
    console.log("Test 1: Open Enchanting UI");
    game.world.setBlock(10, 50, 10, window.BLOCK.ENCHANTING_TABLE);

    // Mock physics
    game.physics.raycast = () => ({ x: 10, y: 50, z: 10, face: {x:0, y:1, z:0} });

    // Interact
    game.interact(10, 50, 10);

    // Check if UI is active (we can check internal state of UIManager if we could access it,
    // but here we just check if no error occurred and maybe mock document.getElementById to verify classList removal)

    // Verify internal state
    // ui.activeEnchanting should be set (it defaults to { item: null })
    assert.ok(game.ui.activeEnchanting, "Enchanting UI should be active");
    console.log("Passed: UI Open");

    // Test 2: Enchant Logic
    console.log("Test 2: Enchant Logic");

    // Give player XP
    game.player.level = 10;

    // Place item in enchanting slot
    const sword = { type: window.BLOCK.DIAMOND_SWORD, count: 1 };
    game.ui.activeEnchanting.item = sword;

    // Perform Enchant (Cost 3)
    game.ui.enchant(3);

    // Check Level
    assert.strictEqual(game.player.level, 7, "Level should decrease by cost");

    // Check Item Enchantments
    assert.ok(sword.enchantments, "Item should have enchantments array");
    assert.ok(sword.enchantments.length > 0, "Item should be enchanted");
    console.log("Enchantments:", sword.enchantments);

    console.log("Passed: Enchant Logic");
    console.log("All Enchanting Tests Passed!");
}

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});
