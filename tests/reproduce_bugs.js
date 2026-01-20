const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');
const path = require('path');

// Read files first
const files = [
    'blocks.js',
    'math.js',
    'chunk.js',
    'world.js',
    'physics.js',
    'player.js',
    'network.js',
    'crafting.js',
    'mob.js',
    'main.js'
];

const scripts = files.map(f => fs.readFileSync(path.join(__dirname, '../js', f), 'utf8'));

// Create DOM with scripts execution enabled
const dom = new JSDOM(`
<!DOCTYPE html>
<body>
  <div id="chat-container"></div>
  <div id="chat-messages"></div>
  <input id="chat-input">
  <div id="debug-info"></div>
  <div id="inventory-screen"></div>
  <div id="crafting-screen"></div>
  <div id="pause-screen"></div>
  <div id="hotbar"></div>
  <div id="health-bar"></div>
  <div id="damage-overlay"></div>
  <div id="crosshair"></div>
  <div id="fps"></div>
  <div id="position"></div>
  <div id="block-count"></div>
  <div id="game-time"></div>
  <div id="loading-screen"></div>
  <div id="menu-screen"></div>
  <button id="start-game"></button>
  <button id="resume-game"></button>
  <button id="return-menu"></button>
  <button id="close-inventory"></button>
  <div id="crafting-recipes"></div>
  <button id="close-crafting"></button>
  <div id="mobile-controls"></div>
  <div id="joystick-container"></div>
  <div id="joystick-stick"></div>
  <button id="jump-btn"></button>
  <button id="break-btn"></button>
  <button id="place-btn"></button>
  <button id="fly-btn"></button>
  <canvas id="game-canvas"></canvas>
</body>
`, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost/"
});

global.window = dom.window;
global.document = dom.window.document;

// Mock SoundManager
dom.window.soundManager = { play: () => {} };
// Mock Alert and Prompt
dom.window.alert = (msg) => console.log("[Alert]: " + msg);
dom.window.prompt = () => "Player";

// Execute scripts in order
try {
    for (const scriptCode of scripts) {
        dom.window.eval(scriptCode);
    }
} catch (e) {
    console.error("Script execution error:", e);
    process.exit(1);
}

// --- Test 1: Crouch Visual Height ---
console.log("--- Testing Crouch Visual Height ---");
// We need to wait for window.game if it's initialized in onload.
// But we manually trigger init or just new Game.
if (!dom.window.Game) {
    console.error("Game class not found!");
}

const game = new dom.window.Game();
// Mock world methods to avoid heavy generation
game.world.generateChunk = () => {};
game.world.updateChunks = () => {};
// We need player
game.player = new dom.window.Player(game);
game.player.onGround = true;
game.controls.sneak = true;

// Original logic in render(): const py = this.player.y + this.player.height - 0.2;
const originalHeight = game.player.height;
game.player.update(0.016);

// Verify if player.height changed or if we can access a visual property
if (game.player.height === 1.8) {
    console.log("BUG CONFIRMED: Player height remains 1.8 when sneaking.");
} else {
    console.log("Player height changed: " + game.player.height);
}

// --- Test 2: Projectile Damage ---
console.log("\n--- Testing Projectile Damage ---");
game.player.health = 20;
const startHealth = game.player.health;

// Add a projectile at player position
const proj = {
    x: game.player.x,
    y: game.player.y + 1, // Torso
    z: game.player.z,
    vx: 0, vy: 0, vz: 0,
    life: 1.0
};
game.projectiles.push(proj);

// Run game update (simulating collision)
// We need to mock world.getBlock to avoid crash
game.world.getBlock = () => 0; // Air

try {
    // update calls player.update again, but that's fine
    game.update(16); // 16ms
} catch (e) {
    console.error("Update failed", e);
}

if (game.player.health === startHealth) {
    console.log("BUG CONFIRMED: Player health " + game.player.health + " did not decrease after projectile hit.");
} else {
    console.log("Player health decreased to " + game.player.health);
}
