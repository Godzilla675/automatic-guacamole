const assert = require('assert');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

// Mock Perlin
global.window.perlin = {
    noise: (x,y,z) => 0.1 // Low noise -> Solid netherrack
};

// Mock BiomeManager
global.window.BiomeManager = class {
    constructor() {}
    getBiome() { return { name: 'Nether' }; }
};

// Mock StructureManager
global.window.StructureManager = class {
    constructor() {}
    generateTree() {}
    generateCactus() {}
    generateVillage() {}
    generateStructure() {}
};

// Mock Blocks
global.window.BLOCK = {
    AIR: 0,
    BEDROCK: 12,
    NETHERRACK: 190,
    LAVA: 197,
    QUARTZ_ORE: 194,
    GLOWSTONE: 192
};
global.window.BLOCKS = {};
global.BLOCK = global.window.BLOCK;
global.BLOCKS = global.window.BLOCKS;

// Load Chunk and World
const fs = require('fs');
const chunkCode = fs.readFileSync('./js/chunk.js', 'utf8');
eval(chunkCode);
global.Chunk = window.Chunk;
const worldCode = fs.readFileSync('./js/world.js', 'utf8');
eval(worldCode);

describe('Nether Verification', () => {
    it('should generate netherrack and lava', () => {
        const world = new window.World();
        world.dimension = 'nether';

        world.generateChunk(0, 0);
        const chunk = world.getChunk(0, 0);

        assert.strictEqual(chunk.getBlock(0, 0, 0), window.BLOCK.BEDROCK, "Bottom bedrock missing");
        assert.strictEqual(chunk.getBlock(0, 127, 0), window.BLOCK.BEDROCK, "Top bedrock missing");

        // Check solid
        assert.strictEqual(chunk.getBlock(0, 50, 0), window.BLOCK.NETHERRACK, "Middle should be netherrack with low noise");

        // Mock noise high for cave/lava check
        global.window.perlin.noise = (x,y,z) => 0.8; // High noise -> Air/Lava

        world.chunks.clear();
        world.generateChunk(0, 0);
        const chunk2 = world.getChunk(0, 0);

        assert.strictEqual(chunk2.getBlock(0, 10, 0), window.BLOCK.LAVA, "Low Y high noise should be lava");
        assert.strictEqual(chunk2.getBlock(0, 50, 0), window.BLOCK.AIR, "High Y high noise should be air");
    });
});
