const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Batch 14: 5 New High Quality Features Test Suite', function() {
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
            <div id="chest-screen" class="hidden"><div id="chest-grid"></div></div>
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
                strokeRect: () => {},
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
                createLinearGradient: () => ({ addColorStop: () => {} }),
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
        global.ChestBoat = window.ChestBoat;

        window.soundManager = { play: () => {}, updateListener: () => {}, updateAmbience: () => {} };
    });

    afterEach(function() {
        if (dom) dom.window.close();
    });

    it('Feature 1: Block Breaking Mining Cracking Overlay Animation', function() {
        const game = new window.Game();
        game.player.x = 10;
        game.player.y = 10;
        game.player.z = 10;

        game.world.setBlock(12, 10, 10, window.BLOCK.STONE);

        // Start breaking
        game.breaking = {
            x: 12, y: 10, z: 10,
            progress: 0.5,
            limit: 1.0,
            lastTick: Date.now()
        };

        assert.strictEqual(game.breaking.x, 12);
        assert.strictEqual(game.breaking.y, 10);
        assert.strictEqual(game.breaking.z, 10);

        const pct = Math.min(1, game.breaking.progress / game.breaking.limit);
        const stage = Math.min(9, Math.floor(pct * 10));
        assert.strictEqual(stage, 5, 'Stage should equal 5 at 50% mining progress');

        // Test rendering pass doesn't crash
        assert.doesNotThrow(() => {
            game.renderer.render();
        });
    });

    it('Feature 2: Pale Hanging Moss Foliage & Canopy Generation', function() {
        assert.ok(window.BLOCK.PALE_HANGING_MOSS, 'PALE_HANGING_MOSS block should be defined');
        assert.ok(window.BLOCK.PALE_MOSS_CARPET, 'PALE_MOSS_CARPET block should be defined');

        const world = new window.World();
        const chunk = world.generateChunk(0, 0) || world.getChunk(0, 0);

        // Generate Pale Oak tree above ground at Y=80
        world.structureManager.generateTree(chunk, 5, 80, 5, 'pale_oak');

        // Check if tree trunk and hanging moss exist
        assert.strictEqual(world.getBlock(5, 80, 5), window.BLOCK.PALE_OAK_LOG, 'Trunk should be Pale Oak Log');

        let foundMoss = false;
        for (let x = 3; x <= 7; x++) {
            for (let z = 3; z <= 7; z++) {
                for (let y = 78; y <= 88; y++) {
                    if (world.getBlock(x, y, z) === window.BLOCK.PALE_HANGING_MOSS) {
                        foundMoss = true;
                        break;
                    }
                }
            }
        }
        assert.ok(foundMoss, 'Pale Hanging Moss should generate under Pale Oak canopy');
    });

    it('Feature 3: Vertical Slabs Placement & Block Family', function() {
        assert.ok(window.BLOCK.SLAB_WOOD_VERTICAL, 'SLAB_WOOD_VERTICAL should be defined');
        assert.ok(window.BLOCK.SLAB_STONE_VERTICAL, 'SLAB_STONE_VERTICAL should be defined');

        const game = new window.Game();
        game.world.generateChunk(0, 0);
        game.player.x = 8.0;
        game.player.y = 80.0;
        game.player.z = 10.5;
        game.player.yaw = Math.PI / 2; // Look East (+X)
        game.player.pitch = 0;

        // Give player wood slab in hotbar
        game.player.inventory[0] = { type: window.BLOCK.SLAB_WOOD, count: 64 };
        game.player.selectedSlot = 0;

        // Clear player path and target placement block to AIR at Y=81
        for (let x = 8; x <= 11; x++) {
            game.world.setBlock(x, 81, 10, window.BLOCK.AIR);
        }
        game.world.setBlock(12, 81, 10, window.BLOCK.STONE);

        // Call placeBlock logic
        game.placeBlock();

        const placedBlock = game.world.getBlock(11, 81, 10);
        assert.strictEqual(placedBlock, window.BLOCK.SLAB_WOOD_VERTICAL, 'Placing slab on side face should convert to vertical slab variant');
    });

    it('Feature 4: Amethyst Geode Subterranean World Generation', function() {
        assert.ok(window.BLOCK.CALCITE, 'CALCITE should be defined');
        assert.ok(window.BLOCK.SMOOTH_BASALT, 'SMOOTH_BASALT should be defined');
        assert.ok(window.BLOCK.AMETHYST_CLUSTER, 'AMETHYST_CLUSTER should be defined');

        const world = new window.World();
        const chunk = world.generateChunk(0, 0) || world.getChunk(0, 0);

        // Generate Amethyst Geode at subterranean Y=20
        world.structureManager.generateAmethystGeode(chunk, 8, 20, 8);

        let foundBasalt = false;
        let foundCalcite = false;
        let foundAmethystBlock = false;

        for (let x = 4; x <= 12; x++) {
            for (let y = 16; y <= 24; y++) {
                for (let z = 4; z <= 12; z++) {
                    const b = world.getBlock(x, y, z);
                    if (b === window.BLOCK.SMOOTH_BASALT) foundBasalt = true;
                    if (b === window.BLOCK.CALCITE) foundCalcite = true;
                    if (b === window.BLOCK.AMETHYST_BLOCK) foundAmethystBlock = true;
                }
            }
        }

        assert.ok(foundBasalt, 'Geode outer shell should contain Smooth Basalt');
        assert.ok(foundCalcite, 'Geode middle layer should contain Calcite');
        assert.ok(foundAmethystBlock, 'Geode inner layer should contain Amethyst Blocks');
    });

    it('Feature 5: Chest Boats Vehicle Entities & Container Storage UI', function() {
        assert.ok(window.BLOCK.ITEM_CHEST_BOAT, 'ITEM_CHEST_BOAT should be defined');
        assert.ok(window.ChestBoat, 'ChestBoat class should be exported');

        const game = new window.Game();
        const chestBoat = new window.ChestBoat(game, 10, 10, 10, 'oak');

        assert.strictEqual(chestBoat.inventory.length, 27, 'ChestBoat should have 27-slot container storage array');

        // Put an item inside ChestBoat container
        chestBoat.inventory[0] = { type: window.BLOCK.ITEM_DIAMOND, count: 5 };

        // Sneaking interaction should trigger container UI
        game.controls.sneak = true;
        chestBoat.interact(game.player);

        assert.strictEqual(game.ui.activeChest, chestBoat, 'Sneaking interact should open ChestBoat as active chest container UI');

        // Test destruction spill logic
        chestBoat.takeDamage(100);
        assert.ok(chestBoat.isDead, 'ChestBoat should be destroyed when health drops to 0');

        const foundDiamondDrop = game.drops.some(d => d.type === window.BLOCK.ITEM_DIAMOND && d.count === 5);
        assert.ok(foundDiamondDrop, 'Destroyed ChestBoat should spill its container inventory items into world drops');
    });
});
