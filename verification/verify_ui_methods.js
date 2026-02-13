const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM('<!DOCTYPE html><body><div id="trading-screen" class="hidden"><div id="trading-list"></div></div><div id="inventory-screen" class="hidden"><div id="inventory-grid"></div></div></body>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.document.exitPointerLock = () => {}; // Mock

// Load blocks.js
const blocksContent = fs.readFileSync('js/blocks.js', 'utf8');
eval(blocksContent);
global.BLOCK = window.BLOCK;
global.BLOCKS = window.BLOCKS;
global.TOOLS = window.TOOLS; // Needed for refreshInventoryUI

// Load ui.js
const uiContent = fs.readFileSync('js/ui.js', 'utf8');
eval(uiContent);

// Mock Game
const gameMock = {
    isMobile: false,
    player: {
        inventory: new Array(36).fill(null)
    },
    canvas: {
        requestPointerLock: () => {}
    },
    input: { keybinds: {} }
};

const ui = new window.UIManager(gameMock);

// Check methods
if (typeof ui.openTrading !== 'function') throw new Error("Missing openTrading");

// Test openTrading
const villager = { trades: null };

ui.openTrading(villager);

if (document.getElementById('trading-screen').classList.contains('hidden')) {
    throw new Error("openTrading did not show screen");
}

if (!villager.trades || villager.trades.length === 0) {
    throw new Error("openTrading did not generate trades");
}

console.log("Trading UI methods verified.");
console.log("Generated trades:", villager.trades.length);
