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

// Mock globals on dom.window
dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.navigator = { userAgent: "node" };

// Mock WebSocket
class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = 0; // CONNECTING
        setTimeout(() => {
            this.readyState = 1; // OPEN
            if (this.onopen) this.onopen();
        }, 10);
    }
    send(data) {
        if (MockWebSocket.lastSent) MockWebSocket.lastSent.push(data);
    }
    close() {
        this.readyState = 3; // CLOSED
        if (this.onclose) this.onclose();
    }
}
MockWebSocket.lastSent = [];
MockWebSocket.OPEN = 1;
MockWebSocket.CONNECTING = 0;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;
dom.window.WebSocket = MockWebSocket;

// Mock AudioContext
dom.window.AudioContext = class {
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {}, buffer: null }; }
    createBiquadFilter() { return { connect: () => {}, frequency: { value: 0 } }; }
    resume() {}
    get state() { return 'running'; }
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

// Mock Perlin
dom.window.perlin = { noise: () => 0 };

// Mock localStorage
dom.window.localStorage = {
    getItem: () => null,
    setItem: () => {}
};

// Load Code
const load = (f) => {
    const code = fs.readFileSync(path.join('js', f), 'utf8');
    dom.window.eval(code);
};

['math.js', 'blocks.js', 'chunk.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'crafting.js', 'player.js', 'mob.js', 'drop.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'game.js', 'main.js'].forEach(load);

