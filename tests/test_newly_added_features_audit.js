const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html>
<body>
<div id="game-canvas"></div>
<div id="chat-container"></div>
<div id="chat-messages"></div>
<input id="chat-input" class="hidden">
<div id="hotbar"></div>
<div id="health-bar"></div>
<div id="hunger-bar"></div>
<div id="damage-overlay"></div>
<div id="fps"></div>
<div id="position"></div>
<div id="block-count"></div>
<div id="game-time"></div>
<div id="crafting-screen" class="hidden"></div>
<div id="crafting-recipes"></div>
<div id="close-crafting"></div>
<div id="inventory-screen" class="hidden"></div>
<div id="pause-screen" class="hidden"></div>
<div id="debug-info" class="hidden"></div>
<div id="crosshair"></div>
<div id="loading-screen"></div>
<div id="menu-screen"></div>
<button id="start-game"></button>
<button id="resume-game"></button>
<button id="return-menu"></button>
<button id="close-inventory"></button>
<div id="mobile-controls" class="hidden"></div>
<div id="joystick-container"></div>
<div id="joystick-stick"></div>
<button id="jump-btn"></button>
<button id="break-btn"></button>
<button id="place-btn"></button>
<button id="fly-btn"></button>
</body>`, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost/"
});

dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.navigator = { userAgent: "node" };

// Mock WebSocket
class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = 1;
    }
    send() {}
    close() {}
}
dom.window.WebSocket = MockWebSocket;

// Mock AudioContext
dom.window.AudioContext = class {
    constructor() {
        this.listener = { positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 }, forwardX: { value: 0 }, forwardY: { value: 0 }, forwardZ: { value: -1 }, upX: { value: 0 }, upY: { value: 1 }, upZ: { value: 0 }, setPosition: () => {}, setOrientation: () => {} };
        this.destination = {};
    }
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {}, buffer: null }; }
    createBiquadFilter() { return { connect: () => {}, frequency: { value: 0 } }; }
    createPanner() { return { connect: () => {}, positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 }, panningModel: '', distanceModel: '', refDistance: 0, maxDistance: 0, rolloffFactor: 0 }; }
    resume() {}
    get state() { return 'running'; }
    get currentTime() { return 0; }
};

// Mock Canvas
const canvas = dom.window.document.getElementById('game-canvas');
canvas.getContext = () => ({
    setTransform: () => {}, fillStyle: '', fillRect: () => {}, beginPath: () => {},
    moveTo: () => {}, lineTo: () => {}, fill: () => {}, strokeRect: () => {},
    font: '', fillText: () => {}, measureText: () => ({ width: 0 }), save: () => {},
    restore: () => {}, scale: () => {}, translate: () => {}, rotate: () => {},
    clearRect: () => {}, drawImage: () => {}
});

dom.window.perlin = { noise: () => 0 };
dom.window.localStorage = { getItem: () => null, setItem: () => {} };

const load = (f) => {
    const code = fs.readFileSync(path.join('js', f), 'utf8');
    dom.window.eval(code);
};

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'village.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'entity.js', 'vehicle.js', 'crafting.js', 'player.js', 'mob.js', 'drop.js', 'plugin.js', 'particles.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'game.js'].forEach(load);

describe('Newly Added Features Audit Suite', function() {
    this.timeout(30000);
    let game;

    beforeEach(function() {
        this.timeout(30000);
        game = new dom.window.Game();
        game.world.renderDistance = 1;
        dom.window.prompt = () => "Tester";
        game.gameLoop = () => {};
        game.init();
    });

    afterEach(function() {
        if (game && game.world && game.world.chunks) {
            game.world.chunks.clear();
        }
        game = null;
    });

    describe('Glowstone Feature Verification', function() {
        it('should have Glowstone and Glowstone Dust defined in BLOCKS', () => {
            const B = dom.window.BLOCK;
            const BS = dom.window.BLOCKS;
            assert.ok(B.GLOWSTONE, 'BLOCK.GLOWSTONE defined');
            assert.ok(B.ITEM_GLOWSTONE_DUST, 'BLOCK.ITEM_GLOWSTONE_DUST defined');
            assert.strictEqual(BS[B.GLOWSTONE].light, 15, 'Glowstone light level is 15');
            assert.strictEqual(BS[B.GLOWSTONE].drop.type, B.ITEM_GLOWSTONE_DUST, 'Glowstone drops Glowstone Dust');
            assert.strictEqual(BS[B.GLOWSTONE].drop.count, 4, 'Glowstone drops 4 dust items');
        });

        it('should have a crafting recipe for Glowstone from 4 Glowstone Dust', () => {
            const recipes = game.crafting.recipes;
            const glowstoneRecipe = recipes.find(r => r.name === 'Glowstone');
            assert.ok(glowstoneRecipe, 'Glowstone crafting recipe exists');
            assert.strictEqual(glowstoneRecipe.result.type, dom.window.BLOCK.GLOWSTONE);
            assert.strictEqual(glowstoneRecipe.result.count, 1);
            assert.strictEqual(glowstoneRecipe.ingredients[0].type, dom.window.BLOCK.ITEM_GLOWSTONE_DUST);
            assert.strictEqual(glowstoneRecipe.ingredients[0].count, 4);
        });
    });

    describe('Shield Blocking Mechanics & Durability', function() {
        it('should have Shield item definition with durability', () => {
            const B = dom.window.BLOCK;
            const BS = dom.window.BLOCKS;
            assert.ok(B.SHIELD, 'BLOCK.SHIELD defined');
            assert.strictEqual(BS[B.SHIELD].durability, 336, 'Shield durability is 336');
            assert.strictEqual(BS[B.SHIELD].isItem, true, 'Shield is an item');
        });

        it('should block 100% damage when blocking in main hand and reduce durability', () => {
            const player = game.player;
            player.inventory[0] = { type: dom.window.BLOCK.SHIELD, count: 1, durability: 336 };
            player.selectedSlot = 0;
            player.blocking = true;

            const initialHealth = player.health;
            player.takeDamage(5); // Take 5 damage while blocking

            assert.strictEqual(player.health, initialHealth, 'Health should remain unchanged when blocking');
            assert.strictEqual(player.inventory[0].durability, 335, 'Shield durability reduced by 1');
        });

        it('should block 100% damage when blocking with shield in offhand slot', () => {
            const player = game.player;
            player.inventory[0] = null;
            player.offhand = { type: dom.window.BLOCK.SHIELD, count: 1, durability: 336 };
            player.blocking = true;

            const initialHealth = player.health;
            player.takeDamage(10);

            assert.strictEqual(player.health, initialHealth, 'Health should remain unchanged when blocking via offhand');
            assert.strictEqual(player.offhand.durability, 335, 'Offhand shield durability reduced by 1');
        });

        it('should break shield when durability reaches 0', () => {
            const player = game.player;
            player.inventory[0] = { type: dom.window.BLOCK.SHIELD, count: 1, durability: 1 };
            player.selectedSlot = 0;
            player.blocking = true;

            player.takeDamage(5);

            assert.strictEqual(player.inventory[0], null, 'Shield should break and be cleared from inventory');
            assert.strictEqual(player.blocking, false, 'Player should stop blocking after shield breaks');
        });
    });

    describe('Offhand UI & Item Equipping', function() {
        it('should initialize player offhand property as null', () => {
            assert.strictEqual(game.player.offhand, null, 'Player offhand starts as null');
        });

        it('should handle offhand slot clicks to equip and unequip items', () => {
            const ui = game.ui;
            const player = game.player;

            // Put shield in cursor
            ui.cursorItem = { type: dom.window.BLOCK.SHIELD, count: 1, durability: 336 };

            // Equip into offhand
            ui.handleOffhandClick();
            assert.ok(player.offhand, 'Item equipped in offhand');
            assert.strictEqual(player.offhand.type, dom.window.BLOCK.SHIELD);
            assert.strictEqual(ui.cursorItem, null, 'Cursor item cleared after equip');

            // Unequip from offhand
            ui.handleOffhandClick();
            assert.strictEqual(player.offhand, null, 'Offhand cleared after unequip');
            assert.strictEqual(ui.cursorItem.type, dom.window.BLOCK.SHIELD, 'Item returned to cursor');
        });
    });

    describe('Glass Panes & Fences UI Assets & Inventory', function() {
        it('should have Glass Panes and Fences defined in starting inventory / UI icons', () => {
            const B = dom.window.BLOCK;
            const BS = dom.window.BLOCKS;
            assert.ok(B.GLASS_PANE, 'GLASS_PANE defined');
            assert.ok(B.FENCE, 'FENCE defined');
            assert.ok(BS[B.GLASS_PANE].icon, 'Glass Pane has valid UI icon emoji');
            assert.ok(BS[B.FENCE].icon, 'Fence has valid UI icon emoji');
        });
    });
});
