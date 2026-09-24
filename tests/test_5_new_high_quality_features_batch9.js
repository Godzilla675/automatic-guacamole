const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('Batch 9 - 5 New High-Quality Features Test Suite', function() {
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

    it('Feature 1: Deepslate & Deepslate Ores block definitions and smelting recipes', function() {
        assert.ok(window.BLOCK.DEEPSLATE !== undefined);
        assert.ok(window.BLOCK.DEEPSLATE_IRON_ORE !== undefined);
        assert.ok(window.BLOCK.DEEPSLATE_GOLD_ORE !== undefined);
        assert.ok(window.BLOCK.DEEPSLATE_DIAMOND_ORE !== undefined);

        assert.strictEqual(window.BLOCKS[window.BLOCK.DEEPSLATE].name, 'Deepslate');
        assert.strictEqual(window.BLOCKS[window.BLOCK.DEEPSLATE_IRON_ORE].hardness, 4.5);

        const world = new window.World();
        const crafting = new (window.CraftingSystem || global.CraftingSystem)({ world });

        const ironOutput = crafting.getSmeltingResult(window.BLOCK.DEEPSLATE_IRON_ORE);
        assert.ok(ironOutput);
        assert.strictEqual(ironOutput.type, window.BLOCK.ITEM_IRON_INGOT);

        const goldOutput = crafting.getSmeltingResult(window.BLOCK.DEEPSLATE_GOLD_ORE);
        assert.ok(goldOutput);
        assert.strictEqual(goldOutput.type, window.BLOCK.ITEM_GOLD_INGOT);
    });

    it('Feature 2: Desert Temple structure generation and subterranean TNT loot trap room', function() {
        const world = new window.World();
        const chunk = new window.Chunk(0, 0);
        world.chunks.set(world.getChunkKey(0, 0), chunk);

        world.structureManager.generateDesertTemple(chunk, 8, 30, 8);

        const wx = 8;
        const wz = 8;

        // Sandstone pyramid wall
        assert.strictEqual(world.getBlock(wx - 4, 30, wz), window.BLOCK.SANDSTONE);

        // Subterranean trap room (y = 24)
        const trapY = 24;
        assert.strictEqual(world.getBlock(wx, trapY - 1, wz), window.BLOCK.TNT);
        assert.strictEqual(world.getBlock(wx, trapY, wz), window.BLOCK.TARGET_BLOCK || window.BLOCK.REDSTONE_WIRE);

        // Chest entity at wall
        const chest = world.getBlockEntity(wx + 1, trapY, wz);
        assert.ok(chest);
        assert.strictEqual(chest.type, 'chest');
        assert.ok(chest.items.length > 0);
    });

    it('Feature 3: Wandering Trader & Llama mobs trading, taming, and caravan AI', function() {
        const world = new window.World();
        const mockGame = {
            world: world,
            mobs: [],
            player: {
                inventory: [{ type: window.BLOCK.ITEM_EMERALD, count: 1 }],
                selectedSlot: 0,
                giveItem: function(type, count) {
                    this.inventory.push({ type, count });
                }
            },
            ui: {
                showNotification: () => {}
            }
        };

        const trader = new window.Mob(mockGame, 10, 20, 10, window.MOB_TYPE.WANDERING_TRADER);
        const llama = new window.Mob(mockGame, 12, 20, 10, window.MOB_TYPE.LLAMA);

        assert.strictEqual(trader.type, 'wandering_trader');
        assert.strictEqual(llama.type, 'llama');

        // Trade Emerald with Wandering Trader
        const traded = trader.interact(window.BLOCK.ITEM_EMERALD);
        assert.ok(traded);

        // Tame Llama with Wool
        const tamed = llama.interact(window.BLOCK.WOOL_WHITE);
        assert.ok(tamed);
        assert.strictEqual(llama.isTamed, true);

        // Llama AI caravan follow
        mockGame.mobs.push(trader, llama);
        llama.update(0.1);
        assert.ok(llama.vx !== undefined);
    });

    it('Feature 4: Wind Charge Dispenser Redstone Launching physics', function() {
        const world = new window.World();
        const projectiles = [];
        world.game = {
            spawnProjectile: function(x, y, z, dir, type) {
                projectiles.push({ x, y, z, dir, type });
            }
        };

        const chunk = new window.Chunk(0, 0);
        world.chunks.set(world.getChunkKey(0, 0), chunk);

        // Place Dispenser facing East (meta=5)
        world.setBlock(10, 20, 10, window.BLOCK.DISPENSER);
        world.setMetadata(10, 20, 10, 5);

        const entity = {
            type: 'dispenser',
            items: [
                { type: window.BLOCK.ITEM_WIND_CHARGE, count: 3 },
                null, null, null, null, null, null, null, null
            ],
            wasPowered: false
        };
        world.setBlockEntity(10, 20, 10, entity);

        // Power Dispenser via Redstone Clock
        world.setBlock(10, 20, 11, window.BLOCK.REDSTONE_CLOCK);
        world.setMetadata(10, 20, 11, 15);

        world.updateDispensers();

        // Projectile launched into world
        assert.ok(projectiles.length > 0);
        const proj = projectiles[0];
        assert.strictEqual(proj.type, 'wind_charge');
        assert.ok(proj.dir.x > 0); // Ejected Eastward (+X)
    });

    it('Feature 5: Trial Chamber Wind Traps loaded with Wind Charges', function() {
        const world = new window.World();
        const chunk = new window.Chunk(0, 0);
        world.chunks.set(world.getChunkKey(0, 0), chunk);

        world.structureManager.generateTrialChamber(chunk, 8, 20, 8);

        const wx = 8;
        const wz = 8;

        // Dispenser trap placed at wx + 3, y + 2
        const trapDispenser = world.getBlock(wx + 3, 22, wz);
        assert.strictEqual(trapDispenser, window.BLOCK.DISPENSER);

        const trapEntity = world.getBlockEntity(wx + 3, 22, wz);
        assert.ok(trapEntity);
        assert.strictEqual(trapEntity.items[0].type, window.BLOCK.ITEM_WIND_CHARGE);
        assert.strictEqual(trapEntity.items[0].count, 8);
    });
});
