const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Brewing Stand Blaze Powder Fuel and Potion Variants Suite', () => {
    let env, game, window, BLOCK;

    beforeEach(() => {
        env = createGameEnv();
        game = env.createGame();
        window = env.window;
        BLOCK = window.BLOCK;
    });

    it('should consume Blaze Powder fuel item and refill brewing stand fuel charges', () => {
        const entity = {
            fuel: 0,
            fuelItem: { type: BLOCK.ITEM_BLAZE_POWDER, count: 1 },
            ingredient: { type: BLOCK.ITEM_NETHER_WART, count: 1 },
            bottles: [
                { type: BLOCK.ITEM_GLASS_BOTTLE, count: 1 },
                null,
                null
            ],
            brewTime: 0
        };

        // Tick processBrewing
        game.processBrewing(entity, 1.0);

        assert.strictEqual(entity.fuel, 20, "Fuel charges should be initialized to 20");
        assert.strictEqual(entity.fuelItem, null, "Fuel item should be consumed");
        assert.ok(entity.brewTime > 0, "Brew time should progress when fuel is available");
    });

    it('should brew Awkward Potion from Nether Wart and Glass Bottle', () => {
        const entity = {
            fuel: 1,
            ingredient: { type: BLOCK.ITEM_NETHER_WART, count: 1 },
            bottles: [
                { type: BLOCK.ITEM_GLASS_BOTTLE, count: 1 },
                null,
                null
            ],
            brewTime: 0
        };

        game.processBrewing(entity, 20.0); // 20s = 400 ticks

        assert.strictEqual(entity.brewTime, 0);
        assert.strictEqual(entity.fuel, 0);
        assert.strictEqual(entity.ingredient, null);
        assert.strictEqual(entity.bottles[0].type, BLOCK.ITEM_POTION_AWKWARD);
    });

    it('should brew Potion of Swiftness from Sugar and Awkward Potion', () => {
        const entity = {
            fuel: 5,
            ingredient: { type: BLOCK.ITEM_SUGAR, count: 1 },
            bottles: [
                { type: BLOCK.ITEM_POTION_AWKWARD, count: 1 },
                null,
                null
            ],
            brewTime: 0
        };

        game.processBrewing(entity, 20.0);

        assert.strictEqual(entity.fuel, 4);
        assert.strictEqual(entity.ingredient, null);
        assert.strictEqual(entity.bottles[0].type, BLOCK.ITEM_POTION_SWIFTNESS);
    });

    it('should brew Potion of Healing from Glistering Melon and Awkward Potion', () => {
        const entity = {
            fuel: 5,
            ingredient: { type: BLOCK.ITEM_GLISTERING_MELON, count: 1 },
            bottles: [
                { type: BLOCK.ITEM_POTION_AWKWARD, count: 1 },
                null,
                null
            ],
            brewTime: 0
        };

        game.processBrewing(entity, 20.0);

        assert.strictEqual(entity.bottles[0].type, BLOCK.ITEM_POTION_HEALING);
    });

    it('should apply player health recovery and status effects when drinking potions', () => {
        const player = game.player;

        // Healing Potion
        player.health = 10;
        player.eat(BLOCK.ITEM_POTION_HEALING);
        assert.strictEqual(player.health, 18, "Healing potion should restore 8 health");

        // Swiftness Potion
        player.eat(BLOCK.ITEM_POTION_SWIFTNESS);
        const speedEff = player.activeEffects.find(e => e.name === 'Speed');
        assert.ok(speedEff, "Drinking Swiftness potion should apply Speed effect");

        // Golden Apple
        player.health = 10;
        player.hunger = 10;
        player.eat(BLOCK.ITEM_GOLDEN_APPLE);
        const absEff = player.activeEffects.find(e => e.name === 'Absorption');
        assert.ok(absEff, "Eating Golden Apple should apply Absorption effect");
    });

    it('should handle UI slot clicks for brewing fuel and ingredients', () => {
        const entity = {
            fuel: 0,
            fuelItem: null,
            ingredient: null,
            bottles: [null, null, null],
            brewTime: 0
        };

        game.ui.openBrewing(entity);
        game.ui.cursorItem = { type: BLOCK.ITEM_BLAZE_POWDER, count: 2 };

        game.ui.handleBrewingClick('brewing-fuel');

        assert.strictEqual(entity.fuelItem.type, BLOCK.ITEM_BLAZE_POWDER);
        assert.strictEqual(entity.fuelItem.count, 2);
        assert.strictEqual(game.ui.cursorItem, null);
    });
});
