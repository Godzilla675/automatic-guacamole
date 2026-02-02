const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');
const path = require('path');

// Setup JSDOM
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
    <div id="pause-screen">
        <button id="resume-btn"></button>
        <button id="settings-btn"></button>
        <button id="save-game"></button>
        <button id="load-game"></button>
        <button id="main-menu-btn"></button>
    </div>
    <div id="notifications-container"></div>
    <!-- Other UI elements to prevent crashes -->
    <div id="game-canvas"></div>
    <div id="chat-input"></div><div id="chat-messages"></div>
    <div id="hotbar"></div>
    <div id="settings-screen"></div>
    <div id="volume-slider"></div><div id="fov-slider"></div><div id="render-dist-slider"></div>
    <div id="keybinds-list"></div>
    <div id="inventory-screen"></div><div id="inventory-grid"></div>
    <div id="crafting-screen"></div>
    <div id="chest-screen"></div><div id="chest-grid"></div>
    <div id="furnace-screen"></div><div id="furnace-progress"></div><div id="furnace-burn"></div>
    <div id="recipe-book-screen"></div>
    <div id="trading-screen"></div>
    <div id="health-bar"></div><div id="hunger-bar"></div><div id="damage-overlay"></div>
    <div id="mobile-controls"></div><div id="crosshair"></div>
</body>
</html>
`, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable"
});

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.navigator = { userAgent: 'node' };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.prompt = (msg) => 'test_save';

// Mocks
global.World = class {
    constructor() { this.blockEntities = new Map(); }
    saveWorld() { console.log('World Saved'); }
    loadWorld() { console.log('World Loaded'); }
};
global.Physics = class {};
global.Player = class { constructor() { this.inventory = []; } };
global.NetworkManager = class {};
global.CraftingSystem = class { initUI() {} };
global.ChatManager = class {};
global.Renderer = class { resize() {} };
global.Mob = class {};
global.Drop = class {};
global.BLOCK = {};
global.BLOCKS = {};
global.TOOLS = {};
global.MOB_TYPE = {};
global.soundManager = { play: () => {} };

// ParticleSystem Mock
global.ParticleSystem = class { constructor(game) {} };
window.ParticleSystem = global.ParticleSystem;

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

// Mock Canvas
const canvas = document.getElementById('game-canvas');
canvas.getContext = () => ({ setTransform: () => {}, fillRect: () => {} });
canvas.requestPointerLock = () => {};

// Load UI Code
const uiCode = fs.readFileSync('js/ui.js', 'utf8');
eval(uiCode);
global.UIManager = window.UIManager;

const inputCode = fs.readFileSync('js/input.js', 'utf8');
eval(inputCode);
global.InputManager = window.InputManager;

const gameCode = fs.readFileSync('js/game.js', 'utf8');
eval(gameCode);
global.Game = window.Game;

// Test
console.log('--- Verifying Save/Load UI ---');
const game = new window.Game();
game.ui.init();

// Mock world methods
let saveCalled = false;
let loadCalled = false;
game.world.saveWorld = () => { saveCalled = true; console.log("saveWorld called"); };
game.world.loadWorld = () => { loadCalled = true; console.log("loadWorld called"); };

const saveBtn = document.getElementById('save-game');
const loadBtn = document.getElementById('load-game');

if (!saveBtn) throw new Error("Save Game button not found");
if (!loadBtn) throw new Error("Load Game button not found");

// Click Save
console.log("Clicking Save...");
saveBtn.click();
if (!saveCalled) throw new Error("Save button did not trigger world.saveWorld");

// Click Load
console.log("Clicking Load...");
loadBtn.click();
if (!loadCalled) throw new Error("Load button did not trigger world.loadWorld");

console.log('Save/Load UI Verified!');
