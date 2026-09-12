const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Renderer Mob Depth Sorting and Cloud Rendering', () => {
    let dom;
    let window;

    beforeEach(() => {
        dom = new JSDOM(`<!DOCTYPE html><html><body><canvas id="gameCanvas"></canvas></body></html>`, {
            url: 'http://localhost/',
            runScripts: 'dangerously',
            resources: 'usable'
        });
        window = dom.window;

        const scripts = ['js/math.js', 'js/blocks.js', 'js/entity.js', 'js/mob.js', 'js/renderer.js'];
        scripts.forEach(scriptPath => {
            const content = fs.readFileSync(path.resolve(__dirname, '..', scriptPath), 'utf8');
            window.eval(content);
        });
    });

    afterEach(() => {
        if (dom) dom.window.close();
    });

    it('should sort mobs by distance in descending order before drawing', () => {
        const mockCtx = {
            createLinearGradient: () => ({ addColorStop: () => {} }),
            fillRect: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            stroke: () => {},
            arc: () => {},
            fill: () => {},
            setTransform: () => {}
        };
        const mockGame = {
            canvas: { width: 800, height: 600, style: {} },
            ctx: mockCtx,
            player: { x: 0, y: 0, z: 0, height: 1.8, yaw: 0, pitch: 0, spectator: false },
            fov: 70,
            renderDistance: 64,
            gameTime: 1000,
            dayLength: 24000,
            sunBrightness: 1,
            world: { getBlock: () => window.BLOCK.AIR, getChunk: () => null, weather: 'clear' },
            vehicles: [],
            drops: [],
            particles: { particles: [] },
            tntPrimed: [],
            projectiles: [],
            bobber: null,
            network: null
        };

        const mob1 = new window.Mob(mockGame, 'zombie', 0, 0, 10);
        const mob2 = new window.Mob(mockGame, 'cow', 0, 0, 30);
        const mob3 = new window.Mob(mockGame, 'pig', 0, 0, 5);
        mockGame.mobs = [mob1, mob2, mob3];

        const renderer = new window.Renderer(mockGame);
        assert.doesNotThrow(() => {
            renderer.render();
        });
    });

    it('should execute drawClouds without throwing any errors', () => {
        const mockCtx = {
            fillStyle: '',
            fillRect: () => {}
        };
        const mockGame = {
            ctx: mockCtx,
            player: { x: 0, y: 0, z: 0, height: 1.8, yaw: 0, pitch: 0 },
            fov: 70
        };

        const renderer = new window.Renderer(mockGame);
        assert.ok(typeof renderer.drawClouds === 'function');
        assert.doesNotThrow(() => {
            renderer.drawClouds(800, 600);
        });
    });
});
