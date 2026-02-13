const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
};

// Mock AudioContext
global.window.AudioContext = class {
    createBuffer() { return {}; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
    createBiquadFilter() { return { connect: () => {} }; }
    createGain() { return { gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} }, connect: () => {} }; }
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    resume() {}
};

// Mock Perlin
global.window.perlin = {
    noise: () => 0.5
};

// Mock other browser stuff
global.WebSocket = class {
    constructor() {}
    send() {}
    close() {}
};

const fs = require('fs');
const path = require('path');

function loadScript(filename) {
    const content = fs.readFileSync(path.join(__dirname, '../js', filename), 'utf8');
    try {
        eval(content);
    } catch (e) {
        console.error(`Error loading ${filename}:`, e);
    }
}

loadScript('math.js');
loadScript('blocks.js');
if (!global.BLOCK && window.BLOCK) global.BLOCK = window.BLOCK;
if (!global.BLOCKS && window.BLOCKS) global.BLOCKS = window.BLOCKS;

loadScript('biome.js');
loadScript('structures.js');
loadScript('chunk.js');
if (!global.Chunk && window.Chunk) global.Chunk = window.Chunk;

loadScript('world.js');

console.log("=== Testing Lighting Bug ===");

const world = new window.World();
// Generate a few chunks to cover our test area
// -1 to +1
for(let x=-1; x<=1; x++) {
    for(let z=-1; z<=1; z++) {
        world.generateChunk(x, z);
    }
}
world.generateChunk(6, 6); // For Test Case 4

let failed = false;

function assert(condition, message) {
    if (!condition) {
        console.error(`FAIL: ${message}`);
        failed = true;
    } else {
        console.log(`PASS: ${message}`);
    }
}

function checkLight(x, y, z, expected) {
    const actual = world.getLight(x, y, z);
    assert(actual === expected, `Light at ${x},${y},${z} should be ${expected}, got ${actual}`);
    return actual;
}

const cy = 64; // Mid-air

// Test Case 1: Basic
console.log("\n--- Test Case 1: Basic ---");
world.setBlock(0, cy, 0, BLOCK.TORCH);
checkLight(0, cy, 0, 15);
checkLight(1, cy, 0, 14);

world.setBlock(0, cy, 0, BLOCK.AIR);
checkLight(0, cy, 0, 0);
checkLight(1, cy, 0, 0);


// Test Case 2: Overlap
console.log("\n--- Test Case 2: Overlap ---");
// T1 at 0, cy, 0
// T2 at 10, cy, 0
world.setBlock(0, cy, 0, BLOCK.TORCH);
world.setBlock(10, cy, 0, BLOCK.TORCH);

checkLight(0, cy, 0, 15);
checkLight(10, cy, 0, 15);
// Midpoint 5.
// Dist to 0 is 5 -> 10
// Dist to 10 is 5 -> 10
checkLight(5, cy, 0, 10);

console.log("Removing T1...");
world.setBlock(0, cy, 0, BLOCK.AIR);

// T1 is gone. T2 remains.
// At 0, cy, 0. Distance to T2 (10, cy, 0) is 10.
// Light should be 15 - 10 = 5.
checkLight(0, cy, 0, 5);
checkLight(5, cy, 0, 10);
checkLight(10, cy, 0, 15);

world.setBlock(10, cy, 0, BLOCK.AIR); // Cleanup


// Test Case 3: External Source (The Dark Spot Bug)
console.log("\n--- Test Case 3: External Source ---");
// T1 at 0, cy, 0
// T2 at 16, cy, 0.
// Reset radius is 15. T2 is at distance 16 from T1.
// T2 is OUTSIDE the reset box of T1.

world.setBlock(0, cy, 0, BLOCK.TORCH);
world.setBlock(16, cy, 0, BLOCK.TORCH);

// Check before removal
checkLight(0, cy, 0, 15);
checkLight(16, cy, 0, 15);
// At 15, cy, 0 (between them).
// From T1: dist 15. Light 0.
// From T2: dist 1. Light 14.
// Expected: 14.
checkLight(15, cy, 0, 14);

console.log("Removing T1...");
world.setBlock(0, cy, 0, BLOCK.AIR);

// Recalc radius 15 around 0. Range -15 to +15.
// 15 is inside range. It gets reset to 0.
// T2 at 16 is OUTSIDE range. It is NOT reset (remains 15).
// T2 is NOT added to sources (as it wasn't scanned).
// 15 needs to get light from 16.
// Expected: 14.
const val = checkLight(15, cy, 0, 14);
if (val === 0) {
    console.log("-> REPRODUCED DARK SPOT BUG: Light reset to 0 and not restored from outside.");
}

world.setBlock(16, cy, 0, BLOCK.AIR); // Cleanup


// Test Case 4: Residual Check
console.log("\n--- Test Case 4: Residual Check ---");
// Try to reproduce "level 4" ghost.
// Place torch.
world.setBlock(100, cy, 100, BLOCK.TORCH);
checkLight(100, cy, 100, 15);
world.setBlock(100, cy, 100, BLOCK.AIR);
checkLight(100, cy, 100, 0);

if (failed) {
    console.log("\nFAILED: Some tests failed.");
    process.exit(1);
} else {
    console.log("\nSUCCESS: All tests passed.");
}
