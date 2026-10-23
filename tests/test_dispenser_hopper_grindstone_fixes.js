const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Dispenser, Hopper, Grindstone bug fixes', function () {
    this.timeout(30000);
    let env, game, BLOCK, BlockInteractions;
    const X = 10, Y = 20, Z = 10;

    before(function () {
        env = createGameEnv();
        BLOCK = env.BLOCK;
        BlockInteractions = env.window.BlockInteractions;
        game = env.createGame();
        game.world.generateChunk(0, 0);
    });

    after(function () {
        env.close();
    });

    function place(type) {
        game.world.setBlock(X, Y, Z, type);
        return type;
    }

    describe('Dispenser right-click interaction', function () {
        it('is registered in BlockInteractions', function () {
            assert.ok(BlockInteractions.has(BLOCK.DISPENSER), 'BLOCK.DISPENSER should be registered in BlockInteractions');
        });

        it('opens container UI and initializes block entity on right-click', function () {
            place(BLOCK.DISPENSER);
            let openedEntity = null;
            const origOpen = game.ui.openDispenser;
            game.ui.openDispenser = (entity) => { openedEntity = entity; };
            try {
                const consumed = game.interact(X, Y, Z);
                assert.strictEqual(consumed, true, 'Right click on Dispenser should be consumed');
                assert.ok(openedEntity, 'ui.openDispenser should be called');
                assert.strictEqual(openedEntity.type, 'dispenser');
                assert.strictEqual(openedEntity.items.length, 9);
            } finally {
                game.ui.openDispenser = origOpen;
            }
        });
    });

    describe('Hopper right-click interaction', function () {
        it('is registered in BlockInteractions', function () {
            assert.ok(BlockInteractions.has(BLOCK.HOPPER), 'BLOCK.HOPPER should be registered in BlockInteractions');
        });

        it('opens 5-slot hopper container UI on right-click', function () {
            place(BLOCK.HOPPER);
            let openedEntity = null;
            const origOpen = game.ui.openHopper;
            game.ui.openHopper = (entity) => { openedEntity = entity; };
            try {
                const consumed = game.interact(X, Y, Z);
                assert.strictEqual(consumed, true, 'Right click on Hopper should be consumed');
                assert.ok(openedEntity, 'ui.openHopper should be called');
                assert.strictEqual(openedEntity.type, 'hopper');
                assert.strictEqual(openedEntity.items.length, 5);
            } finally {
                game.ui.openHopper = origOpen;
            }
        });
    });

    describe('Grindstone right-click interaction and UI', function () {
        it('is registered in BlockInteractions', function () {
            assert.ok(BlockInteractions.has(BLOCK.GRINDSTONE), 'BLOCK.GRINDSTONE should be registered in BlockInteractions');
        });

        it('opens grindstone UI on right-click', function () {
            place(BLOCK.GRINDSTONE);
            const consumed = game.interact(X, Y, Z);
            assert.strictEqual(consumed, true, 'Right click on Grindstone should be consumed');
            assert.ok(game.ui.activeGrindstone, 'activeGrindstone should be set when opening UI');
            game.ui.closeGrindstone();
        });

        it('handles disenchanting and item repair in Grindstone UI', function () {
            game.ui.openGrindstone();
            assert.ok(game.ui.activeGrindstone, 'activeGrindstone should be set');

            // Set input item with enchantment
            game.ui.activeGrindstone.input1 = {
                type: BLOCK.ITEM_DIAMOND_SWORD || BLOCK.WOODEN_SWORD || 1,
                count: 1,
                durability: 50,
                enchantments: [{ type: 'Sharpness', level: 1 }]
            };
            game.ui.updateGrindstoneUI();

            assert.ok(game.ui.activeGrindstone.output, 'Output item should be generated');
            assert.strictEqual(game.ui.activeGrindstone.output.enchantments, undefined, 'Enchantments should be removed from output');

            // Take output
            game.ui.handleGrindstoneClick('grindstone-output');
            assert.ok(game.ui.cursorItem, 'Cursor item should receive disenchanted output');
            assert.strictEqual(game.ui.activeGrindstone.input1, null, 'Input slot 1 should be cleared');
            assert.strictEqual(game.ui.activeGrindstone.output, null, 'Output slot should be cleared');

            game.ui.closeGrindstone();
            assert.strictEqual(game.ui.activeGrindstone, null, 'Grindstone should be closed');
        });
    });

    describe('Dispenser redstone trigger execution', function () {
        it('creates a block entity upon placement via setBlock', function () {
            game.world.setBlock(X, Y, Z, BLOCK.DISPENSER);
            const entity = game.world.getBlockEntity(X, Y, Z);
            assert.ok(entity, 'Dispenser block entity should exist immediately after setBlock');
            assert.strictEqual(entity.type, 'dispenser');
            assert.strictEqual(entity.items.length, 9);
        });

        it('dispenses items when triggered by redstone power pulse', function () {
            game.world.setBlock(X, Y, Z, BLOCK.DISPENSER);
            const entity = game.world.getBlockEntity(X, Y, Z);
            entity.items[0] = { type: BLOCK.ITEM_APPLE || BLOCK.APPLE || 1, count: 5 };

            // Apply redstone power to adjacent block
            game.world.setBlock(X + 1, Y, Z, BLOCK.REDSTONE_BLOCK || BLOCK.REDSTONE_TORCH);
            game.world.setMetadata(X + 1, Y, Z, 15);
            game.world.activeRedstone.add(`${X},${Y},${Z}`);

            const dropsBefore = game.drops.length;
            game.world.updateRedstone();

            assert.strictEqual(entity.items[0].count, 4, 'Dispenser should consume 1 item from slot');
            assert.strictEqual(game.drops.length, dropsBefore + 1, 'Dispenser should produce 1 item drop in world');
        });
    });
});
