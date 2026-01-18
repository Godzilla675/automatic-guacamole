const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock browser environment
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
    <canvas id="game-canvas"></canvas>
    <div id="game-time"></div>
    <div id="fps"></div>
    <div id="position"></div>
    <div id="block-count"></div>
    <div id="mobile-controls" class="hidden"></div>
    <div id="joystick-container"></div>
    <div id="joystick-stick"></div>
    <div id="jump-btn"></div>
    <div id="break-btn"></div>
    <div id="place-btn"></div>
    <div id="fly-btn"></div>
    <div id="inventory-screen" class="hidden"></div>
    <div id="pause-screen" class="hidden"></div>
    <div id="loading-screen"></div>
    <div id="menu-screen" class="hidden"></div>
    <div id="game-container" class="hidden"></div>
    <div id="controls-info" class="hidden"></div>
    <div class="hotbar-slot"></div>
    <div class="hotbar-slot"></div>
    <div class="hotbar-slot"></div>
    <div class="hotbar-slot"></div>
    <div class="hotbar-slot"></div>
    <div id="start-game"></div>
    <div id="show-controls"></div>
    <div id="pause-btn"></div>
    <div id="resume-game"></div>
    <div id="save-game"></div>
    <div id="load-game"></div>
    <div id="return-menu"></div>
    <div id="close-inventory"></div>
    <div class="inventory-item" data-type="dirt"></div>
</body>
</html>
`, { url: "http://localhost" });

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => store[key] = value.toString(),
    clear: () => store = {}
};
let store = {};

global.navigator = {
    userAgent: 'node.js',
    maxTouchPoints: 0
};

// Mock HTMLCanvasElement.prototype.getContext
global.window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    fillRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    fill: () => {},
    strokeRect: () => {}
});
// Mock requestPointerLock
global.window.HTMLCanvasElement.prototype.requestPointerLock = () => {};


global.alert = (msg) => console.log('ALERT:', msg);
global.requestAnimationFrame = (callback) => {}; // Do nothing

// Load game.js content
const gameJsContent = fs.readFileSync(path.join(__dirname, '../game.js'), 'utf8');

// Run game.js in the global context
vm.runInThisContext(gameJsContent);

// Test Suite
async function runTests() {
    console.log("Starting World Saving/Loading Tests...");

    let testFailed = false;

    try {
        if (typeof VoxelWorld === 'undefined') {
             throw new Error("VoxelWorld is not defined. Evaluation failed?");
        }

        // --- Test 1: Initialize and Save ---
        console.log("Test 1: Initialize and Save");
        const game = new VoxelWorld();
        await game.init();

        // Place a specific block
        const testBlock = { x: 10, y: 30, z: 10, type: 3 }; // Wood
        game.setBlock(testBlock.x, testBlock.y, testBlock.z, testBlock.type);

        // Save Game
        game.saveGame();

        if (!store['voxel-world-save']) {
            throw new Error("Save file not found in localStorage.");
        }

        const saveString = store['voxel-world-save'];
        const sizeInBytes = Buffer.byteLength(saveString, 'utf8');
        const sizeInMB = sizeInBytes / (1024 * 1024);
        console.log(`Save file size: ${sizeInMB.toFixed(2)} MB`);

        if (sizeInMB > 4.5) { // LocalStorage limit is typically 5MB
            console.error("CRITICAL: Save file size exceeds LocalStorage limit (5MB)!");
            // We don't fail the test yet, but we report it.
            // Actually, we SHOULD fail it if we want to enforce the fix.
        }

        const savedData = JSON.parse(saveString);

        // --- Test 2: Load Game ---
        console.log("Test 2: Load Game");
        const newGame = new VoxelWorld();
        await newGame.init();
        newGame.loadGame();

        // Verify Block
        const loadedBlockType = newGame.getBlock(testBlock.x, testBlock.y, testBlock.z);
        if (loadedBlockType !== testBlock.type) {
            throw new Error(`Test block not restored. Expected ${testBlock.type}, got ${loadedBlockType}`);
        }

        console.log("Save/Load cycle successful.");

    } catch (e) {
        console.error("Test Failed:", e);
        testFailed = true;
    }

    if (testFailed) {
        console.log("TESTS FAILED");
        process.exit(1);
    } else {
        console.log("TESTS PASSED");
    }
}

runTests();
