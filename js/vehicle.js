class Vehicle extends Entity {
    constructor(game, x, y, z) {
        super(game, x, y, z);
        this.rider = null;
    }

    interact(player) {
        if (this.rider) {
            this.rider = null; // Dismount
            player.riding = null;
            player.y += 1; // Hop off
            player.vy = 5;
            player.onGround = false;
        } else {
            this.rider = player;
            player.riding = this;
            // Center player on vehicle
            player.x = this.x;
            player.y = this.y + this.height;
            player.z = this.z;
        }
    }
}

class Minecart extends Vehicle {
    constructor(game, x, y, z) {
        super(game, x, y, z);
        this.type = 'minecart';
        this.width = 0.98;
        this.height = 0.7;
    }

    update(dt) {
        // Rail logic
        const bx = Math.floor(this.x);
        const by = Math.floor(this.y);
        const bz = Math.floor(this.z);
        const block = this.game.world.getBlock(bx, by, bz);

        // Check if on rail (or slightly above)
        // Also check block below if we are slightly inside
        let railBlock = block;
        let railY = by;

        // Simple rail check
        const isRail = (id) => {
            const def = window.BLOCKS[id];
            return id === window.BLOCK.RAIL || id === window.BLOCK.POWERED_RAIL || (def && def.name && def.name.includes('Rail'));
        };

        if (!isRail(railBlock)) {
             const blockBelow = this.game.world.getBlock(bx, by - 1, bz);
             if (isRail(blockBelow)) {
                 railBlock = blockBelow;
                 railY = by - 1;
             }
        }

        if (isRail(railBlock)) {
             this.onGround = true;
             this.y = railY + 0.1; // Snap to rail height
             this.vy = 0;

             // Friction / Drag
             this.vx *= 0.99;
             this.vz *= 0.99;

             // If rider controls
             if (this.rider) {
                 if (this.game.controls.forward) {
                     const speed = 10 * dt;
                     this.vx += Math.sin(this.rider.yaw) * speed;
                     this.vz += Math.cos(this.rider.yaw) * speed;
                 }
                 if (this.game.controls.backward) {
                    const speed = 10 * dt;
                    this.vx -= Math.sin(this.rider.yaw) * speed;
                    this.vz -= Math.cos(this.rider.yaw) * speed;
                 }
             }

             // Clamp to axis? Real minecarts turn corners.
             // For simplified logic: Just let velocity carry it.
             // But we should probably restrict movement to the rail axis if we wanted to be fancy.
             // MVP: Free movement with momentum on rails.

        } else {
             // Gravity
             this.vy -= 25 * dt;

             // Collision with ground
             const ground = this.game.world.getBlock(bx, Math.floor(this.y - 0.1), bz);
             if (ground !== window.BLOCK.AIR && ground !== window.BLOCK.WATER) {
                 if (this.y - Math.floor(this.y) < 0.2) {
                     this.y = Math.floor(this.y) + 0.2; // minimal height
                     this.vy = 0;
                     this.onGround = true;
                     this.vx *= 0.5; // Ground friction
                     this.vz *= 0.5;
                 }
             } else {
                 this.onGround = false;
             }
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.z += this.vz * dt;

        // Sync rider
        if (this.rider) {
            this.rider.x = this.x;
            this.rider.y = this.y + 0.5; // Seat height
            this.rider.z = this.z;
            this.rider.vx = this.vx;
            this.rider.vy = this.vy;
            this.rider.vz = this.vz;
        }
    }
}

class Boat extends Vehicle {
    constructor(game, x, y, z) {
        super(game, x, y, z);
        this.type = 'boat';
        this.width = 1.4;
        this.height = 0.6;
    }

    update(dt) {
        const bx = Math.floor(this.x);
        const by = Math.floor(this.y);
        const bz = Math.floor(this.z);
        const block = this.game.world.getBlock(bx, by, bz);
        const blockBelow = this.game.world.getBlock(bx, by-1, bz);

        const inWater = block === window.BLOCK.WATER || blockBelow === window.BLOCK.WATER;

        if (inWater) {
            // Buoyancy
            if (block === window.BLOCK.WATER) {
                this.vy += 20 * dt; // Float up
            } else {
                // On surface
                if (this.vy < 0) this.vy = 0;
            }

            if (this.vy > 2) this.vy = 2;

            this.vx *= 0.95;
            this.vz *= 0.95; // Water drag

            if (this.rider) {
                const speed = 10 * dt;
                 if (this.game.controls.forward) {
                     this.vx += Math.sin(this.rider.yaw) * speed;
                     this.vz += Math.cos(this.rider.yaw) * speed;
                 }
                 // Steering (rotates the boat visual? We don't have separate boat yaw yet, assumes player yaw)
                 // Actually boat should have its own yaw.
                 // MVP: Move in player look direction.
            }
        } else {
            this.vy -= 25 * dt; // Gravity
            // Ground friction
             const ground = this.game.world.getBlock(bx, Math.floor(this.y - 0.1), bz);
             if (ground !== window.BLOCK.AIR && ground !== window.BLOCK.WATER) {
                 if (this.y - Math.floor(this.y) < 0.2) {
                     this.y = Math.floor(this.y) + 0.2;
                     this.vy = 0;
                     this.vx *= 0.5;
                     this.vz *= 0.5;
                 }
             }
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.z += this.vz * dt;

        // Sync rider
        if (this.rider) {
            this.rider.x = this.x;
            this.rider.y = this.y + 0.5;
            this.rider.z = this.z;
            this.rider.vx = this.vx;
            this.rider.vy = this.vy;
            this.rider.vz = this.vz;
        }
    }
}

if (typeof window !== 'undefined') {
    window.Vehicle = Vehicle;
    window.Minecart = Minecart;
    window.Boat = Boat;
} else {
    // For Node.js
    global.Vehicle = Vehicle;
    global.Minecart = Minecart;
    global.Boat = Boat;
}
