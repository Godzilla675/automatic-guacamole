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
            case 'player_update': {
                let p = this.otherPlayers.get(data.id);
                if (!p) {
                    // New player, set immediately
                    this.otherPlayers.set(data.id, {
                        x: data.x,
                        y: data.y,
                        z: data.z,
                        yaw: data.yaw,
                        pitch: data.pitch,
                        name: data.name,
                        skinColor: data.skinColor,
                        target: { x: data.x, y: data.y, z: data.z, yaw: data.yaw, pitch: data.pitch }
                    });
                } else {
                    // Existing player, update target for interpolation
                    p.target = { x: data.x, y: data.y, z: data.z, yaw: data.yaw, pitch: data.pitch };

                    // If distance is too large (teleport), snap immediately
                    const dist = Math.sqrt((p.x-data.x)**2 + (p.y-data.y)**2 + (p.z-data.z)**2);
                    if (dist > 10) {
                        p.x = data.x; p.y = data.y; p.z = data.z;
                        p.yaw = data.yaw; p.pitch = data.pitch;
                    }
                }
                break;
            }
            case 'chat':
                if (this.game.chat) {
                    this.game.chat.addMessage(data.message, data.sender);
                }
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

    update(dt) {
        // Interpolate positions
        const speed = 10; // Smoothing factor

        this.otherPlayers.forEach(p => {
             if (p.target) {
                 p.x += (p.target.x - p.x) * speed * dt;
                 p.y += (p.target.y - p.y) * speed * dt;
                 p.z += (p.target.z - p.z) * speed * dt;

                 // Angle interpolation (shortest path)
                 p.yaw = this.lerpAngle(p.yaw, p.target.yaw, speed * dt);
                 p.pitch = p.pitch + (p.target.pitch - p.pitch) * speed * dt; // Pitch doesn't wrap
             }
        });
    }

    lerpAngle(start, end, t) {
        let diff = end - start;
        // Normalize diff to -PI to PI
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        return start + diff * t;
    }

    sendPosition(x, y, z, yaw, pitch) {
        if (!this.connected) return;
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'move', x, y, z, yaw, pitch,
                name: this.game.player.name,
                skinColor: this.game.player.skinColor
            }));
        }
    }

    sendChat(message) {
        if (!this.connected) return;
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'chat',
                sender: this.game.player.name || 'Player',
                message: message
            }));
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
