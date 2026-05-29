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

dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.navigator = { userAgent: "node", maxTouchPoints: 0 };
dom.window.alert = (msg) => {};

class MockWebSocket {
    constructor(url) { this.readyState = 1; }
    send(data) {}
    close() {}
}
dom.window.WebSocket = MockWebSocket;

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

const canvas = dom.window.document.getElementById('game-canvas');
canvas.getContext = () => ({
    setTransform: () => {}, fillStyle: '', fillRect: () => {}, beginPath: () => {},
    moveTo: () => {}, lineTo: () => {}, fill: () => {}, strokeRect: () => {}, font: '',
    fillText: () => {}, measureText: () => ({ width: 0 }),
    createLinearGradient: () => ({ addColorStop: () => {} }), clearRect: () => {},
    save: () => {}, restore: () => {}, scale: () => {}, translate: () => {}, rotate: () => {},
});
canvas.requestPointerLock = () => {};
dom.window.document.exitPointerLock = () => {};

dom.window.perlin = { noise: () => 0 };
dom.window.localStorage = { getItem: () => null, setItem: () => {}, clear: () => {} };
dom.window.prompt = () => "Tester";

const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error("Error loading " + f, e);
    }
};

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'village.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'entity.js', 'vehicle.js', 'drop.js', 'crafting.js', 'player.js', 'mob.js', 'plugin.js', 'particles.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'game.js'].forEach(load);

describe('Tool Durability', () => {
    let game;
    const BLOCK = dom.window.BLOCK;
    const TOOLS = dom.window.TOOLS;

    before(function(done) {
        this.timeout(10000);
        game = new dom.window.Game();
        game.world.renderDistance = 1;
        game.gameLoop = () => {};
        dom.window.requestAnimationFrame = (cb) => {};
        dom.window.soundManager = { play: () => {}, updateAmbience: () => {}, volume: 1.0 };
        try {
            game.init();
            done();
        } catch (e) {
            console.error(e);
            done(e);
        }
    });

    after(function() {
        if (game && game.network && game.network.socket) {
            game.network.socket.close();
        }
    });

    it('should decrease bow durability when firing an arrow', function() {
        game.player.gamemode = 0;
        const slot = game.player.selectedSlot;
        game.player.inventory[slot] = { type: BLOCK.BOW, count: 1 };
        // Provide arrows in another slot
        const arrowSlot = (slot + 1) % game.player.inventory.length;
        game.player.inventory[arrowSlot] = { type: BLOCK.ITEM_ARROW, count: 5 };

        game.startAction(false); // right click fires the bow

        const bow = game.player.inventory[slot];
        assert.ok(bow, "Bow should still be in inventory");
        assert.strictEqual(bow.durability, TOOLS[BLOCK.BOW].durability - 1, "Bow durability should decrease by 1 after firing");
    });

    it('should decrease melee weapon durability when attacking a mob', function() {
        game.player.gamemode = 0;
        const slot = game.player.selectedSlot;
        game.player.inventory[slot] = { type: BLOCK.SWORD_DIAMOND, count: 1 };

        // Spawn a mob directly in front of the player, aligned with eye height
        game.player.yaw = 0;
        game.player.pitch = 0;
        const eyeY = game.player.y + game.player.height * 0.9;
        const mob = new dom.window.Mob(game, game.player.x, eyeY - 0.2, game.player.z + 1.5, dom.window.MOB_TYPE.COW);
        game.mobs.push(mob);

        game.startAction(true); // left click attacks

        const sword = game.player.inventory[slot];
        assert.ok(sword, "Sword should still be in inventory");
        assert.strictEqual(sword.durability, TOOLS[BLOCK.SWORD_DIAMOND].durability - 1, "Sword durability should decrease by 1 after attacking");
    });
});
