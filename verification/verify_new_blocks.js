const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html><body>
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
    <div id="crosshair"></div>
</body>`, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable"
});

// Mock Globals
global.window = dom.window;
global.document = dom.window.document;
global.window.console = console;

// Mock Canvas
dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    clearRect: ()=>{},
    drawImage: ()=>{},
    fillRect: ()=>{},
    strokeRect: ()=>{},
    fillText: ()=>{},
    measureText: ()=>({width:0}),
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
    createLinearGradient: ()=>({addColorStop:()=>{}})
});

// Mock Audio
dom.window.AudioContext = class {
    createOscillator() { return { connect:()=>{}, start:()=>{}, stop:()=>{}, frequency: { setValueAtTime: ()=>{}, exponentialRampToValueAtTime: ()=>{} } }; }
    createGain() { return { connect:()=>{}, gain: { value: 0, setTargetAtTime:()=>{}, exponentialRampToValueAtTime: ()=>{} } }; }
};

// Mock LocalStorage
dom.window.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

// Mock Prompt
dom.window.prompt = () => "Tester";

const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error("Error loading " + f, e);
    }
};

// Load dependencies
['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures/Tree.js', 'structures/Cactus.js', 'structures/Well.js', 'structures.js', 'world.js', 'physics.js', 'entity.js', 'vehicle.js', 'drop.js', 'mob.js', 'player.js', 'plugin.js', 'particles.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'network.js', 'crafting.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'audio.js', 'game.js'].forEach(load);

describe('New Building Blocks Verification', () => {
    let game;
    let BLOCK;

    beforeEach(() => {
        game = new dom.window.Game();
        // Bypass full init, manually setup what we need
        game.world = new dom.window.World();
        game.physics = new dom.window.Physics(game.world);
        game.player = new dom.window.Player(game);
        // Mock UI
        game.ui = { updateHotbarUI: ()=>{}, updateHealthUI: ()=>{} };
        game.chat = { addMessage: ()=>{} };
        game.network = { sendBlockUpdate: ()=>{} }; // Mock network
        BLOCK = dom.window.BLOCK;

        // Mock soundManager
        dom.window.soundManager = { play: () => {} };

        // Ensure chunks exist
        game.world.generateChunk(0, 0);

        // Clear specific test spots (direct chunk access to be fast)
        const chunk = game.world.getChunk(0, 0);
        if (chunk) {
            // Helper to clear column
            const clear = (x, z) => {
                for(let y=10; y<=13; y++) chunk.setBlock(x, y, z, BLOCK.AIR);
            };
            clear(0,0); clear(1,0); clear(0,1); clear(1,1); // Fences
            clear(2,2); clear(3,2); clear(2,3); clear(3,3); // Gates
            clear(4,4); clear(5,4); clear(4,5); clear(5,5); // Trapdoors
            clear(6,6); clear(5,6); // Trapdoor placement (neighbor needed at 5,10,6?)
            // For placement at 6,10,6 against 5,10,6:
            // We need 5,10,6 to be solid (or whatever we click).
            // In the test we mock raycast hitting 5,10.8,6.
            // If 5,10,6 is AIR, placeBlock might fail if it checks target solidity?
            // Actually placeBlock checks if target is replaceable.

            clear(8,8); // Trapdoor collision
            clear(10,10); // Glass
            clear(12,12); // Glass collision
        }
    });

    describe('Fences', () => {
        it('should have 1.5 height collision', () => {
            const x = 0, y = 10, z = 0;
            // Clear above just in case
            game.world.setBlock(x, y+1, z, BLOCK.AIR);
            game.world.setBlock(x, y, z, BLOCK.FENCE);

            // Player box
            const box = { x: 0.5, y: 10, z: 0.5, width: 0.6, height: 1.8 };

            // 1. Check at y=10 (bottom) - Should collide
            box.y = 10;
            assert.strictEqual(game.physics.checkCollision(box), true, "Should collide at bottom");

            // 2. Check at y=10.5 (middle) - Should collide
            box.y = 10.5;
            assert.strictEqual(game.physics.checkCollision(box), true, "Should collide at middle");

            // 3. Check at y=11.2 (above 1.0 but below 1.5) - Should collide
            box.y = 11.2;
            assert.strictEqual(game.physics.checkCollision(box), true, "Should collide above 1.0 (Fence is 1.5 high)");

            // 4. Check at y=11.6 (above 1.5) - Should NOT collide
            box.y = 11.6;
            assert.strictEqual(game.physics.checkCollision(box), false, "Should NOT collide above 1.5");
        });
    });

    describe('Fence Gates', () => {
        it('should block when closed and pass when open', () => {
            const x = 2, y = 10, z = 2;
            game.world.setBlock(x, y, z, BLOCK.FENCE_GATE);
            game.world.setMetadata(x, y, z, 0); // Closed

            const box = { x: 2.5, y: 10, z: 2.5, width: 0.6, height: 1.8 };

            // Closed
            assert.strictEqual(game.physics.checkCollision(box), true, "Should collide when closed");

            // Interact to Open
            // Mock raycast to hit the gate
            // We can just call interact directly
            game.interact(x, y, z);

            // Verify Metadata changed (Bit 2 set)
            const meta = game.world.getMetadata(x, y, z);
            assert.ok(meta & 4, "Gate should be open (Bit 2 set)");

            // Open
            assert.strictEqual(game.physics.checkCollision(box), false, "Should NOT collide when open");
        });
    });

    describe('Trapdoors', () => {
        it('should toggle open/close', () => {
            const x = 4, y = 10, z = 4;
            game.world.setBlock(x, y, z, BLOCK.TRAPDOOR);
            game.world.setMetadata(x, y, z, 0); // Closed, Bottom

            // Interact
            game.interact(x, y, z);
            const meta = game.world.getMetadata(x, y, z);
            assert.ok(meta & 4, "Trapdoor should be open");
        });

        it('should place at top if hit upper half', () => {
            const x = 6, y = 10, z = 6;

            // We need to simulate placing against a wall to get the hit coordinates right.
            // Wall at x=5, y=10, z=6. We click East face.
            // Hit x=5.9, y=10.8, z=6.5. Face +X.
            // New block at 6, 10, 6.

            game.physics.raycast = () => ({
                x: 5, y: 10, z: 6,
                face: { x: 1, y: 0, z: 0 },
                point: { x: 5.9, y: 10.8, z: 6.5 }
            });

            game.player.inventory[game.player.selectedSlot] = { type: BLOCK.TRAPDOOR, count: 1 };

            // Mock collision check to allow placement
            game.physics.checkCollision = () => false;

            game.placeBlock();

            // Check block
            assert.strictEqual(game.world.getBlock(6, 10, 6), BLOCK.TRAPDOOR, "Trapdoor placed");

            // Check metadata
            const meta = game.world.getMetadata(6, 10, 6);
            assert.ok(meta & 8, "Trapdoor should be Top (Bit 3 set) because hit.y (10.8) % 1 > 0.5");
        });

        it('should collide when closed', () => {
             const x = 8, y = 10, z = 8;
             game.world.setBlock(x, y, z, BLOCK.TRAPDOOR);
             game.world.setMetadata(x, y, z, 0); // Closed, Bottom (Slab at bottom)

             // Box at bottom
             const box = { x: 8.5, y: 10.1, z: 8.5, width: 0.6, height: 1.8 };
             assert.strictEqual(game.physics.checkCollision(box), true, "Should collide with closed bottom trapdoor");

             // Open it
             game.world.setMetadata(x, y, z, 4); // Open
             assert.strictEqual(game.physics.checkCollision(box), false, "Should pass through open trapdoor");
        });
    });

    describe('Glass Panes', () => {
         it('should place correctly', () => {
             const x = 10, y = 10, z = 10;
             game.world.setBlock(x, y, z, BLOCK.GLASS_PANE);
             assert.strictEqual(game.world.getBlock(x,y,z), BLOCK.GLASS_PANE);
         });

         it('should have thin collision', () => {
             const x = 12, y = 10, z = 12;
             game.world.setBlock(x, y, z, BLOCK.GLASS_PANE);

             // Center post collision only (0.375 to 0.625)
             // Center is 12.5.
             // 12.5 - 0.125 = 12.375.
             // 12.5 + 0.125 = 12.625.

             // Check hitting center
             const boxHit = { x: 12.5, y: 10, z: 12.5, width: 0.1, height: 1.8 };
             assert.strictEqual(game.physics.checkCollision(boxHit), true, "Should collide with post");

             // Check hitting corner (should miss)
             const boxMiss = { x: 12.1, y: 10, z: 12.1, width: 0.1, height: 1.8 };
             assert.strictEqual(game.physics.checkCollision(boxMiss), false, "Should NOT collide with corner");
         });
    });
});
