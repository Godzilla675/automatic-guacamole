const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html>
<html>
<body>
    <canvas id="game-canvas" width="800" height="600"></canvas>
    <div id="ui-layer">
        <div id="hotbar"></div>
        <div id="crosshair"></div>
        <div id="chat-container"><div id="chat-messages"></div></div>
        <input id="chat-input" type="text" class="hidden">
        <div id="health-bar"></div>
        <div id="hunger-bar"></div>
        <div id="damage-overlay"></div>
        <div id="inventory-screen" class="hidden"><div id="inventory-grid"></div></div>
        <div id="chest-screen" class="hidden"><div id="chest-grid"></div></div>
        <div id="furnace-screen" class="hidden">
            <div id="furnace-input"></div><div id="furnace-fuel"></div><div id="furnace-output"></div>
            <div id="furnace-progress"></div><div id="furnace-burn"></div>
        </div>
        <div id="settings-screen" class="hidden">
            <div id="keybinds-list"></div>
            <input id="fov-slider" type="range"><span id="fov-value"></span>
            <input id="render-dist-slider" type="range"><span id="render-dist-value"></span>
        </div>
        <div id="trading-screen" class="hidden"><div id="trading-list"></div></div>
        <div id="recipe-book-screen" class="hidden"><div id="recipe-list"></div></div>
        <div id="crafting-screen" class="hidden"></div>
        <div id="pause-screen" class="hidden"></div>
    </div>
</body>
</html>`, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable"
});

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.NodeList = dom.window.NodeList;
global.navigator = dom.window.navigator;
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

global.window.PluginAPI = class { constructor() {} };
global.window.AchievementManager = class { constructor() {} check() {} update() {} };
global.window.TutorialManager = class { constructor() {} update() {} };
global.window.Minimap = class { constructor() {} update() {} };
global.window.MOB_TYPE = { PIG: 0, COW: 1, SHEEP: 2, CHICKEN: 3, ZOMBIE: 4, SKELETON: 5, CREEPER: 6, ENDERMAN: 7 };
global.window.Mob = class { constructor() { this.x = 0; this.y = 0; this.z = 0; this.isDead = false; } update() {} takeDamage(amt) { this.health = (this.health || 20) - amt; } };
global.window.AudioContext = class {
    createGain() { return { connect: () => {}, gain: { value: 0, linearRampToValueAtTime: () => {} } }; }
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {} } }; }
    createBufferSource() { return { buffer: null, connect: () => {}, start: () => {}, stop: () => {} }; }
    createBuffer() { return { getChannelData: () => new Float32Array(100) }; }
    decodeAudioData() { return Promise.resolve({}); }
    get destination() { return {}; }
    get currentTime() { return 0; }
};

global.window.perlin = { noise: () => 0.5 };
global.window.soundManager = { play: () => {}, updateAmbience: () => {}, updateListener: () => {} };

const files = [
    'js/math.js',
    'js/blocks.js',
    'js/biome.js',
    'js/structures.js',
    'js/chunk.js',
    'js/world.js',
    'js/physics.js',
    'js/entity.js',
    'js/player.js',
    'js/crafting.js',
    'js/network.js',
    'js/chat.js',
    'js/ui.js',
    'js/input.js',
    'js/mob.js',
    'js/particles.js',
    'js/renderer.js',
    'js/game.js'
];

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        eval(content);
        if (window.Entity) global.Entity = window.Entity;
        if (window.World) global.World = window.World;
        if (window.Game) global.Game = window.Game;
        if (window.Physics) global.Physics = window.Physics;
        if (window.Player) global.Player = window.Player;
        if (window.Chunk) global.Chunk = window.Chunk;
        if (window.BiomeManager) global.BiomeManager = window.BiomeManager;
        if (window.StructureManager) global.StructureManager = window.StructureManager;
        if (window.NetworkManager) global.NetworkManager = window.NetworkManager;
        if (window.CraftingSystem) global.CraftingSystem = window.CraftingSystem;
        if (window.ChatManager) global.ChatManager = window.ChatManager;
        if (window.UIManager) global.UIManager = window.UIManager;
        if (window.InputManager) global.InputManager = window.InputManager;
        if (window.Renderer) global.Renderer = window.Renderer;
        if (window.Mob) global.Mob = window.Mob;
        if (window.ParticleSystem) global.ParticleSystem = window.ParticleSystem;
        if (window.Drop) global.Drop = window.Drop;
        if (window.BLOCK) global.BLOCK = window.BLOCK;
        if (window.BLOCKS) global.BLOCKS = window.BLOCKS;
    } catch (e) {
        console.error(`Error loading ${file}:`, e);
    }
});

global.window.Renderer.prototype.resize = () => {};
global.window.Renderer.prototype.render = () => {};
global.window.Renderer.prototype.init = () => {};

describe('Thunderstorm and Lightning Rod Suite', () => {
    let game;

    beforeEach(() => {
        game = new window.Game();
        game.world = new window.World();
        game.world.game = game;
        game.world.generateChunk(0, 0);
        game.physics = new window.Physics(game.world);
        game.player = new window.Player(game);
        game.player.x = 10;
        game.player.y = 20;
        game.player.z = 10;
    });

    it('should set weather to thunder and trigger lightning strikes', () => {
        game.world.setWeather('thunder');
        assert.strictEqual(game.world.weather, 'thunder');

        // Force a lightning strike at x=10, z=10, y=20
        game.triggerLightningStrike(10, 10, 20);
        assert.ok(true, 'Lightning strike executed without crashing');
    });

    it('should divert lightning strike to nearby Lightning Rod and emit redstone signal', () => {
        const rodX = 12;
        const rodY = 20;
        const rodZ = 12;

        // Place a Lightning Rod block
        game.world.setBlock(rodX, rodY, rodZ, window.BLOCK.LIGHTNING_ROD);

        // Strike near the Lightning Rod (at x=10, z=10, y=20)
        game.triggerLightningStrike(10, 10, 20);

        // Verify the Lightning Rod received redstone power metadata (15)
        const meta = game.world.getMetadata(rodX, rodY, rodZ);
        assert.strictEqual(meta, 15, 'Lightning Rod should receive redstone signal strength 15 when struck');
    });

    it('should deal damage to player and mobs within lightning strike radius', () => {
        game.player.x = 10;
        game.player.y = 20;
        game.player.z = 10;

        const initialHealth = game.player.health;
        game.triggerLightningStrike(10, 10, 20);

        assert.ok(game.player.health < initialHealth, 'Player should take damage from close lightning strike');
    });
});
