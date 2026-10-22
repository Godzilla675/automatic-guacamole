const assert = require('assert');
const { createGameEnv } = require('../tests/helpers/game_env');

describe('Nether Verification', () => {
    let env, game, world, window, BLOCK;

    beforeEach(() => {
        env = createGameEnv();
        game = env.createGame();
        world = game.world;
        window = env.window;
        BLOCK = window.BLOCK;
    });

    it('should generate netherrack and lava', () => {
        world.dimension = 'nether';

        // Mock Perlin for low noise
        window.perlin.noise = (x, y, z) => 0.1; // Low noise -> Solid netherrack

        world.generateChunk(0, 0);
        const chunk = world.getChunk(0, 0);

        assert.strictEqual(chunk.getBlock(0, 0, 0), BLOCK.BEDROCK, "Bottom bedrock missing");
        assert.strictEqual(chunk.getBlock(0, 127, 0), BLOCK.BEDROCK, "Top bedrock missing");

        // Check solid
        assert.strictEqual(chunk.getBlock(0, 50, 0), BLOCK.NETHERRACK, "Middle should be netherrack with low noise");

        // Mock noise high for cave/lava check
        window.perlin.noise = (x, y, z) => 0.8; // High noise -> Air/Lava

        world.chunks.clear();
        world.generateChunk(0, 0);
        const chunk2 = world.getChunk(0, 0);

        assert.strictEqual(chunk2.getBlock(0, 10, 0), BLOCK.LAVA, "Low Y high noise should be lava");
        assert.strictEqual(chunk2.getBlock(0, 50, 0), BLOCK.AIR, "High Y high noise should be air");
    });
});
