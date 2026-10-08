const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Audit Fixes Batch 2 Test Suite', function() {
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
            <div id="crafter-screen" class="hidden"></div>
            <div id="crafter-grid"></div>
            <div id="chest-screen" class="hidden"></div>
            <div id="chest-grid"></div>
            <div id="inventory-grid"></div>
            <div id="armor-grid"></div>
            <div id="offhand-container"></div>
            <div id="chat-messages"></div>
            <input id="chat-input" type="text" />
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
        global.BiomeManager = window.BiomeManager;
        loadScript('js/village.js');
        loadScript('js/structures.js');
        global.StructureManager = window.StructureManager;
        loadScript('js/world.js');
        global.World = window.World;
        loadScript('js/physics.js');
        global.Physics = window.Physics;
        loadScript('js/player.js');
        global.Player = window.Player;
        loadScript('js/vehicle.js');
        loadScript('js/textures.js');
        global.TextureManager = window.TextureManager;
        loadScript('js/crafting.js');
        global.CraftingSystem = window.CraftingSystem;
        loadScript('js/ui.js');
        global.UIManager = window.UIManager;
        loadScript('js/chat.js');
        global.ChatManager = window.ChatManager;
        loadScript('js/input.js');
        global.InputManager = window.InputManager;
        loadScript('js/renderer.js');
        global.Renderer = window.Renderer;
        loadScript('js/network.js');
        global.NetworkManager = window.NetworkManager;
        loadScript('js/plugin.js');
        loadScript('js/minimap.js');
        loadScript('js/achievements.js');
        loadScript('js/tutorial.js');
        loadScript('js/game.js');
        global.Game = window.Game;

        game = new window.Game();
        game.ui.init();
    });

    it('Fix 1: openCrafter handles undefined or null entity without TypeError', function() {
        assert.doesNotThrow(() => {
            game.ui.openCrafter();
        }, 'openCrafter() without arguments should not throw TypeError');

        assert.ok(game.ui.activeCrafter, 'activeCrafter set');
        assert.strictEqual(game.ui.activeCrafter.items.length, 9, 'Crafter has 9 item slots');
        assert.strictEqual(game.ui.activeCrafter.disabledSlots.length, 9, 'Crafter has 9 disabled slots');

        assert.doesNotThrow(() => {
            game.ui.openCrafter(null);
        }, 'openCrafter(null) should not throw TypeError');
    });

    it('Fix 2: Interacting with Ominous Vault consumes Ominous Trial Key from main hand', function() {
        const chunk = new window.Chunk(0, 0);
        game.world.chunks.set('0,0', chunk);
        chunk.setBlock(5, 10, 5, window.BLOCK.OMINOUS_VAULT);

        game.player.selectedSlot = 0;
        game.player.inventory[0] = { type: window.BLOCK.ITEM_OMINOUS_TRIAL_KEY, count: 1 };

        const handled = game.interact(5, 10, 5);
        assert.strictEqual(handled, true, 'Vault interaction handled');

        // Key is consumed and loot item added to inventory
        const hasKey = game.player.inventory.some(i => i && i.type === window.BLOCK.ITEM_OMINOUS_TRIAL_KEY);
        assert.strictEqual(hasKey, false, 'Ominous Trial Key consumed completely');
        assert.ok(game.player.inventory[0], 'Loot reward added to player inventory');
        assert.notStrictEqual(game.player.inventory[0].type, window.BLOCK.ITEM_OMINOUS_TRIAL_KEY, 'Slot 0 contains reward loot, not key');
    });

    it('Fix 3: Interacting with Ominous Vault consumes Ominous Trial Key from offhand', function() {
        const chunk = new window.Chunk(0, 0);
        game.world.chunks.set('0,0', chunk);
        chunk.setBlock(5, 10, 5, window.BLOCK.OMINOUS_VAULT);

        game.player.selectedSlot = 0;
        game.player.inventory[0] = null;
        game.player.offhand = { type: window.BLOCK.ITEM_OMINOUS_TRIAL_KEY, count: 1 };

        const handled = game.interact(5, 10, 5);
        assert.strictEqual(handled, true, 'Vault interaction handled');
        assert.strictEqual(game.player.offhand, null, 'Ominous Trial Key consumed from offhand slot');
        assert.ok(game.player.inventory[0], 'Loot reward added to player inventory');
    });

    it('Fix 4: Interacting with Trial Vault consumes Trial Key from main hand', function() {
        const chunk = new window.Chunk(0, 0);
        game.world.chunks.set('0,0', chunk);
        chunk.setBlock(6, 10, 6, window.BLOCK.TRIAL_VAULT);

        game.player.selectedSlot = 0;
        game.player.inventory[0] = { type: window.BLOCK.ITEM_TRIAL_KEY, count: 1 };

        const handled = game.interact(6, 10, 6);
        assert.strictEqual(handled, true, 'Vault interaction handled');

        const hasKey = game.player.inventory.some(i => i && i.type === window.BLOCK.ITEM_TRIAL_KEY);
        assert.strictEqual(hasKey, false, 'Trial Key consumed completely');
        assert.ok(game.player.inventory[0], 'Loot reward added to player inventory');
        assert.notStrictEqual(game.player.inventory[0].type, window.BLOCK.ITEM_TRIAL_KEY, 'Slot 0 contains reward loot, not key');
    });
});
