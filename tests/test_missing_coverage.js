const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="game-canvas"></canvas></body></html>', {
    url: "http://localhost",
    pretendToBeVisual: true
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Image = dom.window.Image;

// Mocks
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};
global.alert = () => {};
global.prompt = () => "TestPlayer";
global.AudioContext = class {
    createGain() { return { connect: () => {}, gain: { value: 0, linearRampToValueAtTime: () => {} } }; }
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0, exponentialRampToValueAtTime: () => {} } }; }
    destination = {};
    currentTime = 0;
};
global.WebSocket = class {
    constructor() {}
    send() {}
    close() {}
};

// Helper to load scripts
function loadScript(filename) {
    const content = fs.readFileSync(path.join(__dirname, '../js', filename), 'utf8');
    eval(content);
}

// Load Modules
loadScript('math.js');
loadScript('blocks.js');
global.BLOCK = window.BLOCK;
global.BLOCKS = window.BLOCKS;
global.TOOLS = window.TOOLS;

loadScript('chunk.js');
global.Chunk = window.Chunk;

loadScript('biome.js');
global.BiomeManager = window.BiomeManager;

loadScript('structures.js');
global.StructureManager = window.StructureManager;

loadScript('world.js');
global.World = window.World;

loadScript('physics.js');
global.Physics = window.Physics;

loadScript('player.js');
global.Player = window.Player;

loadScript('network.js');
global.NetworkManager = window.NetworkManager;

loadScript('crafting.js');
global.CraftingSystem = window.CraftingSystem;

loadScript('drop.js');
global.Drop = window.Drop;

loadScript('mob.js');
global.Mob = window.Mob;
global.MOB_TYPE = window.MOB_TYPE;

loadScript('ui.js');
global.UIManager = window.UIManager;

loadScript('chat.js');
global.ChatManager = window.ChatManager;

loadScript('input.js');
global.InputManager = window.InputManager;

loadScript('renderer.js');
global.Renderer = window.Renderer;

loadScript('game.js');
global.Game = window.Game;

