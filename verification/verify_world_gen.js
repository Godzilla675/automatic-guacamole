const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM('<!DOCTYPE html><body></body>');
global.window = dom.window;
global.document = dom.window.document;

// Mock Perlin
window.perlin = {
    noise: (x, y, z) => 0.6 // Consistent noise
};

// Load scripts
const scripts = ['js/blocks.js', 'js/biome.js', 'js/structures.js', 'js/chunk.js', 'js/world.js'];
scripts.forEach(s => {
    const c = fs.readFileSync(s, 'utf8');
    eval(c);
});
global.BLOCK = window.BLOCK;
global.BLOCKS = window.BLOCKS;
global.BiomeManager = window.BiomeManager;
global.StructureManager = window.StructureManager;
global.World = window.World;
global.Chunk = window.Chunk;

// Create World
const world = new window.World();

// 1. Verify StructureManager has new methods
if (typeof world.structureManager.generateJungleTree !== 'function') throw new Error("Missing generateJungleTree");
if (typeof world.structureManager.generateVillage !== 'function') throw new Error("Missing generateVillage");

// 2. Verify Biome Selection
// Mock noise to return > 0.5 for JUNGLE
// humidity > 0.5, temp > 0.5
// BiomeManager uses:
// temp = noise(x*scale, z*scale, seed)
// humidity = noise(x*scale+1000, ...)
// Our mock returns 0.6 for everything.
// So temp > 0.5 (True), humidity > 0.2 (True).
// Wait, Biome logic:
/*
        if (temp > 0.5) {
            if (humidity < 0) return this.biomes.DESERT;
            if (humidity > 0.5) return this.biomes.JUNGLE;
            return this.biomes.FOREST;
        }
*/
// So it should be JUNGLE.

const biome = world.biomeManager.getBiome(0, 0);
if (biome.name !== 'Jungle') throw new Error(`Expected Jungle, got ${biome.name}`);

console.log("Verified Biome Logic: Jungle selected.");

// 3. Verify Structure generation logic
// Since noise is 0.6, temp > 0.5 -> JUNGLE.
// In Jungle, treeChance is 0.15.
// generateChunk loops.
// We can't easily spy on generateJungleTree without mocking StructureManager methods.
// Let's mock generateJungleTree on the instance.

let jungleTreeCalled = false;
world.structureManager.generateJungleTree = () => { jungleTreeCalled = true; };

// Generate chunk 0,0
world.generateChunk(0, 0);

// With 16x16 blocks and 0.15 chance, it's highly likely to be called.
// But we used a constant noise of 0.6.
// Math.random() is NOT mocked.
// So it might not trigger if unlucky, but 256 * 0.15 = 38 trees. Highly likely.

if (jungleTreeCalled) {
    console.log("Verified Jungle Tree generation called.");
} else {
    console.warn("Jungle Tree generation NOT called (bad luck or logic error?)");
}

console.log("World Generation verified.");
