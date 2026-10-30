const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Mobile Touch Controls HUD Sensitivity Slider', () => {
    let env, game;

    beforeEach(() => {
        env = createGameEnv();
        game = env.createGame();
        game.ui.init();
    });

    it('should update touch sensitivity on input and persist to localStorage', () => {
        const slider = env.window.document.getElementById('touch-sensitivity-slider');
        const display = env.window.document.getElementById('touch-sensitivity-value');

        assert.ok(slider);
        assert.ok(display);

        // Simulate user sliding touch sensitivity to 2.5
        slider.value = '2.5';
        slider.dispatchEvent(new env.window.Event('input'));

        assert.strictEqual(game.input.touchSensitivity, 2.5);
        assert.strictEqual(game.touchSensitivity, 2.5);
        assert.strictEqual(display.textContent, '2.5');
        assert.strictEqual(env.window.localStorage.getItem('voxel_touch_sensitivity'), '2.5');
    });

    it('should load saved touch sensitivity from localStorage on initialization', () => {
        env.window.localStorage.setItem('voxel_touch_sensitivity', '1.8');
        const newGame = env.createGame();
        newGame.ui.init();
        assert.strictEqual(newGame.input.touchSensitivity, 1.8);
    });
});
