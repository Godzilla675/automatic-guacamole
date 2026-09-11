const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('5 Major New Features Test Suite', function() {
    let dom, window, globalObj;

    before(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body>
            <canvas id="game-canvas"></canvas>
            <div id="hotbar"></div>
            <div id="health-bar"></div>
            <div id="hunger-bar"></div>
            <div id="xp-bar"></div>
            <div id="xp-level">0</div>
            <div id="damage-overlay"></div>
            <div id="potion-effects-container"></div>
            <div id="chat-container">
                <div id="chat-messages"></div>
                <input type="text" id="chat-input" class="hidden">
            </div>
            <div id="crafting-screen" class="hidden"><div id="crafting-recipes"></div></div>
            <div id="inventory-screen" class="hidden"><div id="inventory-grid"></div><div id="armor-grid"></div></div>
            <div id="smithing-screen" class="hidden">
                <div id="smithing-base"></div>
                <div id="smithing-addition"></div>
                <div id="smithing-output"></div>
                <button id="close-smithing"></button>
            </div>
        </body></html>`, {
            url: 'http://localhost/',
            runScripts: 'dangerously',
            resources: 'usable'
        });

        window = dom.window;
        globalObj = global;

        globalObj.window = window;
        globalObj.document = window.document;
        globalObj.HTMLElement = window.HTMLElement;
        globalObj.localStorage = window.localStorage;
        globalObj.Buffer = Buffer;
        window.setTimeout = global.setTimeout;
        window.clearTimeout = global.clearTimeout;
        window.AudioContext = function() {
            return {
                createGain: () => ({ connect: () => {}, gain: { value: 1, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }),
                createBufferSource: () => ({ connect: () => {}, start: () => {}, stop: () => {} }),
                createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 440, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} }, type: 'sine' }),
                createPanner: () => ({ connect: () => {}, setPosition: () => {}, coneInnerAngle: 0, coneOuterAngle: 0, coneOuterGain: 0, panningModel: '' }),
                createAnalyser: () => ({ connect: () => {}, getByteFrequencyData: () => {} }),
                listener: { setPosition: () => {}, setOrientation: () => {} },
                destination: {}
            };
        };
        window.document.exitPointerLock = function() {};
        window.HTMLCanvasElement.prototype.requestPointerLock = function() {};
        window.webkitAudioContext = window.AudioContext;
        globalObj.AudioContext = window.AudioContext;

        // Load game scripts
        const scripts = [
            'js/math.js',
            'js/blocks.js',
            'js/audio.js',
            'js/network.js',
            'js/chunk.js',
            'js/biome.js',
            'js/structures.js',
            'js/world.js',
            'js/physics.js',
            'js/entity.js',
            'js/mob.js',
            'js/player.js',
            'js/drop.js',
            'js/crafting.js',
            'js/plugin.js',
            'js/minimap.js',
            'js/achievements.js',
            'js/tutorial.js',
            'js/chat.js',
            'js/ui.js',
            'js/input.js',
            'js/textures.js',
            'js/renderer.js',
            'js/particles.js',
            'js/game.js'
        ];

        for (const scr of scripts) {
            delete require.cache[require.resolve('../' + scr)];
            require('../' + scr);
            for (const key of Object.keys(window)) {
                if (typeof window[key] === 'function' || typeof window[key] === 'object') {
                    globalObj[key] = window[key];
                }
            }
        }
        globalObj.Entity = window.Entity;
        globalObj.Mob = window.Mob;
        globalObj.Player = window.Player;
        globalObj.Game = window.Game;
    });

    it('1. Mace Weapon, Heavy Core & Smash Attack Mechanics', function() {
        assert.strictEqual(window.BLOCK.HEAVY_CORE, 414);
        assert.strictEqual(window.BLOCK.ITEM_MACE, 415);
        assert.ok(window.BLOCKS[window.BLOCK.HEAVY_CORE]);
        assert.ok(window.BLOCKS[window.BLOCK.ITEM_MACE]);
        assert.ok(window.TOOLS[window.BLOCK.ITEM_MACE]);

        const texManager = new window.TextureManager();
        texManager.init();
        assert.ok(texManager.getBlockTexture(window.BLOCK.HEAVY_CORE));
        assert.ok(texManager.getBlockTexture(window.BLOCK.ITEM_MACE));

        const game = new window.Game();
        const mob = new window.Mob(game, 10, 40, 10, window.MOB_TYPE.ZOMBIE);
        game.player.inventory[0] = { type: window.BLOCK.ITEM_MACE, count: 1 };
        game.player.selectedSlot = 0;
        game.player.fallDistance = 6.0;
        game.player.vy = -5.0;

        const initialHealth = mob.health;
        game.player.attack(mob);
        assert.ok(mob.health < initialHealth - 7, 'Mace smash attack should deal extra fall distance bonus damage');
    });

    it('2. Ominous Bottle & Bad Omen Status Effect', function() {
        assert.strictEqual(window.BLOCK.ITEM_OMINOUS_BOTTLE, 416);
        assert.ok(window.BLOCKS[window.BLOCK.ITEM_OMINOUS_BOTTLE]);

        const game = new window.Game();
        game.player.eat(window.BLOCK.ITEM_OMINOUS_BOTTLE);

        const hasEffect = game.player.activeEffects.some(e => e.name === 'Bad Omen');
        assert.ok(hasEffect, 'Drinking Ominous Bottle should grant Bad Omen potion effect');
    });

    it('3. Coral Reefs & Coral Blocks', function() {
        const coralIDs = [
            window.BLOCK.CORAL_BRAIN,
            window.BLOCK.CORAL_TUBE,
            window.BLOCK.CORAL_HORN,
            window.BLOCK.CORAL_FIRE,
            window.BLOCK.CORAL_BUBBLE
        ];

        for (const id of coralIDs) {
            assert.ok(id, 'Coral block ID must be defined');
            assert.ok(window.BLOCKS[id], 'Coral block definition must exist');
        }

        const game = new window.Game();
        game.world.generateChunk(0, 0);
        const chunk = game.world.getChunk(0, 0);
        game.world.structureManager.generateCoralReef(chunk, 4, 30, 4);

        let foundCoral = false;
        for (let x = 0; x < 16; x++) {
            for (let z = 0; z < 16; z++) {
                const b = game.world.getBlock(x, 30, z);
                if (coralIDs.includes(b)) {
                    foundCoral = true;
                    break;
                }
            }
        }
        assert.ok(foundCoral, 'StructureManager should generate coral blocks in coral reef');
    });

    it('4. Smithing Table Block & Custom UI Screen', function() {
        assert.strictEqual(window.BLOCK.SMITHING_TABLE, 422);
        assert.ok(window.BLOCKS[window.BLOCK.SMITHING_TABLE]);

        const game = new window.Game();
        game.ui.openSmithingTable();
        assert.ok(game.ui.activeSmithingTable, 'Smithing table active state should be initialized');

        game.ui.activeSmithingTable.base = { type: window.BLOCK.PICKAXE_DIAMOND, count: 1, durability: 10 };
        game.ui.activeSmithingTable.addition = { type: window.BLOCK.ITEM_GOLD_INGOT, count: 1 };
        game.ui.updateSmithingUI();

        assert.ok(game.ui.activeSmithingTable.output, 'Smithing table output should be generated from base and material');
        game.ui.closeSmithingTable();
        assert.strictEqual(game.ui.activeSmithingTable, null);
    });

    it('5. Bee Mob & Beehive Block System', function() {
        assert.strictEqual(window.BLOCK.BEEHIVE, 423);
        assert.strictEqual(window.MOB_TYPE.BEE, 'bee');

        const game = new window.Game();
        const bee = new window.Mob(game, 5, 40, 5, window.MOB_TYPE.BEE);
        assert.strictEqual(bee.type, 'bee');

        bee.update(0.1); // Ensure AI update doesn't throw error
        assert.ok(bee.moveTimer >= 0);

        game.world.generateChunk(0, 0);
        game.player.inventory[0] = { type: window.BLOCK.ITEM_SHEARS, count: 1 };
        game.player.selectedSlot = 0;
        game.world.setBlock(10, 40, 10, window.BLOCK.BEEHIVE);

        assert.strictEqual(game.world.getBlock(10, 40, 10), window.BLOCK.BEEHIVE);
        const handled = game.interact(10, 40, 10);
        assert.ok(handled, 'Right clicking Beehive with shears should trigger interaction');
    });
});
