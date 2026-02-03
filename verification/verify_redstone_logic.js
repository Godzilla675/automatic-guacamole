const fs = require('fs');

// 1. Setup Global Mocks
global.window = {};
global.document = {
    getElementById: () => ({ getContext: () => ({}) })
};

// Mock Perlin for BiomeManager
window.perlin = {
    noise: (x, y, z) => 0.5
};

// 2. Load Modules
// We need to load them in order of dependency

// Load Blocks
const blocksContent = fs.readFileSync('js/blocks.js', 'utf8');
eval(blocksContent);
global.BLOCK = window.BLOCK;
global.BLOCKS = window.BLOCKS;
global.TOOLS = window.TOOLS;

// Mock Managers required by World
window.BiomeManager = class {
    constructor(seed) {}
    getBiome(x, z) { return { name: 'Plains', heightOffset: 0, topBlock: window.BLOCK.GRASS, underBlock: window.BLOCK.DIRT }; }
};

window.StructureManager = class {
    constructor(world) {}
    generateTree() {}
    generateStructure() {}
    generateVillage() {}
};

// Load Chunk
const chunkContent = fs.readFileSync('js/chunk.js', 'utf8');
eval(chunkContent);
global.Chunk = window.Chunk; // Ensure Chunk is globally available for World

// Load World
const worldContent = fs.readFileSync('js/world.js', 'utf8');
eval(worldContent);

// 3. Test Suite
const assert = require('assert');

