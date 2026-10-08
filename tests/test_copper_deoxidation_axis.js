const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('Copper De-Oxidation Axis Unit Test Suite', function() {
    this.timeout(10000);
    let dom, window, game;

    beforeEach(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body>
            <canvas id="game-canvas"></canvas>
            <div id="hotbar"></div>
            <div id="chest-screen" class="hidden"></div>
            <div id="inventory-screen" class="hidden"></div>
            <div id="chat-messages"></div>
            <input id="chat-input" />
            <div id="darkness-overlay" class="hidden"></div>
            <div id="potion-effects-container"></div>
            <div id="crafting-screen" class="hidden"></div>
            <div id="crafting-recipes"></div>
        </body></html>`, { url: 'http://localhost' });

        window = dom.window;
        window.document.exitPointerLock = () => {};
        global.window = window;
        global.document = window.document;
        global.HTMLCanvasElement = window.HTMLCanvasElement;

        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {},
                clearRect: () => {},
                getImageData: () => ({ data: new Uint8Array(4) }),
                putImageData: () => {},
                createImageData: () => ([]),
                setTransform: () => {},
                drawImage: () => {},
                save: () => {},
                fillText: () => {},
                restore: () => {},
                beginPath: () => {},
                moveTo: () => {},
                lineTo: () => {},
                closePath: () => {},
                stroke: () => {},
                translate: () => {},
                scale: () => {},
                rotate: () => {},
                arc: () => {},
                fill: () => {},
                measureText: () => ({ width: 10 }),
                createLinearGradient: () => ({ addColorStop: () => {} }),
                createPattern: () => ({ setTransform: () => {} })
            };
        };

        window.soundManager = {
            play: () => {},
            updateListener: () => {},
            updateAmbience: () => {}
        };

        window.perlin = {
            noise: () => 0.1
        };

        require('../js/blocks.js');
        window.BLOCK = global.BLOCK = window.BLOCK || global.BLOCK;
        window.BLOCKS = global.BLOCKS = window.BLOCKS || global.BLOCKS;

        require('../js/entity.js');
        window.Entity = global.Entity = window.Entity || global.Entity;

        require('../js/drop.js');
        window.Drop = global.Drop = window.Drop || global.Drop;

        require('../js/biome.js');
        window.BiomeManager = global.BiomeManager = window.BiomeManager || global.BiomeManager;

        require('../js/particles.js');
        window.ParticleSystem = global.ParticleSystem = window.ParticleSystem || global.ParticleSystem;

        require('../js/plugin.js');
        window.PluginAPI = global.PluginAPI = window.PluginAPI || global.PluginAPI;

        require('../js/minimap.js');
        window.Minimap = global.Minimap = window.Minimap || global.Minimap;

        require('../js/achievements.js');
        window.AchievementManager = global.AchievementManager = window.AchievementManager || global.AchievementManager;

        require('../js/tutorial.js');
        window.TutorialManager = global.TutorialManager = window.TutorialManager || global.TutorialManager;

        require('../js/mob.js');
        window.Mob = global.Mob = window.Mob || global.Mob;
        window.MOB_TYPE = global.MOB_TYPE = window.MOB_TYPE || global.MOB_TYPE;

        require('../js/vehicle.js');
        window.Vehicle = global.Vehicle = window.Vehicle || global.Vehicle;

        require('../js/textures.js');
        window.TextureManager = global.TextureManager = window.TextureManager || global.TextureManager;

        require('../js/physics.js');
        window.Physics = global.Physics = window.Physics || global.Physics;

        require('../js/player.js');
        window.Player = global.Player = window.Player || global.Player;

        require('../js/structures.js');
        window.StructureManager = global.StructureManager = window.StructureManager || global.StructureManager;

        require('../js/crafting.js');
        window.CraftingSystem = global.CraftingSystem = window.CraftingSystem || global.CraftingSystem;

        require('../js/chunk.js');
        window.Chunk = global.Chunk = window.Chunk || global.Chunk;

        require('../js/world.js');
        window.World = global.World = window.World || global.World;

        require('../js/chat.js');
        window.ChatManager = global.ChatManager = window.ChatManager || global.ChatManager;

        require('../js/ui.js');
        window.UIManager = global.UIManager = window.UIManager || global.UIManager;

        require('../js/input.js');
        window.InputManager = global.InputManager = window.InputManager || global.InputManager;

        require('../js/renderer.js');
        window.Renderer = global.Renderer = window.Renderer || global.Renderer;

        require('../js/network.js');
        window.NetworkManager = global.NetworkManager = window.NetworkManager || global.NetworkManager;

        require('../js/game.js');
        window.Game = global.Game = window.Game || global.Game;

        game = new window.Game();
        global.game = game;
    });

    it('should de-oxidize Copper Bulbs, Chiseled Copper, Copper Grates, and Copper Doors when scraped with an axe', function() {
        game.world.generateChunk(0, 0);

        game.player.inventory[0] = { type: window.BLOCK.AXE_IRON, count: 1, durability: 250 };
        game.player.selectedSlot = 0;

        game.physics.raycast = () => ({ x: 10, y: 10, z: 10, face: { x: 0, y: 1, z: 0 } });

        // 1. Copper Bulb
        game.world.setBlock(10, 10, 10, window.BLOCK.OXIDIZED_COPPER_BULB);
        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 10, 10), window.BLOCK.WEATHERED_COPPER_BULB);
        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 10, 10), window.BLOCK.EXPOSED_COPPER_BULB);
        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 10, 10), window.BLOCK.COPPER_BULB);

        // 2. Chiseled Copper
        game.world.setBlock(10, 10, 10, window.BLOCK.OXIDIZED_CHISELED_COPPER);
        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 10, 10), window.BLOCK.WEATHERED_CHISELED_COPPER);
        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 10, 10), window.BLOCK.EXPOSED_CHISELED_COPPER);
        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 10, 10), window.BLOCK.CHISELED_COPPER);

        // 3. Copper Grate
        game.world.setBlock(10, 10, 10, window.BLOCK.OXIDIZED_COPPER_GRATE);
        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 10, 10), window.BLOCK.WEATHERED_COPPER_GRATE);
        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 10, 10), window.BLOCK.EXPOSED_COPPER_GRATE);
        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 10, 10), window.BLOCK.COPPER_GRATE);

        // 4. Copper Door Bottom & Top
        game.world.setBlock(10, 10, 10, window.BLOCK.OXIDIZED_COPPER_DOOR_BOTTOM);
        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 10, 10), window.BLOCK.WEATHERED_COPPER_DOOR_BOTTOM);
        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 10, 10), window.BLOCK.EXPOSED_COPPER_DOOR_BOTTOM);
        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 10, 10), window.BLOCK.COPPER_DOOR_BOTTOM);

        game.world.setBlock(10, 11, 10, window.BLOCK.OXIDIZED_COPPER_DOOR_TOP);
        game.physics.raycast = () => ({ x: 10, y: 11, z: 10, face: { x: 0, y: 1, z: 0 } });
        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 11, 10), window.BLOCK.WEATHERED_COPPER_DOOR_TOP);
        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 11, 10), window.BLOCK.EXPOSED_COPPER_DOOR_TOP);
        game.startAction(false);
        assert.strictEqual(game.world.getBlock(10, 11, 10), window.BLOCK.COPPER_DOOR_TOP);
    });
});
