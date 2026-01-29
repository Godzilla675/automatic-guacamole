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
<div id="inventory-screen" class="hidden"></div>
<div id="pause-screen" class="hidden"></div>
<div id="debug-info" class="hidden"></div>
<div id="crosshair"></div>
<div id="loading-screen"></div>
<div id="menu-screen"></div>
<button id="start-game"></button>
<button id="resume-game"></button>
<button id="return-menu"></button>
<button id="close-inventory"></button>
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
dom.window.alert = console.log;

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

// Mock AudioContext
dom.window.AudioContext = class {
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
    createBiquadFilter() { return { connect: () => {} }; }
    resume() {}
    get state() { return 'running'; }
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
    drawImage: () => {}
});
canvas.requestPointerLock = () => {};
dom.window.document.exitPointerLock = () => {};

// Mock Perlin
dom.window.perlin = { noise: () => 0.5 };

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

// Mock Prompt
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

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'drop.js', 'crafting.js', 'player.js', 'mob.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'game.js'].forEach(load);

async function runTests() {
    console.log("=== Starting All New Features Verification ===\n");

    const game = new dom.window.Game();
    game.world.renderDistance = 1;
    game.gameLoop = () => {};
    // Init game (mocked)
    game.world = new dom.window.World();
    game.physics = new dom.window.Physics(game.world);
    game.player = new dom.window.Player(game);
    game.crafting = new dom.window.CraftingSystem(game);
    game.ui = { updateHotbarUI: ()=>{}, updateHealthUI: ()=>{} };
    game.chat = { addMessage: ()=>{} };

    const BLOCK = dom.window.BLOCK;
    const TOOLS = dom.window.TOOLS;
    game.world.generateChunk(0, 0);

    let passed = 0;
    let failed = 0;

    function test(name, fn) {
        try {
            console.log(`Test: ${name}`);
            fn();
            console.log(`  PASSED`);
            passed++;
        } catch (e) {
            console.error(`  FAILED: ${e.message}`);
            failed++;
        }
    }

    // --- 1. Stairs ---
    test('Stairs Placement & Metadata', () => {
        const x=0, y=10, z=0;
        game.world.setBlock(x,y,z, BLOCK.AIR);
        game.player.inventory[0] = { type: BLOCK.STAIRS_WOOD, count: 64 };
        game.player.selectedSlot = 0;

        // Mock Raycast to x,y,z
        const originalRaycast = game.physics.raycast;
        game.physics.raycast = () => ({ x: x, y: y-1, z: z, face: {x:0, y:1, z:0} }); // Hit block below

        // Yaw 0 -> Meta 0 (East)
        game.player.yaw = 0;
        game.placeBlock();
        let meta = game.world.getMetadata(x,y,z);
        assert.strictEqual(meta, 0, "Yaw 0 should set Meta 0");

        // Yaw PI/2 -> Meta 2 (South)
        game.world.setBlock(x,y,z, BLOCK.AIR);
        game.player.inventory[0] = { type: BLOCK.STAIRS_WOOD, count: 64 };
        game.player.yaw = Math.PI/2;
        game.placeBlock();
        meta = game.world.getMetadata(x,y,z);
        assert.strictEqual(meta, 2, "Yaw PI/2 should set Meta 2");

        game.physics.raycast = originalRaycast;
    });

    test('Stairs Collision (L-Shape)', () => {
        // Assume Meta 0 (East)
        // Bottom Slab: y 0-0.5. Top: y 0.5-1.0 at x+0.5
        const x=2, y=10, z=2;
        game.world.setBlock(x,y,z, BLOCK.STAIRS_WOOD);
        game.world.setMetadata(x,y,z, 0);

        // Check Bottom
        assert(game.physics.checkCollision({x:2.5, y:10.2, z:2.5, width:0.1, height:0.1}), "Should collide bottom slab");

        // Check Top-West (Empty)
        assert(!game.physics.checkCollision({x:2.2, y:10.7, z:2.5, width:0.1, height:0.1}), "Should NOT collide top-west (empty)");

        // Check Top-East (Filled)
        assert(game.physics.checkCollision({x:2.8, y:10.7, z:2.5, width:0.1, height:0.1}), "Should collide top-east (filled)");
    });

    // --- 2. Doors ---
    test('Doors Placement & Interaction', () => {
        const x=4, y=10, z=4;
        game.world.setBlock(x,y,z, BLOCK.AIR);
        game.world.setBlock(x,y+1,z, BLOCK.AIR);
        game.player.inventory[0] = { type: BLOCK.DOOR_WOOD_BOTTOM, count: 1 };

        // Place door
        const originalRaycast = game.physics.raycast;
        game.physics.raycast = () => ({ x: x, y: y-1, z: z, face: {x:0, y:1, z:0} });
        game.placeBlock();

        assert.strictEqual(game.world.getBlock(x,y,z), BLOCK.DOOR_WOOD_BOTTOM, "Bottom door placed");
        assert.strictEqual(game.world.getBlock(x,y+1,z), BLOCK.DOOR_WOOD_TOP, "Top door placed");

        // Initial state: Closed (Bit 2 = 0)
        let meta = game.world.getMetadata(x,y,z);
        assert.strictEqual(meta & 4, 0, "Door should be closed initially");

        // Interact (Open)
        // Call interact directly with coords
        game.interact(x, y, z);

        meta = game.world.getMetadata(x,y,z);
        assert.strictEqual(meta & 4, 4, "Door should be open after interact");

        // Top part should also update
        let topMeta = game.world.getMetadata(x,y+1,z);
        assert.strictEqual(topMeta & 4, 4, "Top door should also be open");

        game.physics.raycast = originalRaycast;
    });

    test('Doors Collision', () => {
        const x=4, y=10, z=4;
        // Closed door (Meta 0 -> West Side)
        // Door is at X: 4.0 to 4.1875
        game.world.setBlock(x,y,z, BLOCK.DOOR_WOOD_BOTTOM);
        game.world.setMetadata(x,y,z, 0); // Closed, Orient 0 (West Side)

        // 1. Should collide at West edge
        assert(game.physics.checkCollision({x:4.1, y:10.5, z:4.5, width:0.1, height:1}), "Closed door should collide at edge");

        // 2. Should NOT collide in middle (Walk through empty space of block)
        assert(!game.physics.checkCollision({x:4.5, y:10.5, z:4.5, width:0.1, height:1}), "Closed door should NOT collide in empty space");

        // Open door
        game.world.setMetadata(x,y,z, 4); // Open (Bit 2)
        // Should NOT collide (Bit 2 set -> false)
        assert(!game.physics.checkCollision({x:4.1, y:10.5, z:4.5, width:0.1, height:1}), "Open door should NOT collide");
    });

    // --- 3. Slabs ---
    test('Slabs Collision', () => {
        const x=6, y=10, z=6;
        game.world.setBlock(x,y,z, BLOCK.SLAB_STONE);

        // Bottom half (10.0 - 10.5)
        assert(game.physics.checkCollision({x:6.5, y:10.2, z:6.5, width:0.1, height:0.1}), "Slab bottom should collide");

        // Top half (10.5 - 11.0)
        assert(!game.physics.checkCollision({x:6.5, y:10.7, z:6.5, width:0.1, height:0.1}), "Slab top should NOT collide");
    });

    // --- 4. Tool Repair ---
    test('Tool Repair Crafting', () => {
        const PICKAXE = BLOCK.PICKAXE_WOOD;
        const maxDurability = TOOLS[PICKAXE].durability; // 60

        game.player.inventory[0] = { type: PICKAXE, count: 1, durability: 10 };
        game.player.inventory[1] = { type: PICKAXE, count: 1, durability: 10 };

        game.crafting.initUI();

        const repairRecipeIndex = game.crafting.recipes.findIndex(r => r.isRepair && r.result.type === PICKAXE);
        assert(repairRecipeIndex !== -1, "Repair recipe should exist");

        // Perform craft
        game.crafting.craft(repairRecipeIndex);

        // Verify result
        const result = game.player.inventory[0];
        assert.ok(result, "Result item should exist in slot 0");
        assert.strictEqual(result.type, PICKAXE, "Result should be Pickaxe");
        assert.strictEqual(result.durability, 23, "Durability should be sum + 5%");

        assert.strictEqual(game.player.inventory[1], null, "Second tool should be consumed");
    });

    // --- 5. Water Flow ---
    test('Water Infinite Source', () => {
        const x=10, y=10, z=10;
        // Setup 2 sources with gap
        // S A S
        game.world.setBlock(x,y,z, BLOCK.WATER); game.world.setMetadata(x,y,z, 8); // Source
        game.world.setBlock(x+2,y,z, BLOCK.WATER); game.world.setMetadata(x+2,y,z, 8); // Source
        game.world.setBlock(x+1,y,z, BLOCK.AIR);
        game.world.setBlock(x+1,y-1,z, BLOCK.STONE); // Floor

        // Add to active fluids
        game.world.activeFluids.add(`${x},${y},${z}`);
        game.world.activeFluids.add(`${x+2},${y},${z}`);

        // Tick 1: Flow into middle
        game.world.updateFluids();
        assert.strictEqual(game.world.getBlock(x+1,y,z), BLOCK.WATER, "Middle should fill with water");

        // Tick 2: Middle becomes source
        game.world.updateFluids();
        assert.strictEqual(game.world.getMetadata(x+1,y,z), 8, "Middle should become source");
    });

    // --- 6. Spruce Trees (Snow Biome) ---
    test('Spruce Tree Generation', () => {
        // Force generate a chunk in Snow Biome
        // Mock BiomeManager to return SNOW
        const originalGetBiome = game.world.biomeManager.getBiome;
        game.world.biomeManager.getBiome = () => ({
            name: 'Snow',
            topBlock: BLOCK.SNOW,
            underBlock: BLOCK.DIRT,
            heightOffset: 5,
            treeChance: 1.0, // Force tree
            snow: true
        });

        // Create new chunk at 100, 100
        const cx=100, cz=100;
        game.world.generateChunk(cx, cz);
        const chunk = game.world.getChunk(cx, cz);

        // Scan for trees
        let foundSpruceWood = false;
        let foundSpruceLeaves = false;

        const size = 16;
        for(let i=0; i<chunk.blocks.length; i++) {
            const b = chunk.blocks[i];
            if (b === BLOCK.SPRUCE_WOOD) foundSpruceWood = true;
            if (b === BLOCK.SPRUCE_LEAVES) foundSpruceLeaves = true;
        }

        assert(foundSpruceWood, "Should generate Spruce Wood in Snow Biome");
        assert(foundSpruceLeaves, "Should generate Spruce Leaves in Snow Biome");

        game.world.biomeManager.getBiome = originalGetBiome;
    });

    console.log(`\nResults: ${passed} Passed, ${failed} Failed.`);
    if (failed > 0) process.exit(1);
}

runTests();
