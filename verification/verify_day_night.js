const fs = require('fs');
const assert = require('assert');

// Mock Browser Environment
global.window = {
    devicePixelRatio: 1,
    innerWidth: 800,
    innerHeight: 600,
    BLOCKS: {},
    BLOCK: { WATER: 7, AIR: 0, SIGN_POST: 206, WALL_SIGN: 207 },
    addEventListener: () => {}
};
global.document = {
    getElementById: () => ({ textContent: '' })
};

// Global variables expected by renderer
global.BLOCK = window.BLOCK;
global.BLOCKS = {
    7: { name: 'water', liquid: true }
};
window.BLOCKS = global.BLOCKS;

// Mock Canvas and Context
const ctxCalls = [];
const mockCtx = new Proxy({}, {
    get: (target, prop) => {
        if (prop === 'setTransform') return () => {};
        if (prop === 'createLinearGradient') {
            return () => ({ addColorStop: () => {} });
        }
        if (prop === 'beginPath' || prop === 'fill' || prop === 'stroke') return () => {};
        return (...args) => {
            ctxCalls.push({ method: prop, args });
        };
    },
    set: (target, prop, value) => {
        ctxCalls.push({ property: prop, value });
        return true;
    }
});

const mockCanvas = {
    style: {},
    width: 800,
    height: 600,
    getContext: () => mockCtx
};

// Mock Game
const mockGame = {
    canvas: mockCanvas,
    ctx: mockCtx,
    gameTime: 0,
    dayLength: 24000,
    sunBrightness: 1.0,
    renderDistance: 100,
    fov: 60,
    player: {
        x: 0, y: 10, z: 0,
        yaw: 0, pitch: 0,
        height: 1.8
    },
    world: {
        getBlock: () => 0,
        getChunk: () => null,
        getBlockEntity: () => null,
        weather: 'clear'
    },
    mobs: [],
    vehicles: [],
    drops: [],
    projectiles: [],
    tntPrimed: [],
    particles: { particles: [] },
    network: {}
};

// Load Renderer
const rendererCode = fs.readFileSync('js/renderer.js', 'utf8');
eval(rendererCode);

const Renderer = window.Renderer;
const renderer = new Renderer(mockGame);

// Test 1: Sunrise (Time 0) - Look East (-PI/2) to see Sun
console.log("Testing Sunrise (Looking East)...");
mockGame.gameTime = 0; // Cycle 0
mockGame.player.yaw = -Math.PI / 2;
ctxCalls.length = 0; // Clear logs
renderer.render();

// Check if fillStyle was set (Sky)
const skyFill = ctxCalls.find(c => c.property === 'fillStyle');
console.log("Sky Fill:", skyFill);

const sunCalls = ctxCalls.filter(c => c.method === 'arc');
console.log("Sun calls (arc):", sunCalls.length);

// Test 2: Night (Time 12000 - Cycle 0.5) - Look East (-PI/2) to see Moon (Sun is West)
console.log("Testing Night (Looking East)...");
mockGame.gameTime = 12000;
mockGame.player.yaw = -Math.PI / 2;
ctxCalls.length = 0;
renderer.render();

const nightFill = ctxCalls.find(c => c.property === 'fillStyle');
console.log("Night Fill:", nightFill);

const moonCalls = ctxCalls.filter(c => c.method === 'fillRect' && c.args.length === 4 && c.args[0] !== 0); // Exclude sky clear
console.log("Moon calls (fillRect):", moonCalls.length);

if (sunCalls.length > 0 && moonCalls.length > 0) {
    console.log("SUCCESS: Sun and Moon detected!");
} else {
    console.log("FAILURE: Sun or Moon missing.");
}
