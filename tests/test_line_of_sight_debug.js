const assert = require('assert');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

describe('Line of Sight Visual Debug and Canvas Mock Tests', function() {
    let dom;
    let window;

    beforeEach(function() {
        dom = new JSDOM('<!DOCTYPE html><html><body><div id="debug-info" class="hidden"></div><canvas id="gameCanvas"></canvas></body></html>', {
            url: "http://localhost/"
        });
        window = dom.window;
        global.window = window;
        global.document = window.document;
        global.localStorage = window.localStorage;

        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {},
                clearRect: () => {},
                getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
                putImageData: () => {},
                createPattern: () => ({}),
                beginPath: () => {},
                moveTo: () => {},
                lineTo: () => {},
                stroke: () => {},
                fill: () => {},
                arc: () => {},
                drawImage: () => {},
                setTransform: () => {},
                createLinearGradient: () => ({ addColorStop: () => {} })
            };
        };

        const fs = require('fs');
        const loadScript = (filepath) => {
            const code = fs.readFileSync(filepath, 'utf-8');
            window.eval(code);
        };

        loadScript('js/blocks.js');
        loadScript('js/entity.js');
        global.Entity = window.Entity;
        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;

        loadScript('js/mob.js');
        loadScript('js/input.js');
        loadScript('js/renderer.js');
    });

    afterEach(function() {
        delete global.window;
        global.document = undefined;
    });

    it('should toggle window.debugLineOfSight when F4 key is pressed', function() {
        const mockGame = {
            controls: { enabled: true },
            canvas: window.document.getElementById('gameCanvas')
        };
        const input = new window.InputManager(mockGame);
        input.setupEventListeners();

        window.debugLineOfSight = false;
        const eventF4 = new window.KeyboardEvent('keydown', { code: 'F4' });
        window.document.dispatchEvent(eventF4);
        assert.strictEqual(window.debugLineOfSight, true);

        const eventF4Second = new window.KeyboardEvent('keydown', { code: 'F4' });
        window.document.dispatchEvent(eventF4Second);
        assert.strictEqual(window.debugLineOfSight, false);
    });

    it('should store debug rays in game.debugRays when debugLineOfSight is enabled during hasLineOfSight', function() {
        const mockGame = {
            physics: {
                raycast: () => null
            },
            debugRays: []
        };

        const mob = new window.Mob(mockGame, 10, 64, 10, window.MOB_TYPE.ZOMBIE);
        const player = { x: 15, y: 64, z: 10, height: 1.8 };

        window.debugLineOfSight = true;
        const result = mob.hasLineOfSight(player);

        assert.strictEqual(result, true);
        assert.ok(mockGame.debugRays.length > 0);
        assert.strictEqual(mockGame.debugRays[0].hit, false);
        assert.strictEqual(mockGame.debugRays[0].origin.x, 10);
        assert.strictEqual(mockGame.debugRays[0].target.x, 15);
    });
});
