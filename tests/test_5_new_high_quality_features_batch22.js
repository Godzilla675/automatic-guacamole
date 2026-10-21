const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('5 New High Quality Features Batch 22', function() {
    this.timeout(10000);

    let env;
    let game;
    let window;

    beforeEach(function() {
        env = createGameEnv();
        window = env.window;
        game = env.createGame();
    });

    it('Feature 1: Subtitles Display for Audio Events with relative direction', function() {
        assert.ok(window.soundManager, 'soundManager exists');
        assert.ok(game.ui, 'UIManager exists');

        // Place player at (8, 40, 8) facing North/East
        game.player.x = 8;
        game.player.y = 40;
        game.player.z = 8;
        game.player.yaw = 0;

        // Play sound to the right at (20, 40, 8)
        window.soundManager.play('step', { x: 20, y: 40, z: 8 });

        const container = window.document.getElementById('subtitles-container');
        assert.ok(container, 'subtitles-container should be created');
        assert.ok(container.children.length > 0, 'subtitle entry should be added');

        const subtitleText = container.children[container.children.length - 1].textContent;
        assert.ok(subtitleText.includes('Footsteps'), 'Subtitle text should include sound name');
        assert.ok(subtitleText.includes('>'), 'Subtitle text should include directional indicator');
    });

    it('Feature 2: Death Screen Statistics Summary tracking and display', function() {
        const player = game.player;
        assert.ok(player.stats, 'Player stats object initialized');
        assert.strictEqual(player.stats.blocksMined, 0);
        assert.strictEqual(player.stats.mobsSlain, 0);

        // Test block break increment
        game.world.setBlock(10, 40, 10, window.BLOCK.STONE);
        game.finalizeBreakBlock(10, 40, 10);
        assert.strictEqual(player.stats.blocksMined, 1, 'blocksMined should increment');

        // Test mob kill increment
        const mob = new window.Mob(game, 12, 40, 12, window.MOB_TYPE.ZOMBIE);
        game.mobs.push(mob);
        mob.die();
        assert.strictEqual(player.stats.mobsSlain, 1, 'mobsSlain should increment');

        // Test distance traveled
        game.controls.forward = true;
        player.update(1.0); // Move forward
        assert.ok(player.stats.distanceTraveled > 0, 'distanceTraveled should accumulate');

        // Test death screen UI rendering
        game.ui.showDeathScreen({ x: 10, y: 40, z: 10 });
        const statsEl = window.document.getElementById('death-stats');
        assert.ok(statsEl, '#death-stats element exists');
        assert.ok(statsEl.innerHTML.includes('Blocks Mined:'), 'Stats HTML should contain Blocks Mined');
        assert.ok(statsEl.innerHTML.includes('Mobs Slain:'), 'Stats HTML should contain Mobs Slain');
        assert.ok(statsEl.innerHTML.includes('Distance Traveled:'), 'Stats HTML should contain Distance Traveled');
    });

    it('Feature 3: In-Game World Seed Inspector in HUD debug overlay and pause screen', function() {
        assert.ok(game.world.seed !== undefined, 'World seed exists');
        game.player.x = 32; // Chunk (2, 2)
        game.player.z = 32;

        game.renderer.render();

        const seedEl = window.document.getElementById('world-seed');
        const chunkEl = window.document.getElementById('chunk-pos');

        assert.ok(seedEl, 'world-seed element exists');
        assert.ok(chunkEl, 'chunk-pos element exists');
        assert.strictEqual(chunkEl.textContent, '2, 2');

        game.ui.pauseGame();
        const pauseSeed = window.document.getElementById('pause-seed-val');
        const pauseChunk = window.document.getElementById('pause-chunk-val');

        assert.ok(pauseSeed, 'pause-seed-val exists');
        assert.ok(pauseChunk, 'pause-chunk-val exists');
        assert.strictEqual(pauseChunk.textContent, '2, 2');
    });

    it('Feature 4: Snowball Trail Particles flight trajectory', function() {
        game.spawnProjectile(8, 40, 8, { x: 1, y: 0, z: 0 }, 'snowball');
        assert.strictEqual(game.projectiles.length, 1);
        assert.strictEqual(game.projectiles[0].type, 'snowball');

        const initialParticleCount = game.particles.particles.length;
        game.update(100);

        assert.ok(game.particles.particles.length > initialParticleCount, 'Snowball should spawn trail particles');
        const whiteParticles = game.particles.particles.filter(p => p.color === '#FFFFFF');
        assert.ok(whiteParticles.length > 0, 'White snowy trail particles should be spawned');
    });

    it('Feature 5: Nether Portal Camera Distortion Shader HUD overlay', function() {
        game.player.x = 8;
        game.player.y = 40;
        game.player.z = 8;

        // Place portal block at player head position
        game.world.setBlock(8, 41, 8, window.BLOCK.PORTAL);
        game.portalTimer = 1.5;

        // Ensure renderer renders without throwing errors while inside portal
        assert.doesNotThrow(() => {
            game.renderer.render();
        });
    });
});