describe('Recently Added Features Tests', () => {
    let game;

    beforeEach(function(done) {
        this.timeout(5000);

        // Reset WebSocket messages
        MockWebSocket.lastSent = [];

        // Init game
        game = new dom.window.Game();
        game.world.renderDistance = 1;
        dom.window.prompt = () => "Tester";

        // Mock game loop to prevent infinite loop but allow one update if needed
        game.gameLoop = () => {};

        try {
            game.init();
        } catch (e) {
            console.error("game.init() failed:", e);
            done(e);
            return;
        }

        // Wait for connection
        setTimeout(() => {
            done();
        }, 100);
    });

    describe('Sheep Mob', () => {
        it('should be initialized correctly', () => {
            const sheep = new dom.window.Mob(game, 0, 0, 0, dom.window.MOB_TYPE.SHEEP);
            assert.strictEqual(sheep.type, dom.window.MOB_TYPE.SHEEP);
            assert.strictEqual(sheep.maxHealth, 8);
            assert.strictEqual(sheep.color, '#FFFFFF');
        });

        it('should drop wool and potentially mutton when killed', () => {
            const sheep = new dom.window.Mob(game, 10, 10, 10, dom.window.MOB_TYPE.SHEEP);
            game.drops = []; // Clear existing drops

            // Mock random to ensure mutton drops (Math.random() < 0.5)
            // We need to override dom.window.Math.random temporarily
            const originalRandom = dom.window.Math.random;
            dom.window.Math.random = () => 0.1; // Force < 0.5

            sheep.takeDamage(100); // Kill it

            dom.window.Math.random = originalRandom; // Restore

            assert.strictEqual(sheep.isDead, true);

            // Check drops
            // Sheep drops Wool (ITEM_WOOL) and Mutton (ITEM_MUTTON)
            const woolDrop = game.drops.find(d => d.type === dom.window.BLOCK.ITEM_WOOL);
            const muttonDrop = game.drops.find(d => d.type === dom.window.BLOCK.ITEM_MUTTON);

            assert.ok(woolDrop, "Should drop Wool");
            assert.ok(muttonDrop, "Should drop Mutton");
        });
    });

    describe('Sprinting', () => {
        it('should increase speed and hunger drain when sprinting', () => {
            const player = game.player;
            player.hunger = 20;
            game.controls.forward = true;
            game.controls.sprint = true;
            game.controls.sneak = false;
            player.onGround = true;

            // Capture initial state
            const initialHungerTimer = player.hungerTimer;
            const dt = 0.1; // 100ms

            // Mock checkCollision to return false so we can move
            game.physics.checkCollision = () => false;

            player.update(dt);

            assert.strictEqual(player.sprinting, true, "Player should be sprinting");

            // Check hunger timer increased by dt * 2 (logic is hungerTimer += dt * 2)
            // Initial is 0 (or whatever reset value).
            // Actually player.hungerTimer += dt * 2 is added. Plus the normal update loop logic?
            // In Player.update:
            // this.hungerTimer += dt;
            // if (sprinting) this.hungerTimer += dt * 2;
            // So total increase is 3 * dt?
            // Let's re-read Player.js logic.
            // "this.hungerTimer += dt;" is at start.
            // "if (sprinting) ... this.hungerTimer += dt * 2;"

            // So total added = dt + 2*dt = 3*dt.

            // But verify:
            // We created a new player, hungerTimer is 0.
            // update(0.1) -> hungerTimer += 0.1.
            // sprinting -> hungerTimer += 0.2.
            // total should be roughly 0.3.

            assert.ok(player.hungerTimer > dt * 2, "Hunger timer should increase faster than normal time");
        });
    });

    describe('Fall Damage', () => {
        it('should take fall damage when falling on ground', () => {
            const player = game.player;
            player.flying = false;
            player.x = 0; player.y = 20; player.z = 0;
            player.vy = -10; // Falling fast

            // Mock Physics
            game.physics.getFluidIntersection = () => false; // Not in water

            // Mock collision to simulate hitting ground on Y axis
            // moveBy checks X, Z, then Y.
            // We want Y check to return true.
            game.physics.checkCollision = (box) => {
                // If box.y is below current y (falling check), return true
                const isFallingCheck = box.y < player.y;
                if (isFallingCheck) return true;
                return false;
            };

            player.fallDistance = 10; // Fallen 10 blocks

            // Mock takeDamage
            let damageTaken = 0;
            player.takeDamage = (amount) => { damageTaken = amount; };

            player.update(0.1);

            // Logic: if (fallDistance > 3) damage = floor(fallDistance - 3)
            // Player falls due to gravity in this frame.
            // vy = -10 - (25 * 0.1) = -12.5. dy = -1.25.
            // y moves from 20 to 18.75.
            // Snaps to floor(18.75) + 1 = 19.
            // Total fall = 10 + (20 - 19) = 11.
            // Damage = 11 - 3 = 8.
            assert.strictEqual(damageTaken, 8, "Should take correct fall damage");
        });

        it('should NOT take fall damage when falling into water', () => {
            const player = game.player;
            player.flying = false;
            player.fallDistance = 10;

            // Mock falling into water
            game.physics.getFluidIntersection = () => true; // In water

            let damageTaken = 0;
            player.takeDamage = (amount) => { damageTaken = amount; };

            player.update(0.1);

            assert.strictEqual(player.fallDistance, 0, "Fall distance should reset in water");
            assert.strictEqual(damageTaken, 0, "Should not take damage");
        });
    });

    describe('Eating', () => {
        it('should restore hunger when eating food', () => {
            const player = game.player;
            player.hunger = 10;
            player.maxHunger = 20;

            // Use Apple (ITEM_APPLE, ID 215, food: 4)
            const success = player.eat(dom.window.BLOCK.ITEM_APPLE);

            assert.strictEqual(success, true, "Should eat successfully");
            assert.strictEqual(player.hunger, 14, "Hunger should increase by 4");
        });

        it('should not exceed max hunger', () => {
            const player = game.player;
            player.hunger = 19;
            player.eat(dom.window.BLOCK.ITEM_APPLE);
            assert.strictEqual(player.hunger, 20, "Hunger should cap at max");
        });
    });

    describe('Crafting drops when inventory full', () => {
        it('should drop item if inventory is full', () => {
            const player = game.player;

            // Fill inventory
            for (let i = 0; i < player.inventory.length; i++) {
                player.inventory[i] = { type: dom.window.BLOCK.DIRT, count: 64 };
            }

            // Mock recipe: Sticks from Planks
            // Recipe: 2 Planks -> 4 Sticks
            // We need to have ingredients in inventory first?
            // Wait, if inventory is full of Dirt, we can't craft unless we replace ingredients.
            // But if result (4 items) doesn't stack or fit in empty slots (which created by removing ingredients).

            // Let's create a scenario where we have ingredients but result overflows.
            // Stick recipe: 2 Planks -> 4 Sticks.
            // If we have 2 Planks in one slot. Removing them frees 1 slot.
            // 4 Sticks go into that slot. No overflow.

            // Need a recipe where output slot count > input slot count freed.
            // Or output type doesn't stack with anything.

            // Example: 1 Log -> 4 Planks.
            // Setup:
            // Slot 0: 1 Log.
            // All other slots: Full of Dirt.
            // Crafting consumes 1 Log (Slot 0 becomes empty).
            // Result 4 Planks goes into Slot 0. No overflow.

            // What if we have scattered ingredients?
            // Slot 0: 1 Plank. Slot 1: 1 Plank. (2 Planks total).
            // Recipe: Sticks (needs 2 Planks).
            // Consumes Slot 0 (empty), Slot 1 (empty).
            // Frees 2 slots. Result 1 stack of sticks. Fits.

            // We need a case where we craft something but have NO space.
            // But to craft, we must have ingredients, so we must have at least 1 slot with ingredients.
            // When we craft, ingredients are removed.

            // Unless ingredients are NOT consumed? No, they are.

            // Maybe if we have a full inventory of ingredients, and the result is a DIFFERENT type that doesn't stack with existing, AND we receive MORE stacks than we freed?
            // Most recipes are condensing (multiple items -> 1 item) or 1->many.

            // 1 Log -> 4 Planks.
            // Slot 0: 64 Logs.
            // Craft once: 63 Logs remain. Slot 0 occupied.
            // Result: 4 Planks. Need new slot.
            // If all other slots full: DROPS!

            // Setup:
            // Slot 0: 64 Wood.
            // Slots 1-35: 64 Dirt.
            game.player.inventory[0] = { type: dom.window.BLOCK.WOOD, count: 64 };
            for (let i = 1; i < 36; i++) {
                game.player.inventory[i] = { type: dom.window.BLOCK.DIRT, count: 64 };
            }

            // Find recipe for Planks (Index 0 usually)
            // Recipe 0: "Planks (4)" from Wood (1)

            game.drops = [];
            // Mock alert to avoid console spam/errors
            dom.window.alert = () => {};

            // Craft
            game.crafting.craft(0); // Index 0 is Planks

            // Result:
            // Slot 0 should be 63 Wood.
            // Planks cannot fit.
            // Should drop 4 Planks.

            assert.strictEqual(game.player.inventory[0].count, 63, "Should consume 1 Wood");

            const drop = game.drops.find(d => d.type === dom.window.BLOCK.PLANK);
            assert.ok(drop, "Should drop Planks");
            assert.strictEqual(drop.count, 4, "Should drop 4 Planks");
        });
    });
});
