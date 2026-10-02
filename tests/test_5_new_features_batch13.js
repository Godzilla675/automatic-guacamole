const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Batch 13 5 New High Quality Features Test Suite', function() {
    this.timeout(30000);
    let dom;
    let window;

    beforeEach(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body>
            <canvas id="game-canvas"></canvas>
            <div id="hotbar"></div>
            <div id="inventory-screen" class="hidden"><div id="inventory-grid"></div><div id="armor-grid"></div><div id="offhand-container"></div></div>
            <div id="crafting-screen" class="hidden"></div>
            <div id="fletching-screen" class="hidden"></div>
            <div id="smithing-screen" class="hidden"></div>
            <div id="furnace-screen" class="hidden"></div>
            <div id="recipe-book-screen" class="hidden"></div>
            <div id="trading-screen" class="hidden"></div>
            <div id="brewing-screen" class="hidden"></div>
            <div id="enchanting-screen" class="hidden"></div>
            <div id="anvil-screen" class="hidden"></div>
            <div id="jukebox-screen" class="hidden"></div>
            <div id="stonecutter-screen" class="hidden"></div>
            <div id="chiseled-bookshelf-screen" class="hidden"></div>
            <div id="dropper-screen" class="hidden"></div>
            <div id="crafter-screen" class="hidden"></div>
            <div id="chest-screen" class="hidden"></div>
            <div id="sign-screen" class="hidden"></div>
            <div id="settings-screen" class="hidden"></div>
            <div id="pause-screen" class="hidden"></div>
            <div id="death-screen" class="hidden"></div>
            <div id="chat-container"><input id="chat-input" /><div id="chat-messages"></div></div>
            <div id="crosshair"></div>
            <div id="fps"></div>
            <div id="position"></div>
            <div id="block-count"></div>
            <div id="game-time"></div>
            <div id="health-bar"></div>
            <div id="hunger-bar"></div>
            <div id="xp-bar"></div>
            <div id="xp-level"></div>
            <div id="potion-effects-container"></div>
        </body></html>`, {
            url: "http://localhost/",
            runScripts: "dangerously",
            resources: "usable"
        });

        window = dom.window;
        global.window = window;
        global.document = window.document;
        global.navigator = window.navigator;
        global.localStorage = window.localStorage;
        global.sessionStorage = window.sessionStorage;
        global.Image = window.Image;
        global.HTMLCanvasElement = window.HTMLCanvasElement;

        window.HTMLCanvasElement.prototype.getContext = function () {
            return {
                fillRect: () => {},
                clearRect: () => {},
                getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
                putImageData: () => {},
                createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
                drawPattern: () => {},
                drawImage: () => {},
                beginPath: () => {},
                moveTo: () => {},
                lineTo: () => {},
                stroke: () => {},
                fill: () => {},
                save: () => {},
                restore: () => {},
                translate: () => {},
                rotate: () => {},
                scale: () => {},
                arc: () => {},
                createPattern: () => ({})
            };
        };

        window.prompt = () => "TestPlayer";
        window.alert = () => {};
        document.exitPointerLock = () => {};

        const scripts = [
            'js/math.js',
            'js/blocks.js',
            'js/chunk.js',
            'js/drop.js',
            'js/textures.js',
            'js/crafting.js',
            'js/biome.js',
            'js/structures.js',
            'js/world.js',
            'js/physics.js',
            'js/entity.js',
            'js/player.js',
            'js/mob.js',
            'js/vehicle.js',
            'js/particles.js',
            'js/ui.js',
            'js/input.js',
            'js/renderer.js',
            'js/chat.js',
            'js/network.js',
            'js/plugin.js',
            'js/minimap.js',
            'js/achievements.js',
            'js/tutorial.js',
            'js/game.js'
        ];

        for (const file of scripts) {
            const filePath = path.join(__dirname, '..', file);
            if (fs.existsSync(filePath)) {
                const code = fs.readFileSync(filePath, 'utf8');
                window.eval(code);
            }
        }

        global.Game = window.Game;
        global.BLOCK = window.BLOCK;
        global.MOB_TYPE = window.MOB_TYPE;
        global.Mob = window.Mob;

        window.soundManager = { play: () => {}, updateListener: () => {}, updateAmbience: () => {} };
    });

    afterEach(function() {
        if (dom) dom.window.close();
    });

    it('Feature 1: Scaffolding block definition, crafting recipe & climbing physics', function() {
        assert.ok(window.BLOCK.SCAFFOLDING !== undefined);
        assert.strictEqual(window.BLOCKS[window.BLOCK.SCAFFOLDING].isScaffolding, true);

        const game = new window.Game();
        game.world.generateChunk(0, 0);
        const cs = game.crafting;
        const recipe = cs.recipes.find(r => r.name === "Scaffolding (6)");
        assert.ok(recipe);
        assert.strictEqual(recipe.result.type, window.BLOCK.SCAFFOLDING);

        // Test climbing physics
        game.world.setBlock(8, 40, 8, window.BLOCK.SCAFFOLDING);
        game.player.x = 8.0;
        game.player.y = 40.0;
        game.player.z = 8.0;
        game.controls.jump = true;

        game.player.update(0.016);
        assert.ok(game.player.vy > 0, "Player should climb up inside Scaffolding when holding jump");
    });

    it('Feature 2: Lead item definition, crafting recipe, mob leashing & fence tethering', function() {
        assert.ok(window.BLOCK.ITEM_LEAD !== undefined);

        const game = new window.Game();
        game.world.generateChunk(0, 0);
        const cs = game.crafting;
        const recipe = cs.recipes.find(r => r.name === "Lead (2)");
        assert.ok(recipe);
        assert.strictEqual(recipe.result.type, window.BLOCK.ITEM_LEAD);

        // Test Leashing Mob to Player
        const mob = new window.Mob(game, 10, 40, 10, window.MOB_TYPE.COW);
        assert.strictEqual(mob.leashedToPlayer, false);

        mob.interact(window.BLOCK.ITEM_LEAD);
        assert.strictEqual(mob.leashedToPlayer, true);

        // Test Tethering to Fence
        game.mobs = [mob];
        game.world.setBlock(12, 40, 12, window.BLOCK.FENCE);
        game.interact(12, 40, 12);

        assert.strictEqual(mob.leashedToPlayer, false);
        assert.ok(mob.leashedToFence);
        assert.strictEqual(mob.leashedToFence.x, 12);
    });

    it('Feature 3: Chiseled Resin Bricks definition, texture & crafting recipe', function() {
        assert.ok(window.BLOCK.CHISELED_RESIN_BRICKS !== undefined);
        assert.strictEqual(window.BLOCKS[window.BLOCK.CHISELED_RESIN_BRICKS].name, 'Chiseled Resin Bricks');

        const game = new window.Game();
        const cs = game.crafting;
        const recipe = cs.recipes.find(r => r.name === "Chiseled Resin Bricks");
        assert.ok(recipe);
        assert.strictEqual(recipe.result.type, window.BLOCK.CHISELED_RESIN_BRICKS);

        const tm = new window.TextureManager();
        tm.init();
        const tex = tm.getBlockTexture(window.BLOCK.CHISELED_RESIN_BRICKS);
        assert.ok(tex);
    });

    it('Feature 4: Bundle Item Storage Interactive Draw & Insertion in inventory UI', function() {
        const game = new window.Game();
        const bundleItem = {
            type: window.BLOCK.ITEM_BUNDLE,
            count: 1,
            bundleItems: [],
            bundleCount: 0
        };

        game.player.inventory[0] = bundleItem;
        game.ui.cursorItem = { type: window.BLOCK.ITEM_DIAMOND, count: 10 };

        // Click bundle in inventory with diamonds on cursor
        game.ui.handleInventoryClick(0);

        assert.strictEqual(bundleItem.bundleCount, 10);
        assert.strictEqual(bundleItem.bundleItems.length, 1);
        assert.strictEqual(bundleItem.bundleItems[0].type, window.BLOCK.ITEM_DIAMOND);
        assert.strictEqual(game.ui.cursorItem, null);

        // Click empty cursor onto bundle to eject item stack
        game.ui.handleInventoryClick(0);
        assert.strictEqual(bundleItem.bundleCount, 0);
        assert.ok(game.ui.cursorItem);
        assert.strictEqual(game.ui.cursorItem.type, window.BLOCK.ITEM_DIAMOND);
        assert.strictEqual(game.ui.cursorItem.count, 10);
    });

    it('Feature 5: Camera Head Bobbing Animation & Dynamic Sun/Moon Textures', function() {
        const game = new window.Game();
        game.player.onGround = true;
        game.player.flying = false;
        game.player.walkDistance = 1.5;

        game.ctx.createLinearGradient = () => ({
            addColorStop: () => {}
        });

        const renderer = new window.Renderer(game);
        assert.doesNotThrow(() => {
            renderer.render();
        });
    });
});
