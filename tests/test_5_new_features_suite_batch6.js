const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Batch 6 Features Suite', function() {
    let dom;
    let window;

    beforeEach(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body>
            <canvas id="game-canvas"></canvas>
            <div id="hotbar"></div>
            <div id="chat-messages"></div>
            <input id="chat-input" />
            <div id="notifications-container"></div>
            <div id="potion-effects-container"></div>
            <div id="health-bar"></div>
            <div id="hunger-bar"></div>
            <div id="xp-bar"></div>
            <div id="xp-level"></div>
            <div id="crosshair"></div>
            <div id="inventory-screen" class="hidden"></div>
            <div id="crafting-screen" class="hidden"></div>
        </body></html>`, {
            url: 'http://localhost:3000',
            runScripts: 'dangerously',
            resources: 'usable'
        });
        window = dom.window;
        global.window = window;
        global.document = window.document;
        global.btoa = window.btoa || function(str) { return Buffer.from(str, 'binary').toString('base64'); };
        global.atob = window.atob || function(b64) { return Buffer.from(b64, 'base64').toString('binary'); };

        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {},
                clearRect: () => {},
                getImageData: () => ({ data: new Uint8Array(16*16*4) }),
                putImageData: () => {},
                createImageData: () => ({ data: new Uint8Array(16*16*4) }),
                drawImage: () => {},
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                stroke: () => {},
                createPattern: () => ({ setTransform: () => {} })
            };
        };
        window.HTMLCanvasElement.prototype.toDataURL = function() { return 'data:image/png;base64,mock'; };

        window.perlin = {
            noise: () => 0.5
        };

        const loadScript = (file) => {
            const code = fs.readFileSync(path.join(__dirname, '../js', file), 'utf8');
            window.eval(code);
        };

        loadScript('blocks.js');
        loadScript('textures.js');
        loadScript('chunk.js');
        loadScript('entity.js');
        loadScript('drop.js');
        loadScript('vehicle.js');
        loadScript('particles.js');
        loadScript('plugin.js');
        loadScript('minimap.js');
        loadScript('achievements.js');
        loadScript('tutorial.js');
        loadScript('crafting.js');
        loadScript('mob.js');
        loadScript('biome.js');
        loadScript('structures.js');
        loadScript('world.js');
        loadScript('physics.js');
        loadScript('player.js');
        loadScript('ui.js');
        loadScript('input.js');
        loadScript('chat.js');
        loadScript('network.js');
        loadScript('renderer.js');
        loadScript('game.js');

        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.Mob = window.Mob;
        global.MOB_TYPE = window.MOB_TYPE;
        global.Game = window.Game;
    });

    afterEach(function() {
        if (dom) dom.window.close();
    });

    it('should define Creaking Heart, Resin Clumps, Resin Bricks, and Colored Bundles in BLOCK registry', function() {
        assert.strictEqual(window.BLOCK.CREAKING_HEART, 468);
        assert.strictEqual(window.BLOCK.ITEM_RESIN_CLUMP, 469);
        assert.strictEqual(window.BLOCK.RESIN_BRICKS, 470);
        assert.strictEqual(window.BLOCK.RESIN_BRICK_SLAB, 471);
        assert.strictEqual(window.BLOCK.ITEM_BUNDLE_RED, 486);
        assert.ok(window.BLOCKS[window.BLOCK.CREAKING_HEART]);
        assert.ok(window.BLOCKS[window.BLOCK.RESIN_BRICKS]);
    });

    it('should freeze Creaking mob when looked at by player', function() {
        const game = new window.Game();
        game.world.generateChunk(0, 0);
        game.player.x = 8;
        game.player.y = 10;
        game.player.z = 5;
        game.player.yaw = 0; // Face towards +Z
        game.player.pitch = 0;

        const creaking = new window.Mob(game, 8, 10, 10, window.MOB_TYPE.CREAKING);
        game.mobs.push(creaking);

        assert.strictEqual(creaking.isLookedAtByPlayer(), true);

        creaking.update(0.1);
        assert.strictEqual(creaking.vx, 0);
        assert.strictEqual(creaking.vz, 0);
    });

    it('should spawn Resin Clumps when Creaking Heart is struck', function() {
        const game = new window.Game();
        game.world.generateChunk(0, 0);
        game.world.setBlock(5, 5, 5, window.BLOCK.CREAKING_HEART);

        const handled = game.interact(5, 5, 5);
        assert.strictEqual(handled, true);
        assert.ok(game.drops.length > 0);
        assert.strictEqual(game.drops[0].type, window.BLOCK.ITEM_RESIN_CLUMP);
    });

    it('should craft Resin Bricks from 4 Resin Clumps', function() {
        const game = new window.Game();
        game.player.inventory[0] = { type: window.BLOCK.ITEM_RESIN_CLUMP, count: 4 };
        game.crafting.unlockRecipe("Resin Bricks");

        const recipeIdx = game.crafting.recipes.findIndex(r => r.name === "Resin Bricks");
        assert.ok(recipeIdx !== -1);

        game.crafting.craft(recipeIdx);
        assert.strictEqual(game.player.inventory[0].type, window.BLOCK.RESIN_BRICKS);
        assert.strictEqual(game.player.inventory[0].count, 1);
    });

    it('should emit vibration and activate Sculk Sensor on block breaking/placement', function() {
        const game = new window.Game();
        game.world.generateChunk(0, 0);
        game.world.setBlock(8, 5, 8, window.BLOCK.SCULK_SENSOR);

        // Emit vibration from nearby block placement
        game.world.emitVibration(9, 5, 8, 'place');

        const signal = game.world.getMetadata(8, 5, 8);
        assert.strictEqual(signal, 4); // 'place' = signal 4
    });
});
