const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('Offhand Quick Swap & Container Selection Fix', function () {
    let window, document, game;

    beforeEach(function () {
        delete require.cache[require.resolve('../js/blocks.js')];
        delete require.cache[require.resolve('../js/player.js')];
        delete require.cache[require.resolve('../js/ui.js')];

        const dom = new JSDOM(`<!DOCTYPE html><html><body>
            <div id="hotbar"></div>
            <div id="inventory-grid"></div>
            <div id="armor-grid"></div>
            <div id="offhand-container"></div>
            <div id="chest-screen" class="hidden"><div id="chest-grid"></div></div>
            <div id="furnace-screen" class="hidden"></div>
            <div id="anvil-screen" class="hidden"></div>
            <div id="inventory-screen" class="hidden"></div>
        </body></html>`, { url: 'http://localhost' });

        window = dom.window;
        document = window.document;
        document.exitPointerLock = () => {};
        global.window = window;
        global.document = document;

        // Load game classes
        require('../js/blocks.js');
        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;

        require('../js/player.js');
        require('../js/ui.js');

        game = {
            player: new window.Player({}),
            controls: {},
            isMobile: false,
            canvas: { requestPointerLock: () => {} }
        };
        game.player.game = game;
        game.ui = new window.UIManager(game);
        game.player.game.ui = game.ui;
        game.ui.init();
    });

    it('should flush cursor item back to player inventory when closing chest container', function () {
        const heldItem = { type: window.BLOCK.DIAMOND, count: 5 };
        game.ui.cursorItem = heldItem;

        game.ui.openChest({ items: new Array(27).fill(null) });
        game.ui.closeChest();

        assert.strictEqual(game.ui.cursorItem, null);
        const invItem = game.player.inventory.find(item => item && item.type === window.BLOCK.DIAMOND);
        assert.ok(invItem);
        assert.strictEqual(invItem.count, 5);
    });

    it('should update inventory and cursor state during offhand swap', function () {
        game.player.inventory[0] = { type: window.BLOCK.SHIELD, count: 1 };
        game.player.selectedSlot = 0;
        game.player.offhand = { type: window.BLOCK.TORCH, count: 16 };

        game.player.swapOffhand();

        assert.strictEqual(game.player.inventory[0].type, window.BLOCK.TORCH);
        assert.strictEqual(game.player.offhand.type, window.BLOCK.SHIELD);
    });
});
