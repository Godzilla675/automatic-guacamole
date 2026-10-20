const { JSDOM } = require('jsdom');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

describe('Batch 18 Feature Verification Suite', function() {
    this.timeout(10000);
    let dom, window, globalGame;

    beforeEach(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body>
            <canvas id="game-canvas"></canvas>
            <div id="crosshair"></div>
            <div id="chat-messages"></div>
            <div id="crafting-recipes"></div>
            <div id="crafting-screen" class="hidden"></div>
            <div id="mobile-controls" class="hidden"></div>
        </body></html>`, {
            url: "http://localhost/",
            runScripts: "dangerously",
            resources: "usable"
        });

        window = dom.window;

        window.perlin = { noise: () => 0.1 };

        // Mocks for Web Audio API and HTMLCanvasElement
        window.AudioContext = class {
            constructor() {
                this.currentTime = 0;
                this.state = 'running';
                this.listener = { positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 }, forwardX: { value: 0 }, forwardY: { value: 0 }, forwardZ: { value: 0 }, upX: { value: 0 }, upY: { value: 0 }, upZ: { value: 0 } };
            }
            createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
            createGain() { return { connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {}, setTargetAtTime: () => {} } }; }
            createPanner() { return { connect: () => {}, positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 } }; }
            createBufferSource() { return { connect: () => {}, start: () => {}, buffer: null, loop: false }; }
            createBiquadFilter() { return { connect: () => {}, frequency: { value: 0 }, Q: { value: 0 } }; }
            createBuffer() { return { getChannelData: () => new Float32Array(100) }; }
            resume() {}
        };

        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                clearRect: () => {}, fillRect: () => {}, fillText: () => {}, measureText: () => ({ width: 10 }),
                drawImage: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {},
                arc: () => {}, fill: () => {}, save: () => {}, restore: () => {}, scale: () => {}, translate: () => {},
                rotate: () => {}, createPattern: () => null, putImageData: () => {}
            };
        };

        const loadScript = (filename) => {
            const filepath = path.join(__dirname, '../js', filename);
            const code = fs.readFileSync(filepath, 'utf8');
            window.eval(code);
        };

        loadScript('blocks.js');
        loadScript('textures.js');
        loadScript('particles.js');
        loadScript('audio.js');
        loadScript('biome.js');
        loadScript('chunk.js');
        loadScript('structures.js');
        loadScript('world.js');

        // Entity base class mock for vehicle.js
        window.Entity = class Entity {
            constructor(game, x, y, z) {
                this.game = game;
                this.x = x; this.y = y; this.z = z;
                this.vx = 0; this.vy = 0; this.vz = 0;
                this.isDead = false;
            }
            update() {}
        };

        loadScript('physics.js');
        loadScript('player.js');
        loadScript('mob.js');
        loadScript('crafting.js');
        loadScript('vehicle.js');

        // Global mocks
        window.NetworkManager = class { constructor() {} update() {} sendPosition() {} sendBlockUpdate() {} };
        window.ChatManager = class { constructor() {} addMessage() {} };
        window.UIManager = class { constructor() {} init() {} updateHotbarUI() {} updateHealthUI() {} showNotification() {} updateHotbar() {} updateInventory() {} updateInventoryUI() {} openStonecutter() {} openBrewing() {} openEnchanting() {} openAnvil() {} };
        window.InputManager = class { constructor() {} setupEventListeners() {} setupMobileControls() {} };
        window.Renderer = class { constructor() {} resize() {} render() {} };
        window.PluginAPI = class { constructor() {} emit() {} };
        window.Minimap = class { constructor() {} update() {} };
        window.AchievementManager = class { constructor() {} update() {} };
        window.TutorialManager = class { constructor() {} update() {} };
        window.Drop = class { constructor(game, x, y, z, type, count) { this.game = game; this.x = x; this.y = y; this.z = z; this.type = type; this.count = count; this.lifeTime = 300; } update() {} };

        loadScript('interactions.js');
        loadScript('item_use.js');
        loadScript('game.js');
        globalGame = new window.Game();
        window.game = globalGame;
    });

    it('1. should verify Breeze Wind Charge Deflection Audio Feedback', function() {
        let soundPlayed = null;
        window.soundManager.play = (type, pos) => { soundPlayed = type; };

        // Position player near projectile facing it
        globalGame.player.x = 4;
        globalGame.player.y = 4;
        globalGame.player.z = 5;
        globalGame.player.yaw = Math.PI / 2; // facing positive X

        // Spawn projectile at player eye level
        globalGame.spawnProjectile(5, 4 + 1.8 * 0.9, 5, { x: -1, y: 0, z: 0 }, 'wind_charge');
        const proj = globalGame.projectiles[0];
        assert.strictEqual(proj.type, 'wind_charge');

        globalGame.startAction(true); // Left click attack (melee)
        assert.strictEqual(proj.deflected, true);
        assert.strictEqual(soundPlayed, 'wind_deflect');
    });

    it('2. should verify Vault Unlocking Item Orbit Particle FX', function() {
        globalGame.updateChunks();
        const vx = 8, vy = 8, vz = 8;
        globalGame.world.setBlock(vx, vy, vz, window.BLOCK.TRIAL_VAULT);

        let orbitSpawned = false;
        globalGame.particles.spawnVaultOrbit = (x, y, z, color) => { orbitSpawned = true; };

        globalGame.player.inventory[0] = { type: window.BLOCK.ITEM_TRIAL_KEY, count: 1 };
        globalGame.player.selectedSlot = 0;

        globalGame.interact(vx, vy, vz);
        assert.strictEqual(orbitSpawned, true);
    });

    it('3. should verify Wind Burst Mace Weapon Effect', function() {
        const mob = new window.Mob(globalGame, 10, 10, 10, window.MOB_TYPE.ZOMBIE);
        globalGame.mobs.push(mob);

        globalGame.player.x = 10;
        globalGame.player.y = 10;
        globalGame.player.z = 9.5;
        globalGame.player.yaw = 0;
        globalGame.player.pitch = 0;

        globalGame.player.inventory[0] = { type: window.BLOCK.ITEM_MACE, count: 1 };
        globalGame.player.selectedSlot = 0;

        globalGame.startAction(true); // Left click attack
        assert.strictEqual(globalGame.player.vy >= 10, true); // Player launched into air with Wind Burst
    });

    it('4. should verify Copper Chiseling Mechanics with Shears', function() {
        globalGame.updateChunks();
        const bx = 8, by = 8, bz = 10;
        globalGame.world.setBlock(bx, by, bz, window.BLOCK.COPPER_BLOCK);

        globalGame.player.x = 8;
        globalGame.player.y = 8 - 1.8 * 0.9; // Position player so eyePos.y matches 8
        globalGame.player.z = 8; // Looking towards +Z (bz=10)
        globalGame.player.yaw = 0;
        globalGame.player.pitch = 0;

        globalGame.player.inventory[0] = { type: window.BLOCK.ITEM_SHEARS, count: 1, durability: 238 };
        globalGame.player.selectedSlot = 0;

        globalGame.startAction(false); // Right click
        assert.strictEqual(globalGame.world.getBlock(bx, by, bz), window.BLOCK.CHISELED_COPPER);
    });

    it('5. should verify Creaking Heart Silk Touch Harvesting', function() {
        globalGame.updateChunks();
        const bx = 8, by = 8, bz = 8;
        globalGame.world.setBlock(bx, by, bz, window.BLOCK.CREAKING_HEART);

        // Mine with Silk Touch Axe
        globalGame.player.inventory[0] = { type: window.BLOCK.AXE_DIAMOND, count: 1, silkTouch: true };
        globalGame.player.selectedSlot = 0;

        globalGame.finalizeBreakBlock(bx, by, bz);

        const drop = globalGame.drops.find(d => d.type === window.BLOCK.CREAKING_HEART);
        assert.notStrictEqual(drop, undefined);
        assert.strictEqual(drop.type, window.BLOCK.CREAKING_HEART);
    });
});
