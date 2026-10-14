// Player edits must survive chunks scrolling out of range (World.unloadFarChunks) and dimension trips.
// Before this fix, unloaded chunks were deleted and regenerated from noise, silently erasing builds.
const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Chunk persistence across unload/reload', function () {
    this.timeout(30000);
    let env, game, world, BLOCK;

    before(function () {
        env = createGameEnv();
        BLOCK = env.BLOCK;
        game = env.createGame();
        world = game.world;
    });
    after(function () { env.close(); });

    beforeEach(function () {
        world.chunks.clear();
        world.unloadedChunks.clear();
        world.pendingBlocks.clear();
        world.dimension = 'overworld';
    });

    function farAway(cx, cz) {
        // A player position well outside unloadDist (renderDist + 2) of chunk (cx, cz).
        return { x: (cx + 50) * 16, z: (cz + 50) * 16 };
    }

    it('freshly generated chunks are not flagged as edited (worldgen does not count)', function () {
        world.generateChunk(0, 0);
        world.generateChunk(1, 0);
        assert.strictEqual(world.getChunk(0, 0).edited, false);
        assert.strictEqual(world.getChunk(1, 0).edited, false);
        assert.strictEqual(world._generating, 0, 'generation counter must be balanced');
    });

    it('untouched chunks are simply dropped on unload (no memory kept)', function () {
        world.generateChunk(0, 0);
        const far = farAway(0, 0);
        world.unloadFarChunks(far.x, far.z, 4);
        assert.strictEqual(world.getChunk(0, 0), undefined);
        assert.strictEqual(world.unloadedChunks.size, 0);
    });

    it('a block placed by the player survives unload + regenerate', function () {
        world.generateChunk(0, 0);
        world.setBlock(5, 100, 5, BLOCK.OBSIDIAN);
        assert.strictEqual(world.getChunk(0, 0).edited, true);

        const far = farAway(0, 0);
        world.unloadFarChunks(far.x, far.z, 4);
        assert.strictEqual(world.getChunk(0, 0), undefined, 'chunk should be unloaded');
        assert.strictEqual(world.unloadedChunks.size, 1, 'edited chunk should be parked');

        world.generateChunk(0, 0);
        assert.strictEqual(world.getBlock(5, 100, 5), BLOCK.OBSIDIAN, 'edit must still be there');
        assert.strictEqual(world.unloadedChunks.size, 0, 'parked chunk is consumed on restore');
        assert.strictEqual(world.getChunk(0, 0).modified, true, 'restored chunk must re-render');
    });

    it('a block broken by the player stays broken after unload + regenerate', function () {
        world.generateChunk(2, 2);
        // find the top solid block of a column and remove it
        let y = 127;
        while (y > 0 && world.getBlock(40, y, 40) === BLOCK.AIR) y--;
        assert.ok(y > 0, 'expected solid ground somewhere in the column');
        world.setBlock(40, y, 40, BLOCK.AIR);

        const far = farAway(2, 2);
        world.unloadFarChunks(far.x, far.z, 4);
        world.generateChunk(2, 2);
        assert.strictEqual(world.getBlock(40, y, 40), BLOCK.AIR);
    });

    it('blocks set while a chunk is parked are applied when it comes back', function () {
        world.generateChunk(0, 0);
        world.setBlock(1, 90, 1, BLOCK.STONE);
        const far = farAway(0, 0);
        world.unloadFarChunks(far.x, far.z, 4);

        world.setBlock(2, 90, 2, BLOCK.GLASS); // goes to pendingBlocks (chunk not loaded)
        world.generateChunk(0, 0);
        assert.strictEqual(world.getBlock(1, 90, 1), BLOCK.STONE);
        assert.strictEqual(world.getBlock(2, 90, 2), BLOCK.GLASS);
        assert.strictEqual(world.pendingBlocks.has('0,0'), false);
    });

    it('parked chunks are keyed by dimension, and a dimension switch keeps edits', function () {
        world.generateChunk(0, 0);
        world.setBlock(7, 100, 7, BLOCK.BOOKSHELF);

        world.unloadAllChunks();            // what Game.switchDimension does now
        assert.strictEqual(world.chunks.size, 0);
        assert.ok(world.unloadedChunks.has('overworld:0,0'));

        world.dimension = 'nether';
        world.generateChunk(0, 0);           // nether (0,0) must NOT be the overworld chunk
        assert.notStrictEqual(world.getBlock(7, 100, 7), BLOCK.BOOKSHELF);
        assert.ok(world.unloadedChunks.has('overworld:0,0'), 'overworld chunk still parked');

        world.unloadAllChunks();
        world.dimension = 'overworld';
        world.generateChunk(0, 0);
        assert.strictEqual(world.getBlock(7, 100, 7), BLOCK.BOOKSHELF, 'back home, the build is still there');
    });

    it('_generating is balanced even when generation throws', function () {
        const orig = world.generateOverworldChunk;
        world.generateOverworldChunk = () => { throw new Error('boom'); };
        try {
            assert.throws(() => world.generateChunk(9, 9), /boom/);
        } finally {
            world.generateOverworldChunk = orig;
        }
        assert.strictEqual(world._generating, 0);
        world.generateChunk(9, 9);
        assert.ok(world.getChunk(9, 9), 'generation works again afterwards');
    });

    it('worldgen skips per-block light recalculation, gameplay edits do not', function () {
        world.generateChunk(0, 0);
        let calls = 0;
        const orig = world.recalcLocalLight;
        world.recalcLocalLight = function () { calls++; };
        try {
            world._generating++;
            world.setBlock(4, 100, 4, BLOCK.STONE); // what a structure does during generation
            world._generating--;
            assert.strictEqual(calls, 0, 'no light recalculation while generating');
            assert.strictEqual(world.getChunk(0, 0).edited, false, 'worldgen placement is not a player edit');

            world.setBlock(4, 101, 4, BLOCK.STONE);  // a player placing a block
            assert.strictEqual(calls, 1, 'gameplay placement still updates light');
            assert.strictEqual(world.getChunk(0, 0).edited, true);
        } finally {
            world.recalcLocalLight = orig;
        }
    });

    it('the parked set is capped (oldest edited chunk is evicted first)', function () {
        world.maxUnloadedChunks = 3;
        try {
            for (let i = 0; i < 5; i++) {
                world.generateChunk(i, 0);
                world.setBlock(i * 16 + 1, 100, 1, BLOCK.STONE);
                world.unloadFarChunks(10000, 10000, 1);
            }
            assert.strictEqual(world.unloadedChunks.size, 3);
            assert.deepEqual(Array.from(world.unloadedChunks.keys()), ['overworld:2,0', 'overworld:3,0', 'overworld:4,0']);
        } finally {
            world.maxUnloadedChunks = 512;
        }
    });

    it('saveWorld includes parked chunks and loadWorld marks loaded chunks as edited', function () {
        const store = {};
        const w = env.window;
        const origLS = w.localStorage;
        const origAlert = w.alert;
        // jsdom's localStorage may be unavailable for about:blank origins -> provide a tiny shim
        Object.defineProperty(w, 'localStorage', {
            configurable: true,
            value: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; } }
        });
        w.alert = () => {};
        try {
            world.generateChunk(0, 0);
            world.setBlock(3, 100, 3, BLOCK.BRICK);
            world.unloadFarChunks(10000, 10000, 1);     // parked, not loaded
            world.generateChunk(5, 5);                    // loaded, unedited
            world.saveWorld('persist_test');
            assert.ok(store['voxelWorldSave_persist_test'], 'save should be written');
            const saved = JSON.parse(store['voxelWorldSave_persist_test']);
            assert.ok(saved.chunks.some(c => c.cx === 0 && c.cz === 0), 'parked chunk is in the save');
            assert.ok(saved.chunks.some(c => c.cx === 5 && c.cz === 5), 'loaded chunk is in the save');

            world.chunks.clear();
            world.unloadedChunks.clear();
            world.loadWorld('persist_test');
            assert.strictEqual(world.getBlock(3, 100, 3), BLOCK.BRICK);
            assert.strictEqual(world.getChunk(0, 0).edited, true, 'chunks from a save are kept when unloaded');
            assert.strictEqual(world.unloadedChunks.size, 0);
        } finally {
            Object.defineProperty(w, 'localStorage', { configurable: true, value: origLS });
            w.alert = origAlert;
        }
    });
});
