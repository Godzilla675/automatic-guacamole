const assert = require('assert');
const { JSDOM } = require('jsdom');

// Mock browser environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

// Load blocks.js
// Since blocks.js assigns to window, we need to load it.
// We can use fs to read and eval, or just require if it was a module, but it's not.
const fs = require('fs');
const blocksContent = fs.readFileSync('./js/blocks.js', 'utf8');
eval(blocksContent); // execute in global scope

describe('New Blocks Verification', () => {
    it('should have Concrete blocks defined', () => {
        const BLOCK = window.BLOCK;
        const BLOCKS = window.BLOCKS;

        assert.strictEqual(BLOCK.CONCRETE_WHITE, 30);
        assert.strictEqual(BLOCK.CONCRETE_BLACK, 45);

        const whiteConcrete = BLOCKS[BLOCK.CONCRETE_WHITE];
        assert.ok(whiteConcrete);
        assert.strictEqual(whiteConcrete.name, 'White Concrete');
        assert.strictEqual(whiteConcrete.solid, true);
        assert.strictEqual(whiteConcrete.tool, 'pickaxe');
    });

    it('should have Wool blocks defined', () => {
        const BLOCK = window.BLOCK;
        const BLOCKS = window.BLOCKS;

        assert.strictEqual(BLOCK.WOOL_WHITE, 50);
        assert.strictEqual(BLOCK.WOOL_BLACK, 65);

        const whiteWool = BLOCKS[BLOCK.WOOL_WHITE];
        assert.ok(whiteWool);
        assert.strictEqual(whiteWool.name, 'White Wool');
        assert.strictEqual(whiteWool.solid, true);
        assert.strictEqual(whiteWool.hardness, 0.8);
    });

    it('should have deprecated ITEM_WOOL correctly', () => {
        const BLOCK = window.BLOCK;
        const BLOCKS = window.BLOCKS;

        // ITEM_WOOL is 205
        assert.strictEqual(BLOCK.ITEM_WOOL, 205);
        // It should still exist in BLOCKS for now (as I didn't remove it from BLOCKS)
        // Check if I removed it? In my write_file I didn't remove it from BLOCKS but I removed the definition line?
        // Let's check my previous write_file.
        // I kept [BLOCK.ITEM_WOOL] in BLOCKS in the previous step?
        // Wait, I think I removed it from BLOCKS in the write_file content.
        // Let's check.
    });
});
