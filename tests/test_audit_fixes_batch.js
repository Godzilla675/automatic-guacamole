const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('Audit Fixes Batch - Blocks & Biomes Verification', function() {
    let window, dom;

    before(function() {
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost/'
        });
        window = dom.window;
        global.window = window;
        global.document = window.document;

        require('../js/blocks.js');
        require('../js/biome.js');
    });

    it('should have BLOCK.COPPER_ORE and BLOCK.MUD correctly defined and mapped', function() {
        assert.strictEqual(window.BLOCK.COPPER_ORE, 398);
        assert.strictEqual(window.BLOCK.COPPER_ORE, window.BLOCK.ORE_COPPER);
        assert.ok(window.BLOCKS[window.BLOCK.COPPER_ORE]);
        assert.strictEqual(window.BLOCKS[window.BLOCK.COPPER_ORE].name, 'Copper Ore');

        assert.strictEqual(window.BLOCK.MUD, 370);
        assert.strictEqual(window.BLOCK.MUD, window.BLOCK.MUD_BLOCK);
        assert.ok(window.BLOCKS[window.BLOCK.MUD]);
        assert.strictEqual(window.BLOCKS[window.BLOCK.MUD].name, 'Mud');
    });

    it('should export BIOME enum to window.BIOME and global.BIOME', function() {
        assert.ok(window.BIOME);
        assert.ok(global.BIOME);

        const expectedBiomes = [
            'SAVANNA',
            'MANGROVE_SWAMP',
            'ICE_SPIKES',
            'DARK_OAK_FOREST',
            'MUSHROOM_FIELDS',
            'CHERRY_GROVE',
            'PALE_GARDEN',
            'PALE_OAK_FOREST',
            'OCEAN',
            'BEACH',
            'PLAINS',
            'FOREST',
            'DESERT',
            'SNOW',
            'BIRCH_FOREST',
            'JUNGLE',
            'SNOWY_TAIGA',
            'BADLANDS'
        ];

        for (const biomeKey of expectedBiomes) {
            assert.strictEqual(window.BIOME[biomeKey], biomeKey, `window.BIOME.${biomeKey} should equal ${biomeKey}`);
            assert.strictEqual(global.BIOME[biomeKey], biomeKey, `global.BIOME.${biomeKey} should equal ${biomeKey}`);
        }
    });

    it('should initialize BiomeManager with all required biomes in this.biomes', function() {
        const biomeManager = new window.BiomeManager(12345);
        assert.ok(biomeManager.biomes);

        const expectedBiomes = [
            'SAVANNA',
            'MANGROVE_SWAMP',
            'ICE_SPIKES',
            'DARK_OAK_FOREST',
            'MUSHROOM_FIELDS',
            'CHERRY_GROVE',
            'PALE_GARDEN',
            'PALE_OAK_FOREST',
            'OCEAN',
            'BEACH',
            'PLAINS',
            'FOREST',
            'DESERT',
            'SNOW',
            'BIRCH_FOREST',
            'JUNGLE',
            'SNOWY_TAIGA',
            'BADLANDS'
        ];

        for (const biomeKey of expectedBiomes) {
            assert.ok(biomeManager.biomes[biomeKey], `BiomeManager.biomes should contain ${biomeKey}`);
            assert.ok(biomeManager.biomes[biomeKey].name, `BiomeManager.biomes.${biomeKey} should have a name`);
        }
    });
});
