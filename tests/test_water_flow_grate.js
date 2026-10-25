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
    send(data) {}
    close() {
        this.readyState = 3;
        if (this.onclose) this.onclose();
    }
}
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

dom.window.localStorage = {
    getItem: () => null,
    setItem: () => {}
};

const load = (f) => {
    const code = fs.readFileSync(path.join('js', f), 'utf8');
    dom.window.eval(code);
};

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'village.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'entity.js', 'vehicle.js', 'crafting.js', 'player.js', 'mob.js', 'drop.js', 'plugin.js', 'particles.js', 'minimap.js', 'achievements.js', 'tutorial.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'interactions.js', 'game.js'].forEach(load);

describe('Water Flow Through Copper Grate Replacing Non-Solid Blocks Tests', function() {
    this.timeout(20000);
    let game;

    beforeEach(function(done) {
        this.timeout(20000);
        game = new dom.window.Game();
        game.world.renderDistance = 1;
        dom.window.prompt = () => "Tester";
        game.gameLoop = () => {};
        try {
            game.init();
            done();
        } catch (e) {
            console.error("game.init() failed:", e);
            done(e);
        }
    });

    afterEach(function() {
        if (game && game.network && game.network.socket) {
            game.network.socket.close();
        }
    });

    it('water should pass horizontally through copper grate and replace non-solid block', () => {
        const world = game.world;
        world.generateChunk(0, 0);

        for (let x = 3; x <= 7; x++) {
            world.setBlock(x, 9, 5, dom.window.BLOCK.STONE);
        }

        world.setBlock(5, 10, 5, dom.window.BLOCK.AIR);
        world.setBlock(6, 10, 5, dom.window.BLOCK.AIR);
        world.setBlock(7, 10, 5, dom.window.BLOCK.AIR);

        world.setBlock(5, 10, 5, dom.window.BLOCK.WATER);
        world.setMetadata(5, 10, 5, 8);

        world.setBlock(6, 10, 5, dom.window.BLOCK.COPPER_GRATE);

        world.setBlock(7, 10, 5, dom.window.BLOCK.TORCH);

        world.activeFluids.add('5,10,5');
        world.updateFluids();
        world.updateFluids();
        world.updateFluids();

        const blockPastGrate = world.getBlock(7, 10, 5);

        assert.strictEqual(blockPastGrate, dom.window.BLOCK.WATER, 'Water should pass through grate horizontally and wash away torch');
    });

    it('water should pass vertically down through copper grate and replace non-solid block', () => {
        const world = game.world;
        world.generateChunk(0, 0);

        world.setBlock(5, 10, 5, dom.window.BLOCK.AIR);
        world.setBlock(5, 9, 5, dom.window.BLOCK.AIR);
        world.setBlock(5, 8, 5, dom.window.BLOCK.AIR);

        world.setBlock(5, 10, 5, dom.window.BLOCK.WATER);
        world.setMetadata(5, 10, 5, 8);

        world.setBlock(5, 9, 5, dom.window.BLOCK.COPPER_GRATE);

        world.setBlock(5, 8, 5, dom.window.BLOCK.TORCH);

        world.activeFluids.add('5,10,5');
        world.updateFluids();
        world.updateFluids();
        world.updateFluids();

        const blockBelowGrate = world.getBlock(5, 8, 5);

        assert.strictEqual(blockBelowGrate, dom.window.BLOCK.WATER, 'Water should pass down through grate and wash away torch');
    });
});
