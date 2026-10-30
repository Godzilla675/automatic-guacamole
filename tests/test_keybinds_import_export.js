const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Custom Keybinds Profile Import/Export', () => {
    let env, game;

    beforeEach(() => {
        env = createGameEnv();
        game = env.createGame();
        game.ui.init();
    });

    it('should export keybinds profile as JSON', () => {
        const jsonStr = game.ui.exportKeybinds();
        assert.ok(jsonStr);

        const parsed = JSON.parse(jsonStr);
        assert.strictEqual(parsed.forward, game.input.keybinds.forward);
        assert.strictEqual(parsed.inventory, game.input.keybinds.inventory);
    });

    it('should import keybinds profile from JSON and update keybinds & localStorage', () => {
        const customProfile = {
            forward: 'KeyI',
            backward: 'KeyK',
            left: 'KeyJ',
            right: 'KeyL',
            inventory: 'KeyB'
        };

        const success = game.ui.importKeybinds(customProfile);
        assert.strictEqual(success, true);

        assert.strictEqual(game.input.keybinds.forward, 'KeyI');
        assert.strictEqual(game.input.keybinds.backward, 'KeyK');
        assert.strictEqual(game.input.keybinds.left, 'KeyJ');
        assert.strictEqual(game.input.keybinds.right, 'KeyL');
        assert.strictEqual(game.input.keybinds.inventory, 'KeyB');

        const saved = JSON.parse(env.window.localStorage.getItem('voxel_keybinds'));
        assert.strictEqual(saved.forward, 'KeyI');
    });
});
