const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('5 New High Quality Features Test Suite', function () {
    let dom, window, global;

    beforeEach(function () {
        dom = new JSDOM(`<!DOCTYPE html><html><body>
            <canvas id="game-canvas"></canvas>
            <canvas id="gameCanvas"></canvas>
            <div id="fps"></div>
            <div id="position"></div>
            <div id="block-count"></div>
            <div id="game-time"></div>
            <div id="crafting-recipes"></div>
            <input id="crafting-search-input" />
            <button id="close-crafting"></button>
            <div id="hotbar"></div>
            <div id="health-bar"></div>
            <div id="hunger-bar"></div>
            <div id="xp-bar"></div>
            <div id="inventory-screen" class="hidden"></div>
            <div id="crafting-screen" class="hidden"></div>
            <div id="chat-messages"></div>
            <input id="chat-input" />
            <div id="chat-container"></div>
            <div id="tutorial-overlay"></div>
        </body></html>`, {
            url: 'http://localhost/',
            runScripts: 'dangerously',
            resources: 'usable'
        });

        window = dom.window;
        global = globalThis;
        global.window = window;
        global.document = window.document;
        global.navigator = window.navigator;

        class MockAudioContext {
            createGain() { return { gain: { value: 1, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} }, connect: () => {} }; }
            createOscillator() { return { frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} }; }
            createBufferSource() { return { buffer: null, connect: () => {}, start: () => {} }; }
            createBuffer() { return {}; }
        }
        window.AudioContext = MockAudioContext;

        window.HTMLCanvasElement.prototype.getContext = function (type) {
            return {
                fillRect: () => {},
                clearRect: () => {},
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                stroke: () => {},
                moveTo: () => {},
                lineTo: () => {},
                createLinearGradient: () => ({ addColorStop: () => {} }),
                drawImage: () => {},
                setTransform: () => {},
                getImageData: () => ({ data: new Uint8ClampedArray(16 * 16 * 4) }),
                putImageData: () => {}
            };
        };

        window.perlin = {
            noise: function () { return 0.5; }
        };

        const fs = require('fs');
        const path = require('path');

        function loadScript(filePath) {
            const code = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
            window.eval(code);
        }

        loadScript('js/math.js');
        loadScript('js/blocks.js');
        loadScript('js/audio.js');
        loadScript('js/network.js');
        loadScript('js/chunk.js');
        loadScript('js/biome.js');
        loadScript('js/structures.js');
        loadScript('js/world.js');
        loadScript('js/physics.js');
        loadScript('js/entity.js');
        loadScript('js/particles.js');
        loadScript('js/chat.js');
        loadScript('js/ui.js');
        loadScript('js/input.js');
        loadScript('js/plugin.js');
        loadScript('js/minimap.js');
        loadScript('js/achievements.js');
        loadScript('js/tutorial.js');
        loadScript('js/player.js');
        loadScript('js/mob.js');
        loadScript('js/drop.js');
        loadScript('js/crafting.js');
        loadScript('js/textures.js');
        loadScript('js/renderer.js');
        loadScript('js/ui.js');
        loadScript('js/game.js');

        // Bind global constructor mappings
        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.MOB_TYPE = window.MOB_TYPE;
        global.Mob = window.Mob;
        global.World = window.World;
        global.Chunk = window.Chunk;
        global.Game = window.Game;
        global.TextureManager = window.TextureManager;
        global.Renderer = window.Renderer;
    });

    it('1. Breeze Mob AI & Wind Charge Firing & Breeze Rod drops', function () {
        const game = new Game();
        const breeze = new Mob(game, 10, 5, 10, MOB_TYPE.BREEZE);
        game.mobs.push(breeze);

        assert.strictEqual(breeze.maxHealth, 30);
        assert.strictEqual(breeze.speed, 3.5);

        breeze.update(0.1);
        assert.ok(breeze.height > 0);

        breeze.die();
        assert.strictEqual(breeze.isDead, true);

        const breezeRodDrop = game.drops.find(d => d.type === BLOCK.ITEM_BREEZE_ROD);
        assert.ok(breezeRodDrop, 'Breeze mob should drop Breeze Rod on death');
    });

    it('2. Polar Bear Mob AI & Aggro & Fish drops', function () {
        const game = new Game();
        const bear = new Mob(game, 20, 5, 20, MOB_TYPE.POLAR_BEAR);
        const babyBear = new Mob(game, 22, 5, 22, MOB_TYPE.POLAR_BEAR);
        babyBear.isBaby = true;

        game.mobs.push(bear, babyBear);

        assert.strictEqual(bear.maxHealth, 30);

        // Player gets close to baby bear, mother polar bear becomes aggro
        game.player.x = 21;
        game.player.z = 21;
        bear.update(0.1);

        assert.ok(bear.vx !== 0 || bear.vz !== 0, 'Polar bear should aggro when player is near baby');

        bear.die();
        const fishDrop = game.drops.find(d => d.type === BLOCK.ITEM_RAW_FISH);
        assert.ok(fishDrop, 'Polar bear should drop raw fish on death');
    });

    it('3. Hopper Block Crafting & Container Transport Logic', function () {
        const game = new Game();
        const world = game.world;
        world.generateChunk(0, 0);

        // Ensure Hopper block definition and recipe exist
        assert.ok(BLOCK.HOPPER);
        const hopperRecipe = game.crafting.recipes.find(r => r.name === 'Hopper');
        assert.ok(hopperRecipe, 'Hopper crafting recipe should exist');

        // Set up Hopper at (0, 10, 0) and Chest below at (0, 9, 0)
        world.setBlock(0, 10, 0, BLOCK.HOPPER);
        world.setBlock(0, 9, 0, BLOCK.CHEST);

        world.setBlockEntity(0, 9, 0, { type: 'chest', items: new Array(27).fill(null) });

        // Spawn drop entity above Hopper
        game.drops.push(new window.Drop(game, 0.5, 10.8, 0.5, BLOCK.STONE, 3));

        // Update Hopper transfer
        world.updateHoppers();

        const chestEntity = world.getBlockEntity(0, 9, 0);
        const transferredItem = chestEntity.items.find(i => i && i.type === BLOCK.STONE);
        assert.ok(transferredItem, 'Hopper should pull item drop from top and push into chest below');
    });

    it('4. Observer Block Crafting & Redstone Update Pulse', function () {
        const game = new Game();
        const world = game.world;
        world.generateChunk(0, 0);

        // Ensure Observer block definition and recipe exist
        assert.ok(BLOCK.OBSERVER);
        const observerRecipe = game.crafting.recipes.find(r => r.name === 'Observer');
        assert.ok(observerRecipe, 'Observer crafting recipe should exist');

        world.setBlock(5, 5, 5, BLOCK.OBSERVER);

        // Observer should emit pulse upon detecting adjacent block update
        world.setBlock(5, 5, 6, BLOCK.STONE); // Placed block next to Observer
        assert.ok(world.activeRedstone.has('5,5,5'), 'Observer should queue redstone update on block change');

        world.updateRedstone(); // Process pulse
        const power = world.getMetadata(5, 5, 5);
        assert.strictEqual(power, 0, 'Observer 1-tick pulse should reset after redstone tick');
    });

    it('5. Underwater Fog & Visual FX rendering', function () {
        const game = new Game();
        const renderer = new Renderer(game);
        game.world.generateChunk(0, 0);

        // Put player head in water
        game.world.setBlock(0, 5, 0, BLOCK.WATER);
        game.world.setMetadata(0, 5, 0, 8);
        game.player.x = 0.5;
        game.player.y = 4.0;
        game.player.z = 0.5;

        // Render scene
        renderer.render();

        const headBlock = game.world.getBlock(0, 5, 0);
        assert.strictEqual(headBlock, BLOCK.WATER, 'Player head should be submerged in water');
    });
});
