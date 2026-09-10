const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('5 New Features Batch 3 Test Suite (Door Sync Break, Redstone Lamp Toggling, Recipe Search Filter, Chat Log Toggle, Suspicious Stew)', function() {
    let window, document, dom;

    before(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body>
            <canvas id="game-canvas"></canvas>
            <div id="crafting-screen" class="hidden">
                <input type="text" id="crafting-search-input">
                <div id="crafting-recipes"></div>
                <button id="close-crafting"></button>
            </div>
            <div id="recipe-book-screen" class="hidden">
                <input type="text" id="recipe-book-search-input">
                <div id="recipe-list"></div>
                <button id="close-recipe-book"></button>
            </div>
            <div id="chat-container">
                <div id="chat-messages"></div>
                <input type="text" id="chat-input" class="hidden">
            </div>
        </body></html>`, {
            url: 'http://localhost/',
            runScripts: 'dangerously',
            resources: 'usable'
        });
        window = dom.window;
        document = window.document;

        // Mock Buffer if needed
        if (typeof global.Buffer !== 'undefined') {
            window.Buffer = global.Buffer;
        }

        // Mock HTMLCanvasElement context
        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: () => {},
                clearRect: () => {},
                drawImage: () => {},
                strokeRect: () => {},
                beginPath: () => {},
                moveTo: () => {},
                lineTo: () => {},
                stroke: () => {},
                fill: () => {},
                arc: () => {},
                save: () => {},
                restore: () => {},
                scale: () => {},
                translate: () => {},
                rotate: () => {},
                createImageData: () => ({ data: new Uint8ClampedArray(16 * 16 * 4) }),
                putImageData: () => {},
                getImageData: () => ({ data: new Uint8ClampedArray(16 * 16 * 4) })
            };
        };

        const fs = require('fs');
        const vm = require('vm');
        const files = [
            'js/math.js',
            'js/blocks.js',
            'js/chunk.js',
            'js/biome.js',
            'js/structures.js',
            'js/textures.js',
            'js/crafting.js',
            'js/entity.js',
            'js/player.js',
            'js/chat.js',
            'js/ui.js',
            'js/world.js'
        ];

        files.forEach(file => {
            const code = fs.readFileSync(file, 'utf8');
            vm.runInNewContext(code, window);
        });

        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;
        global.CraftingSystem = window.CraftingSystem;
        global.Player = window.Player;
        global.World = window.World;
        global.ChatManager = window.ChatManager;
        global.UIManager = window.UIManager;
    });

    it('1. Wooden Door Break Synchronization: breaking top or bottom door breaks opposite half', function() {
        const world = new window.World();
        // Load chunk at 0,0
        world.generateChunk(0, 0);

        // Place support block
        world.setBlock(5, 10, 5, window.BLOCK.STONE);
        world.setBlock(5, 11, 5, window.BLOCK.DOOR_WOOD_BOTTOM);
        world.setBlock(5, 12, 5, window.BLOCK.DOOR_WOOD_TOP);

        assert.strictEqual(world.getBlock(5, 11, 5), window.BLOCK.DOOR_WOOD_BOTTOM);
        assert.strictEqual(world.getBlock(5, 12, 5), window.BLOCK.DOOR_WOOD_TOP);

        // Break top half
        world.setBlock(5, 12, 5, window.BLOCK.AIR);

        // Bottom half should be broken automatically via structural integrity check
        assert.strictEqual(world.getBlock(5, 11, 5), window.BLOCK.AIR, 'Bottom door half should break when top half is removed');

        // Place door again
        world.setBlock(5, 11, 5, window.BLOCK.DOOR_WOOD_BOTTOM);
        world.setBlock(5, 12, 5, window.BLOCK.DOOR_WOOD_TOP);

        // Break bottom half
        world.setBlock(5, 11, 5, window.BLOCK.AIR);
        assert.strictEqual(world.getBlock(5, 12, 5), window.BLOCK.AIR, 'Top door half should break when bottom half is removed');
    });

    it('2. Redstone Lamp Dynamic Toggling: toggles lit state when powered/unpowered by redstone', function() {
        const world = new window.World();
        world.generateChunk(0, 0);

        world.setBlock(10, 10, 10, window.BLOCK.REDSTONE_LAMP);
        assert.strictEqual(world.getBlock(10, 10, 10), window.BLOCK.REDSTONE_LAMP);

        // Place active redstone torch next to lamp
        world.setBlock(10, 10, 11, window.BLOCK.REDSTONE_TORCH);
        world.updateRedstone();

        assert.strictEqual(world.getBlock(10, 10, 10), window.BLOCK.REDSTONE_LAMP_ACTIVE, 'Redstone Lamp should become REDSTONE_LAMP_ACTIVE when powered');

        // Remove redstone torch
        world.setBlock(10, 10, 11, window.BLOCK.AIR);
        world.updateRedstone();

        assert.strictEqual(world.getBlock(10, 10, 10), window.BLOCK.REDSTONE_LAMP, 'Redstone Lamp should revert to REDSTONE_LAMP when unpowered');
    });

    it('3. Recipe Book Search Filtering: search input filters recipes by name', function() {
        const mockGame = {
            player: { inventory: [], unlockedRecipes: new Set(["Planks (4)", "Furnace", "Suspicious Stew"]) },
            resumeGame: () => {}
        };
        const crafting = new window.CraftingSystem(mockGame);
        mockGame.crafting = crafting;

        crafting.initUI();

        const searchInput = document.getElementById('crafting-search-input');
        const container = document.getElementById('crafting-recipes');

        assert.ok(container.children.length > 0, 'Crafting container should have recipes before search');

        // Filter search for "Stew"
        searchInput.value = 'Stew';
        crafting.initUI();

        assert.strictEqual(container.children.length, 1, 'Only 1 recipe matching "Stew" should be shown');
        assert.ok(container.children[0].textContent.includes('Suspicious Stew'));

        // Filter search for "NonExistentRecipeQuery"
        searchInput.value = 'NonExistentRecipeQuery';
        crafting.initUI();

        assert.strictEqual(container.children.length, 0, '0 recipes should be shown for non-matching query');
    });

    it('4. Chat History Log Toggle: toggles messages overlay visibility and /togglechat command', function() {
        const mockGame = { pluginAPI: null, network: { sendChat: () => {} } };
        const chat = new window.ChatManager(mockGame);

        assert.strictEqual(chat.logVisible, true, 'Default logVisible should be true');

        const state1 = chat.toggleLogVisibility();
        assert.strictEqual(state1, false, 'toggleLogVisibility should toggle to false');
        assert.strictEqual(chat.messages.style.display, 'none', 'messages element display should be none');

        const state2 = chat.toggleLogVisibility();
        assert.strictEqual(state2, true, 'toggleLogVisibility should toggle back to true');
        assert.strictEqual(chat.messages.style.display, 'block', 'messages element display should be block');

        // Test command /togglechat
        chat.handleCommand('/togglechat');
        assert.strictEqual(chat.logVisible, false, '/togglechat command should toggle chat visibility');
    });

    it('5. Suspicious Stew Item & Status Effect: grants food and randomized potion effect upon consumption', function() {
        assert.strictEqual(window.BLOCK.ITEM_SUSPICIOUS_STEW, 413, 'ITEM_SUSPICIOUS_STEW should be ID 413');
        assert.ok(window.BLOCKS[window.BLOCK.ITEM_SUSPICIOUS_STEW], 'BLOCKS definition for ITEM_SUSPICIOUS_STEW should exist');

        const mockGame = { updateHealthUI: () => {}, ui: { showNotification: () => {} } };
        const player = new window.Player(mockGame);
        player.hunger = 10;

        assert.strictEqual(player.activeEffects.length, 0);

        const eaten = player.eat(window.BLOCK.ITEM_SUSPICIOUS_STEW);
        assert.strictEqual(eaten, true, 'eat(ITEM_SUSPICIOUS_STEW) should return true');
        assert.strictEqual(player.hunger, 16, 'Hunger should increase by 6');
        assert.strictEqual(player.activeEffects.length, 1, 'Player should gain 1 status effect from Suspicious Stew');
        assert.ok(player.activeEffects[0].name, 'Status effect name should be defined');
    });
});
