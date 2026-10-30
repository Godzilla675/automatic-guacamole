const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Custom Sound Effect Event Hooks', () => {
    let env, game;

    beforeEach(() => {
        env = createGameEnv();
        game = env.createGame();
    });

    it('should emit sound event hook on PluginAPI when sound is played', () => {
        const soundsPlayed = [];

        game.pluginAPI.on('sound', (eventData) => {
            soundsPlayed.push(eventData);
        });

        env.window.soundManager.play('step', { x: 10, y: 64, z: 10 }, 1);

        assert.strictEqual(soundsPlayed.length, 1);
        assert.strictEqual(soundsPlayed[0].type, 'step');
        assert.deepEqual(soundsPlayed[0].position, { x: 10, y: 64, z: 10 });
        assert.strictEqual(soundsPlayed[0].blockType, 1);
    });

    it('should allow plugins to cancel sound playback', () => {
        let subtitleAdded = false;
        game.ui.addSubtitle = () => { subtitleAdded = true; };

        game.pluginAPI.on('sound', (eventData) => {
            if (eventData.type === 'explosion') {
                eventData.cancel = true;
            }
        });

        env.window.soundManager.play('explosion');

        assert.strictEqual(subtitleAdded, false);
    });

    it('should allow plugins to modify sound parameters', () => {
        let playedType = null;
        game.ui.addSubtitle = (type) => { playedType = type; };

        game.pluginAPI.on('sound', (eventData) => {
            if (eventData.type === 'step') {
                eventData.type = 'creaking_step';
            }
        });

        env.window.soundManager.play('step');

        assert.strictEqual(playedType, 'creaking_step');
    });
});
