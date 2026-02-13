const assert = require('assert');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="game-canvas"></canvas></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = { getItem: () => null, setItem: () => {} };

// Mock Stuff
global.window.BLOCK = {
    ITEM_NETHER_WART: 313,
    ITEM_GLASS_BOTTLE: 315,
    ITEM_POTION: 316
};
global.BLOCK = global.window.BLOCK;
global.window.BLOCKS = {};
global.BLOCKS = global.window.BLOCKS;

// Load Game code? Too many dependencies. I'll load game.js but mock everything else.
// Actually I just need to test processBrewing logic. I can copy/paste it or extract it, but better to load the file if possible.
// processBrewing is in Game class.

const fs = require('fs');
// Mock dependencies for Game
global.window.World = class { constructor() { this.blockEntities = new Map(); } };
global.window.Physics = class {};
global.window.Player = class {};
global.window.NetworkManager = class { connect(){} };
global.window.CraftingSystem = class { initUI(){} };
global.window.ParticleSystem = class { constructor(){} };
global.window.ChatManager = class {};
global.window.UIManager = class { init(){} updateBrewingUI(){} };
global.window.InputManager = class { setupEventListeners(){} };
global.window.Renderer = class { resize(){} };
global.window.PluginAPI = class { constructor(){} };
global.window.Minimap = class { constructor() {} update(){} };
global.window.AchievementManager = class { constructor() {} update(){} };
global.window.TutorialManager = class { constructor() {} update(){} };

global.World = global.window.World;
global.Physics = global.window.Physics;
global.Player = global.window.Player;
global.NetworkManager = global.window.NetworkManager;
global.CraftingSystem = global.window.CraftingSystem;
global.ParticleSystem = global.window.ParticleSystem;
global.ChatManager = global.window.ChatManager;
global.UIManager = global.window.UIManager;
global.InputManager = global.window.InputManager;
global.Renderer = global.window.Renderer;
global.PluginAPI = global.window.PluginAPI;

const gameCode = fs.readFileSync('./js/game.js', 'utf8');
eval(gameCode);

describe('Brewing Verification', () => {
    it('should brew potion', () => {
        const game = new window.Game();

        const entity = {
            ingredient: { type: BLOCK.ITEM_NETHER_WART, count: 1 },
            bottles: [
                { type: BLOCK.ITEM_GLASS_BOTTLE, count: 1 },
                null,
                null
            ],
            brewTime: 0
        };

        // Tick 1
        game.processBrewing(entity, 1.0); // 1 sec -> +20 ticks
        assert.ok(entity.brewTime > 0, "Brew time should increase");

        // Finish
        game.processBrewing(entity, 20.0); // +400 ticks -> Finish

        assert.strictEqual(entity.brewTime, 0, "Brew time should reset");
        assert.strictEqual(entity.ingredient, null, "Ingredient consumed");
        assert.strictEqual(entity.bottles[0].type, BLOCK.ITEM_POTION, "Bottle converted to Potion");
    });
});
