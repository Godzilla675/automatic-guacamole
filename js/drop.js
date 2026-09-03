class Drop {
    constructor(game, x, y, z, type, count = 1) {
        this.game = game;
        this.world = game.world;
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;
        this.count = count;

        // Random velocity spread
        this.vx = (Math.random() - 0.5) * 2.0;
        this.vy = 3.0 + Math.random() * 2.0; // Pop up
        this.vz = (Math.random() - 0.5) * 2.0;

        this.width = 0.3;
        this.height = 0.3;
        this.gravity = 20.0;
        this.lifeTime = 300.0; // 5 minutes

        // Visual rotation
        this.rotY = 0;

        // Prevent initial spawning inside solid blocks
        if (this.world) {
            let bx = Math.floor(this.x);
            let by = Math.floor(this.y);
            let bz = Math.floor(this.z);
            let blockIn = this.world.getBlock(bx, by, bz);
            let tries = 0;
            while (blockIn !== BLOCK.AIR && blockIn !== BLOCK.WATER && window.BLOCKS[blockIn] && window.BLOCKS[blockIn].solid && tries < 10) {
                by++;
                blockIn = this.world.getBlock(bx, by, bz);
                tries++;
            }
            if (tries > 0) {
                this.y = by + 0.2;
            }
        }
    }

    update(dt) {
        this.lifeTime -= dt;
        this.rotY += 2.0 * dt;

        if (this.lifeTime <= 0) {
            if (this.game && this.game.particles) {
                this.game.particles.spawn(this.x, this.y, this.z, '#888888', 3);
            }
        }

        // Gravity
        this.vy -= this.gravity * dt;

        // Calculate next position
        const nextX = this.x + this.vx * dt;
        const nextY = this.y + this.vy * dt;
        const nextZ = this.z + this.vz * dt;

        // Simple Physics (Check block inside & below)
        const bx = Math.floor(nextX);
        const by = Math.floor(nextY);
        const bz = Math.floor(nextZ);

        // Check if inside solid block
        const blockIn = this.world.getBlock(bx, by, bz);
        const defIn = window.BLOCKS[blockIn];
        if (blockIn !== BLOCK.AIR && blockIn !== BLOCK.WATER && defIn && defIn.solid) {
             // Push out/up
             this.y = by + 1.2;
             this.vy = 0;
             this.vx *= 0.5;
             this.vz *= 0.5;
        } else {
             const blockBelow = this.world.getBlock(bx, by - 1, bz);
             const defBelow = window.BLOCKS[blockBelow];
             if (blockBelow !== BLOCK.AIR && defBelow && defBelow.solid) {
                 if (nextY - by < 0.3) {
                     this.y = by + 0.3;
                     this.vy = 0;
                     this.vx *= 0.8; // Ground friction
                     this.vz *= 0.8;
                 } else {
                     this.y = nextY;
                 }
             } else {
                 this.y = nextY;
             }
        }

        this.x = nextX;
        this.z = nextZ;

        // Magnet to player if close
        const player = this.game.player;
        const dx = player.x - this.x;
        const dy = (player.y + player.height/2) - this.y;
        const dz = player.z - this.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        if (dist < 3.0) {
            this.vx += (dx / dist) * 10 * dt;
            this.vy += (dy / dist) * 10 * dt;
            this.vz += (dz / dist) * 10 * dt;
        }
    }
}

window.Drop = Drop;
