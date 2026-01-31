const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html><body>
    <div id="crafting-recipes"></div>
    <div id="crafting-screen"></div>
    <div id="close-crafting"></div>
</body>`, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable"
});

// Mock Globals
global.window = dom.window;
global.document = dom.window.document;
global.window.console = console;
global.window.alert = (msg) => { console.log("ALERT:", msg); }; // Mock alert

const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error("Error loading " + f, e);
    }
};

// Load dependencies
['blocks.js', 'crafting.js'].forEach(load);

// Mock Game & Player
class MockGame {
    constructor() {
        this.player = {
            inventory: new Array(36).fill(null)
        };
        this.drops = [];
    }
    resumeGame() {}
}

describe('Tool Repair Verification', () => {
    let game;
    let crafting;
    let BLOCK;
    let TOOLS;

    beforeEach(() => {
        game = new MockGame();
        crafting = new dom.window.CraftingSystem(game);
        BLOCK = dom.window.BLOCK;
        TOOLS = dom.window.TOOLS;
    });

    it('should combine two damaged tools and add 5% bonus', () => {
        const toolType = BLOCK.PICKAXE_STONE; // Durability 132
        const maxDur = TOOLS[toolType].durability;

        // Setup Inventory
        // Item 1: 10 damage used (durability = max - 10)
        game.player.inventory[0] = { type: toolType, count: 1, durability: maxDur - 50 }; // Heavily damaged
        // Item 2: 10 damage used
        game.player.inventory[1] = { type: toolType, count: 1, durability: maxDur - 50 };

        // Expected Result:
        // (max - 50) + (max - 50) + (max * 0.05)
        // Let's say max = 132.
        // Dur1 = 82. Dur2 = 82.
        // Bonus = floor(132 * 0.05) = floor(6.6) = 6.
        // Sum = 82 + 82 + 6 = 170.
        // Clamped to 132.

        // Let's make them more damaged so it doesn't cap.
        // Dur1 = 10. Dur2 = 10.
        game.player.inventory[0] = { type: toolType, count: 1, durability: 10 };
        game.player.inventory[1] = { type: toolType, count: 1, durability: 10 };

        const bonus = Math.floor(maxDur * 0.05); // 6
        const expected = 10 + 10 + bonus; // 26

        // Initialize UI to generate repair recipes
        crafting.initUI();

        // Find the repair recipe
        const recipeIndex = crafting.recipes.findIndex(r => r.isRepair && r.result.type === toolType);
        assert.ok(recipeIndex >= 0, "Repair recipe should be generated");

        // Craft
        crafting.craft(recipeIndex);

        // Verify
        const result = game.player.inventory[0];
        assert.ok(result, "Result should be in slot 0");
        assert.strictEqual(result.type, toolType, "Type matches");
        assert.strictEqual(result.count, 1, "Count is 1");
        assert.strictEqual(result.durability, expected, `Durability should be ${expected} (10+10+${bonus})`);

        // Slot 1 should be empty
        assert.strictEqual(game.player.inventory[1], null, "Slot 1 should be empty");
    });

    it('should cap durability at max', () => {
        const toolType = BLOCK.PICKAXE_STONE; // Durability 132
        const maxDur = TOOLS[toolType].durability;

        game.player.inventory[0] = { type: toolType, count: 1, durability: maxDur - 5 };
        game.player.inventory[1] = { type: toolType, count: 1, durability: maxDur - 5 };

        crafting.initUI();
        const recipeIndex = crafting.recipes.findIndex(r => r.isRepair && r.result.type === toolType);

        crafting.craft(recipeIndex);

        const result = game.player.inventory[0];
        assert.strictEqual(result.durability, maxDur, "Durability should be capped at max");
    });
});
