const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Batch 12 - 5 New High-Quality Features Test Suite', function () {
    this.timeout(30000);
    let dom;
    let window;
    let document;
    let game;

    beforeEach(function () {
        dom = new JSDOM(`<!DOCTYPE html>
        <html>
        <head></head>
        <body>
            <canvas id="game-canvas"></canvas>
            <div id="hotbar"></div>
            <div id="health-bar"></div>
            <div id="hunger-bar"></div>
            <div id="xp-bar"></div>
            <div id="xp-level"></div>
            <div id="damage-overlay"></div>
            <div id="crosshair"></div>
            <div id="chat-container"><input id="chat-input" /><div id="chat-messages"></div></div>
            <div id="notifications-container"></div>
            <div id="inventory-screen" class="hidden"></div>
            <div id="inventory-grid"></div>
            <div id="armor-grid"></div>
            <div id="offhand-container"></div>
            <div id="crafter-screen" class="hidden"></div>
            <div id="crafter-grid"></div>
        </body>
        </html>`, {
            url: 'http://localhost',
            referrer: 'http://localhost',
            contentType: 'text/html',
            runScripts: 'dangerously',
            resources: 'usable'
        });

        window = dom.window;
        document = window.document;

        global.window = window;
        global.document = document;
        global.navigator = window.navigator;
        global.localStorage = window.localStorage;
        global.sessionStorage = window.sessionStorage;
        global.Image = window.Image;
        global.HTMLCanvasElement = window.HTMLCanvasElement;

        // Mock HTMLCanvasElement 2D context
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
        if (window.HTMLCanvasElement.prototype) {
            window.HTMLCanvasElement.prototype.requestPointerLock = () => {};
        }

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

        game = new window.Game();
        // Generate test chunks
        game.world.generateChunk(0, 0);
        game.world.generateChunk(1, 1);
        game.world.generateChunk(2, 2);
    });

    afterEach(function () {
        if (dom) dom.window.close();
    });

    it('Feature 1: Sculk Catalyst Charge Absorption & Sculk Propagation', function () {
        const catX = 10, catY = 10, catZ = 10;
        game.world.setBlock(catX, catY, catZ, window.BLOCK.SCULK_CATALYST);

        // Place stone around catalyst
        game.world.setBlock(catX + 1, catY, catZ, window.BLOCK.STONE);
        game.world.setBlock(catX - 1, catY, catZ, window.BLOCK.DIRT);
        game.world.setBlock(catX, catY, catZ + 1, window.BLOCK.GRASS);

        // Trigger sculk catalyst checking on mob death nearby
        game.checkSculkCatalyst(catX + 2, catY, catZ + 2);

        // Verify terrain converted to Sculk Sensor
        const b1 = game.world.getBlock(catX + 1, catY, catZ);
        const b2 = game.world.getBlock(catX - 1, catY, catZ);
        const b3 = game.world.getBlock(catX, catY, catZ + 1);

        assert.strictEqual(b1, window.BLOCK.SCULK_SENSOR);
        assert.strictEqual(b2, window.BLOCK.SCULK_SENSOR);
        assert.strictEqual(b3, window.BLOCK.SCULK_SENSOR);
    });

    it('Feature 2: Vault & Ominous Vault Player UUID Locking & Cooldown', function () {
        const vx = 20, vy = 10, vz = 20;
        game.world.setBlock(vx, vy, vz, window.BLOCK.TRIAL_VAULT);

        game.player.name = 'TestPlayer1';
        game.player.inventory[0] = { type: window.BLOCK.ITEM_TRIAL_KEY, count: 2 };
        game.player.selectedSlot = 0;

        // First unlock
        const handledFirst = game.interact(vx, vy, vz);
        assert.strictEqual(handledFirst, true);
        assert.strictEqual(game.player.inventory[0].count, 1);

        const entity = game.world.getBlockEntity(vx, vy, vz);
        assert.ok(entity);
        assert.ok(entity.openedPlayers.includes('TestPlayer1'));

        // Second unlock attempt by same player should be blocked
        const handledSecond = game.interact(vx, vy, vz);
        assert.strictEqual(handledSecond, true);
        // Key count should remain 1
        assert.strictEqual(game.player.inventory[0].count, 1);
    });

    it('Feature 3: Crafter Block UI Item Disabling Visual Grid', function () {
        const crafterEntity = {
            type: 'crafter',
            items: new Array(9).fill(null),
            disabledSlots: [true, false, false, false, true, false, false, false, false]
        };

        game.ui.openCrafter(crafterEntity);

        const crafterGrid = document.getElementById('crafter-grid');
        assert.ok(crafterGrid);

        const disabledSlotsUI = crafterGrid.querySelectorAll('.disabled-slot');
        assert.strictEqual(disabledSlotsUI.length, 2);
        assert.ok(disabledSlotsUI[0].classList.contains('crafter-slot'));
    });

    it('Feature 4: Creaking Heart Ember Particle Connection & Nighttime Activation', function () {
        const hx = 30, hy = 10, hz = 30;
        game.world.setBlock(hx, hy, hz, window.BLOCK.CREAKING_HEART);
        game.world.setBlockEntity(hx, hy, hz, { type: 'creaking_heart' });

        // Set night time
        game.gameTime = game.dayLength * 0.6;
        game.frameCount = 40;

        game.update(16);

        // Check spawned Creaking mob
        const creaking = game.mobs.find(m => m.type === window.MOB_TYPE.CREAKING);
        assert.ok(creaking);
        assert.strictEqual(creaking.linkedHeartPos.x, hx);
        assert.strictEqual(creaking.linkedHeartPos.y, hy);
        assert.strictEqual(creaking.linkedHeartPos.z, hz);

        // Update Creaking mob AI
        let particleSpawned = false;
        game.particles = {
            spawn: (px, py, pz, color) => {
                if (color === '#FF6600') particleSpawned = true;
            }
        };

        for (let i = 0; i < 20; i++) {
            creaking.updateCreakingAI(0.016);
            if (particleSpawned) break;
        }
        assert.ok(particleSpawned);
    });

    it('Feature 5: Pale Oak Sapling Bone-Meal Tree Growth Mechanics', function () {
        const sx = 12, sy = 10, sz = 12;
        game.world.setBlock(sx, sy - 1, sz, window.BLOCK.DIRT);
        game.world.setBlock(sx, sy, sz, window.BLOCK.PALE_OAK_SAPLING);

        game.player.inventory[0] = { type: window.BLOCK.ITEM_BONE, count: 1 };
        game.player.selectedSlot = 0;

        // Raycast hit target block
        game.physics.raycast = () => ({ x: sx, y: sy, z: sz, face: { x: 0, y: 1, z: 0 }, dist: 2 });

        game.startAction(false); // Right click with bone meal

        // Check sapling transformed into Pale Oak Log trunk
        const blockAfter = game.world.getBlock(sx, sy, sz);
        assert.strictEqual(blockAfter, window.BLOCK.PALE_OAK_LOG);
        assert.strictEqual(game.player.inventory[0], null); // Bone meal consumed
    });
});
