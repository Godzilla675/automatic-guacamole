const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Mock HTML structure including new UI elements
const html = `
<!DOCTYPE html>
<html>
<body>
    <canvas id="game-canvas"></canvas>

    <!-- Chat -->
    <div id="chat-container"></div>
    <div id="chat-messages"></div>
    <input id="chat-input" class="hidden">

    <!-- Sign UI -->
    <div id="sign-screen" class="hidden">
        <textarea id="sign-input"></textarea>
        <button id="close-sign">Done</button>
    </div>

    <!-- Enchanting UI -->
    <div id="enchanting-screen" class="hidden">
        <div id="enchanting-item"></div>
        <div id="enchanting-options"></div>
        <button id="close-enchanting">Close</button>
    </div>

    <!-- Inventory/Settings for Skins -->
    <div id="inventory-screen" class="hidden"></div>
    <div id="inventory-grid"></div>
    <div id="hotbar"></div>
    <div id="settings-screen" class="hidden">
        <input id="skin-color-picker" type="color">
        <div id="keybinds-list"></div>
    </div>

    <!-- HUD -->
    <div id="health-bar"></div>
    <div id="hunger-bar"></div>
    <div id="xp-bar"></div>
    <div id="xp-level">0</div>
</body>
</html>
`;

const dom = new JSDOM(html, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable"
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.NodeList = dom.window.NodeList;

// Mock LocalStorage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: function(key) {
            return store[key] || null;
        },
        setItem: function(key, value) {
            store[key] = value.toString();
        },
        removeItem: function(key) {
            delete store[key];
        },
        clear: function() {
            store = {};
        }
    };
})();
Object.defineProperty(dom.window, 'localStorage', { value: localStorageMock });

// Mock other globals
dom.window.document.exitPointerLock = () => {};
dom.window.HTMLCanvasElement.prototype.requestPointerLock = () => {};
dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform: () => {}, fillRect: () => {}, clearRect: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {}, fillText: () => {}, strokeRect: () => {}, save: () => {}, restore: () => {}, scale: () => {}, rotate: () => {}, translate: () => {}
});
dom.window.requestAnimationFrame = () => {};
dom.window.cancelAnimationFrame = () => {};
dom.window.AudioContext = class {
    constructor() { this.state = 'running'; this.currentTime = 0; }
    resume() { this.state = 'running'; }
    createOscillator() {
        return {
            type: 'sine',
            connect:()=>{}, start:()=>{}, stop:()=>{},
            frequency:{setValueAtTime:()=>{}, exponentialRampToValueAtTime:()=>{}, linearRampToValueAtTime:()=>{}}
        };
    }
    createGain() {
        return {
            connect:()=>{},
            gain:{
                value:0,
                setTargetAtTime:()=>{},
                setValueAtTime:()=>{},
                exponentialRampToValueAtTime:()=>{},
                linearRampToValueAtTime:()=>{}
            }
        };
    }
    createPanner() {
        return {
            panningModel: '', distanceModel: '',
            connect:()=>{}, setPosition:()=>{},
            orientationX:{value:0}, orientationY:{value:0}, orientationZ:{value:0},
            positionX:{value:0}, positionY:{value:0}, positionZ:{value:0}
        };
    }
};
dom.window.WebSocket = class { constructor() { setTimeout(()=>this.onopen&&this.onopen(),10); } send(){} };
dom.window.soundManager = { play: () => {}, updateAmbience: () => {}, updateListener: () => {} };
dom.window.perlin = { noise: () => 0 };
dom.window.alert = (msg) => { console.log("ALERT:", msg); };
dom.window.prompt = (msg, def) => { return def || "test"; };

// Load Scripts
function loadScript(filename) {
    const content = fs.readFileSync(path.join(__dirname, '../js', filename), 'utf8');
    dom.window.eval(content);
}

const scripts = [
    'math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures/Tree.js', 'structures/Cactus.js', 'structures/Well.js', 'structures.js', 'world.js',
    'physics.js', 'entity.js', 'vehicle.js', 'drop.js', 'mob.js', 'player.js', 'plugin.js', 'particles.js',
    'minimap.js', 'achievements.js', 'tutorial.js', 'network.js', 'crafting.js',
    'chat.js', 'ui.js', 'input.js', 'renderer.js', 'audio.js', 'game.js'
];

scripts.forEach(loadScript);

// Run Tests
const game = new dom.window.Game();

// Initialize UI manually since we aren't calling game.init() fully
game.ui.init();

const BLOCK = dom.window.BLOCK;
const BLOCKS = dom.window.BLOCKS;

console.log("=== STARTING NEW FEATURE VERIFICATION ===");

let failures = 0;

function assertTest(condition, message) {
    if (!condition) {
        console.error(`[FAIL] ${message}`);
        failures++;
    } else {
        console.log(`[PASS] ${message}`);
    }
}

