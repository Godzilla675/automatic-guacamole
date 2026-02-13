const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');

// Mock DOM
const dom = new JSDOM(`<!DOCTYPE html><body><div id="recipe-list"></div><div id="crafting-recipes"></div><div id="close-crafting"></div><div id="crafting-screen"></div></body>`, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable"
});
global.window = dom.window;
global.document = dom.window.document;
global.alert = (msg) => console.log("Alert:", msg);
global.console = console;

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();
Object.defineProperty(global.window, 'localStorage', { value: localStorageMock });
global.localStorage = localStorageMock;

// Mock Globals
global.window.BLOCK = {
    WOOD: 3,
    PLANK: 10,
    STICK: 210,
    FURNACE: 20
};
// Minimal BLOCKS for rendering
global.window.BLOCKS = {
    3: { name: 'Wood', icon: 'W' },
    10: { name: 'Plank', icon: 'P' },
    210: { name: 'Stick', icon: '/' },
    20: { name: 'Furnace', icon: 'F' }
};
global.window.TOOLS = {};

// Load modified scripts
// We need to eval them or require them. eval is easier with JSDOM context.
const scripts = [
    'js/player.js',
    'js/crafting.js',
    'js/ui.js',
    // We need world for save/load but it has heavy dependencies.
    // We can mock World or load a simplified version?
    // Let's try to load the real one but mock Chunk/BiomeManager/StructureManager
];

// Mocks for World dependencies
global.window.BiomeManager = class { constructor() {} getBiome() { return {}; } };
global.window.StructureManager = class { constructor() {} };
global.window.Chunk = class {
    constructor(cx, cz) {
        this.cx = cx; this.cz = cz;
        this.blocks = new Uint8Array(4096);
        this.metadata = new Uint8Array(4096);
        this.light = new Uint8Array(4096);
    }
};
// Add global perlin
global.window.perlin = { noise: () => 0 };

scripts.forEach(s => {
    try {
        const code = fs.readFileSync(s, 'utf8');
        dom.window.eval(code);
    } catch(e) {
        console.error(`Error loading ${s}:`, e);
    }
});

// Load World manually as it might fail if dependencies aren't perfect
try {
    const code = fs.readFileSync('js/world.js', 'utf8');
    dom.window.eval(code);
} catch(e) {
    console.error("Error loading js/world.js:", e);
}


// Mock Game
class MockGame {
    constructor() {
        this.player = new dom.window.Player(this);
        this.world = new dom.window.World();
        this.world.game = this;
        this.crafting = new dom.window.CraftingSystem(this);
        this.ui = new dom.window.UIManager(this);

        this.ui.updateHealthUI = () => {};
        this.ui.updateHotbarUI = () => {};
    }
}

async function runTests() {
    console.log("Starting Verification...");

    const game = new MockGame();
    game.crafting.initUI(); // Populate recipes

    // Test 1: Initial State
    console.log("Test 1: Initial State");
    const initialRecipes = game.player.unlockedRecipes;
    console.log("Unlocked Recipes:", Array.from(initialRecipes));
    assert.ok(initialRecipes.has("Planks (4)"), "Planks should be unlocked initially");
    assert.ok(initialRecipes.has("Stick (4)"), "Sticks should be unlocked initially");
    assert.strictEqual(initialRecipes.size, 3, "Should have 3 basic recipes unlocked");

    // Verify UI filtering (Recipe Book)
    // We need to put recipes into game.crafting.recipes first (initUI does filtering for crafting screen, constructor populates recipes)
    // CraftingSystem constructor runs in MockGame.
    // Let's check renderRecipeBook
    game.ui.renderRecipeBook();
    const list = dom.window.document.getElementById('recipe-list');
    // Initially only basics.
    // The recipes list in crafting.js has many recipes.
    // Let's count how many recipes are displayed.
    // Since we only mocked 3 blocks, icons might fail if we didn't mock everything, but elements should be created.
    // Actually, renderRecipeBook iterates game.crafting.recipes.
    const displayedCount = list.children.length;
    console.log("Displayed Recipes:", displayedCount);
    // Should match unlocked count if all unlocked have corresponding recipe objects.
    // Planks (4), Stick (4), Furnace are in recipes list.
    // NOTE: "Stick (4)" appears 3 times (Standard, Birch, Jungle), so 1+3+1 = 5.
    assert.strictEqual(displayedCount, 5, "UI should show 5 recipes");


    // Test 2: Unlock Logic
    console.log("Test 2: Unlock Logic");
    // Unlock Fence (needs Wood)
    // Wait, Fence needs Wood. Planks (4) needs Wood.
    // If I acquire Wood, I should unlock Planks (already unlocked) AND Fence?
    // Let's check recipes.
    /*
    {
        name: "Fence (2)",
        result: { type: BLOCK.FENCE, count: 2 },
        ingredients: [ { type: BLOCK.WOOD, count: 4 }, { type: BLOCK.ITEM_STICK, count: 2 } ]
    },
    */
    // Acquiring Wood should unlock Fence (2).

    assert.ok(!game.player.unlockedRecipes.has("Fence (2)"), "Fence should be locked");

    // Simulate drop collection
    game.crafting.checkUnlock(dom.window.BLOCK.WOOD);

    console.log("Unlocked after Wood:", Array.from(game.player.unlockedRecipes));
    assert.ok(game.player.unlockedRecipes.has("Fence (2)"), "Fence should be unlocked");

    // Verify Notification
    const notif = dom.window.document.querySelector('.notification');
    assert.ok(notif, "Notification should appear");
    assert.ok(notif.textContent.includes("Fence"), "Notification should mention Fence");


    // Test 3: Persistence
    console.log("Test 3: Persistence");
    // Save
    game.world.saveWorld('test_save');

    // Reset Game (Simulate reload)
    const game2 = new MockGame();
    // Verify initial state of game2
    assert.strictEqual(game2.player.unlockedRecipes.size, 3, "New game should have defaults");

    // Load
    game2.world.loadWorld('test_save');

    console.log("Loaded Recipes:", Array.from(game2.player.unlockedRecipes));
    assert.ok(game2.player.unlockedRecipes.has("Fence (2)"), "Fence should persist after load");
    assert.ok(game2.player.unlockedRecipes.has("Planks (4)"), "Planks should persist");

    console.log("Verification Passed!");
}

runTests().catch(e => {
    console.error("Verification Failed:", e);
    process.exit(1);
});
