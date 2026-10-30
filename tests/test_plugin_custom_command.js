const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Plugin API Custom Command Handler', () => {
    let env, game;

    beforeEach(() => {
        env = createGameEnv();
        game = env.createGame();
    });

    it('should allow registering and executing custom chat commands', () => {
        let commandExecuted = false;
        let receivedArgs = null;

        assert.strictEqual(typeof game.pluginAPI.registerCommand, 'function');

        game.pluginAPI.registerCommand('heal', (args, fullText) => {
            commandExecuted = true;
            receivedArgs = args;
            if (game.player) {
                game.player.health = game.player.maxHealth;
            }
        });

        assert.ok(game.pluginAPI.commands['heal']);

        game.chat.handleCommand('/heal full 100');

        assert.strictEqual(commandExecuted, true);
        assert.deepEqual(receivedArgs, ['full', '100']);
        assert.strictEqual(game.player.health, game.player.maxHealth);
    });

    it('should strip leading slash on command registration', () => {
        let called = false;
        game.pluginAPI.registerCommand('/fly', (args) => {
            called = true;
        });

        assert.ok(game.pluginAPI.commands['fly']);
        game.chat.handleCommand('/fly');
        assert.strictEqual(called, true);
    });
});
