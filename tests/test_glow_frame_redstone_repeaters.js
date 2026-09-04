const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const vm = require('vm');

describe('Glow Item Frame & Redstone Repeater / Comparator Bug Fixes', () => {
    let window, document;

    before(() => {
        const dom = new JSDOM('<!DOCTYPE html><html><body><div id="crafting-recipes"></div></body></html>', {
            url: 'http://localhost/'
        });
        window = dom.window;
        window.window = window;
        document = window.document;

        // Mock localStorage
        window.localStorage = {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
        };

        // Mock canvas context
        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {},
                clearRect: () => {},
                getImageData: (x, y, w, h) => ({ data: new Uint8Array(w * h * 4) }),
                putImageData: () => {},
                createImageData: () => ({ data: new Uint8ClampedArray(16 * 16 * 4) }),
                setTransform: () => {},
                drawImage: () => {},
                save: () => {},
                fill: () => {},
                stroke: () => {},
                rect: () => {},
                strokeRect: () => {},
                beginPath: () => {},
                arc: () => {},
                moveTo: () => {},
                lineTo: () => {},
                restore: () => {},
                translate: () => {},
                scale: () => {},
                rotate: () => {},
                measureText: () => ({ width: 0 })
            };
        };

        const files = [
            'js/blocks.js',
            'js/textures.js',
            'js/crafting.js',
            'js/math.js',
            'js/biome.js',
            'js/structures.js',
            'js/chunk.js',
            'js/world.js'
        ];

        files.forEach(file => {
            const code = fs.readFileSync(file, 'utf8');
            vm.runInNewContext(code, window);
        });
    });

    it('should have Glow Item Frame, Redstone Repeater, and Redstone Comparator defined in BLOCK and BLOCKS', () => {
        assert.ok(window.BLOCK.ITEM_GLOW_FRAME !== undefined, 'ITEM_GLOW_FRAME ID defined');
        assert.ok(window.BLOCK.REDSTONE_REPEATER !== undefined, 'REDSTONE_REPEATER ID defined');
        assert.ok(window.BLOCK.REDSTONE_COMPARATOR !== undefined, 'REDSTONE_COMPARATOR ID defined');

        const glowFrame = window.BLOCKS[window.BLOCK.ITEM_GLOW_FRAME];
        const repeater = window.BLOCKS[window.BLOCK.REDSTONE_REPEATER];
        const comparator = window.BLOCKS[window.BLOCK.REDSTONE_COMPARATOR];

        assert.ok(glowFrame, 'Glow Item Frame block def exists');
        assert.strictEqual(glowFrame.name, 'Glow Item Frame');
        assert.strictEqual(glowFrame.light, 10);

        assert.ok(repeater, 'Redstone Repeater block def exists');
        assert.strictEqual(repeater.name, 'Redstone Repeater');
        assert.strictEqual(repeater.isWire, true);

        assert.ok(comparator, 'Redstone Comparator block def exists');
        assert.strictEqual(comparator.name, 'Redstone Comparator');
        assert.strictEqual(comparator.isWire, true);
    });

    it('should generate textures for Glow Item Frame, Redstone Repeater, and Redstone Comparator', () => {
        const textureManager = new window.TextureManager();
        textureManager.init();

        const glowFrameTex = textureManager.getBlockTexture(window.BLOCK.ITEM_GLOW_FRAME);
        const repeaterTex = textureManager.getBlockTexture(window.BLOCK.REDSTONE_REPEATER);
        const comparatorTex = textureManager.getBlockTexture(window.BLOCK.REDSTONE_COMPARATOR);

        assert.ok(glowFrameTex, 'Glow Item Frame texture generated');
        assert.ok(repeaterTex, 'Redstone Repeater texture generated');
        assert.ok(comparatorTex, 'Redstone Comparator texture generated');
    });

    it('should have crafting recipes for Glow Item Frame, Redstone Repeater, and Redstone Comparator', () => {
        const crafting = new window.CraftingSystem({});
        const recipes = crafting.recipes;

        const glowFrameRecipe = recipes.find(r => r.result.type === window.BLOCK.ITEM_GLOW_FRAME);
        const repeaterRecipe = recipes.find(r => r.result.type === window.BLOCK.REDSTONE_REPEATER);
        const comparatorRecipe = recipes.find(r => r.result.type === window.BLOCK.REDSTONE_COMPARATOR);

        assert.ok(glowFrameRecipe, 'Glow Item Frame recipe exists');
        assert.ok(repeaterRecipe, 'Redstone Repeater recipe exists');
        assert.ok(comparatorRecipe, 'Redstone Comparator recipe exists');
    });

    it('should handle redstone repeater and comparator signal updates in World', () => {
        const world = new window.World();
        world.generateChunk(0, 0);

        // Place support stone blocks high in air (Y=50)
        world.setBlock(5, 50, 5, window.BLOCK.STONE);
        world.setBlock(6, 50, 5, window.BLOCK.STONE);

        // Place redstone components on top of support blocks (Y=51)
        world.setBlock(5, 51, 5, window.BLOCK.REDSTONE_TORCH);
        world.setBlock(6, 51, 5, window.BLOCK.REDSTONE_REPEATER);

        world.updateRedstone();

        const repeaterPower = world.getMetadata(6, 51, 5);
        assert.strictEqual(repeaterPower, 15, 'Redstone Repeater outputs full signal 15 when powered');
    });
});
