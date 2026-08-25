class ParticleSystem {
    constructor(game) {
        this.game = game;
        this.particles = [];
    }


    spawnFirework(x, y, z) {
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#FFA500'];
        const particleCount = 40;
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 3.0 + Math.random() * 5.0;
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push({
                x: x,
                y: y,
                z: z,
                vx: speed * Math.sin(phi) * Math.cos(theta),
                vy: speed * Math.cos(phi),
                vz: speed * Math.sin(phi) * Math.sin(theta),
                life: 1.5 + Math.random() * 0.5,
                color: color,
                size: 0.15 + Math.random() * 0.1
            });
        }
    }

    spawn(x, y, z, color, count = 5) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 0.5,
                y: y + (Math.random() - 0.5) * 0.5,
                z: z + (Math.random() - 0.5) * 0.5,
                vx: (Math.random() - 0.5) * 2.0,
                vy: (Math.random() * 2.0),
                vz: (Math.random() - 0.5) * 2.0,
                life: 1.0 + Math.random(),
                color: color,
                size: 0.1 + Math.random() * 0.1
            });
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            p.vy -= 15.0 * dt; // Gravity
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.z += p.vz * dt;

            // Simple collision check (floor)
            if (p.y < 0) p.y = 0;
        }
    }

    render(ctx, camera) {
        // This would require hooking into Renderer.
        // Since Renderer uses WebGL or Canvas 2D?
        // The game seems to be Canvas 2D based on `this.ctx = this.canvas.getContext('2d');` in `game.js`.
        // I need to check `js/renderer.js`.
    }
}

window.ParticleSystem = ParticleSystem;
