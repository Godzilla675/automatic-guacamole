const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM(`<!DOCTYPE html><body>
<div id="chat-container"></div>
<div id="chat-messages"></div>
<input id="chat-input" class="hidden">
</body>`, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost/"
});

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;

// Mock Perlin
dom.window.perlin = { noise: () => 0.5 };

// Load required scripts
const load = (f) => {
    const code = fs.readFileSync(path.join('js', f), 'utf8');
    dom.window.eval(code);
};

// Load dependencies
['math.js', 'blocks.js', 'chunk.js', 'world.js', 'chat.js'].forEach(load);

describe('New Features Tests', () => {

    describe('Cross-Chunk Generation (Pending Blocks)', () => {
        let world;

        beforeEach(() => {
            world = new dom.window.World();
            // Ensure no chunks initially
            world.chunks.clear();
            world.pendingBlocks.clear();
        });

        it('should store blocks for unloaded chunks in pendingBlocks', () => {
            // Set block in chunk 0,0
            // But chunk 0,0 is not generated yet
            world.setBlock(5, 10, 5, dom.window.BLOCK.WOOD);

            const key = world.getChunkKey(0, 0);
            assert.strictEqual(world.pendingBlocks.has(key), true, "Should have pending blocks for 0,0");

            const pending = world.pendingBlocks.get(key);
            assert.strictEqual(pending.length, 1);
            // Use loose equality or property check due to JSDOM/Node prototype mismatch
            assert.strictEqual(pending[0].x, 5);
            assert.strictEqual(pending[0].y, 10);
            assert.strictEqual(pending[0].z, 5);
            assert.strictEqual(pending[0].type, dom.window.BLOCK.WOOD);
        });

        it('should apply pending blocks when chunk is generated', () => {
            // Queue a block
            world.setBlock(5, 10, 5, dom.window.BLOCK.WOOD);

            // Generate the chunk
            world.generateChunk(0, 0);

            // Verify chunk exists
            const chunk = world.getChunk(0, 0);
            assert.ok(chunk, "Chunk should be generated");

            // Verify block is set
            assert.strictEqual(chunk.getBlock(5, 10, 5), dom.window.BLOCK.WOOD, "Block should be placed");

            // Verify pending cleared
            const key = world.getChunkKey(0, 0);
            assert.strictEqual(world.pendingBlocks.has(key), false, "Pending blocks should be cleared");
        });
    });

    describe('Chat Commands', () => {
        let chatManager;
        let mockGame;

        beforeEach(() => {
            mockGame = {
                sentPackets: [],
                network: {
                    sendChat: (msg) => mockGame.sentPackets.push({ type: 'chat', msg }),
                    sendBlockUpdate: (x, y, z, type) => {
                        mockGame.sentPackets.push({ type: 'block', x, y, z, blockType: type });
                    }
                },
                world: new dom.window.World(),
                gameTime: 1000,
                dayLength: 20000,
                isMobile: false,
                controls: { enabled: true },
                canvas: { requestPointerLock: () => {} }
            };

            // Mock World setBlock for Fill command
            mockGame.world.setBlock = (x, y, z, type) => {
                // Just track it or let it fail silently (we only test it was called via side effect if needed, but here we check logic)
                mockGame.sentPackets.push({type: 'local_setblock', x, y, z, val: type});
            };

            chatManager = new dom.window.ChatManager(mockGame);
        });

        it('should handle /time set day', () => {
            chatManager.input.value = "/time set day";
            chatManager.send();

            assert.strictEqual(mockGame.gameTime, 0, "Time should be 0");
            assert.strictEqual(mockGame.sentPackets.filter(p => p.type === 'chat').length, 0, "Should not send chat to network");
        });

        it('should handle /time set night', () => {
            chatManager.input.value = "/time set night";
            chatManager.send();

            assert.strictEqual(mockGame.gameTime, 10000, "Time should be half dayLength");
        });

        it('should handle /time set <number>', () => {
            chatManager.input.value = "/time set 5000";
            chatManager.send();

            assert.strictEqual(mockGame.gameTime, 5000);
        });

        it('should handle /fill command', () => {
            // /fill 0 0 0 1 1 1 dirt
            // Bounds: 0,0,0 to 1,1,1 -> 2x2x2 = 8 blocks

            // Dirt ID is 1 (BLOCK.DIRT)

            chatManager.input.value = "/fill 0 0 0 1 1 1 dirt";
            chatManager.send();

            const blockUpdates = mockGame.sentPackets.filter(p => p.type === 'block');

            assert.strictEqual(blockUpdates.length, 8, "Should send 8 block updates");
            assert.strictEqual(blockUpdates[0].blockType, dom.window.BLOCK.DIRT);

            const localUpdates = mockGame.sentPackets.filter(p => p.type === 'local_setblock');
            assert.strictEqual(localUpdates.length, 8, "Should update local world 8 times");
        });

        it('should send normal chat to network', () => {
            chatManager.input.value = "Hello world";
            chatManager.send();

            const chats = mockGame.sentPackets.filter(p => p.type === 'chat');
            assert.strictEqual(chats.length, 1);
            assert.strictEqual(chats[0].msg, "Hello world");
        });
    });
});
