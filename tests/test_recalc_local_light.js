const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('recalcLocalLight & Block Interactions Regression Tests', () => {
    let env, game, world, BLOCK;

    beforeEach(() => {
        env = createGameEnv();
        game = env.createGame();
        world = game.world;
        BLOCK = env.window.BLOCK;
        world.generateChunk(0, 0);
    });

    it('should correctly propagate light and clear light on torch removal without ghost light', () => {
        // Y=50 is in air above terrain
        world.setBlock(5, 50, 5, BLOCK.TORCH);
        assert.strictEqual(world.getLight(5, 50, 5), 15);
        assert.strictEqual(world.getLight(6, 50, 5), 14);

        // Remove torch
        world.setBlock(5, 50, 5, BLOCK.AIR);
        assert.strictEqual(world.getLight(5, 50, 5), 0);
        assert.strictEqual(world.getLight(6, 50, 5), 0);
    });

    it('should handle overlapping light sources without dark spots when one is removed', () => {
        // Place Torch A at (5, 50, 5) and Torch B at (10, 50, 5)
        world.setBlock(5, 50, 5, BLOCK.TORCH);
        world.setBlock(10, 50, 5, BLOCK.TORCH);

        const midLightBefore = world.getLight(8, 50, 5);
        assert.ok(midLightBefore > 0, 'Midpoint should be lit by both torches');

        // Remove Torch A
        world.setBlock(5, 50, 5, BLOCK.AIR);

        // Torch B should still illuminate (10, 50, 5) and nearby blocks
        assert.strictEqual(world.getLight(10, 50, 5), 15);
        assert.strictEqual(world.getLight(9, 50, 5), 14);
        assert.strictEqual(world.getLight(8, 50, 5), 13);
        // Position of removed torch should now be lit by Torch B (Torch B at dist 5 => 15 - 5 = 10)
        assert.strictEqual(world.getLight(5, 50, 5), 10);
    });

    it('should handle TNT ignition via game.interact', () => {
        world.setBlock(0, 50, 0, BLOCK.TNT);
        const handled = game.interact(0, 50, 0);

        assert.strictEqual(handled, true);
        assert.strictEqual(world.getBlock(0, 50, 0), BLOCK.AIR);
        assert.strictEqual(game.tntPrimed.length, 1);
        assert.strictEqual(game.tntPrimed[0].fuse, 4.0);
    });

    it('should handle Bed interaction during night to advance time', () => {
        world.setBlock(0, 50, 0, BLOCK.BED);
        game.gameTime = 13000; // Night time
        game.dayLength = 24000;

        const handled = game.interact(0, 50, 0);
        assert.strictEqual(handled, true);
        assert.ok(game.gameTime > 20000, 'Time should advance to morning');
    });

    it('should handle Enchanting Table interaction', () => {
        world.setBlock(0, 50, 0, BLOCK.ENCHANTING_TABLE);
        const handled = game.interact(0, 50, 0);

        assert.strictEqual(handled, true);
        assert.ok(game.ui.activeEnchanting, 'Enchanting UI should be opened');
    });

    it('should handle Jukebox interaction', () => {
        world.setBlock(0, 50, 0, BLOCK.JUKEBOX);
        const handled = game.interact(0, 50, 0);

        assert.strictEqual(handled, true);
        const entity = world.getBlockEntity(0, 50, 0);
        assert.ok(entity);
        assert.strictEqual(entity.type, 'jukebox');
    });
});
