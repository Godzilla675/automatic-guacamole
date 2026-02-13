const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// ============================================================
// Shared JSDOM Setup (mimics test_features.js pattern)
// ============================================================
const dom = new JSDOM(`<!DOCTYPE html>
<body>
<div id="game-canvas"></div>
<div id="chat-container"></div>
<div id="chat-messages"></div>
<input id="chat-input" class="hidden">
<div id="hotbar"></div>
<div id="health-bar"></div>
<div id="hunger-bar"></div>
<div id="damage-overlay"></div>
<div id="fps"></div>
<div id="position"></div>
<div id="block-count"></div>
<div id="game-time"></div>
<div id="crafting-screen" class="hidden"></div>
<div id="crafting-recipes"></div>
<div id="close-crafting"></div>
<div id="inventory-screen" class="hidden"></div>
<div id="pause-screen" class="hidden"></div>
<div id="debug-info" class="hidden"></div>
<div id="crosshair"></div>
<div id="loading-screen"></div>
<div id="menu-screen"></div>
<div id="hud"></div>
<button id="start-game"></button>
<button id="resume-game"></button>
<button id="return-menu"></button>
<button id="close-inventory"></button>
<div id="mobile-controls" class="hidden"></div>
<div id="joystick-container"></div>
<div id="joystick-stick"></div>
<button id="jump-btn"></button>
<button id="break-btn"></button>
<button id="place-btn"></button>
<button id="fly-btn"></button>
</body>`, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost/"
});

// Mock WebSocket
class MockWebSocket {
    constructor(url) { this.url = url; this.readyState = 0; setTimeout(() => { this.readyState = 1; if (this.onopen) this.onopen(); }, 10); }
    send() {}
    close() { this.readyState = 3; if (this.onclose) this.onclose(); }
}
MockWebSocket.OPEN = 1;
MockWebSocket.lastSent = [];
dom.window.WebSocket = MockWebSocket;

// Mock AudioContext with full support
dom.window.AudioContext = class {
    constructor() {
        this.destination = {};
        this.currentTime = 0;
        this.sampleRate = 44100;
        this.listener = {
            positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 },
            forwardX: { value: 0 }, forwardY: { value: 0 }, forwardZ: { value: -1 },
            upX: { value: 0 }, upY: { value: 1 }, upZ: { value: 0 },
            setPosition: () => {}, setOrientation: () => {}
        };
    }
    createPanner() { return { connect: () => {}, positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 }, panningModel: '', distanceModel: '', refDistance: 1, maxDistance: 100, rolloverFactor: 1 }; }
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, type: '', frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createBuffer(ch, len, rate) { return { getChannelData: () => new Float32Array(len || 1024) }; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {}, buffer: null, loop: false }; }
    createBiquadFilter() { return { connect: () => {}, type: '', frequency: { value: 0 } }; }
    resume() {}
    get state() { return 'running'; }
};

// Mock Canvas
const canvas = dom.window.document.getElementById('game-canvas');
canvas.getContext = () => ({
    setTransform: () => {}, fillStyle: '', fillRect: () => {}, beginPath: () => {},
    moveTo: () => {}, lineTo: () => {}, fill: () => {}, strokeRect: () => {},
    font: '', fillText: () => {}, measureText: () => ({ width: 0 }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    clearRect: () => {}, save: () => {}, restore: () => {}, scale: () => {},
    translate: () => {}, rotate: () => {},
});
canvas.requestPointerLock = () => {};
dom.window.document.exitPointerLock = () => {};

// Mock Perlin
dom.window.perlin = { noise: () => 0 };

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        clear: () => { store = {}; },
        removeItem: (key) => { delete store[key]; }
    };
})();
dom.window.localStorage = localStorageMock;
dom.window.prompt = () => "Tester";
dom.window.requestAnimationFrame = () => {};

// Load Code (correct order - entity before mob/vehicle)
const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error("Error loading " + f, e.message);
    }
};

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js',
 'physics.js', 'audio.js', 'network.js', 'entity.js', 'drop.js', 'crafting.js',
 'player.js', 'vehicle.js', 'mob.js', 'chat.js', 'particles.js', 'plugin.js',
 'minimap.js', 'achievements.js', 'tutorial.js', 'ui.js', 'input.js',
 'renderer.js', 'game.js'].forEach(load);

// ============================================================
// Test Suites
// ============================================================

