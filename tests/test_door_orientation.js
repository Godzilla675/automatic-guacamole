
const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="game-canvas"></canvas><div id="chest-screen" class="hidden"></div><div id="inventory-screen" class="hidden"></div><div id="chest-grid"></div><div id="inventory-grid"></div><div id="hotbar"></div><input id="chat-input" class="hidden"><div id="crafting-recipes"></div><div id="close-crafting"></div></body></html>', {
    runScripts: "dangerously",
    resources: "usable"
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock Globals
dom.window.document.exitPointerLock = () => {};
dom.window.HTMLCanvasElement.prototype.requestPointerLock = () => {};
dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform: () => {}, fillRect: () => {}, clearRect: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {}, fillText: () => {}
});
dom.window.requestAnimationFrame = () => {};
dom.window.cancelAnimationFrame = () => {};
dom.window.AudioContext = class { createOscillator() { return { connect:()=>{}, start:()=>{}, stop:()=>{}, frequency:{setValueAtTime:()=>{}, exponentialRampToValueAtTime:()=>{}} }; } createGain() { return { connect:()=>{}, gain:{value:0, setTargetAtTime:()=>{}} }; } };
dom.window.WebSocket = class { constructor() { setTimeout(()=>this.onopen&&this.onopen(),10); } send(){} };
dom.window.soundManager = { play: () => {}, updateAmbience: () => {} };
dom.window.perlin = { noise: () => 0 };
dom.window.alert = () => {};

function loadScript(filename) {
    const content = fs.readFileSync(path.join(__dirname, '../js', filename), 'utf8');
    dom.window.eval(content);
}

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'physics.js', 'drop.js', 'crafting.js', 'ui.js', 'input.js', 'chat.js', 'renderer.js', 'network.js', 'mob.js', 'player.js', 'game.js'].forEach(loadScript);

describe('Door Orientation & Physics Tests', () => {
    let game;
    const BLOCK = dom.window.BLOCK;

    beforeEach(() => {
        game = new dom.window.Game();
        game.world.generateChunk(0, 0); // Init chunk 0,0
    });

    it('should set correct metadata based on yaw when placing door', () => {
        const x = 10, y = 30, z = 10;

        // Mock inventory
        game.player.inventory[0] = { type: BLOCK.DOOR_WOOD_BOTTOM, count: 1 };
        game.player.selectedSlot = 0;

        // Mock Physics Raycast to hit a block at 10,29,10
        game.world.setBlock(10, 29, 10, BLOCK.STONE);
        game.physics.raycast = () => ({ x: 10, y: 29, z: 10, face: {x:0, y:1, z:0} });

        // Test Yaw = 0 (South? Based on previous analysis)
        // If yaw=0 (looking South +Z), door should face North? Or South?
        // Stair logic: 0 -> East, PI/2 -> South, PI -> West, 3PI/2 -> North?
        // Let's rely on distinct values for now.

        // Yaw = 0 (East in code logic? No wait, Stair logic:
        // if r < PI/4 (0) -> meta 0 (East).
        // if r ~ PI/2 -> meta 2 (South).
        // if r ~ PI -> meta 1 (West).
        // if r ~ 3PI/2 -> meta 3 (North).

        game.player.yaw = 0;
        game.placeBlock();
        let meta0 = game.world.getMetadata(10, 30, 10);

        // Reset
        game.world.setBlock(10, 30, 10, BLOCK.AIR);
        game.world.setBlock(10, 31, 10, BLOCK.AIR);
        game.player.inventory[0] = { type: BLOCK.DOOR_WOOD_BOTTOM, count: 1 };

        game.player.yaw = Math.PI / 2; // South
        game.placeBlock();
        let meta1 = game.world.getMetadata(10, 30, 10);

        assert.strictEqual(meta0, 0, "Yaw 0 should produce Meta 0 (East)");
        assert.strictEqual(meta1, 2, "Yaw PI/2 should produce Meta 2 (South)");
    });

    it('should toggle open bit (4) when interacting', () => {
        const x = 10, y = 30, z = 10;
        game.world.setBlock(x, y, z, BLOCK.DOOR_WOOD_BOTTOM);
        game.world.setMetadata(x, y, z, 0); // East, Closed

        game.interact(x, y, z);
        let meta = game.world.getMetadata(x, y, z);

        // Should be 0 | 4 = 4
        assert.strictEqual(meta, 4, "Interacting should set bit 2 (val 4)");

        game.interact(x, y, z);
        meta = game.world.getMetadata(x, y, z);
        // Should be 0
        assert.strictEqual(meta, 0, "Interacting again should clear bit 2");
    });

    it('should verify collision box is thin when closed', () => {
        const x = 10, y = 30, z = 10;
        game.world.setBlock(x, y, z, BLOCK.DOOR_WOOD_BOTTOM);
        game.world.setMetadata(x, y, z, 0); // East
        // East means solid part is at x+0.8 to x+1.0 (assuming implementation)
        // So checking collision at x+0.1 should be FALSE.
        // Checking collision at x+0.9 should be TRUE.

        // Note: I haven't implemented this logic yet, so this test expects the behavior I plan to implement.

        // Check "Empty" part
        let hit = game.physics.checkCollision({x: 10.1, y: 30.5, z: 10.5, width: 0.1, height: 1});
        assert.strictEqual(hit, false, "Should not collide with empty part of East door");

        // Check "Solid" part
        hit = game.physics.checkCollision({x: 10.9, y: 30.5, z: 10.5, width: 0.1, height: 1});
        assert.strictEqual(hit, true, "Should collide with solid part of East door");
    });

    it('should verify no collision when open', () => {
        const x = 10, y = 30, z = 10;
        game.world.setBlock(x, y, z, BLOCK.DOOR_WOOD_BOTTOM);
        game.world.setMetadata(x, y, z, 4); // Open

        // Check "Solid" part (normally solid)
        let hit = game.physics.checkCollision({x: 10.9, y: 30.5, z: 10.5, width: 0.1, height: 1});
        assert.strictEqual(hit, false, "Should not collide when door is open");
    });
});
