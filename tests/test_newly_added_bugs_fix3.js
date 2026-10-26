const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Newly Added Bugs Fix Suite (Batch 3)', function() {
    this.timeout(30000);
    let dom, window, game;

    beforeEach(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body>
            <canvas id="game-canvas"></canvas>
            <div id="chat-container"><div id="chat-messages"></div><input id="chat-input" class="hidden" /></div>
            <div id="crosshair"></div>
            <div id="hotbar"></div>
            <div id="health-bar"></div>
            <div id="hunger-bar"></div>
            <div id="inventory-screen" class="hidden"><div id="inventory-grid"></div><div id="armor-grid"></div><div id="offhand-container"></div></div>
        </body></html>`, {
            url: "http://localhost/",
            runScripts: "dangerously"
        });
        window = dom.window;

        if (!window.document.exitPointerLock) {
            window.document.exitPointerLock = () => {};
        }

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

        ['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'village.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'entity.js', 'vehicle.js', 'crafting.js', 'player.js', 'mob.js', 'drop.js', 'plugin.js', 'particles.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'interactions.js', 'game.js', 'item_use.js'].forEach(load);

        game = new window.Game();
        game.world.renderDistance = 1;
        game.world.generateChunk(0, 0);
    });

    it('should apply water_breathing status effect and prevent oxygen depletion when wearing Turtle Shell helmet underwater', function() {
        const BLOCK = window.BLOCK;
        // Equip Turtle Shell helmet in player armor slot 0
        game.player.armor[0] = { type: BLOCK.ITEM_TURTLE_SHELL, count: 1, durability: 275 };

        // Position player in water so head is submerged
        game.world.setBlock(Math.floor(game.player.x), Math.floor(game.player.y), Math.floor(game.player.z), BLOCK.WATER);
        game.world.setBlock(Math.floor(game.player.x), Math.floor(game.player.y + 1.6), Math.floor(game.player.z), BLOCK.WATER);

        // Run player update loop
        game.player.update(0.1);

        // Check active effects for water_breathing
        const hasWaterBreathing = game.player.activeEffects && game.player.activeEffects.some(e => e.name === 'water_breathing' || e.name === 'Water Breathing');
        assert.ok(hasWaterBreathing, 'Player submerged with Turtle Shell helmet should receive water_breathing status effect');

        // Verify oxygen remains full
        assert.strictEqual(game.player.oxygen, game.player.maxOxygen, 'Oxygen should remain full when water_breathing effect is active');
    });

    it('should launch an explosive fireball projectile when a Dispenser holding Fire Charge is powered by redstone', function() {
        const BLOCK = window.BLOCK;
        const x = 5, y = 10, z = 5;

        // Place Dispenser at (5, 10, 5)
        game.world.setBlock(x, y, z, BLOCK.DISPENSER);
        const dispenserEntity = {
            type: 'dispenser',
            items: [{ type: BLOCK.ITEM_FIRE_CHARGE, count: 3 }, null, null, null, null, null, null, null, null],
            wasPowered: false
        };
        game.world.setBlockEntity(x, y, z, dispenserEntity);

        // Clear existing projectiles
        game.projectiles = [];

        // Power the dispenser with a redstone torch
        game.world.setBlock(x + 1, y, z, BLOCK.REDSTONE_TORCH);
        game.world.updateDispensers();

        // Verify a projectile was launched
        assert.strictEqual(game.projectiles.length, 1, 'Dispenser powered with Fire Charge should launch 1 projectile');

        const proj = game.projectiles[0];
        assert.strictEqual(proj.type, 'fireball', 'Launched projectile should be of type fireball');
        assert.strictEqual(dispenserEntity.items[0].count, 2, 'Fire Charge count in dispenser should be decremented from 3 to 2');
    });
});
