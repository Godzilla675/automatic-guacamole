const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Bug Fixes: Offhand Bow Arrow Consumption and Mobile Joystick Touch Tracking', function() {
    let env;
    let game;

    beforeEach(function() {
        env = createGameEnv();
        game = env.createGame();
    });

    it('should consume arrows from offhand slot when firing a bow if main inventory has no arrows', function() {
        // Clear main inventory
        game.player.inventory.fill(null);

        // Equip bow in selected slot
        game.player.selectedSlot = 0;
        game.player.inventory[0] = { type: env.window.BLOCK.BOW, count: 1, durability: 384 };

        // Equip arrows in offhand slot
        game.player.offhand = { type: env.window.BLOCK.ITEM_ARROW, count: 5 };

        // Initial projectile count
        const initialProjectiles = game.projectiles.length;

        // Perform right click action with Bow
        game.startAction(false);

        // Verify arrow spawned as projectile
        assert.strictEqual(game.projectiles.length, initialProjectiles + 1, 'A projectile should have spawned when firing bow with offhand arrows');

        // Verify offhand arrow count decreased
        assert.ok(game.player.offhand, 'Offhand item should still exist');
        assert.strictEqual(game.player.offhand.count, 4, 'Offhand arrow count should be decremented from 5 to 4');

        // Fire remaining 4 arrows until empty
        for (let i = 0; i < 4; i++) {
            game.startAction(false);
        }

        // Verify offhand slot is cleared when arrow count reaches 0
        assert.strictEqual(game.player.offhand, null, 'Offhand slot should be null after consuming all offhand arrows');
    });

    it('should prefer main inventory arrows if present when firing a bow', function() {
        // Clear inventory
        game.player.inventory.fill(null);

        // Equip bow in selected slot
        game.player.selectedSlot = 0;
        game.player.inventory[0] = { type: env.window.BLOCK.BOW, count: 1, durability: 384 };

        // Put arrows in main inventory slot 1
        game.player.inventory[1] = { type: env.window.BLOCK.ITEM_ARROW, count: 10 };

        // Put arrows in offhand
        game.player.offhand = { type: env.window.BLOCK.ITEM_ARROW, count: 5 };

        // Fire bow
        game.startAction(false);

        // Main inventory arrow count should decrease, offhand should remain untouched
        assert.strictEqual(game.player.inventory[1].count, 9, 'Main inventory arrow count should be decremented');
        assert.strictEqual(game.player.offhand.count, 5, 'Offhand arrow count should remain unchanged when main inventory arrows exist');
    });

    it('should track mobile joystick movements even when touch moves outside container bounds', function() {
        game.isMobile = true;

        // Mock required DOM elements for mobile controls
        const elementIds = [
            'joystick-container', 'joystick-stick', 'jump-btn',
            'break-btn', 'place-btn', 'fly-btn', 'inventory-btn',
            'craft-btn', 'sneak-btn', 'chat-btn', 'pause-mobile-btn'
        ];

        elementIds.forEach(id => {
            if (!env.window.document.getElementById(id)) {
                const el = env.window.document.createElement('div');
                el.id = id;
                env.window.document.body.appendChild(el);
            }
        });

        const joystickContainer = env.window.document.getElementById('joystick-container');
        joystickContainer.getBoundingClientRect = () => ({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            right: 200,
            bottom: 200
        });

        // Setup mobile controls
        game.input.setupMobileControls();

        // Create touch start event
        const touch = { identifier: 42, clientX: 150, clientY: 150 };
        const touchStartEvent = new env.window.Event('touchstart', { cancelable: true, bubbles: true });
        touchStartEvent.changedTouches = [touch];
        touchStartEvent.touches = [touch];

        joystickContainer.dispatchEvent(touchStartEvent);

        assert.strictEqual(game.input.joystick.active, true, 'Joystick should be active on touchstart');

        // Move touch far outside the joystick container bounding rect (e.g., clientX: 500, clientY: 500)
        const touchMove = { identifier: 42, clientX: 500, clientY: 500 };
        const touchMoveEvent = new env.window.Event('touchmove', { cancelable: true, bubbles: true });
        touchMoveEvent.changedTouches = [touchMove];
        touchMoveEvent.touches = [touchMove];

        env.window.dispatchEvent(touchMoveEvent);

        // Joystick controls should register backward and right movement
        assert.strictEqual(game.controls.backward, true, 'Backward control should be active when swiped far down/outside');
        assert.strictEqual(game.controls.right, true, 'Right control should be active when swiped far right/outside');

        // End touch
        const touchEndEvent = new env.window.Event('touchend', { cancelable: true, bubbles: true });
        touchEndEvent.changedTouches = [{ identifier: 42, clientX: 500, clientY: 500 }];
        touchEndEvent.touches = [];

        env.window.dispatchEvent(touchEndEvent);

        // Joystick active state should reset
        assert.strictEqual(game.input.joystick.active, false, 'Joystick active state should reset on touchend');
        assert.strictEqual(game.controls.backward, false, 'Movement controls should be cleared');
        assert.strictEqual(game.controls.right, false, 'Movement controls should be cleared');
    });
});
