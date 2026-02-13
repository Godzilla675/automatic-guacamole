const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html><body></body>`, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable",
});

// Mock globals
dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;

// Mock Perlin
dom.window.perlin = { noise: () => 0 };

// Mock localStorage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: function(key) { return store[key] || null; },
        setItem: function(key, value) { store[key] = value.toString(); },
        clear: function() { store = {}; },
        removeItem: function(key) { delete store[key]; }
    };
})();
Object.defineProperty(dom.window, 'localStorage', {
  value: localStorageMock,
  writable: true
});
dom.window.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
dom.window.atob = (str) => Buffer.from(str, 'base64').toString('binary');
// Mock prompt
dom.window.prompt = () => "Tester";
dom.window.alert = (msg) => console.log("ALERT:", msg);

// Load Code
const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error("Error loading " + f, e);
    }
};

['blocks.js', 'chunk.js', 'biome.js', 'structures/Tree.js', 'structures/Cactus.js', 'structures/Well.js', 'structures.js', 'world.js'].forEach(load);

function verifyMetadata() {
    console.log("Verifying Metadata Persistence...");

    try {
        console.log("Testing btoa:", dom.window.btoa("test"));
    } catch(e) {
        console.error("btoa test failed:", e);
    }

    const world = new dom.window.World();

    // Generate a chunk
    world.generateChunk(0, 0);

    // Set Block and Metadata
    // Set block at 5, 50, 5 to STONE
    world.setBlock(5, 50, 5, dom.window.BLOCK.STONE);

    // Set metadata to 123
    world.setMetadata(5, 50, 5, 123);

    // Verify in memory
    const meta = world.getMetadata(5, 50, 5);
    if (meta !== 123) {
        console.error(`FAILURE: Memory metadata mismatch. Expected 123, got ${meta}`);
        process.exit(1);
    }
    console.log("Memory metadata check passed.");

    // Save World
    world.saveWorld('test_meta');

    // Clear World
    const newWorld = new dom.window.World();
    newWorld.loadWorld('test_meta');

    // Verify Loaded
    const loadedBlock = newWorld.getBlock(5, 50, 5);
    const loadedMeta = newWorld.getMetadata(5, 50, 5);

    if (loadedBlock !== dom.window.BLOCK.STONE) {
         console.error(`FAILURE: Loaded block mismatch. Expected STONE, got ${loadedBlock}`);
         process.exit(1);
    }

    if (loadedMeta !== 123) {
         console.error(`FAILURE: Loaded metadata mismatch. Expected 123, got ${loadedMeta}`);
         process.exit(1);
    }

    console.log("Persistence check passed.");
    process.exit(0);
}

verifyMetadata();
