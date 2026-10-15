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
    beforeEach(() => {
        global.window = dom.window;
        global.document = dom.window.document;
    });

    it('should have Concrete blocks defined', () => {
        const BLOCK = window.BLOCK || dom.window.BLOCK;
        const BLOCKS = window.BLOCKS || dom.window.BLOCKS;

        assert.strictEqual(BLOCK.CONCRETE_WHITE, 30);
        assert.strictEqual(BLOCK.CONCRETE_BLACK, 45);

        const whiteConcrete = BLOCKS[BLOCK.CONCRETE_WHITE];
        assert.ok(whiteConcrete);
        assert.strictEqual(whiteConcrete.name, 'White Concrete');
        assert.strictEqual(whiteConcrete.solid, true);
        assert.strictEqual(whiteConcrete.tool, 'pickaxe');
    });

    it('should have Wool blocks defined', () => {
        const BLOCK = window.BLOCK || dom.window.BLOCK;
        const BLOCKS = window.BLOCKS || dom.window.BLOCKS;

        assert.strictEqual(BLOCK.WOOL_WHITE, 50);
        assert.strictEqual(BLOCK.WOOL_BLACK, 65);

        const whiteWool = BLOCKS[BLOCK.WOOL_WHITE];
        assert.ok(whiteWool);
        assert.strictEqual(whiteWool.name, 'White Wool');
        assert.strictEqual(whiteWool.solid, true);
        assert.strictEqual(whiteWool.hardness, 0.8);
    });

    it('should have deprecated ITEM_WOOL correctly aliased to WOOL_WHITE', () => {
        const BLOCK = window.BLOCK || dom.window.BLOCK;
        const BLOCKS = window.BLOCKS || dom.window.BLOCKS;

        // ITEM_WOOL is clean alias for WOOL_WHITE (50)
        assert.strictEqual(BLOCK.ITEM_WOOL, BLOCK.WOOL_WHITE);
        assert.strictEqual(BLOCKS[BLOCK.ITEM_WOOL].name, 'White Wool');
    });

    it('should have unique block IDs for functional blocks and mob drops without collisions', () => {
        const BLOCK = window.BLOCK || dom.window.BLOCK;
        const BLOCKS = window.BLOCKS || dom.window.BLOCKS;

        assert.strictEqual(BLOCKS[BLOCK.BREWING_STAND].name, 'Brewing Stand');
        assert.strictEqual(BLOCKS[BLOCK.CAULDRON].name, 'Cauldron');
        assert.strictEqual(BLOCKS[BLOCK.ENCHANTING_TABLE].name, 'Enchanting Table');
        assert.strictEqual(BLOCKS[BLOCK.RAIL].name, 'Rail');
        assert.strictEqual(BLOCKS[BLOCK.POWERED_RAIL].name, 'Powered Rail');
        assert.strictEqual(BLOCKS[BLOCK.DETECTOR_RAIL].name, 'Detector Rail');
        assert.strictEqual(BLOCKS[BLOCK.BOOKSHELF].name, 'Bookshelf');
        assert.strictEqual(BLOCKS[BLOCK.NOTE_BLOCK].name, 'Note Block');

        assert.strictEqual(BLOCKS[BLOCK.ITEM_ROTTEN_FLESH].name, 'Rotten Flesh');
        assert.strictEqual(BLOCKS[BLOCK.ITEM_BONE].name, 'Bone');
        assert.strictEqual(BLOCKS[BLOCK.ITEM_STRING].name, 'String');
        assert.strictEqual(BLOCKS[BLOCK.ITEM_PORKCHOP].name, 'Porkchop');
        assert.strictEqual(BLOCKS[BLOCK.ITEM_LEATHER].name, 'Leather');
        assert.strictEqual(BLOCKS[BLOCK.ITEM_MUTTON].name, 'Raw Mutton');
        assert.strictEqual(BLOCKS[BLOCK.ITEM_BEEF].name, 'Raw Beef');
        assert.strictEqual(BLOCKS[BLOCK.ITEM_STICK].name, 'Stick');
    });
});
