const fs = require('fs');

// Mock Environment
global.window = global;
global.BLOCK = {
    AIR: 0,
    STONE: 1,
    TRAPDOOR: 2,
    SLAB: 3,
    STAIR: 4,
    FENCE: 5
};
global.BLOCKS = {
    [global.BLOCK.AIR]: { solid: false },
    [global.BLOCK.STONE]: { solid: true },
    [global.BLOCK.TRAPDOOR]: { solid: true, isTrapdoor: true },
    [global.BLOCK.SLAB]: { solid: true, isSlab: true },
    [global.BLOCK.STAIR]: { solid: true, isStair: true },
    [global.BLOCK.FENCE]: { solid: true, isFence: true }
};

// Mock World
class World {
    constructor() {
        this.blocks = {};
        this.metadata = {};
    }
    getBlock(x, y, z) {
        return this.blocks[`${x},${y},${z}`] || global.BLOCK.AIR;
    }
    getMetadata(x, y, z) {
        return this.metadata[`${x},${y},${z}`] || 0;
    }
    setBlock(x, y, z, type) {
        this.blocks[`${x},${y},${z}`] = type;
    }
    setMetadata(x, y, z, meta) {
        this.metadata[`${x},${y},${z}`] = meta;
    }
}

// Load Physics
try {
    const physicsCode = fs.readFileSync('js/physics.js', 'utf8');
    eval(physicsCode);
} catch (e) {
    console.error('Error loading physics.js:', e);
    process.exit(1);
}

const world = new World();
const physics = new window.Physics(world);

function testRaycast(name, origin, dir, expectedHit) {
    console.log(`Testing ${name}...`);
    const result = physics.raycast(origin, dir, 10);

    if (!expectedHit) {
        if (result) console.log(`FAIL: Expected no hit, got hit at ${result.x},${result.y},${result.z}`);
        else console.log('PASS: No hit as expected');
        return;
    }

    if (!result) {
        console.log(`FAIL: Expected hit, got none`);
        return;
    }

    if (result.type !== expectedHit.type) {
        console.log(`FAIL: Wrong block type. Expected ${expectedHit.type}, got ${result.type}`);
    }

    if (!result.point) {
        console.log(`FAIL: Point missing in result`);
        return;
    }

    // Check point coordinates
    const diffX = Math.abs(result.point.x - expectedHit.px);
    const diffY = Math.abs(result.point.y - expectedHit.py);
    const diffZ = Math.abs(result.point.z - expectedHit.pz);

    if (diffX > 0.001 || diffY > 0.001 || diffZ > 0.001) {
        console.log(`FAIL: Point coordinates mismatch.`);
        console.log(`Expected: ${expectedHit.px}, ${expectedHit.py}, ${expectedHit.pz}`);
        console.log(`Got:      ${result.point.x}, ${result.point.y}, ${result.point.z}`);
    } else {
        console.log(`PASS: Point correct`);
    }
}

// 1. Stone (Generic)
world.setBlock(10, 10, 10, global.BLOCK.STONE);
testRaycast('Stone',
    { x: 11.5, y: 10.5, z: 10.5 },
    { x: -1, y: 0, z: 0 },
    { type: global.BLOCK.STONE, px: 11, py: 10.5, pz: 10.5 }
);

// 2. Slab (Bottom)
world.setBlock(12, 10, 10, global.BLOCK.SLAB);
// Hit bottom half
testRaycast('Slab Bottom Hit',
    { x: 13.5, y: 10.2, z: 10.5 },
    { x: -1, y: 0, z: 0 },
    { type: global.BLOCK.SLAB, px: 13, py: 10.2, pz: 10.5 }
);
// Hit top half (should pass through)
testRaycast('Slab Top Miss',
    { x: 13.5, y: 10.8, z: 10.5 },
    { x: -1, y: 0, z: 0 },
    null
);

// 3. Stair
world.setBlock(14, 10, 10, global.BLOCK.STAIR);
// Default meta 0 (East). Solid back is East (positive X)? Or West?
// Assuming standard stair logic in physics.js:
// if (ry >= 0 && ry <= 0.5) hit (base)
// if (ry > 0.5) check quadrants based on meta.
testRaycast('Stair Base',
    { x: 15.5, y: 10.2, z: 10.5 },
    { x: -1, y: 0, z: 0 },
    { type: global.BLOCK.STAIR, px: 15, py: 10.2, pz: 10.5 }
);

// 4. Fence
world.setBlock(16, 10, 10, global.BLOCK.FENCE);
// Center post is 0.375 to 0.625
// Hit center
testRaycast('Fence Center',
    { x: 17.5, y: 10.5, z: 10.5 }, // z=10.5 is center (0.5)
    { x: -1, y: 0, z: 0 },
    { type: global.BLOCK.FENCE, px: 17, py: 10.5, pz: 10.5 } // Expect hit at boundary of post?
    // Wait, fence bounds are x: 0.375-0.625.
    // Ray coming from +X (17.5) towards 16.
    // Hit at x = 16 + 0.625 = 16.625
);

// 5. Trapdoor
world.setBlock(18, 10, 10, global.BLOCK.TRAPDOOR);
// Default meta 0 (Bottom). Thickness 0.1875.
// Hit bottom
testRaycast('Trapdoor Bottom',
    { x: 19.5, y: 10.1, z: 10.5 },
    { x: -1, y: 0, z: 0 },
    { type: global.BLOCK.TRAPDOOR, px: 19, py: 10.1, pz: 10.5 } // Expected hit at 19 (block boundary)?
    // Wait, trapdoor is inside the block.
    // If it's a bottom trapdoor, it's at y=0 to y=0.1875.
    // Ray enters block at x=19. Passes through.
    // Then checks ry.
    // Wait, trapdoor logic in physics:
    // "if (ry >= 0 && ry <= thickness) return ... point: ..."
    // The hit point x would be intersection with the trapdoor face?
    // Actually, `raycast` logic steps through voxels.
    // Inside the voxel, it checks intersection.
    // It returns `point: { x: hx, y: hy, z: hz }`.
    // Where hx, hy, hz = origin + dir * t.
    // `t` is distance to voxel boundary.
    // IF the intersection is strictly with the voxel boundary, then point is on boundary.
    // BUT for Trapdoor, the intersection is internal?
    // Let's check `physics.js` again.
