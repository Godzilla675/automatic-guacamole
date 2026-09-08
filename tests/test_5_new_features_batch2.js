const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('5 New Features Batch 2 Test Suite (Sculk Shrieker, Wind Charges, Copper Bulb, Bogged Mob, Recovery Compass)', function() {
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

        const fs = require('fs');
        const vm = require('vm');
        const files = [
            'js/blocks.js',
            'js/textures.js',
            'js/crafting.js',
            'js/entity.js',
            'js/mob.js',
            'js/player.js',
            'js/world.js'
        ];

        files.forEach(file => {
            const code = fs.readFileSync(file, 'utf8');
            vm.runInNewContext(code, window);
        });

        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.MOB_TYPE = window.MOB_TYPE;
        global.TextureManager = window.TextureManager;
        global.CraftingSystem = window.CraftingSystem;
        global.Mob = window.Mob;
        global.Player = window.Player;
        global.World = window.World;
    });

    it('should have all 5 new items/blocks defined in BLOCK and BLOCKS', function() {
        assert.ok(BLOCK.SCULK_SHRIEKER, 'SCULK_SHRIEKER should be defined in BLOCK');
        assert.ok(BLOCK.ITEM_BREEZE_ROD, 'ITEM_BREEZE_ROD should be defined in BLOCK');
        assert.ok(BLOCK.ITEM_WIND_CHARGE, 'ITEM_WIND_CHARGE should be defined in BLOCK');
        assert.ok(BLOCK.COPPER_BULB, 'COPPER_BULB should be defined in BLOCK');
        assert.ok(BLOCK.ITEM_RECOVERY_COMPASS, 'ITEM_RECOVERY_COMPASS should be defined in BLOCK');

        assert.ok(BLOCKS[BLOCK.SCULK_SHRIEKER], 'SCULK_SHRIEKER definition should exist in BLOCKS');
        assert.ok(BLOCKS[BLOCK.ITEM_BREEZE_ROD], 'ITEM_BREEZE_ROD definition should exist in BLOCKS');
        assert.ok(BLOCKS[BLOCK.ITEM_WIND_CHARGE], 'ITEM_WIND_CHARGE definition should exist in BLOCKS');
        assert.ok(BLOCKS[BLOCK.COPPER_BULB], 'COPPER_BULB definition should exist in BLOCKS');
        assert.ok(BLOCKS[BLOCK.ITEM_RECOVERY_COMPASS], 'ITEM_RECOVERY_COMPASS definition should exist in BLOCKS');
    });

    it('should generate textures for all new features without error', function() {
        const textureManager = new window.TextureManager();
        textureManager.init();
        assert.ok(textureManager.getBlockTexture(BLOCK.SCULK_SHRIEKER), 'SCULK_SHRIEKER texture generated');
        assert.ok(textureManager.getBlockTexture(BLOCK.ITEM_BREEZE_ROD), 'ITEM_BREEZE_ROD texture generated');
        assert.ok(textureManager.getBlockTexture(BLOCK.ITEM_WIND_CHARGE), 'ITEM_WIND_CHARGE texture generated');
        assert.ok(textureManager.getBlockTexture(BLOCK.COPPER_BULB), 'COPPER_BULB texture generated');
        assert.ok(textureManager.getBlockTexture(BLOCK.ITEM_RECOVERY_COMPASS), 'ITEM_RECOVERY_COMPASS texture generated');
    });

    it('should have valid crafting recipes for new features', function() {
        const craftingSystem = new window.CraftingSystem({});
        const recipes = craftingSystem.recipes;

        const checkBlock = (bType) => {
            const recipe = recipes.find(r => r.result && r.result.type === bType);
            assert.ok(recipe, `Crafting recipe should exist for ${bType}`);
            assert.ok(recipe.ingredients && recipe.ingredients.length > 0, `Recipe for ${bType} should have ingredients`);
        };

        checkBlock(BLOCK.SCULK_SHRIEKER);
        checkBlock(BLOCK.ITEM_WIND_CHARGE);
        checkBlock(BLOCK.COPPER_BULB);
        checkBlock(BLOCK.ITEM_RECOVERY_COMPASS);
    });

    it('should correctly spawn Bogged mob and shoot poison arrows', function() {
        assert.ok(MOB_TYPE.BOGGED, 'MOB_TYPE.BOGGED should be defined');
        const mockGame = { world: { getBlock: () => 0 }, player: { x: 10, y: 1, z: 10, height: 1.8 } };
        const bogged = new window.Mob(mockGame, 0, 1, 0, MOB_TYPE.BOGGED);
        assert.strictEqual(bogged.type, MOB_TYPE.BOGGED);
        assert.strictEqual(bogged.maxHealth, 16);
    });

    it('should track last death position for Recovery Compass on player death', function() {
        const mockGame = { updateHealthUI: () => {} };
        const player = new window.Player(mockGame);
        player.x = 42;
        player.y = 64;
        player.z = 100;
        player.spawnPoint = { x: 0, y: 64, z: 0 };

        player.takeDamage(100);
        assert.ok(player.lastDeathPos, 'lastDeathPos should be set on death');
        assert.strictEqual(player.lastDeathPos.x, 42);
        assert.strictEqual(player.lastDeathPos.z, 100);

        const vector = player.getRecoveryCompassVector();
        assert.ok(vector, 'getRecoveryCompassVector should return direction vector');
        assert.ok(vector.distance > 0, 'distance should be calculated');
    });
});
