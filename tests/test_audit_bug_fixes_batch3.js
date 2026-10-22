const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Audit Bug Fixes Batch 3 Test Suite', function() {
    let env, game;

    beforeEach(function() {
        env = createGameEnv();
        game = env.createGame();
    });

    it('Fix 1: World.prototype.emitVibration triggers Sculk Shrieker shriekAt', function() {
        const x = 10, y = 20, z = 10;
        const cx = Math.floor(x / 16);
        const cz = Math.floor(z / 16);
        game.world.generateChunk(cx, cz);
        game.world.setBlock(x, y, z, env.window.BLOCK.SCULK_SHRIEKER);

        let shriekCalled = false;
        game.world.shriekAt = function(sx, sy, sz) {
            shriekCalled = true;
            assert.strictEqual(sx, x);
            assert.strictEqual(sy, y);
            assert.strictEqual(sz, z);
        };

        game.world.emitVibration(x + 1, y, z, 'step');
        assert.strictEqual(shriekCalled, true, 'Sculk Shrieker should be triggered by nearby vibration');
    });

    it('Fix 2: switchDimension supports "end" dimension and generates End Stone terrain', function() {
        game.switchDimension('end');
        assert.strictEqual(game.world.dimension, 'end');
        assert.strictEqual(game.player.x, 0);
        assert.strictEqual(game.player.z, 0);

        // Verify chunk generation in the End
        game.world.generateChunk(0, 0);
        const y = game.world.getHighestBlockY(0, 0) - 1;
        const b = game.world.getBlock(0, y, 0);
        assert.strictEqual(b, env.window.BLOCK.END_STONE, 'Central End island should generate End Stone');
    });

    it('Fix 3: throwEyeOfEnder dynamically targets recorded world structures', function() {
        game.player.inventory[0] = { type: env.window.BLOCK.ITEM_EYE_OF_ENDER, count: 2 };
        game.player.selectedSlot = 0;
        game.player.x = 0;
        game.player.z = 0;

        game.world.structures = [{ name: 'Stronghold', x: 250, z: 400 }];

        let spawnedType = null;
        let spawnedDir = null;
        game.spawnProjectile = function(x, y, z, dir, type) {
            spawnedDir = dir;
            spawnedType = type;
        };

        const res = game.player.throwEyeOfEnder();
        assert.strictEqual(res, true);
        assert.strictEqual(spawnedType, 'eye_of_ender');

        // Check direction vector points toward (250, 400)
        const expectedDist = Math.hypot(250, 400);
        assert.ok(Math.abs(spawnedDir.x - (250 / expectedDist)) < 0.01);
        assert.ok(Math.abs(spawnedDir.z - (400 / expectedDist)) < 0.01);
    });
});
