const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('World HUD Minimap Overlay', () => {
    let env, game;

    beforeEach(() => {
        env = createGameEnv();
        game = env.createGame();
        game.input.setupEventListeners();
        game.ui.init();
    });

    it('should initialize minimap overlay canvas in HUD', () => {
        assert.ok(game.minimap);
        const minimapCanvas = env.window.document.getElementById('minimap');
        assert.ok(minimapCanvas);
        assert.strictEqual(game.minimap.visible, true);
    });

    it('should toggle minimap visibility state and update canvas display', () => {
        assert.strictEqual(game.minimap.visible, true);

        const state = game.minimap.toggle(false);
        assert.strictEqual(state, false);
        assert.strictEqual(game.minimap.visible, false);

        const canvas = env.window.document.getElementById('minimap');
        assert.strictEqual(canvas.style.display, 'none');

        game.minimap.toggle(true);
        assert.strictEqual(game.minimap.visible, true);
        assert.strictEqual(canvas.style.display, 'block');
    });

    it('should toggle minimap visibility when M key keybind is pressed', () => {
        assert.strictEqual(game.minimap.visible, true);

        const keyEvent = new env.window.KeyboardEvent('keydown', { code: 'KeyM' });
        env.window.document.dispatchEvent(keyEvent);

        assert.strictEqual(game.minimap.visible, false);
    });

    it('should update minimap top-down rendering when player moves', () => {
        game.player.x = 100;
        game.player.z = 100;
        game.world.setBlock(100, 64, 100, 1); // GRASS

        assert.doesNotThrow(() => {
            game.minimap.update();
        });
    });
});
