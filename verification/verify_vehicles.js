const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock Browser Environment
const window = {
    BLOCK: {},
    BLOCKS: {},
    Game: class {},
};
global.window = window;

// Load Dependencies
function load(file) {
    const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    // Simple way to expose class to global scope for subsequent evals
    // This assumes the file sets window.X or global.X
    eval(content);
}

load('js/blocks.js');
load('js/entity.js');

// Expose Entity to global scope so Vehicle can extend it
global.Entity = window.Entity || global.Entity;

load('js/vehicle.js');

// Expose classes
const Minecart = window.Minecart || global.Minecart;
const Boat = window.Boat || global.Boat;

// Mock Game
class MockGame {
    constructor() {
        this.world = {
            getBlock: (x, y, z) => 0
        };
        this.controls = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };
    }
}

// Test Minecart
console.log('Testing Minecart...');
const game = new MockGame();
const minecart = new Minecart(game, 10, 10, 10);

// 1. Test Gravity (Air)
game.world.getBlock = () => window.BLOCK.AIR;
minecart.update(0.1);
assert(minecart.vy < 0, 'Minecart should fall in air');

// 2. Test Rail
game.world.getBlock = (x, y, z) => {
    if (x === 10 && y === 10 && z === 10) return window.BLOCK.RAIL;
    return window.BLOCK.AIR;
};
// Reset
minecart.y = 10;
minecart.vy = -10;
minecart.update(0.1);
assert(Math.abs(minecart.vy) < 0.1, 'Minecart should stop falling on rail');
assert(Math.abs(minecart.y - 10.1) < 0.01, 'Minecart should snap to rail height');

// Test Boat
console.log('Testing Boat...');
const boat = new Boat(game, 20, 20, 20);

// 1. Test Water Buoyancy
game.world.getBlock = () => window.BLOCK.WATER;
boat.vy = -10;
boat.update(0.1);
assert(boat.vy > -10, 'Boat should float up in water');

console.log('Vehicle tests passed!');
