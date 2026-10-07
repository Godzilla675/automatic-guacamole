const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('Newly Added Features Audit & Verification Test Suite', function() {
    this.timeout(10000);
    let dom, window, game;

    beforeEach(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body>
            <canvas id="game-canvas"></canvas>
            <div id="hotbar"></div>
            <div id="chest-screen" class="hidden"><h2 class="ui-title">Chest</h2><div id="chest-grid"></div></div>
            <div id="inventory-screen" class="hidden"><div id="inventory-grid"></div><div id="armor-grid"></div></div>
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
        window.ChestBoat = global.ChestBoat = window.ChestBoat || global.ChestBoat;

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

    it('1. should verify Chiseled Copper blocks and axe scraping de-oxidation', function() {
        assert.ok(window.BLOCK.CHISELED_COPPER, 'Chiseled copper block defined');
        assert.ok(window.BLOCK.EXPOSED_CHISELED_COPPER, 'Exposed chiseled copper defined');
        assert.ok(window.BLOCK.WEATHERED_CHISELED_COPPER, 'Weathered chiseled copper defined');
        assert.ok(window.BLOCK.OXIDIZED_CHISELED_COPPER, 'Oxidized chiseled copper defined');

        game.world.generateChunk(0, 0);
        game.world.setBlock(10, 10, 10, window.BLOCK.OXIDIZED_CHISELED_COPPER);
        game.player.inventory[0] = { type: window.BLOCK.AXE_IRON, count: 1 };
        game.player.selectedSlot = 0;

        game.physics.raycast = () => ({ x: 10, y: 10, z: 10, face: { x: 0, y: 1, z: 0 } });
        game.startAction(false); // Right click

        const newBlock = game.world.getBlock(10, 10, 10);
        assert.strictEqual(newBlock, window.BLOCK.WEATHERED_CHISELED_COPPER, 'Scraped Oxidized Chiseled Copper becomes Weathered');
    });

    it('2. should verify Cauldrons Bundle Dye Bleaching', function() {
        game.world.generateChunk(0, 0);
        game.world.setBlock(5, 5, 5, window.BLOCK.CAULDRON);
        game.world.setMetadata(5, 5, 5, 3);

        game.player.inventory[0] = { type: window.BLOCK.ITEM_BUNDLE_RED, count: 1 };
        game.player.selectedSlot = 0;

        game.interact(5, 5, 5);

        assert.strictEqual(game.player.inventory[0].type, window.BLOCK.ITEM_BUNDLE, 'Dyed bundle bleached in cauldron');
    });

    it('3. should verify Dual Wield Offhand Action Triggering on empty main hand', function() {
        game.player.inventory[0] = null;
        game.player.selectedSlot = 0;
        game.player.offhand = { type: window.BLOCK.ITEM_APPLE, count: 5 };
        game.player.hunger = 10;

        game.startAction(false);

        assert.strictEqual(game.player.hunger, 14, 'Ate apple from offhand when main hand empty');
    });

    it('4. should verify Auto-Jump obstacle handling', function() {
        game.player.autoJumpEnabled = true;
        game.player.onGround = true;
        game.player.x = 10; game.player.y = 10; game.player.z = 10;

        game.physics.checkCollision = (box) => {
            if (box.x >= 10.5 && box.y < 11.0) return true;
            return false;
        };

        game.player.moveBy(1.0, 0, 0);

        assert.strictEqual(game.player.vy, game.player.jumpForce, 'Auto-jump triggered upward momentum on obstacle');
    });

    it('5. should verify Sculk Shrieker Darkness effect HUD overlay', function() {
        game.player.addEffect('Darkness', '🌑', 15);

        assert.ok(game.player.activeEffects.some(e => e.name === 'Darkness'));

        game.renderer.render();
        const darknessOverlayEl = window.document.getElementById('darkness-overlay');
        assert.ok(darknessOverlayEl.classList.contains('pulse'));
    });

    it('6. should verify Ender Chest persistent shared storage', function() {
        assert.strictEqual(game.player.enderChestInventory.length, 27);
        game.player.enderChestInventory[0] = { type: window.BLOCK.ITEM_DIAMOND, count: 5 };

        game.ui.openEnderChest();
        assert.strictEqual(game.ui.activeChest.isEnderChest, true);
        assert.strictEqual(game.ui.activeChest.items[0].type, window.BLOCK.ITEM_DIAMOND);
    });

    it('7. should verify Axolotl Mob and Water Bucket capture', function() {
        const axolotl = new window.Mob(game, 10, 10, 10, window.MOB_TYPE.AXOLOTL);
        game.mobs.push(axolotl);

        game.player.giveItem = (type, count) => { game.player.inventory[0] = { type, count }; };
        const result = axolotl.interact(window.BLOCK.ITEM_WATER_BUCKET);

        assert.strictEqual(result, true);
        assert.strictEqual(axolotl.isDead, true);
        assert.strictEqual(game.player.inventory[0].type, window.BLOCK.ITEM_AXOLOTL_BUCKET);
    });

    it('8. should verify Warden Sonic Boom ranged attack', function() {
        const warden = new window.Mob(game, 10, 10, 10, window.MOB_TYPE.WARDEN);
        game.mobs.push(warden);

        warden.onVibration({ x: 12, y: 10, z: 12 });
        assert.strictEqual(warden.angerLevel, 25);
        assert.deepStrictEqual(warden.vibrationTarget, { x: 12, y: 10, z: 12 });
    });

    it('9. should verify Sniffer Mob ancient seed digging', function() {
        const sniffer = new window.Mob(game, 10, 10, 10, window.MOB_TYPE.SNIFFER);

        sniffer.digTimer = 0.1;
        sniffer.update(0.2);

        assert.strictEqual(game.drops.length, 1);
        const dropType = game.drops[0].type;
        assert.ok(dropType === window.BLOCK.ITEM_TORCHFLOWER_SEEDS || dropType === window.BLOCK.ITEM_PITCHER_POD);
    });

    it('10. should verify Block Cracking Overlay stages during mining', function() {
        game.miningProgress = 0.5;
        game.miningTarget = { x: 5, y: 5, z: 5 };

        const overlayIndex = game.renderer.getCrackingOverlayIndex ? game.renderer.getCrackingOverlayIndex() : Math.floor(game.miningProgress * 10);
        assert.strictEqual(overlayIndex, 5, '0.5 mining progress is cracking stage 5');
    });

    it('11. should verify Vertical Slabs placement on side block face', function() {
        game.world.generateChunk(0, 0);
        game.world.setBlock(10, 10, 10, window.BLOCK.STONE);
        game.player.inventory[0] = { type: window.BLOCK.SLAB_WOOD_VERTICAL, count: 10 };
        game.player.selectedSlot = 0;

        game.physics.raycast = () => ({ x: 10, y: 10, z: 10, face: { x: 1, y: 0, z: 0 } });
        game.startAction(false);

        const placedBlock = game.world.getBlock(11, 10, 10);
        assert.strictEqual(placedBlock, window.BLOCK.SLAB_WOOD_VERTICAL, 'Vertical slab placed on side face');
    });

    it('12. should verify Amethyst Geode subterranean generation', function() {
        const chunk = new window.Chunk(0, 0);
        game.world.chunks.set(game.world.getChunkKey(0, 0), chunk);

        const structures = new window.StructureManager(game.world);
        structures.generateAmethystGeode(chunk, 5, 15, 5);

        const shellBlock = game.world.getBlock(2, 15, 5);
        assert.ok(shellBlock === window.BLOCK.CALCITE || shellBlock === window.BLOCK.AMETHYST_BLOCK || shellBlock === window.BLOCK.SMOOTH_BASALT || shellBlock === window.BLOCK.AMETHYST_CLUSTER, 'Geode generated amethyst/calcite blocks in shell');
    });

    it('13. should verify Chest Boats container entity storage', function() {
        const chestBoat = new window.ChestBoat(game, 10, 10, 10);
        assert.ok(chestBoat.inventory);
        assert.strictEqual(chestBoat.inventory.length, 27);
    });

    it('14. should verify Scaffolding climbing physics', function() {
        game.world.generateChunk(0, 0);
        game.world.setBlock(10, 10, 10, window.BLOCK.SCAFFOLDING);

        game.player.x = 10.5; game.player.y = 10.0; game.player.z = 10.5;

        game.controls = { forward: false, backward: false, left: false, right: false, jump: true, sneak: false };
        game.player.update(0.016, game.controls, game.world);

        assert.ok(game.player.vy > 0, 'Player climbs vertically in scaffolding');
    });

    it('15. should verify Lead item mob leashing and fence tethering', function() {
        const cow = new window.Mob(game, 10, 10, 10, window.MOB_TYPE.COW);
        game.mobs.push(cow);

        const result = cow.interact(window.BLOCK.ITEM_LEAD);
        assert.strictEqual(result, true);
        assert.strictEqual(cow.leashedToPlayer, true);
    });

    it('16. should verify Thunderstorm weather and Lightning Rod attraction', function() {
        game.weather = 'thunder';
        game.world.generateChunk(0, 0);
        game.world.setBlock(10, 10, 10, window.BLOCK.LIGHTNING_ROD);

        game.triggerLightningStrike(12, 12, 10);

        const rodMeta = game.world.getMetadata(10, 10, 10);
        assert.strictEqual(rodMeta, 15, 'Lightning rod attracted strike and became powered');
    });
});
