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

        // Stats
        this.health = 20;
        this.maxHealth = 20;
        this.hunger = 20;
        this.maxHunger = 20;
        this.lastDamageTime = 0;
        this.spawnPoint = { x: 8, y: 40, z: 8 };

        // Movement state
        this.walkDistance = 0;
        this.sprinting = false;
        this.fallDistance = 0;
        this.hungerTimer = 0;
        this.regenTimer = 0;
    }

    takeDamage(amount) {
        if (Date.now() - this.lastDamageTime < 500) return; // Invulnerability frames
        this.health -= amount;
        this.lastDamageTime = Date.now();
        // Knockback or sound?
        window.soundManager.play('break'); // Placeholder damage sound
        if (this.health <= 0) {
            this.respawn();
        }
        // Update UI if exists
        if (this.game.updateHealthUI) this.game.updateHealthUI();
    }

    respawn() {
        this.x = this.spawnPoint.x;
        this.y = this.spawnPoint.y;
        this.z = this.spawnPoint.z;
        this.health = this.maxHealth;
        this.hunger = this.maxHunger;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.fallDistance = 0;
        if (this.game.chat) this.game.chat.addMessage("You died! Respawning...");
        if (this.game.updateHealthUI) this.game.updateHealthUI();
    }

    update(dt) {
        const controls = this.game.controls;

        // Hunger Logic
        this.hungerTimer += dt;
        if (this.hungerTimer > 30) { // Every 30 seconds lose 1 hunger passively
             this.hunger = Math.max(0, this.hunger - 1);
             this.hungerTimer = 0;
             if (this.game.updateHealthUI) this.game.updateHealthUI();
        }

        // Regen / Starvation
        if (this.hunger >= 18 && this.health < this.maxHealth) {
             this.regenTimer += dt;
             if (this.regenTimer > 4) {
                 this.health = Math.min(this.maxHealth, this.health + 1);
                 this.regenTimer = 0;
                 if (this.game.updateHealthUI) this.game.updateHealthUI();
             }
        } else if (this.hunger === 0) {
             this.regenTimer += dt;
             if (this.regenTimer > 4) {
                 this.takeDamage(1);
                 this.regenTimer = 0;
             }
        } else {
            this.regenTimer = 0;
        }

        // Physics integration
        let moveSpeed = this.speed;

        // Fluid Physics
        const inWater = this.game.physics.getFluidIntersection({x: this.x, y: this.y, z: this.z, width: this.width, height: this.height});
        if (inWater) {
             moveSpeed *= 0.5;
             this.fallDistance = 0;
        }

        // Sprinting
        if (controls.sprint && !controls.sneak && this.onGround && controls.forward && this.hunger > 6) {
             this.sprinting = true;
             moveSpeed *= 1.3;
             // Drain hunger faster while sprinting
             this.hungerTimer += dt * 2;
        } else {
             this.sprinting = false;
        }

        // Crouch Speed
        if (controls.sneak && !this.flying && this.onGround) {
            moveSpeed *= 0.4;
            this.height = 1.5;
        } else {
            this.height = 1.8;
        }

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

        if (controls.jump && (this.onGround || this.flying || inWater)) {
            if (this.flying) {
                 this.vy = moveSpeed;
            } else if (inWater) {
                 this.vy = 2.0; // Swim up
            } else {
                 this.vy = this.jumpForce;
                 this.onGround = false;
                 window.soundManager.play('jump');
            }
        } else if (controls.sneak && this.flying) {
            this.vy = -moveSpeed;
        }

        if (!this.flying) {
            if (inWater) {
                this.vy -= this.gravity * dt * 0.2; // Reduced gravity
                this.vy *= 0.8; // Water drag
            } else {
                this.vy -= this.gravity * dt;
            }
        } else {
            if (!controls.jump && !controls.sneak) this.vy = 0;
        }

        // Apply Velocity
        const prevX = this.x;
        const prevY = this.y;
        const prevZ = this.z;
        const oldVy = this.vy; // Capture vy before moveBy potentially resets it

        this.moveBy(this.vx * dt, this.vy * dt, this.vz * dt);

        // Fall Damage Logic
        if (!this.flying && !inWater) {
            if (oldVy < 0) {
                this.fallDistance += (prevY - this.y);
            }
            if (this.onGround) {
                if (this.fallDistance > 3) {
                    const damage = Math.floor(this.fallDistance - 3);
                    if (damage > 0) {
                        this.takeDamage(damage);
                        window.soundManager.play('break'); // Fall sound (using break for now)
                    }
                }
                this.fallDistance = 0;
            }
        } else {
            // Reset if flying or in water
            this.fallDistance = 0;
        }

        // Cactus Damage
        const box = {
            x: this.x,
            y: this.y - 0.1,
            z: this.z,
            width: this.width + 0.2,
            height: this.height + 0.1
        };
        const collidingBlocks = this.game.physics.getCollidingBlocks(box);
        for (const block of collidingBlocks) {
            if (block.type === BLOCK.CACTUS) {
                this.takeDamage(1);
            }
        }

        // Footstep sounds
        if (this.onGround && !this.flying) {
            const dist = Math.sqrt((this.x - prevX)**2 + (this.z - prevZ)**2);
            if (dist > 0) {
                this.walkDistance += dist;
                const stepLen = this.sprinting ? 1.5 : 2.5;
                if (this.walkDistance > stepLen) {
                    this.walkDistance = 0;
                    window.soundManager.play('step');
                }
            }
        }

        // Friction
        if (this.flying) {
            this.vx *= 0.9;
            this.vz *= 0.9;
        }
    }

    eat(itemType) {
        const blockDef = BLOCKS[itemType];
        if (blockDef && blockDef.food) {
            // Restore hunger
            this.hunger = Math.min(this.maxHunger, this.hunger + blockDef.food);

            // Play sound (assuming 'eat' is or will be implemented, or fallback to 'place')
            // We'll use 'place' if 'eat' isn't there, but let's assume we add it.
            // Actually, let's use a generic sound call that won't crash.
            if (window.soundManager) window.soundManager.play('eat');

            if (this.game.updateHealthUI) this.game.updateHealthUI();

            return true;
        }
        return false;
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
            if (dy < 0) {
                this.onGround = true;
                // Find what we hit to snap correctly (slabs vs full blocks)
                const box = {x: this.x, y: this.y + dy, z: this.z, width: this.width, height: this.height};
                const blocks = physics.getCollidingBlocks(box);

                let maxY = -Infinity;
                for (const b of blocks) {
                    let top = b.y + 1;
                    const def = window.BLOCKS[b.type];
                    if (def && def.isSlab) top = b.y + 0.5;

                    if (top > maxY) maxY = top;
                }

                if (maxY > -Infinity) {
                    this.y = maxY;
                } else {
                     // Fallback
                     this.y = Math.floor(this.y + dy) + 1;
                }
            }
            this.vy = 0;
        } else {
            this.y += dy;
            this.onGround = false;
        }

        // World Bounds (Respawn)
        if (this.y < -10) {
            this.takeDamage(100); // Kill player
        }
    }
}

window.Player = Player;
