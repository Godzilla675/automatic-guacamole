const MOB_TYPE = {
    COW: 'cow',
    ZOMBIE: 'zombie',
    PIG: 'pig',
    SKELETON: 'skeleton',
    SPIDER: 'spider',
    SHEEP: 'sheep',
    WOLF: 'wolf',
    OCELOT: 'ocelot',
    VILLAGER: 'villager',
    IRON_GOLEM: 'iron_golem',
    CHICKEN: 'chicken',
    CREEPER: 'creeper',
    ENDERMAN: 'enderman',
    PIGMAN: 'pigman',
    GHAST: 'ghast',
    BLAZE: 'blaze'
};

class Mob extends Entity {
    constructor(game, x, y, z, type = MOB_TYPE.COW) {
        super(game, x, y, z);
        this.world = game.world;
        this.type = type;

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

        // Special timers
        this.fuseTimer = 0; // For Creeper

        // Breeding
        this.loveTimer = 0;
        this.breedingCooldown = 0;
        this.isBaby = false;
        this.growthTimer = 0;

        // Taming
        this.isTamed = false;
        this.owner = null; // Could store player ID
        this.isSitting = false;

        this.xpValue = 0;
        this.initType();
    }

    interact(itemType) {
        if (this.breedingCooldown > 0 || this.isBaby) return false;

        // Villager Trading
        if (this.type === MOB_TYPE.VILLAGER) {
             if (this.game.ui && this.game.ui.openTrading) {
                 this.game.ui.openTrading(this);
                 return true;
             }
             return false;
        }

        // Taming Wolf
        if (this.type === MOB_TYPE.WOLF && !this.isTamed && itemType === BLOCK.ITEM_BONE) {
            if (Math.random() < 0.3) {
                this.isTamed = true;
                this.color = '#FFFFFF'; // White collar indication
                if (window.soundManager) window.soundManager.play('place', {x: this.x, y: this.y, z: this.z});
            }
            return true;
        }

        // Toggle Sit for Tamed Wolf/Cat
        if ((this.type === MOB_TYPE.WOLF || this.type === MOB_TYPE.OCELOT) && this.isTamed && itemType === 0) { // Empty hand
            this.isSitting = !this.isSitting;
            return true;
        }

        // Taming Ocelot
        if (this.type === MOB_TYPE.OCELOT && !this.isTamed && itemType === BLOCK.ITEM_RAW_FISH) {
             if (Math.random() < 0.3) {
                this.isTamed = true;
                this.color = '#000000'; // Black cat
                if (window.soundManager) window.soundManager.play('place', {x: this.x, y: this.y, z: this.z});
             }
             return true;
        }

        let food = null;
        if (this.type === MOB_TYPE.COW || this.type === MOB_TYPE.SHEEP) food = BLOCK.ITEM_WHEAT;
        else if (this.type === MOB_TYPE.PIG) food = BLOCK.ITEM_APPLE; // Placeholder for carrot
        else if (this.type === MOB_TYPE.WOLF && this.isTamed) food = BLOCK.ITEM_PORKCHOP; // Heal wolf
        else if (this.type === MOB_TYPE.CHICKEN) food = BLOCK.ITEM_WHEAT_SEEDS;

        if (food && itemType === food) {
            this.loveTimer = 30; // 30 seconds
            if (window.soundManager) window.soundManager.play('eat', {x: this.x, y: this.y, z: this.z});
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
                this.xpValue = 2;
                break;
            case MOB_TYPE.PIG:
                this.color = '#FFC0CB'; // Pink
                this.height = 0.9;
                this.speed = 1.2;
                this.maxHealth = 10;
                this.xpValue = 2;
                break;
            case MOB_TYPE.SHEEP:
                this.color = '#FFFFFF'; // White
                this.height = 1.3;
                this.speed = 1.0;
                this.maxHealth = 8;
                this.xpValue = 2;
                break;
            case MOB_TYPE.CHICKEN:
                this.color = '#FFFFFF';
                this.height = 0.7;
                this.width = 0.4;
                this.speed = 1.5;
                this.maxHealth = 4;
                this.xpValue = 1;
                break;
            case MOB_TYPE.ZOMBIE:
                this.color = '#2E8B57'; // Green
                this.height = 1.8;
                this.speed = 2.5; // Faster
                this.maxHealth = 20;
                this.xpValue = 5;
                break;
            case MOB_TYPE.SKELETON:
                this.color = '#DDDDDD'; // Light Grey
                this.height = 1.8;
                this.speed = 2.0;
                this.maxHealth = 20;
                this.xpValue = 5;
                break;
            case MOB_TYPE.SPIDER:
                this.color = '#330000'; // Dark Red/Black
                this.height = 0.8;
                this.width = 1.2;
                this.speed = 3.5; // Very Fast
                this.maxHealth = 16;
                this.xpValue = 5;
                break;
            case MOB_TYPE.CREEPER:
                this.color = '#00FF00'; // Bright Green
                this.height = 1.7;
                this.speed = 1.8;
                this.maxHealth = 20;
                this.xpValue = 5;
                break;
            case MOB_TYPE.ENDERMAN:
                this.color = '#000000'; // Black
                this.height = 2.9;
                this.speed = 3.0;
                this.maxHealth = 40;
                this.xpValue = 10;
                break;
            case MOB_TYPE.WOLF:
                this.color = '#A9A9A9';
                this.height = 0.85;
                this.speed = 1.5;
                this.maxHealth = 8;
                this.xpValue = 2;
                break;
            case MOB_TYPE.OCELOT:
                this.color = '#FFFF00';
                this.height = 0.7;
                this.speed = 1.8;
                this.maxHealth = 10;
                this.xpValue = 2;
                break;
            case MOB_TYPE.VILLAGER:
                this.color = '#8B4513';
                this.height = 1.8;
                this.speed = 1.0;
                this.maxHealth = 20;
                this.xpValue = 0;
                break;
            case MOB_TYPE.IRON_GOLEM:
                this.color = '#C0C0C0';
                this.height = 2.7;
                this.width = 1.4;
                this.speed = 0.8;
                this.maxHealth = 100;
                this.xpValue = 0;
                break;
        }
        this.health = this.maxHealth;
    }

