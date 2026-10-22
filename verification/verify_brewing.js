const assert = require('assert');
const { createGameEnv } = require('../tests/helpers/game_env');

describe('Brewing Verification', () => {
    let env, game, window, BLOCK;

    beforeEach(() => {
        env = createGameEnv();
        game = env.createGame();
        window = env.window;
        BLOCK = window.BLOCK;
    });

    it('should brew potion', () => {
        const entity = {
            ingredient: { type: BLOCK.ITEM_NETHER_WART, count: 1 },
            bottles: [
                { type: BLOCK.ITEM_GLASS_BOTTLE, count: 1 },
                null,
                null
            ],
            brewTime: 0
        };

        // Tick 1
        game.processBrewing(entity, 1.0); // 1 sec -> +20 ticks
        assert.ok(entity.brewTime > 0, "Brew time should increase");

        // Finish
        game.processBrewing(entity, 20.0); // +400 ticks -> Finish

        assert.strictEqual(entity.brewTime, 0, "Brew time should reset");
        assert.strictEqual(entity.ingredient, null, "Ingredient consumed");
        assert.strictEqual(entity.bottles[0].type, BLOCK.ITEM_POTION, "Bottle converted to Potion");
    });
});
