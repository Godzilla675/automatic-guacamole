// Shared test harness: boots the game in an isolated JSDOM window.
//
// Usage:
//     const { createGameEnv } = require('./helpers/game_env');
//
//     describe('My feature', function () {
//         let env, game;
//         before(function () {
//             env = createGameEnv();          // fresh window + all scripts from index.html
//             game = env.createGame();        // new Game() (call game.init() yourself if you need the full boot)
//         });
//         after(function () { env.close(); });
//
//         it('does a thing', function () {
//             game.world.setBlock(0, 10, 0, env.BLOCK.CHEST);
//             assert.ok(game.interact(0, 10, 0));
//         });
//     });
//
// Why this exists: older tests each hand-roll a JSDOM, assign `global.window = ...` and never
// clean up, which makes them leak into each other when run in one process. This helper never
// touches Node globals - every script is evaluated inside the window's own VM context, exactly
// like <script> tags in a browser - so tests stay independent of one another.
//
// Scripts are loaded in the order declared in index.html, so a new js/*.js file only has to be
// added to index.html to be picked up by every test that uses this helper.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..', '..');

/** Script paths (relative to repo root) in the order index.html loads them. */
function scriptOrder() {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    return Array.from(html.matchAll(/<script\s+src="(js\/[^"]+)"/g), m => m[1]);
}

function noop() {}

/** Minimal CanvasRenderingContext2D stand-in: every method is a no-op, image data is zero-filled. */
function createStubContext(canvas) {
    const imageData = (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(1, w * h) * 4) });
    const gradient = () => ({ addColorStop: noop });
    const ctx = {
        canvas,
        fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '10px sans-serif', globalAlpha: 1,
        textAlign: 'start', textBaseline: 'alphabetic', imageSmoothingEnabled: true, globalCompositeOperation: 'source-over',
        shadowBlur: 0, shadowColor: 'rgba(0,0,0,0)', shadowOffsetX: 0, shadowOffsetY: 0, lineCap: 'butt', lineJoin: 'miter', filter: 'none',
        createImageData: (w, h) => imageData(typeof w === 'object' ? w.width : w, typeof w === 'object' ? w.height : h),
        getImageData: (x, y, w, h) => imageData(w, h),
        putImageData: noop,
        measureText: text => ({ width: String(text).length * 6, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }),
        createLinearGradient: gradient, createRadialGradient: gradient, createConicGradient: gradient,
        createPattern: () => ({ setTransform: noop }),
        getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
        isPointInPath: () => false, isPointInStroke: () => false,
        getLineDash: () => []
    };
    for (const m of ['fillRect', 'clearRect', 'strokeRect', 'fillText', 'strokeText', 'beginPath', 'closePath', 'moveTo',
        'lineTo', 'arc', 'arcTo', 'ellipse', 'rect', 'roundRect', 'quadraticCurveTo', 'bezierCurveTo', 'fill', 'stroke', 'clip',
        'save', 'restore', 'scale', 'rotate', 'translate', 'transform', 'setTransform', 'resetTransform', 'drawImage',
        'setLineDash', 'drawFocusIfNeeded', 'reset']) {
        ctx[m] = noop;
    }
    return ctx;
}

/** Enough of the Web Audio API for js/audio.js to run silently. */
function createMockAudioContext() {
    const param = () => ({
        value: 0, setValueAtTime: noop, setTargetAtTime: noop, linearRampToValueAtTime: noop,
        exponentialRampToValueAtTime: noop, cancelScheduledValues: noop
    });
    const node = extra => Object.assign({ connect: noop, disconnect: noop, start: noop, stop: noop }, extra);
    return class MockAudioContext {
        constructor() {
            this.currentTime = 0;
            this.sampleRate = 44100;
            this.state = 'running';
            this.destination = node();
            this.listener = {
                positionX: param(), positionY: param(), positionZ: param(),
                forwardX: param(), forwardY: param(), forwardZ: param(),
                upX: param(), upY: param(), upZ: param(),
                setPosition: noop, setOrientation: noop
            };
        }
        resume() { this.state = 'running'; return Promise.resolve(); }
        suspend() { this.state = 'suspended'; return Promise.resolve(); }
        close() { this.state = 'closed'; return Promise.resolve(); }
        createGain() { return node({ gain: param() }); }
        createOscillator() { return node({ frequency: param(), detune: param(), type: 'sine' }); }
        createBufferSource() { return node({ buffer: null, loop: false, playbackRate: param() }); }
        createBuffer(channels, length) { return { length, getChannelData: () => new Float32Array(length || 1) }; }
        createBiquadFilter() { return node({ frequency: param(), Q: param(), gain: param(), type: 'lowpass' }); }
        createPanner() { return node({ positionX: param(), positionY: param(), positionZ: param(), setPosition: noop, panningModel: '', distanceModel: '' }); }
        createDynamicsCompressor() { return node({ threshold: param(), knee: param(), ratio: param(), attack: param(), release: param() }); }
        createDelay() { return node({ delayTime: param() }); }
        createConvolver() { return node({ buffer: null }); }
        createStereoPanner() { return node({ pan: param() }); }
        decodeAudioData() { return Promise.resolve(this.createBuffer(1, 1)); }
    };
}

