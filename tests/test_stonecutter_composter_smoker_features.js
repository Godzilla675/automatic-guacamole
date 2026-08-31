const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Stonecutter, Composter, Smoker, Blast Furnace, and Sea Lantern Features Suite', () => {
    let window, document;

    beforeEach(() => {
        const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
            runScripts: 'dangerously',
            resources: 'usable',
            url: 'http://localhost/'
        });
        window = dom.window;
        document = window.document;

        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {},
                clearRect: () => {},
                getImageData: () => ({ data: new Uint8ClampedArray(16 * 16 * 4) }),
                putImageData: () => {},
                createImageData: () => ({ data: new Uint8ClampedArray(16 * 16 * 4) }),
                drawImage: () => {},
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

    it('should have STONECUTTER, COMPOSTER, SMOKER, BLAST_FURNACE, and SEA_LANTERN defined in BLOCK and BLOCKS', () => {
        const B = window.BLOCK;
        const BS = window.BLOCKS;

        assert.ok(B.STONECUTTER, 'STONECUTTER should be defined');
        assert.ok(B.COMPOSTER, 'COMPOSTER should be defined');
        assert.ok(B.SMOKER, 'SMOKER should be defined');
        assert.ok(B.BLAST_FURNACE, 'BLAST_FURNACE should be defined');
        assert.ok(B.SEA_LANTERN, 'SEA_LANTERN should be defined');

        assert.strictEqual(BS[B.STONECUTTER].name, 'Stonecutter');
        assert.strictEqual(BS[B.COMPOSTER].name, 'Composter');
        assert.strictEqual(BS[B.SMOKER].name, 'Smoker');
        assert.strictEqual(BS[B.BLAST_FURNACE].name, 'Blast Furnace');
        assert.strictEqual(BS[B.SEA_LANTERN].name, 'Sea Lantern');
        assert.strictEqual(BS[B.SEA_LANTERN].light, 15);
    });

    it('should generate textures for all 5 newly added features', () => {
        const tm = new window.TextureManager();
        tm.init();

        const B = window.BLOCK;
        assert.ok(tm.getBlockTexture(B.STONECUTTER), 'STONECUTTER texture generated');
        assert.ok(tm.getBlockTexture(B.COMPOSTER), 'COMPOSTER texture generated');
        assert.ok(tm.getBlockTexture(B.SMOKER), 'SMOKER texture generated');
        assert.ok(tm.getBlockTexture(B.BLAST_FURNACE), 'BLAST_FURNACE texture generated');
        assert.ok(tm.getBlockTexture(B.SEA_LANTERN), 'SEA_LANTERN texture generated');
    });

    it('should have crafting recipes for all 5 features', () => {
        const crafting = new window.CraftingSystem(null);
        const B = window.BLOCK;

        const recipes = crafting.recipes;
        const hasStonecutter = recipes.some(r => r.result.type === B.STONECUTTER);
        const hasComposter = recipes.some(r => r.result.type === B.COMPOSTER);
        const hasSmoker = recipes.some(r => r.result.type === B.SMOKER);
        const hasBlastFurnace = recipes.some(r => r.result.type === B.BLAST_FURNACE);
        const hasSeaLantern = recipes.some(r => r.result.type === B.SEA_LANTERN);

        assert.ok(hasStonecutter, 'Crafting recipe for Stonecutter exists');
        assert.ok(hasComposter, 'Crafting recipe for Composter exists');
        assert.ok(hasSmoker, 'Crafting recipe for Smoker exists');
        assert.ok(hasBlastFurnace, 'Crafting recipe for Blast Furnace exists');
        assert.ok(hasSeaLantern, 'Crafting recipe for Sea Lantern exists');
    });
});