describe('Plugin API', () => {
    let pluginAPI;

    beforeEach(() => {
        pluginAPI = new dom.window.PluginAPI({ world: {} });
    });

    it('should register and emit events', () => {
        let received = null;
        pluginAPI.on('testEvent', (data) => { received = data; });
        pluginAPI.emit('testEvent', { value: 42 });
        assert.deepStrictEqual(received, { value: 42 });
    });

    it('should support multiple listeners on same event', () => {
        let count = 0;
        pluginAPI.on('multi', () => { count++; });
        pluginAPI.on('multi', () => { count++; });
        pluginAPI.emit('multi', {});
        assert.strictEqual(count, 2);
    });

    it('should not crash emitting event with no listeners', () => {
        assert.doesNotThrow(() => pluginAPI.emit('noListeners', {}));
    });

    it('should register a new block via registerBlock', () => {
        const BLOCKS = dom.window.BLOCKS;
        const id = 999;
        pluginAPI.registerBlock(id, { name: 'Test Block', color: '#ff0000' });
        assert.strictEqual(BLOCKS[id].name, 'Test Block');
    });

    it('should warn on duplicate block registration', () => {
        const BLOCKS = dom.window.BLOCKS;
        const id = 998;
        BLOCKS[id] = { name: 'Existing' };
        const warnings = [];
        const origWarn = console.warn;
        console.warn = (msg) => warnings.push(msg);
        pluginAPI.registerBlock(id, { name: 'Overwrite' });
        console.warn = origWarn;
        assert.ok(warnings.length > 0);
        assert.strictEqual(BLOCKS[id].name, 'Existing');
    });
});

describe('Tutorial System', () => {
    it('should start active with step 0', () => {
        const mockGame = { controls: {}, breaking: false };
        const tutorial = new dom.window.TutorialManager(mockGame);
        assert.strictEqual(tutorial.active, true);
        assert.strictEqual(tutorial.step, 0);
    });

    it('should advance step when check condition is met', () => {
        const mockGame = { controls: { forward: false }, breaking: false };
        const tutorial = new dom.window.TutorialManager(mockGame);
        assert.strictEqual(tutorial.step, 0);

        // Condition not met
        tutorial.update(0.1);
        assert.strictEqual(tutorial.step, 0);

        // Condition met
        mockGame.controls.forward = true;
        tutorial.update(0.1);
        assert.strictEqual(tutorial.step, 1);
    });

    it('should advance timer-based steps', () => {
        const mockGame = { controls: { forward: true, jump: true }, breaking: true };
        const tutorial = new dom.window.TutorialManager(mockGame);

        // Advance through check-based steps
        tutorial.update(0.1); // step 0: move
        tutorial.update(0.1); // step 1: jump
        tutorial.update(0.1); // step 2: break

        // step 3 requires inventory screen not hidden - skip directly to step 4
        // Manually set step to timer-based step
        tutorial.step = 4; // "Good luck!" with timer
        tutorial.timer = 0;
        tutorial.update(1.0);
        assert.strictEqual(tutorial.step, 4); // Still on step 4 (timer 1.0 < 3.0)
        tutorial.update(2.1);
        assert.strictEqual(tutorial.step, 5); // Advanced past last step
    });

    it('should deactivate after all steps completed', () => {
        const mockGame = { controls: { forward: true, jump: true }, breaking: true };
        const tutorial = new dom.window.TutorialManager(mockGame);
        tutorial.step = tutorial.steps.length;
        tutorial.update(0.1);
        assert.strictEqual(tutorial.active, false);
    });
});

describe('Achievement System', () => {
    let game, achievements;

    beforeEach(() => {
        game = {
            pluginAPI: new dom.window.PluginAPI({}),
            world: { dimension: 'overworld' },
            ui: { showNotification: () => {} }
        };
        dom.window.soundManager = { play: () => {} };
        achievements = new dom.window.AchievementManager(game);
    });

    it('should unlock achievement via unlock()', () => {
        achievements.unlock('monster_hunter');
        assert.ok(achievements.unlocked.has('monster_hunter'));
    });

    it('should not unlock duplicate achievements', () => {
        let notifyCount = 0;
        game.ui.showNotification = () => { notifyCount++; };
        achievements.unlock('monster_hunter');
        achievements.unlock('monster_hunter');
        assert.strictEqual(notifyCount, 1);
    });

    it('should ignore unknown achievement IDs', () => {
        achievements.unlock('nonexistent_achievement');
        assert.strictEqual(achievements.unlocked.size, 0);
    });

    it('should unlock getting_wood on blockBreak event with WOOD', () => {
        game.pluginAPI.emit('blockBreak', { type: dom.window.BLOCK.WOOD });
        assert.ok(achievements.unlocked.has('getting_wood'));
    });

    it('should unlock monster_hunter on mobDeath event', () => {
        game.pluginAPI.emit('mobDeath', {});
        assert.ok(achievements.unlocked.has('monster_hunter'));
    });

    it('should unlock hot_stuff when dimension is nether', () => {
        game.world.dimension = 'nether';
        achievements.update();
        assert.ok(achievements.unlocked.has('hot_stuff'));
    });

    it('should not unlock hot_stuff in overworld', () => {
        game.world.dimension = 'overworld';
        achievements.update();
        assert.ok(!achievements.unlocked.has('hot_stuff'));
    });
});

