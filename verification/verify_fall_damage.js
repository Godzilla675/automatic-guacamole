const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

const dom = new JSDOM(`<!DOCTYPE html><body><div id="game-canvas"></div></body>`, {
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
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {}, setTargetAtTime: () => {} } }; }
    createPanner() { return { connect: () => {}, positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 } }; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
    createBiquadFilter() { return { connect: () => {} }; }
    createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
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
load('js/structures.js');
load('js/chunk.js');
load('js/world.js');
load('js/physics.js');
load('js/audio.js');
load('js/network.js');
load('js/crafting.js');
load('js/player.js');
load('js/mob.js');
load('js/drop.js');

// Mock Game
class MockGame {
    constructor() {
        this.world = new window.World();
        this.physics = new window.Physics(this.world);
        this.controls = {
            forward: false, backward: false,
            left: false, right: false,
            jump: false, sneak: false, sprint: false,
            enabled: true
        };
        this.player = new window.Player(this);
        this.isMobile = false;
        this.updateHealthUI = () => {};
    }
}

const game = new MockGame();
global.window.game = game;

// Generate Chunk 0,0
game.world.generateChunk(0, 0);

// Setup test scenario
// Create a flat ground at y=10
for(let x=0; x<16; x++) {
    for(let z=0; z<16; z++) {
        game.world.setBlock(x, 10, z, window.BLOCK.STONE);
        // Clear above just in case
        for(let y=11; y<30; y++) {
             game.world.setBlock(x, y, z, window.BLOCK.AIR);
        }
    }
}

// Position player high up
game.player.x = 8.5;
game.player.z = 8.5;
game.player.y = 20.0;
game.player.vy = 0;
game.player.fallDistance = 0;
game.player.health = 20;

console.log("Initial Y:", game.player.y);

// Simulate physics updates until grounded
const dt = 1/60;
let ticks = 0;
while (!game.player.onGround && ticks < 1000) {
    game.player.update(dt);
    ticks++;
}

console.log("Landed at Tick:", ticks);
console.log("Final Y:", game.player.y);
console.log("Fall Distance Accumulated:", game.player.fallDistance);
console.log("Final Health:", game.player.health);

if (Math.abs(game.player.y - 11.0) < 0.01) {
    if (game.player.health === 14) {
        console.log("PASS: Fall damage is correct.");
    } else if (game.player.health === 15) {
        console.log("FAIL: Fall damage is too low (missing last frame).");
    } else {
        console.log(`FAIL: Expected health 14, got ${game.player.health}`);
    }
} else {
    console.log("FAIL: Player did not land at expected height (11.0)");
}
