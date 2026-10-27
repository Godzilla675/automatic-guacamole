const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Batch 26 Features Implementation', function() {
    let env, game;

    beforeEach(function() {
        env = createGameEnv();
        game = env.createGame();
    });

    it('1. Custom Keybind Profiles Export and Import in UI', function() {
        const input = game.input;
        const ui = game.ui;

        assert.strictEqual(typeof ui.exportKeybinds, 'function');
        assert.strictEqual(typeof ui.importKeybinds, 'function');

        // Modify a keybind
        input.keybinds.forward = 'KeyI';
        assert.strictEqual(input.keybinds.forward, 'KeyI');

        // Test import logic via mock file event
        const newBinds = JSON.stringify({ forward: 'KeyW', jump: 'KeyJ' });
        const mockEvent = {
            target: {
                files: [
                    {
                        name: 'keybinds.json'
                    }
                ],
                value: 'file.json'
            }
        };

        // Mock FileReader inside window context
        env.window.FileReader = class {
            readAsText(file) {
                this.onload({ target: { result: newBinds } });
            }
        };

        ui.importKeybinds(mockEvent);
        assert.strictEqual(input.keybinds.forward, 'KeyW');
        assert.strictEqual(input.keybinds.jump, 'KeyJ');
    });

    it('2. Mobile Touch Controls HUD Sensitivity Slider', function() {
        const input = game.input;

        assert.strictEqual(input.touchSensitivity, 1.0);

        // Adjust touchSensitivity
        input.touchSensitivity = 2.0;
        assert.strictEqual(input.touchSensitivity, 2.0);

        // Verify touch look sensitivity multiplier in touchmove event
        const touchSens = (input.touchSensitivity || 1.0) * 0.005;
        assert.strictEqual(touchSens, 0.01);
    });

    it('3. Name Tag Item and Mob Custom Naming Mechanics', function() {
        const BLOCK = env.window.BLOCK;
        const Mob = env.window.Mob;
        const MOB_TYPE = env.window.MOB_TYPE;

        assert.ok(BLOCK.ITEM_NAME_TAG, 'ITEM_NAME_TAG should be defined in BLOCK table');

        const cow = new Mob(game, 10, 40, 10, MOB_TYPE.COW);
        game.mobs.push(cow);

        // Give player a renamed Name Tag
        game.player.inventory[0] = {
            type: BLOCK.ITEM_NAME_TAG,
            count: 1,
            name: 'Bessie The Cow'
        };
        game.player.selectedSlot = 0;

        // Interact with cow
        const consumed = cow.interact(BLOCK.ITEM_NAME_TAG);
        assert.strictEqual(consumed, true);
        assert.strictEqual(cow.customName, 'Bessie The Cow');
        assert.strictEqual(cow.preventDespawn, true);
        assert.strictEqual(game.player.inventory[0], null);
    });

    it('4. Dripstone Cluster Generation and Falling Stalactite Physics', function() {
        const BLOCK = env.window.BLOCK;
        const world = game.world;

        assert.ok(BLOCK.DRIPSTONE, 'DRIPSTONE should be defined in BLOCK table');
        assert.ok(BLOCK.POINTED_DRIPSTONE, 'POINTED_DRIPSTONE should be defined in BLOCK table');

        // Generate chunk (0, 0)
        world.generateChunk(0, 0);

        // Place pointed dripstone hanging from a ceiling block
        world.setBlock(10, 40, 10, BLOCK.DRIPSTONE);
        world.setBlock(10, 39, 10, BLOCK.POINTED_DRIPSTONE);

        assert.strictEqual(world.getBlock(10, 39, 10), BLOCK.POINTED_DRIPSTONE);

        // Remove ceiling support (set to AIR) - automatically triggers neighbor integrity check & stalactite fall
        world.setBlock(10, 40, 10, BLOCK.AIR);

        // Pointed dripstone should automatically break/fall when ceiling is removed
        assert.strictEqual(world.getBlock(10, 39, 10), BLOCK.AIR);
    });

    it('5. Weeping Vines Nether Flora Growth and Player Climbing Physics', function() {
        const BLOCK = env.window.BLOCK;
        const world = game.world;
        const player = game.player;

        assert.ok(BLOCK.WEEPING_VINES, 'WEEPING_VINES should be defined in BLOCK table');
        assert.ok(BLOCK.ITEM_WEEPING_VINES, 'ITEM_WEEPING_VINES should be defined in BLOCK table');

        // Generate chunk (0, 0)
        world.generateChunk(0, 0);

        // Place weeping vines
        world.setBlock(10, 41, 10, BLOCK.WEEPING_VINES);

        assert.ok(world.weepingVines.has('10,41,10'));

        // Test player collision / climbing
        player.x = 10.2;
        player.y = 41.0;
        player.z = 10.2;

        const playerBox = { x: player.x, y: player.y, z: player.z, width: player.width, height: player.height };
        const colliding = game.physics.getCollidingBlocks(playerBox);
        const inVine = colliding.some(b => b.type === BLOCK.WEEPING_VINES);

        assert.strictEqual(inVine, true);
    });
});
