class ParticleSystem {
    constructor(game) {
        this.game = game;
        this.particles = [];
        this.pool = [];
    }

    getParticle(props) {
        let p;
        if (this.pool.length > 0) {
            p = this.pool.pop();
        } else {
            p = {};
        }
        p.x = props.x || 0;
        p.y = props.y || 0;
        p.z = props.z || 0;
        p.vx = props.vx || 0;
        p.vy = props.vy || 0;
        p.vz = props.vz || 0;
        p.life = props.life !== undefined ? props.life : 1.0;
        p.color = props.color || '#FFFFFF';
        p.size = props.size || 0.1;
        p.orbit = !!props.orbit;
        p.type = props.type || 'standard';
        p.radius = props.radius || 0.1;
        p.maxRadius = props.maxRadius || 0.5;
        p.maxLife = props.life !== undefined ? props.life : 1.0;
        return p;
    }

    spawnLiquidRipple(x, y, z, color = '#a0c0ff') {
        const p = this.getParticle({
            x: x,
            y: y,
            z: z,
            vx: 0,
            vy: 0,
            vz: 0,
            life: 0.6,
            color: color,
            size: 0.1,
            type: 'ripple',
            radius: 0.1,
            maxRadius: 0.55
        });
        this.particles.push(p);
    }

    spawnVaultOrbit(x, y, z, color = '#00FFFF') {
        const particleCount = 24;
        const radius = 0.8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + (i / particleCount) * 0.6;
            const pz = z + Math.sin(angle) * radius;
            this.particles.push(this.getParticle({
                x: px,
                y: py,
                z: pz,
                vx: -Math.sin(angle) * 1.5,
                vy: 0.8,
                vz: Math.cos(angle) * 1.5,
                life: 1.5,
                color: color,
                size: 0.12,
                orbit: true
            }));
        }
    }

    spawnFirework(x, y, z) {
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#FFA500'];
        const particleCount = 40;
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 3.0 + Math.random() * 5.0;
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push(this.getParticle({
                x: x,
                y: y,
                z: z,
                vx: speed * Math.sin(phi) * Math.cos(theta),
                vy: speed * Math.cos(phi),
                vz: speed * Math.sin(phi) * Math.sin(theta),
                life: 1.5 + Math.random() * 0.5,
                color: color,
                size: 0.15 + Math.random() * 0.1
            }));
        }
    }

    spawnWindChargeShockwave(x, y, z) {
        const particleCount = 28;
        const radius = 0.3;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 3.5 + Math.random() * 1.5;
            this.particles.push(this.getParticle({
                x: x + Math.cos(angle) * radius,
                y: y + (Math.random() - 0.5) * 0.2,
                z: z + Math.sin(angle) * radius,
                vx: Math.cos(angle) * speed,
                vy: (Math.random() * 0.8) + 0.2,
                vz: Math.sin(angle) * speed,
                life: 0.6 + Math.random() * 0.3,
                color: i % 2 === 0 ? '#E0FFFF' : '#00FFFF',
                size: 0.15 + Math.random() * 0.1
            }));
        }
    }

    spawn(x, y, z, color, count = 5) {
        for (let i = 0; i < count; i++) {
            this.particles.push(this.getParticle({
                x: x + (Math.random() - 0.5) * 0.5,
                y: y + (Math.random() - 0.5) * 0.5,
                z: z + (Math.random() - 0.5) * 0.5,
                vx: (Math.random() - 0.5) * 2.0,
                vy: (Math.random() * 2.0),
                vz: (Math.random() - 0.5) * 2.0,
                life: 1.0 + Math.random(),
                color: color,
                size: 0.1 + Math.random() * 0.1
            }));
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                if (this.pool.length < 500) {
                    this.pool.push(p);
                }
                continue;
            }

            if (p.type === 'ripple') {
                const progress = 1 - (p.life / (p.maxLife || 0.6));
                p.radius = (p.maxRadius || 0.55) * progress;
            } else {
                p.vy -= 15.0 * dt; // Gravity
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.z += p.vz * dt;

                // Simple collision check (floor)
                if (p.y < 0) p.y = 0;
            }
        }
    }

    render(ctx, camera) {
        // Rendered by Renderer.prototype.render
    }
}

if (typeof window !== 'undefined') window.ParticleSystem = ParticleSystem;
if (typeof global !== 'undefined') global.ParticleSystem = ParticleSystem;
