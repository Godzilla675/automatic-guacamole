const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const dom = new JSDOM(`<!DOCTYPE html>
<div id="anvil-input-1"></div>
<div id="anvil-input-2"></div>
<div id="anvil-output"></div>
<input id="anvil-rename" value="">
<div id="anvil-cost"></div>
<div id="hotbar"></div>
<div id="inventory-grid"></div>
<div id="chest-grid"></div>
<div id="furnace-input"></div>
<div id="furnace-fuel"></div>
<div id="furnace-output"></div>
<div id="furnace-progress"></div>
<div id="furnace-burn"></div>
<div id="brewing-ingredient"></div>
<div id="brewing-bottle-1"></div>
<div id="brewing-bottle-2"></div>
<div id="brewing-bottle-3"></div>
<div id="brewing-progress"></div>
<div id="enchanting-item"></div>
<div id="enchanting-options"></div>
`);

global.document = dom.window.document;
global.window = dom.window;
global.localStorage = { getItem: () => null, setItem: () => {} };

// Mock dependencies
const window = global.window;
window.BLOCKS = {};
window.TOOLS = {};
window.BLOCK = { ITEM_EMERALD: 252, ITEM_APPLE: 215 }; // Minimal

function load(file) {
    const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    eval(content);
}

load('js/blocks.js'); // Load real blocks
load('js/ui.js');

// Mock Game
class MockGame {
    constructor() {
        this.player = {
            inventory: new Array(36).fill(null),
            level: 10,
            health: 20,
            maxHealth: 20,
            hunger: 20,
            maxHunger: 20,
            xp: 0
        };
        this.input = { keybinds: {}, sensitivity: 1 };
        this.crafting = { recipes: [] };
    }
}

const game = new MockGame();
const ui = new window.UIManager(game);

// Initialize Anvil State
ui.activeAnvil = {
    input1: null,
    input2: null,
    output: null,
    cost: 0
};

console.log('Testing Anvil...');

// 1. Test Renaming
console.log('Test 1: Renaming');
const sword = { type: window.BLOCK.SWORD_DIAMOND, count: 1 };
ui.activeAnvil.input1 = sword;
document.getElementById('anvil-rename').value = "Excalibur";

ui.updateAnvilUI();

assert(ui.activeAnvil.output, 'Output should exist');
assert.strictEqual(ui.activeAnvil.output.name, "Excalibur", 'Output should be renamed');
assert.strictEqual(ui.activeAnvil.cost, 1, 'Renaming cost should be 1');

// 2. Test Repairing
console.log('Test 2: Repairing');
document.getElementById('anvil-rename').value = ""; // Reset name

// Diamond Sword: 1561 durability
const damagedSword1 = { type: window.BLOCK.SWORD_DIAMOND, count: 1, durability: 1000 }; // 561 damage
const damagedSword2 = { type: window.BLOCK.SWORD_DIAMOND, count: 1, durability: 1000 };

ui.activeAnvil.input1 = damagedSword1;
ui.activeAnvil.input2 = damagedSword2;

ui.updateAnvilUI();

assert(ui.activeAnvil.output, 'Output should exist');
// Max = 1561.
// Uses1 = 1000. Uses2 = 1000.
// Repair = 1000 + (1561 * 0.12) = 1000 + 187 = 1187.
// New Durability = min(1561, 1000 + 1187) = 1561. (Fully repaired)
assert.strictEqual(ui.activeAnvil.output.durability, 1561, 'Should be fully repaired');
assert.strictEqual(ui.activeAnvil.cost, 2, 'Repair cost should be 2');

console.log('Anvil tests passed!');
