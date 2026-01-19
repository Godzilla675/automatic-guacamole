// Network Manager

class NetworkManager {
    constructor(game) {
        this.game = game;
        this.connected = false;
        this.socket = null;
        this.otherPlayers = new Map();
        this.myId = null;
    }

    connect(url) {
        console.log('Connecting to server:', url);
        try {
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                this.connected = true;
                console.log('Connected to server');
                this.game.chat?.addMessage("Connected to server!");
            };

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };

            this.socket.onclose = () => {
                this.connected = false;
                console.log('Disconnected from server');
                this.game.chat?.addMessage("Disconnected from server");
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

        } catch (e) {
            console.warn('Multiplayer not available (Server likely down or offline mode)');
        }
    }

    handleMessage(data) {
        switch (data.type) {
            case 'id':
                this.myId = data.id;
                break;
            case 'player_update':
                this.otherPlayers.set(data.id, {
                    x: data.x,
                    y: data.y,
                    z: data.z,
                    yaw: data.yaw,
                    pitch: data.pitch,
                    lastUpdate: Date.now()
                });
                break;
            case 'player_leave':
                this.otherPlayers.delete(data.id);
                break;
            case 'block_update':
                this.game.world.setBlock(data.x, data.y, data.z, data.blockType);
                // Force chunk update visual
                const cx = Math.floor(data.x / 16);
                const cz = Math.floor(data.z / 16);
                const chunk = this.game.world.getChunk(cx, cz);
                if (chunk) chunk.modified = true;
                break;
        }
    }

    sendPosition(x, y, z, yaw, pitch) {
        if (!this.connected) return;
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'move', x, y, z, yaw, pitch }));
        }
    }

    sendBlockUpdate(x, y, z, type) {
        if (!this.connected) return;
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'block', x, y, z, blockType: type }));
        }
    }
}

window.NetworkManager = NetworkManager;
