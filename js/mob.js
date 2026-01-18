class Mob {
    constructor(world, x, y, z) {
        this.world = world;
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.width = 0.6;
        this.height = 1.6;
        this.yaw = Math.random() * Math.PI * 2;
        this.moveTimer = 0;
    }

    update(dt) {
        // Simple AI: Move randomly
        this.moveTimer -= dt;
        if (this.moveTimer <= 0) {
            this.moveTimer = 2 + Math.random() * 3;
            this.yaw = Math.random() * Math.PI * 2;
            this.vx = Math.sin(this.yaw) * 1.5; // slow speed
            this.vz = Math.cos(this.yaw) * 1.5;
            if (Math.random() < 0.1) this.vy = 5; // jump
        }

        // Gravity
        this.vy -= 25 * dt;

        // Collision logic (simplified copy from player)
        // ... (omitted for brevity, just update position for now)
        this.x += this.vx * dt;
        this.z += this.vz * dt;

        // Simple ground collision
        let groundY = Math.floor(this.y);
        if (this.world.getBlock(Math.floor(this.x), groundY, Math.floor(this.z)) === BLOCK.AIR) {
             this.y += this.vy * dt;
        } else {
             this.y = Math.floor(this.y) + 1;
             this.vy = 0;
        }

        // Keep above bedrock
        if (this.y < 1) this.y = 50;
    }
}

window.Mob = Mob;
