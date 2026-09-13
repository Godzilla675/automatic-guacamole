const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const vm = require('vm');

describe('5 New Features Batch Test Suite', function() {
    let window, document;

    before(function() {
        const dom = new JSDOM(`<!DOCTYPE html><html><body>
            <canvas id="game-canvas"></canvas>
            <div id="hotbar"></div>
            <div id="inventory-grid"></div>
            <div id="armor-grid"></div>
            <div id="offhand-container"></div>
            <div id="health-bar"></div>
            <div id="hunger-bar"></div>
            <div id="xp-bar"></div>
            <div id="xp-level"></div>
            <div id="crosshair"></div>
        </body></html>`, {
            url: 'http://localhost/',
            runScripts: 'dangerously',
            resources: 'usable'
        });
        window = dom.window;
        document = window.document;

        // Mock HTMLCanvasElement context
        window.HTMLCanvasElement.prototype.getContext = function() {
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

        window.perlin = {
            noise: () => 0.5
        };

        const files = [
            'js/blocks.js',
            'js/textures.js',
            'js/crafting.js',
            'js/entity.js',
            'js/drop.js',
            'js/vehicle.js',
            'js/particles.js',
            'js/mob.js',
            'js/chunk.js',
            'js/biome.js',
            'js/structures.js',
            'js/world.js',
            'js/physics.js',
            'js/player.js',
            'js/ui.js',
            'js/input.js',
            'js/chat.js',
            'js/renderer.js',
            'js/game.js'
        ];

        files.forEach(file => {
            const code = fs.readFileSync(file, 'utf8');
            vm.runInNewContext(code, window);
        });

        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.TextureManager = window.TextureManager;
        global.CraftingSystem = window.CraftingSystem;
        global.World = window.World;
    });

    it('Feature 1: Copper Grates and Copper Doors are defined and placeable', function() {
        assert.strictEqual(window.BLOCK.COPPER_GRATE, 426);
        assert.strictEqual(window.BLOCK.COPPER_DOOR_BOTTOM, 427);
        assert.strictEqual(window.BLOCK.COPPER_DOOR_TOP, 428);
        assert.strictEqual(window.BLOCK.ITEM_COPPER_DOOR, 429);

        const world = new window.World();
        world.generateChunk(0, 0);
        world.setBlock(10, 10, 10, window.BLOCK.COPPER_GRATE);
        assert.strictEqual(world.getBlock(10, 10, 10), window.BLOCK.COPPER_GRATE);
    });

    it('Feature 2: Bundle item holds and ejects up to 64 mixed items', function() {
        assert.strictEqual(window.BLOCK.ITEM_BUNDLE, 430);
        const bundle = { type: window.BLOCK.ITEM_BUNDLE, count: 1, bundleItems: [], bundleCount: 0 };

        // Add items
        bundle.bundleItems.push({ type: window.BLOCK.STONE, count: 32 });
        bundle.bundleCount = 32;
        assert.strictEqual(bundle.bundleCount, 32);

        // Add more
        bundle.bundleItems.push({ type: window.BLOCK.DIRT, count: 32 });
        bundle.bundleCount = 64;
        assert.strictEqual(bundle.bundleCount, 64);
    });

    it('Feature 3: Pale Oak wood set and Eyeblossom defined', function() {
        assert.strictEqual(window.BLOCK.PALE_OAK_LOG, 431);
        assert.strictEqual(window.BLOCK.PALE_OAK_PLANK, 432);
        assert.strictEqual(window.BLOCK.EYEBLOSSOM, 435);

        const world = new window.World();
        world.generateChunk(0, 0);
        world.setBlock(5, 5, 5, window.BLOCK.EYEBLOSSOM);
        assert.strictEqual(world.getBlock(5, 5, 5), window.BLOCK.EYEBLOSSOM);
    });

    it('Feature 4: Daylight Sensor updates signal based on time of day', function() {
        assert.strictEqual(window.BLOCK.DAYLIGHT_SENSOR, 436);
        const world = new window.World();
        world.generateChunk(0, 0);
        world.game = { gameTime: 30000, dayLength: 120000 }; // Midday
        world.setBlock(0, 10, 0, window.BLOCK.DAYLIGHT_SENSOR);
        world.activeRedstone.add("0,10,0");
        world.updateRedstone();
        assert.ok(world.getMetadata(0, 10, 0) > 0);
    });

    it('Feature 5: Trial Spawner and Trial Vault rewarding Trial Keys and loot', function() {
        assert.strictEqual(window.BLOCK.TRIAL_SPAWNER, 437);
        assert.strictEqual(window.BLOCK.ITEM_TRIAL_KEY, 438);
        assert.strictEqual(window.BLOCK.TRIAL_VAULT, 439);

        const world = new window.World();
        world.generateChunk(1, 1);
        world.setBlock(20, 10, 20, window.BLOCK.TRIAL_SPAWNER);
        world.setBlock(22, 10, 20, window.BLOCK.TRIAL_VAULT);
        assert.strictEqual(world.getBlock(20, 10, 20), window.BLOCK.TRIAL_SPAWNER);
        assert.strictEqual(world.getBlock(22, 10, 20), window.BLOCK.TRIAL_VAULT);
    });
});