describe('Verification of Missing Coverage', function() {
    let game;
    let world;

    beforeEach(function() {
        // Setup DOM elements required by Managers
        const ids = [
            'chat-input', 'chat-messages',
            'inventory-grid', 'crafting-recipes', 'recipe-list',
            'furnace-screen', 'chest-screen',
            'settings-screen', 'volume-slider',
            'mobile-controls', 'crosshair', 'hud', 'pause-screen',
            'health-bar', 'hunger-bar', 'fps', 'position', 'block-count', 'game-time', 'hotbar',
            'furnace-input', 'furnace-fuel', 'furnace-output', 'furnace-progress', 'furnace-burn',
            'chest-grid'
        ];
        ids.forEach(id => {
            if (!document.getElementById(id)) {
                const el = document.createElement('div');
                el.id = id;
                document.body.appendChild(el);
            }
        });

        // Ensure inputs are inputs
        const inputs = ['chat-input', 'volume-slider'];
        inputs.forEach(id => {
             const el = document.getElementById(id);
             if (el.tagName !== 'INPUT') {
                 const inp = document.createElement('input');
                 inp.id = id;
                 document.body.replaceChild(inp, el);
             }
        });

        // Reset global mocks
        window.soundManager = {
            play: () => {},
            updateAmbience: () => {}
        };

        // Setup Game instance without running init() fully to avoid DOM issues
        game = new window.Game();
        world = game.world;

        // Mock UI
        game.updateHotbarUI = () => {};
        game.ui = {
             updateHotbarUI: () => {},
             updateHealthUI: () => {}
        };

        // Mock Network
        game.network = {
            sendBlockUpdate: () => {},
            sendPosition: () => {}
        };
    });

    it('should place stairs with correct orientation based on player yaw', function() {
        const testCases = [
            { yaw: 0, expectedMeta: 0 },          // East
            { yaw: Math.PI / 2, expectedMeta: 2 }, // South (yaw 90 deg)
            { yaw: Math.PI, expectedMeta: 1 },     // West
            { yaw: 3 * Math.PI / 2, expectedMeta: 3 } // North (yaw 270 deg)
        ];

        // Ensure chunk exists
        world.generateChunk(0, 0);
        // Place a base block to click on
        world.setBlock(10, 10, 10, window.BLOCK.STONE);

        for (const test of testCases) {
            game.player.yaw = test.yaw;
            game.player.pitch = 0;

            // Set inventory slot to stairs
            game.player.inventory[game.player.selectedSlot] = { type: window.BLOCK.STAIRS_WOOD, count: 64 };

            // Mock Physics Raycast to hit the top of the stone block
            // We need to override the method on the physics instance
            const originalRaycast = game.physics.raycast;
            game.physics.raycast = () => {
                return {
                    x: 10, y: 10, z: 10,
                    face: { x: 0, y: 1, z: 0 }, // Top face
                    type: window.BLOCK.STONE
                };
            };

            // Act
            game.placeBlock();

            // Check
            const block = world.getBlock(10, 11, 10);
            const meta = world.getMetadata(10, 11, 10);

            // Cleanup for next iteration
            world.setBlock(10, 11, 10, window.BLOCK.AIR);
            game.physics.raycast = originalRaycast; // Restore

            assert.strictEqual(block, window.BLOCK.STAIRS_WOOD, `Should place stairs at yaw ${test.yaw}`);
            assert.strictEqual(meta, test.expectedMeta, `Meta mismatch at yaw ${test.yaw}. Got ${meta}, Expected ${test.expectedMeta}`);
        }
    });

    it('should simulate water flow correctly', function() {
        this.timeout(5000);
        // Setup simple world
        world.chunks.clear();
        world.activeFluids.clear();

        // Manually create a flat chunk to avoid expensive setBlock calls
        const chunk = new window.Chunk(0, 0);
        // Floor
        for(let x=0; x<16; x++) {
            for(let z=0; z<16; z++) {
                chunk.setBlock(x, 0, z, window.BLOCK.STONE);
            }
        }
        world.chunks.set('0,0', chunk);

        // Test 1: Basic Spread
        // Place Source
        world.setBlock(5, 1, 5, window.BLOCK.WATER);
        world.setMetadata(5, 1, 5, 8); // Source
        world.activeFluids.add('5,1,5');

        // Tick
        world.updateFluids();

        // Check neighbor
        const neighbor = world.getBlock(5, 1, 6);
        const neighborMeta = world.getMetadata(5, 1, 6);

        assert.strictEqual(neighbor, window.BLOCK.WATER, "Water should spread to neighbor");
        assert.strictEqual(neighborMeta, 7, "Spreading water should have level 7 (decayed from 8)");

        // Test 2: Infinite Source
        // Place two sources with 1 gap
        world.setBlock(10, 1, 10, window.BLOCK.WATER);
        world.setMetadata(10, 1, 10, 8);

        world.setBlock(12, 1, 10, window.BLOCK.WATER);
        world.setMetadata(12, 1, 10, 8);

        // Put flowing water in middle (as if they just flowed there)
        world.setBlock(11, 1, 10, window.BLOCK.WATER);
        world.setMetadata(11, 1, 10, 7);

        world.activeFluids.add('11,1,10'); // Activate middle block

        // Tick
        world.updateFluids();

        const middleMeta = world.getMetadata(11, 1, 10);
        assert.strictEqual(middleMeta, 8, "Middle block should become a source (8) due to 2 neighbors");
    });

    it('should calculate mining speeds correctly (Tool > Hand)', function() {
        // Setup
        const blockType = window.BLOCK.STONE;
        world.generateChunk(0, 0);
        world.setBlock(5, 5, 5, blockType);

        // Mock Raycast to hit this block
        const originalRaycast = game.physics.raycast;
        game.physics.raycast = () => {
            return { x: 5, y: 5, z: 5, type: blockType };
        };

        // 1. With Diamond Pickaxe
        game.player.inventory[game.player.selectedSlot] = { type: window.BLOCK.PICKAXE_DIAMOND, count: 1 };
        game.startAction(true); // Left click
        const limitTool = game.breaking.limit;
        game.stopAction();

        // 2. With Hand (Empty)
        game.player.inventory[game.player.selectedSlot] = null;
        game.startAction(true);
        const limitHand = game.breaking.limit;
        game.stopAction();

        game.physics.raycast = originalRaycast;

        assert.ok(limitTool < limitHand, `Diamond Pickaxe (${limitTool}) should be faster than Hand (${limitHand})`);
    });

    it('should generate structures in correct biomes', function() {
        // Mock BiomeManager to control generation
        // We need to replace the biomeManager instance in world
        const dummyBM = new window.BiomeManager();

        // 1. Desert -> Cactus
        // Boost chance to ensure generation
        const desert = Object.assign({}, dummyBM.biomes.DESERT);
        desert.cactusChance = 1.0;

        world.biomeManager.getBiome = () => desert; // Force Desert with high chance

        // Clear chunks to force regeneration
        world.chunks.clear();
        world.generateChunk(0, 0); // Chunk 0,0

        let foundCactus = false;
        // Scan chunk
        const chunk = world.getChunk(0, 0);
        for(let i=0; i<chunk.blocks.length; i++) {
            if (chunk.blocks[i] === window.BLOCK.CACTUS) {
                foundCactus = true;
                break;
            }
        }

        assert.ok(foundCactus, "Should generate Cactus in Desert biome");

        // 2. Snow -> Spruce
        const snow = Object.assign({}, dummyBM.biomes.SNOW);
        snow.treeChance = 1.0;

        world.biomeManager.getBiome = () => snow; // Force Snow with high chance

        world.chunks.clear();
        world.generateChunk(1, 0); // Chunk 1,0

        let foundSpruce = false;
        const chunk2 = world.getChunk(1, 0);
        for(let i=0; i<chunk2.blocks.length; i++) {
            if (chunk2.blocks[i] === window.BLOCK.SPRUCE_WOOD) {
                foundSpruce = true;
                break;
            }
        }

        assert.ok(foundSpruce, "Should generate Spruce Wood in Snow biome");
    });
});