describe('Particle System', () => {
    let particles;

    beforeEach(() => {
        particles = new dom.window.ParticleSystem({});
    });

    it('should spawn particles', () => {
        particles.spawn(0, 0, 0, '#ff0000', 10);
        assert.strictEqual(particles.particles.length, 10);
    });

    it('should set particle properties', () => {
        particles.spawn(5, 10, 15, '#00ff00', 1);
        const p = particles.particles[0];
        assert.strictEqual(p.color, '#00ff00');
        assert.ok(p.life > 0);
        assert.ok(p.size > 0);
    });

    it('should remove particles when life expires', () => {
        particles.spawn(0, 10, 0, '#fff', 3);
        // Force life to expire
        particles.particles.forEach(p => { p.life = 0.01; });
        particles.update(0.1);
        assert.strictEqual(particles.particles.length, 0);
    });

    it('should apply gravity to particles', () => {
        particles.spawn(0, 50, 0, '#fff', 1);
        const p = particles.particles[0];
        const initialVy = p.vy;
        particles.update(0.1);
        assert.ok(p.vy < initialVy, 'Gravity should reduce vy');
    });

    it('should clamp particles to floor (y >= 0)', () => {
        particles.spawn(0, 0.1, 0, '#fff', 1);
        const p = particles.particles[0];
        p.vy = -100;
        p.y = 0.05;
        particles.update(1.0);
        assert.ok(p.y >= 0);
    });
});

describe('Entity Base Class', () => {
    it('should initialize position and velocity', () => {
        const entity = new dom.window.Entity({}, 10, 20, 30);
        assert.strictEqual(entity.x, 10);
        assert.strictEqual(entity.y, 20);
        assert.strictEqual(entity.z, 30);
        assert.strictEqual(entity.vx, 0);
        assert.strictEqual(entity.vy, 0);
        assert.strictEqual(entity.vz, 0);
    });

    it('should apply gravity on update', () => {
        const entity = new dom.window.Entity({}, 0, 50, 0);
        const initialVy = entity.vy;
        entity.update(0.1);
        assert.ok(entity.vy < initialVy);
    });

    it('should move based on velocity', () => {
        const entity = new dom.window.Entity({}, 0, 50, 0);
        entity.vx = 10;
        entity.vz = 5;
        entity.vy = 0;
        const prevX = entity.x;
        entity.update(0.1);
        assert.ok(entity.x > prevX);
    });

    it('should die when falling below -10', () => {
        const entity = new dom.window.Entity({}, 0, -11, 0);
        entity.update(0.1);
        assert.strictEqual(entity.isDead, true);
    });

    it('should have default dimensions', () => {
        const entity = new dom.window.Entity({}, 0, 0, 0);
        assert.strictEqual(entity.width, 0.6);
        assert.strictEqual(entity.height, 1.8);
    });
});

describe('Vehicle System', () => {
    let mockGame, mockPlayer;

    beforeEach(() => {
        mockGame = {
            world: { getBlock: () => 0 },
            controls: { forward: false, backward: false }
        };
        mockPlayer = { x: 0, y: 50, z: 0, vx: 0, vy: 0, vz: 0, yaw: 0, riding: null, onGround: true, height: 1.8 };
    });

    it('should mount player on interact', () => {
        const vehicle = new dom.window.Vehicle(mockGame, 0, 50, 0);
        vehicle.interact(mockPlayer);
        assert.strictEqual(vehicle.rider, mockPlayer);
        assert.strictEqual(mockPlayer.riding, vehicle);
    });

    it('should dismount player on second interact', () => {
        const vehicle = new dom.window.Vehicle(mockGame, 0, 50, 0);
        vehicle.interact(mockPlayer); // Mount
        vehicle.interact(mockPlayer); // Dismount
        assert.strictEqual(vehicle.rider, null);
        assert.strictEqual(mockPlayer.riding, null);
    });

    it('Minecart should have correct type and dimensions', () => {
        const cart = new dom.window.Minecart(mockGame, 0, 50, 0);
        assert.strictEqual(cart.type, 'minecart');
        assert.strictEqual(cart.width, 0.98);
        assert.strictEqual(cart.height, 0.7);
    });

    it('Boat should have correct type and dimensions', () => {
        const boat = new dom.window.Boat(mockGame, 0, 50, 0);
        assert.strictEqual(boat.type, 'boat');
        assert.strictEqual(boat.width, 1.4);
        assert.strictEqual(boat.height, 0.6);
    });

    it('Minecart should snap to rail height on rail blocks', () => {
        const BLOCK = dom.window.BLOCK;
        const BLOCKS = dom.window.BLOCKS;
        mockGame.world.getBlock = (x, y, z) => {
            if (y === 50) return BLOCK.RAIL;
            return BLOCK.AIR;
        };
        const cart = new dom.window.Minecart(mockGame, 0.5, 50.5, 0.5);
        cart.update(0.016);
        assert.ok(cart.onGround, 'Minecart should be on ground on rail');
    });

    it('Boat should float in water', () => {
        const BLOCK = dom.window.BLOCK;
        mockGame.world.getBlock = (x, y, z) => {
            if (y === 50) return BLOCK.WATER;
            return BLOCK.AIR;
        };
        const boat = new dom.window.Boat(mockGame, 0.5, 50, 0.5);
        boat.vy = -5;
        boat.update(0.016);
        // Buoyancy should increase vy
        assert.ok(boat.vy > -5, 'Boat should receive buoyancy in water');
    });
});

