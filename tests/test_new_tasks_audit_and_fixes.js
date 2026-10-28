const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('New Tasks Audit and Fixes Suite', function () {
    let env, game;

    beforeEach(function () {
        env = createGameEnv();
        game = env.createGame();
    });

    it('should initialize Ender Dragon entity with boss stats and crystal healing', function () {
        const Mob = env.window.Mob;
        const MOB_TYPE = env.window.MOB_TYPE;
        const BLOCK = env.window.BLOCK;

        assert.ok(MOB_TYPE.ENDER_DRAGON, 'MOB_TYPE.ENDER_DRAGON should be defined');

        const dragon = new Mob(game, 0, 50, 0, MOB_TYPE.ENDER_DRAGON);
        assert.strictEqual(dragon.health, 200, 'Dragon should have 200 health');
        assert.strictEqual(dragon.maxHealth, 200, 'Dragon max health should be 200');
        assert.strictEqual(dragon.isBoss, true, 'Dragon should be marked as boss');

        // Test End Crystal / Obsidian Healing
        game.world.generateChunk(0, 0);
        game.world.setBlock(0, 50, 0, BLOCK.OBSIDIAN);
        dragon.health = 150;
        dragon.healTimer = 1.0;
        dragon.updateEnderDragonAI(0);

        assert.strictEqual(dragon.health, 154, 'Dragon should heal when near obsidian/end crystal pillar');

        // Test Dragon Attack AI Cooldown & Damage
        game.player.x = dragon.x + 1;
        game.player.y = dragon.y;
        game.player.z = dragon.z + 1;
        const initialHealth = game.player.health;
        dragon.updateEnderDragonAI(1.0);
        assert.ok(game.player.health < initialHealth, 'Player should take damage from close-range dragon attack');
    });

    it('should handle Wandering Trader bartering interaction and trading UI opening', function () {
        const Mob = env.window.Mob;
        const MOB_TYPE = env.window.MOB_TYPE;

        const trader = new Mob(game, 0, 5, 0, MOB_TYPE.WANDERING_TRADER);
        game.mobs.push(trader);

        // Right-click interaction with empty hand opens trading UI
        const interacted = trader.interact(0);
        assert.strictEqual(interacted, true, 'Interacting with Wandering Trader should return true');
        assert.strictEqual(game.ui.activeVillager, trader, 'activeVillager in UIManager should be set to trader');
        assert.ok(Array.isArray(trader.trades), 'Trader should have generated trades array');
        assert.ok(trader.trades.length > 0, 'Trader should have at least 1 trade');
    });

    it('should support Axolotl 5 color variants and breeding with raw fish', function () {
        const Mob = env.window.Mob;
        const MOB_TYPE = env.window.MOB_TYPE;
        const BLOCK = env.window.BLOCK;

        const ax1 = new Mob(game, 0, 5, 0, MOB_TYPE.AXOLOTL);
        const ax2 = new Mob(game, 1, 5, 0, MOB_TYPE.AXOLOTL);
        game.mobs.push(ax1, ax2);

        assert.ok(ax1.variant, 'Axolotl 1 should have a variant');
        assert.ok(ax2.variant, 'Axolotl 2 should have a variant');
        assert.ok(typeof ax1.color === 'string', 'Axolotl color should be a string');

        // Feed raw fish to both
        ax1.interact(BLOCK.ITEM_RAW_FISH);
        ax2.interact(BLOCK.ITEM_RAW_FISH);

        assert.ok(ax1.loveTimer > 0, 'Axolotl 1 should be in love mode');
        assert.ok(ax2.loveTimer > 0, 'Axolotl 2 should be in love mode');

        // Update passive AI to trigger breeding
        ax1.updatePassiveAI(1.0);

        const baby = game.mobs.find(m => m.isBaby);
        assert.ok(baby, 'Baby axolotl should be spawned after breeding');
        assert.ok(baby.variant, 'Baby axolotl should inherit or generate a variant');
    });
});
