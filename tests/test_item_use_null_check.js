const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Item Use Null Safety Checks', function () {
    let env, game;

    beforeEach(function () {
        env = createGameEnv();
        game = env.createGame();
        game.world.generateChunk(0, 0);
    });

    afterEach(function () {
        if (env) env.close();
    });

    it('should safely handle right-clicking with AIR or items not in BLOCKS without throwing', function () {
        game.player.x = 0.5;
        game.player.y = 30.0;
        game.player.z = 0.5;
        game.player.pitch = 0;
        game.player.yaw = 0; // facing +Z direction

        // Place a dirt block in front of player
        game.world.setBlock(0, 31, 3, env.BLOCK.DIRT);

        // Test holding AIR block (0)
        game.player.inventory[0] = { type: env.BLOCK.AIR, count: 1 };
        game.player.selectedSlot = 0;

        assert.doesNotThrow(() => {
            game.placeBlock();
        });

        // Test holding item type not in BLOCKS (e.g. 999)
        game.player.inventory[0] = { type: 999, count: 1 };
        assert.doesNotThrow(() => {
            game.placeBlock();
        });

        // Test holding null slot
        game.player.inventory[0] = null;
        assert.doesNotThrow(() => {
            game.placeBlock();
        });
    });
});
