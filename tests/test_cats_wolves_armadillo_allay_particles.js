const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('5 New Quality Features Batch 26 (Cats, Wolves, Armadillo, Allay, Particles)', function () {
    this.timeout(10000);
    let env, window, game, BLOCK, MOB_TYPE, Mob, Drop;

    beforeEach(function () {
        env = createGameEnv();
        window = env.window;
        game = env.createGame();
        BLOCK = window.BLOCK;
        MOB_TYPE = window.MOB_TYPE;
        Mob = window.Mob;
        Drop = window.Drop;

        // Ensure chunk exists for block manipulation
        game.world.generateChunk(0, 0);

        // Stub soundManager
        window.soundManager = { play: function () {} };
    });

    it('should support Cat taming and Creeper fleeing mechanics', function () {
        const cat = new Mob(game, 10, 1, 10, MOB_TYPE.OCELOT);
        game.mobs.push(cat);

        // Untamed cat flees when player moves fast nearby
        game.player.x = 12;
        game.player.z = 10;
        game.player.vx = 3.0;
        cat.update(0.1);
        assert.ok(cat.vx < 0, 'Untamed cat should flee from fast player');

        // Tame cat with Raw Fish
        const interacted = cat.interact(BLOCK.ITEM_RAW_FISH);
        assert.strictEqual(interacted, true, 'Raw fish interaction should succeed');
        cat.isTamed = true;
        cat.type = MOB_TYPE.CAT;

        // Creeper near cat flees away from cat
        const creeper = new Mob(game, 12, 1, 10, MOB_TYPE.CREEPER);
        game.mobs.push(creeper);

        // Stub line of sight for creeper
        creeper.hasLineOfSight = function () { return true; };
        // Creeper update includes updateHostileAI call which calculates distance to player
        game.player.x = 12;
        game.player.z = 15;
        creeper.update(0.1);
        assert.ok(creeper.vx > 0, 'Creeper should flee away from Cat');
    });

    it('should apply Wolf Armor 60% damage mitigation multiplier', function () {
        const wolf = new Mob(game, 5, 1, 5, MOB_TYPE.WOLF);
        wolf.isTamed = true;
        wolf.hasWolfArmor = true;
        wolf.health = 40;

        wolf.takeDamage(10);
        assert.strictEqual(wolf.health, 36, 'Wolf armor should mitigate 60% damage (10 * 0.4 = 4 dmgTaken)');
    });

    it('should handle Armadillo periodic scute shedding', function () {
        const armadillo = new Mob(game, 0, 1, 0, MOB_TYPE.ARMADILLO);
        game.mobs.push(armadillo);

        armadillo.update(50.1);
        assert.ok(game.drops.length > 0, 'Armadillo should shed scute drop');
        assert.strictEqual(game.drops[0].type, BLOCK.ITEM_ARMADILLO_SCUTE, 'Dropped item should be Armadillo Scute');
    });

    it('should handle Allay item collection and Note Block delivery', function () {
        const allay = new Mob(game, 5, 1, 0, MOB_TYPE.ALLAY);
        allay.heldItem = { type: BLOCK.ITEM_DIAMOND, count: 1 };
        game.mobs.push(allay);

        // Place Note Block nearby
        game.world.setBlock(5, 1, 0, BLOCK.NOTE_BLOCK);

        // Spawn matching dropped item close enough (<0.8 dist) to be collected immediately
        game.drops.push(new Drop(game, 5.2, 1, 0, BLOCK.ITEM_DIAMOND, 3));

        // First update: Allay collects the dropped item
        allay.update(0.1);
        assert.strictEqual(game.drops.length, 0, 'Allay should collect dropped matching diamond');
        assert.strictEqual(allay.collectedCount, 3, 'Allay should accumulate collected item count');

        // Update Allay position to Note Block delivery target
        allay.x = 5.5;
        allay.y = 2.0;
        allay.z = 0.5;
        // Next update: Allay is at the Note Block (dist <= 1.2) and drops items
        allay.update(0.1);
        assert.strictEqual(game.drops.length, 1, 'Allay should drop collected diamonds at Note Block');
        assert.strictEqual(game.drops[0].count, 3, 'Dropped count should match collected amount');
    });

    it('should sample block color for break particles', function () {
        game.world.setBlock(2, 2, 2, BLOCK.ORE_GOLD);
        let spawnedColor = null;
        game.particles = {
            spawn: function (x, y, z, color, count) {
                spawnedColor = color;
            }
        };

        game.finalizeBreakBlock(2, 2, 2);
        assert.ok(spawnedColor, 'Particle spawn should be called');
        assert.strictEqual(spawnedColor, window.BLOCKS[BLOCK.ORE_GOLD].color, 'Particles should match block color hex');
    });
});
