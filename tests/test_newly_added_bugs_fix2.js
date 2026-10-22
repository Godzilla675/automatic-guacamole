const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Newly Added Bugs Fix Suite (Batch 2)', function() {
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
            <div id="crafter-screen" class="hidden"><div class="inventory-content"><div id="crafter-grid"></div></div></div>
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

        ['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'village.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'entity.js', 'vehicle.js', 'crafting.js', 'player.js', 'mob.js', 'drop.js', 'plugin.js', 'particles.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'interactions.js', 'game.js'].forEach(load);

        game = new window.Game();
        game.world.renderDistance = 1;
        game.world.generateChunk(0, 0);
    });

    it('should NOT insert quick-shifted items into disabled Crafter slots', function() {
        const crafter = {
            type: 'crafter',
            items: new Array(9).fill(null),
            disabledSlots: [true, false, false, false, false, false, false, false, false]
        };

        game.ui.openCrafter(crafter);

        // Give player 5 dirt in inventory slot 0
        game.player.inventory[0] = { type: window.BLOCK.DIRT, count: 5 };

        // Quick-shift inventory item slot 0 with Shift held
        game.ui.handleInventoryClick(0, { shiftKey: true });

        // Slot 0 in Crafter is disabled, so it MUST remain null
        assert.strictEqual(crafter.items[0], null, 'Crafter slot 0 must remain null because it is disabled');

        // Slot 1 in Crafter is enabled, so the items should be inserted into slot 1
        assert.ok(crafter.items[1], 'Crafter slot 1 should receive the quick-shifted items');
        assert.strictEqual(crafter.items[1].type, window.BLOCK.DIRT);
        assert.strictEqual(crafter.items[1].count, 5);
        assert.strictEqual(game.player.inventory[0], null, 'Player inventory slot 0 should be empty');
    });

    it('should float submerged mobs upward in deep water to prevent drowning', function() {
        // Build 3-block deep water pool at x=5, z=5, y=10..12, stone ground at y=9
        game.world.setBlock(5, 9, 5, window.BLOCK.STONE);
        game.world.setBlock(5, 10, 5, window.BLOCK.WATER);
        game.world.setBlock(5, 11, 5, window.BLOCK.WATER);
        game.world.setBlock(5, 12, 5, window.BLOCK.WATER);

        const zombie = new window.Mob(game, 5, 10.2, 5, window.MOB_TYPE.ZOMBIE);
        game.mobs = [zombie];

        // Initially zombie vy is 0
        zombie.vy = 0;

        // Step physics/AI update
        zombie.update(0.1);

        // Zombie submerged in water should swim/buoy upward (vy > 0 and y > initial)
        assert.ok(zombie.vy > 0, `Mob vy in water should be positive (swimming up), got ${zombie.vy}`);
        assert.ok(zombie.y > 10.2, `Mob position should increase upward in water, got ${zombie.y}`);
    });
});
