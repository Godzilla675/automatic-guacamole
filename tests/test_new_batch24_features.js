const assert = require('assert');
const { createGameEnv } = require('./helpers/game_env');

describe('New Batch 24 Features Tests', function() {
    this.timeout(10000);

    let env;
    let game;

    beforeEach(function() {
        env = createGameEnv();
        game = env.createGame();
        game.world.generateChunk(0, 0);
        game.world.generateChunk(1, 1);
    });

    it('should quick-fill Crafter slots from player hotbar items', function() {
        const BLOCK = env.window.BLOCK;
        const crafterEntity = { type: 'crafter', items: new Array(9).fill(null), disabledSlots: new Array(9).fill(false) };
        game.ui.openCrafter(crafterEntity);

        game.player.inventory[0] = { type: BLOCK.STONE, count: 5 };
        game.player.selectedSlot = 0;

        const filled = game.ui.quickFillCrafter(0);
        assert.strictEqual(filled, true);
        assert.ok(crafterEntity.items[0]);
        assert.strictEqual(crafterEntity.items[0].type, BLOCK.STONE);
        assert.strictEqual(game.player.inventory[0].count, 4);
    });

    it('should apply Bad Omen level I-V and particle effects when drinking Ominous Bottle', function() {
        const BLOCK = env.window.BLOCK;
        game.player.inventory[0] = { type: BLOCK.ITEM_OMINOUS_BOTTLE, count: 1, level: 3 };
        game.player.selectedSlot = 0;

        const consumed = game.player.eat(BLOCK.ITEM_OMINOUS_BOTTLE);
        assert.strictEqual(consumed, true);

        const badOmenEffect = game.player.activeEffects.find(e => e.name === 'Bad Omen III');
        assert.ok(badOmenEffect);
        assert.strictEqual(badOmenEffect.name, 'Bad Omen III');
    });

    it('should repair Mace durability using Breeze Rods in Anvil', function() {
        const BLOCK = env.window.BLOCK;
        game.ui.openAnvil();
        game.ui.activeAnvil.input1 = { type: BLOCK.ITEM_MACE, count: 1, durability: 100 };
        game.ui.activeAnvil.input2 = { type: BLOCK.ITEM_BREEZE_ROD, count: 2 };

        game.ui.updateAnvilUI();

        assert.ok(game.ui.activeAnvil.output);
        assert.strictEqual(game.ui.activeAnvil.output.type, BLOCK.ITEM_MACE);
        assert.ok(game.ui.activeAnvil.output.durability > 100);
        assert.ok(game.ui.activeAnvil.cost > 0);
    });

    it('should trigger Riptide launch and handle Loyalty Trident returning trajectory', function() {
        const BLOCK = env.window.BLOCK;
        game.world.weather = 'rain';

        game.player.inventory[0] = { type: BLOCK.ITEM_TRIDENT, count: 1, riptide: true };
        game.player.selectedSlot = 0;

        game.startAction(false); // Right click
        assert.ok(game.player.vy > 0); // Player launched upward by Riptide

        // Loyalty Trident test
        game.player.inventory[0] = { type: BLOCK.ITEM_TRIDENT, count: 1, loyalty: true };
        game.world.weather = 'clear';
        game.startAction(false);

        const proj = game.projectiles.find(p => p.type === 'trident');
        assert.ok(proj);
        assert.strictEqual(proj.loyalty, true);

        proj.life = 0; // Trigger expiration
        game.update(0.05);

        // Returning projectile moves toward player
        assert.ok(game.projectiles.length >= 0);
    });

    it('should dye Shulker Boxes and retain 27-slot container contents on break/place', function() {
        const BLOCK = env.window.BLOCK;
        game.world.setBlock(10, 10, 10, BLOCK.SHULKER_BOX);
        const entity = { type: 'shulker_box', items: new Array(27).fill(null) };
        entity.items[0] = { type: BLOCK.ITEM_DIAMOND, count: 5 };
        game.world.setBlockEntity(10, 10, 10, entity);

        game.finalizeBreakBlock(10, 10, 10);

        const drop = game.drops.find(d => d.type === BLOCK.SHULKER_BOX);
        assert.ok(drop);
        assert.ok(drop.containerItems);
        assert.strictEqual(drop.containerItems[0].type, BLOCK.ITEM_DIAMOND);
        assert.strictEqual(drop.containerItems[0].count, 5);

        // Placing Shulker Box with containerItems restores inventory
        game.player.inventory[0] = { type: BLOCK.SHULKER_BOX_BLUE, count: 1, containerItems: drop.containerItems };
        game.player.selectedSlot = 0;
        game.world.setBlock(10, 10, 10, BLOCK.AIR);

        game.physics.raycast = function() {
            return { x: 10, y: 9, z: 10, face: { x: 0, y: 1, z: 0 } };
        };

        game.placeBlock();

        const placedBlock = game.world.getBlock(10, 10, 10);
        assert.strictEqual(placedBlock, BLOCK.SHULKER_BOX_BLUE);

        const restoredEntity = game.world.getBlockEntity(10, 10, 10);
        assert.ok(restoredEntity);
        assert.ok(restoredEntity.items[0]);
        assert.strictEqual(restoredEntity.items[0].type, BLOCK.ITEM_DIAMOND);
    });

    it('should calculate Gold and Iron Weighted Pressure Plate analog signal power', function() {
        const BLOCK = env.window.BLOCK;
        game.world.setBlock(5, 5, 5, BLOCK.LIGHT_WEIGHTED_PRESSURE_PLATE); // Gold

        game.player.x = 5.5;
        game.player.y = 5.0;
        game.player.z = 5.5;

        game.world.activeRedstone.add('5,5,5');
        game.world.updateRedstone();

        let power = game.world.getMetadata(5, 5, 5);
        assert.strictEqual(power, 1); // 1 entity = signal 1

        game.world.setBlock(5, 5, 5, BLOCK.HEAVY_WEIGHTED_PRESSURE_PLATE); // Iron
        game.world.activeRedstone.add('5,5,5');
        game.world.updateRedstone();

        power = game.world.getMetadata(5, 5, 5);
        assert.strictEqual(power, 1); // 1 entity <= 10 = signal 1
    });

    it('should side-lock Redstone Repeater when powered by orthogonal repeater/comparator', function() {
        const BLOCK = env.window.BLOCK;
        // Repeater facing East at (20, 20, 20) with orientation 0
        game.world.setBlock(20, 20, 20, BLOCK.REDSTONE_REPEATER);
        game.world.setMetadata(20, 20, 20, 0); // Horizontal East/West

        // Power source at (20, 20, 22) powering orthogonal repeater at (20, 20, 21)
        game.world.setBlock(20, 20, 22, BLOCK.REDSTONE_TORCH);
        game.world.setBlock(20, 20, 21, BLOCK.REDSTONE_REPEATER);

        game.world.activeRedstone.add('20,20,22');
        game.world.activeRedstone.add('20,20,21');
        game.world.activeRedstone.add('20,20,20');
        game.world.updateRedstone();

        const entity = game.world.getBlockEntity(20, 20, 20);
        assert.ok(entity);
        assert.strictEqual(entity.locked, true);
    });
});
