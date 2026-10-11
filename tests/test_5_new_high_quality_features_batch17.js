const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('5 New High Quality Features Batch 17 Test Suite', function() {
    this.timeout(10000);
    let window, dom, game;

    beforeEach(function() {
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <canvas id="game-canvas"></canvas>
                <div id="loading-screen"></div>
                <div id="menu-screen"></div>
                <div id="game-container"></div>
                <div id="hotbar"></div>
                <div id="chat-messages"></div>
                <div id="chat-input"></div>
                <div id="health-bar"></div>
                <div id="hunger-bar"></div>
                <div id="xp-bar"></div>
                <div id="xp-level"></div>
                <div id="potion-effects-container"></div>
                <div id="damage-overlay"></div>
                <div id="darkness-overlay"></div>
                <div id="fps"></div>
                <div id="position"></div>
                <div id="block-count"></div>
                <div id="game-time"></div>
                <div id="inventory-screen" class="hidden"></div>
                <div id="inventory-grid"></div>
                <div id="armor-grid"></div>
                <div id="offhand-container"></div>
                <div id="crafting-screen" class="hidden"></div>
                <div id="crafting-recipes"></div>
                <div id="sign-screen" class="hidden"><textarea id="sign-input"></textarea></div>
                <div id="debug-info" class="hidden"></div>
                <div id="crosshair"></div>
                <input type="checkbox" id="auto-jump-checkbox">
            </body>
            </html>
        `, {
            url: 'http://localhost',
            runScripts: 'dangerously',
            resources: 'usable'
        });

        window = dom.window;
        global.window = window;
        global.document = window.document;
        global.navigator = window.navigator;

        document.exitPointerLock = () => {};

        // Mock canvas context
        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {},
                clearRect: () => {},
                getImageData: () => ({ data: new Uint8ClampedArray(4) }),
                putImageData: () => {},
                createImageData: () => ({ data: new Uint8ClampedArray(4) }),
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

        window.AudioContext = class {
            createAnalyser() { return { connect: () => {} }; }
            createGain() { return { connect: () => {}, gain: { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
            createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, type: '', frequency: { value: 440, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
            createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
            createPanner() { return { connect: () => {}, setPosition: () => {}, positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 } }; }
        };

        // Load game scripts
        const fs = require('fs');
        const path = require('path');
        const loadScript = (filePath) => {
            const code = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
            window.eval(code);
        };

        loadScript('js/math.js');
        loadScript('js/blocks.js');
        loadScript('js/audio.js');
        loadScript('js/network.js');
        loadScript('js/chunk.js');
        loadScript('js/biome.js');
        loadScript('js/structures.js');
        loadScript('js/village.js');
        loadScript('js/world.js');
        loadScript('js/physics.js');
        loadScript('js/entity.js');
        loadScript('js/vehicle.js');
        loadScript('js/player.js');
        loadScript('js/mob.js');
        loadScript('js/drop.js');
        loadScript('js/crafting.js');
        loadScript('js/plugin.js');
        loadScript('js/minimap.js');
        loadScript('js/achievements.js');
        loadScript('js/tutorial.js');
        loadScript('js/chat.js');
        loadScript('js/ui.js');
        loadScript('js/input.js');
        loadScript('js/textures.js');
        loadScript('js/renderer.js');
        loadScript('js/particles.js');
        loadScript('js/game.js');

        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.Game = window.Game;

        game = new window.Game();
        game.input.setupEventListeners();
        global.game = game;
    });

    it('Feature 1: Should initialize Pillager Captains & drop Ominous Banner on death', function() {
        const pillager = new window.Mob(game, 10, 20, 10, window.MOB_TYPE.PILLAGER);
        pillager.isCaptain = true;
        pillager.initType();

        assert.strictEqual(pillager.isCaptain, true);
        assert.strictEqual(pillager.color, '#3A3A3A');

        pillager.die();

        const bannerDrop = game.drops.find(d => d.type === window.BLOCK.ITEM_OMINOUS_BANNER);
        assert.ok(bannerDrop, 'Ominous Banner drop should be created upon Captain death');

        // Test Bad Omen status effect from consuming banner
        game.player.eat(window.BLOCK.ITEM_OMINOUS_BANNER);
        const badOmen = game.player.activeEffects.find(e => e.name === 'Bad Omen');
        assert.ok(badOmen, 'Player should receive Bad Omen status effect');
    });

    it('Feature 2: Should cycle active Bundle slot via wheel scroll event', function() {
        const bundle = {
            type: window.BLOCK.ITEM_BUNDLE,
            count: 1,
            bundleCount: 16,
            bundleItems: [
                { type: window.BLOCK.DIRT, count: 10 },
                { type: window.BLOCK.STONE, count: 6 }
            ]
        };
        game.player.inventory[0] = bundle;
        game.player.selectedSlot = 0;

        // Dispatch wheel event
        const wheelEvt = new window.WheelEvent('wheel', { deltaY: 100, cancelable: true });
        window.dispatchEvent(wheelEvt);

        assert.strictEqual(bundle.selectedBundleIndex, 1);
    });

    it('Feature 3: Should scatter all stored items when dropping a filled Bundle', function() {
        const bundle = {
            type: window.BLOCK.ITEM_BUNDLE,
            count: 1,
            bundleCount: 20,
            bundleItems: [
                { type: window.BLOCK.DIRT, count: 12 },
                { type: window.BLOCK.STONE, count: 8 }
            ]
        };
        game.player.inventory[0] = bundle;
        game.player.selectedSlot = 0;

        game.player.dropItem(0);

        assert.strictEqual(game.player.inventory[0], null);
        const dirtDrop = game.drops.find(d => d.type === window.BLOCK.DIRT);
        const stoneDrop = game.drops.find(d => d.type === window.BLOCK.STONE);
        const bundleDrop = game.drops.find(d => d.type === window.BLOCK.ITEM_BUNDLE);

        assert.ok(dirtDrop && dirtDrop.count === 12, 'Stored Dirt items should be scattered as drops');
        assert.ok(stoneDrop && stoneDrop.count === 8, 'Stored Stone items should be scattered as drops');
        assert.ok(bundleDrop, 'The bundle container itself should be dropped');
    });

    it('Feature 4: Should craft and place Pale Oak Hanging Signs', function() {
        game.player.unlockedRecipes.add("Pale Oak Hanging Sign (6)");

        game.player.inventory[0] = { type: window.BLOCK.PALE_OAK_PLANK, count: 12 };
        game.player.inventory[1] = { type: window.BLOCK.ITEM_STRING, count: 4 };

        // Crafting check
        const crafting = new window.CraftingSystem(game);
        const recipeIndex = crafting.recipes.findIndex(r => r.name === "Pale Oak Hanging Sign (6)");
        assert.ok(recipeIndex !== -1, 'Pale Oak Hanging Sign recipe should exist');

        crafting.craft(recipeIndex);
        const signItem = game.player.inventory.find(i => i && i.type === window.BLOCK.ITEM_HANGING_SIGN_PALE_OAK);
        assert.ok(signItem, 'Player should receive ITEM_HANGING_SIGN_PALE_OAK in inventory');

        // Placement check
        game.world.generateChunk(0, 0);
        game.player.x = 0; game.player.y = 40; game.player.z = 0;
        game.world.setBlock(10, 10, 10, window.BLOCK.PALE_OAK_LOG);
        game.player.inventory[0] = { type: window.BLOCK.ITEM_HANGING_SIGN_PALE_OAK, count: 1 };
        game.player.selectedSlot = 0;

        // Mock physics raycast for ceiling placement
        game.physics.raycast = () => ({ x: 10, y: 10, z: 10, face: { x: 0, y: -1, z: 0 }, point: { x: 10.5, y: 9.5, z: 10.5 } });
        game.startAction(false);

        const placedBlock = game.world.getBlock(10, 9, 10);
        assert.strictEqual(placedBlock, window.BLOCK.HANGING_SIGN_PALE_OAK, 'Pale Oak Hanging Sign should be placed on ceiling');
    });

    it('Feature 5: Should render dynamic neighbor connections for Resin Brick Walls', function() {
        game.world.setBlock(10, 10, 10, window.BLOCK.RESIN_BRICK_WALL);
        game.world.setBlock(11, 10, 10, window.BLOCK.RESIN_BRICK_WALL);

        const wallDef = window.BLOCKS[window.BLOCK.RESIN_BRICK_WALL];
        assert.ok(wallDef.isFence, 'Resin Brick Wall should have isFence set for post connections');

        assert.doesNotThrow(() => {
            game.renderer.render();
        }, 'Renderer should successfully execute wall post connection checks without throwing exceptions');
    });
});
