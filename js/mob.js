const MOB_TYPE = {
    COW: 'cow',
    ZOMBIE: 'zombie',
    PIG: 'pig',
    SKELETON: 'skeleton',
    SPIDER: 'spider',
    SHEEP: 'sheep'
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
        this.attackCooldown = 0;
        this.health = 20;
        this.maxHealth = 20;
        this.lastDamageTime = 0;
        this.isDead = false;

        // Breeding
        this.loveTimer = 0;
        this.breedingCooldown = 0;
        this.isBaby = false;
        this.growthTimer = 0;

        this.initType();
    }

    interact(itemType) {
        if (this.breedingCooldown > 0 || this.isBaby) return false;

        let food = null;
        if (this.type === MOB_TYPE.COW || this.type === MOB_TYPE.SHEEP) food = BLOCK.WHEAT;
        else if (this.type === MOB_TYPE.PIG) food = BLOCK.ITEM_APPLE; // Placeholder for carrot

        if (food && itemType === food) {
            this.loveTimer = 30; // 30 seconds
            if (window.soundManager) window.soundManager.play('eat');
            return true;
        }
        return false;
    }

    initType() {
        switch(this.type) {
            case MOB_TYPE.COW:
                this.color = '#8B4513'; // Brown
                this.height = 1.4;
                this.speed = 1.0;
                this.maxHealth = 10;
                break;
            case MOB_TYPE.PIG:
                this.color = '#FFC0CB'; // Pink
                this.height = 0.9;
                this.speed = 1.2;
                this.maxHealth = 10;
                break;
            case MOB_TYPE.SHEEP:
                this.color = '#FFFFFF'; // White
                this.height = 1.3;
                this.speed = 1.0;
                this.maxHealth = 8;
                break;
            case MOB_TYPE.ZOMBIE:
                this.color = '#2E8B57'; // Green
                this.height = 1.8;
                this.speed = 2.5; // Faster
                this.maxHealth = 20;
                break;
            case MOB_TYPE.SKELETON:
                this.color = '#DDDDDD'; // Light Grey
                this.height = 1.8;
                this.speed = 2.0;
                this.maxHealth = 20;
                break;
            case MOB_TYPE.SPIDER:
                this.color = '#330000'; // Dark Red/Black
                this.height = 0.8;
                this.width = 1.2;
                this.speed = 3.5; // Very Fast
                this.maxHealth = 16;
                break;
        }
        this.health = this.maxHealth;
    }

    takeDamage(amount, knockbackDir) {
        if (this.isDead) return;

        this.health -= amount;
        this.lastDamageTime = Date.now();
        window.soundManager.play('break'); // Hit sound

        if (knockbackDir) {
            this.vx += knockbackDir.x * 10;
            this.vz += knockbackDir.z * 10;
            this.vy += 5; // Pop up
        }

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        // Drop items
        let dropType = null;
        let count = 1;

        switch(this.type) {
            case MOB_TYPE.COW:
                if (Math.random() < 0.5) dropType = BLOCK.ITEM_LEATHER;
                // else Meat? Not implemented yet
                break;
            case MOB_TYPE.PIG:
                dropType = BLOCK.ITEM_PORKCHOP;
                break;
            case MOB_TYPE.SHEEP:
                dropType = BLOCK.WOOL_WHITE;
                if (Math.random() < 0.5 && this.game.drops) {
                     this.game.drops.push(new Drop(this.game, this.x, this.y + this.height/2, this.z, BLOCK.ITEM_MUTTON, 1));
                }
                break;
            case MOB_TYPE.ZOMBIE:
                dropType = BLOCK.ITEM_ROTTEN_FLESH;
                break;
            case MOB_TYPE.SKELETON:
                dropType = BLOCK.ITEM_BONE;
                // Chance for arrow or bow?
                break;
            case MOB_TYPE.SPIDER:
                dropType = BLOCK.ITEM_STRING;
                break;
        }

        if (dropType && this.game.drops) {
             this.game.drops.push(new Drop(this.game, this.x, this.y + this.height/2, this.z, dropType, count));
        }
    }

    update(dt) {
        if (this.isDead) return;

        if (this.type === MOB_TYPE.ZOMBIE || this.type === MOB_TYPE.SKELETON || this.type === MOB_TYPE.SPIDER) {
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
        // Breeding Logic
        if (this.loveTimer > 0) {
            this.loveTimer -= dt;
            // Look for mate
            if (this.loveTimer > 0) {
                 // Find another mob of same type in love mode
                 const mate = this.game.mobs.find(m =>
                     m !== this &&
                     m.type === this.type &&
                     m.loveTimer > 0 &&
                     !m.isDead &&
                     !m.isBaby
                 );

                 if (mate) {
                     // Move towards mate
                     const dx = mate.x - this.x;
                     const dz = mate.z - this.z;
                     const dist = Math.sqrt(dx*dx + dz*dz);

                     if (dist < 1.5) {
                         // Breed
                         this.loveTimer = 0;
                         mate.loveTimer = 0;
                         this.breedingCooldown = 60; // 1 min
                         mate.breedingCooldown = 60;

                         // Spawn Baby
                         const baby = new Mob(this.game, this.x, this.y, this.z, this.type);
                         baby.isBaby = true;
                         baby.width *= 0.5;
                         baby.height *= 0.5;
                         baby.growthTimer = 300; // 5 mins to grow
                         this.game.mobs.push(baby);

                         if (window.soundManager) window.soundManager.play('place'); // Pop sound
                     } else {
                         this.yaw = Math.atan2(dx, dz);
                         this.vx = Math.sin(this.yaw) * this.speed;
                         this.vz = Math.cos(this.yaw) * this.speed;
                         return; // Skip wander
                     }
                 }
            }
        }

        // Growth
        if (this.isBaby) {
            this.growthTimer -= dt;
            if (this.growthTimer <= 0) {
                this.isBaby = false;
                this.initType(); // Reset size
            }
        }

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

        if (dist < 20) { // Detect range
            this.yaw = Math.atan2(dx, dz);

            if (dist < 1.5 && this.attackCooldown <= 0) {
                // Melee Attack
                 if (this.type === MOB_TYPE.ZOMBIE || this.type === MOB_TYPE.SPIDER) {
                     this.game.player.takeDamage(3); // Damage player

                     // Knockback player
                     const dirX = Math.sin(this.yaw);
                     const dirZ = Math.cos(this.yaw);
                     this.game.player.vx += dirX * 10;
                     this.game.player.vz += dirZ * 10;
                     this.game.player.vy += 2;

                     this.attackCooldown = 1.5;
                 }
            }

            this.attackCooldown -= dt;

            if (dist > 1.5) {
                if (this.type === MOB_TYPE.SKELETON) {
                 if (dist > 8) {
                     // Move closer
                     this.vx = Math.sin(this.yaw) * this.speed;
                     this.vz = Math.cos(this.yaw) * this.speed;
                 } else {
                     // Stop and shoot
                     this.vx = 0;
                     this.vz = 0;
                     this.attackCooldown -= dt;
                     if (this.attackCooldown <= 0) {
                         if (this.game.spawnProjectile) {
                             // Shoot at player height
                             const dir = { x: dx/dist, y: (player.y + player.height*0.8 - (this.y + this.height*0.8))/dist, z: dz/dist };
                             this.game.spawnProjectile(this.x, this.y + this.height * 0.8, this.z, dir);
                         }
                         this.attackCooldown = 3.0;
                     }
                 }
                } else {
                // Zombie & Spider
                this.vx = Math.sin(this.yaw) * this.speed;
                this.vz = Math.cos(this.yaw) * this.speed;

                // Jump if wall (simple)
                const bx = Math.floor(this.x + this.vx * 0.5);
                const bz = Math.floor(this.z + this.vz * 0.5);
                const by = Math.floor(this.y);
                const blockInFront = this.world.getBlock(bx, by, bz);

                if (blockInFront !== BLOCK.AIR && !BLOCKS[blockInFront].liquid) {
                    if (this.type === MOB_TYPE.SPIDER) {
                        this.vy = 5; // Climb/Super jump
                    } else if (this.vy === 0) {
                        this.vy = 6;
                    }
                }
            }
            }
        } else {
            this.updatePassiveAI(dt); // Wander if lost
        }
    }
}

window.MOB_TYPE = MOB_TYPE;
window.Mob = Mob;
