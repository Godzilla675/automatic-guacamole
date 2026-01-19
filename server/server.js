const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const players = new Map();

console.log('Server started on port 8080');

wss.on('connection', (ws) => {
    const id = Date.now(); // Simple ID
    players.set(id, { ws, x: 0, y: 0, z: 0, yaw: 0, pitch: 0 });

    console.log(`Player ${id} connected`);

    // Send ID to player
    ws.send(JSON.stringify({ type: 'id', id }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'move') {
                const player = players.get(id);
                if (player) {
                    player.x = data.x;
                    player.y = data.y;
                    player.z = data.z;
                    player.yaw = data.yaw;
                    player.pitch = data.pitch;

                    // Broadcast to others
                    broadcast({
                        type: 'player_update',
                        id: id,
                        x: player.x,
                        y: player.y,
                        z: player.z,
                        yaw: player.yaw,
                        pitch: player.pitch
                    }, id);
                }
            } else if (data.type === 'block') {
                // Broadcast block update
                broadcast({
                    type: 'block_update',
                    x: data.x,
                    y: data.y,
                    z: data.z,
                    blockType: data.blockType
                }, id);
            }
        } catch (e) {
            console.error('Error processing message', e);
        }
    });

    ws.on('close', () => {
        console.log(`Player ${id} disconnected`);
        players.delete(id);
        broadcast({ type: 'player_leave', id }, id);
    });
});

function broadcast(data, excludeId) {
    const msg = JSON.stringify(data);
    players.forEach((player, id) => {
        if (id !== excludeId && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(msg);
        }
    });
}
