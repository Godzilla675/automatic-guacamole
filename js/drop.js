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
    }

    update(dt) {
        this.lifeTime -= dt;
        this.rotY += 2.0 * dt;

        // Gravity
        this.vy -= this.gravity * dt;

        // Simple Physics (Check block below)
        const bx = Math.floor(this.x);
        const by = Math.floor(this.y);
        const bz = Math.floor(this.z);

        // Check if inside block
        const blockIn = this.world.getBlock(bx, by, bz);
        if (blockIn !== BLOCK.AIR && blockIn !== BLOCK.WATER && !BLOCKS[blockIn].liquid) {
             // Push out/up
             this.y = by + 1.2;
             this.vy = 0;
             this.vx *= 0.8;
             this.vz *= 0.8;
        } else {
             const blockBelow = this.world.getBlock(bx, by - 1, bz);
             if (blockBelow !== BLOCK.AIR && (!BLOCKS[blockBelow] || !BLOCKS[blockBelow].liquid)) {
                 if (this.y - by < 0.3) {
                     this.y = by + 0.3;
                     this.vy = 0;
                     this.vx *= 0.8; // Ground friction
                     this.vz *= 0.8;
                 }
             }
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.z += this.vz * dt;

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
