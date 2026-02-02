const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="game-canvas"></canvas></body></html>', { url: 'http://localhost/' });
global.window = dom.window;
global.document = dom.window.document;
global.navigator = { userAgent: 'node' };

// Mocks
window.perlin = { noise: () => 0 };
window.BiomeManager = class { getBiome() { return {}; } };
window.StructureManager = class { generateTree() {} generateCactus() {} generateVillage() {} generateStructure() {} };
window.soundManager = { play: () => {}, updateAmbience: () => {} };
// Bind localStorage to global
global.localStorage = window.localStorage;

// Load Code
require('../js/blocks.js');
global.BLOCK = window.BLOCK;
global.BLOCKS = window.BLOCKS;
global.TOOLS = window.TOOLS;

const chunkCode = fs.readFileSync('js/chunk.js', 'utf8');
eval(chunkCode);
global.Chunk = window.Chunk;

const worldCode = fs.readFileSync('js/world.js', 'utf8');
eval(worldCode);
global.World = window.World;

const physicsCode = fs.readFileSync('js/physics.js', 'utf8');
eval(physicsCode);
global.Physics = window.Physics;

const playerCode = fs.readFileSync('js/player.js', 'utf8');
eval(playerCode);
global.Player = window.Player;

const gameCode = fs.readFileSync('js/game.js', 'utf8');
// Mock Renderer, Network, UI, etc. inside Game or before
window.Renderer = class { resize() {} render() {} };
global.Renderer = window.Renderer;

window.NetworkManager = class { connect() {} sendBlockUpdate() {} sendPosition() {} };
global.NetworkManager = window.NetworkManager;

window.CraftingSystem = class { initUI() {} };
global.CraftingSystem = window.CraftingSystem;

window.ChatManager = class { addMessage() {} };
global.ChatManager = window.ChatManager;

window.UIManager = class { init() {} updateHotbarUI() {} updateHealthUI() {} };
global.UIManager = window.UIManager;

window.InputManager = class { setupEventListeners() {} setupMobileControls() {} };
global.InputManager = window.InputManager;

window.Mob = class {};
global.Mob = window.Mob;

window.Drop = class {};
global.Drop = window.Drop;

const particlesCode = fs.readFileSync('js/particles.js', 'utf8');
eval(particlesCode);
global.ParticleSystem = window.ParticleSystem;

eval(gameCode);

// Test
const game = new window.Game();
game.world.generateChunk(0, 0);

// Setup Player
game.player.inventory[0] = { type: window.BLOCK.ITEM_REDSTONE_DUST, count: 64 };
game.player.selectedSlot = 0;
game.player.yaw = 0;
game.player.pitch = 0;
game.player.x = 0.5;
game.player.y = 51;
game.player.z = 0.5;

// Place solid block to aim at
game.world.setBlock(2, 50, 2, window.BLOCK.STONE);
// Air above it
game.world.setBlock(2, 51, 2, window.BLOCK.AIR);

// Mock Physics Raycast to return the Stone block
// Raycast logic is complex to mock via inputs, so I'll mock the physics.raycast method
game.physics.raycast = (origin, dir, range) => {
    return { x: 2, y: 50, z: 2, face: {x: 0, y: 1, z: 0} }; // Hit top face of stone
};
game.physics.checkCollision = () => false; // No collision with player

console.log("Testing Redstone Dust Placement...");

game.placeBlock();

const placed = game.world.getBlock(2, 51, 2);
assert.strictEqual(placed, window.BLOCK.REDSTONE_WIRE, `Expected REDSTONE_WIRE (${window.BLOCK.REDSTONE_WIRE}), got ${placed}`);

console.log("Redstone Interaction Verified Successfully!");