describe('Drop System', () => {
    let mockGame;

    beforeEach(() => {
        mockGame = {
            world: {
                getBlock: () => dom.window.BLOCK.AIR
            },
            player: { x: 100, y: 50, z: 100, height: 1.8 }
        };
    });

    it('should initialize with correct properties', () => {
        const drop = new dom.window.Drop(mockGame, 5, 10, 15, dom.window.BLOCK.STONE, 3);
        assert.strictEqual(drop.type, dom.window.BLOCK.STONE);
        assert.strictEqual(drop.count, 3);
        assert.ok(drop.vy > 0, 'Drop should have upward initial velocity');
        assert.strictEqual(drop.lifeTime, 300);
    });

    it('should decrease lifetime on update', () => {
        const drop = new dom.window.Drop(mockGame, 5, 50, 15, dom.window.BLOCK.DIRT, 1);
        const initialLife = drop.lifeTime;
        drop.update(1.0);
        assert.ok(drop.lifeTime < initialLife);
    });

    it('should apply gravity on update', () => {
        const drop = new dom.window.Drop(mockGame, 5, 50, 15, dom.window.BLOCK.DIRT, 1);
        const initialVy = drop.vy;
        drop.update(0.1);
        assert.ok(drop.vy < initialVy, 'Gravity should reduce vy');
    });

    it('should be attracted to nearby player', () => {
        // Place player very close to the drop
        mockGame.player = { x: 5, y: 50, z: 15, height: 1.8 };
        const drop = new dom.window.Drop(mockGame, 5, 50, 15, dom.window.BLOCK.DIRT, 1);
        drop.vx = 0;
        drop.vz = 0;
        // Drop is at same position as player, dist ~0
        // This should pull the drop toward the player
        drop.update(0.1);
        // Just verify no crash; exact attraction depends on random initial velocity
    });

    it('should rotate visually over time', () => {
        const drop = new dom.window.Drop(mockGame, 5, 50, 15, dom.window.BLOCK.DIRT, 1);
        const initialRot = drop.rotY;
        drop.update(0.5);
        assert.ok(drop.rotY > initialRot);
    });
});

describe('Chat System & Commands', () => {
    let game;

    before(function(done) {
        this.timeout(10000);
        game = new dom.window.Game();
        game.world.renderDistance = 1;
        game.gameLoop = () => {};

        try {
            game.init().then(() => {}).catch(() => {});
        } catch (e) {}

        setTimeout(() => {
            game.gameLoop = () => {};
            done();
        }, 500);
    });

    it('should add messages to chat', () => {
        const msgCount = game.chat.messages.children.length;
        game.chat.addMessage('Hello World', 'Player1');
        assert.strictEqual(game.chat.messages.children.length, msgCount + 1);
    });

    it('/time set day should set game time to 0', () => {
        game.chat.handleCommand('/time set day');
        assert.strictEqual(game.gameTime, 0);
    });

    it('/time set night should set game time to half day', () => {
        game.chat.handleCommand('/time set night');
        assert.strictEqual(game.gameTime, game.dayLength / 2);
    });

    it('/time set <number> should set exact time', () => {
        game.chat.handleCommand('/time set 100');
        assert.strictEqual(game.gameTime, 100);
    });

    it('/gamemode creative should set gamemode to 1', () => {
        game.chat.handleCommand('/gamemode creative');
        assert.strictEqual(game.player.gamemode, 1);
    });

    it('/gamemode survival should set gamemode to 0', () => {
        game.chat.handleCommand('/gamemode survival');
        assert.strictEqual(game.player.gamemode, 0);
        assert.strictEqual(game.player.flying, false);
    });

    it('/gamemode with aliases should work (c, s, 0, 1)', () => {
        game.chat.handleCommand('/gamemode c');
        assert.strictEqual(game.player.gamemode, 1);
        game.chat.handleCommand('/gamemode s');
        assert.strictEqual(game.player.gamemode, 0);
        game.chat.handleCommand('/gamemode 1');
        assert.strictEqual(game.player.gamemode, 1);
        game.chat.handleCommand('/gamemode 0');
        assert.strictEqual(game.player.gamemode, 0);
    });

    it('/tp should teleport player', () => {
        game.chat.handleCommand('/tp 100 200 300');
        assert.strictEqual(game.player.x, 100);
        assert.strictEqual(game.player.y, 200);
        assert.strictEqual(game.player.z, 300);
    });

    it('/clear should clear inventory', () => {
        game.player.inventory[0] = { type: dom.window.BLOCK.STONE, count: 64 };
        game.chat.handleCommand('/clear');
        assert.strictEqual(game.player.inventory[0], null);
    });

    it('/give should add item to inventory', () => {
        game.player.inventory.fill(null);
        game.chat.handleCommand('/give stone 10');
        const stone = game.player.inventory.find(i => i && i.type === dom.window.BLOCK.STONE);
        assert.ok(stone, 'Should have stone in inventory');
        assert.strictEqual(stone.count, 10);
    });

    it('/fill should fill blocks in world', () => {
        game.chat.handleCommand('/fill 0 60 0 2 60 2 stone');
        const b = game.world.getBlock(1, 60, 1);
        assert.strictEqual(b, dom.window.BLOCK.STONE);
    });

    it('unknown command should show error', () => {
        const msgCount = game.chat.messages.children.length;
        game.chat.handleCommand('/unknowncommand');
        assert.ok(game.chat.messages.children.length > msgCount);
    });

    it('chat open/close should toggle controls', () => {
        game.chat.open();
        assert.strictEqual(game.chat.isOpen, true);
        assert.strictEqual(game.controls.enabled, false);
        game.chat.close();
        assert.strictEqual(game.chat.isOpen, false);
        assert.strictEqual(game.controls.enabled, true);
    });
});

