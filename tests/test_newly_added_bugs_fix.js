const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Newly Added Bugs Fix Test Suite', function() {
    let env, game;

    beforeEach(function() {
        env = createGameEnv();
        game = env.createGame();
    });

    afterEach(function() {
        if (env) env.close();
    });

    it('Bug Fix 1: Wind Charge downward launching angle and upward self-knockback', function() {
        // Equip Wind Charge
        game.player.inventory[0] = { type: env.BLOCK.ITEM_WIND_CHARGE, count: 5 };
        game.player.selectedSlot = 0;
        game.player.x = 10;
        game.player.y = 20;
        game.player.z = 10;

        // Look directly downward (pitch = Math.PI / 2)
        game.player.pitch = Math.PI / 2;
        game.player.yaw = 0;

        // Fire Wind Charge
        game.startAction(false); // Right click

        assert.strictEqual(game.projectiles.length, 1, 'Projectile should be spawned');
        const proj = game.projectiles[0];
        assert.strictEqual(proj.type, 'wind_charge');
        assert.ok(proj.vy < -20, `Projected downward vy should be <= -20, got ${proj.vy}`);

        // Simulate projectile impacting block at feet
        game.player.vy = 0;
        game.triggerWindBurst(10, 19, 10);

        assert.ok(game.player.vy >= 8, `Wind burst under feet should launch player upward with vy >= 8, got ${game.player.vy}`);
    });

    it('Bug Fix 2: Spectator / flying flight does not suffer fluid drag when entering water', function() {
        // Place water block at player feet
        game.world.setBlock(10, 20, 10, env.BLOCK.WATER);
        game.player.x = 10.5;
        game.player.y = 20.0;
        game.player.z = 10.5;

        // Set spectator mode / flying
        game.player.spectator = true;
        game.player.flying = true;

        const initialSpeed = game.player.speed;

        // Run player update
        game.player.update(0.016); // 16ms tick

        // In water, speed should not be halved for flying/spectator player
        assert.strictEqual(game.player.flying, true, 'Player should remain flying');
        assert.ok(game.player.speed === initialSpeed, 'Player speed should remain unaffected');
    });
});
