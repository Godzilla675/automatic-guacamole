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
    stroke: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    fill: () => {},
});

dom.window.perlin = { noise: () => 0.5 };

const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error(`Failed to load ${f}:`, e);
    }
};

// Load dependencies
['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'physics.js',
 'player.js', 'mob.js', 'drop.js', 'crafting.js', 'chat.js', 'ui.js', 'network.js', 'input.js', 'renderer.js', 'game.js']
.forEach(load);

const { Game } = dom.window;

describe('Weather Verification', () => {
    let game;

    beforeEach(() => {
        game = new Game();
    });

    it('should default to clear weather', () => {
        assert.strictEqual(game.world.weather, 'clear');
    });

    it('should set weather correctly', () => {
        game.world.setWeather('rain');
        assert.strictEqual(game.world.weather, 'rain');

        game.world.setWeather('snow');
        assert.strictEqual(game.world.weather, 'snow');
    });
});
