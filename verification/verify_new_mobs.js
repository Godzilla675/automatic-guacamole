const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html><body>
<canvas id="game-canvas"></canvas>
<div id="chat-input"></div><div id="chat-messages"></div>
<div id="hotbar"></div>
<button id="settings-btn"></button><button id="close-settings"></button>
<input id="volume-slider" type="range"><input id="fov-slider" type="range"><input id="render-dist-slider" type="range">
<button id="reset-controls"></button><button id="pause-btn"></button>
<button id="close-furnace"></button>
<div id="furnace-input"></div><div id="furnace-fuel"></div><div id="furnace-output"></div>
<button id="open-recipe-book"></button><button id="close-recipe-book"></button>
<button id="close-trading"></button>
<div id="trading-screen"></div><div id="trading-list"></div>
<button id="close-chest"></button>
<div id="settings-screen"></div><div id="pause-screen"></div>
<div id="fov-value"></div><div id="render-dist-value"></div>
<div id="keybinds-list"></div>
<div id="chest-screen"></div><div id="inventory-screen"></div><div id="inventory-grid"></div><div id="chest-grid"></div>
<div id="crafting-screen"></div><div id="recipe-book-screen"></div><div id="recipe-list"></div>
<div id="furnace-screen"></div><div id="furnace-progress"></div><div id="furnace-burn"></div>
<div id="health-bar"></div><div id="hunger-bar"></div><div id="damage-overlay"></div>
<div id="mobile-controls"></div>
<div id="crosshair"></div>
</body>`, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost/"
});

dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.navigator = { userAgent: "node" };
dom.window.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
dom.window.AudioContext = class { createGain() { return { gain: { value: 1, linearRampToValueAtTime: () => {} }, connect: () => {} }; } };
dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 16);
dom.window.soundManager = { play: () => {}, updateAmbience: () => {} };

// Mock Canvas
dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform: () => {},
    clearRect: () => {},
    fillRect: () => {},
    drawImage: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    fillText: () => {},
    save: () => {},
    restore: () => {},
    scale: () => {},
    rotate: () => {},
    translate: () => {},
    clip: () => {},
    createPattern: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    arc: () => {},
    closePath: () => {},
    rect: () => {},
    imageSmoothingEnabled: true
});

const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error(`Failed to load ${f}:`, e);
    }
};

// Load dependencies
['math.js', 'blocks.js', 'particles.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'physics.js', 'entity.js', 'vehicle.js',
 'player.js', 'mob.js', 'drop.js', 'crafting.js', 'chat.js', 'ui.js', 'network.js', 'input.js', 'renderer.js', 'plugin.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'game.js']
.forEach(load);

const { Game, Mob, MOB_TYPE, BLOCK } = dom.window;

describe('New Mobs Verification', () => {
    let game;

    beforeEach(() => {
        game = new Game();
        game.mobs = [];
    });

    it('should have new mob types defined', () => {
        assert.ok(MOB_TYPE.CHICKEN, 'CHICKEN mob type should be defined');
        assert.ok(MOB_TYPE.CREEPER, 'CREEPER mob type should be defined');
        assert.ok(MOB_TYPE.ENDERMAN, 'ENDERMAN mob type should be defined');
    });

    it('should spawn Chicken with correct stats', () => {
        const chicken = new Mob(game, 0, 10, 0, MOB_TYPE.CHICKEN);
        assert.strictEqual(chicken.type, MOB_TYPE.CHICKEN);
        // Stats
        assert.ok(chicken.maxHealth > 0, "Chicken should have health");
        assert.ok(chicken.height < 1.0, "Chicken should be small");
    });

    it('should verify Creeper AI approaches player', () => {
        const creeper = new Mob(game, 0, 10, 0, MOB_TYPE.CREEPER);
        game.mobs.push(creeper);
        game.player.x = 5;
        game.player.y = 10;
        game.player.z = 0;

        creeper.updateAI(0.1);

        // Should move towards player
        assert.ok(creeper.vx > 0, "Creeper should move towards player");
    });

     it('should verify Enderman properties', () => {
        const enderman = new Mob(game, 0, 10, 0, MOB_TYPE.ENDERMAN);
        assert.ok(enderman.height > 2.0, "Enderman should be tall");
    });
});
