class Player {
    constructor(game) {
        this.game = game;
        this.x = 8;
        this.y = 30;
        this.z = 8;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.pitch = 0;
        this.yaw = 0;

        this.width = 0.6;
        this.height = 1.8;
        this.speed = 4.3; // m/s
        this.jumpForce = 9.0;
        this.gravity = 25.0;

        this.onGround = false;
        this.flying = false;

        this.inventory = new Array(36).fill(null);
        // Default items
        this.inventory[0] = { type: BLOCK.DIRT, count: 64 };
        this.inventory[1] = { type: BLOCK.STONE, count: 64 };
        this.inventory[2] = { type: BLOCK.GRASS, count: 64 };
        this.inventory[3] = { type: BLOCK.WOOD, count: 64 };
        this.inventory[4] = { type: BLOCK.LEAVES, count: 64 };
        this.inventory[5] = { type: BLOCK.BRICK, count: 64 };
        this.inventory[6] = { type: BLOCK.PLANK, count: 64 };
        this.inventory[7] = { type: BLOCK.GLASS, count: 64 };
        // Give tools
        this.inventory[8] = { type: BLOCK.PICKAXE_DIAMOND, count: 1 };

        this.selectedSlot = 0;
    }

    update(dt) {
        const controls = this.game.controls;

        // Physics integration
        const moveSpeed = this.speed;

        let dx = 0;
        let dz = 0;

        if (controls.forward) dz -= 1;
        if (controls.backward) dz += 1;
        if (controls.left) dx -= 1;
        if (controls.right) dx += 1;

        // Normalize vector
        if (dx !== 0 || dz !== 0) {
            const len = Math.sqrt(dx*dx + dz*dz);
            dx /= len;
            dz /= len;
        }

        const sin = Math.sin(this.yaw);
        const cos = Math.cos(this.yaw);

        const moveX = dx * cos - dz * sin;
        const moveZ = dx * sin + dz * cos;

        this.vx = moveX * moveSpeed;
        this.vz = moveZ * moveSpeed;

        if (controls.jump && (this.onGround || this.flying)) {
            if (this.flying) {
                 this.vy = moveSpeed;
            } else {
                 this.vy = this.jumpForce;
                 this.onGround = false;
                 window.soundManager.play('jump');
            }
        } else if (controls.sneak && this.flying) {
            this.vy = -moveSpeed;
        }

        if (!this.flying) {
            this.vy -= this.gravity * dt;
        } else {
            if (!controls.jump && !controls.sneak) this.vy = 0;
        }

        // Apply Velocity
        this.moveBy(this.vx * dt, this.vy * dt, this.vz * dt);

        // Friction
        if (this.flying) {
            this.vx *= 0.9;
            this.vz *= 0.9;
        }
    }

    moveBy(dx, dy, dz) {
        const world = this.game.world;
        const physics = this.game.physics;

        // X Axis
        if (physics.checkCollision({x: this.x + dx, y: this.y, z: this.z, width: this.width, height: this.height})) {
            this.vx = 0;
        } else {
            this.x += dx;
        }

        // Z Axis
        if (physics.checkCollision({x: this.x, y: this.y, z: this.z + dz, width: this.width, height: this.height})) {
            this.vz = 0;
        } else {
            this.z += dz;
        }

        // Y Axis
        if (physics.checkCollision({x: this.x, y: this.y + dy, z: this.z, width: this.width, height: this.height})) {
            if (dy < 0) this.onGround = true;
            this.vy = 0;
        } else {
            this.y += dy;
            this.onGround = false;
        }

        // World Bounds (Respawn)
        if (this.y < -10) {
            this.y = 40;
            this.vy = 0;
        }
    }
}

window.Player = Player;
