const fs = require('fs');
const assert = require('assert');

// Global Mocks
global.window = {
    BLOCKS: {},
    soundManager: { play: () => {} }
};
global.BLOCK = { AIR: 0, WATER: 7 };
global.BLOCKS = {};

// Load Entity
const entityCode = fs.readFileSync('js/entity.js', 'utf8');
eval(entityCode);

// Ensure Entity is available in scope for next eval
global.Entity = global.Entity || window.Entity;

// Load Mob
const mobCode = fs.readFileSync('js/mob.js', 'utf8');
(0, eval)(mobCode);

const Mob = global.Mob || window.Mob;
const MOB_TYPE = global.MOB_TYPE || window.MOB_TYPE;

// Mock Game
const mockGame = {
    world: {
        getBlock: () => 0
    },
    player: {
        x: 0, y: 0, z: 0
    },
    mobs: [],
    spawnProjectile: () => {}
};

// Test Skeleton AI
console.log("Testing Skeleton AI...");
const skeleton = new Mob(mockGame, 5, 0, 0, MOB_TYPE.SKELETON);

// Previous behavior: vx=0, vz=0 (standing still)
// New behavior: Strafing (vx!=0 || vz!=0)

// Force update
skeleton.update(0.1);

console.log(`Skeleton Pos: ${skeleton.x}, ${skeleton.z}`);
console.log(`Skeleton Vel: ${skeleton.vx}, ${skeleton.vz}`);

if (Math.abs(skeleton.vx) > 0.001 || Math.abs(skeleton.vz) > 0.001) {
    console.log("SUCCESS: Skeleton is moving (strafing/moving) while in combat range.");
} else {
    console.log("FAILURE: Skeleton is standing still.");
    process.exit(1);
}