function runTests() {
    console.log("Running Redstone Logic Tests...");
    const world = new window.World();

    // Ensure we are in a loaded chunk
    // World generates chunks on demand in setBlock?
    // world.generateChunk(0, 0); // Manually generate if needed, but setBlock calls getChunk which calls generateChunk?
    // No, setBlock calls getChunk, if null it adds to pending. We need to force generation.
    world.generateChunk(0, 0);
    world.generateChunk(0, 1); // For Z=20

    const checkBlock = (x, y, z, type, msg) => {
        const actual = world.getBlock(x, y, z);
        assert.strictEqual(actual, type, `${msg}: Expected ${type}, got ${actual}`);
    };

    const checkMeta = (x, y, z, val, msg) => {
         const actual = world.getMetadata(x, y, z);
         assert.strictEqual(actual, val, `${msg}: Expected metadata ${val}, got ${actual}`);
    };

    // Test 1: Redstone Wire Connectivity & Decay
    console.log("Test 1: Wire Connectivity");

    // Place Floor
    for(let x=4; x<=20; x++) {
        for(let z=4; z<=30; z++) {
            world.setBlock(x, 49, z, window.BLOCK.STONE);
        }
    }

    // Place Torch as source at 5, 50, 5
    world.setBlock(5, 50, 5, window.BLOCK.REDSTONE_TORCH);

    // Place wire at 6, 50, 5 (Should become 15)
    world.setBlock(6, 50, 5, window.BLOCK.REDSTONE_WIRE);

    // Place neighbor wire at 7, 50, 5 (Should become 14)
    world.setBlock(7, 50, 5, window.BLOCK.REDSTONE_WIRE);

    // Update redstone (Multiple passes might be needed for propagation)
    world.updateRedstone();
    world.updateRedstone();

    // Check neighbor power (should be 14)
    checkMeta(7, 50, 5, 14, "Neighbor wire should have power 14");

    // Place another neighbor at 8, 50, 5
    world.setBlock(8, 50, 5, window.BLOCK.REDSTONE_WIRE);
    world.updateRedstone();
    world.updateRedstone();
    checkMeta(8, 50, 5, 13, "Second neighbor should have power 13");

    console.log("Passed: Wire Connectivity");

    // Test 2: Redstone Torch Powering Wire
    console.log("Test 2: Torch Powering Wire");
    world.setBlock(10, 50, 10, window.BLOCK.REDSTONE_TORCH);
    world.setBlock(11, 50, 10, window.BLOCK.REDSTONE_WIRE);
    world.updateRedstone();

    checkMeta(11, 50, 10, 15, "Wire next to torch should be fully powered (15)");
    console.log("Passed: Torch Powering Wire");

    // Test 3: Lamp Activation
    console.log("Test 3: Lamp Activation");
    // Use Z=20 to avoid interference from Test 1 wires
    world.setBlock(5, 50, 20, window.BLOCK.REDSTONE_TORCH);
    world.setBlock(6, 50, 20, window.BLOCK.REDSTONE_LAMP);

    // Update Redstone should trigger lamp update
    world.updateRedstone();

    checkBlock(6, 50, 20, window.BLOCK.REDSTONE_LAMP_ACTIVE, "Lamp next to torch should turn ON");

    // Remove torch
    world.setBlock(5, 50, 20, window.BLOCK.AIR);
    world.updateRedstone();

    checkBlock(6, 50, 20, window.BLOCK.REDSTONE_LAMP, "Lamp should turn OFF when power removed");
    console.log("Passed: Lamp Activation");

    // Test 4: NOT Gate (Inversion) logic
    console.log("Test 4: NOT Gate (Inversion)");

    // Setup:
    // [Torch Source] -> [Wire] -> [Stone Block] -> [Redstone Torch]
    // 7,50,8 (Torch) -> 8,50,8 (Wire) -> 9,50,8 (Stone) -> 9,51,8 (Torch on top of Stone)

    world.setBlock(7, 50, 8, window.BLOCK.REDSTONE_TORCH);

    world.setBlock(8, 50, 8, window.BLOCK.REDSTONE_WIRE);
    // world.setMetadata(8, 50, 8, 15); // Removed magic power source, using real torch

    world.setBlock(9, 50, 8, window.BLOCK.STONE); // Conductive block

    // Torch on top
    world.setBlock(9, 51, 8, window.BLOCK.REDSTONE_TORCH);

    // Update
    world.updateRedstone();

    // Check if torch is OFF
    const torchType = world.getBlock(9, 51, 8);
    const torchMeta = world.getMetadata(9, 51, 8);

    console.log(`Torch State: ID=${torchType}, Meta=${torchMeta}`);

    // Expect REDSTONE_TORCH_OFF (164)
    if (torchType === window.BLOCK.REDSTONE_TORCH_OFF) {
        console.log("Passed: NOT Gate (Inversion) - Torch turned OFF");
    } else {
        assert.strictEqual(torchType, window.BLOCK.REDSTONE_TORCH_OFF, "Torch should turn OFF (become REDSTONE_TORCH_OFF)");
    }

    // Test 5: Signal Propagation Cutoff
    // Verify that an OFF torch does not power adjacent wire
    console.log("Test 5: Signal Propagation Cutoff");

    // Setup:
    // [Torch Source] -> [Wire 1] -> [Block 1] -> [Torch 1] -> [Wire 2]
    // 9,50,10 (Source) -> 10,50,10 (Wire) -> 11,50,10 (Stone) -> 11,51,10 (Torch) -> 12,51,10 (Wire 2)

    world.setBlock(9, 50, 10, window.BLOCK.REDSTONE_TORCH);
    world.setBlock(10, 50, 10, window.BLOCK.REDSTONE_WIRE);
    // Wire connects to torch auto-magically? updateRedstone should handle it.

    world.setBlock(11, 50, 10, window.BLOCK.STONE);

    // Place Torch (initially ON)
    world.setBlock(11, 51, 10, window.BLOCK.REDSTONE_TORCH);

    // Place Wire 2
    world.setBlock(12, 51, 10, window.BLOCK.REDSTONE_WIRE);

    console.log("Active Redstone Set:", Array.from(world.activeRedstone));

    // Check Wire 1 Metadata
    console.log("Wire 1 Metadata:", world.getMetadata(10, 50, 10));

    // Update
    world.updateRedstone();
    if (world.activeRedstone.size > 0) {
        console.log("Running second update pass...");
        world.updateRedstone();
    }

    // Check Torch is OFF
    const t5Torch = world.getBlock(11, 51, 10);
    assert.strictEqual(t5Torch, window.BLOCK.REDSTONE_TORCH_OFF, "Torch should be OFF");

    // Check Wire 2 is NOT powered
    const wire2Meta = world.getMetadata(12, 51, 10);
    console.log(`Wire 2 Power: ${wire2Meta}`);

    if (wire2Meta === 0) {
        console.log("Passed: Wire 2 has 0 power (OFF torch did not power it)");
    } else {
        assert.fail(`Wire 2 should have 0 power, got ${wire2Meta}. OFF Torch is still powering it!`);
    }
}

try {
    runTests();
    console.log("All Redstone Tests Completed.");
} catch (e) {
    console.error("Test Failed:", e);
    process.exit(1);
}