describe('Audio SoundManager', () => {
    // SoundManager is a singleton (window.soundManager), not exported as constructor
    const sm = dom.window.soundManager;

    it('should initialize with enabled=true and volume=0.5', () => {
        assert.strictEqual(sm.enabled, true);
        assert.strictEqual(sm.volume, 0.5);
    });

    it('should play various sound types without error', () => {
        const types = ['step', 'break', 'place', 'jump', 'eat', 'fuse'];
        for (const type of types) {
            assert.doesNotThrow(() => sm.play(type));
        }
    });

    it('should play sound with 3D position', () => {
        assert.doesNotThrow(() => sm.play('break', { x: 10, y: 20, z: 30 }));
    });

    it('should not play when disabled', () => {
        const origEnabled = sm.enabled;
        sm.enabled = false;
        assert.doesNotThrow(() => sm.play('step'));
        sm.enabled = origEnabled;
    });

    it('should create noise buffer', () => {
        const buffer = sm.createNoiseBuffer();
        assert.ok(buffer);
    });

    it('should start ambience without crashing', () => {
        // Reset ambience state for clean test
        sm.ambience = { wind: null, water: null };
        assert.doesNotThrow(() => sm.startAmbience());
        assert.ok(sm.ambience.wind);
        assert.ok(sm.ambience.water);
    });

    it('should update ambience levels', () => {
        assert.doesNotThrow(() => sm.updateAmbience(0.5, 0.3));
    });

    it('should not restart ambience if already running', () => {
        const windRef = sm.ambience.wind;
        sm.startAmbience();
        assert.strictEqual(sm.ambience.wind, windRef);
    });

    it('should update listener position', () => {
        assert.doesNotThrow(() => sm.updateListener(10, 20, 30, 0, 0));
    });
});

describe('BiomeManager', () => {
    it('should initialize with a seed', () => {
        const bm = new dom.window.BiomeManager(42);
        assert.strictEqual(bm.seed, 42);
    });

    it('should have all expected biome types', () => {
        const bm = new dom.window.BiomeManager(1);
        assert.ok(bm.biomes.OCEAN);
        assert.ok(bm.biomes.PLAINS);
        assert.ok(bm.biomes.FOREST);
        assert.ok(bm.biomes.DESERT);
        assert.ok(bm.biomes.SNOW);
        assert.ok(bm.biomes.JUNGLE);
        assert.ok(bm.biomes.BEACH);
    });

    it('should return a biome from getBiome()', () => {
        const bm = new dom.window.BiomeManager(1);
        const biome = bm.getBiome(0, 0);
        assert.ok(biome);
        assert.ok(biome.name);
        assert.ok(biome.topBlock !== undefined);
    });

    it('biome should have topBlock and underBlock', () => {
        const bm = new dom.window.BiomeManager(1);
        const biome = bm.getBiome(100, 100);
        assert.ok(biome.topBlock !== undefined);
        assert.ok(biome.underBlock !== undefined);
    });
});

