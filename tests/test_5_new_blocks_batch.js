const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('5 New Blocks Batch Features Suite (Target Block, Lodestone, Flower Pot, Tinted Glass, Lightning Rod)', function() {
    let window, document;

    beforeEach(function() {
        const dom = new JSDOM(`<!DOCTYPE html><html><body><canvas id="game-canvas"></canvas></body></html>`, {
            runScripts: 'dangerously',
            resources: 'usable',
            url: 'http://localhost/'
        });

        window = dom.window;
        document = window.document;

        // Mock HTMLCanvasElement context
        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {},
                clearRect: () => {},
                drawImage: () => {},
                getImageData: () => ({ data: new Uint8ClampedArray(16 * 16 * 4) }),
                putImageData: () => {},
                createPattern: () => ({}),
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                stroke: () => {}
            };
        };

        const loadScript = (file) => {
            const code = fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8');
            window.eval(code);
        };

        loadScript('blocks.js');
        loadScript('textures.js');
        loadScript('crafting.js');
    });

    it('should have TARGET_BLOCK, LODESTONE, FLOWER_POT, TINTED_GLASS, and LIGHTNING_ROD defined in BLOCK and BLOCKS', function() {
        const B = window.BLOCK;
        const BS = window.BLOCKS;

        const requiredBlocks = [
            'TARGET_BLOCK',
            'LODESTONE',
            'FLOWER_POT',
            'TINTED_GLASS',
            'LIGHTNING_ROD'
        ];

        requiredBlocks.forEach(key => {
            assert.ok(B[key], `BLOCK.${key} should be defined`);
            const blockId = B[key];
            assert.ok(BS[blockId], `BLOCKS[BLOCK.${key}] should be defined`);
            assert.ok(BS[blockId].name, `BLOCKS[BLOCK.${key}] should have a name`);
        });
    });

    it('should generate textures for all 5 newly added blocks', function() {
        const tm = new window.TextureManager();
        tm.init();

        const B = window.BLOCK;
        const requiredBlockKeys = [
            'TARGET_BLOCK',
            'LODESTONE',
            'FLOWER_POT',
            'TINTED_GLASS',
            'LIGHTNING_ROD'
        ];

        requiredBlockKeys.forEach(key => {
            const blockId = B[key];
            const tex = tm.getBlockTexture(blockId);
            assert.ok(tex, `Texture for ${key} (ID: ${blockId}) should be generated`);
        });
    });

    it('should have crafting recipes for all 5 new blocks', function() {
        const crafting = new window.CraftingSystem(null);
        const B = window.BLOCK;
        const recipes = crafting.recipes;

        const requiredResults = [
            B.TARGET_BLOCK,
            B.LODESTONE,
            B.FLOWER_POT,
            B.TINTED_GLASS,
            B.LIGHTNING_ROD
        ];

        requiredResults.forEach(resType => {
            const recipe = recipes.find(r => r.result && r.result.type === resType);
            assert.ok(recipe, `Crafting recipe for block type ${resType} should exist`);
            assert.ok(recipe.ingredients && recipe.ingredients.length > 0, `Recipe for block type ${resType} should have ingredients`);
        });
    });
});
