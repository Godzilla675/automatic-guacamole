const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const vm = require('vm');

describe('5 New Features Batch Test Suite (Magma Block, Copper, Bamboo, Magma Cube, Snow Golem)', function() {
    let window, document;

    before(function() {
        const dom = new JSDOM(`<!DOCTYPE html><html><body>
            <div id="chat-messages"></div>
            <div id="chat-input"></div>
            <div id="chat-container"></div>
            <div id="crafting-recipes"></div>
            <div id="close-crafting"></div>
            <div id="crafting-screen" class="hidden"></div>
            <div id="potion-effects-container"></div>
            <canvas id="game-canvas"></canvas>
        </body></html>`, {
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

        window.localStorage = {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
        };

        window.soundManager = {
            play: () => {}
        };

        const files = [
            'js/blocks.js',
            'js/textures.js',
            'js/crafting.js',
            'js/entity.js',
            'js/mob.js',
            'js/player.js'
        ];

        files.forEach(file => {
            const code = fs.readFileSync(file, 'utf8');
            vm.runInNewContext(code, window);
        });

        global.window = window;
        global.document = document;
        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.MOB_TYPE = window.MOB_TYPE;
        global.TextureManager = window.TextureManager;
        global.CraftingSystem = window.CraftingSystem;
        global.Entity = window.Entity;
        global.Mob = window.Mob;
        global.Player = window.Player;
    });

    it('should have all 5 new features defined in BLOCK/BLOCKS/MOB_TYPE', function() {
        const B = window.BLOCK;
        const BL = window.BLOCKS;
        const M = window.MOB_TYPE;

        assert.ok(B.MAGMA_BLOCK !== undefined);
        assert.ok(B.ORE_COPPER !== undefined);
        assert.ok(B.ITEM_COPPER_INGOT !== undefined);
        assert.ok(B.COPPER_BLOCK !== undefined);
        assert.ok(B.BAMBOO !== undefined);
        assert.ok(B.ITEM_BAMBOO !== undefined);

        assert.ok(BL[B.MAGMA_BLOCK]);
        assert.ok(BL[B.ORE_COPPER]);
        assert.ok(BL[B.ITEM_COPPER_INGOT]);
        assert.ok(BL[B.COPPER_BLOCK]);
        assert.ok(BL[B.BAMBOO]);

        assert.strictEqual(M.MAGMA_CUBE, 'magma_cube');
        assert.strictEqual(M.SNOW_GOLEM, 'snow_golem');
    });

    it('should generate textures without errors for all new features and mobs', function() {
        const tm = new window.TextureManager();
        tm.init();

        const B = window.BLOCK;
        assert.ok(tm.getBlockTexture(B.MAGMA_BLOCK));
        assert.ok(tm.getBlockTexture(B.ORE_COPPER));
        assert.ok(tm.getBlockTexture(B.COPPER_BLOCK));
        assert.ok(tm.getBlockTexture(B.BAMBOO));
        assert.ok(tm.getBlockTexture(B.ITEM_COPPER_INGOT));

        assert.ok(tm.getMobTexture('magma_cube'));
        assert.ok(tm.getMobTexture('snow_golem'));
    });

    it('should have valid crafting and smelting recipes for new features', function() {
        const cs = new window.CraftingSystem({ player: { unlockedRecipes: new Set() } });
        const B = window.BLOCK;

        const magmaRecipe = cs.recipes.find(r => r.result.type === B.MAGMA_BLOCK);
        assert.ok(magmaRecipe);

        const copperBlockRecipe = cs.recipes.find(r => r.result.type === B.COPPER_BLOCK);
        assert.ok(copperBlockRecipe);

        const copperSmelt = cs.getSmeltingResult(B.ORE_COPPER);
        assert.ok(copperSmelt);
        assert.strictEqual(copperSmelt.type, B.ITEM_COPPER_INGOT);

        const bambooStickRecipe = cs.recipes.find(r => r.name === 'Stick from Bamboo');
        assert.ok(bambooStickRecipe);
    });

    it('should trigger Magma Block standing damage on non-sneaking player', function() {
        const mockGame = {
            world: {
                getBlock: () => window.BLOCK.MAGMA_BLOCK
            },
            physics: {
                getFluidIntersection: () => false,
                getCollidingBlocks: () => [],
                checkCollision: (box) => {
                    // Return true when moving down to set onGround = true
                    return box.y < 40;
                }
            },
            controls: { sneak: false },
            updateHealthUI: () => {}
        };

        const player = new window.Player(mockGame);
        player.onGround = true;
        player.gamemode = 0;
        const initialHealth = player.health;

        player.update(0.1);
        assert.ok(player.health < initialHealth);
    });

    it('should initialize Snow Golem and Magma Cube mobs correctly', function() {
        const mockGame = {
            world: { getBlock: () => 0 },
            player: { x: 10, y: 10, z: 10, height: 1.8 },
            mobs: []
        };

        const magmaCube = new window.Mob(mockGame, 0, 0, 0, window.MOB_TYPE.MAGMA_CUBE);
        assert.strictEqual(magmaCube.type, 'magma_cube');
        assert.strictEqual(magmaCube.maxHealth, 16);

        const snowGolem = new window.Mob(mockGame, 0, 0, 0, window.MOB_TYPE.SNOW_GOLEM);
        assert.strictEqual(snowGolem.type, 'snow_golem');
        assert.strictEqual(snowGolem.maxHealth, 10);
    });
});
