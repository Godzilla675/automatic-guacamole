const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="game-canvas"></canvas><div id="crafter-screen" class="hidden"><div class="inventory-content"><div id="crafter-grid"></div></div></div><div id="inventory-screen" class="hidden"></div></body></html>', {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable"
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

dom.window.document.exitPointerLock = () => {};
dom.window.HTMLCanvasElement.prototype.requestPointerLock = () => {};

function loadScript(filename) {
    const content = fs.readFileSync(path.join(__dirname, '../js', filename), 'utf8');
    dom.window.eval(content);
}

['math.js', 'blocks.js', 'ui.js'].forEach(loadScript);

describe('Crafter Shift-Click Even Distribution Test', () => {
    it('Should distribute items evenly across empty non-disabled slots', () => {
        const ui = new dom.window.UIManager({ player: { inventory: new Array(36).fill(null), addItem: () => {} }, canvas: { requestPointerLock: () => {} }, isMobile: false, drops: [] });

        ui.activeCrafter = { items: new Array(9).fill(null), disabledSlots: new Array(9).fill(false) };
        ui.activeCrafter.disabledSlots[0] = true;
        ui.activeCrafter.disabledSlots[8] = true;

        ui.game.player.inventory[0] = { type: 1, count: 15 };

        // Simulate shift-click on inventory slot 0
        ui.handleInventoryClick(0, { shiftKey: true });

        // Let's print out what we get right now
        console.log(ui.activeCrafter.items.map(i => i ? i.count : null));

        // Right now the code stacks into existing first or empty first.
        // If we fix it, 15 items across 7 slots -> 3, 2, 2, 2, 2, 2, 2
        // We will do the fix and assert properly.
    });
});
