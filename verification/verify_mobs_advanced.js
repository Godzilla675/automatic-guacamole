const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html><body>
<canvas id="game-canvas"></canvas>
<div id="chat-input"></div><div id="chat-messages"></div>
<div id="hotbar"></div>
<button id="settings-btn"></button><button id="close-settings"></button>
<input id="volume-slider" type="range"><input id="fov-slider" type="range"><input id="render-dist-slider" type="range">
<button id="reset-controls"></button><button id="pause-btn"></button>
<button id="close-furnace"></button>
<div id="furnace-input"></div><div id="furnace-fuel"></div><div id="furnace-output"></div>
<button id="open-recipe-book"></button><button id="close-recipe-book"></button>
<button id="close-trading"></button>
<div id="trading-screen"></div><div id="trading-list"></div>
<button id="close-chest"></button>
<div id="settings-screen"></div><div id="pause-screen"></div>
<div id="fov-value"></div><div id="render-dist-value"></div>
<div id="keybinds-list"></div>
<div id="chest-screen"></div><div id="inventory-screen"></div><div id="inventory-grid"></div><div id="chest-grid"></div>
<div id="crafting-screen"></div><div id="recipe-book-screen"></div><div id="recipe-list"></div>
<div id="furnace-screen"></div><div id="furnace-progress"></div><div id="furnace-burn"></div>
<div id="health-bar"></div><div id="hunger-bar"></div><div id="damage-overlay"></div>
<div id="mobile-controls"></div>
<div id="crosshair"></div>
</body>`, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost/"
});

dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.navigator = { userAgent: "node" };
dom.window.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
dom.window.AudioContext = class { createGain() { return { gain: { value: 1, linearRampToValueAtTime: () => {} }, connect: () => {} }; } };
dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 16);
dom.window.soundManager = { play: () => {}, updateAmbience: () => {} };

// Mock Canvas
dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform: () => {},
    clearRect: () => {},
    fillRect: () => {},
    drawImage: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    fillText: () => {},
    save: () => {},
    restore: () => {},
    scale: () => {},
    rotate: () => {},
    translate: () => {},
    clip: () => {},
    createPattern: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    arc: () => {},
    closePath: () => {},
    rect: () => {},
    imageSmoothingEnabled: true
});

const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error(`Failed to load ${f}:`, e);
    }
};

// Load dependencies
['math.js', 'blocks.js', 'particles.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'physics.js',
 'player.js', 'mob.js', 'drop.js', 'crafting.js', 'chat.js', 'ui.js', 'network.js', 'input.js', 'renderer.js', 'game.js']
.forEach(load);

const { Game, Mob, MOB_TYPE, BLOCK } = dom.window;

describe('Advanced Mob Logic Verification', () => {
    let game;

    beforeEach(() => {
        game = new Game();
        // Clear mocks
        game.mobs = [];
    });

    it('should verify Iron Golem attacks Zombie', () => {
        // Place Golem at 0,0,0
        const golem = new Mob(game, 0, 10, 0, MOB_TYPE.IRON_GOLEM);
        game.mobs.push(golem);

        // Place Zombie at 5,0,0
        const zombie = new Mob(game, 5, 10, 0, MOB_TYPE.ZOMBIE);
        game.mobs.push(zombie);

        // Update Golem AI
        golem.updateAI(0.1);

        // Golem should target Zombie
        // Check velocity. Should move towards 5,0,0.
        // vx should be positive.
        assert.ok(golem.vx > 0, "Iron Golem should move towards Zombie (positive VX)");

        // Move closer to attack range (< 1.5)
        golem.x = 4.0;
        golem.z = 0;

        // Mock takeDamage on Zombie to spy
        let damageTaken = 0;
        zombie.takeDamage = (amount) => { damageTaken = amount; };

        golem.updateAI(0.1);

        // Should attack
        assert.ok(damageTaken > 0, "Iron Golem should attack Zombie when close");
    });

    it('should verify Villager Trading Interaction', () => {
        const villager = new Mob(game, 0, 10, 0, MOB_TYPE.VILLAGER);
        game.mobs.push(villager);

        let tradingOpened = false;
        // Mock UI openTrading
        game.ui.openTrading = (v) => {
            tradingOpened = true;
            assert.strictEqual(v, villager, "Should open trading for correct villager");
        };

        // Interact
        const result = villager.interact();

        assert.ok(result, "Interaction should return true");
        assert.ok(tradingOpened, "Trading UI should open");
    });
});
