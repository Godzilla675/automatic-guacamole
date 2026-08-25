const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('New Agent Tasks Implemented Features', function() {
    this.timeout(10000);
    let dom, window, game;

    beforeEach(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body><canvas id="game-canvas"></canvas><canvas id="minimap-canvas"></canvas><div id="chat-container"><div id="chat-messages"></div><input id="chat-input" class="hidden" /></div><div id="crosshair"></div><div id="hotbar"></div><div id="health-bar"></div><div id="hunger-bar"></div></body></html>`, {
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

    it('should support Spectator Mode flying through solid blocks', function() {
        game.player.gamemode = 3;
        game.player.spectator = true;
        game.player.x = 10;
        game.player.y = 10;
        game.player.z = 10;

        game.world.setBlock(10, 10, 10, window.BLOCK.STONE);
        game.player.moveBy(1, 0, 0);

        // Position should update without being blocked by solid collision
        assert.strictEqual(game.player.x, 11);
    });

    it('should launch Firework rockets and spawn explosion particles', function() {
        game.player.inventory[0] = { type: window.BLOCK.ITEM_FIREWORK, count: 1 };
        game.player.selectedSlot = 0;

        game.startAction(false); // Right click firework

        assert.strictEqual(game.projectiles.length, 1);
        assert.strictEqual(game.projectiles[0].type, 'firework');

        // Simulate projectile expiration
        const p = game.projectiles[0];
        p.life = 0;
        game.update(16);

        assert.strictEqual(game.projectiles.length, 0);
        assert.strictEqual(game.particles.particles.length > 0, true);
    });

    it('should trigger particle cues and despawn items when lifeTime expires', function() {
        const drop = new window.Drop(game, 5, 5, 5, window.BLOCK.DIRT, 1);
        drop.lifeTime = 0.1;
        game.drops.push(drop);

        drop.update(0.2);
        assert.strictEqual(drop.lifeTime <= 0, true);
        assert.strictEqual(game.particles.particles.length > 0, true);
    });

    it('should toggle Spyglass zoom FOV when used', function() {
        game.player.inventory[0] = { type: window.BLOCK.ITEM_SPYGLASS, count: 1 };
        game.player.selectedSlot = 0;

        game.startAction(false); // Zoom in
        assert.strictEqual(game.player.isUsingSpyglass, true);
        assert.strictEqual(game.fov, 20);

        game.startAction(false); // Zoom out
        assert.strictEqual(game.player.isUsingSpyglass, false);
        assert.strictEqual(game.fov, 60);
    });

    it('should reduce fall damage when landing on a Honey Block', function() {
        game.world.setBlock(8, 5, 8, window.BLOCK.HONEY_BLOCK);
        game.player.x = 8.5;
        game.player.y = 6;
        game.player.z = 8.5;
        game.player.onGround = true;
        game.player.fallDistance = 10; // Normal damage would be 7

        const initialHealth = game.player.health;
        game.player.update(0.01);

        const damageTaken = initialHealth - game.player.health;
        assert.strictEqual(damageTaken < 7, true); // Honey block reduces damage by 80%
    });
});
