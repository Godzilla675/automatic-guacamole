const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');

const dom = new JSDOM(`<!DOCTYPE html>`, {
    runScripts: "dangerously",
    resources: "usable"
});
global.window = dom.window;
global.document = dom.window.document;

// Mock globals
dom.window.BLOCK = { AIR: 0, DIRT: 1, WATER: 6, ITEM_WOOL: 205, ITEM_MUTTON: 206 };
dom.window.BLOCKS = {
    [1]: { solid: true },
    [6]: { liquid: true }
};
dom.window.soundManager = { play: () => {} };

// Load code
const mobCode = fs.readFileSync('js/mob.js', 'utf8');
const playerCode = fs.readFileSync('js/player.js', 'utf8');
dom.window.eval(mobCode);
dom.window.eval(playerCode);

class MockWorld {
    getBlock(x, y, z) {
        if (y < 0) return dom.window.BLOCK.DIRT;
        return dom.window.BLOCK.AIR;
    }
}

class MockPhysics {
    checkCollision(box) {
        // Simple ground collision at y=10
        if (box.y <= 10) return true;
        return false;
    }
    getFluidIntersection(box) { return false; }
}

class MockGame {
    constructor() {
        this.world = new MockWorld();
        this.physics = new MockPhysics();
        this.controls = { forward: true, backward: false, left: false, right: false, jump: false, sneak: false, sprint: false };
    }
}

describe('New Features', () => {
    let game;

    beforeEach(() => {
        game = new MockGame();
    });

    describe('Sheep', () => {
        it('should initialize sheep correctly', () => {
            const sheep = new dom.window.Mob(game, 0, 0, 0, dom.window.MOB_TYPE.SHEEP);
            assert.strictEqual(sheep.type, 'sheep');
            assert.strictEqual(sheep.color, '#FFFFFF');
            assert.strictEqual(sheep.maxHealth, 8);
        });

        it('sheep should drop wool on death', () => {
            const sheep = new dom.window.Mob(game, 0, 0, 0, dom.window.MOB_TYPE.SHEEP);
            game.drops = [];

            // Mock Drop class since we didn't load js/drop.js
            dom.window.Drop = class Drop {
                 constructor(game, x, y, z, type, count) {
                     this.type = type;
                     this.count = count;
                 }
            };

            sheep.die();
            assert.ok(game.drops.length > 0);
            const dropTypes = game.drops.map(d => d.type);
            assert.ok(dropTypes.includes(dom.window.BLOCK.ITEM_WOOL));
        });
    });

    describe('Player', () => {
        let player;
        beforeEach(() => {
            player = new dom.window.Player(game);
        });

        it('should have hunger properties', () => {
            assert.strictEqual(player.hunger, 20);
            assert.strictEqual(player.maxHunger, 20);
        });

        it('should drain hunger passively', () => {
            player.hungerTimer = 31; // Simulate 31 seconds
            player.update(0.1); // Small dt, but logic checks total time
            // The hunger logic in update adds dt to timer.
            // But we set timer to 31.
            // Update(0.1) -> timer = 31.1 -> >30 -> hunger--
            assert.strictEqual(player.hunger, 19);
        });

        it('should sprint when controls are active and hunger > 6', () => {
            game.controls.sprint = true;
            game.controls.forward = true;
            player.onGround = true;
            player.hunger = 10;

            player.update(0.1);

            assert.strictEqual(player.sprinting, true);
        });

        it('should NOT sprint when hunger <= 6', () => {
            game.controls.sprint = true;
            game.controls.forward = true;
            player.onGround = true;
            player.hunger = 6;

            player.update(0.1);

            assert.strictEqual(player.sprinting, false);
        });

        it('should take fall damage', () => {
            player.y = 20;
            player.vy = -10;
            player.onGround = false;

            // Fall update to accumulate distance
            player.update(0.1); // moves down to 19

            assert.ok(player.fallDistance > 0);

            // Force fall distance to be high
            player.fallDistance = 10;

            // Position near ground so next update hits it
            player.y = 10.1;
            // MockPhysics collides at <= 10.
            // moveBy will check y + dy. 10.1 + (-1) = 9.1. Collides.
            // onGround will become true.

            const initialHealth = player.health;
            player.update(0.1);

            assert.ok(player.health < initialHealth);
            assert.strictEqual(player.fallDistance, 0);
        });
    });
});
