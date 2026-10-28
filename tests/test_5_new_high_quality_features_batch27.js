const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('5 High-Quality New Features Batch 27', function() {
    let env, game, world, player;

    beforeEach(function() {
        env = createGameEnv();
        game = env.createGame();
        world = game.world;
        player = game.player;
        world.generateChunk(0, 0);
    });

    describe('Feature 1: Potion of Levitation Brewing & Consumption', function() {
        it('should define ITEM_POTION_LEVITATION and ITEM_SHULKER_SHELL', function() {
            assert.ok(env.window.BLOCK.ITEM_POTION_LEVITATION, 'ITEM_POTION_LEVITATION defined');
            assert.ok(env.window.BLOCK.ITEM_SHULKER_SHELL, 'ITEM_SHULKER_SHELL defined');
            const levDef = env.window.BLOCKS[env.window.BLOCK.ITEM_POTION_LEVITATION];
            assert.strictEqual(levDef.name, 'Potion of Levitation');
        });

        it('should brew Shulker Shell with Awkward Potion into Potion of Levitation', function() {
            const brewingEntity = {
                type: 'brewing_stand',
                fuel: 20,
                ingredient: { type: env.window.BLOCK.ITEM_SHULKER_SHELL, count: 1 },
                bottles: [
                    { type: env.window.BLOCK.ITEM_POTION_AWKWARD, count: 1 },
                    null,
                    null
                ],
                brewTime: 390
            };

            game.processBrewing(brewingEntity, 1.0); // complete brew
            assert.strictEqual(brewingEntity.bottles[0].type, env.window.BLOCK.ITEM_POTION_LEVITATION);
        });

        it('should apply Levitation status effect and upward buoyancy physics when drank', function() {
            player.inventory[0] = { type: env.window.BLOCK.ITEM_POTION_LEVITATION, count: 1 };
            player.selectedSlot = 0;

            const consumed = player.eat(env.window.BLOCK.ITEM_POTION_LEVITATION);
            assert.strictEqual(consumed, true);

            const levEffect = player.activeEffects.find(e => e.name === 'Levitation');
            assert.ok(levEffect, 'Levitation effect added');
            assert.strictEqual(levEffect.duration, 15);

            player.onGround = false;
            player.flying = false;
            player.update(0.1);

            assert.strictEqual(player.vy, 3.5, 'Upward levitation velocity applied');
            assert.strictEqual(player.fallDistance, 0, 'Fall distance reset during levitation');
        });
    });

    describe('Feature 2: Shulker Box Container Storage & 16-Color Variant Dyeing', function() {
        it('should define 17 Shulker Box block variants', function() {
            assert.ok(env.window.BLOCK.SHULKER_BOX);
            assert.ok(env.window.BLOCK.SHULKER_BOX_WHITE);
            assert.ok(env.window.BLOCK.SHULKER_BOX_RED);
            assert.ok(env.window.BLOCK.SHULKER_BOX_BLACK);

            const shulkerDef = env.window.BLOCKS[env.window.BLOCK.SHULKER_BOX_RED];
            assert.strictEqual(shulkerDef.isShulkerBox, true);
        });

        it('should open 27-slot container storage on right click interaction', function() {
            world.setBlock(10, 20, 10, env.window.BLOCK.SHULKER_BOX_BLUE);
            const interacted = game.interact(10, 20, 10);
            assert.strictEqual(interacted, true);

            const entity = world.getBlockEntity(10, 20, 10);
            assert.ok(entity);
            assert.strictEqual(entity.type, 'chest');
            assert.strictEqual(entity.items.length, 27);
        });

        it('should include crafting recipes for Shulker Box and color dyeing', function() {
            const recipes = game.crafting.recipes;
            const baseRecipe = recipes.find(r => r.name === 'Shulker Box');
            assert.ok(baseRecipe, 'Base Shulker Box recipe exists');

            const dyeRecipe = recipes.find(r => r.name === 'Red Shulker Box');
            assert.ok(dyeRecipe, 'Red Shulker Box dyeing recipe exists');
            assert.strictEqual(dyeRecipe.result.type, env.window.BLOCK.SHULKER_BOX_RED);
        });
    });

    describe('Feature 3: Name Tag Mob Naming & Persistence', function() {
        it('should apply custom name and set persistent flag when right-clicking mob with Name Tag', function() {
            const cow = new env.window.Mob(game, 5, 10, 5, env.window.MOB_TYPE.COW);
            player.inventory[0] = { type: env.window.BLOCK.ITEM_NAME_TAG, count: 1, name: 'Bessie' };
            player.selectedSlot = 0;

            const handled = cow.interact(env.window.BLOCK.ITEM_NAME_TAG);
            assert.strictEqual(handled, true);
            assert.strictEqual(cow.customName, 'Bessie');
            assert.strictEqual(cow.persistent, true);
            assert.strictEqual(cow.preventDespawn, true);
            assert.strictEqual(player.inventory[0], null, 'Name Tag consumed');
        });
    });

    describe('Feature 4: Candles (16 Colored Variants & Flint and Steel Lighting/Extinguishing)', function() {
        it('should define Candle and 16 color variants', function() {
            assert.ok(env.window.BLOCK.CANDLE);
            assert.ok(env.window.BLOCK.CANDLE_WHITE);
            assert.ok(env.window.BLOCK.CANDLE_CYAN);
            assert.ok(env.window.BLOCK.CANDLE_BLACK);
            assert.strictEqual(env.window.BLOCKS[env.window.BLOCK.CANDLE].isCandle, true);
        });

        it('should light unlit candle with Flint and Steel and extinguish with empty hand', function() {
            world.setBlock(15, 10, 15, env.window.BLOCK.CANDLE_PINK);
            world.setMetadata(15, 10, 15, 0); // Unlit

            // Light candle
            player.inventory[0] = { type: env.window.BLOCK.ITEM_FLINT_AND_STEEL, count: 1 };
            player.selectedSlot = 0;

            let interacted = game.interact(15, 10, 15);
            assert.strictEqual(interacted, true);
            let meta = world.getMetadata(15, 10, 15);
            assert.strictEqual(meta & 1, 1, 'Candle is lit');

            // Extinguish candle
            player.inventory[0] = null;
            interacted = game.interact(15, 10, 15);
            assert.strictEqual(interacted, true);
            meta = world.getMetadata(15, 10, 15);
            assert.strictEqual(meta & 1, 0, 'Candle is extinguished');
        });
    });

    describe('Feature 5: Calibrated Sculk Sensor Redstone Vibration Frequency Filtering', function() {
        it('should define CALIBRATED_SCULK_SENSOR and crafting recipe', function() {
            assert.ok(env.window.BLOCK.CALIBRATED_SCULK_SENSOR);
            const calRecipe = game.crafting.recipes.find(r => r.name === 'Calibrated Sculk Sensor');
            assert.ok(calRecipe, 'Calibrated Sculk Sensor recipe exists');
        });

        it('should filter vibrations based on adjacent side redstone input power level', function() {
            const calSensorId = env.window.BLOCK.CALIBRATED_SCULK_SENSOR;
            world.setBlock(0, 10, 0, calSensorId);

            // 1. Unfiltered (side input power = 0): responds to any vibration frequency
            world.emitVibration(0, 10, 1, 'break'); // frequency = 5
            let meta = world.getMetadata(0, 10, 0);
            assert.strictEqual(meta, 5, 'Responded to vibration when uncalibrated');

            // Reset
            world.setMetadata(0, 10, 0, 0);

            // 2. Calibrate side input with signal strength = 3
            world.setMetadata(1, 10, 0, 3);

            // Emit non-matching vibration frequency 5 ('break')
            world.emitVibration(0, 10, 1, 'break');
            meta = world.getMetadata(0, 10, 0);
            assert.strictEqual(meta, 0, 'Filtered out non-matching vibration frequency 5');

            // Emit matching vibration frequency 3 ('flap')
            world.emitVibration(0, 10, 1, 'flap');
            meta = world.getMetadata(0, 10, 0);
            assert.strictEqual(meta, 3, 'Triggered on matching vibration frequency 3');
        });
    });
});
