const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html><body>
<canvas id="game-canvas"></canvas>
<div id="chat-input"></div><div id="chat-messages"></div>
<div id="hotbar"></div>
<button id="settings-btn"></button><button id="close-settings"></button>
<input id="volume-slider" type="range"><input id="fov-slider" type="range"><input id="render-dist-slider" type="range">
<button id="reset-controls"></button><button id="pause-btn"></button>
<button id="close-furnace"></button>
<div id="furnace-input"></div><div id="furnace-fuel"></div><div id="furnace-output"></div>
<button id="open-recipe-book"></button><button id="close-recipe-book"></button>
<button id="close-trading"></button>
<div id="trading-screen"></div><div id="trading-list"></div>
<button id="close-chest"></button>
<div id="settings-screen"></div><div id="pause-screen"></div>
<div id="fov-value"></div><div id="render-dist-value"></div>
<div id="keybinds-list"></div>
<div id="chest-screen"></div><div id="inventory-screen"></div><div id="inventory-grid"></div><div id="chest-grid"></div>
<div id="crafting-screen"></div><div id="recipe-book-screen"></div><div id="recipe-list"></div>
<div id="furnace-screen"></div><div id="furnace-progress"></div><div id="furnace-burn"></div>
<div id="health-bar"></div><div id="hunger-bar"></div><div id="damage-overlay"></div>
<div id="mobile-controls"></div>
<div id="crosshair"></div>
</body>`, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost/"
});

dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.navigator = { userAgent: "node" };
dom.window.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
dom.window.AudioContext = class { createGain() { return { gain: { value: 1, linearRampToValueAtTime: () => {} }, connect: () => {} }; } };
dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 16);
dom.window.soundManager = { play: () => {}, updateAmbience: () => {} };

// Mock Canvas
dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform: () => {},
    clearRect: () => {},
    fillRect: () => {},
});

// Mock Perlin Noise
dom.window.perlin = { noise: () => 0.5 };

const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error(`Failed to load ${f}:`, e);
    }
};

// Load dependencies
['math.js', 'blocks.js', 'particles.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'physics.js', 'entity.js', 'vehicle.js',
 'player.js', 'mob.js', 'drop.js', 'crafting.js', 'chat.js', 'ui.js', 'network.js', 'input.js', 'renderer.js', 'plugin.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'game.js']
.forEach(load);

const { Game, BLOCK, BLOCKS } = dom.window;

describe('Advanced Farming Verification', () => {
    let game;

    beforeEach(() => {
        game = new Game();
        // Generate chunk 0,0 manually
        game.world.generateChunk(0, 0);
    });

    it('should have new farming blocks defined', () => {
        assert.ok(BLOCK.CARROTS, 'CARROTS block should be defined');
        assert.ok(BLOCK.POTATOES, 'POTATOES block should be defined');
        assert.ok(BLOCK.MELON_BLOCK, 'MELON_BLOCK should be defined');
        assert.ok(BLOCK.PUMPKIN, 'PUMPKIN should be defined');
    });

    it('should plant Carrots on Farmland', () => {
        // Setup Farmland
        game.world.setBlock(0, 0, 0, BLOCK.FARMLAND);
        game.world.setBlock(0, 1, 0, BLOCK.AIR);

        // Give player carrot
        game.player.inventory[0] = { type: BLOCK.ITEM_CARROT, count: 1 };
        game.player.selectedSlot = 0;

        // Mock Raycast hit on top of farmland
        game.physics.raycast = () => ({
            x: 0, y: 0, z: 0,
            face: { x: 0, y: 1, z: 0 }
        });
        game.physics.checkCollision = () => false;

        game.placeBlock();

        const block = game.world.getBlock(0, 1, 0);
        const entity = game.world.getBlockEntity(0, 1, 0);

        assert.strictEqual(block, BLOCK.CARROTS, "Should place Carrot block");
        assert.ok(entity, "Entity should exist");
        assert.strictEqual(entity.type, 'crop', "Should create crop entity");
        assert.strictEqual(entity.stage, 0, "Should start at stage 0");
    });

     it('should drop correct items when breaking fully grown Potato', () => {
        // Setup Grown Potato
        game.world.setBlock(0, 1, 0, BLOCK.POTATOES);
        game.world.setBlockEntity(0, 1, 0, { type: 'crop', stage: 7 });

        // Capture drops
        game.drops = [];
        game.finalizeBreakBlock(0, 1, 0);

        // Should drop ITEM_POTATO
        const potatoDrop = game.drops.find(d => d.type === BLOCK.ITEM_POTATO);
        assert.ok(potatoDrop, "Should drop Potato item");
        assert.ok(potatoDrop.count >= 1, "Should drop at least 1");
    });

    it('should drop Melon Slices when breaking Melon Block', () => {
        // Setup Melon Block
        game.world.setBlock(0, 1, 0, BLOCK.MELON_BLOCK);

        // Capture drops
        game.drops = [];
        game.finalizeBreakBlock(0, 1, 0);

        // Should drop ITEM_MELON_SLICE
        const sliceDrop = game.drops.find(d => d.type === BLOCK.ITEM_MELON_SLICE);
        assert.ok(sliceDrop, "Should drop Melon Slice");
        assert.ok(sliceDrop.count >= 3, "Should drop multiple slices");
    });
});
