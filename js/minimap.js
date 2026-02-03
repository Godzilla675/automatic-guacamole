class Minimap {
    constructor(game) {
        this.game = game;
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'minimap';
        this.canvas.width = 128;
        this.canvas.height = 128;
        Object.assign(this.canvas.style, {
            position: 'absolute',
            top: '10px',
            right: '10px',
            border: '2px solid white',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: '50'
        });
        const hud = document.getElementById('hud');
        if (hud) hud.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    update() {
        if (!this.game.player) return;
        const ctx = this.ctx;
        const player = this.game.player;
        const cx = Math.floor(player.x);
        const cz = Math.floor(player.z);
        const radius = 32;

        ctx.clearRect(0, 0, 128, 128);
        ctx.save();
        ctx.translate(64, 64);
        ctx.rotate(-player.yaw);
        ctx.translate(-64, -64);

        // Optimization: Don't scan too deep
        for(let z = -radius; z <= radius; z+=2) { // Skip every other block for perf
            for(let x = -radius; x <= radius; x+=2) {
                if (x*x + z*z > radius*radius) continue;

                // Get top block
                let y = this.game.world.getHighestBlockY(cx + x, cz + z);
                // Simple surface map
                let block = this.game.world.getBlock(cx + x, y - 1, cz + z);

                if (block !== 0) {
                    const color = this.getBlockColor(block);
                    ctx.fillStyle = color;
                    ctx.fillRect(64 + x * 2, 64 + z * 2, 4, 4);
                }
            }
        }

        // Draw Player Arrow
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(64, 60);
        ctx.lineTo(68, 68);
        ctx.lineTo(60, 68);
        ctx.fill();

        ctx.restore();
    }

    getBlockColor(type) {
        const def = window.BLOCKS[type];
        return def ? (def.top || def.color) : '#000';
    }
}
window.Minimap = Minimap;