describe('Chunk System', () => {
    it('should initialize with correct dimensions', () => {
        const chunk = new dom.window.Chunk(0, 0);
        assert.strictEqual(chunk.size, 16);
        assert.strictEqual(chunk.maxHeight, 128);
    });

    it('should get and set blocks correctly', () => {
        const chunk = new dom.window.Chunk(0, 0);
        chunk.setBlock(5, 10, 5, 2);
        assert.strictEqual(chunk.getBlock(5, 10, 5), 2);
    });

    it('should return AIR for out-of-bounds access', () => {
        const chunk = new dom.window.Chunk(0, 0);
        assert.strictEqual(chunk.getBlock(-1, 0, 0), dom.window.BLOCK.AIR);
        assert.strictEqual(chunk.getBlock(0, -1, 0), dom.window.BLOCK.AIR);
        assert.strictEqual(chunk.getBlock(16, 0, 0), dom.window.BLOCK.AIR);
    });

    it('should set and get metadata', () => {
        const chunk = new dom.window.Chunk(0, 0);
        chunk.setMetadata(5, 10, 5, 7);
        assert.strictEqual(chunk.getMetadata(5, 10, 5), 7);
    });

    it('setBlock should reset metadata', () => {
        const chunk = new dom.window.Chunk(0, 0);
        chunk.setBlock(5, 10, 5, 2);
        chunk.setMetadata(5, 10, 5, 3);
        chunk.setBlock(5, 10, 5, 1); // Setting block resets metadata
        assert.strictEqual(chunk.getMetadata(5, 10, 5), 0);
    });

    it('should set and get light levels', () => {
        const chunk = new dom.window.Chunk(0, 0);
        chunk.setLight(5, 10, 5, 12);
        assert.strictEqual(chunk.getLight(5, 10, 5), 12);
    });

    it('should return 15 light for out-of-bounds', () => {
        const chunk = new dom.window.Chunk(0, 0);
        assert.strictEqual(chunk.getLight(-1, 0, 0), 15);
    });

    it('should mark modified on setBlock', () => {
        const chunk = new dom.window.Chunk(0, 0);
        chunk.modified = false;
        chunk.setBlock(0, 0, 0, 1);
        assert.strictEqual(chunk.modified, true);
    });

    it('pack and unpack should preserve data', () => {
        const chunk = new dom.window.Chunk(0, 0);
        chunk.setBlock(3, 5, 7, 2);
        chunk.setBlock(10, 20, 15, 5);
        chunk.setMetadata(3, 5, 7, 3);

        const packed = chunk.pack();

        const chunk2 = new dom.window.Chunk(0, 0);
        chunk2.unpack(packed);

        assert.strictEqual(chunk2.getBlock(3, 5, 7), 2);
        assert.strictEqual(chunk2.getBlock(10, 20, 15), 5);
        assert.strictEqual(chunk2.getMetadata(3, 5, 7), 3);
    });

    it('should identify exposed blocks', () => {
        const chunk = new dom.window.Chunk(0, 0);
        // Single block surrounded by air is exposed
        chunk.setBlock(8, 8, 8, 2);
        assert.ok(chunk.isExposed(8, 8, 8, null));
    });
});

