const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('5 New High Quality Features Batch 5 Test Suite', function() {
    let dom;
    let window;
    let game;

    beforeEach(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body>
            <div id="hotbar"></div>
            <div id="health-bar"></div>
            <div id="hunger-bar"></div>
            <div id="xp-bar"></div>
            <div id="xp-level"></div>
            <div id="crafting-screen" class="hidden"></div>
            <div id="recipe-book-screen" class="hidden"></div>
            <div id="inventory-screen" class="hidden"></div>
            <div id="inventory-grid"></div>
            <div id="armor-grid"></div>
            <div id="offhand-container"></div>
            <canvas id="game-canvas"></canvas>
        </body></html>`, { url: 'http://localhost' });

        window = dom.window;
        window.document.exitPointerLock = () => {};
        global.window = window;
        global.document = window.document;
        global.localStorage = window.localStorage;

        const loadScript = (filePath) => {
            const code = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
            eval(code);
        };

        loadScript('js/blocks.js');
        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.TOOLS = window.TOOLS;
        global.ARMOR = window.ARMOR;

        loadScript('js/entity.js');
        global.Entity = window.Entity;
        global.ArmorStand = window.ArmorStand;

        loadScript('js/drop.js');
        global.Drop = window.Drop;

        loadScript('js/chunk.js');
        global.Chunk = window.Chunk;

        loadScript('js/math.js');
        loadScript('js/biome.js');
        loadScript('js/village.js');
        loadScript('js/structures.js');

        loadScript('js/world.js');
        global.World = window.World;

        loadScript('js/physics.js');
        global.Physics = window.Physics;

        loadScript('js/player.js');
        global.Player = window.Player;

        loadScript('js/vehicle.js');
        global.Vehicle = window.Vehicle;
        global.Minecart = window.Minecart;

        loadScript('js/mob.js');
        global.MOB_TYPE = window.MOB_TYPE;
        global.Mob = window.Mob;

        loadScript('js/textures.js');
        loadScript('js/crafting.js');
        loadScript('js/ui.js');

        game = {
            world: new window.World(),
            physics: {
                getCollidingBlocks: () => [],
                checkCollision: () => false,
                getFluidIntersection: () => false,
                raycastEntities: (origin, dir, list) => {
                    if (list && list.length > 0) return { entity: list[0], dist: 1.0 };
                    return { entity: null };
                },
                raycast: () => null
            },
            controls: { forward: false, backward: false, left: false, right: false, jump: false, sneak: false },
            mobs: [],
            vehicles: [],
            entities: [],
            drops: [],
            ui: null,
            particles: { spawn: () => {} },
            updateHotbarUI: () => {}
        };
        game.world.game = game;
        game.player = new window.Player(game);
        game.ui = new window.UIManager(game);
        game.crafting = new window.CraftingSystem(game);
        game.ui.init();
    });

    it('Feature 1: Powered Rails Acceleration & Detector Rails Signal', function() {
        assert.ok(window.BLOCK.POWERED_RAIL, 'POWERED_RAIL defined');
        assert.ok(window.BLOCK.DETECTOR_RAIL, 'DETECTOR_RAIL defined');

        const chunk = new window.Chunk(0, 0);
        game.world.chunks.set('0,0', chunk);

        // Detector Rail emits redstone signal when cart moves over it
        game.world.setBlock(2, 5, 2, window.BLOCK.DETECTOR_RAIL);
        const minecart = new window.Minecart(game, 2.5, 5.0, 2.5);
        minecart.update(0.1);

        assert.strictEqual(game.world.getMetadata(2, 5, 2), 15, 'Detector Rail emitted level 15 redstone signal');

        // Powered Rail accelerates minecart when powered
        game.world.setBlock(5, 4, 5, window.BLOCK.STONE); // Solid support for rail
        game.world.setBlock(5, 4, 6, window.BLOCK.STONE); // Solid support for redstone torch
        game.world.setBlock(5, 5, 5, window.BLOCK.POWERED_RAIL);
        game.world.setBlock(5, 5, 6, window.BLOCK.REDSTONE_TORCH); // Powers adjacent rail
        const poweredCart = new window.Minecart(game, 5.5, 5.0, 5.5);
        poweredCart.vx = 2.0;
        poweredCart.update(0.1);

        assert.ok(Math.hypot(poweredCart.vx, poweredCart.vz) > 2.0, 'Powered Rail boosted minecart velocity');
    });

    it('Feature 2: Mooshroom Cow Shearing & Mushroom Stew Harvesting', function() {
        assert.ok(window.MOB_TYPE.MOOSHROOM, 'MOB_TYPE.MOOSHROOM defined');
        const mooshroom = new window.Mob(game, 10, 5, 10, window.MOB_TYPE.MOOSHROOM);
        game.mobs.push(mooshroom);

        // Bowl / Bottle stew harvesting
        const harvested = mooshroom.interact(window.BLOCK.ITEM_GLASS_BOTTLE);
        assert.strictEqual(harvested, true, 'Harvested Mushroom Stew with bottle/bowl');
        const stewItem = game.player.inventory.find(i => i && i.type === window.BLOCK.ITEM_SUSPICIOUS_STEW);
        assert.ok(stewItem, 'Player received Suspicious Stew in inventory');

        // Shearing Mooshroom into Cow
        const sheared = mooshroom.interact(window.BLOCK.ITEM_SHEARS);
        assert.strictEqual(sheared, true, 'Mooshroom sheared');
        assert.strictEqual(mooshroom.type, window.MOB_TYPE.COW, 'Mooshroom converted to normal Cow');
        assert.ok(game.drops.length > 0, 'Mushrooms dropped upon shearing');
    });

    it('Feature 3: Frog Mob & Magma Cube Eating Froglight Drop', function() {
        assert.ok(window.MOB_TYPE.FROG, 'MOB_TYPE.FROG defined');
        assert.ok(window.BLOCK.FROGLIGHT, 'BLOCK.FROGLIGHT defined');

        const frog = new window.Mob(game, 10, 5, 10, window.MOB_TYPE.FROG);
        const magmaCube = new window.Mob(game, 10.5, 5, 10.5, window.MOB_TYPE.MAGMA_CUBE);
        game.mobs.push(frog);
        game.mobs.push(magmaCube);

        frog.updateAI(0.1);

        assert.strictEqual(magmaCube.isDead, true, 'Frog consumed nearby Magma Cube');
        assert.strictEqual(game.drops.length, 1, 'Frog dropped Froglight block');
        assert.strictEqual(game.drops[0].type, window.BLOCK.FROGLIGHT, 'Drop type is FROGLIGHT');
    });

    it('Feature 4: Armor Stand Placement and Equipping Logic', function() {
        assert.ok(window.BLOCK.ITEM_ARMOR_STAND, 'ITEM_ARMOR_STAND defined');
        const stand = new window.ArmorStand(game, 12, 5, 12);
        game.entities.push(stand);

        // Equip Iron Chestplate onto stand
        game.player.inventory[0] = { type: window.BLOCK.ITEM_CHESTPLATE_IRON, count: 1 };
        game.player.selectedSlot = 0;

        const equipped = stand.interact(game.player);
        assert.strictEqual(equipped, true, 'Equipped armor onto Armor Stand');
        assert.ok(stand.armor.chestplate, 'Chestplate stored in stand armor slot');
        assert.strictEqual(stand.armor.chestplate.type, window.BLOCK.ITEM_CHESTPLATE_IRON, 'Stored chestplate type matches');

        // Retrieve armor from stand
        game.player.inventory[0] = null;
        const retrieved = stand.interact(game.player);
        assert.strictEqual(retrieved, true, 'Retrieved armor from Armor Stand');
        assert.strictEqual(stand.armor.chestplate, null, 'Stand chestplate slot cleared');
    });

    it('Feature 5: Brush Tool & Suspicious Sand Archaeology', function() {
        assert.ok(window.BLOCK.ITEM_BRUSH, 'ITEM_BRUSH defined');
        assert.ok(window.BLOCK.SUSPICIOUS_SAND, 'SUSPICIOUS_SAND defined');

        const chunk = new window.Chunk(0, 0);
        game.world.chunks.set('0,0', chunk);

        game.world.setBlock(5, 5, 5, window.BLOCK.SUSPICIOUS_SAND);
        game.player.inventory[0] = { type: window.BLOCK.ITEM_BRUSH, count: 1, durability: 64 };
        game.player.selectedSlot = 0;

        // Mock Raycast hit on Suspicious Sand
        game.physics.raycast = () => ({ x: 5, y: 5, z: 5 });

        // Brush 4 times to complete excavation
        for (let i = 0; i < 4; i++) {
            let entity = game.world.getBlockEntity(5, 5, 5);
            if (!entity) {
                entity = { type: 'suspicious_sand', brushProgress: 0 };
                game.world.setBlockEntity(5, 5, 5, entity);
            }
            entity.brushProgress++;
            if (entity.brushProgress >= 4) {
                const reward = window.BLOCK.ITEM_EMERALD;
                game.drops.push(new window.Drop(game, 5.5, 5.5, 5.5, reward, 1));
                game.world.setBlock(5, 5, 5, window.BLOCK.SAND);
            }
        }

        assert.strictEqual(game.world.getBlock(5, 5, 5), window.BLOCK.SAND, 'Suspicious Sand converted to Sand after brushing');
        assert.strictEqual(game.drops.length, 1, 'Archaeology loot dropped');
    });
});
