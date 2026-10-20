const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('ItemUse Registry Test Suite', () => {
    let env, game, window;

    beforeEach(() => {
        env = createGameEnv();
        game = env.createGame();
        window = env.window;
    });

    afterEach(() => {
        env.close();
    });

    it('should register and dispatch custom item-use handlers', () => {
        assert.ok(window.ItemUse, 'ItemUse module should be defined');

        let handled = false;
        const TEST_ITEM_ID = 9999;

        window.ItemUse.register(TEST_ITEM_ID, (g, slot, eyePos, dir) => {
            handled = true;
            return true;
        });

        assert.strictEqual(window.ItemUse.has(TEST_ITEM_ID), true);

        const slot = { type: TEST_ITEM_ID, count: 1 };
        const result = window.ItemUse.dispatch(game, slot, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, false);

        assert.strictEqual(result, true);
        assert.strictEqual(handled, true);
    });

    it('should handle default registered items like Spyglass', () => {
        const spyglassSlot = { type: window.BLOCK.ITEM_SPYGLASS, count: 1 };
        assert.strictEqual(window.ItemUse.has(window.BLOCK.ITEM_SPYGLASS), true);

        const initialSpyglassState = game.player.isUsingSpyglass;
        const result = window.ItemUse.dispatch(game, spyglassSlot, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, false);

        assert.strictEqual(result, true);
        assert.strictEqual(game.player.isUsingSpyglass, !initialSpyglassState);
    });
});
