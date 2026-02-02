const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');
const path = require('path');

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

// Create JSDOM
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
    <div id="settings-screen" class="hidden"></div>
    <div id="pause-screen"></div>
    <div id="volume-slider"></div>
    <input type="range" id="fov-slider" value="60">
    <span id="fov-value"></span>
    <input type="range" id="render-dist-slider" value="50">
    <span id="render-dist-value"></span>
    <div id="keybinds-list"></div>
    <button id="reset-controls"></button>
    <button id="settings-btn"></button>
    <button id="close-settings"></button>
    <canvas id="game-canvas"></canvas>

    <!-- UI elements expected by UIManager -->
    <div id="close-chest"></div>
    <div id="close-furnace"></div>
    <div id="furnace-input"></div>
    <div id="furnace-fuel"></div>
    <div id="furnace-output"></div>
    <div id="open-recipe-book"></div>
    <div id="close-recipe-book"></div>
    <div id="recipe-book-screen"></div>
    <div id="crafting-screen"></div>
    <div id="inventory-screen"></div>
    <div id="chest-screen"></div>
    <div id="furnace-screen"></div>
    <div id="hotbar"></div>
    <div id="inventory-grid"></div>
    <div id="chest-grid"></div>
    <div id="furnace-progress"></div>
    <div id="furnace-burn"></div>
    <div id="health-bar"></div>
    <div id="hunger-bar"></div>
    <div id="damage-overlay"></div>
    <div id="mobile-controls" class="hidden"></div>
    <div id="joystick-container"></div>
    <div id="joystick-stick"></div>
    <button id="jump-btn"></button>
    <button id="break-btn"></button>
    <button id="place-btn"></button>
    <button id="fly-btn"></button>
