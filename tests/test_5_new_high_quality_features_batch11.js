const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Batch 11 - 5 New High-Quality Features Test Suite', function() {
    this.timeout(10000);
    let dom, window, game;

    beforeEach(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body>
            <canvas id="game-canvas"></canvas>
            <div id="debug-info"></div>
            <div id="chat-container"><input id="chat-input" /><div id="chat-messages"></div></div>
            <div id="mobile-controls" class="hidden"></div>
            <div id="hotbar"></div>
            <div id="health-bar"></div>
            <div id="crafting-screen" class="hidden"><div id="crafting-recipes"></div></div>
        </body></html>`, {
            url: 'http://localhost',
            runScripts: 'dangerously',
            resources: 'usable'
        });
        window = dom.window;

        // Polyfills and mocks for JSDOM
        global.window = window;
        global.document = window.document;
        global.navigator = window.navigator;
        global.localStorage = window.localStorage;
        global.sessionStorage = window.sessionStorage;
        global.HTMLElement = window.HTMLElement;
        global.HTMLCanvasElement = window.HTMLCanvasElement;

        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {},
                clearRect: () => {},
                getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
                putImageData: () => {},
                createImageData: () => ([]),
                setTransform: () => {},
                drawImage: () => {},
                beginPath: () => {},
                moveTo: () => {},
                lineTo: () => {},
                stroke: () => {},
                fill: () => {},
                arc: () => {},
                createLinearGradient: () => ({ addColorStop: () => {} }),
                createPattern: () => ({ setTransform: () => {} })
            };
        };

        window.prompt = () => "TestPlayer";
        window.alert = () => {};

        // Load game scripts in proper order
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
            'js/player.js',
            'js/entity.js',
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

        // Attach exported globals
        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.Game = window.Game;

        window.soundManager = { play: () => {}, updateListener: () => {}, updateAmbience: () => {} };

        game = new window.Game();
        game.world.renderDistance = 1;
        game.world.generateChunk(0, 0);

        // Clear air corridor at Y=30 for unobstructed raycast
        for (let cz = 0; cz <= 15; cz++) {
            game.world.setBlock(10, 30, cz, window.BLOCK.AIR);
        }

        game.player.x = 10.5;
        game.player.y = 28.5;
        game.player.z = 8.5;
    });

    afterEach(function() {
        if (dom) dom.window.close();
    });

    it('Feature 1: Tuff Building Block Family & Crafting', function() {
        const B = window.BLOCK;
        assert.strictEqual(B.POLISHED_TUFF, 526);
        assert.strictEqual(B.TUFF_BRICKS, 527);
        assert.strictEqual(B.SLAB_TUFF, 528);
        assert.strictEqual(B.STAIRS_TUFF, 529);

        assert.ok(window.BLOCKS[B.POLISHED_TUFF]);
        assert.ok(window.BLOCKS[B.TUFF_BRICKS]);
        assert.ok(window.BLOCKS[B.SLAB_TUFF].isSlab);
        assert.ok(window.BLOCKS[B.STAIRS_TUFF].isStair);

        // Verify Texture generation
        const texMgr = new window.TextureManager();
        texMgr.init();
        assert.ok(texMgr.getBlockTexture(B.POLISHED_TUFF));
        assert.ok(texMgr.getBlockTexture(B.TUFF_BRICKS));

        // Test Crafting Recipes
        const recipes = game.crafting.recipes;
        const polishedRecipe = recipes.find(r => r.result.type === B.POLISHED_TUFF);
        const bricksRecipe = recipes.find(r => r.result.type === B.TUFF_BRICKS);
        const slabRecipe = recipes.find(r => r.result.type === B.SLAB_TUFF);
        const stairsRecipe = recipes.find(r => r.result.type === B.STAIRS_TUFF);

        assert.ok(polishedRecipe);
        assert.ok(bricksRecipe);
        assert.ok(slabRecipe);
        assert.ok(stairsRecipe);
    });

    it('Feature 2: Resin Storage Block & Resin Brick Family Expansion', function() {
        const B = window.BLOCK;
        assert.strictEqual(B.RESIN_BLOCK, 523);
        assert.strictEqual(B.STAIRS_RESIN_BRICK, 524);
        assert.strictEqual(B.RESIN_BRICK_WALL, 525);

        assert.ok(window.BLOCKS[B.RESIN_BLOCK]);
        assert.ok(window.BLOCKS[B.STAIRS_RESIN_BRICK].isStair);
        assert.ok(window.BLOCKS[B.RESIN_BRICK_WALL].isFence);

        // Check Texture Manager
        const texMgr = new window.TextureManager();
        texMgr.init();
        assert.ok(texMgr.getBlockTexture(B.RESIN_BLOCK));
        assert.ok(texMgr.getBlockTexture(B.STAIRS_RESIN_BRICK));

        // Test Bi-directional Crafting Recipes
        game.player.inventory[0] = { type: B.ITEM_RESIN_CLUMP, count: 9 };
        const resinBlockRecipeIdx = game.crafting.recipes.findIndex(r => r.result.type === B.RESIN_BLOCK);
        assert.ok(resinBlockRecipeIdx !== -1);

        game.crafting.craft(resinBlockRecipeIdx);
        assert.strictEqual(game.player.inventory[0].type, B.RESIN_BLOCK);
        assert.strictEqual(game.player.inventory[0].count, 1);

        // Convert Resin Block back to 9 Resin Clumps
        const resinClumpsRecipeIdx = game.crafting.recipes.findIndex(r => r.name === "Resin Clumps (9)");
        assert.ok(resinClumpsRecipeIdx !== -1);

        game.crafting.craft(resinClumpsRecipeIdx);
        assert.strictEqual(game.player.inventory[0].type, B.ITEM_RESIN_CLUMP);
        assert.strictEqual(game.player.inventory[0].count, 9);
    });

    it('Feature 3: Suspicious Sand Archaeology Loot Tables & Unearthing Mechanics', function() {
        const B = window.BLOCK;
        game.world.setBlock(10, 30, 10, B.SUSPICIOUS_SAND);
        assert.strictEqual(game.world.getBlock(10, 30, 10), B.SUSPICIOUS_SAND);

        // Equip Brush tool in main hand
        game.player.inventory[0] = { type: B.ITEM_BRUSH, count: 1, durability: 64 };
        game.player.selectedSlot = 0;

        // Position player to look directly at target block
        game.player.x = 10.5;
        game.player.y = 28.5;
        game.player.z = 8.5;
        game.player.yaw = 0;
        game.player.pitch = 0;

        // Perform 4 brush actions to unearth archaeology reward
        for (let i = 0; i < 4; i++) {
            game.startAction(false); // Right-click with brush
        }

        // Suspicious Sand should convert to regular Sand
        assert.strictEqual(game.world.getBlock(10, 30, 10), B.SAND);

        // An archaeology drop should be spawned
        assert.ok(game.drops.length > 0);
        const drop = game.drops[0];
        assert.ok(drop.type !== undefined);
    });

    it('Feature 4: Copper Bulb Oxidation Stages & Dynamic Light Attenuation', function() {
        const B = window.BLOCK;
        assert.strictEqual(B.COPPER_BULB, 411);
        assert.strictEqual(B.EXPOSED_COPPER_BULB, 530);
        assert.strictEqual(B.WEATHERED_COPPER_BULB, 531);
        assert.strictEqual(B.OXIDIZED_COPPER_BULB, 532);

        assert.strictEqual(window.BLOCKS[B.COPPER_BULB].light, 15);
        assert.strictEqual(window.BLOCKS[B.EXPOSED_COPPER_BULB].light, 12);
        assert.strictEqual(window.BLOCKS[B.WEATHERED_COPPER_BULB].light, 8);
        assert.strictEqual(window.BLOCKS[B.OXIDIZED_COPPER_BULB].light, 4);

        // Test Axe scraping interaction to de-oxidize
        game.world.setBlock(10, 30, 10, B.OXIDIZED_COPPER_BULB);
        assert.strictEqual(game.world.getBlock(10, 30, 10), B.OXIDIZED_COPPER_BULB);

        game.player.inventory[0] = { type: B.AXE_IRON, count: 1, durability: 250 };
        game.player.selectedSlot = 0;
        game.player.x = 10.5;
        game.player.y = 28.5;
        game.player.z = 8.5;
        game.player.yaw = 0;
        game.player.pitch = 0;

        game.startAction(false); // Right-click with Axe
        assert.strictEqual(game.world.getBlock(10, 30, 10), B.WEATHERED_COPPER_BULB);

        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 30, 10), B.EXPOSED_COPPER_BULB);

        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 30, 10), B.COPPER_BULB);
    });

    it('Feature 5: Custom Hitbox Debug Overlay', function() {
        assert.strictEqual(game.showHitboxes, undefined);

        // Toggle via input manager KeyB
        game.input.setupEventListeners();
        const event = new window.KeyboardEvent('keydown', { code: 'KeyB' });
        window.document.dispatchEvent(event);

        assert.strictEqual(game.showHitboxes, true);

        // Ensure renderer renders without throwing errors when showHitboxes is enabled
        assert.doesNotThrow(() => {
            game.renderer.render();
        });
    });
});
