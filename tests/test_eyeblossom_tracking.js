const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Eyeblossom Tracking and Nocturnal Blooming Tests', function() {
    this.timeout(10000);
    let env, game;

    beforeEach(function() {
        env = createGameEnv();
        game = env.createGame();
        game.world.renderDistance = 1;
        game.gameLoop = () => {};
    });

    afterEach(function() {
        if (env) env.close();
    });

    it('should track eyeblossom when placed via setBlock and untrack when removed', function() {
        const world = game.world;
        assert.ok(world.eyeblossoms && typeof world.eyeblossoms.has === 'function', 'world.eyeblossoms should be a Set');

        world.generateChunk(0, 0);

        // Place an eyeblossom at (5, 10, 5)
        world.setBlock(5, 10, 5, env.BLOCK.EYEBLOSSOM);
        assert.ok(world.eyeblossoms.has('5,10,5'), 'Eyeblossom at 5,10,5 should be tracked');

        // Replace with AIR
        world.setBlock(5, 10, 5, env.BLOCK.AIR);
        assert.strictEqual(world.eyeblossoms.has('5,10,5'), false, 'Eyeblossom at 5,10,5 should be untracked on removal');
    });

    it('should spawn blooming particles at night near player and prune stale entries', function() {
        const world = game.world;
        world.generateChunk(0, 0);

        game.player.x = 5;
        game.player.y = 10;
        game.player.z = 5;

        // Place eyeblossom near player
        world.setBlock(5, 10, 5, env.BLOCK.EYEBLOSSOM);
        assert.ok(world.eyeblossoms.has('5,10,5'));

        let particleSpawned = false;
        game.particles = {
            update: () => {},
            spawn: (x, y, z, color, count) => {
                particleSpawned = true;
                assert.strictEqual(color, '#FF8C00');
            }
        };

        // Set time to night (dayLength = 120000, 60000+ is night)
        game.gameTime = 60000;
        game.frameCount = 20;

        // Force particle spawn by overriding window's Math.random
        const origRandom = env.window.Math.random;
        env.window.Math.random = () => 0.1; // < 0.3 triggers particle
        try {
            game.update(0.016);
            assert.ok(particleSpawned, 'Particle should be spawned for eyeblossom at night');
        } finally {
            env.window.Math.random = origRandom;
        }

        // Test pruning stale eyeblossoms when block was changed without updating set
        world.eyeblossoms.add('99,99,99'); // Out of bounds or stale block
        game.player.x = 99;
        game.player.y = 99;
        game.player.z = 99;

        game.frameCount = 40;
        game.update(0.016);
        assert.strictEqual(world.eyeblossoms.has('99,99,99'), false, 'Stale eyeblossom entry should be pruned during update');
    });
});
