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
                setValueAtTime: ()=>{}
            },
            gain: {
                exponentialRampToValueAtTime: ()=>{}
            }
        };
    }
    createGain() {
        return {
            connect:()=>{},
            gain: {
                value: 0,
                exponentialRampToValueAtTime: ()=>{},
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
['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures/Tree.js', 'structures/Cactus.js', 'structures/Well.js', 'structures.js', 'world.js', 'physics.js', 'entity.js', 'vehicle.js', 'mob.js', 'drop.js', 'particles.js', 'plugin.js', 'minimap.js', 'tutorial.js', 'achievements.js', 'player.js', 'network.js', 'crafting.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'audio.js', 'game.js'].forEach(load);

async function testRecentFeatures() {
    console.log("Starting Verification of Recent Features...");

    // Mock Canvas
    dom.window.HTMLCanvasElement.prototype.getContext = () => ({
        clearRect: ()=>{},
        drawImage: ()=>{},
        save: ()=>{},
        restore: ()=>{},
        translate: ()=>{},
        rotate: ()=>{},
        scale: ()=>{},
        beginPath: ()=>{},
        moveTo: ()=>{},
        lineTo: ()=>{},
        stroke: ()=>{},
        fill: ()=>{},
        closePath: ()=>{},
        fillText: ()=>{},
        measureText: ()=>({width:0}),
        setTransform: ()=>{},
    });

    // Create Game
    const game = new dom.window.Game();
    // Bypass full init to avoid rendering loop issues, just setup what we need
    game.world = new dom.window.World();
    game.physics = new dom.window.Physics(game.world);
    game.player = new dom.window.Player(game);
    // Mock UI
    game.ui = { updateHotbarUI: ()=>{}, updateHealthUI: ()=>{} };
    game.chat = { addMessage: ()=>{} };

    // 1. Verify Blocks Existence
    console.log("1. Verifying Concrete and Wool Blocks...");
    const BLOCK = dom.window.BLOCK;
    assert(BLOCK.CONCRETE_WHITE === 30, "Concrete White ID mismatch");
    assert(BLOCK.CONCRETE_BLACK === 45, "Concrete Black ID mismatch");
    assert(BLOCK.WOOL_WHITE === 50, "Wool White ID mismatch");
    assert(BLOCK.WOOL_BLACK === 65, "Wool Black ID mismatch");

    const BLOCKS = dom.window.BLOCKS;
    assert(BLOCKS[BLOCK.CONCRETE_WHITE], "Concrete White def missing");
    assert(BLOCKS[BLOCK.WOOL_RED], "Wool Red def missing");
    console.log("   Blocks Verified.");

    // 2. Verify Inventory Consumption
    console.log("2. Verifying Inventory Consumption...");
    // Setup player with 1 item in slot 0
    game.player.inventory[0] = { type: BLOCK.DIRT, count: 1 };
    game.player.selectedSlot = 0;

    // Mock raycast to hit something
    game.physics.raycast = () => ({ x: 0, y: 0, z: 0, face: {x:0, y:1, z:0} }); // Hit 0,0,0 top face
    game.physics.checkCollision = () => false; // No player collision
    game.world.generateChunk(0,0); // Ensure chunk exists
    game.world.setBlock(0,0,0, BLOCK.STONE); // Base block
    game.world.setBlock(0,1,0, BLOCK.AIR); // Target block

    // Place block
    game.placeBlock();

    // Verify
    assert.strictEqual(game.world.getBlock(0,1,0), BLOCK.DIRT, "Block should be placed");
    assert.strictEqual(game.player.inventory[0], null, "Inventory slot should be null after consuming last item");

    // Test with 2 items
    game.player.inventory[0] = { type: BLOCK.DIRT, count: 2 };
    game.world.setBlock(0,1,0, BLOCK.AIR);
    game.placeBlock();
    assert.strictEqual(game.world.getBlock(0,1,0), BLOCK.DIRT, "Block placed");
    assert.strictEqual(game.player.inventory[0].count, 1, "Count should decrease to 1");

    console.log("   Inventory Consumption Verified.");

    // 3. Verify Cactus Damage
    console.log("3. Verifying Cactus Damage...");
    // Reset player
    game.player.x = 10.5;
    game.player.y = 2;
    game.player.z = 10.5;
    game.player.health = 20;
    game.player.lastDamageTime = 0;

    // Spy on takeDamage
    const origTakeDamage = game.player.takeDamage;
    game.player.takeDamage = function(amount) {
        console.log(`Player.takeDamage called with ${amount}. Current Health: ${this.health}`);
        origTakeDamage.call(this, amount);
        console.log(`New Health: ${this.health}`);
    };

    // Patch Player.update to debug loop
    const origUpdate = game.player.update;
    game.player.update = function(dt) {
        // We can't easily patch inside the function, but we can copy the relevant logic here to verify
        // or just rely on console logs from getCollidingBlocks.
        // Let's check BLOCK.CACTUS value
        console.log("BLOCK.CACTUS is:", BLOCK.CACTUS);

        // Call original
        origUpdate.call(this, dt);
    };

    // Also patch Physics to log return values better
    // (Already done)

    // Place Cactus at 11, 2, 10
    game.world.setBlock(11, 2, 10, BLOCK.CACTUS);

    // Move player close to cactus (collision border)
    // Cactus at x=11. MinX = 11, MaxX = 12.
    // Player width 0.6. Radius 0.3.
    // Player at 10.5. MaxX = 10.8.
    // Move player to 10.7. MaxX = 11.0. Touching.

    game.player.x = 10.7;

    // Mock Physics to behave normally
    game.physics.checkCollision = (box) => {
        // Simple AABB check against cactus
        // Cactus box: 11,2,10 size 1,1,1
        const cx = 11, cy = 2, cz = 10;
        const bMinX = cx, bMaxX = cx+1;

        const pMinX = box.x - box.width/2;
        const pMaxX = box.x + box.width/2;

        // if overlaps
        if (pMaxX > bMinX) return true;
        return false;
    };

    // Update player to trigger logic
    // We expect cactus damage logic to trigger if we touch it.
    // However, the current logic relies on `getCollidingBlocks`.
    // Let's see if `getCollidingBlocks` picks it up.

    // Need to restore real `getCollidingBlocks` or ensure mock uses it?
    // We loaded `physics.js` so `game.physics` is real instance.
    // Restore checkCollision to default behavior using `Physics` class logic?
    // Wait, I overwrote `checkCollision` in test 2. I should restore it.
    game.physics = new dom.window.Physics(game.world);

    // Place Cactus
    game.world.setBlock(11, 2, 10, BLOCK.CACTUS);
    // Clear space above and around to prevent suffocation/physics ejection
    for(let y=2; y<=5; y++) {
        for(let x=10; x<=12; x++) {
             for(let z=9; z<=11; z++) {
                 if (x===11 && y===2 && z===10) continue; // Don't clear cactus
                 game.world.setBlock(x, y, z, BLOCK.AIR);
             }
        }
    }

    // Debug helper
    const origGetCollidingBlocks = game.physics.getCollidingBlocks;
    game.physics.getCollidingBlocks = function(box) {
        console.log("getCollidingBlocks called with box Y:", box.y, "Height:", box.height);
        const blocks = origGetCollidingBlocks.call(this, box);
        console.log("getCollidingBlocks returned:", blocks.length, "blocks");
        blocks.forEach(b => console.log(" - Block:", b.x, b.y, b.z, b.type));
        return blocks;
    };

    // Player at 10.7 (touching 11.0 boundary?)
    // 10.7 + 0.3 = 11.0.
    // getCollidingBlocks checks Math.floor range.
    // box.minX = 10.4, box.maxX = 11.0.
    // loops x from 10 to 11.
    // So it checks block at 10 (Air) and 11 (Cactus).
    // So it SHOULD find Cactus.

    game.player.x = 10.7;
    game.player.update(0.1);

    if (game.player.health < 20) {
        console.log("   Cactus damage applied correctly (touching boundary).");
    } else {
        console.warn("   Cactus damage FAILED at boundary.");

        // Try inside
        console.log("   Trying inside cactus...");
        game.player.x = 11.5;
        game.player.health = 20;
        game.player.lastDamageTime = 0;
        game.player.update(0.1);
         if (game.player.health < 20) {
            console.log("   Cactus damage applied correctly (inside).");
        } else {
             console.error("   Cactus damage FAILED even inside.");
             assert.fail("Cactus damage not working");
        }
    }

    console.log("Verification Complete.");
}

testRecentFeatures();
