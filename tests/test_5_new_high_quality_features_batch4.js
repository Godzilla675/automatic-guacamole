const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('5 New High Quality Features Batch 4 Test Suite', function() {
    let dom;
    let window;
    let game;

    beforeEach(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body>
            <div id="hotbar"></div>
            <div id="health-bar"></div>
            <div id="hunger-bar"></div>
            <div id="xp-bar"></div>
            <div id="xp-level"></div>
            <div id="crafting-screen" class="hidden"></div>
            <div id="recipe-book-screen" class="hidden"></div>
            <div id="inventory-screen" class="hidden"></div>
            <div id="smithing-screen" class="hidden"></div>
            <div id="smithing-template"></div>
            <div id="smithing-base"></div>
            <div id="smithing-addition"></div>
            <div id="smithing-output"></div>
            <div id="inventory-grid"></div>
            <div id="armor-grid"></div>
            <div id="offhand-container"></div>
            <canvas id="game-canvas"></canvas>
        </body></html>`, { url: 'http://localhost' });

        window = dom.window;
        window.document.exitPointerLock = () => {};
        global.window = window;
        global.document = window.document;
        global.localStorage = window.localStorage;

        const loadScript = (filePath) => {
            const code = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
            eval(code);
        };

        global.Entity = class Entity {
            constructor(game, x, y, z) {
                this.game = game;
                this.x = x || 0;
                this.y = y || 0;
                this.z = z || 0;
                this.vx = 0;
                this.vy = 0;
                this.vz = 0;
                this.isDead = false;
            }
        };

        loadScript('js/blocks.js');
        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        loadScript('js/entity.js');
        loadScript('js/drop.js');
        loadScript('js/chunk.js');
        loadScript('js/math.js');
        loadScript('js/biome.js');
        loadScript('js/village.js');
        loadScript('js/structures.js');
        loadScript('js/world.js');
        loadScript('js/physics.js');
        loadScript('js/player.js');
        loadScript('js/vehicle.js');
        loadScript('js/textures.js');
        loadScript('js/crafting.js');
        loadScript('js/ui.js');

        // Mock Game
        game = {
            world: new window.World(),
            physics: {
                getCollidingBlocks: () => [],
                checkCollision: () => false,
                getFluidIntersection: () => false
            },
            controls: { forward: false, backward: false, left: false, right: false, jump: false, sneak: false },
            drops: [],
            ui: null
        };
        game.world.game = game;
        game.player = new window.Player(game);
        game.ui = new window.UIManager(game);
        game.crafting = new window.CraftingSystem(game);
        game.ui.init();
    });

    it('Feature 1: Elytra Gliding Physics and Firework Speed Boost', function() {
        assert.ok(window.BLOCK.ITEM_ELYTRA, 'ITEM_ELYTRA defined');
        game.player.inventory[0] = { type: window.BLOCK.ITEM_ELYTRA, count: 1 };
        game.player.onGround = false;
        game.player.vy = -5.0;

        // Toggle gliding
        game.controls.jump = true;
        game.player.wasJumpDown = false;
        game.player.update(0.1);

        assert.strictEqual(game.player.gliding, true, 'Player should enter gliding mode');

        // Firework boost
        const boosted = game.player.fireworkBoost();
        assert.strictEqual(boosted, true, 'Firework boost executed');
        assert.ok(Math.hypot(game.player.vx, game.player.vz) > 10, 'Player received forward momentum boost');
    });

    it('Feature 2: Flying Carpet Equipment and Hovering', function() {
        assert.ok(window.BLOCK.ITEM_FLYING_CARPET, 'ITEM_FLYING_CARPET defined');
        const carpet = new window.FlyingCarpet(game, 10, 20, 10);
        carpet.interact(game.player);

        assert.strictEqual(game.player.riding, carpet, 'Player mounted Flying Carpet');

        game.controls.forward = true;
        carpet.update(0.1);

        assert.ok(carpet.vx !== 0 || carpet.vz !== 0, 'Carpet moves with player controls');
        assert.strictEqual(carpet.vy, 0, 'Carpet hovers in place without vertical keys');
    });

    it('Feature 3: Armor Trims & Smithing Templates in Smithing Table', function() {
        assert.ok(window.BLOCK.ITEM_SMITHING_TEMPLATE, 'ITEM_SMITHING_TEMPLATE defined');
        game.player.inventory = new Array(36).fill(null);
        game.ui.openSmithingTable();

        game.ui.activeSmithingTable.template = { type: window.BLOCK.ITEM_SMITHING_TEMPLATE, count: 1 };
        game.ui.activeSmithingTable.base = { type: window.BLOCK.ITEM_CHESTPLATE_DIAMOND, count: 1 };
        game.ui.activeSmithingTable.addition = { type: window.BLOCK.ITEM_EMERALD, count: 1 };

        game.ui.updateSmithingUI();
        assert.ok(game.ui.activeSmithingTable.output, 'Smithing output generated');
        assert.ok(game.ui.activeSmithingTable.output.trimmed, 'Output marked as trimmed armor');

        game.ui.handleSmithingClick('smithing-output');
        assert.strictEqual(game.player.inventory[0].trimmed, true, 'Trimmed armor added to inventory');
    });

    it('Feature 4: Ominous Vault & Ominous Trial Key Unlocking', function() {
        assert.ok(window.BLOCK.OMINOUS_VAULT, 'OMINOUS_VAULT defined');
        assert.ok(window.BLOCK.ITEM_OMINOUS_TRIAL_KEY, 'ITEM_OMINOUS_TRIAL_KEY defined');

        const chunk = new window.Chunk(0, 0);
        game.world.chunks.set('0,0', chunk);

        game.player.inventory[0] = { type: window.BLOCK.ITEM_OMINOUS_TRIAL_KEY, count: 1 };
        game.player.selectedSlot = 0;

        // Set block triggers interaction/unlocking if key held
        game.world.setBlock(0, 5, 0, window.BLOCK.OMINOUS_VAULT);

        assert.strictEqual(game.drops.length, 1, 'Reward item dropped from Ominous Vault');
    });

    it('Feature 5: Trial Chamber Underground Structure Generation', function() {
        this.timeout(10000);
        const chunk = new window.Chunk(0, 0);
        game.world.chunks.set('0,0', chunk);

        game.world.structureManager.generateTrialChamber(chunk, 8, 30, 8);

        assert.strictEqual(game.world.getBlock(8, 30, 8), window.BLOCK.CHISELED_TUFF, 'Floor generated as Chiseled Tuff');
        assert.strictEqual(game.world.getBlock(8, 31, 8), window.BLOCK.TRIAL_SPAWNER, 'Trial Spawner placed in center');
        assert.strictEqual(game.world.getBlock(10, 31, 10), window.BLOCK.OMINOUS_VAULT, 'Ominous Vault placed in room');
    });
});
