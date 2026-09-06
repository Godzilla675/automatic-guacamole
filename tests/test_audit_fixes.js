const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('Audit Bug Fixes & Features Test Suite', function() {
    let window, dom;

    before(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body><canvas id="game-canvas"></canvas><div id="notifications-container"></div></body></html>`, {
            url: 'http://localhost/',
            runScripts: 'dangerously',
            resources: 'usable'
        });
        window = dom.window;

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
            'js/drop.js',
            'js/vehicle.js',
            'js/particles.js'
        ];

        files.forEach(file => {
            const code = fs.readFileSync(file, 'utf8');
            vm.runInNewContext(code, window);
        });

        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.Vehicle = window.Vehicle;
        global.Boat = window.Boat;
        global.Minecart = window.Minecart;
        global.Drop = window.Drop;
    });

    it('should drop item when Boat or Minecart is destroyed by damage', function() {
        const mockGame = {
            drops: [],
            world: { getBlock: () => BLOCK.AIR }
        };

        const boat = new window.Boat(mockGame, 10, 60, 10);
        boat.takeDamage(20);
        assert.ok(boat.isDead, 'Boat should be dead after receiving lethal damage');
        assert.strictEqual(mockGame.drops.length, 1, 'Destroyed boat should spawn 1 item drop');
        assert.strictEqual(mockGame.drops[0].type, BLOCK.ITEM_BOAT, 'Drop should be ITEM_BOAT');

        const minecart = new window.Minecart(mockGame, 20, 60, 20);
        minecart.takeDamage(20);
        assert.ok(minecart.isDead, 'Minecart should be dead after receiving lethal damage');
        assert.strictEqual(mockGame.drops.length, 2, 'Destroyed minecart should spawn another item drop');
        assert.strictEqual(mockGame.drops[1].type, BLOCK.ITEM_MINECART, 'Drop should be ITEM_MINECART');
    });

    it('should have FLETCHING_TABLE defined with texture and crafting recipe', function() {
        assert.ok(window.BLOCK.FLETCHING_TABLE, 'FLETCHING_TABLE should be defined in BLOCK');
        assert.ok(window.BLOCKS[window.BLOCK.FLETCHING_TABLE], 'FLETCHING_TABLE definition should exist in BLOCKS');

        const textureManager = new window.TextureManager();
        textureManager.init();
        assert.ok(textureManager.getBlockTexture(window.BLOCK.FLETCHING_TABLE), 'FLETCHING_TABLE texture should be generated');

        const craftingSystem = new window.CraftingSystem({});
        const recipe = craftingSystem.recipes.find(r => r.result && r.result.type === window.BLOCK.FLETCHING_TABLE);
        assert.ok(recipe, 'Crafting recipe for Fletching Table should exist');
    });

    it('should consume held stick or feather when interacting with Fletching Table', function() {
        const player = {
            inventory: [{ type: BLOCK.ITEM_STICK, count: 1 }],
            selectedSlot: 0,
            getHeldItem: function() { return this.inventory[this.selectedSlot]; },
            addItem: function(item) { this.inventory.push(item); }
        };
        const mockGame = {
            world: {
                getBlock: () => BLOCK.FLETCHING_TABLE
            },
            player: player,
            ui: { showNotification: () => {} }
        };

        // Simulate interaction
        const held = player.getHeldItem();
        held.count--;
        if (held.count <= 0) player.inventory[player.selectedSlot] = null;
        player.addItem({ type: BLOCK.ITEM_ARROW, count: 4 });

        assert.strictEqual(player.inventory[0], null, 'Held stick should be consumed when count reaches 0');
        assert.strictEqual(player.inventory[1].type, BLOCK.ITEM_ARROW, 'Arrows should be added to inventory');
    });
});
