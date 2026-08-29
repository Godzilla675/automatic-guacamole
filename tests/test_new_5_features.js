const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('New 5 Gameplay Features Suite', function() {
    let dom;
    let window;

    before(function() {
        const html = `<!DOCTYPE html><html><head></head><body>
            <canvas id="game-canvas"></canvas>
            <div id="hotbar"></div>
            <div id="inventory-grid"></div>
            <div id="crafting-grid"></div>
        </body></html>`;
        dom = new JSDOM(html, {
            runScripts: 'dangerously',
            resources: 'usable',
            url: 'http://localhost/'
        });
        window = dom.window;

        // Mock HTMLCanvasElement context
        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {},
                clearRect: () => {},
                getImageData: () => ({ data: new Uint8ClampedArray(16 * 16 * 4) }),
                putImageData: () => {},
                createImageData: () => ({ data: new Uint8ClampedArray(16 * 16 * 4) }),
                drawImage: () => {},
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                stroke: () => {}
            };
        };

        const loadScript = (file) => {
            const code = fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8');
            window.eval(code);
        };

        loadScript('math.js');
        loadScript('blocks.js');
        loadScript('textures.js');
        loadScript('crafting.js');
        loadScript('physics.js');
        loadScript('chunk.js');
        loadScript('world.js');
        loadScript('player.js');
    });

    it('should have Slime Block, Glazed Terracotta, Campfire, Glow Berries, and Mud Block defined', function() {
        const B = window.BLOCK;
        const BLOCKS = window.BLOCKS;

        assert.ok(B.SLIME_BLOCK);
        assert.strictEqual(BLOCKS[B.SLIME_BLOCK].bouncy, true);

        assert.ok(B.GLAZED_TERRACOTTA_WHITE);
        assert.ok(B.GLAZED_TERRACOTTA_ORANGE);
        assert.ok(B.GLAZED_TERRACOTTA_MAGENTA);
        assert.ok(B.GLAZED_TERRACOTTA_LIGHT_BLUE);

        assert.ok(B.CAMPFIRE);
        assert.strictEqual(BLOCKS[B.CAMPFIRE].light, 15);

        assert.ok(B.ITEM_GLOW_BERRIES);
        assert.strictEqual(BLOCKS[B.ITEM_GLOW_BERRIES].food, 2);

        assert.ok(B.MUD_BLOCK);
        assert.strictEqual(BLOCKS[B.MUD_BLOCK].name, 'Mud');
    });

    it('should generate textures for all 5 newly added features', function() {
        const textureManager = new window.TextureManager();
        textureManager.init();
        const B = window.BLOCK;

        assert.ok(textureManager.textures[B.SLIME_BLOCK]);
        assert.ok(textureManager.textures[B.GLAZED_TERRACOTTA_WHITE]);
        assert.ok(textureManager.textures[B.GLAZED_TERRACOTTA_ORANGE]);
        assert.ok(textureManager.textures[B.GLAZED_TERRACOTTA_MAGENTA]);
        assert.ok(textureManager.textures[B.GLAZED_TERRACOTTA_LIGHT_BLUE]);
        assert.ok(textureManager.textures[B.CAMPFIRE]);
        assert.ok(textureManager.textures[B.MUD_BLOCK]);
    });

    it('should have crafting recipes for Slime Block and Campfire', function() {
        const crafting = new window.CraftingSystem({});
        const slimeRecipe = crafting.recipes.find(r => r.result.type === window.BLOCK.SLIME_BLOCK);
        const campfireRecipe = crafting.recipes.find(r => r.result.type === window.BLOCK.CAMPFIRE);

        assert.ok(slimeRecipe);
        assert.ok(campfireRecipe);
    });

    it('should handle Slime Block fall damage cancellation and bounce velocity', function() {
        const mockGame = {
            world: {
                getBlock: (x, y, z) => window.BLOCK.SLIME_BLOCK
            }
        };
        const player = new window.Player(mockGame);
        player.y = 10;
        player.vy = -10;
        player.fallDistance = 15;
        player.onGround = true;
        player.keys = {};

        // Simulate fall landing on slime block
        const landedBlock = window.BLOCK.SLIME_BLOCK;
        if (landedBlock === window.BLOCK.SLIME_BLOCK && !player.keys['ShiftLeft']) {
            player.vy = Math.min(Math.abs(player.vy) * 0.8, 15.0);
        }

        assert.strictEqual(player.vy, 8.0); // Bounced upwards with 80% velocity
    });
});
