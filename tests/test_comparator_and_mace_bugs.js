const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Mace Shockwave & Comparator Bug Fixes', () => {
    let env, game, world, player;

    beforeEach(() => {
        env = createGameEnv();
        game = env.createGame();
        world = game.world;
        player = game.player;
    });

    it('should spawn Mace shockwave particles on Mace smash attack', () => {
        let shockwaveSpawned = false;
        let shockwaveX, shockwaveY, shockwaveZ;

        game.particles = {
            spawnMaceShockwave: (x, y, z) => {
                shockwaveSpawned = true;
                shockwaveX = x;
                shockwaveY = y;
                shockwaveZ = z;
            },
            spawn: () => {}
        };

        const targetEntity = {
            x: 10, y: 5, z: 10,
            takeDamage: () => {}
        };

        player.inventory[player.selectedSlot] = { type: env.window.BLOCK.ITEM_MACE, count: 1 };
        player.fallDistance = 3.0;
        player.vy = -5.0;

        player.attack(targetEntity);

        assert.strictEqual(shockwaveSpawned, true, 'Mace smash should trigger spawnMaceShockwave');
        assert.strictEqual(shockwaveX, 10);
        assert.strictEqual(shockwaveY, 5);
        assert.strictEqual(shockwaveZ, 10);
    });

    it('should evaluate rear power vs side power correctly in Comparator compare mode', () => {
        world.generateChunk(0, 0);

        const cx = 5, cy = 10, cz = 5;
        // Support floor
        world.setBlock(cx, cy - 1, cz, env.window.BLOCK.STONE);
        world.setBlock(cx, cy - 1, cz + 1, env.window.BLOCK.STONE);
        world.setBlock(cx + 1, cy - 1, cz, env.window.BLOCK.STONE);

        world.setBlock(cx, cy, cz, env.window.BLOCK.REDSTONE_COMPARATOR);
        // Orientation 4 (Facing North -Z with explicit facing bit 4 set): rear is South (+Z), side inputs are East (+X) and West (-X)
        world.setMetadata(cx, cy, cz, 4);
        world.setBlockEntity(cx, cy, cz, { type: 'comparator', mode: 'compare' });

        // Place weak rear power (Target block with power 10 and entity timer at South cz+1)
        world.setBlock(cx, cy, cz + 1, env.window.BLOCK.TARGET_BLOCK);
        world.setMetadata(cx, cy, cz + 1, 10);
        world.setBlockEntity(cx, cy, cz + 1, { type: 'target', timer: 1.0, power: 10 });

        // Place strong side power (Redstone Torch at East cx+1)
        world.setBlock(cx + 1, cy, cz, env.window.BLOCK.REDSTONE_TORCH);

        world.activeRedstone.add(`${cx},${cy},${cz}`);
        world.updateRedstone();

        const output = world.getMetadata(cx, cy, cz);
        assert.strictEqual(output, 0, 'In compare mode, output should be 0 when side power > rear power');
    });

    it('should subtract side power from rear power in Comparator subtract mode', () => {
        world.generateChunk(0, 0);

        const cx = 5, cy = 10, cz = 5;
        // Support floor
        world.setBlock(cx, cy - 1, cz, env.window.BLOCK.STONE);
        world.setBlock(cx, cy - 1, cz + 1, env.window.BLOCK.STONE);
        world.setBlock(cx - 1, cy - 1, cz, env.window.BLOCK.STONE);

        world.setBlock(cx, cy, cz, env.window.BLOCK.REDSTONE_COMPARATOR);
        world.setMetadata(cx, cy, cz, 4); // facing North with explicit facing bit, rear is South (+Z)
        world.setBlockEntity(cx, cy, cz, { type: 'comparator', mode: 'subtract' });

        // Rear power = 15 (Redstone Torch at South cz+1)
        world.setBlock(cx, cy, cz + 1, env.window.BLOCK.REDSTONE_TORCH);

        // Side power = 5 (Target block with power 5 and entity timer at West cx-1)
        world.setBlock(cx - 1, cy, cz, env.window.BLOCK.TARGET_BLOCK);
        world.setMetadata(cx - 1, cy, cz, 5);
        world.setBlockEntity(cx - 1, cy, cz, { type: 'target', timer: 1.0, power: 5 });

        world.activeRedstone.add(`${cx},${cy},${cz}`);
        world.updateRedstone();

        const output = world.getMetadata(cx, cy, cz);
        assert.strictEqual(output, 10, 'In subtract mode, output should be rear power - side power (15 - 5 = 10)');
    });
});
