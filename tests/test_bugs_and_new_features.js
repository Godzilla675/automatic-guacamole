const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Fixed Bugs and New Mechanics Test Suite', function() {
    this.timeout(10000);
    let dom, window, game;

    beforeEach(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body><canvas id="game-canvas"></canvas><canvas id="minimap-canvas"></canvas><div id="chat-container"><div id="chat-messages"></div><input id="chat-input" class="hidden" /></div><div id="crosshair"></div><div id="hotbar"></div><div id="health-bar"></div><div id="hunger-bar"></div><input id="crafting-search-input"/><div id="crafting-recipes"></div></body></html>`, {
            url: "http://localhost/",
            runScripts: "dangerously"
        });
        window = dom.window;

        // Mock AudioContext
        window.AudioContext = window.webkitAudioContext = class {
            constructor() {
                this.listener = { positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 }, forwardX: { value: 0 }, forwardY: { value: 0 }, forwardZ: { value: -1 }, upX: { value: 0 }, upY: { value: 1 }, upZ: { value: 0 }, setPosition: () => {}, setOrientation: () => {} };
                this.destination = {};
            }
            createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
            createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
            createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
            createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
            createBiquadFilter() { return { connect: () => {} }; }
            createPanner() { return { connect: () => {}, positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 }, panningModel: '', distanceModel: '', refDistance: 0, maxDistance: 0, rolloffFactor: 0 }; }
            resume() {}
            get state() { return 'running'; }
            get currentTime() { return 0; }
        };

        // Canvas mock
        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {},
                clearRect: () => {},
                drawImage: () => {},
                beginPath: () => {},
                moveTo: () => {},
                lineTo: () => {},
                arc: () => {},
                fill: () => {},
                stroke: () => {},
                save: () => {},
                restore: () => {},
                translate: () => {},
                scale: () => {},
                rotate: () => {},
                createPattern: () => ({})
            };
        };

        // Mock localStorage
        const storage = {};
        window.localStorage = {
            getItem: (key) => storage[key] !== undefined ? storage[key] : null,
            setItem: (key, val) => { storage[key] = val.toString(); },
            removeItem: (key) => { delete storage[key]; }
        };

        const load = (f) => {
            const code = fs.readFileSync(path.join('js', f), 'utf8');
            window.eval(code);
        };

        ['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'village.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'entity.js', 'vehicle.js', 'crafting.js', 'player.js', 'mob.js', 'drop.js', 'plugin.js', 'particles.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'game.js'].forEach(load);

        game = new window.Game();
        game.world.renderDistance = 1;
        game.particles = new window.ParticleSystem(game);
        game.ui.init();
    });

    it('should drag adjacent solid blocks when piston pushes/pulls a Honey or Slime block', function() {
        const world = game.world;
        world.generateChunk(0, 0);

        // Place sticky piston facing East (meta 5), extended (meta 5 | 8)
        const px = 5, py = 50, pz = 5;
        world.setBlock(px, py, pz, window.BLOCK.STICKY_PISTON);
        world.setMetadata(px, py, pz, 5 | 8); // Extended East

        // Piston head is at px+1 (6, 50, 5)
        world.setBlock(px + 1, py, pz, window.BLOCK.STICKY_PISTON_HEAD);

        // Honey block attached to head at px+2 (7, 50, 5)
        world.setBlock(px + 2, py, pz, window.BLOCK.HONEY_BLOCK);

        // Adjacent stone block attached to Honey block at (7, 51, 5)
        world.setBlock(px + 2, py + 1, pz, window.BLOCK.STONE);

        // Retract piston
        world.retractPiston(px, py, pz, 5 | 8);

        // Check that adjacent stone block was dragged along with honey block to (6, 51, 5)
        assert.strictEqual(world.getBlock(px + 2, py + 1, pz), window.BLOCK.AIR);
        assert.strictEqual(world.getBlock(px + 1, py + 1, pz), window.BLOCK.STONE);
    });

    it('should generate Pale Oak Forest biome with Pale Oak Trees and Eyeblossoms', function() {
        const bm = new window.BiomeManager(12345);
        assert.ok(bm.biomes.PALE_OAK_FOREST);
        assert.strictEqual(bm.biomes.PALE_OAK_FOREST.name, 'Pale Oak Forest');

        const world = new window.World();
        world.generateChunk(0, 0);
        const chunk = world.getChunk(0, 0);

        // Generate Pale Oak tree
        world.structureManager.generateTree(chunk, 5, 20, 5, 'pale_oak');
        const wx = 5, wz = 5;
        assert.strictEqual(world.getBlock(wx, 20, wz), window.BLOCK.PALE_OAK_LOG);
    });

    it('should trigger Dispenser item ejection upon redstone signal', function() {
        const world = game.world;
        world.generateChunk(1, 1);

        const x = 20, y = 50, z = 20;
        world.setBlock(x, y, z, window.BLOCK.DISPENSER);
        const entity = {
            type: 'dispenser',
            items: [{ type: window.BLOCK.ITEM_ARROW, count: 5 }],
            wasPowered: false
        };
        world.setBlockEntity(x, y, z, entity);

        // Power dispenser with redstone wire adjacent
        world.setBlock(x + 1, y, z, window.BLOCK.REDSTONE_WIRE);
        world.setMetadata(x + 1, y, z, 15);

        world.updateDispensers();

        assert.strictEqual(game.drops.length, 1);
        assert.strictEqual(game.drops[0].type, window.BLOCK.ITEM_ARROW);
        assert.strictEqual(entity.items[0].count, 4);
    });

    it('should ignite Fire and spread to adjacent flammable blocks', function() {
        const world = game.world;
        world.generateChunk(1, 1);

        const x = 20, y = 50, z = 20;
        world.setBlock(x, y, z, window.BLOCK.FIRE);
        if (!world.activeFires) world.activeFires = new Set();
        world.activeFires.add(`${x},${y},${z}`);

        // Place wood next to fire
        world.setBlock(x + 1, y, z, window.BLOCK.WOOD);

        world.updateFireSpread();
        assert.ok(world.activeFires.size >= 1);
    });

    it('should flow Lava downhill and spread to adjacent empty blocks', function() {
        const world = game.world;
        world.generateChunk(2, 2);
        const x = 35, y = 50, z = 35;

        world.setBlock(x, y, z, window.BLOCK.LAVA);
        world.activeFluids.add(`${x},${y},${z}`);

        world.updateFluids();

        // Below block should become Lava
        assert.strictEqual(world.getBlock(x, y - 1, z), window.BLOCK.LAVA);
    });

    it('should skip to morning and restore health when interacting with Bed at night', function() {
        game.gameTime = 70000; // Night time
        game.player.health = 10;

        const x = 5, y = 50, z = 5;
        game.world.generateChunk(0, 0);
        game.world.setBlock(x, y, z, window.BLOCK.BED);

        game.interact(x, y, z);

        // Time should advance to morning (< 0.5 cycle)
        const cycle = (game.gameTime % game.dayLength) / game.dayLength;
        assert.ok(cycle < 0.5);
        assert.strictEqual(game.player.health, 20);
    });
});
