const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM('<!DOCTYPE html><body></body>');
global.window = dom.window;
global.document = dom.window.document;

// Mock Perlin
window.perlin = {
    noise: (x, y, z) => 0
};

// Load scripts
const scripts = ['js/blocks.js', 'js/biome.js', 'js/structures/Tree.js', 'js/structures/Cactus.js', 'js/structures/Well.js', 'js/structures.js', 'js/chunk.js', 'js/world.js'];
scripts.forEach(s => {
    const c = fs.readFileSync(s, 'utf8');
    eval(c);
    if (s === 'js/blocks.js') {
        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
    }
});
global.Chunk = window.Chunk;
global.World = window.World;
global.BiomeManager = window.BiomeManager;
global.StructureManager = window.StructureManager;

const world = new window.World();

// Generate Chunk
world.generateChunk(0, 0);

// Test placing block at y=100
world.setBlock(0, 100, 0, window.BLOCK.STONE);
const b = world.getBlock(0, 100, 0);
if (b !== window.BLOCK.STONE) {
    // Debug
    const c = world.getChunk(0,0);
    console.log(`Chunk MaxHeight: ${c.maxHeight}`);
    console.log(`Block at 100: ${b}`);
    throw new Error("Failed to place block at y=100");
}

console.log("Verified height limit increase to 128.");
