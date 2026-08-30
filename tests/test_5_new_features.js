const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('5 New Features Verification Suite', function () {
    let dom;
    let window;

    before(function () {
        dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="game-canvas"></canvas></body></html>', {
            url: 'http://localhost/',
            runScripts: 'dangerously',
            resources: 'usable'
        });
        window = dom.window;

        const canvas = window.document.getElementById('game-canvas');
        canvas.getContext = function (type) {
            return {
                fillRect: () => {},
                clearRect: () => {},
                drawImage: () => {},
                getImageData: () => ({ data: new Uint8Array(4) }),
                putImageData: () => {},
                createPattern: () => ({}),
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                stroke: () => {}
            };
        };

        const loadScript = (filePath) => {
            const fullPath = path.resolve(__dirname, '..', filePath);
            const content = fs.readFileSync(fullPath, 'utf8');
            window.eval(content);
        };

        loadScript('js/blocks.js');
        loadScript('js/textures.js');
        loadScript('js/crafting.js');

        global.window = window;
        global.document = window.document;
        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.TextureManager = window.TextureManager;
        global.CraftingSystem = window.CraftingSystem;
    });

    it('should have all 5 new feature blocks and items defined', function () {
        assert.ok(BLOCK.ITEM_SWEET_BERRIES, 'ITEM_SWEET_BERRIES constant defined');
        assert.ok(BLOCK.MOSS_BLOCK, 'MOSS_BLOCK constant defined');
        assert.ok(BLOCK.HONEYCOMB_BLOCK, 'HONEYCOMB_BLOCK constant defined');
        assert.ok(BLOCK.AMETHYST_BLOCK, 'AMETHYST_BLOCK constant defined');
        assert.ok(BLOCK.CRYING_OBSIDIAN, 'CRYING_OBSIDIAN constant defined');

        assert.strictEqual(BLOCKS[BLOCK.ITEM_SWEET_BERRIES].name, 'Sweet Berries');
        assert.strictEqual(BLOCKS[BLOCK.MOSS_BLOCK].name, 'Moss Block');
        assert.strictEqual(BLOCKS[BLOCK.HONEYCOMB_BLOCK].name, 'Honeycomb Block');
        assert.strictEqual(BLOCKS[BLOCK.AMETHYST_BLOCK].name, 'Amethyst Block');
        assert.strictEqual(BLOCKS[BLOCK.CRYING_OBSIDIAN].name, 'Crying Obsidian');
    });

    it('should generate textures for all 5 new features', function () {
        const tm = new TextureManager();
        tm.init();
        assert.ok(tm.textures[BLOCK.ITEM_SWEET_BERRIES], 'Sweet Berries texture generated');
        assert.ok(tm.textures[BLOCK.MOSS_BLOCK], 'Moss Block texture generated');
        assert.ok(tm.textures[BLOCK.HONEYCOMB_BLOCK], 'Honeycomb Block texture generated');
        assert.ok(tm.textures[BLOCK.AMETHYST_BLOCK], 'Amethyst Block texture generated');
        assert.ok(tm.textures[BLOCK.CRYING_OBSIDIAN], 'Crying Obsidian texture generated');
    });

    it('should have crafting recipes for Honeycomb Block and Amethyst Block', function () {
        const cs = new CraftingSystem(null);
        const hcRecipe = cs.recipes.find(r => r.result.type === BLOCK.HONEYCOMB_BLOCK);
        const amethystRecipe = cs.recipes.find(r => r.result.type === BLOCK.AMETHYST_BLOCK);
        assert.ok(hcRecipe, 'Honeycomb Block recipe exists');
        assert.ok(amethystRecipe, 'Amethyst Block recipe exists');
    });
});
