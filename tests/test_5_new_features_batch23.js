const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Batch 23 Features Test Suite', function() {
    let env, game;

    beforeEach(function() {
        env = createGameEnv();
        game = env.createGame();
        game.world.generateChunk(0, 0);
    });

    it('1. Echo Shard and Recovery Compass Crafting', function() {
        const BLOCK = env.window.BLOCK;
        const BLOCKS = env.window.BLOCKS;

        assert.strictEqual(BLOCK.ITEM_ECHO_SHARD, 587);
        assert.ok(BLOCKS[BLOCK.ITEM_ECHO_SHARD]);
        assert.strictEqual(BLOCKS[BLOCK.ITEM_ECHO_SHARD].name, 'Echo Shard');

        game.player.inventory[0] = { type: BLOCK.ITEM_ECHO_SHARD, count: 8 };
        game.player.inventory[1] = { type: BLOCK.ITEM_COMPASS, count: 1 };

        const recipeIndex = game.crafting.recipes.findIndex(r => r.name === 'Recovery Compass');
        assert.ok(recipeIndex !== -1, 'Recovery Compass recipe should exist');

        game.crafting.craft(recipeIndex);

        const hasRecoveryCompass = game.player.inventory.some(item => item && item.type === BLOCK.ITEM_RECOVERY_COMPASS);
        assert.ok(hasRecoveryCompass, 'Player should receive Recovery Compass after crafting');
    });

    it('2. Goat Horn Instruments and Ramming Drops', function() {
        const BLOCK = env.window.BLOCK;
        const BLOCKS = env.window.BLOCKS;
        const MOB_TYPE = env.window.MOB_TYPE;

        assert.strictEqual(BLOCK.ITEM_GOAT_HORN, 588);
        assert.ok(BLOCKS[BLOCK.ITEM_GOAT_HORN]);
        assert.strictEqual(BLOCKS[BLOCK.ITEM_GOAT_HORN].name, 'Goat Horn');

        // Test Goat mob ramming solid block
        const goat = new env.window.Mob(game, 10.5, 60, 10.5, MOB_TYPE.GOAT);
        game.world.setBlock(10, 60, 11, BLOCK.STONE);
        goat.yaw = 0; // facing +Z direction (10, 60, 11)
        goat.vx = 5;  // High velocity
        goat.vz = 5;
        goat.updateGoatAI(0.1);

        const hornDrop = game.drops.find(d => d.type === BLOCK.ITEM_GOAT_HORN);
        assert.ok(hornDrop, 'Goat ramming solid block should drop Goat Horn');

        // Test Goat Horn right-click item use
        const slot = { type: BLOCK.ITEM_GOAT_HORN, count: 1 };
        game.player.inventory[0] = slot;
        game.player.selectedSlot = 0;

        let soundPlayed = false;
        env.window.soundManager.play = function(type) {
            if (type === 'goat_horn') soundPlayed = true;
        };

        const handled = env.window.ItemUse.dispatch(game, slot, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, false);
        assert.strictEqual(handled, true);
        assert.strictEqual(soundPlayed, true, 'goat_horn sound should be played on item use');
    });

    it('3. Stray and Husk Mob Variants', function() {
        const MOB_TYPE = env.window.MOB_TYPE;

        // Position in open air at y=60
        const stray = new env.window.Mob(game, 0, 60, 0, MOB_TYPE.STRAY);
        assert.strictEqual(stray.color, '#B0C4DE');
        assert.strictEqual(stray.sunlightBurn, true);

        let projSpawned = null;
        game.spawnProjectile = function(x, y, z, dir, type) {
            projSpawned = type;
        };
        stray.attackCooldown = 0;
        game.player.x = 0;
        game.player.y = 60;
        game.player.z = 5; // In open air, clear line of sight
        stray.updateHostileAI(0.1);
        assert.strictEqual(projSpawned, 'slowness_arrow', 'Stray should shoot slowness arrows');

        const husk = new env.window.Mob(game, 0, 60, 0, MOB_TYPE.HUSK);
        assert.strictEqual(husk.color, '#D2B48C');
        assert.strictEqual(husk.sunlightBurn, false, 'Husk should not burn in daylight');

        let effectAdded = null;
        game.player.addEffect = function(name, icon, duration) {
            effectAdded = name;
        };
        husk.attackCooldown = 0;
        game.player.x = 0;
        game.player.y = 60;
        game.player.z = 0.5; // Within melee range
        husk.updateHostileAI(0.1);
        assert.strictEqual(effectAdded, 'Hunger', 'Husk melee attack should inflict Hunger effect');
    });

    it('4. Redstone Comparator Subtract Mode', function() {
        const BLOCK = env.window.BLOCK;

        // Place support blocks at y=59 and comparator / target at y=60
        game.world.setBlock(5, 59, 5, BLOCK.STONE);
        game.world.setBlock(4, 59, 5, BLOCK.STONE);

        game.world.setBlock(5, 60, 5, BLOCK.REDSTONE_COMPARATOR);
        game.world.setBlock(4, 60, 5, BLOCK.TARGET_BLOCK);

        // Test interaction toggle
        env.window.BlockInteractions.dispatch(game, 5, 60, 5, BLOCK.REDSTONE_COMPARATOR, { x: 5.5, y: 60.5, z: 5.5 });
        let entity = game.world.getBlockEntity(5, 60, 5);
        assert.ok(entity);
        assert.strictEqual(entity.mode, 'subtract');

        // Setup input signal
        game.world.setMetadata(4, 60, 5, 10); // Rear input power 10
        game.world.setMetadata(5, 60, 5, 0); // output 0 initially

        game.world.activeRedstone.add('5,60,5');
        game.world.updateRedstone();

        // In subtract mode with 0 side power, output = max(0, 10 - 0) = 10
        assert.strictEqual(game.world.getMetadata(5, 60, 5), 10);

        // Toggle back to compare mode
        env.window.BlockInteractions.dispatch(game, 5, 60, 5, BLOCK.REDSTONE_COMPARATOR, { x: 5.5, y: 60.5, z: 5.5 });
        assert.strictEqual(entity.mode, 'compare');
    });

    it('5. Custom Inventory Sort Button', function() {
        const BLOCK = env.window.BLOCK;

        // Populate slots 9, 10, 11 with duplicate and unsorted items
        game.player.inventory[9] = { type: BLOCK.DIRT, count: 20 };
        game.player.inventory[10] = { type: BLOCK.ITEM_APPLE, count: 10 };
        game.player.inventory[11] = { type: BLOCK.DIRT, count: 15 };

        game.ui.sortPlayerInventory();

        // Should consolidate DIRT items into slot 9 (20 + 15 = 35) and sort by name
        const inv = game.player.inventory;
        const nonNulls = inv.slice(9, 36).filter(Boolean);

        assert.strictEqual(nonNulls.length, 2, 'Duplicates should be stacked together');
        const dirtItem = nonNulls.find(it => it.type === BLOCK.DIRT);
        assert.ok(dirtItem);
        assert.strictEqual(dirtItem.count, 35, 'Dirt stacks should merge to 35');
    });
});
