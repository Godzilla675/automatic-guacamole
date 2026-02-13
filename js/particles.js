class ParticleSystem {
    constructor(game) {
        this.game = game;
        this.particles = [];
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
