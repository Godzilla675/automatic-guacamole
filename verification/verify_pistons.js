const assert = require('assert');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

require('../js/blocks.js');
global.BLOCKS = window.BLOCKS;
global.BLOCK = window.BLOCK;

require('../js/chunk.js');
global.Chunk = window.Chunk; // Fix for Node scope

require('../js/world.js');
require('../js/physics.js');

window.BiomeManager = class { constructor() {} getBiome() { return {}; } };
window.StructureManager = class { constructor() {} };
window.perlin = { noise: () => 0 };
window.soundManager = { play: () => {} };

console.log('Verifying Pistons...');

const world = new window.World();
world.generateChunk(0, 0);

const PISTON_POS = {x: 10, y: 10, z: 10};
const BLOCK_POS = {x: 10, y: 10, z: 11};
const PUSHED_POS = {x: 10, y: 10, z: 12};

// 1. Normal Piston Push
console.log('Testing Normal Piston Push...');
world.setBlock(PISTON_POS.x, PISTON_POS.y, PISTON_POS.z, BLOCK.PISTON);
world.setMetadata(PISTON_POS.x, PISTON_POS.y, PISTON_POS.z, 3); // Face South (Z+)

world.setBlock(BLOCK_POS.x, BLOCK_POS.y, BLOCK_POS.z, BLOCK.DIRT);

// Extend
world.extendPiston(PISTON_POS.x, PISTON_POS.y, PISTON_POS.z, 3);

// Verify Head
assert.strictEqual(world.getBlock(BLOCK_POS.x, BLOCK_POS.y, BLOCK_POS.z), BLOCK.PISTON_HEAD, 'Piston Head should be at BLOCK_POS');
// Verify Block Pushed
assert.strictEqual(world.getBlock(PUSHED_POS.x, PUSHED_POS.y, PUSHED_POS.z), BLOCK.DIRT, 'Dirt should be pushed to PUSHED_POS');
// Verify Base Extended
assert.strictEqual(world.getMetadata(PISTON_POS.x, PISTON_POS.y, PISTON_POS.z) & 8, 8, 'Piston Base should be extended');

// Retract
console.log('Testing Normal Piston Retract...');
world.retractPiston(PISTON_POS.x, PISTON_POS.y, PISTON_POS.z, 3 | 8);

// Verify Head Gone
assert.strictEqual(world.getBlock(BLOCK_POS.x, BLOCK_POS.y, BLOCK_POS.z), BLOCK.AIR, 'Piston Head should be gone');
// Verify Block Stayed (Normal Piston doesn't pull)
assert.strictEqual(world.getBlock(PUSHED_POS.x, PUSHED_POS.y, PUSHED_POS.z), BLOCK.DIRT, 'Dirt should stay pushed');


// 2. Sticky Piston Pull
console.log('Testing Sticky Piston Pull...');
world.setBlock(PISTON_POS.x, PISTON_POS.y, PISTON_POS.z, BLOCK.STICKY_PISTON);
world.setMetadata(PISTON_POS.x, PISTON_POS.y, PISTON_POS.z, 3);

// Move block back to front manually for test
world.setBlock(BLOCK_POS.x, BLOCK_POS.y, BLOCK_POS.z, BLOCK.DIRT);
world.setBlock(PUSHED_POS.x, PUSHED_POS.y, PUSHED_POS.z, BLOCK.AIR);

// Extend
world.extendPiston(PISTON_POS.x, PISTON_POS.y, PISTON_POS.z, 3);
// Verify Push again
assert.strictEqual(world.getBlock(PUSHED_POS.x, PUSHED_POS.y, PUSHED_POS.z), BLOCK.DIRT, 'Dirt pushed');

// Retract
world.retractPiston(PISTON_POS.x, PISTON_POS.y, PISTON_POS.z, 3 | 8);

// Verify Pull
assert.strictEqual(world.getBlock(BLOCK_POS.x, BLOCK_POS.y, BLOCK_POS.z), BLOCK.DIRT, 'Dirt should be pulled back');
assert.strictEqual(world.getBlock(PUSHED_POS.x, PUSHED_POS.y, PUSHED_POS.z), BLOCK.AIR, 'Pushed spot should be empty');

console.log('Pistons Verified!');
