const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');

// Mock Game Environment
const dom = new JSDOM(`<!DOCTYPE html><body><div id="crafting-recipes"></div><div id="crafting-screen"></div><div id="close-crafting"></div></body>`, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable"
});
global.window = dom.window;
global.document = dom.window.document;
global.alert = (msg) => {}; // Mock alert

// Mock globals in the window context
dom.window.BLOCK = {
    DIRT: 0,
    STONE: 1,
    GRASS: 2,
    WOOD: 3,
    LEAVES: 4,
    SAND: 5,
    WATER: 6,
    GLASS: 7,
    BRICK: 8,
    PLANK: 9,
    COBBLESTONE: 10
};
dom.window.BLOCKS = {};

// Load Crafting System
const craftingCode = fs.readFileSync('js/crafting.js', 'utf8');
dom.window.eval(craftingCode);

// Mock Game Class
class MockGame {
    constructor() {
        this.player = {
            inventory: new Array(36).fill(null)
        };
        this.resumeGame = () => {};
    }
}

// Test Suite
describe('Crafting System', () => {
    let game;
    let crafting;

    beforeEach(() => {
        game = new MockGame();
        // Access CraftingSystem from window
        crafting = new dom.window.CraftingSystem(game);
        // Overwrite recipes for testing
        crafting.recipes = [
             {
                name: "Planks",
                result: { type: dom.window.BLOCK.PLANK, count: 4 },
                ingredients: [ { type: dom.window.BLOCK.WOOD, count: 1 } ]
            }
        ];
        // Mock alert globally
        global.alert = (msg) => {};
        dom.window.alert = (msg) => {};
    });

    it('should craft item if ingredients exist', () => {
        // Give wood
        game.player.inventory[0] = { type: dom.window.BLOCK.WOOD, count: 2 };

        crafting.craft(0);

        // Should have 1 wood left
        assert.strictEqual(game.player.inventory[0].count, 1);
        // Should have 4 planks (in first empty slot)
        const planks = game.player.inventory.find(s => s && s.type === dom.window.BLOCK.PLANK);
        assert.ok(planks, 'Planks not found');
        assert.strictEqual(planks.count, 4);
    });

    it('should fail if not enough ingredients', () => {
        // No wood
        let alertMsg = '';
        dom.window.alert = (msg) => alertMsg = msg;

        crafting.craft(0);

        assert.ok(alertMsg.includes('Not enough'));

        // Inventory check
        const planks = game.player.inventory.find(s => s && s.type === dom.window.BLOCK.PLANK);
        assert.strictEqual(planks, undefined);
    });

    it('should stack items', () => {
        // Give wood
        game.player.inventory[0] = { type: dom.window.BLOCK.WOOD, count: 1 };
        // Give existing planks
        game.player.inventory[1] = { type: dom.window.BLOCK.PLANK, count: 60 };

        crafting.craft(0);

        // Should have 0 wood (slot becomes null or count 0? Logic says null if 0)
        assert.strictEqual(game.player.inventory[0], null);

        // Should have 64 planks
        assert.strictEqual(game.player.inventory[1].count, 64);
    });
});
