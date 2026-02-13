const fs = require('fs');
const assert = require('assert');

// --- Mocks ---

// Mock WebSocket
class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = 0; // CONNECTING
        this.sentMessages = [];

        // Simulate async connection
        setTimeout(() => {
            this.readyState = 1; // OPEN
            if (this.onopen) this.onopen();
        }, 10);
    }

    send(data) {
        this.sentMessages.push(data);
    }
}
MockWebSocket.OPEN = 1;

global.WebSocket = MockWebSocket;

// Mock Game and its dependencies
class MockChat {
    constructor() {
        this.messages = [];
    }
    addMessage(msg, sender) {
        this.messages.push({ message: msg, sender });
    }
}

class MockWorld {
    constructor() {
        this.blocks = new Map();
        this.chunks = new Map();
    }
    setBlock(x, y, z, type) {
        this.blocks.set(`${x},${y},${z}`, type);
    }
    getChunk(cx, cz) {
        const key = `${cx},${cz}`;
        if (!this.chunks.has(key)) {
            this.chunks.set(key, { modified: false });
        }
        return this.chunks.get(key);
    }
}

class MockPlayer {
    constructor() {
        this.name = "TestPlayer";
        this.skinColor = "#ffffff";
        this.x = 10;
        this.y = 20;
        this.z = 30;
        this.yaw = 0;
        this.pitch = 0;
    }
}

class MockGame {
    constructor() {
        this.chat = new MockChat();
        this.world = new MockWorld();
        this.player = new MockPlayer();
    }
}

// Setup Global Window
global.window = {};

// Load NetworkManager
const networkScript = fs.readFileSync('js/network.js', 'utf8');
eval(networkScript);

// --- Tests ---

async function runTests() {
    console.log("Starting Multiplayer Verification...");

    const game = new MockGame();
    const network = new window.NetworkManager(game);

    // Test 1: Connect
    console.log("Test 1: Connect");
    network.connect('ws://localhost:8080');

    // Wait for connection
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.strictEqual(network.connected, true, "Should be connected");
    assert.strictEqual(network.socket.readyState, MockWebSocket.OPEN, "Socket should be open");
    assert.strictEqual(game.chat.messages.length, 1, "Should have one chat message (Connected)");

    // Test 2: Send Position
    console.log("Test 2: Send Position");
    network.sendPosition(10, 20, 30, 1.5, 0.5);
    assert.strictEqual(network.socket.sentMessages.length, 1, "Should have sent 1 message");
    const msg1 = JSON.parse(network.socket.sentMessages[0]);
    assert.strictEqual(msg1.type, 'move', "Type should be move");
    assert.strictEqual(msg1.x, 10);
    assert.strictEqual(msg1.name, "TestPlayer");

    // Test 3: Receive Player Update
    console.log("Test 3: Receive Player Update");
    const updateMsg = {
        type: 'player_update',
        id: 12345,
        x: 50, y: 60, z: 70,
        yaw: 0, pitch: 0,
        name: "OtherPlayer",
        skinColor: "#0000ff"
    };
    // Simulate receiving message
    network.socket.onmessage({ data: JSON.stringify(updateMsg) });

    assert.strictEqual(network.otherPlayers.size, 1, "Should have 1 other player");
    const p = network.otherPlayers.get(12345);
    assert.strictEqual(p.x, 50);
    assert.strictEqual(p.name, "OtherPlayer");

    // Test 4: Receive Block Update
    console.log("Test 4: Receive Block Update");
    const blockMsg = {
        type: 'block_update',
        x: 5, y: 5, z: 5,
        blockType: 1
    };
    network.socket.onmessage({ data: JSON.stringify(blockMsg) });

    assert.strictEqual(game.world.blocks.get("5,5,5"), 1, "Block should be set in world");
    const chunk = game.world.getChunk(0, 0); // 5/16 = 0
    assert.strictEqual(chunk.modified, true, "Chunk should be marked modified");

    // Test 5: Receive Chat
    console.log("Test 5: Receive Chat");
    const chatMsg = {
        type: 'chat',
        sender: "OtherPlayer",
        message: "Hello World"
    };
    network.socket.onmessage({ data: JSON.stringify(chatMsg) });

    const lastChat = game.chat.messages[game.chat.messages.length - 1];
    assert.strictEqual(lastChat.message, "Hello World", "Chat message should be received");
    assert.strictEqual(lastChat.sender, "OtherPlayer");

    // Test 7: Interpolation
    console.log("Test 7: Interpolation");
    // Reset p to known state
    p.x = 50; p.y = 60; p.z = 70;

    const updateMsg3 = {
        type: 'player_update',
        id: 12345,
        x: 55, y: 60, z: 70, // Dist 5
        yaw: 0, pitch: 0
    };
    network.socket.onmessage({ data: JSON.stringify(updateMsg3) });

    assert.strictEqual(p.x, 50, "Should not snap immediately");
    assert.strictEqual(p.target.x, 55, "Target should be updated");

    // Call update with 0.05s. Speed is 10.
    // move = 5 * 10 * 0.05 = 2.5.
    // x should be 52.5.
    network.update(0.05);
    assert.ok(Math.abs(p.x - 52.5) < 0.1, `Expected 52.5, got ${p.x}`);

    // Test 8: Angle Wrapping
    console.log("Test 8: Angle Wrapping");
    p.yaw = 0.1;
    p.target.yaw = 6.2; // approx 2PI - 0.083
    // diff = 6.2 - 0.1 = 6.1. 6.1 > PI (3.14).
    // diff -= 2PI (~6.28) -> -0.18.
    // new = 0.1 + -0.18 * t.
    // It should decrease.

    network.update(0.01); // t = 0.1
    // new = 0.1 - 0.018 = 0.082
    assert.ok(p.yaw < 0.1, `Expected yaw < 0.1 (wrapped interpolation), got ${p.yaw}`);

    // Test 6: Player Leave
    console.log("Test 6: Player Leave");
    const leaveMsg = {
        type: 'player_leave',
        id: 12345
    };
    network.socket.onmessage({ data: JSON.stringify(leaveMsg) });
    assert.strictEqual(network.otherPlayers.size, 0, "Player should be removed");

    console.log("All tests passed!");
}

runTests().catch(e => {
    console.error("Test failed:", e);
    process.exit(1);
});
