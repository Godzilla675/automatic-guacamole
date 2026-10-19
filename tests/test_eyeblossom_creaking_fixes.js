const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Eyeblossom Stew Nausea & Creaking Heart Resin Multiplier Tests', function() {
    let env, game, player, world;

    beforeEach(function() {
        env = createGameEnv();
        game = env.createGame();
        global.Drop = env.window.Drop;
        env.window.Drop = env.window.Drop;
        player = game.player;
        world = game.world;
    });

    it('should grant Poison and Nausea when eating Eyeblossom Suspicious Stew', function() {
        player.inventory[0] = { type: env.window.BLOCK.ITEM_SUSPICIOUS_STEW, count: 1, isEyeblossomStew: true };
        player.selectedSlot = 0;
        player.hunger = 10;

        const result = player.eat(env.window.BLOCK.ITEM_SUSPICIOUS_STEW);
        assert.strictEqual(result, true, 'Should eat stew successfully');
        assert.strictEqual(player.hunger, 16, 'Hunger should restore by 6');

        const poisonEffect = player.activeEffects.find(e => e.name === 'Poison');
        const nauseaEffect = player.activeEffects.find(e => e.name === 'Nausea');

        assert.ok(poisonEffect, 'Poison status effect should be applied');
        assert.ok(nauseaEffect, 'Nausea status effect should be applied');
        assert.strictEqual(nauseaEffect.duration, 15, 'Nausea duration should be 15');
    });

    it('should yield 2 resin clumps when mining Creaking Heart without nearby Pale Oak blocks', function() {
        const cx = 0, cz = 0;
        world.generateChunk(cx, cz);
        const x = 5, y = 10, z = 5;
        world.setBlock(x, y, z, env.window.BLOCK.CREAKING_HEART);

        game.finalizeBreakBlock(x, y, z);

        const drop = game.drops.find(d => d.type === env.window.BLOCK.ITEM_RESIN_CLUMP);
        assert.ok(drop, 'Should drop resin clumps');
        assert.strictEqual(drop.count, 2, 'Should drop 2 resin clumps without canopy');
    });

    it('should yield boosted resin clumps (5) when mining Creaking Heart near Pale Oak canopy', function() {
        const cx = 0, cz = 0;
        world.generateChunk(cx, cz);
        const x = 5, y = 10, z = 5;
        world.setBlock(x, y, z, env.window.BLOCK.CREAKING_HEART);
        world.setBlock(x + 2, y + 1, z, env.window.BLOCK.PALE_OAK_LEAVES);

        game.finalizeBreakBlock(x, y, z);

        const drop = game.drops.find(d => d.type === env.window.BLOCK.ITEM_RESIN_CLUMP);
        assert.ok(drop, 'Should drop resin clumps');
        assert.strictEqual(drop.count, 5, 'Should drop 5 resin clumps near canopy');
    });

    it('should drop Creaking Heart block entity only when tool has silkTouch === true', function() {
        const cx = 0, cz = 0;
        world.generateChunk(cx, cz);
        const x = 5, y = 10, z = 5;
        world.setBlock(x, y, z, env.window.BLOCK.CREAKING_HEART);

        // Regular diamond axe without silkTouch
        player.inventory[0] = { type: env.window.BLOCK.AXE_DIAMOND, count: 1 };
        player.selectedSlot = 0;

        game.finalizeBreakBlock(x, y, z);

        let heartDrop = game.drops.find(d => d.type === env.window.BLOCK.CREAKING_HEART);
        assert.strictEqual(heartDrop, undefined, 'Normal axe should not yield Creaking Heart block item');

        // Reset and test with Silk Touch tool
        game.drops = [];
        world.setBlock(x, y, z, env.window.BLOCK.CREAKING_HEART);
        player.inventory[0] = { type: env.window.BLOCK.AXE_DIAMOND, count: 1, silkTouch: true };

        game.finalizeBreakBlock(x, y, z);

        heartDrop = game.drops.find(d => d.type === env.window.BLOCK.CREAKING_HEART);
        assert.ok(heartDrop, 'Silk touch axe should drop Creaking Heart block');
        assert.strictEqual(heartDrop.count, 1, 'Should drop 1 Creaking Heart item');
    });
});
