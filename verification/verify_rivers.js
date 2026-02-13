const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html><body></body>`, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost/"
});

dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.navigator = { userAgent: "node" };

// Mock minimal dependencies
dom.window.AudioContext = class {};
dom.window.localStorage = { getItem: () => null, setItem: () => {} };

// Mock Perlin - controlled via callback
let noiseCallback = () => 0;
dom.window.perlin = {
    noise: (x, y, z) => noiseCallback(x, y, z)
};

const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error(`Failed to load ${f}:`, e);
    }
};

// Load dependencies for World
['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js'].forEach(load);

// Override Perlin after loading
dom.window.perlin = {
    noise: (x, y, z) => noiseCallback(x, y, z)
};

describe('River Generation Tests', () => {
    let world;
    const { BLOCK } = dom.window;

    beforeEach(() => {
        world = new dom.window.World();
        world.seed = 1000;
        // Reset chunks
        world.chunks.clear();
    });

    it('should generate normal terrain when noise indicates No River', () => {
        // We need to handle different noise calls:
        // Terrain/Biome: z == seed (1000)
        // River: z == seed + 100 (1100)
        // Cave: z is small (coordinate)

        noiseCallback = (x, y, z) => {
            if (Math.abs(z - 1000) < 1) return 0.5; // Terrain (High)
            if (Math.abs(z - 1100) < 1) return 0.5; // River (No River)
            return 0.0; // Caves (No Caves)
        };

        world.generateChunk(0, 0);

        // Pick a spot in middle of chunk
        const x = 8, z = 8;
        // Check block at 16 (Surface Water Level)
        const blockAt16 = world.getBlock(x, 16, z);

        // With high terrain (noise 0.5 -> height ~28) and no caves, block 16 should be STONE/ORE
        assert.notStrictEqual(blockAt16, BLOCK.WATER, "Should not be water at level 16 for normal high terrain");
        assert.notStrictEqual(blockAt16, BLOCK.AIR, "Should not be air at level 16 for normal high terrain");
    });

    it('should generate river when noise indicates River', () => {
        // Low river noise -> River
        noiseCallback = (x, y, z) => {
            if (Math.abs(z - 1000) < 1) return 0.0; // Terrain (Normal ~20)
            if (Math.abs(z - 1100) < 1) return 0.0; // River (Yes River)
            return 0.0; // Caves (No Caves)
        };

        world.generateChunk(0, 0);

        const x = 8, z = 8;

        // River logic should clamp height to below 16 (e.g. 12)
        // And fill up to 16 with Water.

        // Check block at 16 (Surface Water)
        const blockAt16 = world.getBlock(x, 16, z);
        assert.strictEqual(blockAt16, BLOCK.WATER, "Block at y=16 should be WATER in a river");

        // Check block at 15 (Deep Water)
        const blockAt15 = world.getBlock(x, 15, z);
        assert.strictEqual(blockAt15, BLOCK.WATER, "Block at y=15 should be WATER in a river");

        // Check block at riverbed (e.g. 12)
        // If we clamp to 12, then 12 is the top solid block.
        const blockAt12 = world.getBlock(x, 12, z);
        assert.strictEqual(blockAt12, BLOCK.SAND, "Riverbed at y=12 should be SAND");

        // Check above water is Air
        const blockAt17 = world.getBlock(x, 17, z);
        assert.strictEqual(blockAt17, BLOCK.AIR, "Above river should be AIR");
    });
});