</body>
</html>
`, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable"
});

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = localStorageMock;
global.navigator = { userAgent: 'node', maxTouchPoints: 0 };
global.HTMLElement = dom.window.HTMLElement;

// Mocks for Game dependencies
global.World = class {
    constructor() { this.blockEntities = new Map(); }
    unloadFarChunks() {}
    generateChunk() {}
    updateFluids() {}
    getHighestBlockY() { return 10; }
    getBlock() { return 0; }
    getChunk() { return null; }
    setBlock() {}
    setMetadata() {}
    getMetadata() { return 0; }
    getBlockEntity() { return null; }
    setBlockEntity() {}
};
global.Physics = class { constructor() {} };
global.Player = class { constructor() { this.inventory = []; } update() {} };
global.NetworkManager = class { constructor() {} connect() {} };
global.CraftingSystem = class { constructor() {} initUI() {} };
global.ChatManager = class { constructor() {} };
global.Renderer = class { constructor() { this.canvas = document.getElementById('game-canvas'); this.ctx = {}; } resize() {} };
global.Mob = class {};
global.Drop = class {};
global.BLOCK = { AIR: 0, WATER: 7 };
global.BLOCKS = {};
global.TOOLS = {};
global.MOB_TYPE = { COW: 'cow', PIG: 'pig', SHEEP: 'sheep', ZOMBIE: 'zombie', SKELETON: 'skeleton', SPIDER: 'spider' };
global.soundManager = { play: () => {}, volume: 1 };

// Expose to window as well for consistency
window.World = global.World;
window.Physics = global.Physics;
window.Player = global.Player;
window.NetworkManager = global.NetworkManager;
window.CraftingSystem = global.CraftingSystem;
window.ChatManager = global.ChatManager;
window.Renderer = global.Renderer;
window.Mob = global.Mob;
window.Drop = global.Drop;
window.BLOCK = global.BLOCK;
window.BLOCKS = global.BLOCKS;
window.TOOLS = global.TOOLS;
window.MOB_TYPE = global.MOB_TYPE;
window.soundManager = global.soundManager;

// Mock Canvas context
const canvas = document.getElementById('game-canvas');
canvas.getContext = () => ({ setTransform: () => {}, fillRect: () => {} });

// Load source files
const files = [
    'js/input.js',
    'js/ui.js', 'js/particles.js',
    'js/game.js'
];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    try {
        eval(content);
        if (file.includes('particles.js')) {
            global.ParticleSystem = window.ParticleSystem;
        }
    } catch (e) {
        console.error(`Error loading ${file}:`, e);
    }
});

global.UIManager = window.UIManager;
global.InputManager = window.InputManager;
global.Game = window.Game;

// Setup Test
let game;
try {
    game = new window.Game();
    // Start manually to avoid loop
    game.renderer.resize();
    game.updateChunks();
    // Skipping init() which starts loop and prompts
    game.crafting.initUI();
    game.ui.init();
    game.input.setupEventListeners();
    game.ui.updateHotbarUI();
} catch (e) {
    console.error("Error initializing Game:", e);
    process.exit(1);
}

// Track updateChunks calls
let chunksUpdated = false;
game.updateChunks = () => { chunksUpdated = true; };


// Test 1: Load Settings from Defaults
console.log("Test 1: Default Settings");
if (game.fov !== 60) throw new Error(`Default FOV should be 60, got ${game.fov}`);
if (game.renderDistance !== 50) throw new Error(`Default Render Distance should be 50, got ${game.renderDistance}`);

// Test 2: Change Settings via UI
console.log("Test 2: Change Settings via UI");

const fovSlider = document.getElementById('fov-slider');
fovSlider.value = "90";
fovSlider.dispatchEvent(new window.Event('input'));

if (game.fov !== 90) throw new Error(`FOV should be 90, got ${game.fov}`);
if (localStorage.getItem('voxel_fov') !== "90") throw new Error(`localStorage FOV should be 90, got ${localStorage.getItem('voxel_fov')}`);

const renderDistSlider = document.getElementById('render-dist-slider');
renderDistSlider.value = "32";
chunksUpdated = false;
// input event should only update the label text, not the game state
renderDistSlider.dispatchEvent(new window.Event('input'));
if (document.getElementById('render-dist-value').textContent !== "32") throw new Error("Input event should update label");
if (game.renderDistance === 32) throw new Error("Input event should NOT update game state immediately for render distance");

// change event should update the game state
renderDistSlider.dispatchEvent(new window.Event('change'));

if (game.renderDistance !== 32) throw new Error(`Render Distance should be 32, got ${game.renderDistance}`);
if (localStorage.getItem('voxel_renderDistance') !== "32") throw new Error(`localStorage Render Distance should be 32, got ${localStorage.getItem('voxel_renderDistance')}`);
if (!chunksUpdated) throw new Error("updateChunks should have been called");

// Test 3: Keybinds
console.log("Test 3: Keybinds");
const input = game.input;
if (input.keybinds.forward !== 'KeyW') throw new Error(`Default forward should be KeyW, got ${input.keybinds.forward}`);

// Simulate Rebind Logic
game.ui.renderSettings();
const list = document.getElementById('keybinds-list');
const buttons = Array.from(list.querySelectorAll('button'));

// Find "Forward" button.
// We iterate object keys. "forward" is likely first or early.
let btn = null;
let actionName = "";

for(let b of buttons) {
    // sibling is span with label
    const label = b.previousSibling.textContent;
    if (label === "Forward") {
        btn = b;
        actionName = "forward";
        break;
    }
}

if (!btn) throw new Error("Could not find Forward keybind button");

console.log(`Testing rebind for action: ${actionName}`);

// Click button
btn.click();
if (btn.textContent !== 'Press key...') throw new Error("Button didn't change text to 'Press key...'");

// Test 3a: Rebind to Escape (Should Fail)
btn.click();
const escEvent = new window.KeyboardEvent('keydown', { code: 'Escape' });
document.dispatchEvent(escEvent);

// Should cancel rebind and NOT set forward to Escape
if (input.keybinds.forward === 'Escape') throw new Error(`Should not allow binding to Escape`);

// Re-fetch button because renderSettings() replaces the DOM elements
const newButtons = Array.from(document.getElementById('keybinds-list').querySelectorAll('button'));
let newBtn = null;
for(let b of newButtons) {
    if (b.previousSibling.textContent === "Forward") {
        newBtn = b;
        break;
    }
}
if (newBtn.textContent === 'Press key...') throw new Error("Button should reset text after cancellation");

// Test 3b: Valid Rebind
// Use the new button reference
newBtn.click();
// Press key
const event = new window.KeyboardEvent('keydown', { code: 'ArrowUp' });
document.dispatchEvent(event);

// Check if bound
if (input.keybinds.forward !== 'ArrowUp') throw new Error(`Failed to rebind forward to ArrowUp via UI`);
if (JSON.parse(localStorage.getItem('voxel_keybinds')).forward !== 'ArrowUp') throw new Error("bindKey failed to update localStorage");

console.log("Settings verification passed!");
