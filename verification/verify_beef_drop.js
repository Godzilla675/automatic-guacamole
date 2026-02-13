const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const assert = require('assert');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    runScripts: "dangerously",
    resources: "usable"
});
global.window = dom.window;
global.document = dom.window.document;

// Mock LocalStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) { return store[key] || null; },
    setItem: function(key, value) { store[key] = value.toString(); },
    removeItem: function(key) { delete store[key]; },
    clear: function() { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock AudioContext
dom.window.AudioContext = class {
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
    createBiquadFilter() { return { connect: () => {} }; }
    resume() {}
    get state() { return 'running'; }
};

// Load scripts
const scripts = [
    'js/math.js',
    'js/blocks.js',
    'js/chunk.js',
    'js/biome.js',
    'js/structures/structure.js',
    'js/structures/tree.js',
    'js/structures/cactus.js',
    'js/structures/well.js',
    'js/structures.js',
    'js/world.js',
    'js/physics.js',
    'js/entity.js',
    'js/vehicle.js',
    'js/drop.js',
    'js/mob.js',
    'js/player.js',
    'js/plugin.js',
    'js/particles.js',
    'js/minimap.js',
    'js/achievements.js',
    'js/tutorial.js',
    'js/network.js',
    'js/crafting.js',
    'js/chat.js',
    'js/ui.js',
    'js/input.js',
    'js/renderer.js',
    'js/audio.js',
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

console.log('--- Verifying Beef Drop ---');

const Game = dom.window.Game;
const Mob = dom.window.Mob;
const BLOCK = dom.window.BLOCK;
const MOB_TYPE = dom.window.MOB_TYPE;

// Mock canvas
dom.window.HTMLCanvasElement.prototype.getContext = () => ({});
const canvas = dom.window.document.createElement('canvas');
canvas.id = 'game-canvas';
dom.window.document.body.appendChild(canvas);

// Mock SoundManager
dom.window.soundManager = { play: () => {} };

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
    <div id="debug-info"></div>
    <div id="mobile-controls"></div>
`;
dom.window.document.body.appendChild(hud);

const game = new Game();
game.drops = []; // Ensure drops array exists
game.world = { getBlock: () => 0 }; // Mock world
game.player = { x:0, y:0, z:0, update:()=>{} }; // Mock player

// Create Cow
const cow = new Mob(game, 0, 50, 0, MOB_TYPE.COW);
console.log('Cow created.');

// Kill Cow
console.log('Killing cow...');
cow.takeDamage(100);

if (cow.isDead) {
    console.log('✅ Cow is dead.');
} else {
    console.error('❌ Cow is not dead.');
    process.exit(1);
}

// Check drops
const drops = game.drops;
console.log(`Drops count: ${drops.length}`);
drops.forEach(d => console.log(`Dropped: ${d.type}`));

const hasBeef = drops.some(d => d.type === BLOCK.ITEM_BEEF);
if (hasBeef) {
    console.log('✅ Cow dropped Beef.');
} else {
    console.error('❌ Cow did NOT drop Beef.');
    process.exit(1);
}

const hasLeather = drops.some(d => d.type === BLOCK.ITEM_LEATHER);
if (hasLeather) {
    console.log('ℹ️ Cow also dropped Leather (Random chance).');
}

console.log('--- Verification Complete ---');
