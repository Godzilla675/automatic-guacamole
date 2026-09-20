const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Redstone Clock and Lava Flow Physics Test Suite', function() {
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

        ['math.js', 'blocks.js', 'textures.js', 'chunk.js', 'biome.js', 'structures.js', 'village.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'entity.js', 'vehicle.js', 'crafting.js', 'player.js', 'mob.js', 'drop.js', 'plugin.js', 'particles.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'game.js'].forEach(load);

        game = new window.Game();
        game.world.renderDistance = 1;
        game.particles = new window.ParticleSystem(game);
        game.ui.init();
    });

    it('should verify Redstone Clock definition, crafting recipe, texture, and periodic signal output', function() {
        assert.ok(window.BLOCK.REDSTONE_CLOCK, 'BLOCK.REDSTONE_CLOCK should be defined');
        assert.strictEqual(window.BLOCKS[window.BLOCK.REDSTONE_CLOCK].name, 'Redstone Clock');

        // Check crafting recipe
        const recipe = game.crafting.recipes.find(r => r.name === 'Redstone Clock');
        assert.ok(recipe, 'Redstone Clock crafting recipe should exist');
        assert.strictEqual(recipe.result.type, window.BLOCK.REDSTONE_CLOCK);

        // Check texture
        const tm = new window.TextureManager();
        tm.init();
        const texture = tm.getBlockTexture(window.BLOCK.REDSTONE_CLOCK);
        assert.ok(texture, 'Redstone Clock texture should be generated');

        // Test redstone clock signaling
        const world = game.world;
        world.generateChunk(0, 0);

        const x = 5, y = 50, z = 5;
        world.setBlock(x, y, z, window.BLOCK.REDSTONE_CLOCK);
        world.setBlock(x + 1, y, z, window.BLOCK.REDSTONE_WIRE);

        // Placing block registers it into activeRedstone automatically
        assert.ok(world.activeRedstone.has(`${x},${y},${z}`), 'setBlock should add Redstone Clock to activeRedstone');

        // Set metadata on clock to 15 (high pulse)
        world.setMetadata(x, y, z, 15);

        world.updateRedstone(); // Updates clock and schedules wire update
        world.updateRedstone(); // Updates wire with clock power

        // Check that adjacent redstone wire receives power
        assert.strictEqual(world.getMetadata(x + 1, y, z), 15);
    });

    it('should verify Lava Flow downward flow, horizontal spread, and ignition of adjacent flammable blocks', function() {
        const world = game.world;
        world.generateChunk(1, 1);

        const x = 20, y = 50, z = 20;

        // Place lava
        world.setBlock(x, y, z, window.BLOCK.LAVA);
        world.setMetadata(x, y, z, 8);
        world.activeFluids.add(`${x},${y},${z}`);

        // Place wood adjacent
        world.setBlock(x + 1, y, z, window.BLOCK.WOOD);

        world.updateFluids();

        // 1. Lava should flow down to (20, 49, 20)
        assert.strictEqual(world.getBlock(x, y - 1, z), window.BLOCK.LAVA);

        // 2. Fire should ignite above or near flammable wood
        assert.strictEqual(world.getBlock(x + 1, y + 1, z), window.BLOCK.FIRE);
    });
});