    takeDamage(amount, knockbackDir) {
        if (this.isDead) return;

        // Enderman Teleport
        if (this.type === MOB_TYPE.ENDERMAN) {
            // Teleport randomly
            this.x += (Math.random() - 0.5) * 16;
            this.z += (Math.random() - 0.5) * 16;
            this.y = this.world.getHighestBlockY(Math.floor(this.x), Math.floor(this.z));
            window.soundManager.play('place', {x: this.x, y: this.y, z: this.z}); // Teleport sound
            return; // Dodge
        }

        this.health -= amount;
        this.lastDamageTime = Date.now();
        window.soundManager.play('break', {x: this.x, y: this.y, z: this.z}); // Hit sound

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
        if (this.game.pluginAPI) this.game.pluginAPI.emit('mobDeath', { mob: this });
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
            case MOB_TYPE.CHICKEN:
                dropType = BLOCK.ITEM_FEATHER;
                if (Math.random() < 0.5 && this.game.drops) {
                     this.game.drops.push(new Drop(this.game, this.x, this.y + this.height/2, this.z, BLOCK.ITEM_CHICKEN, 1));
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
            case MOB_TYPE.CREEPER:
                dropType = BLOCK.ITEM_GUNPOWDER;
                break;
            case MOB_TYPE.ENDERMAN:
                dropType = BLOCK.ITEM_ENDER_PEARL;
                break;
        }

        if (dropType && this.game.drops) {
             this.game.drops.push(new Drop(this.game, this.x, this.y + this.height/2, this.z, dropType, count));
        }
        // Drop XP
        if (this.xpValue > 0 && this.game.drops) {
             this.game.drops.push(new Drop(this.game, this.x, this.y + this.height/2, this.z, 'xp', this.xpValue));
        }
    }

