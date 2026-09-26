const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Fletching Table UI and Smoker / Blast Furnace UI Animations Suite', function() {
    this.timeout(10000);
    let dom, window, document, game;

    beforeEach(() => {
        const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
        dom = new JSDOM(htmlContent, {
            runScripts: 'dangerously',
            resources: 'usable',
            url: 'http://localhost/'
        });
        window = dom.window;
        document = window.document;

        // Mock AudioContext
        window.AudioContext = window.webkitAudioContext = class {
            constructor() {
                this.listener = { positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 }, forwardX: { value: 0 }, forwardY: { value: 0 }, forwardZ: { value: -1 }, upX: { value: 0 }, upY: { value: 1 }, upZ: { value: 0 }, setPosition: () => {}, setOrientation: () => {} };
                this.destination = {};
            }
            createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
            createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
            createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
            createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
            createBiquadFilter() { return { connect: () => {} }; }
            createPanner() { return { connect: () => {}, positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 }, panningModel: '', distanceModel: '', refDistance: 0, maxDistance: 0, rolloffFactor: 0 }; }
            resume() {}
            get state() { return 'running'; }
            get currentTime() { return 0; }
        };

        // Mock HTMLCanvasElement context
        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {},
                clearRect: () => {},
                getImageData: () => ({ data: new Uint8ClampedArray(16 * 16 * 4) }),
                putImageData: () => {},
                createImageData: () => ({ data: new Uint8ClampedArray(16 * 16 * 4) }),
                drawImage: () => {},
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                stroke: () => {},
                createPattern: () => ({})
            };
        };

        // Stub pointer lock methods
        document.exitPointerLock = () => {};
        window.HTMLCanvasElement.prototype.requestPointerLock = () => {};

        const loadScript = (f) => {
            const code = fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8');
            window.eval(code);
        };

        ['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'village.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'entity.js', 'vehicle.js', 'crafting.js', 'player.js', 'mob.js', 'drop.js', 'plugin.js', 'particles.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'game.js'].forEach(loadScript);

        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.Game = window.Game;

        game = new window.Game();
        game.world.generateChunk(0, 0);
        game.ui.init();
    });

    it('should open Fletching Table screen when interacting with FLETCHING_TABLE', () => {
        const B = window.BLOCK;
        game.world.setBlock(5, 5, 5, B.FLETCHING_TABLE);

        const interacted = game.interact(5, 5, 5);
        assert.strictEqual(interacted, true, 'Interacting with FLETCHING_TABLE returns true');

        const fletchingScreen = document.getElementById('fletching-screen');
        assert.ok(fletchingScreen, '#fletching-screen element exists');
        assert.strictEqual(fletchingScreen.classList.contains('hidden'), false, 'Fletching screen should be visible');
        assert.ok(game.ui.activeFletchingTable, 'activeFletchingTable initialized');
    });

    it('should handle Fletching Table input placing and arrow crafting', () => {
        const B = window.BLOCK;
        game.ui.openFletchingTable();

        // Place Flint
        game.ui.cursorItem = { type: B.ITEM_FLINT, count: 2 };
        game.ui.handleFletchingClick('fletching-input-flint');
        assert.strictEqual(game.ui.activeFletchingTable.flint.type, B.ITEM_FLINT);
        assert.strictEqual(game.ui.cursorItem, null);

        // Place Stick
        game.ui.cursorItem = { type: B.ITEM_STICK, count: 2 };
        game.ui.handleFletchingClick('fletching-input-stick');
        assert.strictEqual(game.ui.activeFletchingTable.stick.type, B.ITEM_STICK);

        // Place Feather
        game.ui.cursorItem = { type: B.ITEM_FEATHER, count: 2 };
        game.ui.handleFletchingClick('fletching-input-feather');
        assert.strictEqual(game.ui.activeFletchingTable.feather.type, B.ITEM_FEATHER);

        // Check output slot populated with Arrow
        const outputSlot = document.getElementById('fletching-output');
        assert.ok(outputSlot.querySelector('.block-icon'), 'Output slot icon rendered');

        // Click output to craft arrows
        game.ui.handleFletchingClick('fletching-output');

        // Check player received arrows
        const hasArrow = game.player.inventory.some(item => item && item.type === B.ITEM_ARROW && item.count === 4);
        assert.ok(hasArrow, 'Player received 4 arrows in inventory');

        // Input counts should decrement to 1
        assert.strictEqual(game.ui.activeFletchingTable.flint.count, 1);
        assert.strictEqual(game.ui.activeFletchingTable.stick.count, 1);
        assert.strictEqual(game.ui.activeFletchingTable.feather.count, 1);

        // Close fletching table and verify remaining items returned to inventory
        game.ui.closeFletchingTable();
        const fletchingScreen = document.getElementById('fletching-screen');
        assert.strictEqual(fletchingScreen.classList.contains('hidden'), true, 'Fletching screen hidden after close');
        assert.strictEqual(game.ui.activeFletchingTable, null);
    });

    it('should display correct title and activate smoke-mode for Smoker UI', () => {
        const B = window.BLOCK;
        game.world.setBlock(10, 5, 10, B.SMOKER);

        game.interact(10, 5, 10);
        const entity = game.world.getBlockEntity(10, 5, 10);
        assert.ok(entity, 'Block entity created for Smoker');
        assert.strictEqual(entity.type, 'smoker');

        const furnaceScreen = document.getElementById('furnace-screen');
        assert.strictEqual(furnaceScreen.classList.contains('hidden'), false);

        const titleEl = furnaceScreen.querySelector('h2');
        assert.strictEqual(titleEl.textContent, 'Smoker');

        // Set active burning state
        entity.burnTime = 10;
        game.ui.updateFurnaceUI();

        const effectEl = document.getElementById('furnace-burn-effect');
        assert.ok(effectEl.classList.contains('active'), 'Burn effect active class present');
        assert.ok(effectEl.classList.contains('smoke-mode'), 'Smoker smoke-mode class present');
        assert.strictEqual(effectEl.textContent, '💨');

        game.ui.closeFurnace();
        assert.strictEqual(furnaceScreen.classList.contains('hidden'), true);
    });

    it('should display correct title and activate blast-mode for Blast Furnace UI', () => {
        const B = window.BLOCK;
        game.world.setBlock(12, 5, 12, B.BLAST_FURNACE);

        game.interact(12, 5, 12);
        const entity = game.world.getBlockEntity(12, 5, 12);
        assert.ok(entity, 'Block entity created for Blast Furnace');
        assert.strictEqual(entity.type, 'blast_furnace');

        const furnaceScreen = document.getElementById('furnace-screen');
        assert.strictEqual(furnaceScreen.classList.contains('hidden'), false);

        const titleEl = furnaceScreen.querySelector('h2');
        assert.strictEqual(titleEl.textContent, 'Blast Furnace');

        // Set active burning state
        entity.burnTime = 10;
        game.ui.updateFurnaceUI();

        const effectEl = document.getElementById('furnace-burn-effect');
        assert.ok(effectEl.classList.contains('active'), 'Burn effect active class present');
        assert.ok(effectEl.classList.contains('blast-mode'), 'Blast furnace blast-mode class present');
        assert.strictEqual(effectEl.textContent, '💥');

        game.ui.closeFurnace();
        assert.strictEqual(furnaceScreen.classList.contains('hidden'), true);
    });
});
