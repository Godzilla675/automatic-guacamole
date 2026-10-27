const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('Block Light Shading in Renderer', () => {
    let env, game, renderer, window;

    beforeEach(() => {
        env = createGameEnv();
        game = env.createGame();
        window = env.window;
        renderer = game.renderer;
    });

    it('should adjust color brightness for hex, rgb, and rgba string formats', () => {
        // Hex #RRGGBB
        const hexAdjusted = renderer.adjustColor('#808080', 0.5);
        assert.strictEqual(hexAdjusted, 'rgb(64,64,64)');

        // Short Hex #RGB
        const shortHexAdjusted = renderer.adjustColor('#FFF', 0.5);
        assert.strictEqual(shortHexAdjusted, 'rgb(127,127,127)');

        // RGB
        const rgbAdjusted = renderer.adjustColor('rgb(200, 100, 50)', 0.5);
        assert.strictEqual(rgbAdjusted, 'rgb(100,50,25)');

        // RGBA
        const rgbaAdjusted = renderer.adjustColor('rgba(100, 200, 50, 0.8)', 0.5);
        assert.strictEqual(rgbaAdjusted, 'rgba(50,100,25,0.8)');
    });

    it('should render blocks with light levels calculated from chunk data without errors', () => {
        game.world.generateChunk(0, 0);

        // Place blocks with different light levels
        game.world.setBlock(0, 60, 5, window.BLOCK.STONE);
        game.world.setBlock(1, 60, 5, window.BLOCK.TORCH);

        assert.doesNotThrow(() => {
            renderer.render();
        });
    });
});
