const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('Batch 8 - 5 New High-Quality Features Test Suite', function() {
    let dom;
    let window;

    beforeEach(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body>
            <canvas id="game-canvas"></canvas>
            <div id="crosshair"></div>
            <div id="chat-messages"></div>
            <input id="chat-input" />
            <div id="crafting-recipes"></div>
            <div id="crafting-screen"></div>
        </body></html>`, {
            url: 'http://localhost/',
            runScripts: 'dangerously',
            resources: 'usable'
        });

        window = dom.window;
        global.window = window;
        global.document = window.document;
        global.navigator = window.navigator;
        global.btoa = window.btoa;
        global.atob = window.atob;
        global.Buffer = Buffer;

        // Mocks for sound & canvas
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
                measureText: () => ({ width: 10 })
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

        // Load Game Scripts
        require('../js/blocks.js');
        window.BLOCK = global.BLOCK = window.BLOCK || global.BLOCK;
        window.BLOCKS = global.BLOCKS = window.BLOCKS || global.BLOCKS;
        window.TOOLS = global.TOOLS = window.TOOLS || global.TOOLS;
        window.ARMOR = global.ARMOR = window.ARMOR || global.ARMOR;
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
    });

    it('Feature 1: Bogged shearing drops mushrooms and sets isSheared', function() {
        const game = new window.Game();
        const bogged = new window.Mob(game, 10, 10, 10, window.MOB_TYPE.BOGGED);
        assert.strictEqual(bogged.isSheared, false);

        const handled = bogged.interact(window.BLOCK.ITEM_SHEARS);
        assert.strictEqual(handled, true);
        assert.strictEqual(bogged.isSheared, true);
        assert.ok(game.drops.length > 0);
        const drop = game.drops[0];
        assert.ok(drop.type === window.BLOCK.HUGE_BROWN_MUSHROOM || drop.type === window.BLOCK.HUGE_RED_MUSHROOM);
    });

    it('Feature 2: Wind Charge projectile deflection on player melee attack', function() {
        const game = new window.Game();
        game.player.x = 10;
        game.player.y = 10;
        game.player.z = 10;
        game.player.yaw = 0;
        game.player.pitch = 0;

        game.spawnProjectile(10, 10, 11, { x: 0, y: 0, z: -1 }, 'wind_charge');
        assert.strictEqual(game.projectiles.length, 1);
        const proj = game.projectiles[0];
        assert.strictEqual(proj.deflected, undefined);

        // Perform left click action (melee attack)
        game.startAction(true);
        assert.strictEqual(proj.deflected, true);
        assert.ok(proj.vz > 0); // Velocity reversed/redirected forward
    });

    it('Feature 3: Wind Charge radial knockback impulse', function() {
        const game = new window.Game();
        game.player.x = 10;
        game.player.y = 10;
        game.player.z = 10;

        const mob = new window.Mob(game, 12, 10, 10, window.MOB_TYPE.COW);
        game.mobs.push(mob);

        game.triggerWindBurst(10, 10, 10);
        assert.ok(game.player.vy > 0);
        assert.ok(mob.vy > 0);
        assert.ok(mob.vx > 0); // Pushed away along X axis
    });

    it('Feature 4: Eyeblossom poison stew & ingestion effect', function() {
        const game = new window.Game();
        const player = game.player;

        // Test eating Eyeblossom directly
        player.eat(window.BLOCK.EYEBLOSSOM);
        const poisonEffect = player.activeEffects.find(e => e.name === 'Poison');
        assert.ok(poisonEffect !== undefined);

        // Test recipe in CraftingSystem
        const crafting = game.crafting;
        const eyeblossomRecipe = crafting.recipes.find(r => r.name === "Eyeblossom Stew");
        assert.ok(eyeblossomRecipe !== undefined);
        assert.strictEqual(eyeblossomRecipe.result.type, window.BLOCK.ITEM_SUSPICIOUS_STEW);
    });

    it('Feature 5: Nether Fossil structure generation in StructureManager', function() {
        const game = new window.Game();
        const world = game.world;

        world.generateNetherChunk(0, 0);
        const chunk = world.getChunk(0, 0);
        assert.ok(chunk !== undefined);

        world.structureManager.generateNetherFossil(chunk, 8, 30, 8);
        const fossilBlock = window.BLOCK.CHISELED_STONE_BRICKS || window.BLOCK.BONE;
        assert.strictEqual(world.getBlock(8, 30, 8), fossilBlock);
    });
});
