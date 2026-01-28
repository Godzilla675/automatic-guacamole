const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    runScripts: "dangerously",
    resources: "usable"
});
global.window = dom.window;
global.document = dom.window.document;

// Mock dependencies
global.window.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.window.AudioContext = class { createGain() { return { gain: { value: 1, linearRampToValueAtTime: () => {} }, connect: () => {} }; } };

// Load scripts
const scripts = [
    'js/math.js',
    'js/blocks.js',
    'js/network.js',
    'js/chunk.js',
    'js/biome.js',
    'js/structures/structure.js',
    'js/structures/tree.js',
    'js/structures/cactus.js',
    'js/structures/well.js',
    'js/structures.js',
    'js/world.js',
    'js/physics.js',
    'js/player.js',
    'js/mob.js',
    'js/drop.js',
    'js/crafting.js',
    'js/chat.js',
    'js/ui.js',
    'js/input.js',
    'js/renderer.js',
    'js/game.js'
];

scripts.forEach(script => {
    try {
        const content = fs.readFileSync(path.join(__dirname, '../', script), 'utf8');
        dom.window.eval(content);
    } catch(e) {
        console.error(`Error loading ${script}:`, e);
    }
});

const Game = dom.window.Game;
const BLOCK = dom.window.BLOCK;

console.log('--- Verifying Fishing ---');

if (BLOCK.FISHING_ROD) {
    console.log('✅ FISHING_ROD block/item defined (ID: ' + BLOCK.FISHING_ROD + ')');
} else {
    console.error('❌ FISHING_ROD not defined.');
}

// Mock canvas
dom.window.HTMLCanvasElement.prototype.getContext = () => ({});

const canvas = dom.window.document.createElement('canvas');
canvas.id = 'game-canvas';
dom.window.document.body.appendChild(canvas);

// Mock HUD
const hud = dom.window.document.createElement('div');
hud.id = 'hud';
hud.innerHTML = `
    <div id="chat-container"><div id="chat-messages"></div><input id="chat-input" /></div>
    <div id="hotbar"></div>
    <div id="health-bar-container"><div id="health-bar"></div></div>
    <div id="hunger-bar-container"><div id="hunger-bar"></div></div>
    <div id="damage-overlay"></div>
    <div id="crosshair"></div>
    <div id="debug-info">
        <span id="fps"></span>
        <span id="position"></span>
        <span id="block-count"></span>
        <span id="game-time"></span>
    </div>
`;
dom.window.document.body.appendChild(hud);

const game = new Game();
// Mock init stuff
game.player = {
    x: 0, y: 0, z: 0, yaw: 0, pitch: 0,
    inventory: new Array(36).fill(null),
    selectedSlot: 0,
    update: () => {},
    height: 1.8
};
game.world = {
    getBlock: () => BLOCK.AIR,
    blockEntities: new Map() // needed for update
};
game.physics = { raycast: () => null };

// Equip Rod
game.player.inventory[0] = { type: BLOCK.FISHING_ROD, count: 1 };
console.log('Equipped Fishing Rod.');

// Mock soundManager
dom.window.soundManager = { play: (s) => console.log(`Sound: ${s}`) };

// Cast
console.log('Attempting to cast bobber...');
game.startAction(false); // Right click

if (game.bobber) {
    console.log('✅ Bobber created.');
    console.log(`Bobber state: ${game.bobber.state}`);
} else {
    console.error('❌ Bobber NOT created.');
}

// Reel in
console.log('Attempting to reel in...');
game.startAction(false);

if (!game.bobber) {
    console.log('✅ Bobber reeled in (removed).');
} else {
    console.error('❌ Bobber still exists.');
}

console.log('--- Verification Complete ---');