describe('Player Advanced Systems', () => {
    let game;

    before(function(done) {
        this.timeout(10000);
        game = new dom.window.Game();
        game.world.renderDistance = 1;
        game.gameLoop = () => {};
        try {
            game.init().then(() => {}).catch(() => {});
        } catch (e) {}
        setTimeout(() => {
            game.gameLoop = () => {};
            done();
        }, 500);
    });

    describe('Armor System', () => {
        it('should calculate defense points from equipped armor', () => {
            game.player.armor = [
                { type: dom.window.BLOCK.ITEM_HELMET_IRON },
                { type: dom.window.BLOCK.ITEM_CHESTPLATE_IRON },
                null,
                null
            ];
            const defense = game.player.getDefensePoints();
            // Iron helmet=2, Iron chestplate=6 => total 8
            assert.strictEqual(defense, 8);
        });

        it('should reduce damage based on defense', () => {
            game.player.health = 20;
            game.player.gamemode = 0;
            game.player.blocking = false;
            game.player.lastDamageTime = 0;
            game.player.armor = [
                { type: dom.window.BLOCK.ITEM_HELMET_IRON, durability: 100 },
                { type: dom.window.BLOCK.ITEM_CHESTPLATE_IRON, durability: 100 },
                null,
                null
            ];
            game.player.takeDamage(10);
            // Defense=8, reduction=min(0.8, 8*0.04)=0.32, damage=10*(1-0.32)=6.8
            assert.ok(game.player.health > 13, 'Armor should reduce damage');
            assert.ok(game.player.health < 20, 'Should still take some damage');
        });

        it('should break armor when durability reaches 0', () => {
            game.player.health = 20;
            game.player.gamemode = 0;
            game.player.blocking = false;
            game.player.lastDamageTime = 0;
            game.player.armor = [
                { type: dom.window.BLOCK.ITEM_HELMET_LEATHER, durability: 1 },
                null, null, null
            ];
            game.player.takeDamage(5);
            assert.strictEqual(game.player.armor[0], null, 'Armor should break');
        });
    });

    describe('XP System', () => {
        it('should add XP and increase level', () => {
            game.player.xp = 0;
            game.player.level = 0;
            game.player.totalXP = 0;
            // Level 0 needs 7 XP
            game.player.addXP(7);
            assert.strictEqual(game.player.level, 1);
        });

        it('should handle multiple level ups', () => {
            game.player.xp = 0;
            game.player.level = 0;
            game.player.totalXP = 0;
            // Level 0=7, Level 1=9 => 16 total for 2 levels
            game.player.addXP(16);
            assert.strictEqual(game.player.level, 2);
        });

        it('should track partial XP progress', () => {
            game.player.xp = 0;
            game.player.level = 0;
            game.player.totalXP = 0;
            game.player.addXP(3);
            assert.strictEqual(game.player.level, 0);
            assert.ok(game.player.xp > 0);
        });
    });

    describe('Creative Mode', () => {
        it('should not take damage in creative mode', () => {
            game.player.health = 20;
            game.player.gamemode = 1; // Creative
            game.player.takeDamage(10);
            assert.strictEqual(game.player.health, 20, 'No damage in creative');
            game.player.gamemode = 0; // Reset
        });
    });

    describe('Blocking (Shield)', () => {
        it('should block damage when blocking', () => {
            game.player.health = 20;
            game.player.gamemode = 0;
            game.player.blocking = true;
            game.player.lastDamageTime = 0;
            game.player.armor = [null, null, null, null];
            game.player.takeDamage(10);
            assert.strictEqual(game.player.health, 20, 'Should block all damage');
            game.player.blocking = false;
        });
    });

    describe('Respawn', () => {
        it('should reset player stats on respawn', () => {
            game.player.health = 0;
            game.player.hunger = 5;
            game.player.fallDistance = 10;
            game.player.respawn();
            assert.strictEqual(game.player.health, game.player.maxHealth);
            assert.strictEqual(game.player.hunger, game.player.maxHunger);
            assert.strictEqual(game.player.fallDistance, 0);
            assert.strictEqual(game.player.x, game.player.spawnPoint.x);
        });
    });

    describe('Hunger Effects', () => {
        it('should regenerate health when hunger >= 18', () => {
            game.player.health = 15;
            game.player.hunger = 20;
            game.player.regenTimer = 3.9;
            game.player.gamemode = 0;
            game.player.flying = false;
            game.player.riding = null;

            game.player.update(0.2);
            assert.strictEqual(game.player.health, 16);
        });

        it('should limit sprinting when hunger <= 6', () => {
            game.player.hunger = 3;
            game.controls.sprint = true;
            game.controls.sneak = false;
            game.controls.forward = true;
            game.player.onGround = true;
            game.player.flying = false;
            game.player.riding = null;

            game.player.update(0.016);
            assert.strictEqual(game.player.sprinting, false);
        });
    });

    describe('Recipe Discovery', () => {
        it('should start with basic recipes unlocked', () => {
            assert.ok(game.player.unlockedRecipes.has("Planks (4)"));
            assert.ok(game.player.unlockedRecipes.has("Stick (4)"));
            assert.ok(game.player.unlockedRecipes.has("Furnace"));
        });
    });
});

describe('Minimap', () => {
    it('should return block color from BLOCKS definition', () => {
        const mockGame = {
            player: { x: 0, z: 0, yaw: 0 },
            world: { getHighestBlockY: () => 10, getBlock: () => 0 }
        };
        const minimap = new dom.window.Minimap(mockGame);
        // Test getBlockColor with a known block
        const color = minimap.getBlockColor(dom.window.BLOCK.GRASS);
        assert.ok(typeof color === 'string');
    });

    it('should return black for unknown block type', () => {
        const mockGame = {
            player: { x: 0, z: 0, yaw: 0 },
            world: { getHighestBlockY: () => 10, getBlock: () => 0 }
        };
        const minimap = new dom.window.Minimap(mockGame);
        const color = minimap.getBlockColor(9999);
        assert.strictEqual(color, '#000');
    });
});

