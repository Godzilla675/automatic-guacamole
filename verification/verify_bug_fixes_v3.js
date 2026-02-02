const assert = require('assert');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

// Mock localStorage
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

require('../js/blocks.js');
// Mock game parts
global.BLOCKS = window.BLOCKS;
global.BLOCK = window.BLOCK;

// Load Chunk, World and Physics
require('../js/chunk.js');
require('../js/world.js');
require('../js/physics.js');

// Mock BiomeManager and StructureManager
window.BiomeManager = class { constructor() {} getBiome() { return {}; } };
window.StructureManager = class { constructor() {} };
window.perlin = { noise: () => 0 };

console.log('Verifying Bug Fixes...');

// 1. Redstone Integrity
console.log('Testing Redstone Integrity...');
const world = new window.World();
// Override generateChunk to avoid complexity
world.generateChunk = function(cx, cz) {
    const chunk = new window.Chunk(cx, cz);
    this.chunks.set(this.getChunkKey(cx, cz), chunk);
}

world.generateChunk(0, 0);

// Test: Place dirt, place torch on top. Then remove dirt.
world.setBlock(10, 9, 10, BLOCK.DIRT);
world.setBlock(10, 10, 10, BLOCK.TORCH);
assert.strictEqual(world.getBlock(10, 10, 10), BLOCK.TORCH, 'Torch should exist on dirt');

world.setBlock(10, 9, 10, BLOCK.AIR); // Remove support

// Note: In real game, setBlock triggers checkNeighborIntegrity on 10,9,10 which checks 10,10,10.
// Then 10,10,10 checks below (10,9,10). It is AIR. So torch breaks.
// This is synchronous in my implementation.

const after = world.getBlock(10, 10, 10);
console.log('Torch became:', after);
assert.strictEqual(after, BLOCK.AIR, 'Torch should break when support removed');

console.log('Redstone Integrity Passed.');
console.log('All verified.');
