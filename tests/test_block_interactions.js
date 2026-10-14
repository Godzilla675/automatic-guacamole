// Block interaction registry (js/interactions.js) + Game.interact() dispatch.
// NOTE: objects created inside the game window live in another JS realm, so compare them with
// assert.deepEqual (structural) rather than deepStrictEqual (which also compares prototypes).
const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Block interaction registry', function () {
    this.timeout(30000);
    let env, game, BLOCK, BlockInteractions;
    const X = 5, Y = 40, Z = 5;

    before(function () {
        env = createGameEnv();
        BLOCK = env.BLOCK;
        BlockInteractions = env.window.BlockInteractions;
        game = env.createGame();
        game.world.generateChunk(0, 0);
    });
    after(function () { env.close(); });

    function place(type) {
        game.world.setBlock(X, Y, Z, type);
        game.world.removeBlockEntity(X, Y, Z);
        return type;
    }

    describe('registry API', function () {
        it('is exposed on window and pre-populated with the default handlers', function () {
            assert.ok(BlockInteractions, 'window.BlockInteractions should exist');
            const expected = ['CHEST', 'FURNACE', 'SMOKER', 'BLAST_FURNACE', 'BREWING_STAND', 'ENCHANTING_TABLE', 'ANVIL',
                'JUKEBOX', 'NOTE_BLOCK', 'BED', 'TNT', 'COMPOSTER', 'CRAFTER', 'DROPPER', 'ENDER_CHEST', 'STONECUTTER',
                'SMITHING_TABLE', 'FLETCHING_TABLE', 'CHISELED_BOOKSHELF', 'LODESTONE', 'CAULDRON', 'BEEHIVE',
                'TRIAL_SPAWNER', 'TRIAL_VAULT', 'OMINOUS_VAULT', 'RESPAWN_ANCHOR', 'CREAKING_HEART'];
            for (const name of expected) {
                assert.ok(BLOCK[name] !== undefined, `BLOCK.${name} should be defined`);
                assert.ok(BlockInteractions.has(BLOCK[name]), `handler for BLOCK.${name} should be registered`);
            }
        });

        it('register() accepts a single id or an array and returns the handler', function () {
            const h = () => true;
            assert.strictEqual(BlockInteractions.register(BLOCK.STONE, h), h);
            assert.strictEqual(BlockInteractions.get(BLOCK.STONE), h);
            BlockInteractions.register([BLOCK.DIRT, BLOCK.SAND], h);
            assert.strictEqual(BlockInteractions.get(BLOCK.DIRT), h);
            assert.strictEqual(BlockInteractions.get(BLOCK.SAND), h);
            for (const id of [BLOCK.STONE, BLOCK.DIRT, BLOCK.SAND]) assert.ok(BlockInteractions.unregister(id));
            assert.strictEqual(BlockInteractions.get(BLOCK.STONE), null);
        });

        it('register() rejects undefined ids (typos in BLOCK names) and non-function handlers', function () {
            assert.throws(() => BlockInteractions.register(BLOCK.DOES_NOT_EXIST, () => true), /undefined/);
            assert.throws(() => BlockInteractions.register(BLOCK.STONE, 'nope'), /function/);
        });

        it('later registrations override earlier ones (plugins can replace defaults)', function () {
            const original = BlockInteractions.get(BLOCK.CHEST);
            let called = false;
            BlockInteractions.register(BLOCK.CHEST, () => { called = true; return true; });
            place(BLOCK.CHEST);
            assert.strictEqual(game.interact(X, Y, Z), true);
            assert.ok(called, 'override should have been invoked');
            BlockInteractions.register(BLOCK.CHEST, original);
        });

        it('dispatch() only treats an explicit `true` as "handled"', function () {
            BlockInteractions.register(BLOCK.STONE, () => undefined);
            assert.strictEqual(BlockInteractions.dispatch(game, X, Y, Z, BLOCK.STONE, {}), false);
            BlockInteractions.register(BLOCK.STONE, () => 1);
            assert.strictEqual(BlockInteractions.dispatch(game, X, Y, Z, BLOCK.STONE, {}), false);
            BlockInteractions.register(BLOCK.STONE, () => true);
            assert.strictEqual(BlockInteractions.dispatch(game, X, Y, Z, BLOCK.STONE, {}), true);
            BlockInteractions.unregister(BLOCK.STONE);
            assert.strictEqual(BlockInteractions.dispatch(game, X, Y, Z, BLOCK.STONE, {}), false);
        });

        it('passes (game, x, y, z, blockType, pos) to handlers', function () {
            let args = null;
            BlockInteractions.register(BLOCK.STONE, (...a) => { args = a; return true; });
            place(BLOCK.STONE);
            game.interact(X, Y, Z);
            BlockInteractions.unregister(BLOCK.STONE);
            assert.strictEqual(args[0], game);
            assert.deepStrictEqual(args.slice(1, 4), [X, Y, Z]);
            assert.strictEqual(args[4], BLOCK.STONE);
            assert.deepEqual(args[5], { x: X + 0.5, y: Y + 0.5, z: Z + 0.5 });
        });
    });

    describe('Game.interact() dispatch', function () {
        it('returns false for blocks with no handler (so placement can continue)', function () {
            place(BLOCK.STONE);
            assert.strictEqual(game.interact(X, Y, Z), false);
        });

        it('opens container UIs and lazily creates their block entities', function () {
            const cases = [
                [BLOCK.CHEST, 'openChest', 'chest', 27],
                [BLOCK.DROPPER, 'openDropper', 'dropper', 9],
                [BLOCK.CRAFTER, 'openCrafter', 'crafter', 9],
                [BLOCK.CHISELED_BOOKSHELF, 'openChiseledBookshelf', 'chiseled_bookshelf', 6]
            ];
            for (const [type, method, entityType, slots] of cases) {
                let opened = null;
                game.ui[method] = e => { opened = e; };
                place(type);
                assert.strictEqual(game.interact(X, Y, Z), true, `${entityType} should be handled`);
                assert.ok(opened, `${method} should have been called`);
                assert.strictEqual(opened.type, entityType);
                assert.strictEqual(opened.items.length, slots);
                assert.strictEqual(game.world.getBlockEntity(X, Y, Z), opened, 'entity should be stored in the world');
            }
        });

        it('furnace family creates the right entity type and speed', function () {
            const cases = [[BLOCK.FURNACE, 'furnace', 100], [BLOCK.SMOKER, 'smoker', 50], [BLOCK.BLAST_FURNACE, 'blast_furnace', 50]];
            for (const [type, entityType, maxProgress] of cases) {
                let opened = null;
                game.ui.openFurnace = e => { opened = e; };
                place(type);
                assert.strictEqual(game.interact(X, Y, Z), true);
                assert.strictEqual(opened.type, entityType);
                assert.strictEqual(opened.maxProgress, maxProgress);
            }
        });

        it('simple UI blocks open their screens', function () {
            const cases = [
                [BLOCK.ENCHANTING_TABLE, 'openEnchanting'], [BLOCK.ANVIL, 'openAnvil'], [BLOCK.STONECUTTER, 'openStonecutter'],
                [BLOCK.SMITHING_TABLE, 'openSmithingTable'], [BLOCK.FLETCHING_TABLE, 'openFletchingTable'], [BLOCK.ENDER_CHEST, 'openEnderChest']
            ];
            for (const [type, method] of cases) {
                let called = false;
                game.ui[method] = () => { called = true; };
                place(type);
                assert.strictEqual(game.interact(X, Y, Z), true, `${method} block should be handled`);
                assert.ok(called, `${method} should have been called`);
            }
        });

        it('note block cycles its pitch metadata 0..24', function () {
            place(BLOCK.NOTE_BLOCK);
            game.world.setMetadata(X, Y, Z, 24);
            assert.strictEqual(game.interact(X, Y, Z), true);
            assert.strictEqual(game.world.getMetadata(X, Y, Z), 0);
            game.interact(X, Y, Z);
            assert.strictEqual(game.world.getMetadata(X, Y, Z), 1);
        });

        it('TNT is primed and removed from the world', function () {
            place(BLOCK.TNT);
            const before = game.tntPrimed.length;
            assert.strictEqual(game.interact(X, Y, Z), true);
            assert.strictEqual(game.world.getBlock(X, Y, Z), BLOCK.AIR);
            assert.strictEqual(game.tntPrimed.length, before + 1);
            assert.deepStrictEqual({ x: game.tntPrimed[before].x, y: game.tntPrimed[before].y, z: game.tntPrimed[before].z }, { x: X + 0.5, y: Y + 0.5, z: Z + 0.5 });
        });

        it('bed sleeps through the night and sets the spawn point, but not during the day', function () {
            place(BLOCK.BED);
            game.gameTime = game.dayLength * 0.75; // night
            game.player.x = 1; game.player.y = 2; game.player.z = 3;
            assert.strictEqual(game.interact(X, Y, Z), true);
            assert.deepEqual(game.player.spawnPoint, { x: 1, y: 2, z: 3 });
            assert.ok((game.gameTime % game.dayLength) / game.dayLength < 0.5, 'should now be morning');

            const daytime = game.dayLength * 0.25;
            game.gameTime = daytime;
            game.player.spawnPoint = null;
            assert.strictEqual(game.interact(X, Y, Z), true, 'bed still consumes the click during the day');
            assert.strictEqual(game.gameTime, daytime, 'time must not change during the day');
            assert.strictEqual(game.player.spawnPoint, null);
        });

        it('lodestone only handles the click when a compass is held (falls through otherwise)', function () {
            place(BLOCK.LODESTONE);
            game.player.inventory[game.player.selectedSlot] = null;
            assert.strictEqual(game.interact(X, Y, Z), false, 'no compass -> not handled');
            game.player.inventory[game.player.selectedSlot] = { type: BLOCK.ITEM_COMPASS, count: 1 };
            assert.strictEqual(game.interact(X, Y, Z), true);
            assert.deepEqual(game.player.lodestoneTarget, { x: X, y: Y, z: Z });
            assert.deepEqual(game.player.inventory[game.player.selectedSlot].lodestonePos, { x: X, y: Y, z: Z });
            game.player.inventory[game.player.selectedSlot] = null;
        });

        it('composter accepts compostables and yields bone at level 7', function () {
            place(BLOCK.COMPOSTER);
            const slot = game.player.selectedSlot;
            game.player.inventory[slot] = { type: BLOCK.ITEM_APPLE, count: 10 };
            for (let i = 1; i <= 6; i++) {
                assert.strictEqual(game.interact(X, Y, Z), true);
                assert.strictEqual(game.world.getBlockEntity(X, Y, Z).level, i);
            }
            const bonesBefore = game.player.inventory.filter(s => s && s.type === BLOCK.ITEM_BONE).reduce((n, s) => n + s.count, 0);
            game.interact(X, Y, Z);
            assert.strictEqual(game.world.getBlockEntity(X, Y, Z).level, 0, 'composter resets after level 7');
            const bonesAfter = game.player.inventory.filter(s => s && s.type === BLOCK.ITEM_BONE).reduce((n, s) => n + s.count, 0);
            assert.strictEqual(bonesAfter, bonesBefore + 1);
            assert.strictEqual(game.player.inventory[slot].count, 3, '7 apples consumed');
            game.player.inventory[slot] = null;
        });

        it('flag-based blocks (doors, trapdoors) are still handled by Game.interact()', function () {
            const door = Object.keys(env.BLOCKS).map(Number).find(id => env.BLOCKS[id].isDoor);
            const trapdoor = Object.keys(env.BLOCKS).map(Number).find(id => env.BLOCKS[id].isTrapdoor);
            assert.ok(door !== undefined && trapdoor !== undefined, 'test needs a door and a trapdoor block');
            for (const type of [door, trapdoor]) {
                assert.ok(!BlockInteractions.has(type), 'flag-based blocks are not in the id registry');
                place(type);
                game.world.setMetadata(X, Y, Z, 0);
                assert.strictEqual(game.interact(X, Y, Z), true);
                assert.strictEqual(game.world.getMetadata(X, Y, Z) & 4, 4, 'open bit toggled on');
                game.interact(X, Y, Z);
                assert.strictEqual(game.world.getMetadata(X, Y, Z) & 4, 0, 'open bit toggled off');
            }
        });

        it('a handler registered from a plugin script is picked up without touching game.js', function () {
            env.run(`
                BlockInteractions.register(BLOCK.GLASS, (game, x, y, z) => {
                    game.world.setMetadata(x, y, z, 7);
                    return true;
                });
            `, 'my_plugin.js');
            place(BLOCK.GLASS);
            assert.strictEqual(game.interact(X, Y, Z), true);
            assert.strictEqual(game.world.getMetadata(X, Y, Z), 7);
            BlockInteractions.unregister(BLOCK.GLASS);
            assert.strictEqual(game.interact(X, Y, Z), false);
        });
    });
});
