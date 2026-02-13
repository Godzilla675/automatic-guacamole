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

class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = 0;
        setTimeout(() => {
            this.readyState = 1;
            if (this.onopen) this.onopen();
        }, 10);
    }
    send(data) {
        if (MockWebSocket.lastSent) MockWebSocket.lastSent.push(data);
    }
    close() {
        this.readyState = 3;
        if (this.onclose) this.onclose();
    }
}
MockWebSocket.lastSent = [];
MockWebSocket.OPEN = 1;
MockWebSocket.CONNECTING = 0;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;
dom.window.WebSocket = MockWebSocket;

dom.window.AudioContext = class {
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {}, buffer: null }; }
    createBiquadFilter() { return { connect: () => {}, frequency: { value: 0 } }; }
    resume() {}
    get state() { return 'running'; }
};

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
    save: () => {},
    restore: () => {},
    scale: () => {},
    translate: () => {},
    rotate: () => {},
    clearRect: () => {},
    drawImage: () => {},
});
canvas.requestPointerLock = () => {};
dom.window.document.exitPointerLock = () => {};

dom.window.perlin = { noise: () => 0 };
dom.window.localStorage = { getItem: () => null, setItem: () => {} };

const load = (f) => {
    const code = fs.readFileSync(path.join('js', f), 'utf8');
    dom.window.eval(code);
};

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'entity.js', 'vehicle.js', 'crafting.js', 'player.js', 'mob.js', 'drop.js', 'plugin.js', 'particles.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'game.js', 'main.js'].forEach(load);

describe('Cactus Damage Tests', () => {
    let game;

    beforeEach(function(done) {
        this.timeout(5000);
        MockWebSocket.lastSent = [];
        game = new dom.window.Game();
        game.world.renderDistance = 1;
        dom.window.prompt = () => "Tester";
        game.gameLoop = () => {};
        try {
            game.init();
        } catch (e) {
            console.error("game.init() failed:", e);
            done(e);
            return;
        }
        setTimeout(() => {
            done();
        }, 100);
    });

    it('should damage player when too close to cactus', () => {
        const world = game.world;
        const player = game.player;

        world.generateChunk(0, 0);

        // Place Cactus at 10, 10, 10
        world.setBlock(10, 10, 10, dom.window.BLOCK.CACTUS);

        // Player Width is 0.6.
        // Cactus is at 10.0 to 11.0 (assuming block coordinates fill the block).
        // Actually, coordinate 10 means x from 10.0 to 11.0.
        // Center of block is 10.5.

        // Player position is center of player.
        // If player is at 9.3. Radius is 0.3.
        // Player extent: 9.0 to 9.6.
        // Buffer is 0.2 (0.1 each side).
        // Expanded Box Min X = 9.3 - 0.3 - 0.1 = 8.9.
        // Expanded Box Max X = 9.3 + 0.3 + 0.1 = 9.7.
        // Cactus Min X is 10.0.
        // No collision.

        // Wait, let's look at Physics.getCollidingBlocks logic.
        // minX = floor(box.x - width/2).
        // maxX = floor(box.x + width/2).

        // If we want to hit block 10.
        // We need maxX >= 10.
        // floor(9.3 + 0.4) = floor(9.7) = 9.

        // We need player closer.
        // Try 9.7.
        // Max X = floor(9.7 + 0.4) = floor(10.1) = 10.
        // It hits block 10!

        // Is 9.7 physically possible without colliding?
        // Player collision width 0.6.
        // Max X for collision = floor(9.7 + 0.3) = floor(10.0) = 10.
        // Yes, at 9.7, the player collides with block 10 if it's solid.
        // Cactus IS solid.
        // So physics would stop player at X where maxX < 10.
        // i.e. floor(x + 0.3) < 10. x + 0.3 < 10. x < 9.7.
        // So player stops at 9.6999.

        // If player is at 9.69.
        // Damage check uses width + 0.2 => 0.8 width. Radius 0.4.
        // Max X for damage = floor(9.69 + 0.4) = floor(10.09) = 10.
        // It hits block 10!

        // So yes, damage range extends further than collision range.

        player.x = 9.69;
        player.y = 10;
        player.z = 10.5; // Centered on Z relative to block

        // Disable falling for stability
        player.flying = true;

        const initialHealth = player.health;

        // Mock lastDamageTime to ensure damage can be taken
        player.lastDamageTime = 0;

        player.update(0.1);

        assert.ok(player.health < initialHealth, "Player health should decrease");
    });
});
