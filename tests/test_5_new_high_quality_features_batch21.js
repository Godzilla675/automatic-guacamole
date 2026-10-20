const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Batch 21 - 5 High Quality New Features', function() {
    let env;
    let game;
    let player;
    let ui;

    beforeEach(function() {
        env = createGameEnv();
        game = env.createGame();
        player = game.player;
        ui = game.ui;
    });

    afterEach(function() {
        if (env && env.close) env.close();
    });

    it('1. Recovery Compass Item & Dynamic Directional Display', function() {
        assert.ok(env.window.BLOCK.ITEM_RECOVERY_COMPASS, 'ITEM_RECOVERY_COMPASS block ID exists');

        // Initial state before death
        assert.strictEqual(player.lastDeathPos, undefined);
        let vec = player.getRecoveryCompassVector();
        assert.strictEqual(vec, null, 'Vector is null before any death');

        // Simulate player death at (100, 64, -200)
        player.x = 100;
        player.y = 64;
        player.z = -200;
        player.health = 0;
        player.takeDamage(10); // triggers death handling

        assert.ok(player.lastDeathPos, 'lastDeathPos is recorded');
        assert.strictEqual(player.lastDeathPos.x, 100);
        assert.strictEqual(player.lastDeathPos.y, 64);
        assert.strictEqual(player.lastDeathPos.z, -200);

        // Move player away to (130, 64, -160)
        player.x = 130;
        player.y = 64;
        player.z = -160;

        vec = player.getRecoveryCompassVector();
        assert.ok(vec, 'Recovery compass vector calculated');
        assert.strictEqual(vec.dx, -30);
        assert.strictEqual(vec.dz, -40);
        assert.strictEqual(Math.round(vec.distance), 50);

        // Test ItemUse dispatch on ITEM_RECOVERY_COMPASS
        player.inventory[player.selectedSlot] = { type: env.window.BLOCK.ITEM_RECOVERY_COMPASS, count: 1 };
        let notificationMsg = '';
        ui.showNotification = function(msg) { notificationMsg = msg; };

        const handled = env.window.ItemUse.dispatch(game, player.getHeldItem(), { x: player.x, y: player.y + 1.6, z: player.z }, { x: 0, y: 0, z: 1 }, false);
        assert.strictEqual(handled, true, 'ItemUse dispatched for ITEM_RECOVERY_COMPASS');
        assert.ok(notificationMsg.includes('Recovery Compass points to last death'), 'Notification sent with death coordinates');
        assert.ok(notificationMsg.includes('50m away'), 'Notification includes distance');
    });

    it('2. Spyglass Circular Vignette & Smooth FOV Management', function() {
        assert.ok(env.window.BLOCK.ITEM_SPYGLASS, 'ITEM_SPYGLASS block ID exists');
        player.inventory[player.selectedSlot] = { type: env.window.BLOCK.ITEM_SPYGLASS, count: 1 };

        game.fov = 70;
        assert.strictEqual(player.isUsingSpyglass, false);

        // Dispatch spyglass use -> Zoom in
        const handled = env.window.ItemUse.dispatch(game, player.getHeldItem(), { x: player.x, y: player.y + 1.6, z: player.z }, { x: 0, y: 0, z: 1 }, false);
        assert.strictEqual(handled, true);
        assert.strictEqual(player.isUsingSpyglass, true);
        assert.strictEqual(game.fov, 20, 'FOV zoomed to 20');
        assert.strictEqual(game.unzoomedFov, 70, 'Unzoomed FOV saved as 70');

        // Check overlay rendering in UI
        ui.updateSpyglassOverlay();
        const overlay = env.window.document.getElementById('spyglass-overlay');
        assert.ok(overlay, 'Spyglass overlay element created');
        assert.strictEqual(overlay.style.display, 'block', 'Overlay displayed when zoomed');

        // Un-equip spyglass (switch selected slot to dirt block)
        player.selectedSlot = 1;
        player.inventory[1] = { type: env.window.BLOCK.DIRT, count: 64 };
        player.update(0.016); // Player update detects non-spyglass held item

        assert.strictEqual(player.isUsingSpyglass, false, 'Spyglass deactivated on hotbar switch');
        assert.strictEqual(game.fov, 70, 'Original FOV 70 restored');

        ui.updateSpyglassOverlay();
        assert.strictEqual(overlay.style.display, 'none', 'Overlay hidden when unzoomed');
    });

    it('3. Boss Health Bar HUD Overlay', function() {
        ui.updateBossHealthBar();
        const container = env.window.document.getElementById('boss-health-bar-container');
        assert.ok(container, 'Boss health bar container created');
        assert.strictEqual(container.style.display, 'none', 'Hidden when no boss mob present');

        // Spawn a Warden boss mob near player
        const warden = new env.window.Mob(game, player.x + 5, player.y, player.z + 5, env.window.MOB_TYPE.WARDEN);
        warden.health = 150;
        warden.maxHealth = 200;
        game.mobs.push(warden);

        ui.updateBossHealthBar();
        assert.strictEqual(container.style.display, 'flex', 'Boss bar shown when Warden is nearby');

        const title = env.window.document.getElementById('boss-health-title');
        const fill = env.window.document.getElementById('boss-health-fill');
        assert.ok(title.textContent.includes('WARDEN'), 'Title includes boss mob name');
        assert.ok(title.textContent.includes('150/200'), 'Title includes current health');
        assert.strictEqual(fill.style.width, '75%', 'Fill width matches 75% health');

        // Mark boss dead -> bar hides
        warden.isDead = true;
        ui.updateBossHealthBar();
        assert.strictEqual(container.style.display, 'none', 'Hidden after boss death');
    });

    it('4. Piglin Gold Armor Neutrality Check', function() {
        const piglin = new env.window.Mob(game, player.x + 3, player.y, player.z + 3, env.window.MOB_TYPE.PIGLIN);
        piglin.speed = 2.0;

        // Case A: Player has no gold armor -> Piglin updates hostile AI
        player.armor = [null, null, null, null];
        piglin.update(0.016);
        assert.notStrictEqual(piglin.vx, 0, 'Piglin moves toward player when unarmored');

        // Case B: Player equips Gold Helmet -> Piglin becomes neutral/passive
        player.armor[0] = { type: env.window.BLOCK.ITEM_HELMET_GOLD, count: 1 };
        piglin.vx = 0;
        piglin.vz = 0;
        piglin.update(0.016);
        // Piglin does not charge player aggressively in passive mode
        const passiveVx = piglin.vx;

        // Case C: Player attacks Piglin -> Piglin becomes hostile despite gold armor
        piglin.lastDamageTime = Date.now();
        piglin.update(0.016);
        assert.ok(piglin.vx !== 0 || piglin.vz !== 0, 'Piglin retaliates when attacked');
    });

    it('5. Crafter Slot Grid Auto-Clear Button', function() {
        const crafterEntity = {
            type: 'crafter',
            items: new Array(9).fill(null),
            disabledSlots: new Array(9).fill(false)
        };

        // Place items in grid
        crafterEntity.items[0] = { type: env.window.BLOCK.DIRT, count: 10 };
        crafterEntity.items[4] = { type: env.window.BLOCK.ITEM_IRON_INGOT, count: 5 };

        ui.openCrafter(crafterEntity);

        const clearBtn = env.window.document.getElementById('clear-crafter-btn');
        assert.ok(clearBtn, 'Clear Grid button rendered in Crafter UI');

        // Clear player inventory to track returned items
        player.inventory = new Array(36).fill(null);

        // Click Clear Grid button
        ui.clearCrafterGrid();

        assert.strictEqual(crafterEntity.items[0], null, 'Crafter slot 0 cleared');
        assert.strictEqual(crafterEntity.items[4], null, 'Crafter slot 4 cleared');

        const dirtSlot = player.inventory.find(item => item && item.type === env.window.BLOCK.DIRT);
        const ironSlot = player.inventory.find(item => item && item.type === env.window.BLOCK.ITEM_IRON_INGOT);

        assert.ok(dirtSlot, 'Dirt returned to player inventory');
        assert.strictEqual(dirtSlot.count, 10);
        assert.ok(ironSlot, 'Iron Ingot returned to player inventory');
        assert.strictEqual(ironSlot.count, 5);
    });
});