    update(dt) {
        if (this.isDead) return;

        this.updateAI(dt);

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

    updateAI(dt) {
        // Tamed Wolf
        if (this.type === MOB_TYPE.WOLF && this.isTamed) {
             this.updateTamedWolfAI(dt);
             return;
        }

        // Iron Golem
        if (this.type === MOB_TYPE.IRON_GOLEM) {
            this.updateIronGolemAI(dt);
            return;
        }

        // Nether Mobs
        if (this.type === MOB_TYPE.GHAST) {
            this.updateGhastAI(dt);
            return;
        }
        if (this.type === MOB_TYPE.BLAZE) {
            this.updateBlazeAI(dt);
            return;
        }
        if (this.type === MOB_TYPE.PIGMAN) {
            this.updatePigmanAI(dt);
            return;
        }

        if (this.type === MOB_TYPE.ZOMBIE ||
            this.type === MOB_TYPE.SKELETON ||
            this.type === MOB_TYPE.SPIDER ||
            this.type === MOB_TYPE.CREEPER ||
            this.type === MOB_TYPE.ENDERMAN) {
            this.updateHostileAI(dt);
        } else {
            this.updatePassiveAI(dt);
        }
    }

    updateGhastAI(dt) {
        const player = this.game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dz = player.z - this.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        // Fly logic: maintain height above player or roam
        const targetY = player.y + 10;
        if (this.y < targetY) this.vy += 2 * dt;
        else this.vy -= 2 * dt;

        // Cap vy
        if (this.vy > 2) this.vy = 2;
        if (this.vy < -2) this.vy = -2;

        if (dist < 30) {
            this.yaw = Math.atan2(dx, dz);
            // Move slowly towards
            this.vx = Math.sin(this.yaw) * 2;
            this.vz = Math.cos(this.yaw) * 2;

            this.attackCooldown -= dt;
            if (this.attackCooldown <= 0) {
                // Shoot Fireball
                const dir = { x: dx/dist, y: dy/dist, z: dz/dist };
                this.game.spawnProjectile(this.x, this.y + this.height/2, this.z, dir, 'fireball');
                this.attackCooldown = 5.0; // Slow rate
                window.soundManager.play('fuse', {x: this.x, y: this.y, z: this.z}); // Screech
            }
        } else {
            // Idle roam
            this.moveTimer -= dt;
            if (this.moveTimer <= 0) {
                this.moveTimer = 5;
                this.yaw = Math.random() * Math.PI * 2;
                this.vx = Math.sin(this.yaw) * 2;
                this.vz = Math.cos(this.yaw) * 2;
            }
        }
    }

    updateBlazeAI(dt) {
        const player = this.game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dz = player.z - this.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        // Hover logic (fly but stay near ground or target)
        if (this.y < player.y + 2) this.vy += 15 * dt; // Fly up

        if (dist < 20) {
            this.yaw = Math.atan2(dx, dz);
            this.vx = Math.sin(this.yaw) * 3;
            this.vz = Math.cos(this.yaw) * 3;

            this.attackCooldown -= dt;
            if (this.attackCooldown <= 0) {
                // Shoot 3 small fireballs
                const dir = { x: dx/dist, y: dy/dist, z: dz/dist };
                this.game.spawnProjectile(this.x, this.y + this.height*0.8, this.z, dir, 'fireball');
                this.attackCooldown = 0.5; // Burst
                if (Math.random() < 0.2) this.attackCooldown = 4.0; // Reset burst
            }
        } else {
            this.updatePassiveAI(dt);
        }
    }

    updatePigmanAI(dt) {
        // Neutral unless damaged
        if (Date.now() - this.lastDamageTime < 10000) { // Hostile for 10s after hit
             this.updateHostileAI(dt);
        } else {
             this.updatePassiveAI(dt);
        }
    }

    updateTamedWolfAI(dt) {
        if (this.isSitting) {
            this.vx = 0;
            this.vz = 0;
            return;
        }

        const player = this.game.player;
        const dx = player.x - this.x;
        const dz = player.z - this.z;
        const dist = Math.sqrt(dx*dx + dz*dz);

        if (dist > 10) {
            // Teleport
            this.x = player.x;
            this.y = player.y;
            this.z = player.z;
        } else if (dist > 3) {
            // Follow
            this.yaw = Math.atan2(dx, dz);
            this.vx = Math.sin(this.yaw) * this.speed;
            this.vz = Math.cos(this.yaw) * this.speed;
        } else {
            // Stay
            this.vx = 0;
            this.vz = 0;
        }
    }

    updateIronGolemAI(dt) {
        // Find nearest Zombie or Skeleton or Spider
        const target = this.game.mobs.find(m =>
            (m.type === MOB_TYPE.ZOMBIE || m.type === MOB_TYPE.SKELETON || m.type === MOB_TYPE.SPIDER)
            && !m.isDead
        );

        if (target) {
            const dx = target.x - this.x;
            const dz = target.z - this.z;
            const dist = Math.sqrt(dx*dx + dz*dz);

            if (dist < 10) {
                 this.yaw = Math.atan2(dx, dz);
                 this.vx = Math.sin(this.yaw) * this.speed;
                 this.vz = Math.cos(this.yaw) * this.speed;

                 if (dist < 1.5 && this.attackCooldown <= 0) {
                     target.takeDamage(10, {x: Math.sin(this.yaw), z: Math.cos(this.yaw)});
                     target.vy += 10; // Toss up
                     this.attackCooldown = 1.0;
                 }
                 this.attackCooldown -= dt;
                 return;
            }
        }
        this.updatePassiveAI(dt);
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

                         if (window.soundManager) window.soundManager.play('place', {x: this.x, y: this.y, z: this.z}); // Pop sound
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

        // Enderman only attacks if hit (neutral) - for now simplified to hostile as per prompt "Implement Enderman Mob" usually implies standard behavior
        // But let's make it neutral if distance is far, only hostile if close?
        // Actually, let's keep it simple: Hostile within range.

        if (dist < 20) { // Detect range
            this.yaw = Math.atan2(dx, dz);

            if (this.type === MOB_TYPE.CREEPER) {
                // Creeper Logic
                this.vx = Math.sin(this.yaw) * this.speed;
                this.vz = Math.cos(this.yaw) * this.speed;

                if (dist < 2.5) {
                    // Stop moving, fuse
                    this.vx = 0;
                    this.vz = 0;
                    this.fuseTimer += dt;
                    if (this.fuseTimer > 1.5) {
                        // Explode!
                        this.game.explode(this.x, this.y, this.z, 4);
                        this.isDead = true;
                        this.health = 0;
                        this.game.mobs = this.game.mobs.filter(m => m !== this);
                    } else {
                        // Visual: Pulse? (Not implemented here, handled in renderer potentially if we had one)
                        // Make color flash
                        if (Math.floor(this.fuseTimer * 10) % 2 === 0) {
                            this.color = '#FFFFFF';
                        } else {
                            this.color = '#00FF00';
                        }
                    }
                } else {
                    this.fuseTimer = Math.max(0, this.fuseTimer - dt);
                    this.color = '#00FF00';
                }
                return;
            }

            if (dist < 1.5 && this.attackCooldown <= 0) {
                // Melee Attack
                 if (this.type === MOB_TYPE.ZOMBIE || this.type === MOB_TYPE.SPIDER || this.type === MOB_TYPE.ENDERMAN) {
                     this.game.player.takeDamage(this.type === MOB_TYPE.ENDERMAN ? 6 : 3); // Damage player

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
                 } else if (dist < 3) {
                     // Back away
                     this.vx = -Math.sin(this.yaw) * this.speed;
                     this.vz = -Math.cos(this.yaw) * this.speed;
                 } else {
                     // Strafe
                     if (this.strafeTimer === undefined) this.strafeTimer = 0;
                     if (this.strafeDir === undefined) this.strafeDir = 1;

                     this.strafeTimer -= dt;
                     if (this.strafeTimer <= 0) {
                         this.strafeTimer = 1 + Math.random() * 2;
                         this.strafeDir = Math.random() < 0.5 ? 1 : -1;
                     }

                     const strafeYaw = this.yaw + (Math.PI / 2) * this.strafeDir;
                     this.vx = Math.sin(strafeYaw) * this.speed * 0.5;
                     this.vz = Math.cos(strafeYaw) * this.speed * 0.5;
                 }

                 // Shoot logic
                 this.attackCooldown -= dt;
                 if (this.attackCooldown <= 0) {
                     if (this.game.spawnProjectile) {
                         const dir = { x: dx/dist, y: (player.y + player.height*0.8 - (this.y + this.height*0.8))/dist, z: dz/dist };
                         this.game.spawnProjectile(this.x, this.y + this.height * 0.8, this.z, dir);
                     }
                     this.attackCooldown = 3.0;
                 }
                } else {
                    // Zombie, Spider, Enderman move towards player
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

if (typeof window !== 'undefined') {
    window.MOB_TYPE = MOB_TYPE;
    window.Mob = Mob;
} else {
    global.MOB_TYPE = MOB_TYPE;
    global.Mob = Mob;
}
