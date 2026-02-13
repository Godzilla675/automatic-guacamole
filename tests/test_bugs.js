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
<div id="recipe-list"></div>
<div id="furnace-screen">
    <div id="furnace-input"></div>
    <div id="furnace-fuel"></div>
    <div id="furnace-output"></div>
    <div id="furnace-progress"></div>
    <div id="furnace-burn"></div>
    <div id="close-furnace"></div>
</div>
<div id="inventory-screen">
    <div id="inventory-grid"></div>
</div>
<div id="crafting-screen"></div>
<div id="crafting-recipes"></div>
<div id="close-crafting"></div>
<div id="settings-screen" class="hidden">
    <input id="volume-slider" type="range">
    <div id="close-settings"></div>
</div>
<div id="pause-screen" class="hidden"></div>
<div id="recipe-book-screen" class="hidden"></div>
</body>`, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost/"
});

// Mock globals
dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.navigator = { userAgent: "node", maxTouchPoints: 0 };
dom.window.alert = (msg) => {};

// Mock WebSocket
class MockWebSocket {
    constructor(url) {
        this.readyState = 1;
    }
    send(data) {}
    close() {}
}
dom.window.WebSocket = MockWebSocket;

// Mock AudioContext
dom.window.AudioContext = class {
    constructor() {
        this.listener = { positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 }, forwardX: { value: 0 }, forwardY: { value: 0 }, forwardZ: { value: -1 }, upX: { value: 0 }, upY: { value: 1 }, upZ: { value: 0 }, setPosition: () => {}, setOrientation: () => {} };
        this.destination = {};
    }
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
    createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
    createPanner() { return { connect: () => {}, positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 }, panningModel: '', distanceModel: '', refDistance: 0, maxDistance: 0, rolloffFactor: 0 }; }
    resume() {}
    get state() { return 'running'; }
    get currentTime() { return 0; }
};

// Mock Canvas
const canvas = dom.window.document.getElementById('game-canvas');
canvas.getContext = () => ({
    setTransform: () => {},
    fillStyle: '',
    fillRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    fill: () => {},
    strokeRect: () => {},
    font: '',
    fillText: () => {},
    measureText: () => ({ width: 0 }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    clearRect: () => {},
    save: () => {},
    restore: () => {},
    scale: () => {},
    translate: () => {},
    rotate: () => {},
});
canvas.requestPointerLock = () => {};
dom.window.document.exitPointerLock = () => {};

// Mock Perlin
dom.window.perlin = { noise: () => 0 };

// Mock localStorage
dom.window.localStorage = {
    getItem: () => null,
    setItem: () => {},
    clear: () => {}
};

dom.window.prompt = () => "Tester";

// Load Code
const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error("Error loading " + f, e);
    }
};

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'entity.js', 'vehicle.js', 'drop.js', 'crafting.js', 'player.js', 'mob.js', 'plugin.js', 'particles.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'game.js'].forEach(load);

describe('Bug Verification', () => {
    let game;

    before(function(done) {
        this.timeout(5000);
        game = new dom.window.Game();
        game.world.renderDistance = 1;
        game.gameLoop = () => {};
        dom.window.requestAnimationFrame = (cb) => {};

        try {
            game.init().then(() => {}).catch(e => console.error(e));
        } catch (e) {}

        setTimeout(() => {
            game.gameLoop = () => {};
            // Mock sound manager
            dom.window.soundManager = { play: () => {}, updateAmbience: () => {}, volume: 1.0 };
            done();
        }, 500);
    });

    it('should allow Cows to breed with Wheat Item', () => {
        const cow = new dom.window.Mob(game, 0, 50, 0, dom.window.MOB_TYPE.COW);
        game.mobs.push(cow);

        // Current Code check: if (this.type === MOB_TYPE.COW ... ) food = BLOCK.WHEAT (24);
        // Player holds BLOCK.ITEM_WHEAT (221).

        const wheatItemType = dom.window.BLOCK.ITEM_WHEAT;

        // Try interaction
        const result = cow.interact(wheatItemType);

        assert.strictEqual(result, true, "Cow should accept Wheat Item for breeding");
        assert.ok(cow.loveTimer > 0, "Cow should enter love mode");
    });

    it('should populate Recipe Book', () => {
        // Ensure crafting recipes exist
        assert.ok(game.crafting.recipes.length > 0, "Recipes should exist");

        // Unlock all recipes so they all appear
        if (game.player.unlockedRecipes) {
            game.crafting.recipes.forEach(r => game.player.unlockedRecipes.add(r.name));
        }

        // Trigger render
        game.ui.renderRecipeBook();

        const list = dom.window.document.getElementById('recipe-list');
        assert.ok(list.children.length > 0, "Recipe book should have entries");
    });

    it('Fishing Bobber should work', () => {
        // Cast
        game.castBobber();
        assert.ok(game.bobber, "Bobber should exist after cast");
        assert.strictEqual(game.bobber.state, 'flying');

        // Force landed state
        game.bobber.state = 'hooked';

        // Reel in
        const initialDrops = game.drops.length;
        game.reelInBobber();

        assert.strictEqual(game.bobber, null, "Bobber should be gone");
        assert.strictEqual(game.drops.length, initialDrops + 1, "Should drop fish");
        assert.strictEqual(game.drops[game.drops.length-1].type, dom.window.BLOCK.ITEM_RAW_FISH, "Drop should be Raw Fish");
    });
});
