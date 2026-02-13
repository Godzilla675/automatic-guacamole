const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html>
<body>
<div id="game-canvas"></div>
<div id="chat-container"></div>
<div id="chat-messages"></div>
<input id="chat-input" class="hidden">
<div id="hotbar"></div>
<div id="health-bar"></div>
<div id="hunger-bar"></div>
<div id="damage-overlay"></div>
<div id="fps"></div>
<div id="position"></div>
<div id="block-count"></div>
<div id="game-time"></div>
<div id="crafting-screen" class="hidden"></div>
<div id="crafting-recipes"></div>
<div id="close-crafting"></div>
<div id="inventory-screen" class="hidden">
    <div id="inventory-grid"></div>
</div>
<div id="furnace-screen" class="hidden">
    <div id="furnace-input"></div>
    <div id="furnace-fuel"></div>
    <div id="furnace-output"></div>
    <div id="furnace-progress"></div>
    <div id="furnace-burn"></div>
    <div id="close-furnace"></div>
</div>
<div id="settings-screen" class="hidden">
    <input id="volume-slider" type="range" min="0" max="100" value="50">
    <div id="close-settings"></div>
</div>
<div id="pause-screen" class="hidden"></div>
<div id="debug-info" class="hidden"></div>
<div id="crosshair"></div>
<div id="loading-screen"></div>
<div id="menu-screen"></div>
<button id="start-game"></button>
<button id="resume-game"></button>
<button id="return-menu"></button>
<button id="close-inventory"></button>
<button id="settings-btn"></button>
<div id="mobile-controls" class="hidden"></div>
<div id="joystick-container"></div>
<div id="joystick-stick"></div>
<button id="jump-btn"></button>
<button id="break-btn"></button>
<button id="place-btn"></button>
<button id="fly-btn"></button>
</body>`, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost/"
});

// Mock globals
dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.navigator = { userAgent: "node", maxTouchPoints: 0 };
dom.window.alert = (msg) => { console.log("ALERT:", msg); };

// Mock WebSocket
class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = 0;
        setTimeout(() => {
            this.readyState = 1;
            if (this.onopen) this.onopen();
        }, 10);
    }
    send(data) {}
    close() {}
}
dom.window.WebSocket = MockWebSocket;

// Mock AudioContext & SoundManager
dom.window.AudioContext = class {
    constructor() {
        this.listener = { positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 }, forwardX: { value: 0 }, forwardY: { value: 0 }, forwardZ: { value: -1 }, upX: { value: 0 }, upY: { value: 1 }, upZ: { value: 0 }, setPosition: () => {}, setOrientation: () => {} };
        this.destination = {};
    }
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
    createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
    createPanner() { return { connect: () => {}, positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 }, panningModel: '', distanceModel: '', refDistance: 0, maxDistance: 0, rolloffFactor: 0 }; }
    resume() {}
    get state() { return 'running'; }
    get currentTime() { return 0; }
};

// Mock Canvas
const canvas = dom.window.document.getElementById('game-canvas');
canvas.getContext = () => ({
    setTransform: () => {},
    fillStyle: '',
    fillRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    fill: () => {},
    strokeRect: () => {},
    font: '',
    fillText: () => {},
    measureText: () => ({ width: 0 }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    clearRect: () => {},
    save: () => {},
    restore: () => {},
    scale: () => {},
    translate: () => {},
    rotate: () => {},
});
canvas.requestPointerLock = () => {};
dom.window.document.exitPointerLock = () => {};

// Mock Perlin
dom.window.perlin = { noise: () => 0 };

// Mock localStorage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: function(key) { return store[key] || null; },
        setItem: function(key, value) { store[key] = value.toString(); },
        clear: function() { store = {}; },
        removeItem: function(key) { delete store[key]; }
    };
})();
dom.window.localStorage = localStorageMock;

dom.window.prompt = () => "Tester";

// Load Code
const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error("Error loading " + f, e);
    }
};

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'entity.js', 'vehicle.js', 'drop.js', 'crafting.js', 'player.js', 'mob.js', 'plugin.js', 'particles.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'game.js'].forEach(load);

describe('New Features Verification', () => {
    let game;

    before(function(done) {
        this.timeout(10000);
        game = new dom.window.Game();
        game.world.renderDistance = 1;
        game.gameLoop = () => {};
        dom.window.requestAnimationFrame = (cb) => {};

        try {
            game.init().then(() => {}).catch(e => console.error(e));
        } catch (e) {}

        setTimeout(() => {
            game.gameLoop = () => {};
            done();
        }, 500);
    });

    describe('Inventory UI', () => {
        beforeEach(() => {
            game.player.inventory.fill(null);
            game.ui.cursorItem = null;
        });

        it('should pick up an item', () => {
            game.player.inventory[0] = { type: dom.window.BLOCK.DIRT, count: 10 };
            game.ui.refreshInventoryUI();

            // Click slot 0
            game.ui.handleInventoryClick(0);

            assert.strictEqual(game.player.inventory[0], null, "Slot 0 should be empty");
            assert.ok(game.ui.cursorItem, "Cursor should have item");
            assert.strictEqual(game.ui.cursorItem.type, dom.window.BLOCK.DIRT, "Cursor item should be Dirt");
            assert.strictEqual(game.ui.cursorItem.count, 10, "Cursor item count should be 10");
        });

        it('should place an item', () => {
            // Setup: Cursor has Dirt(10), Slot 1 is empty
            game.ui.cursorItem = { type: dom.window.BLOCK.DIRT, count: 10 };

            game.ui.handleInventoryClick(1);

            assert.strictEqual(game.ui.cursorItem, null, "Cursor should be empty");
            assert.ok(game.player.inventory[1], "Slot 1 should have item");
            assert.strictEqual(game.player.inventory[1].type, dom.window.BLOCK.DIRT, "Slot 1 should be Dirt");
        });

        it('should stack items', () => {
            // Setup: Slot 1 has Dirt(10). Give Cursor Dirt(5).
            game.player.inventory[1] = { type: dom.window.BLOCK.DIRT, count: 10 };
            game.ui.cursorItem = { type: dom.window.BLOCK.DIRT, count: 5 };

            game.ui.handleInventoryClick(1);

            assert.strictEqual(game.ui.cursorItem, null, "Cursor should be empty");
            assert.strictEqual(game.player.inventory[1].count, 15, "Slot 1 should have 15 Dirt");
        });

        it('should swap items', () => {
            // Setup: Slot 1 has Dirt(15). Cursor has Stone(1).
            game.player.inventory[1] = { type: dom.window.BLOCK.DIRT, count: 15 };
            game.ui.cursorItem = { type: dom.window.BLOCK.STONE, count: 1 };

            game.ui.handleInventoryClick(1);

            // Result: Slot 1 has Stone(1), Cursor has Dirt(15)
            assert.strictEqual(game.player.inventory[1].type, dom.window.BLOCK.STONE, "Slot 1 should be Stone");
            assert.ok(game.ui.cursorItem, "Cursor should have item");
            assert.strictEqual(game.ui.cursorItem.type, dom.window.BLOCK.DIRT, "Cursor should be Dirt");

            // Clean up cursor
            game.ui.cursorItem = null;
        });
    });

    describe('Furnace Logic', () => {
        let furnace;

        before(() => {
            furnace = {
                type: 'furnace',
                fuel: 0, maxFuel: 0,
                progress: 0, maxProgress: 100,
                input: null, fuelItem: null, output: null,
                burnTime: 0, maxBurnTime: 0
            };
        });

        it('should accept valid input and fuel', () => {
            furnace.input = { type: dom.window.BLOCK.ORE_IRON, count: 1 };
            furnace.fuelItem = { type: dom.window.BLOCK.ITEM_COAL, count: 1 };

            assert.ok(game.canSmelt(furnace), "Should be able to smelt Iron Ore");
        });

        it('should consume fuel and start burning', () => {
            // Process for 0.1s
            game.processFurnace(furnace, 0.1);

            assert.ok(furnace.burnTime > 0, "Burn time should be set");
            assert.strictEqual(furnace.fuelItem, null, "Coal should be consumed (count was 1)");
            assert.strictEqual(furnace.maxBurnTime, 80, "Coal burn time should be 80");
        });

        it('should progress smelting', () => {
            furnace.burnTime = 100; // Force fuel
            const startProgress = furnace.progress;

            game.processFurnace(furnace, 1.0); // 1 sec

            assert.ok(furnace.progress > startProgress, "Progress should increase");
        });

        it('should produce output when complete', () => {
            furnace.progress = 99;
            furnace.input = { type: dom.window.BLOCK.ORE_IRON, count: 1 };
            furnace.output = null;

            game.processFurnace(furnace, 0.2); // Push over 100

            assert.ok(furnace.output, "Output should exist");
            assert.strictEqual(furnace.output.type, dom.window.BLOCK.ITEM_IRON_INGOT, "Output should be Iron Ingot");
            assert.strictEqual(furnace.input, null, "Input should be consumed");
            assert.strictEqual(furnace.progress, 0, "Progress should reset");
        });
    });

    describe('Farming', () => {
        it('Hoe should turn Dirt/Grass to Farmland', () => {
            const x = 0, y = 50, z = 0;
            game.world.setBlock(x, y, z, dom.window.BLOCK.DIRT);

            // Give Hoe
            game.player.inventory[0] = { type: dom.window.BLOCK.HOE_WOOD, count: 1 };
            game.player.selectedSlot = 0;

            // Look at block
            game.player.x = x + 0.5;
            game.player.y = y + 2;
            game.player.z = z + 0.5;
            game.player.pitch = Math.PI / 2; // Look down

            // Trigger placeBlock (which handles interaction)
            game.placeBlock();

            assert.strictEqual(game.world.getBlock(x, y, z), dom.window.BLOCK.FARMLAND, "Block should be Farmland");
        });

        it('Seeds should plant on Farmland', () => {
            const x = 0, y = 50, z = 0;
            // Ensure Farmland and Air above
            game.world.setBlock(x, y, z, dom.window.BLOCK.FARMLAND);
            game.world.setBlock(x, y+1, z, dom.window.BLOCK.AIR);

            // Give Seeds
            game.player.inventory[0] = { type: dom.window.BLOCK.ITEM_WHEAT_SEEDS, count: 1 };

            // Look at Farmland
             game.player.x = x + 0.5;
            game.player.y = y + 2;
            game.player.z = z + 0.5;
            game.player.pitch = Math.PI / 2;

            game.placeBlock();

            assert.strictEqual(game.world.getBlock(x, y+1, z), dom.window.BLOCK.WHEAT, "Crop should be planted");
            const entity = game.world.getBlockEntity(x, y+1, z);
            assert.ok(entity, "Crop entity should exist");
            assert.strictEqual(entity.type, 'crop', "Entity type should be crop");
            assert.strictEqual(entity.stage, 0, "Stage should be 0");
        });
    });

    describe('Bed Interaction', () => {
        it('should allow sleep at night', () => {
            // Set night
            game.gameTime = game.dayLength * 0.8; // Night

            const x = 10, y = 50, z = 10;
            game.world.setBlock(x, y, z, dom.window.BLOCK.BED);

            // Interact
            game.interact(x, y, z);

            // Check time skipped
            const timeOfDay = game.gameTime % game.dayLength;
            assert.ok(timeOfDay < game.dayLength * 0.2, "Should be morning/day");

            // Check spawn point
            assert.strictEqual(game.player.spawnPoint.x, game.player.x, "Spawn point x updated");
        });

        it('should not allow sleep during day', () => {
            game.gameTime = game.dayLength * 0.2; // Day
            const oldTime = game.gameTime;

            const x = 10, y = 50, z = 10;
            game.world.setBlock(x, y, z, dom.window.BLOCK.BED);

            game.interact(x, y, z);

            assert.strictEqual(game.gameTime, oldTime, "Time should not change");
        });
    });

    describe('Settings', () => {
        it('should change volume', () => {
            // Mock sound manager if not already
            if (!dom.window.soundManager) {
                dom.window.soundManager = { volume: 0.5 };
            }

            const slider = dom.window.document.getElementById('volume-slider');
            slider.value = 80;

            // Trigger event
            const event = new dom.window.Event('input');
            slider.dispatchEvent(event);

            assert.strictEqual(dom.window.soundManager.volume, 0.8, "Volume should be updated to 0.8");
        });
    });
});
