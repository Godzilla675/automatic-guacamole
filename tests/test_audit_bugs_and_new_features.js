const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Audit Bug Fixes and New Features Suite', function() {
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

    it('should display Smoker and Blast Furnace UI animations when burning', function() {
        const game = new window.Game();
        const smokerEntity = {
            type: 'smoker',
            burnTime: 50,
            progress: 20,
            maxProgress: 100
        };

        game.ui.openFurnace(smokerEntity);
        const effectEl = window.document.getElementById('furnace-burn-effect');
        assert.ok(effectEl, 'Furnace effect element exists');
        assert.ok(effectEl.classList.contains('smoke-mode'), 'Smoker applies smoke-mode animation');
        assert.strictEqual(effectEl.textContent, '💨');

        const blastEntity = {
            type: 'blast_furnace',
            burnTime: 50,
            progress: 20,
            maxProgress: 100
        };
        game.ui.openFurnace(blastEntity);
        assert.ok(effectEl.classList.contains('blast-mode'), 'Blast Furnace applies blast-mode animation');
        assert.strictEqual(effectEl.textContent, '💥');
    });

    it('should open Fletching Table UI and craft arrows', function() {
        const game = new window.Game();
        game.ui.openFletchingTable();

        const screen = window.document.getElementById('fletching-screen');
        assert.ok(!screen.classList.contains('hidden'), 'Fletching screen is open');

        game.ui.activeFletchingTable.flint = { type: window.BLOCK.ITEM_FLINT, count: 2 };
        game.ui.activeFletchingTable.stick = { type: window.BLOCK.ITEM_STICK, count: 2 };
        game.ui.activeFletchingTable.feather = { type: window.BLOCK.ITEM_FEATHER, count: 2 };
        game.ui.updateFletchingUI();

        const countArrows = () => {
            let total = 0;
            for (let item of game.player.inventory) {
                if (item && item.type === window.BLOCK.ITEM_ARROW) {
                    total += item.count;
                }
            }
            return total;
        };

        const initialArrowCount = countArrows();
        game.ui.handleFletchingClick('fletching-output');

        const newArrowCount = countArrows();
        assert.strictEqual(newArrowCount, initialArrowCount + 4, 'Crafted 4 arrows');
        assert.strictEqual(game.ui.activeFletchingTable.flint.count, 1, 'Flint count decremented');
    });

    it('should give clean vertical leap for Wind Charge when thrown downward', function() {
        const game = new window.Game();
        game.player.x = 10;
        game.player.y = 10;
        game.player.z = 10;
        game.player.vx = 0;
        game.player.vy = 0;
        game.player.vz = 0;

        // Trigger wind burst right under player's feet
        game.triggerWindBurst(10, 9.8, 10);

        assert.ok(game.player.vy > 10, 'Player gains strong upward velocity');
        assert.strictEqual(game.player.vx, 0, 'No erratic horizontal drift on X axis');
        assert.strictEqual(game.player.vz, 0, 'No erratic horizontal drift on Z axis');
    });

    it('should support spectator mode block occlusion rendering and canvas putImageData', function() {
        const game = new window.Game();
        game.player.spectator = true;
        game.world.setBlock(Math.floor(game.player.x), Math.floor(game.player.y + game.player.height - 0.2), Math.floor(game.player.z), window.BLOCK.STONE);

        const renderer = new window.Renderer(game);
        assert.doesNotThrow(() => {
            renderer.render();
        }, 'Spectator mode block occlusion render succeeds without error');
    });
});
