const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

// Mocks
window.perlin = { noise: () => 0 };
window.BiomeManager = class {
    constructor() {}
    getBiome() { return { name: 'Plains', heightOffset: 0 }; }
};
window.StructureManager = class {
    constructor() {}
    generateTree() {}
    generateCactus() {}
    generateVillage() {}
    generateStructure() {}
};

// Load Code
require('../js/blocks.js');
global.BLOCK = window.BLOCK;
global.BLOCKS = window.BLOCKS;

const chunkCode = fs.readFileSync('js/chunk.js', 'utf8');
eval(chunkCode);
global.Chunk = window.Chunk;

const worldCode = fs.readFileSync('js/world.js', 'utf8');
eval(worldCode);

// Test
const world = new window.World();

console.log("Starting Redstone Logic Verification...");

// Force generation of chunk 0,0
world.generateChunk(0, 0);

// 1. Test Source (Torch) + Wire
console.log("Test 1: Torch powers adjacent wire");
world.setBlock(0, 50, 0, window.BLOCK.REDSTONE_TORCH);
world.setBlock(1, 50, 0, window.BLOCK.REDSTONE_WIRE);

console.log("Active Redstone size:", world.activeRedstone.size);

// Trigger updates
let loops = 0;
while(world.activeRedstone.size > 0 && loops < 20) {
    world.updateRedstone();
    loops++;
}

let wireMeta = world.getMetadata(1, 50, 0);
console.log("Final Wire Meta:", wireMeta);
assert.strictEqual(wireMeta, 15, `Wire next to torch should have power 15, got ${wireMeta}`);

// 2. Test Propagation
console.log("Test 2: Wire propagates power");
world.setBlock(2, 50, 0, window.BLOCK.REDSTONE_WIRE);
world.setBlock(3, 50, 0, window.BLOCK.REDSTONE_WIRE);

loops = 0;
while(world.activeRedstone.size > 0 && loops < 50) {
    world.updateRedstone();
    loops++;
}

assert.strictEqual(world.getMetadata(2, 50, 0), 14, `Wire at dist 2 should be 14, got ${world.getMetadata(2, 50, 0)}`);
assert.strictEqual(world.getMetadata(3, 50, 0), 13, `Wire at dist 3 should be 13, got ${world.getMetadata(3, 50, 0)}`);

// 3. Test Lamp
console.log("Test 3: Wire powers Lamp");
world.setBlock(4, 50, 0, window.BLOCK.REDSTONE_LAMP);
// Connect wire
world.setBlock(3, 50, 0, window.BLOCK.REDSTONE_WIRE); // Reset just in case

loops = 0;
while(world.activeRedstone.size > 0 && loops < 50) {
    world.updateRedstone();
    loops++;
}

let lampType = world.getBlock(4, 50, 0);
assert.strictEqual(lampType, window.BLOCK.REDSTONE_LAMP_ACTIVE, `Lamp should be active (ID ${window.BLOCK.REDSTONE_LAMP_ACTIVE}), got ${lampType}`);

// 4. Test Turning Off
console.log("Test 4: Removing Torch turns off power");
world.setBlock(0, 50, 0, window.BLOCK.AIR);

loops = 0;
while(world.activeRedstone.size > 0 && loops < 100) {
    world.updateRedstone();
    loops++;
}

assert.strictEqual(world.getMetadata(1, 50, 0), 0, "Wire 1 should be 0");
assert.strictEqual(world.getMetadata(2, 50, 0), 0, "Wire 2 should be 0");
assert.strictEqual(world.getMetadata(3, 50, 0), 0, "Wire 3 should be 0");
assert.strictEqual(world.getBlock(4, 50, 0), window.BLOCK.REDSTONE_LAMP, "Lamp should be inactive");

console.log("Redstone Logic Verified Successfully!");
