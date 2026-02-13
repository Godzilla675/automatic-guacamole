const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html>`, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable"
});
global.window = dom.window;
global.document = dom.window.document;

// Mock soundManager
dom.window.soundManager = {
    play: () => {}
};

// Load scripts
const blocksCode = fs.readFileSync('js/blocks.js', 'utf8');
dom.window.eval(blocksCode);

const entityCode = fs.readFileSync('js/entity.js', 'utf8');
dom.window.eval(entityCode);

const dropCode = fs.readFileSync('js/drop.js', 'utf8');
dom.window.eval(dropCode);

const mobCode = fs.readFileSync('js/mob.js', 'utf8');
dom.window.eval(mobCode);

class MockWorld {
    getBlock(x, y, z) {
        if (y < 0) return dom.window.BLOCK.DIRT;
        return dom.window.BLOCK.AIR;
    }
}

class MockPlayer {
    constructor() {
        this.x = 10;
        this.y = 10;
        this.z = 10;
        this.height = 1.8;
        this.inventory = new Array(36).fill(null);
    }
}

class MockGame {
    constructor() {
        this.world = new MockWorld();
        this.player = new MockPlayer();
        this.drops = [];
    }
}

describe('Drop System', () => {
    let game;

    beforeEach(() => {
        game = new MockGame();
    });

    it('should create drop with correct properties', () => {
        const drop = new dom.window.Drop(game, 5, 5, 5, dom.window.BLOCK.ITEM_BONE, 1);
        assert.strictEqual(drop.type, dom.window.BLOCK.ITEM_BONE);
        assert.strictEqual(drop.count, 1);
        assert.strictEqual(drop.x, 5);
        assert.ok(drop.vy > 0); // Should pop up
    });

    it('should fall due to gravity', () => {
        const drop = new dom.window.Drop(game, 5, 10, 5, dom.window.BLOCK.ITEM_BONE, 1);
        const initialVy = drop.vy;

        drop.update(0.1);

        assert.ok(drop.vy < initialVy); // Gravity applied
        assert.ok(drop.y > 10); // Moved up initially due to pop
    });

    it('mob death should spawn drop', () => {
        const skeleton = new dom.window.Mob(game, 5, 5, 5, dom.window.MOB_TYPE.SKELETON);

        skeleton.die();

        assert.strictEqual(skeleton.isDead, true);
        assert.ok(game.drops.length >= 1, "Should spawn at least 1 drop (bone + possible XP)");
        assert.strictEqual(game.drops[0].type, dom.window.BLOCK.ITEM_BONE);
    });

    it('zombie death should spawn rotten flesh', () => {
        const zombie = new dom.window.Mob(game, 5, 5, 5, dom.window.MOB_TYPE.ZOMBIE);
        zombie.die();
        assert.strictEqual(game.drops[0].type, dom.window.BLOCK.ITEM_ROTTEN_FLESH);
    });

    it('should magnet towards player when close', () => {
        const drop = new dom.window.Drop(game, 10.1, 10, 10.1, dom.window.BLOCK.ITEM_BONE, 1); // Close to player (10,10,10)

        drop.vx = 0;
        drop.vy = 0;
        drop.vz = 0;

        drop.update(0.1);

        // Player at 10,10,10. Drop at 10.1, 10, 10.1.
        // dx = -0.1, dz = -0.1
        // Should accelerate towards player
        assert.ok(drop.vx < 0);
        assert.ok(drop.vz < 0);
    });
});
