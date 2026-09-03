const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('New Features Batch: Grindstone, Item Frame, Sculk Sensor, Spectator Night Vision, Witch Mob', function() {
    let dom;
    let window;

    before(function() {
        dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="game-canvas"></canvas></body></html>', {
            url: 'http://localhost/'
        });
        window = dom.window;

        // Mock HTMLCanvasElement context
        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {},
                clearRect: () => {},
                drawImage: () => {},
                createImageData: () => ({ data: new Uint8ClampedArray(16 * 16 * 4) }),
                putImageData: () => {},
                beginPath: () => {},
                arc: () => {},
                fill: () => {}
            };
        };

        // Mock localStorage
        window.localStorage = {
            getItem: () => null,
            setItem: () => {}
        };

        // Load game files via vm in window context
        const fs = require('fs');
        const vm = require('vm');
        const files = [
            'js/blocks.js',
            'js/textures.js',
            'js/crafting.js',
            'js/entity.js',
            'js/player.js',
            'js/mob.js'
        ];

        files.forEach(file => {
            const code = fs.readFileSync(file, 'utf8');
            vm.runInNewContext(code, window);
        });

        // Map definitions to global
        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.TOOLS = window.TOOLS;
        global.ARMOR = window.ARMOR;
        global.MOB_TYPE = window.MOB_TYPE;
        global.Player = window.Player;
        global.Mob = window.Mob;
        global.TextureManager = window.TextureManager;
        global.CraftingSystem = window.CraftingSystem;
    });

    it('should have Grindstone, Item Frame, and Sculk Sensor defined in BLOCK and BLOCKS', function() {
        assert.ok(window.BLOCK.GRINDSTONE, 'BLOCK.GRINDSTONE should be defined');
        assert.ok(window.BLOCK.ITEM_FRAME, 'BLOCK.ITEM_FRAME should be defined');
        assert.ok(window.BLOCK.SCULK_SENSOR, 'BLOCK.SCULK_SENSOR should be defined');

        assert.ok(window.BLOCKS[window.BLOCK.GRINDSTONE], 'BLOCKS entry for GRINDSTONE should exist');
        assert.ok(window.BLOCKS[window.BLOCK.ITEM_FRAME], 'BLOCKS entry for ITEM_FRAME should exist');
        assert.ok(window.BLOCKS[window.BLOCK.SCULK_SENSOR], 'BLOCKS entry for SCULK_SENSOR should exist');
    });

    it('should generate textures for Grindstone, Item Frame, Sculk Sensor, and Witch mob', function() {
        const tm = new window.TextureManager();
        tm.init();

        assert.ok(tm.getBlockTexture(window.BLOCK.GRINDSTONE), 'Grindstone texture should exist');
        assert.ok(tm.getBlockTexture(window.BLOCK.ITEM_FRAME), 'Item Frame texture should exist');
        assert.ok(tm.getBlockTexture(window.BLOCK.SCULK_SENSOR), 'Sculk Sensor texture should exist');
        assert.ok(tm.getMobTexture(window.MOB_TYPE.WITCH), 'Witch mob texture should exist');
    });

    it('should have crafting recipes for Grindstone, Item Frame, and Sculk Sensor', function() {
        const cs = new window.CraftingSystem({});
        const grindstoneRecipe = cs.recipes.find(r => r.result.type === window.BLOCK.GRINDSTONE);
        const itemFrameRecipe = cs.recipes.find(r => r.result.type === window.BLOCK.ITEM_FRAME);
        const sculkSensorRecipe = cs.recipes.find(r => r.result.type === window.BLOCK.SCULK_SENSOR);

        assert.ok(grindstoneRecipe, 'Grindstone recipe should exist');
        assert.ok(itemFrameRecipe, 'Item Frame recipe should exist');
        assert.ok(sculkSensorRecipe, 'Sculk Sensor recipe should exist');
    });

    it('should grant Night Vision effect when in spectator mode', function() {
        const mockGame = {
            controls: {},
            physics: { getFluidIntersection: () => false, getCollidingBlocks: () => [] },
            world: { getBlock: () => 0 }
        };
        const player = new window.Player(mockGame);
        player.spectator = true;
        player.update(0.1);

        assert.ok(player.activeEffects.some(e => e.name === 'Night Vision'), 'Player in spectator mode should receive Night Vision effect');
    });

    it('should initialize Witch mob correctly and apply poison effect on attack', function() {
        let effectApplied = false;
        let tookDamage = false;

        const mockPlayer = {
            x: 10,
            y: 0,
            z: 10,
            height: 1.8,
            takeDamage: () => { tookDamage = true; },
            addEffect: (name) => { if (name === 'Poison') effectApplied = true; }
        };

        const mockGame = {
            player: mockPlayer,
            world: { getBlock: () => 0 },
            physics: { raycast: () => null }
        };

        const witch = new window.Mob(mockGame, 10, 0, 12, window.MOB_TYPE.WITCH);
        assert.strictEqual(witch.type, window.MOB_TYPE.WITCH);
        assert.strictEqual(witch.maxHealth, 26);

        witch.updateHostileAI(0.1);
        witch.attackCooldown = 0;
        witch.updateHostileAI(0.1);

        assert.ok(tookDamage, 'Player should take damage from Witch');
        assert.ok(effectApplied, 'Witch attack should apply Poison effect to player');
    });
});
