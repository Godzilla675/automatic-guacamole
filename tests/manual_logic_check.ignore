// Simple test script
const fs = require('fs');
const path = require('path');

// Mock window
global.window = {};

// Load modules
const mathContent = fs.readFileSync(path.join(__dirname, '../js/math.js'), 'utf8');
const blocksContent = fs.readFileSync(path.join(__dirname, '../js/blocks.js'), 'utf8');
const chunkContent = fs.readFileSync(path.join(__dirname, '../js/chunk.js'), 'utf8');

// Concatenate to share scope for const
const fullContent = mathContent + '\n' + blocksContent + '\n' + chunkContent;

eval(fullContent);

// Test Perlin
console.log('Testing Perlin Noise...');
const noise = window.perlin.noise(0.5, 0.5, 0.5);
if (typeof noise === 'number') {
    console.log('Perlin Noise check passed:', noise);
} else {
    console.error('Perlin Noise failed');
    process.exit(1);
}

// Test Chunk
console.log('Testing Chunk...');
const chunk = new window.Chunk(0, 0);
chunk.setBlock(0, 0, 0, 1);
if (chunk.getBlock(0, 0, 0) === 1) {
    console.log('Chunk set/get check passed');
} else {
    console.error('Chunk set/get failed');
    process.exit(1);
}

// Test Chunk Caching
chunk.setBlock(1,0,0, 0); // Air
chunk.updateVisibleBlocks();
if (chunk.visibleBlocks.length > 0) {
    console.log('Chunk caching passed:', chunk.visibleBlocks.length, 'visible blocks');
} else {
    console.error('Chunk caching failed: No visible blocks found');
    process.exit(1);
}

console.log('All logic tests passed.');