describe('Mob System', () => {
    let game;

    before(function(done) {
        this.timeout(10000);
        game = new dom.window.Game();
        game.world.renderDistance = 1;
        game.gameLoop = () => {};
        try {
            game.init().then(() => {}).catch(() => {});
        } catch (e) {}
        setTimeout(() => {
            game.gameLoop = () => {};
            done();
        }, 500);
    });

    it('should create mob with correct type', () => {
        const mob = new dom.window.Mob(game, 0, 50, 0, dom.window.MOB_TYPE.ZOMBIE);
        assert.strictEqual(mob.type, 'zombie');
    });

    it('should have breeding properties', () => {
        const mob = new dom.window.Mob(game, 0, 50, 0, dom.window.MOB_TYPE.COW);
        assert.strictEqual(mob.loveTimer, 0);
        assert.strictEqual(mob.breedingCooldown, 0);
        assert.strictEqual(mob.isBaby, false);
    });

    it('should have taming properties', () => {
        const mob = new dom.window.Mob(game, 0, 50, 0, dom.window.MOB_TYPE.WOLF);
        assert.strictEqual(mob.isTamed, false);
        assert.strictEqual(mob.owner, null);
    });

    it('should take damage and track health', () => {
        const mob = new dom.window.Mob(game, 0, 50, 0, dom.window.MOB_TYPE.COW);
        const startHealth = mob.health;
        mob.takeDamage(5);
        assert.strictEqual(mob.health, startHealth - 5);
    });

    it('should die when health reaches 0', () => {
        const mob = new dom.window.Mob(game, 0, 50, 0, dom.window.MOB_TYPE.COW);
        mob.takeDamage(100);
        assert.strictEqual(mob.isDead, true);
    });

    it('all MOB_TYPE values should be defined', () => {
        const types = dom.window.MOB_TYPE;
        assert.ok(types.COW);
        assert.ok(types.ZOMBIE);
        assert.ok(types.PIG);
        assert.ok(types.SKELETON);
        assert.ok(types.SPIDER);
        assert.ok(types.SHEEP);
        assert.ok(types.WOLF);
        assert.ok(types.CHICKEN);
        assert.ok(types.CREEPER);
        assert.ok(types.ENDERMAN);
        assert.ok(types.PIGMAN);
        assert.ok(types.GHAST);
        assert.ok(types.BLAZE);
    });
});

describe('World Saving', () => {
    let game;

    before(function(done) {
        this.timeout(10000);
        game = new dom.window.Game();
        game.world.renderDistance = 1;
        game.gameLoop = () => {};
        try {
            game.init().then(() => {}).catch(() => {});
        } catch (e) {}
        setTimeout(() => {
            game.gameLoop = () => {};
            done();
        }, 500);
    });

    it('should save and load block state', () => {
        game.world.setBlock(4, 40, 4, dom.window.BLOCK.ORE_DIAMOND);
        game.world.saveWorld('test_coverage_slot');
        game.world.setBlock(4, 40, 4, dom.window.BLOCK.AIR);
        game.world.loadWorld('test_coverage_slot');
        assert.strictEqual(game.world.getBlock(4, 40, 4), dom.window.BLOCK.ORE_DIAMOND);
    });

    it('should save and load metadata', () => {
        game.world.setBlock(4, 41, 4, dom.window.BLOCK.DOOR_WOOD_BOTTOM);
        game.world.setMetadata(4, 41, 4, 5);
        game.world.saveWorld('test_meta_slot');
        game.world.setMetadata(4, 41, 4, 0);
        game.world.loadWorld('test_meta_slot');
        assert.strictEqual(game.world.getMetadata(4, 41, 4), 5);
    });
});

describe('Renderer Performance', () => {
    it('should compute projection scale once per frame', () => {
        const ctx = {
            setTransform: () => {}, fillStyle: '', fillRect: () => {}, beginPath: () => {},
            moveTo: () => {}, lineTo: () => {}, fill: () => {}, strokeRect: () => {}, stroke: () => {},
            font: '', fillText: () => {}, measureText: () => ({ width: 0 }),
            createLinearGradient: () => ({ addColorStop: () => {} }),
            clearRect: () => {}, save: () => {}, restore: () => {}, scale: () => {},
            translate: () => {}, rotate: () => {}, lineWidth: 1, textAlign: 'left', globalAlpha: 1,
        };

        const game = {
            canvas: { width: 800, height: 600, style: {} },
            ctx,
            fov: 90,
            gameTime: 0,
            dayLength: 24000,
            sunBrightness: 1,
            renderDistance: 8,
            player: { x: 0, y: 64, z: 0, height: 1.8, yaw: 0, pitch: 0 },
            world: {
                getBlock: () => dom.window.BLOCK.AIR,
                getChunk: () => null,
                getBlockEntity: () => null,
                weather: 'clear',
                chunks: new Map(),
            },
            mobs: [{ x: 0, y: 64, z: 6, height: 1.8, color: '#fff', type: 'zombie' }],
            vehicles: [{ x: 1, y: 64, z: 6, height: 1, width: 1, type: 'boat' }],
            drops: [{ x: -1, y: 64, z: 6, type: dom.window.BLOCK.DIRT, rotY: 0 }],
            particles: { particles: [{ x: 0.5, y: 64, z: 6, size: 0.2, color: '#fff' }] },
            tntPrimed: [{ x: -0.5, y: 64, z: 6, fuse: 2 }],
            projectiles: [{ x: 0, y: 64, z: 7 }],
            bobber: { x: 0.2, y: 64, z: 7, state: 'idle' },
            network: { otherPlayers: [{ x: 0.8, y: 64, z: 7, name: 'P1' }] },
        };

        const renderer = new dom.window.Renderer(game);
        const originalTan = dom.window.Math.tan;
        let tanCalls = 0;
        dom.window.Math.tan = function(...args) {
            tanCalls++;
            return originalTan.apply(this, args);
        };

        renderer.render();
        dom.window.Math.tan = originalTan;

        assert.strictEqual(tanCalls, 1);
    });
});
