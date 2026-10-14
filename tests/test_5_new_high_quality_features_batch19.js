const { JSDOM } = require('jsdom');
const assert = require('assert');

describe('Batch 19 High Quality Features Test Suite', () => {
    let window, globalDom;

    before(() => {
        globalDom = new JSDOM(`<!DOCTYPE html><html><body><canvas id="game-canvas"></canvas><div id="chat-messages"></div><div id="crafting-recipes"></div></body></html>`, {
            url: 'http://localhost/'
        });
        window = globalDom.window;

        global.window = window;
        global.document = window.document;
        global.navigator = window.navigator;
        global.HTMLElement = window.HTMLElement;
        global.HTMLCanvasElement = window.HTMLCanvasElement;

        class Entity {
            constructor(game, x, y, z) {
                this.game = game;
                this.x = x;
                this.y = y;
                this.z = z;
                this.vx = 0;
                this.vy = 0;
                this.vz = 0;
            }
        }
        window.Entity = Entity;
        global.Entity = Entity;

        // Load modules
        require('../js/blocks.js');
        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;

        require('../js/textures.js');
        require('../js/crafting.js');
        require('../js/mob.js');
        global.MOB_TYPE = window.MOB_TYPE;
        global.Mob = window.Mob;

        require('../js/player.js');
        global.Player = window.Player;

        require('../js/world.js');
        require('../js/interactions.js');
        window.BlockInteractions = global.BlockInteractions = window.BlockInteractions || global.BlockInteractions;
        require('../js/game.js');
        global.Game = window.Game;
    });

    it('1. should have Eye of Ender, End Stone, Wither Rose, and Endermite defined', () => {
        assert.strictEqual(window.BLOCK.ITEM_EYE_OF_ENDER, 574);
        assert.strictEqual(window.BLOCK.END_STONE, 575);
        assert.strictEqual(window.BLOCK.WITHER_ROSE, 576);
        assert.strictEqual(window.MOB_TYPE.ENDERMITE, 'endermite');

        assert.ok(window.BLOCKS[window.BLOCK.END_STONE]);
        assert.ok(window.BLOCKS[window.BLOCK.WITHER_ROSE]);
        assert.ok(window.BLOCKS[window.BLOCK.ITEM_EYE_OF_ENDER]);
    });

    it('2. should generate textures for new features without error', () => {
        const TextureManagerClass = window.TextureManager || global.TextureManager;
        const tm = new TextureManagerClass();
        tm.init();
        assert.ok(tm.getBlockTexture(window.BLOCK.ITEM_EYE_OF_ENDER));
        assert.ok(tm.getBlockTexture(window.BLOCK.END_STONE));
        assert.ok(tm.getBlockTexture(window.BLOCK.WITHER_ROSE));
    });

    it('3. should throw Ender Pearl with Endermite spawn chance and Eye of Ender projectile', () => {
        const PlayerClass = window.Player || global.Player;
        const game = {
            world: { getHighestBlockY: () => 60 },
            player: null,
            mobs: [],
            spawnProjectile: () => {},
            ui: { showNotification: () => {}, updateHotbarUI: () => {} }
        };
        const player = new PlayerClass(game);
        game.player = player;

        player.inventory[0] = { type: window.BLOCK.ITEM_ENDER_PEARL, count: 1 };
        player.selectedSlot = 0;

        const threw = player.throwEnderPearl();
        assert.strictEqual(threw, true);
        assert.strictEqual(player.inventory[0], null);

        player.inventory[0] = { type: window.BLOCK.ITEM_EYE_OF_ENDER, count: 1 };
        let projectileSpawned = false;
        game.spawnProjectile = (x, y, z, dir, type) => {
            if (type === 'eye_of_ender') projectileSpawned = true;
        };

        const threwEye = player.throwEyeOfEnder();
        assert.strictEqual(threwEye, true);
        assert.strictEqual(projectileSpawned, true);
    });

    it('4. should escalate Trial Spawner to Ominous Trial Spawner with Bad Omen effect', () => {
        const GameClass = window.Game || global.Game;
        const game = {
            world: {
                getBlock: () => window.BLOCK.TRIAL_SPAWNER,
                getBlockEntity: () => null,
                setBlockEntity: (x, y, z, e) => { game.entity = e; }
            },
            player: {
                activeEffects: [{ name: 'Bad Omen', icon: '☠️', duration: 100 }],
                addItem: () => {}
            },
            mobs: [],
            particles: { spawn: () => {} },
            ui: { showNotification: () => {} }
        };

        const mockGame = Object.assign(Object.create(GameClass.prototype), game);
        mockGame.interact(10, 20, 30);

        assert.ok(game.entity);
        assert.strictEqual(game.entity.isOminous, true);
        assert.strictEqual(game.entity.maxWaves, 4);
    });

    it('5. should spawn Endermite mob with hostile AI and stats', () => {
        const MobClass = window.Mob || global.Mob;
        const MobTypeEnum = window.MOB_TYPE || global.MOB_TYPE;
        const mob = new MobClass({}, 0, 0, 0, MobTypeEnum.ENDERMITE);
        assert.strictEqual(mob.height, 0.3);
        assert.strictEqual(mob.width, 0.4);
        assert.strictEqual(mob.speed, 2.5);
    });
});
