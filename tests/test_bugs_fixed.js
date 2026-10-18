const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Bug Fixes Verification Suite', () => {
    let env, game, world, window;

    beforeEach(() => {
        env = createGameEnv();
        game = env.createGame();
        world = game.world;
        window = env.window;
    });

    it('should scale redstone comparator power output proportional to container fullness', () => {
        const cx = 10, cy = 60, cz = 10;
        const compX = 11, compY = 60, compZ = 10;

        // Ensure chunk exists
        world.generateChunk(0, 0);

        // Place Chest adjacent to Redstone Comparator
        world.setBlock(cx, cy, cz, window.BLOCK.CHEST);
        world.setBlock(compX, compY, compZ, window.BLOCK.REDSTONE_COMPARATOR);

        // Empty chest -> comparator output power should be 0
        const chestEntity = { type: 'chest', items: new Array(27).fill(null) };
        world.setBlockEntity(cx, cy, cz, chestEntity);

        world.activeRedstone.add(`${compX},${compY},${compZ}`);
        world.updateRedstone();
        assert.strictEqual(world.getMetadata(compX, compY, compZ), 0);

        // Partially filled chest (1 stack of 64 items) -> comparator output power > 0
        chestEntity.items[0] = { type: window.BLOCK.STONE, count: 64 };
        world.activeRedstone.add(`${compX},${compY},${compZ}`);
        world.updateRedstone();
        const power1 = world.getMetadata(compX, compY, compZ);
        assert.ok(power1 > 0 && power1 < 15, `Expected power between 1 and 14, got ${power1}`);

        // Fully filled chest (27 stacks of 64 items) -> comparator output power = 15
        for (let i = 0; i < 27; i++) {
            chestEntity.items[i] = { type: window.BLOCK.STONE, count: 64 };
        }
        world.activeRedstone.add(`${compX},${compY},${compZ}`);
        world.updateRedstone();
        const powerFull = world.getMetadata(compX, compY, compZ);
        assert.strictEqual(powerFull, 15);
    });

    it('should allow Enderman mobs to pick up and place moveable blocks', () => {
        const ex = 5, ey = 60, ez = 5;
        world.generateChunk(0, 0);

        const enderman = new window.Mob(game, ex, ey, ez, window.MOB_TYPE.ENDERMAN);

        // Setup block to pick up
        world.setBlock(ex + 1, ey, ez, window.BLOCK.DIRT);
        world.setBlock(ex + 1, ey - 1, ez, window.BLOCK.STONE);

        // Pick up block
        const picked = enderman.pickUpBlock(ex + 1, ey, ez);
        assert.strictEqual(picked, true);
        assert.strictEqual(enderman.carriedBlock, window.BLOCK.DIRT);
        assert.strictEqual(world.getBlock(ex + 1, ey, ez), window.BLOCK.AIR);

        // Place block on solid ground
        world.setBlock(ex - 1, ey, ez, window.BLOCK.AIR);
        world.setBlock(ex - 1, ey - 1, ez, window.BLOCK.STONE);

        const placed = enderman.placeBlock(ex - 1, ey, ez);
        assert.strictEqual(placed, true);
        assert.strictEqual(enderman.carriedBlock, null);
        assert.strictEqual(world.getBlock(ex - 1, ey, ez), window.BLOCK.DIRT);
    });

    it('should track Sculk Shrieker vibration accumulation and update HUD meter', () => {
        const sx = 20, sy = 60, sz = 20;
        world.generateChunk(1, 1);
        world.setBlock(sx, sy, sz, window.BLOCK.SCULK_SHRIEKER);

        let meterUpdated = false;
        let lastLevel = 0;
        let lastWarning = 0;

        game.ui.updateSculkVibrationMeter = (level, warning) => {
            meterUpdated = true;
            lastLevel = level;
            lastWarning = warning;
        };

        // Emit vibration near Sculk Shrieker
        world.emitVibration(sx, sy, sz, 'break');

        assert.strictEqual(meterUpdated, true);
        assert.ok(lastLevel > 0, `Expected vibration level > 0, got ${lastLevel}`);

        const entity = world.getBlockEntity(sx, sy, sz);
        assert.ok(entity && entity.vibrationLevel > 0);
    });
});
