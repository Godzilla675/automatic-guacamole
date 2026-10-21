const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('Target Block Redstone Power Decay Test Suite', function() {
    this.timeout(10000);

    before(function() {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        global.window = dom.window;
        global.document = dom.window.document;

        require('../js/blocks.js');
        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;

        require('../js/biome.js');
        require('../js/structures.js');
        require('../js/chunk.js');
        require('../js/world.js');
    });

    it('Target Block power expires and decays to 0 after timer expiration', function() {
        const world = new window.World();
        const chunk = new window.Chunk(0, 0);
        world.chunks.set(world.getChunkKey(0, 0), chunk);

        const bx = 10, by = 10, bz = 10;
        world.setBlock(bx, by, bz, window.BLOCK.TARGET_BLOCK);

        // Hit target block bullseye
        world.hitTargetBlock(bx, by, bz, 10.5, 10.5, 10.5);

        // Power should initially be 15
        assert.strictEqual(world.getMetadata(bx, by, bz), 15);
        const entity = world.getBlockEntity(bx, by, bz);
        assert.ok(entity);
        assert.strictEqual(entity.type, 'target');
        assert.ok(entity.timer > 0);

        // Active redstone set should contain the target block
        assert.ok(world.activeRedstone.has(`${bx},${by},${bz}`));

        // Single redstone update tick
        world.updateRedstone();
        assert.ok(entity.timer > 0);
        assert.strictEqual(world.getMetadata(bx, by, bz), 15);

        // Directly call updateTargetBlocks to simulate 0.5s passing
        world.updateTargetBlocks(0.5);
        assert.ok(entity.timer > 0 && entity.timer <= 0.5);
        assert.strictEqual(world.getMetadata(bx, by, bz), 15);

        // Advance past 1.0s total
        world.updateTargetBlocks(0.6);
        assert.strictEqual(entity.timer, 0);
        assert.strictEqual(entity.power, 0);
        assert.strictEqual(world.getMetadata(bx, by, bz), 0);
    });
});
