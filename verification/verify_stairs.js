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
dom.window.AudioContext = class {
    createOscillator() {
        return {
            connect:()=>{}, start:()=>{}, stop:()=>{},
            frequency: { exponentialRampToValueAtTime: ()=>{}, setValueAtTime: ()=>{} },
            gain: { exponentialRampToValueAtTime: ()=>{} }
        };
    }
    createGain() {
        return { connect:()=>{}, gain: { value: 0, exponentialRampToValueAtTime: ()=>{}, setValueAtTime: ()=>{} } };
    }
};
dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 16);

// Add Canvas
const canvas = dom.window.document.createElement('canvas');
canvas.id = 'game-canvas';
dom.window.document.body.appendChild(canvas);

// Add UI Elements (Minimal)
const uiDiv = dom.window.document.createElement('div');
uiDiv.innerHTML = `
    <div id="hotbar"></div>
    <div id="health-bar"></div>
    <div id="hunger-bar"></div>
    <div id="damage-overlay"></div>
    <div id="chat-input" class="hidden"></div>
    <div id="chat-messages"></div>
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

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'physics.js', 'player.js', 'network.js', 'crafting.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'audio.js', 'game.js'].forEach(load);

async function testStairs() {
    console.log("Starting Stair Verification...");

    // Mock Canvas Context
    dom.window.HTMLCanvasElement.prototype.getContext = () => ({
        clearRect: ()=>{}, drawImage: ()=>{}, save: ()=>{}, restore: ()=>{},
        translate: ()=>{}, rotate: ()=>{}, scale: ()=>{}, beginPath: ()=>{},
        moveTo: ()=>{}, lineTo: ()=>{}, stroke: ()=>{}, fill: ()=>{},
        closePath: ()=>{}, fillText: ()=>{}, measureText: ()=>({width:0}),
        fillRect: ()=>{}
    });

    const game = new dom.window.Game();
    // Use real systems
    game.world = new dom.window.World();
    game.physics = new dom.window.Physics(game.world);
    game.player = new dom.window.Player(game);
    // Mock UI/Sound
    game.ui = { updateHotbarUI: ()=>{}, updateHealthUI: ()=>{} };
    game.chat = { addMessage: ()=>{} };
    dom.window.soundManager = { play: ()=>{} };

    const BLOCK = dom.window.BLOCK;
    const STAIRS = BLOCK.STAIRS_WOOD;
    game.world.generateChunk(0, 0);

    // 1. Test Placement Metadata
    console.log("1. Testing Placement Metadata...");

    // Setup Mock Physics for Raycast
    game.physics.raycast = () => ({ x: 0, y: 0, z: 0, face: {x:0, y:1, z:0} }); // Hit 0,0,0
    game.physics.checkCollision = () => false;

    // Give Stairs
    game.player.inventory[0] = { type: STAIRS, count: 64 };
    game.player.selectedSlot = 0;

    // Test East (Yaw 0) -> Meta 0
    game.player.yaw = 0;
    game.world.setBlock(0,1,0, BLOCK.AIR);
    game.placeBlock();
    assert.strictEqual(game.world.getBlock(0,1,0), STAIRS);
    assert.strictEqual(game.world.getMetadata(0,1,0), 0, "Yaw 0 should set Meta 0 (East)");

    // Test South (Yaw PI/2) -> Meta 2
    game.player.yaw = Math.PI/2;
    game.world.setBlock(0,1,0, BLOCK.AIR);
    game.placeBlock();
    assert.strictEqual(game.world.getMetadata(0,1,0), 2, "Yaw PI/2 should set Meta 2 (South)");

    console.log("   Placement Metadata Verified.");

    // 2. Test Collision (L-Shape)
    console.log("2. Testing Collision Physics...");
    // Restore real Physics
    game.physics = new dom.window.Physics(game.world);

    // Stair at 2,2,2. Meta 0 (East).
    // Bottom: 2.0-2.5.
    // Top: 2.5-3.0 at X+0.5 (2.5-3.0).
    game.world.setBlock(2,2,2, STAIRS);
    game.world.setMetadata(2,2,2, 0);

    // Box at bottom half (2.1) -> Collision
    let box = { x: 2.5, y: 2.1, z: 2.5, width: 0.1, height: 0.1 };
    assert(game.physics.checkCollision(box), "Bottom half should collide");

    // Box at top half (2.6), West side (x=2.2) -> No Collision
    box = { x: 2.2, y: 2.6, z: 2.5, width: 0.1, height: 0.1 };
    assert(!game.physics.checkCollision(box), "Top half West (empty) should NOT collide");

    // Box at top half (2.6), East side (x=2.8) -> Collision
    box = { x: 2.8, y: 2.6, z: 2.5, width: 0.1, height: 0.1 };
    assert(game.physics.checkCollision(box), "Top half East (filled) should collide");

    console.log("   Collision Physics Verified.");

    console.log("Stairs Verified.");
}

testStairs();
