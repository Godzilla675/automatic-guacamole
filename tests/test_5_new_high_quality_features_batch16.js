const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('Batch 16 High Quality Features Test Suite', function() {
    this.timeout(10000);
    let window, dom, game;

    beforeEach(function() {
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <canvas id="game-canvas"></canvas>
                <div id="loading-screen"></div>
                <div id="menu-screen"></div>
                <div id="game-container"></div>
                <div id="hotbar"></div>
                <div id="chat-messages"></div>
                <div id="chat-input"></div>
                <div id="health-bar"></div>
                <div id="hunger-bar"></div>
                <div id="xp-bar"></div>
                <div id="xp-level"></div>
                <div id="potion-effects-container"></div>
                <div id="damage-overlay"></div>
                <div id="darkness-overlay"></div>
                <div id="fps"></div>
                <div id="position"></div>
                <div id="block-count"></div>
                <div id="game-time"></div>
                <div id="inventory-screen" class="hidden"></div>
                <div id="inventory-grid"></div>
                <div id="armor-grid"></div>
                <div id="offhand-container"></div>
                <input type="checkbox" id="auto-jump-checkbox">
            </body>
            </html>
        `, {
            url: 'http://localhost',
            runScripts: 'dangerously',
            resources: 'usable'
        });

        window = dom.window;
        global.window = window;
        global.document = window.document;
        global.navigator = window.navigator;

        // Mock canvas context
        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {},
                clearRect: () => {},
                getImageData: () => ({ data: new Uint8ClampedArray(4) }),
                putImageData: () => {},
                createImageData: () => ({ data: new Uint8ClampedArray(4) }),
                setTransform: () => {},
                drawImage: () => {},
                beginPath: () => {},
                moveTo: () => {},
                lineTo: () => {},
                stroke: () => {},
                fill: () => {},
                arc: () => {},
                createLinearGradient: () => ({ addColorStop: () => {} }),
                createPattern: () => ({ setTransform: () => {} })
            };
        };

        window.AudioContext = class {
            createAnalyser() { return { connect: () => {} }; }
            createGain() { return { connect: () => {}, gain: { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
            createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, type: '', frequency: { value: 440, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
            createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
            createPanner() { return { connect: () => {}, setPosition: () => {}, positionX: { value: 0 }, positionY: { value: 0 }, positionZ: { value: 0 } }; }
        };

        // Load game scripts
        const fs = require('fs');
        const path = require('path');
        const loadScript = (filePath) => {
            const code = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
            window.eval(code);
        };

        loadScript('js/math.js');
        loadScript('js/blocks.js');
        loadScript('js/audio.js');
        loadScript('js/network.js');
        loadScript('js/chunk.js');
        loadScript('js/biome.js');
        loadScript('js/structures.js');
        loadScript('js/village.js');
        loadScript('js/world.js');
        loadScript('js/physics.js');
        loadScript('js/entity.js');
        loadScript('js/vehicle.js');
        loadScript('js/player.js');
        loadScript('js/mob.js');
        loadScript('js/drop.js');
        loadScript('js/crafting.js');
        loadScript('js/plugin.js');
        loadScript('js/minimap.js');
        loadScript('js/achievements.js');
        loadScript('js/tutorial.js');
        loadScript('js/chat.js');
        loadScript('js/ui.js');
        loadScript('js/input.js');
        loadScript('js/textures.js');
        loadScript('js/renderer.js');
        loadScript('js/particles.js');
        loadScript('js/game.js');

        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.Game = window.Game;

        game = new window.Game();
        global.game = game;
    });

    it('Feature 1: Should define Chiseled Copper blocks & oxidation stages with texture and crafting', function() {
        assert.ok(window.BLOCK.CHISELED_COPPER);
        assert.ok(window.BLOCK.EXPOSED_CHISELED_COPPER);
        assert.ok(window.BLOCK.WEATHERED_CHISELED_COPPER);
        assert.ok(window.BLOCK.OXIDIZED_CHISELED_COPPER);

        assert.strictEqual(window.BLOCKS[window.BLOCK.CHISELED_COPPER].name, 'Chiseled Copper');
        assert.strictEqual(window.BLOCKS[window.BLOCK.OXIDIZED_CHISELED_COPPER].hardness, 3.0);

        // Texture generation check
        const texMgr = new window.TextureManager();
        texMgr.init();
        assert.ok(texMgr.getBlockTexture(window.BLOCK.CHISELED_COPPER));
        assert.ok(texMgr.getBlockTexture(window.BLOCK.OXIDIZED_CHISELED_COPPER));

        // Crafting recipe check
        const recipe = game.crafting.recipes.find(r => r.result.type === window.BLOCK.CHISELED_COPPER);
        assert.ok(recipe);
    });

    it('Feature 1 (Continued): Should de-oxidize Chiseled Copper blocks using an axe', function() {
        game.world.generateChunk(0, 0);
        game.world.setBlock(10, 10, 10, window.BLOCK.OXIDIZED_CHISELED_COPPER);
        game.player.inventory[0] = { type: window.BLOCK.AXE_DIAMOND, count: 1 };
        game.player.selectedSlot = 0;

        game.physics.raycast = () => ({ x: 10, y: 10, z: 10, face: { x: 0, y: 1, z: 0 } });
        game.startAction(false); // Right click with axe

        assert.strictEqual(game.world.getBlock(10, 10, 10), window.BLOCK.WEATHERED_CHISELED_COPPER);
    });

    it('Feature 2: Should perform Offhand Right-Click actions when Main Hand is empty', function() {
        game.player.inventory[0] = null; // Empty main hand
        game.player.selectedSlot = 0;
        game.player.offhand = { type: window.BLOCK.ITEM_APPLE, count: 5 };
        game.player.hunger = 10;

        game.startAction(false); // Right click

        assert.strictEqual(game.player.hunger, 14); // Ate apple from offhand
        assert.strictEqual(game.player.offhand.count, 4);
    });

    it('Feature 3: Should trigger Darkness status effect HUD icon & screen vignette overlay', function() {
        game.player.addEffect('Darkness', '🌑', 15);

        assert.ok(game.player.activeEffects.some(e => e.name === 'Darkness'));

        game.renderer.render();
        const darknessOverlayEl = window.document.getElementById('darkness-overlay');
        assert.ok(darknessOverlayEl.classList.contains('pulse'));
    });

    it('Feature 4: Should perform Auto-Jump when walking into 1-block terrain step', function() {
        game.player.autoJumpEnabled = true;
        game.player.onGround = true;
        game.player.x = 10; game.player.y = 10; game.player.z = 10;

        // Mock 1-block step collision at x >= 10.5
        game.physics.checkCollision = (box) => {
            if (box.x >= 10.5 && box.y < 11.0) return true; // 1-block step at x=11, y=10
            return false;
        };

        game.player.moveBy(1.0, 0, 0);

        assert.strictEqual(game.player.vy, game.player.jumpForce); // Auto-jump triggered!
    });

    it('Feature 5: Should bleach dyed Bundles back to standard Bundle in Water Cauldron', function() {
        game.world.generateChunk(0, 0);
        game.world.setBlock(5, 5, 5, window.BLOCK.CAULDRON);
        game.world.setMetadata(5, 5, 5, 3); // Full cauldron

        game.player.inventory[0] = { type: window.BLOCK.ITEM_BUNDLE_RED, count: 1 };
        game.player.selectedSlot = 0;

        game.interact(5, 5, 5);

        assert.strictEqual(game.player.inventory[0].type, window.BLOCK.ITEM_BUNDLE);
        assert.strictEqual(game.world.getMetadata(5, 5, 5), 2); // Water level decremented
    });
});
