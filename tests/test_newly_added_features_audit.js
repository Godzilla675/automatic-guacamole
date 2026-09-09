const assert = require('assert');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

describe('Newly Added Features Audit Suite', () => {
    let dom, window, document;
    let World, Player, Mob, Game;

    before(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body><div id="game-canvas"></div><div id="hotbar"></div><div id="inventory-grid"></div><div id="armor-grid"></div><div id="offhand-container"></div><div id="potion-effects-container"></div></body></html>', {
            url: 'http://localhost/',
            resources: 'usable',
            runScripts: 'dangerously'
        });
        window = dom.window;
        document = window.document;

        global.window = window;
        global.document = document;
        global.localStorage = window.localStorage;
        global.btoa = window.btoa;
        global.atob = window.atob;
        global.perlin = window.perlin = { noise: () => 0 };
        global.soundManager = window.soundManager = { play: () => {}, updateListener: () => {}, updateAmbience: () => {} };

        require('../js/math.js');
        require('../js/blocks.js');
        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;

        require('../js/chunk.js');
        global.Chunk = window.Chunk;

        require('../js/biome.js');
        global.BiomeManager = window.BiomeManager;

        require('../js/structures.js');
        global.StructureManager = window.StructureManager;

        require('../js/world.js');
        World = window.World || global.World;

        require('../js/physics.js');
        global.Physics = window.Physics;

        require('../js/entity.js');
        global.Entity = window.Entity;

        require('../js/player.js');
        Player = window.Player || global.Player;

        require('../js/mob.js');
        global.MOB_TYPE = window.MOB_TYPE;
        Mob = window.Mob || global.Mob;

        require('../js/drop.js');
        global.Drop = window.Drop;

        require('../js/crafting.js');
        global.CraftingSystem = window.CraftingSystem;

        require('../js/particles.js');
        global.ParticleSystem = window.ParticleSystem;

        require('../js/chat.js');
        global.ChatManager = window.ChatManager;

        require('../js/ui.js');
        global.UIManager = window.UIManager;

        require('../js/input.js');
        global.InputManager = window.InputManager;

        require('../js/textures.js');
        global.TextureManager = window.TextureManager;

        require('../js/renderer.js');
        global.Renderer = window.Renderer;

        require('../js/plugin.js');
        global.PluginAPI = window.PluginAPI;

        require('../js/minimap.js');
        global.Minimap = window.Minimap;

        require('../js/achievements.js');
        global.AchievementManager = window.AchievementManager;

        require('../js/tutorial.js');
        global.TutorialManager = window.TutorialManager;

        require('../js/game.js');
        Game = window.Game || global.Game;
    });

    beforeEach(() => {
        window.World = World;
        window.Player = Player;
        window.Mob = Mob;
        window.Game = Game;
    });

    it('should correctly save and load worlds containing blocks with high IDs (> 255)', () => {
        const world1 = new World();
        world1.generateChunk(0, 0);

        world1.setBlock(5, 5, 5, BLOCK.COPPER_BULB); // 411
        world1.setBlock(6, 6, 6, BLOCK.SCULK_SHRIEKER); // 408
        world1.setBlock(7, 7, 7, BLOCK.CRAFTER); // 404
        world1.setBlock(8, 8, 8, BLOCK.RESPAWN_ANCHOR); // 407

        assert.strictEqual(world1.getBlock(5, 5, 5), BLOCK.COPPER_BULB);
        assert.strictEqual(world1.getBlock(6, 6, 6), BLOCK.SCULK_SHRIEKER);
        assert.strictEqual(world1.getBlock(7, 7, 7), BLOCK.CRAFTER);
        assert.strictEqual(world1.getBlock(8, 8, 8), BLOCK.RESPAWN_ANCHOR);

        world1.saveWorld('high_id_audit_slot');

        const world2 = new World();
        world2.loadWorld('high_id_audit_slot');

        assert.strictEqual(world2.getBlock(5, 5, 5), BLOCK.COPPER_BULB);
        assert.strictEqual(world2.getBlock(6, 6, 6), BLOCK.SCULK_SHRIEKER);
        assert.strictEqual(world2.getBlock(7, 7, 7), BLOCK.CRAFTER);
        assert.strictEqual(world2.getBlock(8, 8, 8), BLOCK.RESPAWN_ANCHOR);
    });

    it('should trigger Darkness effect upon Sculk Shrieker shriekAt activation', () => {
        const world = new World();
        world.generateChunk(0, 0);
        const dummyGame = {
            world: world,
            player: {
                x: 10, y: 10, z: 10,
                addEffect: function(name, icon, duration) {
                    this.effect = { name, icon, duration };
                }
            }
        };
        world.game = dummyGame;

        world.shriekAt(10, 10, 10);
        assert.strictEqual(dummyGame.player.effect.name, 'Darkness');
        assert.strictEqual(dummyGame.player.effect.icon, '🌑');
    });

    it('should toggle Copper Bulb state on redstone pulse rising edge', () => {
        const world = new World();
        world.generateChunk(0, 0);

        world.setBlock(5, 5, 5, BLOCK.COPPER_BULB);
        world.setBlock(5, 5, 6, BLOCK.REDSTONE_TORCH);

        world.updateRedstone();
        const meta = world.getMetadata(5, 5, 5);
        assert.strictEqual((meta & 2) !== 0, true); // Lit
    });

    it('should track death coordinates and compute vector for Recovery Compass', () => {
        const dummyGame = {
            world: new World(),
            controls: {},
            physics: { checkCollision: () => false, getFluidIntersection: () => false, getCollidingBlocks: () => [] },
            ui: { updatePotionEffectsUI: () => {}, updateHealthUI: () => {} },
            chat: { addMessage: () => {} }
        };
        dummyGame.world.generateChunk(0, 0);

        const player = new Player(dummyGame);
        player.x = 50;
        player.y = 20;
        player.z = 100;

        player.takeDamage(100); // Trigger death
        assert.deepStrictEqual(player.lastDeathPos, { x: 50, y: 20, z: 100 });

        player.x = 10;
        player.z = 10;
        const vec = player.getRecoveryCompassVector();
        assert.strictEqual(vec.dx, 40);
        assert.strictEqual(vec.dz, 90);
        assert.strictEqual(Math.round(vec.distance), 98);
    });

    it('should trigger wind burst knockback explosion physics for Wind Charges', () => {
        const world = new World();
        world.generateChunk(0, 0);

        const dummyGame = {
            world: world,
            player: { x: 5, y: 5, z: 5, vx: 0, vy: 0, vz: 0 },
            mobs: [{ x: 6, y: 5, z: 6, vx: 0, vy: 0, vz: 0, isDead: false, takeDamage: function(dmg, kb) { this.damaged = dmg; } }],
            particles: { spawn: () => {} }
        };

        const gameProto = Game.prototype;
        gameProto.triggerWindBurst.call(dummyGame, 5, 5, 5);

        assert.strictEqual(dummyGame.player.vy > 0, true);
        assert.strictEqual(dummyGame.mobs[0].vy > 0, true);
        assert.strictEqual(dummyGame.mobs[0].damaged, 1);
    });

    it('should apply Wither status effect when hit by a Wither Skeleton', () => {
        const dummyGame = {
            world: new World(),
            mobs: [],
            player: {
                x: 0, y: 0, z: 0, height: 1.8,
                vx: 0, vy: 0, vz: 0,
                takeDamage: function(d) { this.hp = (this.hp || 20) - d; },
                addEffect: function(name, icon, duration) { this.effect = { name, icon, duration }; }
            }
        };

        const witherSk = new Mob(dummyGame, 0, 0, 1, MOB_TYPE.WITHER_SKELETON);
        witherSk.hasLineOfSight = () => true;
        witherSk.updateHostileAI(0.1);

        assert.strictEqual(dummyGame.player.effect.name, 'Wither');
    });

    it('should grant automatic Night Vision effect to players in spectator mode', () => {
        const dummyGame = {
            world: new World(),
            controls: {},
            physics: { checkCollision: () => false, getFluidIntersection: () => false, getCollidingBlocks: () => [] }
        };
        const player = new Player(dummyGame);
        player.spectator = true;
        player.update(0.1);

        assert.strictEqual(player.flying, true);
        assert.strictEqual(player.noclip, true);
        assert.strictEqual(player.activeEffects.some(e => e.name === 'Night Vision'), true);
    });

    it('should reduce fall damage when landing on a Honey Block', () => {
        const dummyGame = {
            world: new World(),
            controls: {},
            physics: { checkCollision: (box) => box.y <= 1.0, getFluidIntersection: () => false, getCollidingBlocks: () => [] },
            ui: { updateHealthUI: () => {} }
        };
        dummyGame.world.generateChunk(0, 0);
        dummyGame.world.setBlock(0, 0, 0, BLOCK.HONEY_BLOCK);

        const player = new Player(dummyGame);
        player.x = 0; player.y = 1; player.z = 0;
        player.vy = -10;
        player.onGround = true;
        player.fallDistance = 10; // Standard fall would deal 7 damage

        player.update(0.1);
        assert.strictEqual(player.health, 19); // Deals only 1 damage (80% reduction)
    });
});
