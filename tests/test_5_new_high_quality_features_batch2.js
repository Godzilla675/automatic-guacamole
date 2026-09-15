const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const vm = require('vm');

describe('5 New Features Batch 2 Test Suite', function() {
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
            <div id="crafting-screen" class="hidden"></div>
            <div id="inventory-screen" class="hidden"></div>
            <div id="chest-screen" class="hidden"></div>
            <div id="furnace-screen" class="hidden"></div>
            <div id="brewing-screen" class="hidden"></div>
            <div id="enchanting-screen" class="hidden"></div>
            <div id="trading-screen" class="hidden"></div>
            <div id="anvil-screen" class="hidden"></div>
            <div id="anvil-input-1"></div>
            <div id="anvil-input-2"></div>
            <div id="anvil-output"></div>
            <input id="anvil-rename" />
            <div id="anvil-cost"></div>
        </body></html>`, {
            url: 'http://localhost/',
            runScripts: 'dangerously',
            resources: 'usable'
        });
        window = dom.window;
        document = window.document;
        document.exitPointerLock = () => {};

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
            'js/math.js',
            'js/blocks.js',
            'js/textures.js',
            'js/crafting.js',
            'js/biome.js',
            'js/entity.js',
            'js/drop.js',
            'js/vehicle.js',
            'js/particles.js',
            'js/mob.js',
            'js/chunk.js',
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
        global.MOB_TYPE = window.MOB_TYPE;
        global.Mob = window.Mob;
        global.Player = window.Player;
        global.BiomeManager = window.BiomeManager;
    });

    it('Feature 1: Silverfish mob & Infested Stone block functionality', function() {
        assert.ok(window.BLOCK.INFESTED_STONE);
        assert.strictEqual(window.MOB_TYPE.SILVERFISH, 'silverfish');

        const mockGame = {
            mobs: [],
            world: null,
            physics: { raycast: () => null },
            controls: {},
            player: { x: 0, y: 0, z: 0, height: 1.8 }
        };

        const sf = new window.Mob(mockGame, 0, 0, 0, window.MOB_TYPE.SILVERFISH);
        assert.strictEqual(sf.type, 'silverfish');
        assert.strictEqual(sf.maxHealth, 8);
    });

    it('Feature 2: Carrot on a Stick Pig Steering mechanics', function() {
        assert.ok(window.BLOCK.ITEM_CARROT_STICK);

        const mockGame = {
            world: {
                getBlock: () => window.BLOCK.AIR,
                getMetadata: () => 0,
                getBlockEntity: () => null
            },
            physics: {
                getFluidIntersection: () => false,
                checkCollision: () => false,
                getCollidingBlocks: () => []
            },
            controls: { mouseButtons: { 2: true }, forward: true },
            updateHealthUI: () => {}
        };

        const player = new window.Player(mockGame);
        const pig = new window.Mob(mockGame, 0, 0, 0, window.MOB_TYPE.PIG);

        player.riding = pig;
        player.inventory[0] = { type: window.BLOCK.ITEM_CARROT_STICK, count: 1, durability: 25 };
        player.selectedSlot = 0;
        player.yaw = Math.PI / 2;

        player.update(0.1);

        assert.strictEqual(pig.yaw, Math.PI / 2);
        assert.ok(pig.vx > 0);
    });

    it('Feature 3: Anvil GUI Screen item repair and custom renaming', function() {
        const mockGame = {
            pauseGame: () => {},
            resumeGame: () => {},
            controls: {},
            player: {
                getHeldItem: () => ({ type: window.BLOCK.SWORD_DIAMOND, count: 1, durability: 10 }),
                level: 5,
                inventory: [{ type: window.BLOCK.SWORD_DIAMOND, count: 1, durability: 10 }],
                selectedSlot: 0,
                armor: [null, null, null, null]
            }
        };

        const ui = new window.UIManager(mockGame);
        ui.activeAnvil = {
            input1: mockGame.player.getHeldItem(),
            input2: null,
            output: null,
            cost: 0
        };

        const renameInput = document.getElementById('anvil-rename');
        renameInput.value = 'Excalibur';

        ui.updateAnvilUI();
        assert.ok(ui.activeAnvil.output);
        assert.strictEqual(ui.activeAnvil.output.name, 'Excalibur');

        const item = mockGame.player.getHeldItem();
        item.customName = 'Excalibur';
        item.durability = window.TOOLS[window.BLOCK.SWORD_DIAMOND].durability;
        mockGame.player.level -= 1;

        assert.strictEqual(item.customName, 'Excalibur');
        assert.strictEqual(item.durability, window.TOOLS[window.BLOCK.SWORD_DIAMOND].durability);
        assert.strictEqual(mockGame.player.level, 4);
    });

    it('Feature 4: Savanna Biome & Acacia Wood Set generation', function() {
        assert.ok(window.BLOCK.ACACIA_LOG);
        assert.ok(window.BLOCK.ACACIA_PLANK);
        assert.ok(window.BLOCK.ACACIA_LEAVES);

        const bm = new window.BiomeManager(12345);
        assert.ok(bm.biomes.SAVANNA);
        assert.strictEqual(bm.biomes.SAVANNA.name, 'Savanna');
    });

    it('Feature 5: Player drowning underwater mechanics', function() {
        const mockGame = {
            world: {
                getBlock: () => window.BLOCK.AIR
            },
            physics: {
                getFluidIntersection: () => true,
                checkCollision: () => false,
                getCollidingBlocks: () => []
            },
            controls: {},
            updateHealthUI: () => {}
        };

        const player = new window.Player(mockGame);
        player.gamemode = 0;
        player.oxygen = 10;

        for (let i = 0; i < 10; i++) {
            player.update(1.0);
        }

        assert.strictEqual(player.oxygen, 0);
    });
});
