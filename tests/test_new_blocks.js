
const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('New Blocks Features', function() {
    let dom;
    let world;
    let physics;
    let BLOCK;
    let BLOCKS;

    before(function() {
        dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="game-canvas"></canvas></body></html>', {
            url: "http://localhost/",
            resources: "usable",
            runScripts: "dangerously"
        });
        global.window = dom.window;
        global.document = dom.window.document;

        // Mock Perlin
        dom.window.perlin = {
            noise: function(x, y, z) { return 0.5; }
        };

        // Load Modules
        const loadModule = (file) => {
            const content = fs.readFileSync(path.join(__dirname, '../js', file), 'utf8');
            dom.window.eval(content);
        };

        loadModule('blocks.js');
        loadModule('math.js'); // Assuming Perlin might be here or not, but good to load
        loadModule('chunk.js');
        loadModule('biome.js');
        loadModule('structures.js');
        loadModule('world.js');
        loadModule('physics.js');

        BLOCK = dom.window.BLOCK;
        BLOCKS = dom.window.BLOCKS;
        const World = dom.window.World;
        const Physics = dom.window.Physics;

        world = new World();
        physics = new Physics(world);
    });

    it('should have new blocks defined', function() {
        assert(BLOCK.FENCE, "BLOCK.FENCE defined");
        assert(BLOCK.FENCE_GATE, "BLOCK.FENCE_GATE defined");
        assert(BLOCK.GLASS_PANE, "BLOCK.GLASS_PANE defined");
        assert(BLOCK.TRAPDOOR, "BLOCK.TRAPDOOR defined");

        assert(BLOCKS[BLOCK.FENCE].isFence, "BLOCKS definition isFence");
        assert(BLOCKS[BLOCK.TRAPDOOR].isTrapdoor, "BLOCKS definition isTrapdoor");
    });

    it('should handle Fence collision correctly', function() {
        world.generateChunk(0, 0);
        world.setBlock(0, 10, 0, BLOCK.FENCE);

        // Center Hit
        const fenceBoxHit = { x: 0.5, y: 10, z: 0.5, width: 0.1, height: 1 };
        assert(physics.checkCollision(fenceBoxHit), "Fence Central Post should collide");

        // Gap Miss
        const fenceGapHit = { x: 0.2, y: 10, z: 0.5, width: 0.1, height: 1 };
        assert(!physics.checkCollision(fenceGapHit), "Fence Gap should not collide");
    });

    it('should handle Fence connections', function() {
        world.setBlock(0, 10, 0, BLOCK.FENCE);
        world.setBlock(1, 10, 0, BLOCK.FENCE);

        // Connection between 0.5 and 1.5. Center is 1.0.
        // x=0.8 is between 0.625 (post edge) and 1.0 (block border).
        const fenceConnectHit = { x: 0.8, y: 10, z: 0.5, width: 0.1, height: 1 };
        assert(physics.checkCollision(fenceConnectHit), "Fence Connection should collide");
    });

    it('should handle Fence Gate collision', function() {
        world.setBlock(0, 10, 2, BLOCK.FENCE_GATE);
        world.setMetadata(0, 10, 2, 0); // Closed, Z-Aligned

        const gateBox = { x: 0.5, y: 10, z: 2.5, width: 0.1, height: 1 };
        assert(physics.checkCollision(gateBox), "Closed Fence Gate should collide");

        world.setMetadata(0, 10, 2, 4); // Open
        assert(!physics.checkCollision(gateBox), "Open Fence Gate should not collide");
    });

    it('should handle Trapdoor collision', function() {
        world.setBlock(0, 10, 4, BLOCK.TRAPDOOR);
        world.setMetadata(0, 10, 4, 0); // Closed

        const trapdoorHit = { x: 0.5, y: 10.1, z: 4.5, width: 0.1, height: 0.1 };
        assert(physics.checkCollision(trapdoorHit), "Closed Trapdoor should collide");

        const trapdoorMiss = { x: 0.5, y: 10.5, z: 4.5, width: 0.1, height: 0.1 };
        assert(!physics.checkCollision(trapdoorMiss), "Closed Trapdoor high should not collide");

        // Open
        world.setMetadata(0, 10, 4, 4 | 3); // Open, Face North
        // Face 3 logic in physics.js:
        // if (face === 3) tMaxZ = z + 0.1875;
        // So Z is from 4.0 to 4.1875
        const trapdoorOpenHit = { x: 0.5, y: 10.5, z: 4.1, width: 0.1, height: 0.1 };
        assert(physics.checkCollision(trapdoorOpenHit), "Open Trapdoor (North) should collide");

        const trapdoorOpenMiss = { x: 0.5, y: 10.5, z: 4.5, width: 0.1, height: 0.1 };
        assert(!physics.checkCollision(trapdoorOpenMiss), "Open Trapdoor (North) center should miss");
    });
});
