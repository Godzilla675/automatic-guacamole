const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Spectator Water Flight and Context Menu Bug Fixes', function() {
    let dom;
    let window;

    before(function() {
        const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
        dom = new JSDOM(html, {
            url: 'http://localhost/',
            runScripts: 'dangerously',
            resources: 'usable'
        });

        window = dom.window;
        global.window = window;
        global.document = window.document;
        global.navigator = window.navigator;

        global.localStorage = {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
        };

        const mockAudioParam = () => ({ value: 0, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} });
        const mockAudioContext = class {
            constructor() {
                this.state = 'running';
                this.destination = {};
                this.listener = { setPosition: () => {}, setOrientation: () => {}, positionX: mockAudioParam(), positionY: mockAudioParam(), positionZ: mockAudioParam(), forwardX: mockAudioParam(), forwardY: mockAudioParam(), forwardZ: mockAudioParam(), upX: mockAudioParam(), upY: mockAudioParam(), upZ: mockAudioParam() };
            }
            resume() { return Promise.resolve(); }
            createOscillator() {
                return { connect: () => {}, start: () => {}, stop: () => {}, frequency: mockAudioParam(), type: 'sine' };
            }
            createBufferSource() {
                return { connect: () => {}, start: () => {}, stop: () => {}, buffer: null, loop: false, playbackRate: mockAudioParam() };
            }
            createGain() {
                return { connect: () => {}, gain: mockAudioParam() };
            }
            createBiquadFilter() {
                return { connect: () => {}, frequency: mockAudioParam(), Q: mockAudioParam(), type: 'lowpass' };
            }
            createBuffer() { return {}; }
            createAnalyser() {
                return { fftSize: 2048, frequencyBinCount: 1024, getByteFrequencyData: () => {}, connect: () => {} };
            }
            createPanner() {
                return { setPosition: () => {}, setOrientation: () => {}, positionX: mockAudioParam(), positionY: mockAudioParam(), positionZ: mockAudioParam(), connect: () => {} };
            }
            decodeAudioData(data, cb) { if (cb) cb({}); }
        };
        window.AudioContext = window.webkitAudioContext = mockAudioContext;
        global.AudioContext = mockAudioContext;

        window.document.exitPointerLock = () => {};
        window.HTMLCanvasElement.prototype.requestPointerLock = () => {};

        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {},
                clearRect: () => {},
                getImageData: () => ({ data: new Array(100) }),
                putImageData: () => {},
                createImageData: () => ([]),
                createLinearGradient: () => ({ addColorStop: () => {} }),
                createRadialGradient: () => ({ addColorStop: () => {} }),
                setTransform: () => {},
                drawImage: () => {},
                save: () => {},
                fillText: () => {},
                restore: () => {},
                beginPath: () => {},
                moveTo: () => {},
                lineTo: () => {},
                stroke: () => {},
                fill: () => {},
                arc: () => {}
            };
        };

        const loadScript = (scriptName) => {
            const scriptPath = path.resolve(__dirname, '../js/' + scriptName);
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            window.eval(scriptContent);
        };

        loadScript('math.js');
        loadScript('blocks.js');
        loadScript('audio.js');
        loadScript('network.js');
        loadScript('chunk.js');
        loadScript('biome.js');
        loadScript('structures.js');
        loadScript('village.js');
        loadScript('world.js');
        loadScript('physics.js');
        loadScript('entity.js');
        loadScript('vehicle.js');
        loadScript('player.js');
        loadScript('mob.js');
        loadScript('drop.js');
        loadScript('crafting.js');
        loadScript('plugin.js');
        loadScript('minimap.js');
        loadScript('achievements.js');
        loadScript('tutorial.js');
        loadScript('chat.js');
        loadScript('ui.js');
        loadScript('input.js');
        loadScript('textures.js');
        loadScript('renderer.js');
        loadScript('particles.js');
        loadScript('game.js');

        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.Game = window.Game;
        global.World = window.World;
    });

    it('should ignore water fluid slowing and water drag when in spectator mode', function() {
        const game = new window.Game();
        const player = game.player;

        // Fill 3x3x3 blocks with water around (10, 10, 10)
        for (let bx = 9; bx <= 11; bx++) {
            for (let by = 9; by <= 12; by++) {
                for (let bz = 9; bz <= 11; bz++) {
                    game.world.setBlock(bx, by, bz, window.BLOCK.WATER);
                }
            }
        }

        player.x = 10.5;
        player.y = 10.0;
        player.z = 10.5;

        // Survival mode player in water jumping gets swim velocity affected by water drag
        player.spectator = false;
        player.gamemode = 0;
        player.flying = false;
        game.controls.jump = true;
        player.update(0.016);
        const survivalUpwardVel = player.vy;

        // Spectator mode player in water jumping gets full flight upward velocity (4.3) without water drag
        player.spectator = true;
        player.gamemode = 3;
        player.update(0.016);
        const spectatorUpwardVel = player.vy;

        assert.ok(survivalUpwardVel < 2.0, 'Survival player in water is subject to water drag');
        assert.strictEqual(spectatorUpwardVel, player.speed, 'Spectator mode in water gets full flight upward speed without drag');
    });

    it('should capture and prevent default contextmenu events on document and window', function() {
        const game = new window.Game();
        const input = game.inputManager || new window.InputManager(game);
        input.setupEventListeners();

        const event = new window.MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true
        });

        let defaultPrevented = false;
        event.preventDefault = function() {
            defaultPrevented = true;
        };

        window.dispatchEvent(event);
        assert.strictEqual(defaultPrevented, true, 'contextmenu event on window is prevented');
    });
});
