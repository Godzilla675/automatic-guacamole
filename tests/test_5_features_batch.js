const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('5 New Features Batch Test Suite (Moss Carpet, Soul Campfire, Mud Bricks, Packed Mud, Chiseled Stone Bricks)', function() {
    let window, document;

    before(function() {
        const dom = new JSDOM(`<!DOCTYPE html><html><body><canvas id="game-canvas"></canvas></body></html>`, {
            url: 'http://localhost/',
            runScripts: 'dangerously',
            resources: 'usable'
        });
        window = dom.window;
        document = window.document;

        // Mock HTMLCanvasElement context
        window.HTMLCanvasElement.prototype.getContext = function(type) {
            return {
                fillRect: () => {},
                clearRect: () => {},
                drawImage: () => {},
                strokeRect: () => {},
                beginPath: () => {},
                moveTo: () => {},
                lineTo: () => {},
                stroke: () => {},
                fill: () => {},
                arc: () => {},
                save: () => {},
                restore: () => {},
                scale: () => {},
                translate: () => {},
                rotate: () => {},
                createImageData: () => ({ data: new Uint8ClampedArray(16 * 16 * 4) }),
                putImageData: () => {},
                getImageData: () => ({ data: new Uint8ClampedArray(16 * 16 * 4) })
            };
        };

        // Load game scripts into window / global context
        const fs = require('fs');
        const vm = require('vm');
        const files = [
            'js/blocks.js',
            'js/textures.js',
            'js/crafting.js'
        ];

        files.forEach(file => {
            const code = fs.readFileSync(file, 'utf8');
            vm.runInNewContext(code, window);
        });

        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.TextureManager = window.TextureManager;
        global.CraftingSystem = window.CraftingSystem;
    });

    it('should have all 5 new blocks defined in BLOCK and BLOCKS', function() {
        assert.ok(BLOCK.MOSS_CARPET, 'MOSS_CARPET should be defined in BLOCK');
        assert.ok(BLOCK.SOUL_CAMPFIRE, 'SOUL_CAMPFIRE should be defined in BLOCK');
        assert.ok(BLOCK.MUD_BRICKS, 'MUD_BRICKS should be defined in BLOCK');
        assert.ok(BLOCK.PACKED_MUD, 'PACKED_MUD should be defined in BLOCK');
        assert.ok(BLOCK.CHISELED_STONE_BRICKS, 'CHISELED_STONE_BRICKS should be defined in BLOCK');

        assert.ok(BLOCKS[BLOCK.MOSS_CARPET], 'MOSS_CARPET definition should exist in BLOCKS');
        assert.ok(BLOCKS[BLOCK.SOUL_CAMPFIRE], 'SOUL_CAMPFIRE definition should exist in BLOCKS');
        assert.ok(BLOCKS[BLOCK.MUD_BRICKS], 'MUD_BRICKS definition should exist in BLOCKS');
        assert.ok(BLOCKS[BLOCK.PACKED_MUD], 'PACKED_MUD definition should exist in BLOCKS');
        assert.ok(BLOCKS[BLOCK.CHISELED_STONE_BRICKS], 'CHISELED_STONE_BRICKS definition should exist in BLOCKS');
    });

    it('should generate textures for all 5 new features without error', function() {
        const textureManager = new window.TextureManager();
        textureManager.init();
        assert.ok(textureManager.getBlockTexture(BLOCK.MOSS_CARPET), 'MOSS_CARPET texture should be generated');
        assert.ok(textureManager.getBlockTexture(BLOCK.SOUL_CAMPFIRE), 'SOUL_CAMPFIRE texture should be generated');
        assert.ok(textureManager.getBlockTexture(BLOCK.MUD_BRICKS), 'MUD_BRICKS texture should be generated');
        assert.ok(textureManager.getBlockTexture(BLOCK.PACKED_MUD), 'PACKED_MUD texture should be generated');
        assert.ok(textureManager.getBlockTexture(BLOCK.CHISELED_STONE_BRICKS), 'CHISELED_STONE_BRICKS texture should be generated');
    });

    it('should have valid crafting recipes for all 5 new features', function() {
        const craftingSystem = new window.CraftingSystem({});
        const recipes = craftingSystem.recipes;
        const targetBlocks = [
            BLOCK.MOSS_CARPET,
            BLOCK.SOUL_CAMPFIRE,
            BLOCK.MUD_BRICKS,
            BLOCK.PACKED_MUD,
            BLOCK.CHISELED_STONE_BRICKS
        ];

        targetBlocks.forEach(blockType => {
            const recipe = recipes.find(r => r.result && r.result.type === blockType);
            assert.ok(recipe, `Crafting recipe should exist for block type ${blockType}`);
            assert.ok(recipe.ingredients && recipe.ingredients.length > 0, `Recipe for ${blockType} should have ingredients`);
        });
    });
});
