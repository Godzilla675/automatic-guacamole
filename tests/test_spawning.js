const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');

// Setup DOM
const dom = new JSDOM(`
<html>
<body>
    <canvas id="game-canvas"></canvas>
    <div id="chat-container"><div id="chat-messages"></div><input id="chat-input" class="hidden"></div>
    <div id="debug-info"></div>
    <div id="inventory-screen" class="hidden"></div>
    <div id="crafting-screen" class="hidden"></div>
    <div id="pause-screen" class="hidden"></div>
    <div id="hotbar"></div>
    <div id="health-bar"></div>
    <div id="damage-overlay"></div>
    <div id="crosshair"></div>
    <span id="fps"></span>
    <span id="position"></span>
    <span id="block-count"></span>
    <span id="game-time"></span>
    <div id="mobile-controls" class="hidden"></div>
    <div id="joystick-container"></div>
    <div id="joystick-stick"></div>
    <div id="jump-btn"></div>
    <div id="break-btn"></div>
    <div id="place-btn"></div>
    <div id="fly-btn"></div>
    <div id="loading-screen"></div>
    <div id="menu-screen"></div>
    <div id="game-container"></div>
    <button id="start-game"></button>
    <button id="resume-game"></button>
    <button id="return-menu"></button>
    <button id="close-inventory"></button>
</body>
</html>
`, {
    url: "http://localhost/", runScripts: "dangerously", resources: "usable" });

// Define globals on dom.window for the script to see
dom.window.requestAnimationFrame = () => {};
dom.window.AudioContext = class {
    createOscillator() { return { connect:()=>{}, start:()=>{}, stop:()=>{}, frequency:{setValueAtTime:()=>{}, exponentialRampToValueAtTime:()=>{}, linearRampToValueAtTime:()=>{}}, type:'' }; }
    createGain() { return { connect:()=>{}, gain:{setValueAtTime:()=>{}, exponentialRampToValueAtTime:()=>{}, linearRampToValueAtTime:()=>{}} }; }
};
dom.window.navigator = { userAgent: 'node', maxTouchPoints: 0 };

// Mock Canvas getContext
const canvas = dom.window.document.getElementById('game-canvas');
canvas.getContext = () => ({
    setTransform: () => {},
    fillStyle: '',
    fillRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    fill: () => {},
    strokeRect: () => {},
    font: '',
    textAlign: '',
    fillText: () => {}
});

// Mock globals needed by main.js
dom.window.BLOCK = { AIR: 0, DIRT: 1, WATER: 9 };
dom.window.MOB_TYPE = { COW: 'cow', ZOMBIE: 'zombie', PIG: 'pig', SKELETON: 'skeleton', SPIDER: 'spider' };
dom.window.BLOCKS = { 1: { hardness: 1 }, 9: { liquid: true } };
dom.window.TOOLS = {};

// Mock Classes
dom.window.World = class {
    constructor() {}
    getHighestBlockY(x, z) { return 10; } // Ground at 10
    getBlock(x, y, z) {
        if (y < 10) return 1; // Ground
        if (y === 9) return 1; // Ground block
        return 0; // Air
    }
    unloadFarChunks() {}
    generateChunk() {}
};
dom.window.Physics = class { constructor() {} };
dom.window.Player = class {
    constructor() { this.x=0; this.y=11; this.z=0; this.inventory=[]; this.health=20; this.maxHealth=20; }
    update() {}
};
dom.window.Mob = class { constructor(g,x,y,z,t) { this.type=t; this.x=x; this.y=y; this.z=z; } update() {} };
dom.window.NetworkManager = class { connect() {} sendPosition() {} };
dom.window.CraftingSystem = class { initUI() {} };
dom.window.ChatManager = class { constructor() {} };
dom.window.UIManager = class { constructor() {} updateHotbarUI() {} updateHealthUI() {} };
dom.window.InputManager = class { constructor() {} setupEventListeners() {} setupMobileControls() {} };
dom.window.Renderer = class { constructor() {} resize() {} };
dom.window.ParticleSystem = class { constructor() {} emit() {} update() {} };
dom.window.PluginAPI = class { constructor() {} emit() {} };
dom.window.Minimap = class { constructor() {} };
dom.window.AchievementManager = class { constructor() {} };
dom.window.TutorialManager = class { constructor() {} };

// Mock SoundManager
dom.window.soundManager = { play: () => {}, updateAmbience: () => {} };

// Helper to load script
function loadScript(path) {
    const code = fs.readFileSync(path, 'utf8');
    dom.window.eval(code);
}

// Load game.js
loadScript('js/game.js');
const Game = dom.window.Game;

describe('Mob Spawning', () => {
    let game;

    beforeEach(() => {
        game = new Game();
        // Override modules with our mocks to be sure (though constructor should use window.World which is our mock)
        // game.world = new dom.window.World();
        // game.player = new dom.window.Player();
        game.mobs = [];
        // Day length 120000. Day < 0.5.
    });

    it('should spawn passive mobs during day', () => {
        game.gameTime = 1000; // Day

        for(let i=0; i<30; i++) {
            game.spawnMobs();
            if (game.mobs.length > 0) break;
        }
        assert.ok(game.mobs.length > 0, "Should have spawned a mob");
        const mob = game.mobs[0];
        const passiveTypes = ['cow', 'pig'];
        assert.ok(passiveTypes.includes(mob.type), `Expected passive mob, got ${mob.type}`);
    });

    it('should spawn hostile mobs during night', () => {
        game.gameTime = 70000; // Night ( > 60000)

        for(let i=0; i<30; i++) {
            game.spawnMobs();
            if (game.mobs.length > 0) break;
        }

        assert.ok(game.mobs.length > 0, "Should have spawned a mob");
        const mob = game.mobs[0];
        const hostileTypes = ['zombie', 'skeleton', 'spider'];
        assert.ok(hostileTypes.includes(mob.type), `Expected hostile mob, got ${mob.type}`);
    });

    it('should respect mob cap', () => {
        game.mobs = new Array(20).fill({});
        game.spawnMobs();
        assert.strictEqual(game.mobs.length, 20);
    });
});
