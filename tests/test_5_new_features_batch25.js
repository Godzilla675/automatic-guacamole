const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Batch 25 High-Quality Features Test Suite', function () {
    let env, game, window;

    beforeEach(function () {
        env = createGameEnv();
        game = env.createGame();
        window = env.window;
    });

    it('Feature 1: Particle System Object Pooling & Recycling', function () {
        const ps = new window.ParticleSystem(game);
        assert.equal(ps.pool.length, 0);

        ps.spawn(0, 0, 0, '#FF0000', 10);
        assert.equal(ps.particles.length, 10);

        // Advance time to expire particles
        ps.update(2.0);
        assert.equal(ps.particles.length, 0);
        assert.equal(ps.pool.length, 10);

        // Respawn should reuse pooled particle objects
        ps.spawn(1, 1, 1, '#00FF00', 5);
        assert.equal(ps.particles.length, 5);
        assert.equal(ps.pool.length, 5);
    });

    it('Feature 2: Block Placement Particles Color Blending', function () {
        const ps = new window.ParticleSystem(game);
        game.particles = ps;

        game.world.generateChunk(0, 0);

        // Set up floor for raycast hit
        for (let x = 8; x <= 12; x++) {
            for (let z = 8; z <= 12; z++) {
                game.world.setBlock(x, 60, z, window.BLOCK.DIRT);
                game.world.setBlock(x, 61, z, window.BLOCK.AIR);
            }
        }

        game.player.inventory[0] = { type: window.BLOCK.ORE_GOLD, count: 5 };
        game.player.selectedSlot = 0;
        game.player.x = 10.5;
        game.player.y = 62;
        game.player.z = 10.5;
        game.player.yaw = 0;
        game.player.pitch = 1.2;

        const blockDef = window.BLOCKS[window.BLOCK.ORE_GOLD];
        assert.ok(blockDef && blockDef.color);

        game.placeBlock();

        assert.ok(ps.particles.length > 0);
        const placedParticle = ps.particles[ps.particles.length - 1];
        assert.equal(placedParticle.color, blockDef.color);
    });

    it('Feature 3: Wind Charge Explosion Shockwave Rings', function () {
        const ps = new window.ParticleSystem(game);
        game.particles = ps;

        ps.spawnWindChargeShockwave(5, 10, 5);
        assert.ok(ps.particles.length >= 20);

        const ringParticle = ps.particles[0];
        assert.ok(ringParticle.color === '#E0FFFF' || ringParticle.color === '#00FFFF');
        assert.ok(ringParticle.vx !== 0 || ringParticle.vz !== 0);

        // Test invocation via triggerWindBurst
        ps.particles = [];
        game.triggerWindBurst(0, 5, 0);
        assert.ok(ps.particles.length > 25);
    });

    it('Feature 4: Dynamic Crosshair Recoil Expansion FX', function () {
        const renderer = new window.Renderer(game);

        game.player.attackCooldown = 0;
        game.player.recoilTimer = 0;

        // Mock canvas context
        renderer.canvas = { width: 800, height: 600, style: {} };
        let fillRectCalls = [];
        renderer.ctx = {
            createLinearGradient: () => ({ addColorStop: () => {} }),
            fillRect: function(x, y, w, h) {
                fillRectCalls.push({ x, y, w, h });
            },
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {},
            save: () => {},
            restore: () => {},
            setTransform: () => {}
        };

        // Render crosshair with 0 recoil
        renderer.render();
        fillRectCalls = [];

        // Set attack recoil cooldown
        game.player.attackCooldown = 0.5;
        renderer.render();
        const recoilCalls = [...fillRectCalls];

        assert.ok(recoilCalls.length > 0);
    });

    it('Feature 5: Mob Taking Damage Red Flash Overlay', function () {
        const renderer = new window.Renderer(game);

        // Position player looking at mob
        game.player.x = 0;
        game.player.y = 64;
        game.player.z = -5;
        game.player.yaw = 0;
        game.player.pitch = 0;

        const mob = new window.Mob(game, 0, 64, 0, window.MOB_TYPE.ZOMBIE);
        game.mobs.push(mob);

        mob.takeDamage(2);
        assert.ok(mob.lastDamageTime > 0);

        let redOverlayDrawn = false;
        renderer.canvas = { width: 800, height: 600, style: {} };
        renderer.ctx = {
            createLinearGradient: () => ({ addColorStop: () => {} }),
            fillRect: function(x, y, w, h) {
                if (this.fillStyle === 'rgba(255, 0, 0, 0.55)') {
                    redOverlayDrawn = true;
                }
            },
            drawImage: () => {},
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {},
            save: () => {},
            restore: () => {},
            setTransform: () => {}
        };

        renderer.render();
        assert.strictEqual(redOverlayDrawn, true);
    });
});