// 1. Test Signs
try {
    console.log("\n--- Testing Signs ---");
    const x = 10, y = 30, z = 10;
    game.world.generateChunk(0, 0);
    game.world.setBlock(x, y, z, BLOCK.SIGN_POST);

    // Simulate Opening UI
    game.ui.showSignEditor(x, y, z);
    assertTest(!document.getElementById('sign-screen').classList.contains('hidden'), "Sign UI opened");
    assertTest(game.ui.activeSign && game.ui.activeSign.x === x, "Active sign set correctly");

    // Simulate Input
    const input = document.getElementById('sign-input');
    input.value = "Line1\nLine2";

    // Close and Save
    game.ui.closeSign();
    assertTest(document.getElementById('sign-screen').classList.contains('hidden'), "Sign UI closed");

    const entity = game.world.getBlockEntity(x, y, z);
    assertTest(entity && entity.type === 'sign', "Sign entity created");
    assertTest(entity.text && entity.text[0] === "Line1" && entity.text[1] === "Line2", "Sign text saved correctly");
} catch (e) {
    console.error("[ERROR] Sign Test Exception:", e);
    failures++;
}

// 2. Test Creative Mode
try {
    console.log("\n--- Testing Creative Mode ---");
    // Switch to Creative
    game.player.gamemode = 1;

    // Test God Mode
    game.player.health = 20;
    game.player.takeDamage(10);
    assertTest(game.player.health === 20, "Creative Mode: No Damage taken");

    // Test Flying
    game.player.flying = true;
    game.player.y = 50;
    game.player.vy = 0;

    // Update should not apply gravity in flying mode if no input
    game.player.update(1.0); // 1 second

    // Note: In player.update(), friction is applied (vx *= 0.9), but vy is set to 0 if no jump/sneak.
    // Let's verify Y didn't drop like a rock (gravity is 25.0).
    assertTest(game.player.y === 50, `Creative Fly: Y position stable (Expected 50, got ${game.player.y})`);

} catch (e) {
    console.error("[ERROR] Creative Mode Test Exception:", e);
    failures++;
}

// 3. Test Commands
try {
    console.log("\n--- Testing Commands ---");

    // /time set
    game.chat.handleCommand('/time set 500');
    assertTest(game.gameTime === 500, "Command /time set 500 worked");

    // /gamemode
    game.chat.handleCommand('/gamemode 0');
    assertTest(game.player.gamemode === 0, "Command /gamemode 0 worked");
    assertTest(game.player.flying === false, "Survival mode disabled flying");

    // /give
    game.player.inventory.fill(null);
    game.chat.handleCommand('/give diamond 5');
    const slot = game.player.inventory.find(i => i && i.type === BLOCK.ITEM_DIAMOND);
    assertTest(slot && slot.count === 5, "Command /give diamond 5 worked");

    // /tp
    game.chat.handleCommand('/tp 100 60 100');
    assertTest(game.player.x === 100 && game.player.y === 60 && game.player.z === 100, "Command /tp worked");

} catch (e) {
    console.error("[ERROR] Command Test Exception:", e);
    failures++;
}

// 4. Test Enchanting
try {
    console.log("\n--- Testing Enchanting ---");
    game.player.level = 10;
    game.player.xp = 0.5;

    // Open UI with a Diamond Sword
    const sword = { type: BLOCK.SWORD_DIAMOND, count: 1 };
    game.ui.activeEnchanting = { item: sword };
    game.ui.updateEnchantingUI(); // Populate UI options

    const list = document.getElementById('enchanting-options');
    assertTest(list.children.length > 0, "Enchanting options rendered");

    // Perform Enchant (Cost 1)
    game.ui.enchant(1);

    assertTest(game.player.level === 9, "Level deducted (10 -> 9)");
    assertTest(sword.enchantments && sword.enchantments.length === 1, "Item received enchantment");
    console.log("Enchantment:", sword.enchantments ? sword.enchantments[0] : "None");

} catch (e) {
    console.error("[ERROR] Enchanting Test Exception:", e);
    failures++;
}

// 5. Test Player Skins
try {
    console.log("\n--- Testing Player Skins ---");
    const initialSkin = game.player.skinColor;
    console.log("Initial Skin:", initialSkin);

    // Simulate Picker Change
    const picker = document.getElementById('skin-color-picker');
    picker.value = "#ff0000";

    // Trigger change event manually
    const event = new dom.window.Event('change');
    picker.dispatchEvent(event);

    assertTest(game.player.skinColor === "#ff0000", "Player skin updated via UI");
    assertTest(dom.window.localStorage.getItem('voxel_skin_color') === "#ff0000", "Skin color persisted to localStorage");

} catch (e) {
    console.error("[ERROR] Skin Test Exception:", e);
    failures++;
}

// 6. Test Sign Structural Integrity (Bug Check)
try {
    console.log("\n--- Testing Sign Structural Integrity ---");
    const x = 12, y = 30, z = 12;

    // Set Soil
    game.world.setBlock(x, y-1, z, BLOCK.DIRT);
    // Set Sign
    game.world.setBlock(x, y, z, BLOCK.SIGN_POST);

    assertTest(game.world.getBlock(x, y, z) === BLOCK.SIGN_POST, "Sign placed");

    // Break Soil
    game.world.setBlock(x, y-1, z, BLOCK.AIR);

    // Check Sign
    // setBlock triggers neighbors check logic if implemented
    const after = game.world.getBlock(x, y, z);
    assertTest(after === BLOCK.AIR, `Sign should break when support removed (Got ${after}, Expected 0)`);

} catch (e) {
    console.error("[ERROR] Sign Integrity Test Exception:", e);
    failures++;
}

if (failures > 0) {
    console.log(`\n=== FAILED: ${failures} tests failed ===`);
    process.exit(1);
} else {
    console.log("\n=== SUCCESS: All tests passed ===");
    process.exit(0);
}
