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

// Load modules
// We need to load them in order
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

loadScript('chunk.js');
// Ensure global Chunk is available if it's not attached to window in file (it is window.Chunk = Chunk)
if (!global.Chunk && window.Chunk) global.Chunk = window.Chunk;

loadScript('world.js');

// Test Lighting
console.log("Testing Lighting System...");

const world = new window.World();
// Generate a chunk
world.generateChunk(0, 0);

// Get a position for the torch (make sure it's valid)
const cx = 8;
const cz = 8;
const cy = world.getHighestBlockY(cx, cz) + 1; // 1 block above ground

console.log(`Placing torch at ${cx}, ${cy}, ${cz}`);

// Check light before
const lightBefore = world.getLight(cx, cy, cz);
console.log(`Light at ${cx}, ${cy}, ${cz} before: ${lightBefore}`);

// Set Torch
world.setBlock(cx, cy, cz, window.BLOCK.TORCH);

// Check light after
const lightAfter = world.getLight(cx, cy, cz);
console.log(`Light at ${cx}, ${cy}, ${cz} after: ${lightAfter}`);

// Check neighbor
const lightNeighbor = world.getLight(cx + 1, cy, cz);
console.log(`Light at ${cx + 1}, ${cy}, ${cz} (neighbor): ${lightNeighbor}`);

if (lightAfter === 15 && lightNeighbor === 14) {
    console.log("SUCCESS: Torch placed and light propagated correctly.");
} else {
    console.error("FAILURE: Light values incorrect.");
    process.exit(1);
}

// Remove Torch
console.log("Removing torch...");
world.setBlock(cx, cy, cz, window.BLOCK.AIR);

const lightRemoved = world.getLight(cx, cy, cz);
console.log(`Light at ${cx}, ${cy}, ${cz} after removal: ${lightRemoved}`);
const lightNeighborRemoved = world.getLight(cx + 1, cy, cz);
console.log(`Light at ${cx + 1}, ${cy}, ${cz} after removal: ${lightNeighborRemoved}`);

if (lightRemoved === 0 && lightNeighborRemoved === 0) {
    console.log("SUCCESS: Torch removed and light cleared correctly.");
} else {
    console.error("FAILURE: Light cleanup incorrect.");
     // Note: Our simple implementation currently sets light to 0 in radius, so it should be 0 unless other sources exist.
     // If this fails, check recalcLocalLight logic.
    process.exit(1);
}
