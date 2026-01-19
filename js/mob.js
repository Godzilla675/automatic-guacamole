const MOB_TYPE = {
    COW: 'cow',
    ZOMBIE: 'zombie',
    PIG: 'pig'
};

class Mob {
    constructor(game, x, y, z, type = MOB_TYPE.COW) {
        this.game = game;
        this.world = game.world;
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;

        this.vx = 0;
        this.vy = 0;
        this.vz = 0;

        // Dimensions & Stats
        this.width = 0.6;
        this.height = 1.6;
        this.speed = 1.5;
        this.color = '#fff';

        this.yaw = Math.random() * Math.PI * 2;
        this.moveTimer = 0;

        this.initType();
    }

    initType() {
        switch(this.type) {
            case MOB_TYPE.COW:
                this.color = '#8B4513'; // Brown
                this.height = 1.4;
                this.speed = 1.0;
                break;
            case MOB_TYPE.PIG:
                this.color = '#FFC0CB'; // Pink
                this.height = 0.9;
                this.speed = 1.2;
                break;
            case MOB_TYPE.ZOMBIE:
                this.color = '#2E8B57'; // Green
                this.height = 1.8;
                this.speed = 2.5; // Faster
                break;
        }
    }

    update(dt) {
        if (this.type === MOB_TYPE.ZOMBIE) {
            this.updateHostileAI(dt);
        } else {
            this.updatePassiveAI(dt);
        }

        // Gravity
        this.vy -= 25 * dt;

        // Apply Velocity (Simplified Physics)
        this.x += this.vx * dt;
        this.z += this.vz * dt;
        this.y += this.vy * dt;

        // Simple Ground Collision
        // Check block at feet
        const bx = Math.floor(this.x);
        const by = Math.floor(this.y);
        const bz = Math.floor(this.z);

        // Check if stuck in block
        const blockIn = this.world.getBlock(bx, by, bz);
        if (blockIn !== BLOCK.AIR && blockIn !== BLOCK.WATER && !BLOCKS[blockIn].liquid) {
             // Push up
             this.y = by + 1;
             this.vy = 0;
        } else {
            // Check block below
             const blockBelow = this.world.getBlock(bx, by - 1, bz);
             if (blockBelow !== BLOCK.AIR && (!BLOCKS[blockBelow] || !BLOCKS[blockBelow].liquid)) {
                 if (this.y - by < 0.1) { // Close to ground
                     this.y = by;
                     this.vy = 0;
                 }
             }
        }

        // World Bounds (Respawn if fell out)
        if (this.y < -10) {
            this.y = 50;
            this.vy = 0;
        }
    }

    updatePassiveAI(dt) {
        this.moveTimer -= dt;
        if (this.moveTimer <= 0) {
            this.moveTimer = 2 + Math.random() * 5;
            this.yaw = Math.random() * Math.PI * 2;
            this.vx = Math.sin(this.yaw) * this.speed;
            this.vz = Math.cos(this.yaw) * this.speed;
            if (Math.random() < 0.1) this.vy = 5; // jump randomly
        }
    }

    updateHostileAI(dt) {
        // Chase player
        const player = this.game.player;
        const dx = player.x - this.x;
        const dz = player.z - this.z;
        const dist = Math.sqrt(dx*dx + dz*dz);

        if (dist < 20 && dist > 1) { // Detect range
            this.yaw = Math.atan2(dx, dz); // Correct atan2 order for (x, z) logic usually?
            // Standard Math.atan2(y, x). Here Z is Y.
            // But wait, our coordinate system:
            // x = sin(yaw), z = cos(yaw)
            // So tan(yaw) = x / z.
            // yaw = atan2(x, z).

            // Move towards player
            this.vx = Math.sin(this.yaw) * this.speed;
            this.vz = Math.cos(this.yaw) * this.speed;

            // Jump if wall (simple)
            const bx = Math.floor(this.x + this.vx * 0.5);
            const bz = Math.floor(this.z + this.vz * 0.5);
            const by = Math.floor(this.y);
            if (this.world.getBlock(bx, by, bz) !== BLOCK.AIR) {
                if (this.vy === 0) this.vy = 6;
            }
        } else {
            this.updatePassiveAI(dt); // Wander if lost
        }
    }
}

window.MOB_TYPE = MOB_TYPE;
window.Mob = Mob;
