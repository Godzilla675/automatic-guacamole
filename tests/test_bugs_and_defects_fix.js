const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Bugs & Defects Comprehensive Fix Test Suite', function() {
    let env, game;

    beforeEach(function() {
        env = createGameEnv();
        game = env.createGame();
    });

    it('Fix 1: End Dimension terrain generation produces End Stone for central island', function() {
        game.switchDimension('end');
        assert.strictEqual(game.world.dimension, 'end');
        game.world.generateChunk(0, 0);

        const y = game.world.getHighestBlockY(0, 0) - 1;
        const block = game.world.getBlock(0, y, 0);
        assert.strictEqual(block, env.window.BLOCK.END_STONE, 'Central End island should generate End Stone');
    });

    it('Fix 2: TNT interaction ignites primed TNT and clears TNT block', function() {
        game.world.generateChunk(0, 0);
        game.world.setBlock(5, 10, 5, env.window.BLOCK.TNT);

        const handled = game.interact(5, 10, 5);
        assert.strictEqual(handled, true, 'Interaction with TNT should return true');
        assert.strictEqual(game.world.getBlock(5, 10, 5), env.window.BLOCK.AIR, 'TNT block should be removed');
        assert.ok(game.tntPrimed && game.tntPrimed.length > 0, 'TNT entity should be added to tntPrimed array');
    });

    it('Fix 3: Creative Mode Bed sleeping advances world time to morning', function() {
        game.world.generateChunk(0, 0);
        game.world.setBlock(10, 50, 10, env.window.BLOCK.BED);
        game.player.gamemode = 1; // Creative Mode
        game.gameTime = 1000; // Daytime

        const handled = game.interact(10, 50, 10);
        assert.strictEqual(handled, true, 'Bed interaction should return true');
        assert.ok(game.gameTime > 1000, 'Time should advance to morning even in daytime when in Creative mode');
    });

    it('Fix 4: Enchanting Table UI toggles enchantingUIActive flag', function() {
        game.world.generateChunk(0, 0);
        game.world.setBlock(10, 50, 10, env.window.BLOCK.ENCHANTING_TABLE);

        game.interact(10, 50, 10);
        assert.strictEqual(game.ui.enchantingUIActive, true, 'enchantingUIActive should be set to true when opening');

        game.ui.closeEnchanting();
        assert.strictEqual(game.ui.enchantingUIActive, false, 'enchantingUIActive should be set to false when closing');
    });

    it('Fix 5: Jukebox interaction handles music disc insertion, ejection, and UI', function() {
        game.world.generateChunk(0, 0);
        const x = 5, y = 5, z = 5;
        game.world.setBlock(x, y, z, env.window.BLOCK.JUKEBOX);

        game.player.inventory[0] = { type: env.window.BLOCK.ITEM_MUSIC_DISC, count: 1 };
        game.player.selectedSlot = 0;

        const handled = game.interact(x, y, z);
        assert.strictEqual(handled, true, 'Jukebox interaction should handle music disc insertion');

        const entity = game.world.getBlockEntity(x, y, z);
        assert.ok(entity, 'Jukebox block entity should exist');
        assert.strictEqual(entity.disc, env.window.BLOCK.ITEM_MUSIC_DISC, 'Disc should be stored in entity');

        // Second interaction ejects disc
        const ejectHandled = game.interact(x, y, z);
        assert.strictEqual(ejectHandled, true);
        assert.strictEqual(entity.disc, null, 'Disc should be ejected on second interaction');
    });

    it('Fix 6: Redstone Comparator calculates fullness scaling signal for containers', function() {
        game.world.generateChunk(0, 0);
        const x = 5, y = 5, z = 5;

        // Place chest with items adjacent to comparator
        game.world.setBlock(x + 1, y, z, env.window.BLOCK.CHEST);
        const items = new Array(27).fill(null);
        items[0] = { type: env.window.BLOCK.DIRT, count: 64 };
        game.world.setBlockEntity(x + 1, y, z, { type: 'chest', items });

        game.world.setBlock(x, y, z, env.window.BLOCK.REDSTONE_COMPARATOR);
        game.world.updateRedstone(x, y, z);

        const signal = game.world.getMetadata(x, y, z);
        assert.ok(signal >= 1, 'Comparator should measure container fullness signal >= 1');
    });

    it('Fix 7: Enderman pickUpBlock and placeBlock mechanics work as expected', function() {
        game.world.generateChunk(0, 0);
        const mob = new env.window.Mob(game, 10, 50, 10, env.window.MOB_TYPE.ENDERMAN);

        game.world.setBlock(11, 50, 10, env.window.BLOCK.DIRT);
        game.world.setBlock(11, 49, 10, env.window.BLOCK.STONE);

        const picked = mob.pickUpBlock(11, 50, 10);
        assert.strictEqual(picked, true, 'Enderman should pick up DIRT block');
        assert.strictEqual(mob.carriedBlock, env.window.BLOCK.DIRT);
        assert.strictEqual(game.world.getBlock(11, 50, 10), env.window.BLOCK.AIR);

        const placed = mob.placeBlock(11, 50, 10);
        assert.strictEqual(placed, true, 'Enderman should place carried DIRT block back');
        assert.strictEqual(mob.carriedBlock, null);
        assert.strictEqual(game.world.getBlock(11, 50, 10), env.window.BLOCK.DIRT);
    });

    it('Fix 8: Sculk Shrieker HUD vibration meter UI updates properly', function() {
        game.ui.updateSculkVibrationMeter(10, 2);
        const el = env.window.document.getElementById('sculk-vibration-meter');
        assert.ok(el, 'Sculk vibration meter element should be created in DOM');
        assert.strictEqual(el.style.display, 'block');
        assert.ok(el.textContent.includes('66%'), 'Should contain percentage text');

        game.ui.updateSculkVibrationMeter(0, 0);
        assert.strictEqual(el.style.display, 'none');
    });
});
