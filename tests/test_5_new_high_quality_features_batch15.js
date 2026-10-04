const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('Batch 15 High Quality Features Test Suite', function() {
    this.timeout(10000);
    let dom, window;

    beforeEach(() => {
        dom = new JSDOM(`<!DOCTYPE html><html><body>
            <canvas id="game-canvas"></canvas>
            <div id="hotbar"></div>
            <div id="chest-screen" class="hidden"><h2 class="ui-title">Chest</h2><div id="chest-grid"></div></div>
            <div id="inventory-screen" class="hidden"><div id="inventory-grid"></div><div id="armor-grid"></div></div>
            <div id="chat-messages"></div>
            <input id="chat-input" />
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

    it('Feature 1: Ender Chest blocks, crafting, and persistent storage UI', () => {
        const game = new window.Game();
        assert.strictEqual(window.BLOCK.ENDER_CHEST, 548);
        assert.strictEqual(window.BLOCKS[window.BLOCK.ENDER_CHEST].name, 'Ender Chest');

        // Check crafting recipe
        const recipe = game.crafting.recipes.find(r => r.name === 'Ender Chest');
        assert.ok(recipe, 'Ender Chest crafting recipe exists');

        // Persistent Ender Chest Inventory
        assert.strictEqual(game.player.enderChestInventory.length, 27);
        game.player.enderChestInventory[0] = { type: window.BLOCK.ITEM_DIAMOND, count: 5 };

        // Open Ender Chest
        game.ui.openEnderChest();
        assert.strictEqual(game.ui.activeChest.isEnderChest, true);
        assert.strictEqual(game.ui.activeChest.items[0].type, window.BLOCK.ITEM_DIAMOND);
    });

    it('Feature 2: Axolotl Mob, bucket capture, and water bucket spawning', () => {
        const game = new window.Game();
        const axolotl = new window.Mob(game, 10, 20, 10, window.MOB_TYPE.AXOLOTL);
        assert.strictEqual(axolotl.type, window.MOB_TYPE.AXOLOTL);
        assert.strictEqual(axolotl.maxHealth, 14);

        // Bucket capture interaction
        game.player.giveItem = (type, count) => { game.player.inventory[0] = { type, count }; };
        const result = axolotl.interact(window.BLOCK.ITEM_BUCKET);
        assert.strictEqual(result, true);
        assert.strictEqual(axolotl.isDead, true);
        assert.strictEqual(game.player.inventory[0].type, window.BLOCK.ITEM_AXOLOTL_BUCKET);
    });

    it('Feature 3: Warden Mob, vibration sensing, and sonic boom attack', () => {
        const game = new window.Game();
        game.world.game = game;
        window.game = game;
        const chunk = new window.Chunk(0, 0);
        game.world.chunks.set(game.world.getChunkKey(0, 0), chunk);

        const warden = new window.Mob(game, 10, 20, 10, window.MOB_TYPE.WARDEN);
        game.mobs.push(warden);

        assert.strictEqual(warden.maxHealth, 200);

        // Call onVibration directly or emitVibration
        warden.onVibration({ x: 12, y: 20, z: 12 });
        assert.strictEqual(warden.angerLevel, 25);
        assert.deepStrictEqual(warden.vibrationTarget, { x: 12, y: 20, z: 12 });
    });

    it('Feature 4: Sniffer Mob ancient seed digging and planting', () => {
        const game = new window.Game();
        const sniffer = new window.Mob(game, 10, 20, 10, window.MOB_TYPE.SNIFFER);

        assert.strictEqual(sniffer.type, window.MOB_TYPE.SNIFFER);

        // Simulate dig completion
        sniffer.digTimer = 0.1;
        sniffer.update(0.2); // Finishes dig
        assert.strictEqual(game.drops.length, 1);
        const dropType = game.drops[0].type;
        assert.ok(dropType === window.BLOCK.ITEM_TORCHFLOWER_SEEDS || dropType === window.BLOCK.ITEM_PITCHER_POD);
    });

    it('Feature 5: Crafter Redstone Comparator Signal Strength output', () => {
        const game = new window.Game();
        const chunk = new window.Chunk(0, 0);
        game.world.chunks.set(game.world.getChunkKey(0, 0), chunk);

        game.world.setBlock(10, 20, 10, window.BLOCK.CRAFTER);

        const entity = {
            type: 'crafter',
            items: [
                { type: window.BLOCK.DIRT, count: 1 },
                { type: window.BLOCK.DIRT, count: 1 },
                null, null, null, null, null, null, null
            ],
            disabledSlots: [false, false, false, false, false, false, false, false, false]
        };
        game.world.setBlockEntity(10, 20, 10, entity);

        // Set comparator facing Crafter
        game.world.setBlock(11, 20, 10, window.BLOCK.REDSTONE_COMPARATOR);
        game.world.activeRedstone.add('11,20,10');
        game.world.updateRedstone();

        const power = game.world.getMetadata(11, 20, 10);
        assert.strictEqual(power, 2, 'Comparator output signal equals occupied slots count (2)');
    });
});
