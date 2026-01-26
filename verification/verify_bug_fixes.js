const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html>
<body>
</body>`, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost/"
});

// Mock globals
dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.navigator = { userAgent: "node", maxTouchPoints: 0 };
dom.window.WebSocket = class { send() {} close() {} };
dom.window.AudioContext = class {
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
    createBiquadFilter() { return { connect: () => {} }; }
    resume() {}
    get state() { return 'running'; }
};
dom.window.localStorage = { getItem: () => null, setItem: () => {}, clear: () => {}, removeItem: () => {} };
dom.window.perlin = { noise: () => 0.5 };
dom.window.prompt = () => "Tester";

// Load Code
const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error("Error loading " + f, e);
    }
};

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js'].forEach(load);

describe('Bug Fixes Verification', () => {
    let world;

    before(function() {
        world = new dom.window.World();
        // Force seed for predictability if needed
        world.seed = 12345;
    });

    describe('Spruce Tree Visuals', () => {
        it('should define SPRUCE_WOOD and SPRUCE_LEAVES in BLOCK', () => {
            assert.ok(dom.window.BLOCK.SPRUCE_WOOD !== undefined, "BLOCK.SPRUCE_WOOD should be defined");
            assert.ok(dom.window.BLOCK.SPRUCE_LEAVES !== undefined, "BLOCK.SPRUCE_LEAVES should be defined");
        });

        it('should define SPRUCE_WOOD and SPRUCE_LEAVES in BLOCKS with correct visuals', () => {
             const wood = dom.window.BLOCKS[dom.window.BLOCK.SPRUCE_WOOD];
             const leaves = dom.window.BLOCKS[dom.window.BLOCK.SPRUCE_LEAVES];

             assert.ok(wood, "BLOCKS[SPRUCE_WOOD] should exist");
             assert.ok(leaves, "BLOCKS[SPRUCE_LEAVES] should exist");

             assert.strictEqual(wood.name, 'Spruce Wood', "Name should be Spruce Wood");
             assert.strictEqual(leaves.name, 'Spruce Leaves', "Name should be Spruce Leaves");
        });

        it('should generate spruce trees with spruce blocks', () => {
            const chunk = new dom.window.Chunk(0, 0);
            world.chunks.set('0,0', chunk);

            // Call generateTree with type 'spruce'
            world.structureManager.generateTree(chunk, 8, 10, 8, 'spruce');

            // Find the trunk
            let foundTrunk = false;
            let foundLeaves = false;

            // Scan the generated area
            for (let y = 10; y < 20; y++) {
                const b = chunk.getBlock(8, y, 8);
                if (b === dom.window.BLOCK.SPRUCE_WOOD) foundTrunk = true;
            }

            // Scan for leaves
            for (let x = 0; x < 16; x++) {
                for (let z = 0; z < 16; z++) {
                    for (let y = 10; y < 20; y++) {
                        if (chunk.getBlock(x, y, z) === dom.window.BLOCK.SPRUCE_LEAVES) {
                            foundLeaves = true;
                        }
                    }
                }
            }

            assert.ok(foundTrunk, "Should generate SPRUCE_WOOD trunk");
            assert.ok(foundLeaves, "Should generate SPRUCE_LEAVES leaves");
        });

        it('should generate oak trees with leaves', () => {
             const chunk = new dom.window.Chunk(0, 0);
             world.chunks.set('0,0', chunk);
             world.structureManager.generateTree(chunk, 8, 10, 8, 'oak');

             let leavesCount = 0;
             for(let x=0; x<16; x++) {
                 for(let y=0; y<64; y++) {
                     for(let z=0; z<16; z++) {
                         if(chunk.getBlock(x,y,z) === dom.window.BLOCK.LEAVES) leavesCount++;
                     }
                 }
             }
             assert.ok(leavesCount > 0, "Should have leaves");
        });
    });

    describe('Water Flow Logic', () => {
        it('should create infinite water source from 2 sources', () => {
             // Ensure chunk exists
             const x = 50, y = 50, z = 50;
             const cx = Math.floor(x / 16);
             const cz = Math.floor(z / 16);
             world.generateChunk(cx, cz);

             // Create a 3x1 trough
             // S A S -> S S S
             // Where S = Source (8), A = Air/Flowing
             const airX = 51;

             // Base
             for(let dx=0; dx<=2; dx++) {
                 world.setBlock(x+dx, y-1, z, dom.window.BLOCK.STONE);
                 world.setBlock(x+dx, y, z, dom.window.BLOCK.AIR);
                 // Walls to contain it
                 world.setBlock(x+dx, y, z+1, dom.window.BLOCK.STONE);
                 world.setBlock(x+dx, y, z-1, dom.window.BLOCK.STONE);
             }
             world.setBlock(x-1, y, z, dom.window.BLOCK.STONE);
             world.setBlock(x+3, y, z, dom.window.BLOCK.STONE);

             // Place 2 sources
             world.setBlock(x, y, z, dom.window.BLOCK.WATER);
             world.setMetadata(x, y, z, 8); // Source

             world.setBlock(x+2, y, z, dom.window.BLOCK.WATER);
             world.setMetadata(x+2, y, z, 8); // Source

             // Center is AIR
             assert.strictEqual(world.getBlock(x+1, y, z), dom.window.BLOCK.AIR);

             // Run update
             // 1. First update: Sources flow into center. Center becomes Flowing (Level < 8).
             world.updateFluids();

             // Check center. It should be WATER now.
             assert.strictEqual(world.getBlock(x+1, y, z), dom.window.BLOCK.WATER);

             // 2. Second update: Center checks neighbors. Sees 2 Sources. Becomes Source.
             // Note: In my proposed fix, this might happen in the same tick if I modify updateFluids correctly,
             // or it might take another tick.
             world.updateFluids();
             world.updateFluids(); // Extra tick for safety

             const meta = world.getMetadata(x+1, y, z);
             assert.strictEqual(meta, 8, "Center block should become Source (Meta 8)");
        });
    });
});