/**
 * Create an isolated game environment.
 *
 * @param {object} [options]
 * @param {string[]} [options.scripts]   Explicit script list (default: index.html order, minus js/main.js).
 * @param {string[]} [options.exclude]   Scripts to skip (e.g. ['js/renderer.js']).
 * @param {boolean}  [options.realCanvas] Use the native `canvas` package through JSDOM when it is installed
 *                                        (slower, real pixels). Default: a no-op 2D context stub.
 * @param {string}   [options.html]      Override the HTML document (default: the real index.html shell).
 */
function createGameEnv(options = {}) {
    const rawHtml = options.html || fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const html = rawHtml.replace(/<script[^>]*src=[^>]*><\/script>\s*/g, '');

    const dom = new JSDOM(html, {
        url: 'http://localhost/',
        runScripts: 'outside-only',
        pretendToBeVisual: true
    });
    const window = dom.window;

    if (!options.realCanvas || !hasNativeCanvas()) {
        window.HTMLCanvasElement.prototype.getContext = function getContext() {
            if (!this.__stubCtx) this.__stubCtx = createStubContext(this);
            return this.__stubCtx;
        };
    }
    window.AudioContext = createMockAudioContext();
    window.webkitAudioContext = window.AudioContext;
    // Use the window's own timers so jsdom cancels any pending frame when env.close() is called.
    window.requestAnimationFrame = cb => window.setTimeout(() => cb(Date.now()), 16);
    window.cancelAnimationFrame = id => window.clearTimeout(id);
    window.alert = noop;
    window.confirm = () => true;
    window.prompt = () => null;
    window.scrollTo = noop;
    if (!window.HTMLElement.prototype.requestPointerLock) window.HTMLElement.prototype.requestPointerLock = noop;
    if (!window.document.exitPointerLock) window.document.exitPointerLock = noop;

    const context = dom.getInternalVMContext();
    const scripts = (options.scripts || scriptOrder().filter(s => s !== 'js/main.js'))
        .filter(s => !(options.exclude || []).includes(s));
    for (const rel of scripts) {
        const file = path.join(ROOT, rel);
        vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
    }

    return {
        dom,
        window,
        document: window.document,
        scripts,
        get BLOCK() { return window.BLOCK; },
        get BLOCKS() { return window.BLOCKS; },
        get MOB_TYPE() { return window.MOB_TYPE; },
        /** Evaluate extra source inside the window (e.g. a plugin script). */
        run(source, filename = 'inline.js') { return vm.runInContext(source, context, { filename }); },
        /** `new Game()` wired up as window.game. Call `game.init()` yourself when you need the full boot. */
        createGame() {
            const game = new window.Game();
            window.game = game;
            return game;
        },
        close() { window.close(); }
    };
}

let nativeCanvasChecked = false;
let nativeCanvasAvailable = false;
function hasNativeCanvas() {
    if (!nativeCanvasChecked) {
        nativeCanvasChecked = true;
        try { nativeCanvasAvailable = typeof require('canvas').createCanvas === 'function'; } catch (e) { nativeCanvasAvailable = false; }
    }
    return nativeCanvasAvailable;
}

module.exports = { createGameEnv, scriptOrder, createStubContext, createMockAudioContext, hasNativeCanvas, ROOT };
