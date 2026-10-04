const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Newly Discovered Bug Fixes Suite', function() {
    this.timeout(30000);
    let dom, window, game;

    beforeEach(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body><canvas id="game-canvas"></canvas><div id="chat-container"><div id="chat-messages"></div><input id="chat-input" class="hidden" /></div><div id="crosshair"></div><div id="hotbar"></div><div id="health-bar"></div><div id="hunger-bar"></div></body></html>`, {
            url: "http://localhost/",
            runScripts: "dangerously"
        });
        window = dom.window;

        window.AudioContext = window.webkitAudioContext = class {
            constructor() {
                this.listener = { positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 }, forwardX: { value: 0 }, forwardY: { value: 0 }, forwardZ: { value: -1 }, upX: { value: 0 }, upY: { value: 1 }, upZ: { value: 0 }, setPosition: () => {}, setOrientation: () => {} };
                this.destination = {};
            }
            createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
            createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
            createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
            createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
            createBiquadFilter() { return { connect: () => {} }; }
            createPanner() { return { connect: () => {} }; }
            resume() {}
            get state() { return 'running'; }
            get currentTime() { return 0; }
        };

        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {}, clearRect: () => {}, drawImage: () => {}, beginPath: () => {},
                moveTo: () => {}, lineTo: () => {}, arc: () => {}, fill: () => {}, stroke: () => {},
                save: () => {}, restore: () => {}, translate: () => {}, scale: () => {}, rotate: () => {}, createPattern: () => ({})
            };
        };

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
        game.world.generateChunk(0, 0);
        game.world.generateChunk(1, 1);
    });

    it('should invert Redstone Torch state when support block is powered', function() {
        game.world.setBlock(10, 10, 10, window.BLOCK.STONE);
        game.world.setBlock(10, 11, 10, window.BLOCK.REDSTONE_TORCH);
        game.world.setBlock(9, 10, 10, window.BLOCK.REDSTONE_CLOCK);
        game.world.setMetadata(9, 10, 10, 15);

        game.world.activeRedstone.add('10,11,10');
        game.world.activeRedstone.add('10,10,10');
        game.world.updateRedstone();

        assert.strictEqual(game.world.getBlock(10, 11, 10), window.BLOCK.REDSTONE_TORCH_OFF);

        // Remove power clock
        game.world.setBlock(9, 10, 10, window.BLOCK.AIR);
        game.world.activeRedstone.add('10,11,10');
        game.world.activeRedstone.add('10,10,10');
        game.world.updateRedstone();

        assert.strictEqual(game.world.getBlock(10, 11, 10), window.BLOCK.REDSTONE_TORCH);
    });

    it('should measure Crafter occupied/disabled slots with Redstone Comparator', function() {
        game.world.setBlock(5, 5, 5, window.BLOCK.CRAFTER);
        game.world.setBlock(6, 5, 5, window.BLOCK.REDSTONE_COMPARATOR);

        const crafter = { type: 'crafter', items: new Array(9).fill(null), disabledSlots: [0, 1] };
        crafter.items[2] = { type: window.BLOCK.DIRT, count: 1 };
        game.world.setBlockEntity(5, 5, 5, crafter);

        game.world.activeRedstone.add('6,5,5');
        game.world.updateRedstone();

        // 2 disabled slots + 1 item slot = 3 signal strength
        const power = game.world.getMetadata(6, 5, 5);
        assert.strictEqual(power, 3);
    });

    it('should allow water to flow through Copper Grates', function() {
        game.world.setBlock(5, 10, 5, window.BLOCK.WATER);
        game.world.setMetadata(5, 10, 5, 8); // Water source
        game.world.setBlock(5, 9, 5, window.BLOCK.COPPER_GRATE);
        game.world.setBlock(5, 8, 5, window.BLOCK.AIR);

        game.world.activeFluids.add('5,10,5');
        game.world.updateFluids();

        assert.strictEqual(game.world.getBlock(5, 8, 5), window.BLOCK.WATER);
    });

    it('should support dyeing Wolf Armor in crafting system', function() {
        const crafting = new window.CraftingSystem(game);
        const dyeRecipes = crafting.recipes.filter(r => r.name.startsWith('Dye Wolf Armor'));
        assert.strictEqual(dyeRecipes.length >= 6, true);
    });

    it('should lock Hopper item transport when powered by redstone', function() {
        game.world.setBlock(10, 10, 10, window.BLOCK.HOPPER);
        const hopperEntity = { type: 'hopper', items: [{ type: window.BLOCK.DIRT, count: 5 }, null, null, null, null] };
        game.world.setBlockEntity(10, 10, 10, hopperEntity);

        game.world.setBlock(10, 9, 10, window.BLOCK.CHEST);
        const chestEntity = { type: 'chest', items: new Array(27).fill(null) };
        game.world.setBlockEntity(10, 9, 10, chestEntity);

        // Power the hopper with redstone
        game.world.setBlock(11, 10, 10, window.BLOCK.REDSTONE_CLOCK);
        game.world.setMetadata(11, 10, 10, 15);

        // Run hopper update
        game.world.processHopper(10, 10, 10);

        // Hopper should NOT transfer item to chest because it is powered
        assert.strictEqual(hopperEntity.items[0].count, 5);
        assert.strictEqual(chestEntity.items[0], null);

        // Unpower hopper
        game.world.setBlock(11, 10, 10, window.BLOCK.AIR);
        game.world.processHopper(10, 10, 10);

        // Item should transfer now
        assert.strictEqual(hopperEntity.items[0].count, 4);
        assert.strictEqual(chestEntity.items[0].type, window.BLOCK.DIRT);
    });

    it('should apply radial propulsion to vehicles when Wind Charge triggers', function() {
        const boat = new window.Boat(game, 12, 10, 12);
        game.vehicles = [boat];

        game.triggerWindBurst(12, 9.5, 12);

        assert.ok(boat.vy > 0);
    });
});
