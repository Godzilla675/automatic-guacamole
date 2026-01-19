const assert = require('assert');
const { JSDOM } = require('jsdom');

// Mock Game Environment
const dom = new JSDOM(`<!DOCTYPE html><body><div id="crafting-recipes"></div><div id="crafting-screen"></div><div id="close-crafting"></div></body>`);
global.window = dom.window;
global.document = dom.window.document;

// Mock globals
global.BLOCK = {
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
global.BLOCKS = {};

// Load Crafting System (needs manual load since no modules)
// We need to read the file first.
const fs = require('fs');
const craftingCode = fs.readFileSync('js/crafting.js', 'utf8');

// Mock Game Class
class MockGame {
    constructor() {
        this.player = {
            inventory: new Array(36).fill(null)
        };
        this.resumeGame = () => {};
    }
}

// Execute the crafting code in this context
eval(craftingCode);

// Test Suite
describe('Crafting System', () => {
    let game;
    let crafting;

    beforeEach(() => {
        game = new MockGame();
        crafting = new window.CraftingSystem(game);
        // Overwrite recipes for testing
        crafting.recipes = [
             {
                name: "Planks",
                result: { type: BLOCK.PLANK, count: 4 },
                ingredients: [ { type: BLOCK.WOOD, count: 1 } ]
            }
        ];
        // Mock alert globally
        global.alert = (msg) => {};
    });

    it('should craft item if ingredients exist', () => {
        // Give wood
        game.player.inventory[0] = { type: BLOCK.WOOD, count: 2 };

        crafting.craft(0);

        // Should have 1 wood left
        assert.strictEqual(game.player.inventory[0].count, 1);
        // Should have 4 planks (in first empty slot)
        const planks = game.player.inventory.find(s => s && s.type === BLOCK.PLANK);
        assert.ok(planks, 'Planks not found');
        assert.strictEqual(planks.count, 4);
    });

    it('should fail if not enough ingredients', () => {
        // No wood
        let alertMsg = '';
        global.alert = (msg) => alertMsg = msg;

        crafting.craft(0);

        assert.ok(alertMsg.includes('Not enough'));

        // Inventory check
        const planks = game.player.inventory.find(s => s && s.type === BLOCK.PLANK);
        assert.strictEqual(planks, undefined);
    });

    it('should stack items', () => {
        // Give wood
        game.player.inventory[0] = { type: BLOCK.WOOD, count: 1 };
        // Give existing planks
        game.player.inventory[1] = { type: BLOCK.PLANK, count: 60 };

        crafting.craft(0);

        // Should have 0 wood (slot becomes null or count 0? Logic says null if 0)
        assert.strictEqual(game.player.inventory[0], null);

        // Should have 64 planks
        assert.strictEqual(game.player.inventory[1].count, 64);
    });
});
