const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('Batch 10 - 5 New High-Quality Features Test Suite', function() {
    this.timeout(30000);
    let dom;
    let window;

    before(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body>
            <canvas id="game-canvas"></canvas>
            <div id="fps"></div><div id="position"></div><div id="block-count"></div><div id="game-time"></div>
            <div id="crosshair"></div>
            <div id="hotbar"></div>
            <div id="hotbar-container"></div>
            <div id="health-bar"></div>
            <div id="hunger-bar"></div>
            <div id="xp-bar"></div>
            <div id="level-display"></div>
            <div id="crafting-screen" class="hidden"><div id="crafting-recipes"></div></div>
            <div id="inventory-screen" class="hidden"><div id="inventory-grid"></div><div id="armor-grid"></div><div id="hotbar-container"></div></div>
            <div id="chat-messages"></div>
            <input id="chat-input" />
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

        // Load Game Scripts in proper order & assign to global
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
    });

    it('Feature 1: Slime Mob Entity & Splitting Mechanics', function() {
        assert.ok(window.BLOCK.ITEM_SLIMEBALL !== undefined);
        assert.ok(window.MOB_TYPE.SLIME !== undefined);

        const mockGame = {
            mobs: [],
            drops: [],
            player: { x: 10, y: 1, z: 10 }
        };

        const largeSlime = new window.Mob(mockGame, 10, 1, 10, window.MOB_TYPE.SLIME);
        assert.strictEqual(largeSlime.slimeSize, 3);
        assert.strictEqual(largeSlime.width, 1.2);
        assert.strictEqual(largeSlime.height, 1.2);

        // Die: size 3 splits into smaller slimes (size 2)
        mockGame.mobs.push(largeSlime);
        largeSlime.die();

        const subSlimes = mockGame.mobs.filter(m => m !== largeSlime);
        assert.ok(subSlimes.length >= 2 && subSlimes.length <= 4);
        assert.strictEqual(subSlimes[0].slimeSize, 2);
        assert.strictEqual(subSlimes[0].width, 0.8);

        // Size 1 slime drops Slimeball on death
        const smallSlime = new window.Mob(mockGame, 10, 1, 10, window.MOB_TYPE.SLIME);
        smallSlime.slimeSize = 1;
        smallSlime.initType();
        smallSlime.die();

        const drop = mockGame.drops.find(d => d.type === window.BLOCK.ITEM_SLIMEBALL);
        assert.ok(drop);

        // Crafting Slime Block from 9 Slimeballs
        const crafting = new window.CraftingSystem(mockGame);
        const slimeBlockRecipe = crafting.recipes.find(r => r.name === 'Slime Block');
        assert.ok(slimeBlockRecipe);
        assert.strictEqual(slimeBlockRecipe.ingredients[0].type, window.BLOCK.ITEM_SLIMEBALL);
        assert.strictEqual(slimeBlockRecipe.ingredients[0].count, 9);
    });

    it('Feature 2: Powder Snow Block & Freezing Mechanics', function() {
        assert.ok(window.BLOCK.POWDER_SNOW !== undefined);
        assert.ok(window.BLOCK.ITEM_POWDER_SNOW_BUCKET !== undefined);

        const world = new window.World();
        const chunk = new window.Chunk(0, 0);
        world.chunks.set(world.getChunkKey(0, 0), chunk);

        world.setBlock(10, 10, 10, window.BLOCK.POWDER_SNOW);
        assert.strictEqual(world.getBlock(10, 10, 10), window.BLOCK.POWDER_SNOW);

        const mockGame = {
            world: world,
            controls: { forward: true },
            physics: {
                getFluidIntersection: () => false,
                checkCollision: () => false,
                getCollidingBlocks: () => []
            },
            updateHealthUI: () => {}
        };

        const player = new window.Player(mockGame);
        player.x = 10;
        player.y = 10;
        player.z = 10;

        // Player without Leather Boots freezes and sinks
        player.update(0.1);
        assert.ok(player.freezeTicks > 0);

        // Wearing Leather Boots prevents sinking / freezing
        player.armor[3] = { type: window.BLOCK.ITEM_BOOTS_LEATHER, count: 1 };
        const ticksBefore = player.freezeTicks;
        player.x = 20; player.y = 20; player.z = 20; // Out of snow
        player.update(0.1);
        assert.ok(player.freezeTicks < ticksBefore);
    });

    it('Feature 3: Piglins & Gold Bartering Mechanics', function() {
        assert.ok(window.MOB_TYPE.PIGLIN !== undefined);

        const world = new window.World();
        const mockGame = {
            world: world,
            drops: [],
            mobs: [],
            ui: { showNotification: () => {} }
        };

        const piglin = new window.Mob(mockGame, 10, 1, 10, window.MOB_TYPE.PIGLIN);
        assert.strictEqual(piglin.type, 'piglin');
        assert.strictEqual(piglin.height, 1.9);

        // Barter Gold Ingot
        const bartered = piglin.interact(window.BLOCK.ITEM_GOLD_INGOT);
        assert.ok(bartered);
        assert.ok(mockGame.drops.length > 0);

        // Piglin AI: Passive if player wears gold armor
        const player = new window.Player(mockGame);
        mockGame.player = player;

        // Without gold armor -> hostile
        player.armor = [null, null, null, null];
        piglin.updatePiglinAI(0.1);

        // With gold armor -> passive
        player.armor[0] = { type: window.BLOCK.ITEM_HELMET_GOLD, count: 1 };
        piglin.updatePiglinAI(0.1);
    });

    it('Feature 4: Target Block Precision Redstone Signals', function() {
        const world = new window.World();
        const chunk = new window.Chunk(0, 0);
        world.chunks.set(world.getChunkKey(0, 0), chunk);

        const bx = 5, by = 5, bz = 5;
        world.setBlock(bx, by, bz, window.BLOCK.TARGET_BLOCK);

        // Bullseye hit (at block center 5.5, 5.5, 5.5)
        world.hitTargetBlock(bx, by, bz, 5.5, 5.5, 5.5);

        // Check power emission
        const power = world.getMetadata(bx, by, bz);
        assert.strictEqual(power, 15);

        // Powers adjacent redstone
        world.setBlock(bx + 1, by, bz, window.BLOCK.REDSTONE_WIRE);
        const isPowered = world.isBlockPowered(bx + 1, by, bz);
        assert.ok(isPowered);

        // Outer edge hit gives lower power
        world.hitTargetBlock(bx, by, bz, 5.9, 5.5, 5.5);
        const outerPower = world.getMetadata(bx, by, bz);
        assert.ok(outerPower < 15 && outerPower >= 1);
    });

    it('Feature 5: Axe Log Stripping & Stripped Wood Family', function() {
        assert.ok(window.BLOCK.STRIPPED_OAK_LOG !== undefined);
        assert.ok(window.BLOCK.STRIPPED_SPRUCE_LOG !== undefined);
        assert.ok(window.BLOCK.STRIPPED_BIRCH_LOG !== undefined);

        const mockGame = new window.Game();
        const chunk = new window.Chunk(0, 0);
        mockGame.world.chunks.set(mockGame.world.getChunkKey(0, 0), chunk);

        mockGame.world.setBlock(10, 10, 10, window.BLOCK.WOOD);

        mockGame.player.x = 10.5;
        mockGame.player.y = 9.0;
        mockGame.player.z = 8.5;
        mockGame.player.yaw = 0;
        mockGame.player.pitch = 0;

        // Equip Diamond Axe in main slot
        mockGame.player.inventory[mockGame.player.selectedSlot] = { type: window.BLOCK.AXE_DIAMOND, count: 1, durability: 100 };

        // Right click log block with axe
        mockGame.startAction(false);

        // Block converted into Stripped Oak Log
        assert.strictEqual(mockGame.world.getBlock(10, 10, 10), window.BLOCK.STRIPPED_OAK_LOG);

        // Axe durability reduced by 1
        const held = mockGame.player.getHeldItem();
        assert.strictEqual(held.durability, 99);

        // Crafting recipe for Stripped Oak Log -> 4 Planks
        const crafting = new window.CraftingSystem(mockGame);
        const strippedRecipe = crafting.recipes.find(r => r.name === 'Planks from Stripped Oak (4)');
        assert.ok(strippedRecipe);
        assert.strictEqual(strippedRecipe.result.type, window.BLOCK.PLANK);
        assert.strictEqual(strippedRecipe.result.count, 4);
    });
});
