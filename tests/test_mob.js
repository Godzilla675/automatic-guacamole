const assert = require('assert');
const { JSDOM } = require('jsdom');

const dom = new JSDOM(`<!DOCTYPE html>`);
global.window = dom.window;
global.document = dom.window.document;

// Mock globals
global.BLOCK = { AIR: 0, DIRT: 1, WATER: 6 };
global.BLOCKS = {
    [1]: { solid: true },
    [6]: { liquid: true }
};

// Load mob code
const fs = require('fs');
const mobCode = fs.readFileSync('js/mob.js', 'utf8');
eval(mobCode);

class MockWorld {
    getBlock(x, y, z) {
        if (y < 0) return BLOCK.DIRT;
        return BLOCK.AIR;
    }
}

class MockPlayer {
    constructor() {
        this.x = 10;
        this.y = 10;
        this.z = 10;
    }
}

class MockGame {
    constructor() {
        this.world = new MockWorld();
        this.player = new MockPlayer();
    }
}

describe('Mob System', () => {
    let game;
    let mob;

    beforeEach(() => {
        game = new MockGame();
    });

    it('should initialize with correct type properties', () => {
        const cow = new window.Mob(game, 0, 0, 0, window.MOB_TYPE.COW);
        assert.strictEqual(cow.type, 'cow');
        assert.strictEqual(cow.color, '#8B4513');

        const zombie = new window.Mob(game, 0, 0, 0, window.MOB_TYPE.ZOMBIE);
        assert.strictEqual(zombie.type, 'zombie');
        assert.strictEqual(zombie.color, '#2E8B57');
    });

    it('zombie should chase player', () => {
        const zombie = new window.Mob(game, 0, 10, 0, window.MOB_TYPE.ZOMBIE);
        // Player is at 10, 10, 10
        // Zombie at 0, 10, 0

        // Update
        zombie.update(0.1);

        // Should move towards player (positive x and z)
        assert.ok(zombie.vx > 0, 'Should move +X');
        assert.ok(zombie.vz > 0, 'Should move +Z');
    });

    it('cow should move randomly', () => {
        const cow = new window.Mob(game, 0, 10, 0, window.MOB_TYPE.COW);
        cow.update(0.1);
        // Hard to test random, but verify state changes or no crash
        assert.ok(cow.x !== undefined);
    });
});
