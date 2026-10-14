// Hopper ticking (World.updateHoppers) - entity-driven instead of a per-frame world scan.
// NOTE: objects from the game window live in another realm -> use assert.deepEqual, not deepStrictEqual.
const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Hoppers', function () {
    this.timeout(30000);
    let env, game, world, BLOCK, MOB_TYPE;

    before(function () {
        env = createGameEnv();
        BLOCK = env.BLOCK;
        MOB_TYPE = env.MOB_TYPE;
        game = env.createGame();
        world = game.world;
        world.generateChunk(0, 0);
    });
    after(function () { env.close(); });

    function chestWith(x, y, z, items) {
        world.setBlock(x, y, z, BLOCK.CHEST);
        const entity = { type: 'chest', items: new Array(27).fill(null) };
        items.forEach((it, i) => { entity.items[i] = it; });
        world.setBlockEntity(x, y, z, entity);
        return entity;
    }

    it('placing a hopper creates its block entity immediately', function () {
        world.setBlock(3, 30, 3, BLOCK.HOPPER);
        const e = world.getBlockEntity(3, 30, 3);
        assert.ok(e, 'hopper entity should exist right after setBlock');
        assert.strictEqual(e.type, 'hopper');
        assert.strictEqual(e.items.length, 5);
    });

    it('replacing a hopper removes its entity (no stale hopper logic keeps running)', function () {
        world.setBlock(3, 30, 3, BLOCK.HOPPER);
        world.setBlock(3, 30, 3, BLOCK.STONE);
        assert.strictEqual(world.getBlockEntity(3, 30, 3), undefined);
    });

    it('moves items from a chest above into a chest below (near the origin)', function () {
        const top = chestWith(2, 32, 2, [{ type: BLOCK.ITEM_DIAMOND, count: 3 }]);
        world.setBlock(2, 31, 2, BLOCK.HOPPER);
        const bottom = chestWith(2, 30, 2, []);
        for (let i = 0; i < 20; i++) world.updateHoppers();
        const moved = bottom.items.filter(it => it && it.type === BLOCK.ITEM_DIAMOND).reduce((n, it) => n + it.count, 0);
        const left = top.items.filter(it => it && it.type === BLOCK.ITEM_DIAMOND).reduce((n, it) => n + it.count, 0);
        const inHopper = world.getBlockEntity(2, 31, 2).items.filter(it => it && it.type === BLOCK.ITEM_DIAMOND).reduce((n, it) => n + it.count, 0);
        assert.strictEqual(moved + left + inHopper, 3, 'no items duplicated or lost');
        assert.ok(moved > 0, 'at least one diamond should have reached the bottom chest');
    });

    it('works far away from the world origin (the old scan only covered chunks around 0,0)', function () {
        const cx = 40, cz = -37; // chunk (40,-37): ~640 blocks from spawn
        world.generateChunk(cx, cz);
        const x = cx * 16 + 5, z = cz * 16 + 5, y = 60;
        const top = chestWith(x, y + 1, z, [{ type: BLOCK.ITEM_GOLD_INGOT, count: 2 }]);
        world.setBlock(x, y, z, BLOCK.HOPPER);
        const bottom = chestWith(x, y - 1, z, []);
        for (let i = 0; i < 20; i++) world.updateHoppers();
        const moved = bottom.items.filter(it => it && it.type === BLOCK.ITEM_GOLD_INGOT).reduce((n, it) => n + it.count, 0);
        assert.ok(moved > 0, 'hopper far from spawn should transfer items');
        assert.strictEqual(top.items.filter(Boolean).length, 0, 'top chest should be emptied');
    });

    it('keeps the entity (and its items) when the hopper is in an unloaded chunk', function () {
        const cx = 90, cz = 90;
        const x = cx * 16 + 1, z = cz * 16 + 1, y = 50;
        // Entity exists but the chunk was never generated/loaded.
        world.setBlockEntity(x, y, z, { type: 'hopper', items: [{ type: BLOCK.ITEM_DIAMOND, count: 1 }, null, null, null, null] });
        world.updateHoppers();
        const e = world.getBlockEntity(x, y, z);
        assert.ok(e, 'entity must survive while its chunk is unloaded');
        assert.strictEqual(e.items[0].count, 1);
        world.removeBlockEntity(x, y, z);
    });

    it('drops a stale hopper entity whose block is gone in a loaded chunk', function () {
        world.setBlockEntity(6, 30, 6, { type: 'hopper', items: new Array(5).fill(null) });
        assert.strictEqual(world.getBlock(6, 30, 6) === BLOCK.HOPPER, false);
        world.updateHoppers();
        assert.strictEqual(world.getBlockEntity(6, 30, 6), undefined);
    });

    it('does not scan the world: block reads scale with hopper count, not chunk volume', function () {
        world.setBlock(8, 30, 8, BLOCK.HOPPER);
        let reads = 0;
        const chunk = world.getChunkAt(8, 8);
        const original = chunk.getBlock;
        chunk.getBlock = function (...a) { reads++; return original.apply(this, a); };
        try {
            world.updateHoppers();
        } finally {
            chunk.getBlock = original;
        }
        // The old implementation read every block in 16 chunks (~480k reads). A handful per hopper is fine.
        assert.ok(reads < 200, `expected a few block reads per hopper, got ${reads}`);
    });

    it('regression: ticking hoppers while a Warden is alive must not throw', function () {
        // The old updateHoppers() referenced the loop variables x/y/z after the loop ended, which
        // threw a ReferenceError (and froze the game loop) as soon as a Warden existed.
        assert.ok(MOB_TYPE && MOB_TYPE.WARDEN !== undefined, 'Warden mob type should exist');
        const warden = new env.window.Mob(game, 4, 31, 4, MOB_TYPE.WARDEN);
        game.mobs.push(warden);
        world.setBlock(4, 30, 4, BLOCK.HOPPER);
        assert.doesNotThrow(() => world.updateHoppers());
        assert.doesNotThrow(() => world.updateRedstone());
        game.mobs.pop();
    });
});
