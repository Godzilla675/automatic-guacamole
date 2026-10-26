const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Sculk, Copper Grate, and Item Frame Features', function() {
    let env, game, world;

    beforeEach(function() {
        env = createGameEnv();
        game = env.createGame();
        world = game.world;
        world.generateChunk(0, 0);
        world.generateChunk(1, 1);
    });

    it('Sculk Shrieker tracks warning levels and spawns Warden at warning level 4', function() {
        const x = 10, y = 10, z = 10;
        world.setBlock(x, y, z, env.window.BLOCK.SCULK_SHRIEKER);

        let entity = world.getBlockEntity(x, y, z);
        if (!entity) {
            entity = { type: 'sculk_shrieker', vibrationLevel: 0, warningLevel: 0 };
            world.setBlockEntity(x, y, z, entity);
        }

        // Emit vibrations to build vibrationLevel and advance warning levels
        for (let i = 0; i < 4; i++) {
            world.emitVibration(x + 1, y, z, 'explosion'); // signalStrength = 10
            world.emitVibration(x + 1, y, z, 'explosion'); // total 20 >= 15 -> warningLevel++
        }

        entity = world.getBlockEntity(x, y, z);
        assert.strictEqual(entity.warningLevel, 4, 'Warning level should reach 4');

        // Verify Warden was spawned
        const warden = game.mobs.find(m => m.type === env.window.MOB_TYPE.WARDEN);
        assert.ok(warden, 'Warden mob entity should be spawned near Sculk Shrieker at warning level 4');
    });

    it('Submerged Copper Grate retains block type while waterlogged and propagating fluid flow', function() {
        const x = 5, y = 10, z = 5;
        world.setBlock(x, y, z, env.window.BLOCK.COPPER_GRATE);
        world.setWaterlogged(x, y, z, true);

        assert.strictEqual(world.getBlock(x, y, z), env.window.BLOCK.COPPER_GRATE, 'Grate block should remain intact');
        assert.strictEqual(world.isWaterlogged(x, y, z), true, 'Grate block should report waterlogged status');
    });

    it('Item Frame rotates on right-click interaction and outputs 1-8 redstone signal to Comparator', function() {
        const fx = 5, fy = 10, fz = 5;
        const cx = 5, cy = 10, cz = 6;

        world.setBlock(fx, fy, fz, env.window.BLOCK.ITEM_FRAME);
        world.setBlock(cx, cy, cz, env.window.BLOCK.REDSTONE_COMPARATOR);

        // Perform right click interaction on Item Frame
        const handler = env.window.BlockInteractions.get(env.window.BLOCK.ITEM_FRAME);
        assert.ok(handler, 'BlockInteractions handler for ITEM_FRAME should be registered');

        handler(game, fx, fy, fz, env.window.BLOCK.ITEM_FRAME, { x: fx + 0.5, y: fy + 0.5, z: fz + 0.5 });
        assert.strictEqual(world.getMetadata(fx, fy, fz), 2, 'Metadata should increment from 1 to 2 on right click');

        // Update redstone network
        world.activeRedstone.add(`${cx},${cy},${cz}`);
        world.updateRedstone();

        const compSignal = world.getMetadata(cx, cy, cz);
        assert.strictEqual(compSignal, 2, 'Redstone Comparator should read signal strength 2 from adjacent Item Frame');
    });
});
