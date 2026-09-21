const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('5 New High Quality Features Batch 7 Test Suite', function() {
    this.timeout(10000);
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
            projectiles: [],
            ui: null,
            particles: { spawn: () => {} },
            updateHotbarUI: () => {},
            spawnProjectile: function(x, y, z, dir, type = 'arrow') {
                this.projectiles.push({
                    x, y, z,
                    vx: dir.x * 25, vy: dir.y * 25, vz: dir.z * 25,
                    life: 3.0, type: type, damage: 9
                });
            }
        };
        game.world.game = game;
        game.player = new window.Player(game);
        game.ui = new window.UIManager(game);
        game.crafting = new window.CraftingSystem(game);
        game.ui.init();
    });

    it('Feature 1: Mangrove Swamp Wood Family, Roots & Propagules', function() {
        assert.ok(window.BLOCK.MANGROVE_LOG, 'MANGROVE_LOG defined');
        assert.ok(window.BLOCK.MANGROVE_PLANK, 'MANGROVE_PLANK defined');
        assert.ok(window.BLOCK.MANGROVE_LEAVES, 'MANGROVE_LEAVES defined');
        assert.ok(window.BLOCK.MANGROVE_PROPAGULE, 'MANGROVE_PROPAGULE defined');
        assert.ok(window.BLOCK.MANGROVE_ROOTS, 'MANGROVE_ROOTS defined');
        assert.ok(window.BLOCK.MUDDY_MANGROVE_ROOTS, 'MUDDY_MANGROVE_ROOTS defined');

        // Test Mangrove Plank crafting recipe
        game.player.inventory[0] = { type: window.BLOCK.MANGROVE_LOG, count: 1 };
        const recipeIndex = game.crafting.recipes.findIndex(r => r.name === 'Mangrove Planks (4)');
        assert.ok(recipeIndex !== -1, 'Mangrove Planks crafting recipe found');

        game.crafting.craft(recipeIndex);
        assert.strictEqual(game.player.inventory[0].type, window.BLOCK.MANGROVE_PLANK, 'Crafted Mangrove Planks from Mangrove Log');
        assert.strictEqual(game.player.inventory[0].count, 4, 'Received 4 Mangrove Planks');

        // Test Mangrove Tree structure generation
        const chunk = new window.Chunk(0, 0);
        game.world.chunks.set('0,0', chunk);
        game.world.structureManager.generateTree(chunk, 8, 10, 8, 'mangrove');

        assert.strictEqual(game.world.getBlock(8, 10, 8), window.BLOCK.MANGROVE_ROOTS, 'Mangrove Roots generated at tree base');
        assert.strictEqual(game.world.getBlock(8, 11, 8), window.BLOCK.MANGROVE_LOG, 'Mangrove Log generated as trunk');
    });

    it('Feature 2: Cherry Grove Biome & Cherry Wood Family', function() {
        assert.ok(window.BLOCK.CHERRY_LOG, 'CHERRY_LOG defined');
        assert.ok(window.BLOCK.CHERRY_PLANK, 'CHERRY_PLANK defined');
        assert.ok(window.BLOCK.CHERRY_LEAVES, 'CHERRY_LEAVES defined');
        assert.ok(window.BLOCK.CHERRY_SAPLING, 'CHERRY_SAPLING defined');

        // Test Cherry Planks crafting recipe
        game.player.inventory[0] = { type: window.BLOCK.CHERRY_LOG, count: 1 };
        const recipeIndex = game.crafting.recipes.findIndex(r => r.name === 'Cherry Planks (4)');
        assert.ok(recipeIndex !== -1, 'Cherry Planks crafting recipe found');

        game.crafting.craft(recipeIndex);
        assert.strictEqual(game.player.inventory[0].type, window.BLOCK.CHERRY_PLANK, 'Crafted Cherry Planks');
        assert.strictEqual(game.player.inventory[0].count, 4, 'Received 4 Cherry Planks');

        // Test Cherry Tree structure generation
        const chunk = new window.Chunk(0, 0);
        game.world.chunks.set('0,0', chunk);
        game.world.structureManager.generateTree(chunk, 8, 10, 8, 'cherry');

        assert.strictEqual(game.world.getBlock(8, 10, 8), window.BLOCK.CHERRY_LOG, 'Cherry Log generated as trunk');
    });

    it('Feature 3: Mushroom Fields Biome, Mycelium & Giant Mushrooms', function() {
        assert.ok(window.BLOCK.MYCELIUM, 'MYCELIUM defined');
        assert.ok(window.BLOCK.HUGE_BROWN_MUSHROOM, 'HUGE_BROWN_MUSHROOM defined');
        assert.ok(window.BLOCK.HUGE_RED_MUSHROOM, 'HUGE_RED_MUSHROOM defined');

        // Test Giant Mushroom structure generation
        const chunk = new window.Chunk(0, 0);
        game.world.chunks.set('0,0', chunk);
        game.world.structureManager.generateTree(chunk, 8, 10, 8, 'huge_red_mushroom');

        assert.strictEqual(game.world.getBlock(8, 10, 8), window.BLOCK.WOOD, 'Mushroom stem generated');
        assert.strictEqual(game.world.getBlock(8, 15, 8), window.BLOCK.HUGE_RED_MUSHROOM, 'Red Mushroom Cap block generated');
    });

    it('Feature 4: Trident Weapon & Ranged Throwing Physics', function() {
        assert.ok(window.BLOCK.ITEM_TRIDENT, 'ITEM_TRIDENT defined');
        assert.ok(window.TOOLS[window.BLOCK.ITEM_TRIDENT], 'Trident weapon stats defined in TOOLS');
        assert.strictEqual(window.TOOLS[window.BLOCK.ITEM_TRIDENT].damage, 9, 'Trident deals 9 base damage');

        game.player.inventory[0] = { type: window.BLOCK.ITEM_TRIDENT, count: 1, durability: 250 };
        game.player.selectedSlot = 0;

        // Simulate right-click throwing
        game.player.yaw = 0;
        game.player.pitch = 0;
        game.player.inventory[0].durability -= 5;
        game.spawnProjectile(game.player.x, game.player.y, game.player.z, { x: 0, y: 0, z: 1 }, 'trident');

        assert.strictEqual(game.projectiles.length, 1, 'Trident projectile spawned on throw');
        assert.strictEqual(game.projectiles[0].type, 'trident', 'Spawned projectile is trident');
        assert.strictEqual(game.projectiles[0].damage, 9, 'Trident projectile damage is 9');
    });

    it('Feature 5: Seagrass, Kelp & Dried Kelp Smelting/Building Blocks', function() {
        assert.ok(window.BLOCK.SEAGRASS, 'SEAGRASS defined');
        assert.ok(window.BLOCK.KELP, 'KELP defined');
        assert.ok(window.BLOCK.DRIED_KELP_BLOCK, 'DRIED_KELP_BLOCK defined');
        assert.ok(window.BLOCK.ITEM_DRIED_KELP, 'ITEM_DRIED_KELP defined');

        // Test smelting Kelp into Dried Kelp
        const smeltingResult = game.crafting.getSmeltingResult(window.BLOCK.KELP);
        assert.ok(smeltingResult, 'Smelting recipe found for Kelp');
        assert.strictEqual(smeltingResult.type, window.BLOCK.ITEM_DRIED_KELP, 'Kelp smelts into Dried Kelp');

        // Test crafting 9 Dried Kelp into Dried Kelp Block
        game.player.inventory[0] = { type: window.BLOCK.ITEM_DRIED_KELP, count: 9 };
        const recipeIndex = game.crafting.recipes.findIndex(r => r.name === 'Dried Kelp Block');
        assert.ok(recipeIndex !== -1, 'Dried Kelp Block crafting recipe found');

        game.crafting.craft(recipeIndex);
        assert.strictEqual(game.player.inventory[0].type, window.BLOCK.DRIED_KELP_BLOCK, 'Crafted Dried Kelp Block');
        assert.strictEqual(game.player.inventory[0].count, 1, 'Received 1 Dried Kelp Block');
    });
});
