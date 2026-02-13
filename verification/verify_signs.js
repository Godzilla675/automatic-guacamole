const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html><body></body>`, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable",
});

dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.perlin = { noise: () => 0 };
dom.window.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
};
dom.window.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
dom.window.atob = (str) => Buffer.from(str, 'base64').toString('binary');
dom.window.alert = console.log;
dom.window.confirm = () => true;
dom.window.prompt = () => "Test";

// Add Canvas
const canvas = dom.window.document.createElement('canvas');
canvas.id = 'game-canvas';
dom.window.document.body.appendChild(canvas);

// Add UI Elements
const uiDiv = dom.window.document.createElement('div');
uiDiv.innerHTML = `
    <div id="hotbar"></div>
    <div id="health-bar"></div>
    <div id="hunger-bar"></div>
    <div id="damage-overlay"></div>
    <div id="chat-input" class="hidden"></div>
    <div id="chat-messages"></div>
    <div id="sign-screen" class="hidden">
        <textarea id="sign-input"></textarea>
        <button id="close-sign"></button>
    </div>
    <div id="chest-screen" class="hidden"><div id="chest-grid"></div></div>
    <div id="inventory-screen" class="hidden"><div id="inventory-grid"></div></div>
    <div id="furnace-screen" class="hidden">
        <div id="furnace-input"></div><div id="furnace-fuel"></div><div id="furnace-output"></div><div id="furnace-progress"></div><div id="furnace-burn"></div>
    </div>
    <div id="brewing-screen" class="hidden">
        <div id="brewing-ingredient"></div><div id="brewing-bottle-1"></div><div id="brewing-bottle-2"></div><div id="brewing-bottle-3"></div><div id="brewing-progress"></div>
    </div>
    <div id="enchanting-screen" class="hidden"><div id="enchanting-item"></div><div id="enchanting-options"></div></div>
    <div id="trading-screen" class="hidden"><div id="trading-list"></div></div>
    <div id="pause-screen" class="hidden"></div>
    <div id="settings-screen" class="hidden"><div id="keybinds-list"></div></div>
