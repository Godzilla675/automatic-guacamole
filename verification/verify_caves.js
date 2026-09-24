const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');
const assert = require('assert');

// 1. Setup JSDOM
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable"
});

global.window = dom.window;
global.document = dom.window.document;

// 2. Load Modules
const files = [
    'js/math.js',
    'js/blocks.js',
    'js/biome.js',
    'js/structures.js',
    'js/chunk.js',
    'js/world.js'
];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    eval(content);
    if (window.World) global.World = window.World;
    if (window.Chunk) global.Chunk = window.Chunk;
    if (window.BLOCK) global.BLOCK = window.BLOCK;
});

// 3. Test Suite
async function runTests() {
    console.log("Running Cave Generation Tests...");

    const world = new window.World();
    world.generateChunk(0, 0);
    const chunk = world.getChunk(0, 0);

    let airCount = 0;
    const totalBlocks = 16 * 16 * 39; // y=1 to 39

    for (let x=0; x<16; x++) {
        for (let z=0; z<16; z++) {
            for (let y=1; y<40; y++) {
                if (chunk.getBlock(x,y,z) === window.BLOCK.AIR) {
                    airCount++;
                }
            }
        }
    }

    console.log(`Air blocks below y=40: ${airCount} / ${totalBlocks}`);

    // Original generation had around 5-15% air blocks below surface.
    // With large caves and ravines, we expect significantly more.
    // Let's just assert that there is a good amount of air underground.
    assert(airCount > totalBlocks * 0.15, "Should have a reasonable amount of underground air blocks representing caves/ravines.");
    console.log("Passed: Cave Generation logic adds air blocks.");
}

try {
    runTests();
} catch (e) {
    console.error("Test Failed:", e);
    process.exit(1);
}
