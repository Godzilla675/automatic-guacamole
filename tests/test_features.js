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

// Mock globals
dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.navigator = { userAgent: "node", maxTouchPoints: 0 };

// Mock WebSocket
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
dom.window.WebSocket = MockWebSocket;

// Mock AudioContext
dom.window.AudioContext = class {
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { value: 0, setTargetAtTime: () => {}, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }; }
    createBuffer() { return { getChannelData: () => new Float32Array(1024) }; }
    createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
    createBiquadFilter() { return { connect: () => {} }; }
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
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: function(key) { return store[key] || null; },
        setItem: function(key, value) { store[key] = value.toString(); },
        clear: function() { store = {}; },
        removeItem: function(key) { delete store[key]; }
    };
})();
dom.window.localStorage = localStorageMock;

// Mock Prompt
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

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures.js', 'world.js', 'physics.js', 'audio.js', 'network.js', 'drop.js', 'crafting.js', 'player.js', 'mob.js', 'chat.js', 'ui.js', 'input.js', 'renderer.js', 'game.js'].forEach(load);

describe('Comprehensive Feature Test', () => {
    let game;

    before(function(done) {
        this.timeout(10000);
        game = new dom.window.Game();
        // Reduce render distance to speed up init
        game.world.renderDistance = 1;

        // Override loop to stop it
        game.gameLoop = () => {};

        // Mock requestAnimationFrame
        dom.window.requestAnimationFrame = (cb) => {};

        try {
            game.init().then(() => {
                 // Init done
            }).catch(e => {
                console.error("Game init failed:", e);
            });
        } catch (e) {
            console.error("Game init sync error:", e);
        }

        // Give it a bit of time to settle (like socket connection)
        setTimeout(() => {
            game.gameLoop = () => {};
            done();
        }, 500);
    });

    describe('Crafting System', () => {
        it('should craft Planks from Wood', () => {
            const woodIdx = dom.window.BLOCK.WOOD;
            const plankIdx = dom.window.BLOCK.PLANK;

            // Clear inventory
            game.player.inventory.fill(null);

            // Give Wood
            game.player.inventory[0] = { type: woodIdx, count: 1 };

            // Find Plank recipe
            const recipeIdx = game.crafting.recipes.findIndex(r => r.result.type === plankIdx);
            assert.ok(recipeIdx >= 0, "Plank recipe found");

            game.crafting.craft(recipeIdx);

            // Check inventory: Wood gone, Planks added
            assert.strictEqual(game.player.inventory[0].type, plankIdx, "Should have Planks");
            assert.strictEqual(game.player.inventory[0].count, 4, "Should have 4 Planks");
        });

        it('should craft Stick from Planks', () => {
            const plankIdx = dom.window.BLOCK.PLANK;
            const stickIdx = dom.window.BLOCK.ITEM_STICK;

            game.player.inventory.fill(null);
            game.player.inventory[0] = { type: plankIdx, count: 2 };

            const recipeIdx = game.crafting.recipes.findIndex(r => r.result.type === stickIdx);

            game.crafting.craft(recipeIdx);

            assert.strictEqual(game.player.inventory[0].type, stickIdx);
            assert.strictEqual(game.player.inventory[0].count, 4);
        });

        it('should craft Wood Pickaxe', () => {
            const plankIdx = dom.window.BLOCK.PLANK;
            const stickIdx = dom.window.BLOCK.ITEM_STICK;
            const pickIdx = dom.window.BLOCK.PICKAXE_WOOD;

            game.player.inventory.fill(null);
            game.player.inventory[0] = { type: plankIdx, count: 3 };
            game.player.inventory[1] = { type: stickIdx, count: 2 };

            const recipeIdx = game.crafting.recipes.findIndex(r => r.result.type === pickIdx);

            game.crafting.craft(recipeIdx);

            // Should consume planks (3) and sticks (2)
            // Inventory[0] and [1] become empty, then result is added to first empty slot (0)

            const pickaxe = game.player.inventory.find(i => i && i.type === pickIdx);
            assert.ok(pickaxe, "Pickaxe crafted and found in inventory");

            // Check that we don't have planks or sticks left
            const planks = game.player.inventory.find(i => i && i.type === plankIdx);
            const sticks = game.player.inventory.find(i => i && i.type === stickIdx);
            assert.strictEqual(planks, undefined, "All planks consumed");
            assert.strictEqual(sticks, undefined, "All sticks consumed");
        });
    });

    describe('Mobs', () => {
        it('should spawn a mob', () => {
            const initCount = game.mobs.length;
            game.mobs.push(new dom.window.Mob(game, 0, 50, 0, dom.window.MOB_TYPE.SHEEP));
            assert.strictEqual(game.mobs.length, initCount + 1);
        });

        it('should take damage and die', () => {
            const mob = new dom.window.Mob(game, 0, 50, 0, dom.window.MOB_TYPE.COW);
            game.mobs.push(mob);

            const startHealth = mob.health;
            mob.takeDamage(5);
            assert.strictEqual(mob.health, startHealth - 5, "Health decreased");

            mob.takeDamage(100); // Kill
            assert.strictEqual(mob.isDead, true, "Mob is dead");

            // Update game to process drops
            // The Mob.die() method adds drops to game.drops immediately
            // But we need to ensure game.drops is checked
             const hasLeather = game.drops.some(d => d.type === dom.window.BLOCK.ITEM_LEATHER);
             // Note: Cow drops leather with 50% chance in the code I read
             // We can't guarantee it, but we can check if code ran without error.
        });

        it('Sheep should drop Wool', () => {
            const mob = new dom.window.Mob(game, 0, 50, 0, dom.window.MOB_TYPE.SHEEP);
            // Mock drops array empty
            game.drops = [];
            mob.die();

            const hasWool = game.drops.some(d => d.type === dom.window.BLOCK.WOOL_WHITE);
            assert.strictEqual(hasWool, true, "Sheep dropped wool");
        });
    });

    describe('Player Core', () => {
        it('Hunger should decay', () => {
            game.player.hunger = 20;
            game.player.hungerTimer = 29.9; // Almost tick
            game.player.update(0.2); // Advance time

            assert.strictEqual(game.player.hunger, 19, "Hunger decayed");
        });

        it('Eating should restore hunger', () => {
            game.player.hunger = 10;
            const porkIdx = dom.window.BLOCK.ITEM_PORKCHOP; // Food value 8

            // eat method takes type
            const result = game.player.eat(porkIdx);

            assert.strictEqual(result, true, "Ate food");
            assert.strictEqual(game.player.hunger, 18, "Hunger restored");
        });

        it('Fall Damage', () => {
            game.player.health = 20;
            game.player.flying = false;
            game.player.onGround = false;

            // Simulate falling
            game.player.y = 50;
            const prevY = 60;
            game.player.vy = -20; // Falling fast

            // To test fall damage logic in update:
            // It needs oldVy < 0 (set above)
            // It calculates distance += prevY - y
            // Then checks onGround.

            // 1. Air frame
            game.player.fallDistance = 0;
            // Hack to simulate the logic inside update without full physics loop
            // update() calls moveBy() which sets onGround=true if collision.

            // Let's manually trigger the fall logic part if possible, or simulate conditions
            // We'll trust the update function logic if we can control it.

            // Let's set fall distance manually and trigger landing
            game.player.fallDistance = 10; // > 3
            game.player.onGround = true;

            // Calling update with 0 dt to just run checks?
            // update resets fallDistance if onGround.

            // We need to trick update logic.
            // checking code:
            // if (!this.flying && !inWater) {
            //    if (oldVy < 0) this.fallDistance += (prevY - this.y);
            //    if (this.onGround) { if (fallDist > 3) takeDamage... }
            // }

            // We can just call update(0.1) but we need to ensure moveBy doesn't reset onGround to false if we are not colliding?
            // Actually moveBy checks collision. If we are at 50, and 49 is solid...

            // Let's simplify: directly invoke damage logic logic if we want, or set up world.
            // Setup world
            game.world.setBlock(8, 49, 8, dom.window.BLOCK.STONE);
            game.player.x = 8.5;
            game.player.z = 8.5;
            game.player.y = 50;
            game.player.vy = -10;
            game.player.fallDistance = 6;

            // Run update. moveBy should hit ground.
            game.player.update(0.016);

            // Expect damage: 6 - 3 = 3 damage.
            assert.ok(game.player.health < 20, "Took damage");
            assert.strictEqual(game.player.fallDistance, 0, "Fall distance reset");
        });
    });

    describe('Physics', () => {
        it('Crouch should reduce height', () => {
            game.controls.sneak = true;
            game.player.onGround = true; // Needs to be on ground
            game.player.flying = false;

            game.player.update(0.016);

            assert.strictEqual(game.player.height, 1.5, "Height reduced");

            game.controls.sneak = false;
            game.player.update(0.016);
            assert.strictEqual(game.player.height, 1.8, "Height restored");
        });
    });

    describe('Saving', () => {
        it('should save and load world', () => {
            game.world.setBlock(0, 50, 0, dom.window.BLOCK.ORE_GOLD);
            game.world.saveWorld('test_slot');

            // Clear
            game.world.setBlock(0, 50, 0, dom.window.BLOCK.AIR);
            assert.strictEqual(game.world.getBlock(0, 50, 0), dom.window.BLOCK.AIR);

            // Load
            game.world.loadWorld('test_slot');

            assert.strictEqual(game.world.getBlock(0, 50, 0), dom.window.BLOCK.ORE_GOLD, "Block restored");
        });
    });

    describe('Commands', () => {
        it('/fill command', () => {
            // Use chat manager
            game.chat.handleCommand('/fill 0 60 0 2 60 2 stone');

            // Check center
            const b = game.world.getBlock(1, 60, 1);
            assert.strictEqual(b, dom.window.BLOCK.STONE, "Block filled");
        });
    });
});