`;
dom.window.document.body.appendChild(uiDiv);

const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error("Error loading " + f, e);
    }
};

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'physics.js', 'entity.js', 'vehicle.js', 'drop.js', 'mob.js', 'player.js', 'plugin.js', 'particles.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'network.js', 'crafting.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'audio.js', 'game.js'].forEach(load);

async function testSigns() {
    console.log("Starting Signs Verification...");

    // Mock Canvas Context
    dom.window.HTMLCanvasElement.prototype.getContext = () => ({
        clearRect: ()=>{}, drawImage: ()=>{}, save: ()=>{}, restore: ()=>{},
        translate: ()=>{}, rotate: ()=>{}, scale: ()=>{}, beginPath: ()=>{},
        moveTo: ()=>{}, lineTo: ()=>{}, stroke: ()=>{}, fill: ()=>{},
        closePath: ()=>{}, fillText: ()=>{}, measureText: ()=>({width:0}),
        fillRect: ()=>{}, strokeRect: ()=>{}, setTransform: ()=>{}
    });
    // Mock Pointer Lock
    dom.window.HTMLCanvasElement.prototype.requestPointerLock = ()=>{};
    dom.window.document.exitPointerLock = ()=>{};

    const game = new dom.window.Game();
    // Initialize standard UI
    game.ui.init();

    // Mock Sound
    dom.window.soundManager = { play: ()=>{} };

    const BLOCK = dom.window.BLOCK;
    const SIGN_POST = BLOCK.SIGN_POST;
    const WALL_SIGN = BLOCK.WALL_SIGN;
    const ITEM_SIGN = BLOCK.ITEM_SIGN;

    game.world.generateChunk(0, 0);

    // 1. Test Placing Sign Post
    console.log("1. Testing Sign Post Placement & UI Trigger...");

    // Mock Physics Hit (Top face)
    game.physics.raycast = () => ({ x: 0, y: 0, z: 0, face: {x:0, y:1, z:0} }); // Hit 0,0,0 Top
    game.physics.checkCollision = () => false;

    // Set inventory
    game.player.inventory[0] = { type: ITEM_SIGN, count: 1 };
    game.player.selectedSlot = 0;
    game.player.yaw = 0;

    // Mock showSignEditor to verify it's called
    let editorShown = false;
    let editorCoords = null;
    const originalShow = game.ui.showSignEditor;
    game.ui.showSignEditor = (x, y, z) => {
        editorShown = true;
        editorCoords = {x, y, z};
        originalShow.call(game.ui, x, y, z); // Call original to update DOM
    };

    game.world.setBlock(0,0,0, BLOCK.STONE);
    game.world.setBlock(0,1,0, BLOCK.AIR);

    // Place
    game.placeBlock();

    assert.strictEqual(game.world.getBlock(0,1,0), SIGN_POST, "Should place SIGN_POST");
    assert(editorShown, "Should trigger showSignEditor");
    assert.deepStrictEqual(editorCoords, {x:0, y:1, z:0}, "Editor should get correct coords");

    const screen = dom.window.document.getElementById('sign-screen');
    assert(!screen.classList.contains('hidden'), "Sign screen should be visible");

    console.log("   Placement & UI Verified.");

    // 2. Test Saving Text
    console.log("2. Testing Saving Sign Text...");

    const input = dom.window.document.getElementById('sign-input');
    input.value = "Hello\nWorld";

    // Trigger Close
    game.ui.closeSign();

    assert(screen.classList.contains('hidden'), "Sign screen should be hidden");
    const entity = game.world.getBlockEntity(0,1,0);
    assert(entity, "Block Entity should exist");
    assert.strictEqual(entity.type, 'sign', "Entity type should be sign");
    // Handle realm differences
    assert.strictEqual(entity.text.length, 2);
    assert.strictEqual(entity.text[0], "Hello");
    assert.strictEqual(entity.text[1], "World");

    console.log("   Saving Text Verified.");

    // 3. Test Wall Sign Placement
    console.log("3. Testing Wall Sign Placement...");

    // Mock Physics Hit (Side face: North Z-1)
    game.physics.raycast = () => ({ x: 0, y: 1, z: 0, face: {x:0, y:0, z:1} }); // Hit 0,1,0 South face (Normal +Z) -> Attaches to South
    // If I hit the South face (Normal 0,0,1) of a block at 0,1,0, the new block is at 0,1,1.
    // The sign is attached to the North face of the new block? No.
    // It attaches to the South face of the target block.
    // Logic in game.js: if hit.face.z === 1 -> meta = 3 (South).

    // Reset inventory
    game.player.inventory[0] = { type: ITEM_SIGN, count: 1 };

    game.world.setBlock(0,1,1, BLOCK.AIR);

    game.placeBlock(); // Places at 0,1,1

    assert.strictEqual(game.world.getBlock(0,1,1), WALL_SIGN, "Should place WALL_SIGN");
    assert.strictEqual(game.world.getMetadata(0,1,1), 3, "Should have Meta 3 (South)");

    console.log("   Wall Sign Verified.");

    // 4. Test Rendering (Checking if it crashes or tries to access entity)
    console.log("4. Testing Rendering Logic...");

    // Force chunk visibility
    const chunk = game.world.getChunk(0,0);
    chunk.modified = true;

    // Mock player pos to see the sign
    game.player.x = 0.5; game.player.y = 1.6; game.player.z = 5;
    game.player.yaw = 0; game.player.pitch = 0;

    // Call render
    try {
        game.renderer.render();
        console.log("   Render call successful.");
    } catch (e) {
        console.error("   Render failed:", e);
        process.exit(1);
    }

    console.log("All Sign Verification Tests Passed!");
}

testSigns();
