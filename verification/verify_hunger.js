const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html><body></body>`, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost/"
});

// Add UI Elements
const uiDiv = dom.window.document.createElement('div');
uiDiv.innerHTML = `
    <canvas id="game-canvas"></canvas>
    <div id="chat-container"></div>
    <div id="chat-messages"></div>
    <input id="chat-input" class="hidden">
    <div id="hotbar"></div>
    <div id="health-bar"></div>
    <div id="hunger-bar"></div>
    <div id="damage-overlay"></div>
    <div id="chest-screen" class="hidden"><div id="chest-grid"></div></div>
    <div id="inventory-screen" class="hidden"><div id="inventory-grid"></div></div>
    <div id="furnace-screen" class="hidden">
        <div id="furnace-input"></div>
        <div id="furnace-fuel"></div>
        <div id="furnace-output"></div>
        <div id="furnace-progress"></div>
        <div id="furnace-burn"></div>
    </div>
    <div id="settings-screen" class="hidden"></div>
    <div id="pause-screen" class="hidden"></div>
    <div id="recipe-book-screen" class="hidden"><div id="recipe-list"></div></div>
    <div id="crafting-screen" class="hidden"></div>
`;
dom.window.document.body.appendChild(uiDiv);

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
dom.window.prompt = () => "Tester";
dom.window.AudioContext = class {
    resume() {}
    createPanner() {
        return {
            connect: ()=>{},
            setPosition: ()=>{},
            positionX: { value: 0 },
            positionY: { value: 0 },
            positionZ: { value: 0 },
            orientationX: { value: 0 },
            orientationY: { value: 0 },
            orientationZ: { value: 0 }
        };
    }
    createOscillator() {
        return {
            connect:()=>{}, start:()=>{}, stop:()=>{},
            frequency: {
                exponentialRampToValueAtTime: ()=>{},
                linearRampToValueAtTime: ()=>{},
                setValueAtTime: ()=>{}
            },
            gain: {
                exponentialRampToValueAtTime: ()=>{},
                linearRampToValueAtTime: ()=>{}
            }
        };
    }
    createGain() {
        return {
            connect:()=>{},
            gain: {
                value: 0,
                exponentialRampToValueAtTime: ()=>{},
                linearRampToValueAtTime: ()=>{},
                setValueAtTime: ()=>{}
            }
        };
    }
};
dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 16);

const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error("Error loading " + f, e);
    }
};

// Load dependencies
['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'physics.js', 'entity.js', 'vehicle.js', 'mob.js', 'drop.js', 'particles.js', 'plugin.js', 'minimap.js', 'tutorial.js', 'achievements.js', 'player.js', 'network.js', 'crafting.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'audio.js', 'game.js'].forEach(load);

async function testHunger() {
    console.log("Starting Verification of Hunger System...");

    // Create Game
    const game = new dom.window.Game();
    // Bypass full init
    game.world = new dom.window.World();
    game.physics = new dom.window.Physics(game.world);
    game.player = new dom.window.Player(game);
    // Mock UI
    game.ui = { updateHotbarUI: ()=>{}, updateHealthUI: ()=>{} };
    game.chat = { addMessage: (msg)=>console.log("Chat:", msg) };
    // Mock Controls
    game.controls = { forward: false, backward: false, left: false, right: false, jump: false, sneak: false, sprint: false };

    // Create Platform at Spawn (8, 40, 8) so player doesn't fall
    game.world.generateChunk(8, 8); // Chunk coordinates? No, generateChunk takes world coords or chunk coords?
    // world.js generateChunk(cx, cz)
    // 8,8 is in chunk 0,0 (if chunk size 16).
    game.world.generateChunk(0, 0);
    for(let x=7; x<=9; x++) {
        for(let z=7; z<=9; z++) {
            game.world.setBlock(x, 39, z, dom.window.BLOCK.STONE);
        }
    }
    // Set player to onGround manually just in case
    game.player.x = 8;
    game.player.y = 40;
    game.player.z = 8;
    game.player.onGround = true;

    // Helper to simulate time
    const simulateTime = (seconds) => {
        const step = 0.1;
        for(let t=0; t<seconds; t+=step) {
            game.player.update(step);
            // Keep player on platform
            game.player.x = 8;
            game.player.z = 8;
            game.player.y = 40;
            game.player.vx = 0;
            game.player.vz = 0;
            game.player.vy = 0; // Prevent jumping/falling
        }
    };

    // 1. Passive Decay
    console.log("Test 1: Passive Hunger Decay");
    game.player.hunger = 20;
    game.player.hungerTimer = 0;

    // Simulate 31 seconds
    simulateTime(31);

    assert.strictEqual(game.player.hunger, 19, "Hunger should decay by 1 after 30s");
    console.log("   Passed: Passive Decay");

    // 2. Sprinting Decay
    console.log("Test 2: Sprinting Hunger Decay");
    game.player.hunger = 20;
    game.player.hungerTimer = 0;
    game.controls.forward = true;
    game.controls.sprint = true;
    game.player.onGround = true; // Required for sprint

    // Simulate 16 seconds (should be > 30s effective due to 2x multiplier)
    // 16 * 2 = 32s > 30s
    simulateTime(16);

    assert.strictEqual(game.player.hunger, 19, "Hunger should decay faster when sprinting");
    game.controls.sprint = false;
    game.controls.forward = false;
    console.log("   Passed: Sprinting Decay");

    // 3. Health Regeneration
    console.log("Test 3: Health Regeneration");
    game.player.hunger = 20;
    game.player.health = 10;
    game.player.regenTimer = 0;

    // Regen every 4 seconds
    simulateTime(4.1);

    assert.strictEqual(game.player.health, 11, "Health should regen by 1 when hunger is full");
    console.log("   Passed: Regeneration");

    // 4. Starvation
    console.log("Test 4: Starvation");
    game.player.hunger = 0;
    game.player.health = 10;
    game.player.regenTimer = 0;
    game.player.lastDamageTime = 0; // Reset invulnerability

    // Starve every 4 seconds
    simulateTime(4.1);

    assert.strictEqual(game.player.health, 9, "Health should decrease by 1 when starving");
    console.log("   Passed: Starvation");

    // 5. Sprint Prevention
    console.log("Test 5: Sprint Prevention at Low Hunger");
    game.player.hunger = 6;
    game.player.sprinting = false;
    game.controls.forward = true;
    game.controls.sprint = true;
    game.player.onGround = true;

    game.player.update(0.1);

    assert.strictEqual(game.player.sprinting, false, "Should not sprint if hunger <= 6");
    console.log("   Passed: Sprint Prevention");

    // 6. Eating
    console.log("Test 6: Eating Food");
    game.player.hunger = 10;
    // Define a food item if not exists (Assume APPLE or similar exists)
    const BLOCK = dom.window.BLOCK;
    // Check if food defined
    // We need to check BLOCKS definitions.
    // Let's manually define a food item if needed for test, or pick one that likely exists.
    // Based on memory: "Carrots, Potatoes, Melons, Pumpkins" were added.

    // Let's assume BLOCK.CARROT_ITEM or similar. Or we can inspect BLOCKS.
    // But verify_recent_features had BLOCKS loaded.

    // Let's try to mock a food item in BLOCKS to be safe.
    dom.window.BLOCKS[999] = { food: 4 };

    const success = game.player.eat(999);
    assert.strictEqual(success, true, "Eat should return true");
    assert.strictEqual(game.player.hunger, 14, "Hunger should increase by food value");

    console.log("   Passed: Eating");

    console.log("All Hunger Tests Passed!");
}

testHunger().catch(e => {
    console.error(e);
    process.exit(1);
});
