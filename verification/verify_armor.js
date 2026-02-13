const fs = require('fs');
const assert = require('assert');

// Mock Browser Environment
global.window = {
    addEventListener: () => {},
    BLOCKS: {},
    TOOLS: {},
    ARMOR: {}, // Will be populated
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
    querySelector: () => ({
        insertBefore: () => {}
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
    try {
        const content = fs.readFileSync(file, 'utf8');
        eval(content);
    } catch (e) {
        console.error(`Error loading ${file}:`, e);
        process.exit(1);
    }
};

load('js/math.js');
load('js/blocks.js');
global.BLOCK = window.BLOCK;
global.BLOCKS = window.BLOCKS;
global.TOOLS = window.TOOLS;
global.ARMOR = window.ARMOR;

load('js/chunk.js');
global.Chunk = window.Chunk;
load('js/biome.js');
load('js/structures/Tree.js', 'js/structures/Cactus.js', 'js/structures/Well.js', 'js/structures.js');
load('js/world.js');
global.World = window.World;

// Mock Managers
window.InputManager = class {
    constructor() { this.sensitivity = 1.0; this.keybinds = {}; }
    setupEventListeners() {}
    setupMobileControls() {}
    bindKey() {}
};
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
    console.log("Starting Armor Verification...");

    const game = new window.Game();
    game.canvas = { getContext: () => ({}) };
    game.ctx = {};
    // Skip chunk generation if possible or minimal
    // game.world.generateChunk(0, 0);

    // Test 1: Equip Armor via Logic
    console.log("Test 1: Equip Armor");
    const helmet = { type: window.BLOCK.ITEM_HELMET_DIAMOND, count: 1 };
    game.player.armor[0] = helmet;

    assert.strictEqual(game.player.getDefensePoints(), 3, "Diamond Helmet should give 3 defense");

    const chest = { type: window.BLOCK.ITEM_CHESTPLATE_DIAMOND, count: 1 };
    game.player.armor[1] = chest;

    assert.strictEqual(game.player.getDefensePoints(), 11, "Diamond Helmet + Chestplate should give 3+8=11 defense");
    console.log("Passed: Equip Logic");

    // Test 2: Damage Reduction
    console.log("Test 2: Damage Reduction");
    // 11 defense -> 11 * 4% = 44% reduction.
    // Damage 10 -> 10 * (1 - 0.44) = 5.6

    const initialHealth = game.player.health;
    game.player.takeDamage(10);

    const lost = initialHealth - game.player.health;
    console.log(`Damage taken: ${lost}`);
    assert.ok(Math.abs(lost - 5.6) < 0.01, `Expected ~5.6 damage, got ${lost}`);

    // Test 3: Durability Loss
    console.log("Test 3: Durability Loss");
    // Helmet max durability: 363. Should be 362 now.
    assert.strictEqual(helmet.durability, 362, "Helmet durability should decrease by 1");
    console.log("Passed: Durability");

    // Test 4: Armor Break
    console.log("Test 4: Armor Break");
    helmet.durability = 1;
    game.player.lastDamageTime = 0; // Reset timer
    game.player.takeDamage(1);

    assert.strictEqual(game.player.armor[0], null, "Helmet should break (become null)");
    console.log("Passed: Armor Break");

    // Test 5: UI Injection (Mock check)
    console.log("Test 5: UI Injection");
    game.ui.init();
    // We can't easily check DOM mutation on mock, but code ran without error.
    // If we mocked querySelector/createElement correctly, it should be fine.

    console.log("All Armor Tests Passed!");
}

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});
