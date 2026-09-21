const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Audit Bug Fixes Tests', function() {
    let dom;
    let window;

    beforeEach(function() {
        dom = new JSDOM('<!DOCTYPE html><html><body><div id="crafting-recipes"></div></body></html>', {
            runScripts: "dangerously",
            resources: "usable",
            url: "http://localhost/"
        });
        window = dom.window;

        window.perlin = { noise: () => 0 };

        const loadScript = (filename) => {
            const code = fs.readFileSync(path.join(__dirname, '../js', filename), 'utf8');
            window.eval(code);
        };

        ['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'crafting.js'].forEach(loadScript);

        window.BLOCK = window.BLOCK;
        window.BLOCKS = window.BLOCKS;
        window.CraftingSystem = window.CraftingSystem;
        window.World = window.World;
    });

    it('should have crafting recipes for all 16 dyed bundle colors', function() {
        const crafting = new window.CraftingSystem(null);
        const bundleRecipes = crafting.recipes.filter(r => r.name.includes('Bundle'));

        const expectedColors = [
            'White', 'Orange', 'Magenta', 'Light Blue', 'Yellow', 'Lime',
            'Pink', 'Gray', 'Light Gray', 'Cyan', 'Purple', 'Blue',
            'Brown', 'Green', 'Red', 'Black'
        ];

        for (const color of expectedColors) {
            const recipe = bundleRecipes.find(r => r.name === `${color} Bundle`);
            assert.ok(recipe, `Missing recipe for ${color} Bundle`);
            assert.strictEqual(recipe.ingredients.length, 2);
            assert.strictEqual(recipe.ingredients[0].type, window.BLOCK.ITEM_BUNDLE);
        }
    });

    it('should pull items from container block entity directly above hopper', function() {
        const world = new window.World();
        world.chunks.set("0,0", new window.Chunk(0, 0));
        world.game = { drops: [] };

        const chestX = 10, chestY = 11, chestZ = 10;
        const hopperX = 10, hopperY = 10, hopperZ = 10;

        world.setBlock(chestX, chestY, chestZ, window.BLOCK.CHEST);
        world.setBlock(hopperX, hopperY, hopperZ, window.BLOCK.HOPPER);

        const chestEntity = {
            type: 'chest',
            items: [
                { type: window.BLOCK.ITEM_DIAMOND, count: 5 },
                null
            ]
        };
        world.setBlockEntity(chestX, chestY, chestZ, chestEntity);

        world.processHopper(hopperX, hopperY, hopperZ);

        const hopperEntity = world.getBlockEntity(hopperX, hopperY, hopperZ);
        assert.ok(hopperEntity, 'Hopper block entity should be created');
        assert.strictEqual(chestEntity.items[0].count, 4, 'Chest diamond count should decrease by 1');
        assert.ok(hopperEntity.items.some(it => it && it.type === window.BLOCK.ITEM_DIAMOND && it.count === 1), 'Hopper should receive 1 diamond');
    });

    it('should handle redstone repeater tick delays correctly', function() {
        const world = new window.World();
        world.chunks.set("0,0", new window.Chunk(0, 0));

        const x = 5, y = 5, z = 5;

        // Solid floor under components
        world.setBlock(x, y - 1, z, window.BLOCK.STONE);
        world.setBlock(x + 1, y - 1, z, window.BLOCK.STONE);

        world.setBlock(x, y, z, window.BLOCK.REDSTONE_REPEATER);
        world.setBlockEntity(x, y, z, { type: 'repeater', delay: 2, timer: 0 });

        // Power neighbor block with Redstone Torch on solid block
        world.setBlock(x + 1, y, z, window.BLOCK.REDSTONE_TORCH);
        world.activeRedstone.add(`${x},${y},${z}`);

        // First update cycle: timer increments (1), metadata stays 0
        world.updateRedstone();
        assert.strictEqual(world.getMetadata(x, y, z), 0, 'Signal output should be delayed on first tick');

        // Second update cycle: timer reaches delay (2), metadata updates to 15
        world.updateRedstone();
        assert.strictEqual(world.getMetadata(x, y, z), 15, 'Signal output should update after delay ticks');
    });
});
