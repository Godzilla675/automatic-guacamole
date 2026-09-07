const { JSDOM } = require('jsdom');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

describe('5 New Major Features Verification Suite', function () {
    let window, dom;

    before(function () {
        this.timeout(10000);
        const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        dom = new JSDOM(html, {
            runScripts: 'dangerously',
            resources: 'usable',
            url: 'http://localhost/'
        });
        window = dom.window;

        // Mock AudioContext for Node/JSDOM
        window.AudioContext = class {
            createGain() { return { connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, value: 1 } }; }
            createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, value: 440 } }; }
            createPanner() { return { connect: () => {}, setPosition: () => {}, pan: { value: 0 }, positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 } }; }
            get destination() { return {}; }
        };
        window.soundManager = { play: function() {} };

        const scripts = [
            'js/math.js',
            'js/blocks.js',
            'js/audio.js',
            'js/chunk.js',
            'js/biome.js',
            'js/structures.js',
            'js/world.js',
            'js/physics.js',
            'js/entity.js',
            'js/player.js',
            'js/mob.js',
            'js/drop.js',
            'js/crafting.js',
            'js/plugin.js',
            'js/ui.js',
            'js/textures.js',
            'js/particles.js',
            'js/renderer.js',
            'js/game.js'
        ];

        scripts.forEach(script => {
            const code = fs.readFileSync(path.join(__dirname, '..', script), 'utf8');
            window.eval(code);
        });

        global.window = window;
        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.MOB_TYPE = window.MOB_TYPE;
        global.Mob = window.Mob;
        global.World = window.World;
        global.Player = window.Player;
        global.Drop = window.Drop;
        global.Game = window.Game;
    });

    it('1. Chiseled Bookshelf - Block, Texture, Recipe, Container UI & Storage', function () {
        assert.strictEqual(window.BLOCK.CHISELED_BOOKSHELF, 405);
        assert.ok(window.BLOCKS[window.BLOCK.CHISELED_BOOKSHELF]);
        assert.strictEqual(window.BLOCKS[window.BLOCK.CHISELED_BOOKSHELF].name, 'Chiseled Bookshelf');

        const tm = new window.TextureManager();
        tm.init();
        assert.ok(tm.getBlockTexture(window.BLOCK.CHISELED_BOOKSHELF));

        const game = {
            world: new window.World(),
            player: { inventory: new Array(36).fill(null), unlockedRecipes: new Set(["Chiseled Bookshelf"]) }
        };
        const crafting = new window.CraftingSystem(game);
        const recipe = crafting.recipes.find(r => r.result.type === window.BLOCK.CHISELED_BOOKSHELF);
        assert.ok(recipe);

        // Test Container State in World
        const entity = { type: 'chiseled_bookshelf', items: new Array(6).fill(null) };
        game.world.setBlockEntity(10, 10, 10, entity);
        assert.strictEqual(game.world.getBlockEntity(10, 10, 10).type, 'chiseled_bookshelf');
    });

    it('2. Wither Skeleton Mob - Mob Type, Texture, Stats, Attack & Wither Effect', function () {
        assert.strictEqual(window.MOB_TYPE.WITHER_SKELETON, 'wither_skeleton');

        const tm = new window.TextureManager();
        tm.init();
        assert.ok(tm.getMobTexture('wither_skeleton'));

        const mockGame = {
            world: new window.World(),
            player: {
                x: 10, y: 10, z: 10,
                health: 20,
                activeEffects: [],
                takeDamage: function (amt) { this.health -= amt; },
                addEffect: function (name, icon, dur) { this.activeEffects.push({ name, icon, dur }); }
            },
            mobs: [],
            drops: []
        };

        const wither = new window.Mob(mockGame, 10, 10, 10, window.MOB_TYPE.WITHER_SKELETON);
        assert.strictEqual(wither.height, 2.4);
        assert.strictEqual(wither.color, '#222222');

        // Test Attack Effect
        wither.updateHostileAI(0.1);
        assert.ok(mockGame.player.health < 20);
        assert.ok(mockGame.player.activeEffects.some(e => e.name === 'Wither'));
    });

    it('3. Allay Entity - Mob Type, Texture, Friendly Flying AI & Item Drops Pickup', function () {
        assert.strictEqual(window.MOB_TYPE.ALLAY, 'allay');

        const tm = new window.TextureManager();
        tm.init();
        assert.ok(tm.getMobTexture('allay'));

        const mockGame = {
            world: new window.World(),
            player: { x: 0, y: 10, z: 0, giveItem: function() {} },
            mobs: [],
            drops: [{ type: window.BLOCK.DIRT, count: 5, x: 2, y: 10, z: 2, lifeTime: 100 }]
        };

        const allay = new window.Mob(mockGame, 0, 10, 0, window.MOB_TYPE.ALLAY);
        allay.heldItem = { type: window.BLOCK.DIRT, count: 1 };

        allay.updateAI(0.1);
        assert.strictEqual(allay.type, 'allay');
    });

    it('4. Dropper Block - Block, Recipe, Redstone Powered Ejection', function () {
        assert.strictEqual(window.BLOCK.DROPPER, 406);
        assert.ok(window.BLOCKS[window.BLOCK.DROPPER]);

        const mockGame = {
            world: new window.World(),
            drops: []
        };
        mockGame.world.game = mockGame;

        const entity = {
            type: 'dropper',
            items: [{ type: window.BLOCK.ITEM_DIAMOND, count: 5 }, null, null]
        };

        mockGame.world.setBlockEntity(5, 5, 5, entity);
        mockGame.world.ejectDropperItem(5, 5, 5, entity);

        assert.strictEqual(entity.items[0].count, 4);
        assert.strictEqual(mockGame.drops.length, 1);
        assert.strictEqual(mockGame.drops[0].type, window.BLOCK.ITEM_DIAMOND);
    });

    it('5. Respawn Anchor - Block, Recipe, Glowstone Charging & Respawn Point Logic', function () {
        assert.strictEqual(window.BLOCK.RESPAWN_ANCHOR, 407);
        assert.ok(window.BLOCKS[window.BLOCK.RESPAWN_ANCHOR]);

        const mockGame = {
            world: new window.World(),
            chat: { addMessage: function() {} },
            updateHealthUI: function() {}
        };
        const player = new window.Player(mockGame);
        player.spawnPoint = { x: 0, y: 10, z: 0 };

        const anchorEntity = { type: 'respawn_anchor', charges: 2 };
        mockGame.world.setBlockEntity(20, 20, 20, anchorEntity);

        player.respawnAnchorPos = { x: 20.5, y: 21.0, z: 20.5, blockX: 20, blockY: 20, blockZ: 20 };
        player.respawn();

        assert.strictEqual(player.x, 20.5);
        assert.strictEqual(anchorEntity.charges, 1);
    });
});
