const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

const dom = new JSDOM(`<!DOCTYPE html><body>
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
</body>`, {
  url: "http://localhost/",
  runScripts: "dangerously",
  resources: "usable"
});

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.localStorage = { getItem: () => null, setItem: () => {} };
global.navigator = { userAgent: "node" };

// Mock AudioContext
global.window.AudioContext = class {
    constructor() { this.sampleRate = 44100; }
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {}, buffer: null, loop: false, playbackRate: { value: 1 } }; }
    createBiquadFilter() { return { connect: () => {}, frequency: { value: 0 } }; }
    resume() {}
    get state() { return 'running'; }
};

// Mock Canvas
const canvas = document.getElementById('game-canvas');
canvas.getContext = () => ({
    setTransform: () => {},
    fillStyle: '',
    fillRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    fill: () => {},
    strokeRect: () => {},
});
canvas.requestPointerLock = () => {};

// Mock Perlin
global.window.perlin = { noise: () => 0 };

const load = (path) => {
    const content = fs.readFileSync(path, 'utf8');
    dom.window.eval(content);
};

load('js/blocks.js');
load('js/biome.js');
load('js/structures/Tree.js', 'js/structures/Cactus.js', 'js/structures/Well.js', 'js/structures.js');
load('js/chunk.js');
load('js/world.js');
load('js/physics.js');
load('js/audio.js');
load('js/network.js');
load('js/crafting.js');
load('js/player.js');
load('js/mob.js');
load('js/drop.js');
load('js/chat.js');
load('js/ui.js');
load('js/input.js');
load('js/renderer.js');
load('js/game.js');
load('js/main.js'); // Defines Game

// Setup Game
const game = new window.Game();
global.window.game = game;

// Prevent Game.init from running actual loops/network
game.network = { connect: () => {}, sendPosition: () => {} };
game.world.generateChunk(0,0);

// Setup Player at 0,0,0
// Height 1.8. Box: x[-0.3, 0.3], y[0, 1.8], z[-0.3, 0.3]
game.player.x = 0;
game.player.y = 0;
game.player.z = 0;
game.player.health = 20;

// Test 1: Near Miss (Sphere Hit, AABB Miss)
// Position projectile at (0.4, 0.9, 0)
// 0.4 > 0.3 (Player half width) -> AABB MISS
// Dist to center (0, 0.9, 0) is 0.4.
// Sphere Radius 1.0 > 0.4 -> Sphere HIT
console.log("Test 1: Projectile at (0.4, 0.9, 0). Should HIT current (Sphere), MISS new (AABB).");

game.projectiles = [];
game.projectiles.push({
    x: 0.4, y: 0.9, z: 0,
    vx: 0, vy: 0, vz: 0,
    life: 1.0
});

// Run update for 1 frame
game.update(16);

if (game.player.health < 20) {
    console.log("RESULT: HIT (Damage taken)");
} else {
    console.log("RESULT: MISS (No damage)");
}

// Reset Health
game.player.health = 20;

// Test 2: Direct Hit
console.log("Test 2: Projectile at (0.0, 0.9, 0). Should HIT both.");
game.projectiles = [];
game.projectiles.push({
    x: 0.0, y: 0.9, z: 0,
    vx: 0, vy: 0, vz: 0,
    life: 1.0
});

game.update(16);

if (game.player.health < 20) {
    console.log("RESULT: HIT (Damage taken)");
} else {
    console.log("RESULT: MISS (No damage)");
}
