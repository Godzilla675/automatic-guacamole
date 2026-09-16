const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const vm = require('vm');

describe('5 New Features Batch 3 Test Suite', function() {
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
            <div id="death-screen" class="hidden"></div>
            <div id="death-coords"></div>
            <button id="respawn-btn"></button>
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

    it('Feature 1: Dark Oak Forest Biome and Wood Set', function() {
        assert.ok(window.BLOCK.DARK_OAK_LOG);
        assert.ok(window.BLOCK.DARK_OAK_PLANK);
        assert.ok(window.BLOCK.DARK_OAK_LEAVES);
        assert.ok(window.BLOCK.DARK_OAK_SAPLING);

        const bm = new window.BiomeManager(54321);
        assert.ok(bm.biomes.DARK_OAK_FOREST);
        assert.strictEqual(bm.biomes.DARK_OAK_FOREST.name, 'Dark Oak Forest');

        const chunk = new window.Chunk(0, 0);
        const sm = new window.StructureManager({
            setBlock: (x, y, z, t) => chunk.setBlock(x % 16, y, z % 16, t),
            getBlock: () => window.BLOCK.AIR
        });
        sm.generateTree(chunk, 4, 10, 4, 'dark_oak');
        assert.strictEqual(chunk.getBlock(4, 10, 4), window.BLOCK.DARK_OAK_LOG);
    });

    it('Feature 2: Pillager Mob Entity AI and Crossbow Weapon', function() {
        assert.ok(window.BLOCK.ITEM_CROSSBOW);
        assert.strictEqual(window.MOB_TYPE.PILLAGER, 'pillager');

        const mockGame = {
            mobs: [],
            world: { getBlock: () => window.BLOCK.AIR },
            physics: { raycast: () => null },
            controls: {},
            player: { x: 10, y: 0, z: 10, height: 1.8 }
        };

        const pillager = new window.Mob(mockGame, 0, 0, 0, window.MOB_TYPE.PILLAGER);
        assert.strictEqual(pillager.type, 'pillager');
        assert.strictEqual(pillager.maxHealth, 24);

        let shotProjectile = false;
        mockGame.spawnProjectile = (x, y, z, dir, type) => {
            if (type === 'arrow') shotProjectile = true;
        };

        pillager.attackCooldown = 0;
        pillager.update(0.1);

        assert.ok(shotProjectile);
    });

    it('Feature 3: Armadillo Mob, Scutes, and Wolf Armor', function() {
        assert.ok(window.BLOCK.ITEM_ARMADILLO_SCUTE);
        assert.ok(window.BLOCK.ITEM_WOLF_ARMOR);
        assert.strictEqual(window.MOB_TYPE.ARMADILLO, 'armadillo');

        const mockGame = {
            drops: [],
            mobs: [],
            world: { getBlock: () => window.BLOCK.AIR },
            physics: { raycast: () => null }
        };

        const armadillo = new window.Mob(mockGame, 0, 0, 0, window.MOB_TYPE.ARMADILLO);
        assert.strictEqual(armadillo.type, 'armadillo');

        armadillo.interact(0);
        assert.strictEqual(mockGame.drops.length, 1);
        assert.strictEqual(mockGame.drops[0].type, window.BLOCK.ITEM_ARMADILLO_SCUTE);

        const wolf = new window.Mob(mockGame, 0, 0, 0, window.MOB_TYPE.WOLF);
        wolf.isTamed = true;
        const initialMaxHealth = wolf.maxHealth;

        wolf.interact(window.BLOCK.ITEM_WOLF_ARMOR);
        assert.ok(wolf.hasWolfArmor);
        assert.strictEqual(wolf.maxHealth, initialMaxHealth + 20);
    });

    it('Feature 4: Sculk Catalyst Block and Sculk Spreading', function() {
        assert.ok(window.BLOCK.SCULK_CATALYST);

        const worldBlocks = new Map();
        const mockGame = {
            world: {
                getBlock: (x, y, z) => worldBlocks.get(`${x},${y},${z}`) || window.BLOCK.AIR,
                setBlock: (x, y, z, t) => worldBlocks.set(`${x},${y},${z}`, t)
            },
            particles: { spawn: () => {} },
            ui: { showNotification: () => {} }
        };

        worldBlocks.set('2,2,2', window.BLOCK.SCULK_CATALYST);
        worldBlocks.set('2,1,2', window.BLOCK.STONE);

        const mob = new window.Mob(mockGame, 2, 2, 2, window.MOB_TYPE.ZOMBIE);
        mockGame.checkSculkCatalyst = function(x, y, z) {
            window.Game.prototype.checkSculkCatalyst.call(this, x, y, z);
        };

        mob.die();
        assert.strictEqual(worldBlocks.get('2,1,2'), window.BLOCK.SCULK_SENSOR);
    });

    it('Feature 5: Death Screen Coordinates HUD & Respawn Anchor Button', function() {
        const mockGame = {
            canvas: { requestPointerLock: () => {} },
            world: {
                getBlock: () => window.BLOCK.AIR,
                getSurfaceHeight: () => 10
            },
            controls: {},
            updateHealthUI: () => {}
        };

        const player = new window.Player(mockGame);
        player.x = 123.4;
        player.y = 45.6;
        player.z = 78.9;

        const ui = new window.UIManager(mockGame);
        mockGame.ui = ui;
        mockGame.player = player;
        ui.init();

        player.takeDamage(100);

        const screen = document.getElementById('death-screen');
        const coords = document.getElementById('death-coords');

        assert.ok(!screen.classList.contains('hidden'));
        assert.ok(coords.textContent.includes('X: 123'));
        assert.ok(coords.textContent.includes('Y: 45'));
        assert.ok(coords.textContent.includes('Z: 78'));

        const respawnBtn = document.getElementById('respawn-btn');
        respawnBtn.click();

        assert.ok(screen.classList.contains('hidden'));
        assert.strictEqual(player.health, player.maxHealth);
    });
});
