const { JSDOM } = require('jsdom');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

describe('Audit Fixes & Features Test Suite', function() {
    let dom, window;

    before(function() {
        const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
        dom = new JSDOM(html, {
            runScripts: "dangerously",
            resources: "usable",
            url: "http://localhost/"
        });
        window = dom.window;

        // Mock AudioContext
        const mockAudioParam = () => ({
            value: 1,
            setValueAtTime: () => {},
            exponentialRampToValueAtTime: () => {},
            linearRampToValueAtTime: () => {}
        });

        const mockAudioContext = class {
            constructor() {
                this.destination = {};
                this.listener = {
                    setPosition: () => {},
                    setOrientation: () => {}
                };
            }
            createGain() {
                return { gain: mockAudioParam(), connect: () => {} };
            }
            createOscillator() {
                return {
                    frequency: mockAudioParam(),
                    gain: mockAudioParam(),
                    connect: () => {},
                    start: () => {},
                    stop: () => {}
                };
            }
            createBufferSource() {
                return { buffer: null, connect: () => {}, start: () => {}, stop: () => {} };
            }
            createAnalyser() {
                return { fftSize: 2048, frequencyBinCount: 1024, getByteFrequencyData: () => {}, connect: () => {} };
            }
            createPanner() {
                return {
                    setPosition: () => {},
                    setOrientation: () => {},
                    positionX: mockAudioParam(),
                    positionY: mockAudioParam(),
                    positionZ: mockAudioParam(),
                    connect: () => {}
                };
            }
            decodeAudioData(data, cb) { if (cb) cb({}); }
        };
        window.AudioContext = window.webkitAudioContext = mockAudioContext;
        global.AudioContext = mockAudioContext;

        window.document.exitPointerLock = () => {};
        window.HTMLCanvasElement.prototype.requestPointerLock = () => {};

        // Mocks for JSDOM
        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {},
                clearRect: () => {},
                getImageData: () => ({ data: new Array(100) }),
                putImageData: () => {},
                createImageData: () => ([]),
                setTransform: () => {},
                drawImage: () => {},
                save: () => {},
                fillText: () => {},
                restore: () => {},
                beginPath: () => {},
                moveTo: () => {},
                lineTo: () => {},
                closePath: () => {},
                stroke: () => {},
                translate: () => {},
                scale: () => {},
                rotate: () => {},
                arc: () => {},
                fill: () => {},
                measureText: () => ({ width: 10 }),
                transform: () => {},
                rect: () => {},
                clip: () => {}
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

        // Assign global aliases for JSDOM
        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.Game = window.Game;
        global.World = window.World;
    });

    it('should have CRAFTER and STONECUTTER defined in BLOCK and BLOCKS', function() {
        assert.ok(window.BLOCK.CRAFTER, 'CRAFTER block ID should be defined');
        assert.ok(window.BLOCKS[window.BLOCK.CRAFTER], 'CRAFTER block definition should exist');
        assert.ok(window.BLOCK.STONECUTTER, 'STONECUTTER block ID should be defined');
        assert.ok(window.BLOCKS[window.BLOCK.STONECUTTER], 'STONECUTTER block definition should exist');
    });

    it('should open Stonecutter UI when interacting with STONECUTTER block', function() {
        const game = new window.Game();
        game.world.generateChunk(0, 0);
        game.world.setBlock(5, 5, 5, window.BLOCK.STONECUTTER);

        const open = game.interact(5, 5, 5);
        assert.strictEqual(open, true, 'Interacting with Stonecutter should return true');
        assert.ok(game.ui.activeStonecutter, 'Active Stonecutter UI state should be set');

        // Test placing input item into Stonecutter
        game.ui.cursorItem = { type: window.BLOCK.STONE, count: 5 };
        game.ui.handleStonecutterClick('stonecutter-input');

        assert.strictEqual(game.ui.activeStonecutter.input.type, window.BLOCK.STONE);
        assert.ok(game.ui.activeStonecutter.output, 'Stonecutter should produce output');

        game.ui.closeStonecutter();
        assert.strictEqual(game.ui.activeStonecutter, null);
    });

    it('should enforce Smoker & Blast Furnace smelting restrictions and 2x speed multiplier', function() {
        const game = new window.Game();

        const smokerEntity = {
            type: 'smoker',
            burnTime: 10,
            progress: 0,
            maxProgress: 50,
            input: { type: window.BLOCK.ITEM_RAW_FISH, count: 1 },
            output: null
        };

        const canSmeltFish = game.canSmelt(smokerEntity);
        assert.strictEqual(canSmeltFish, true, 'Smoker should accept food items');

        smokerEntity.input = { type: window.BLOCK.ORE_IRON, count: 1 };
        const canSmeltOreInSmoker = game.canSmelt(smokerEntity);
        assert.strictEqual(canSmeltOreInSmoker, false, 'Smoker should reject ores');

        const blastEntity = {
            type: 'blast_furnace',
            burnTime: 10,
            progress: 0,
            maxProgress: 50,
            input: { type: window.BLOCK.ORE_IRON, count: 1 },
            output: null
        };

        const canSmeltOreInBlast = game.canSmelt(blastEntity);
        assert.strictEqual(canSmeltOreInBlast, true, 'Blast Furnace should accept ores');

        blastEntity.input = { type: window.BLOCK.ITEM_RAW_FISH, count: 1 };
        const canSmeltFishInBlast = game.canSmelt(blastEntity);
        assert.strictEqual(canSmeltFishInBlast, false, 'Blast Furnace should reject food');

        // Test 2x smelting progress speed
        const testSmoker = {
            type: 'smoker',
            burnTime: 10,
            progress: 0,
            maxProgress: 50,
            input: { type: window.BLOCK.ITEM_RAW_FISH, count: 2 },
            output: null
        };
        game.processFurnace(testSmoker, 1.0); // 1 second dt
        assert.strictEqual(testSmoker.progress, 20, 'Smoker should progress by 20 (dt * 10 * 2)');
    });

    it('should roll loot table rewards when reeling in a hooked fishing bobber', function() {
        const game = new window.Game();
        game.player.x = 5;
        game.player.y = 5;
        game.player.z = 5;

        game.castBobber();
        assert.ok(game.bobber, 'Bobber should exist after casting');

        game.bobber.state = 'hooked';
        game.reelInBobber();

        assert.strictEqual(game.bobber, null, 'Bobber should be cleared after reeling in');
        assert.strictEqual(game.drops.length, 1, 'Should spawn a drop reward upon reeling in hooked bobber');
    });

    it('should trigger Crafter auto-crafting pulse upon rising redstone edge', function() {
        const game = new window.Game();
        const world = game.world;
        world.generateChunk(0, 0);

        // Solid block below torch so torch doesn't break
        world.setBlock(5, 4, 6, window.BLOCK.STONE);
        world.setBlock(5, 5, 5, window.BLOCK.CRAFTER);

        // Put ingredients into Crafter block entity for Planks recipe (Wood -> Planks)
        const entity = {
            type: 'crafter',
            items: [
                { type: window.BLOCK.WOOD, count: 1 }, null, null,
                null, null, null,
                null, null, null
            ]
        };
        world.setBlockEntity(5, 5, 5, entity);

        // Power the Crafter
        world.setBlock(5, 5, 6, window.BLOCK.REDSTONE_TORCH);
        world.activeRedstone.add('5,5,5');
        world.updateRedstone();

        // Check if item drop was spawned
        assert.ok(game.drops.length >= 1, 'Crafter should eject crafted item drop on redstone pulse');
    });
});
