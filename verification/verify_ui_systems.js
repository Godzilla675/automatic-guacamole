const assert = require('assert');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="hud"></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = { getItem: () => null, setItem: () => {} };

// Mock Blocks
global.window.BLOCKS = {
    1: { color: '#ffffff' }
};
global.window.BLOCK = { WOOD: 4 }; // For achievements

// Load Files
const fs = require('fs');
const minimapCode = fs.readFileSync('./js/minimap.js', 'utf8');
eval(minimapCode);
const achievementsCode = fs.readFileSync('./js/achievements.js', 'utf8');
eval(achievementsCode);

describe('UI Systems Verification', () => {
    it('Minimap should create canvas and update', () => {
        const game = {
            player: { x: 0, y: 0, z: 0, yaw: 0 },
            world: {
                getHighestBlockY: () => 1,
                getBlock: () => 1
            }
        };
        const minimap = new window.Minimap(game);
        assert.ok(document.getElementById('minimap'), "Canvas created");

        // Mock ctx
        let drawn = false;
        minimap.ctx = {
            clearRect: () => {},
            save: () => {},
            restore: () => {},
            translate: () => {},
            rotate: () => {},
            fillRect: () => { drawn = true; },
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            fill: () => {}
        };

        minimap.update();
        assert.ok(drawn, "Minimap should draw");
    });

    it('Achievements should unlock', () => {
        let notification = null;
        const game = {
            ui: {
                showNotification: (msg) => { notification = msg; }
            },
            pluginAPI: { on: () => {} },
            world: { dimension: 'overworld' }
        };

        const am = new window.AchievementManager(game);
        am.unlock('getting_wood');
        assert.ok(notification.includes('Getting Wood'), "Notification shown");
        assert.ok(am.unlocked.has('getting_wood'), "Achievement unlocked");

        notification = null;
        am.unlock('getting_wood');
        assert.strictEqual(notification, null, "Should not unlock twice");
    });
});
