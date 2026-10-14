// Engine robustness: the frame loop survives exceptions, and audio degrades gracefully.
const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Game loop resilience', function () {
    this.timeout(30000);
    let env, game;

    before(function () {
        env = createGameEnv();
        game = env.createGame();
        game.world.generateChunk(0, 0);
        game.lastTime = Date.now();
        game.fpsTime = Date.now();
    });
    after(function () { env.close(); });

    function withSilencedConsole(fn) {
        const orig = console.error;
        const calls = [];
        console.error = (...a) => calls.push(a);
        try { fn(); } finally { console.error = orig; }
        return calls;
    }

    it('keeps scheduling frames when update() throws', function () {
        let scheduled = 0;
        env.window.requestAnimationFrame = () => { scheduled++; return 1; };
        const origUpdate = game.update;
        const origRender = game.render;
        game.update = () => { throw new Error('boom in update'); };
        game.render = () => {};
        try {
            const logged = withSilencedConsole(() => {
                assert.doesNotThrow(() => game.gameLoop());
                assert.doesNotThrow(() => game.gameLoop());
                assert.doesNotThrow(() => game.gameLoop());
            });
            assert.strictEqual(scheduled, 3, 'every frame should re-arm requestAnimationFrame');
            assert.strictEqual(logged.length, 1, 'the same error should only be logged once, not every frame');
        } finally {
            game.update = origUpdate;
            game.render = origRender;
        }
    });

    it('keeps scheduling frames when render() throws', function () {
        let scheduled = 0;
        env.window.requestAnimationFrame = () => { scheduled++; return 1; };
        const origRender = game.render;
        game.render = () => { throw new Error('boom in render'); };
        try {
            withSilencedConsole(() => assert.doesNotThrow(() => game.gameLoop()));
            assert.strictEqual(scheduled, 1);
        } finally {
            game.render = origRender;
        }
    });

    it('logs distinct errors separately and survives a broken notification UI', function () {
        const origShow = game.ui.showNotification;
        game.ui.showNotification = () => { throw new Error('ui is broken too'); };
        try {
            const first = new Error('first');
            const logged = withSilencedConsole(() => {
                assert.doesNotThrow(() => game.reportFrameError(first));
                assert.doesNotThrow(() => game.reportFrameError(new Error('second')));
                assert.doesNotThrow(() => game.reportFrameError(first));
                assert.doesNotThrow(() => game.reportFrameError('a string, not an Error'));
            });
            assert.strictEqual(logged.length, 3);
        } finally {
            game.ui.showNotification = origShow;
        }
    });

    it('a normal frame still runs update and render', function () {
        env.window.requestAnimationFrame = () => 1;
        let updated = 0, rendered = 0;
        const origUpdate = game.update, origRender = game.render;
        game.update = () => { updated++; };
        game.render = () => { rendered++; };
        try {
            game.gameLoop();
        } finally {
            game.update = origUpdate;
            game.render = origRender;
        }
        assert.strictEqual(updated, 1);
        assert.strictEqual(rendered, 1);
    });
});

describe('SoundManager without Web Audio', function () {
    this.timeout(30000);
    let env;
    before(function () {
        env = createGameEnv({ scripts: ['js/math.js', 'js/blocks.js'] });
        env.window.AudioContext = undefined;
        env.window.webkitAudioContext = undefined;
        const audioSrc = require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'audio.js'), 'utf8');
        env.run(audioSrc, 'js/audio.js');
    });
    after(function () { env.close(); });

    it('still creates window.soundManager (silent) instead of throwing at load', function () {
        assert.ok(env.window.soundManager, 'soundManager should exist');
        assert.strictEqual(env.window.soundManager.ctx, null);
    });

    it('play()/ambience/listener calls are safe no-ops', function () {
        const sm = env.window.soundManager;
        assert.doesNotThrow(() => sm.play('place', { x: 0, y: 0, z: 0 }));
        assert.doesNotThrow(() => sm.startAmbience());
        assert.doesNotThrow(() => sm.updateAmbience(0.5, 0.5));
        assert.doesNotThrow(() => sm.updateWeatherAmbience('rain'));
        assert.doesNotThrow(() => sm.updateListener(0, 0, 0, 0, 0));
    });
});
