class Player {
    constructor(game) {
        this.game = game;
        this.x = 8;
        this.y = 40;
        this.z = 8;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.pitch = 0;
        this.yaw = 0;

        this.width = 0.6;
        this.height = 1.8;
        this.speed = 4.3; // m/s

        this.lastEnderPearlTime = 0;
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
        this.inventory[5] = { type: BLOCK.FENCE, count: 64 };
        this.inventory[6] = { type: BLOCK.GLASS_PANE, count: 64 };
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


        // Spectator mode handling
        if (this.gamemode === 3 || this.spectator) {
            this.flying = true;
            this.noclip = true;
            this.addEffect('Night Vision', '👁️', 999999);
        } else {
            this.noclip = false;
        }

        // Movement state
        this.walkDistance = 0;
        this.sprinting = false;
        this.fallDistance = 0;
        this.hungerTimer = 0;
        this.regenTimer = 0;

        this.blocking = false;

        // Experience
        this.xp = 0; // 0 to 1 progress
        this.level = 0;
        this.totalXP = 0;

        // Gamemode
        this.gamemode = 0; // 0: Survival, 1: Creative
        this.lastJumpTime = 0;
        this.wasJumpDown = false;

        // Skin
        this.skinColor = '#' + Math.floor(Math.random()*16777215).toString(16);
        const savedSkin = localStorage.getItem('voxel_skin_color');
        if (savedSkin) this.skinColor = savedSkin;

        // Recipe Discovery
        this.unlockedRecipes = new Set();
        // Unlock Basics
        this.unlockedRecipes.add("Planks (4)");
        this.unlockedRecipes.add("Stick (4)");
        this.unlockedRecipes.add("Furnace");

        this.riding = null;
        this.isUsingSpyglass = false;
        this.spectator = false;

        // Offhand slot
        this.offhand = null;

        // Armor: [Helmet, Chestplate, Leggings, Boots]
        this.armor = [null, null, null, null];

        // Active potion status effects
        this.activeEffects = [];
    }

    addEffect(name, icon, duration) {
        if (!this.activeEffects) this.activeEffects = [];
        const existing = this.activeEffects.find(e => e.name === name);
        if (existing) {
            existing.duration = Math.max(existing.duration, duration);
        } else {
            this.activeEffects.push({ name, icon, duration });
        }
        if (this.game && this.game.ui && this.game.ui.updatePotionEffectsUI) {
            this.game.ui.updatePotionEffectsUI();
        }
    }

    getDefensePoints() {
        let defense = 0;
        if (window.ARMOR) {
            for (const item of this.armor) {
                if (item && window.ARMOR[item.type]) {
                    defense += window.ARMOR[item.type].defense;
                }
            }
        }
        return defense;
    }


    giveItem(type, count = 1) {
        const maxStack = 64;
        let remaining = count;

        // Try to stack with existing items first
        for (let i = 0; i < this.inventory.length; i++) {
            if (remaining <= 0) break;
            const item = this.inventory[i];
            if (item && item.type === type) {
                const space = maxStack - item.count;
                if (space > 0) {
                    const add = Math.min(space, remaining);
                    item.count += add;
                    remaining -= add;
                }
            }
        }

        // Put remaining in empty slots
        for (let i = 0; i < this.inventory.length; i++) {
            if (remaining <= 0) break;
            if (!this.inventory[i]) {
                const add = Math.min(maxStack, remaining);
                this.inventory[i] = { type: type, count: add };
                remaining -= add;
            }
        }

        if (this.game && this.game.ui && this.game.ui.updateHotbarUI) {
            this.game.ui.updateHotbarUI();
        }

        return remaining; // return the amount that couldn't fit
    }

    addXP(amount) {
        // Simplified XP curve
        // XP required for next level = 7 + level * 2 (approx MC)
        let needed = 7 + this.level * 2;

        // Add amount (converted to progress)
        // Actually amount is usually integer points.
        // We need to fill the bar.

        let currentPoints = this.xp * needed;
        currentPoints += amount;
        this.totalXP += amount;

        while (currentPoints >= needed) {
            currentPoints -= needed;
            this.level++;
            needed = 7 + this.level * 2;
            if (window.soundManager) window.soundManager.play('place'); // Level up sound
        }

        this.xp = currentPoints / needed;
    }

    takeDamage(amount) {
        if (this.gamemode === 1 || this.gamemode === 3 || this.spectator) return; // God Mode
        if (Date.now() - this.lastDamageTime < 500) return; // Invulnerability frames

        if (this.blocking) {
            // Reduce damage (100% block) and play block sound
            if (window.soundManager) window.soundManager.play('place');

            // Reduce durability of active shield (main hand or offhand)
            const currentSlot = this.inventory[this.selectedSlot];
            if (currentSlot && currentSlot.type === BLOCK.SHIELD) {
                if (currentSlot.durability !== undefined) {
                    currentSlot.durability -= 1;
                    if (currentSlot.durability <= 0) {
                        this.inventory[this.selectedSlot] = null;
                        this.blocking = false;
                        if (this.game && this.game.updateHotbarUI) this.game.updateHotbarUI();
                    }
                }
            } else if (this.offhand && this.offhand.type === BLOCK.SHIELD) {
                if (this.offhand.durability !== undefined) {
                    this.offhand.durability -= 1;
                    if (this.offhand.durability <= 0) {
                        this.offhand = null;
                        this.blocking = false;
                        if (this.game && this.game.refreshInventoryUI) this.game.refreshInventoryUI();
                    }
                }
            }
            return;
        }

        // Armor Reduction
        const defense = this.getDefensePoints();
        const reduction = Math.min(0.8, defense * 0.04); // Cap at 80%
        let damage = amount * (1 - reduction);

        // Damage Armor
        if (window.ARMOR) {
            for (let i = 0; i < 4; i++) {
                const item = this.armor[i];
                if (item && window.ARMOR[item.type]) {
                    // Init durability if needed
                    const maxDur = window.ARMOR[item.type].durability;
                    if (item.durability === undefined) item.durability = maxDur;

                    item.durability -= 1;
                    if (item.durability <= 0) {
                        this.armor[i] = null; // Break
                        if (window.soundManager) window.soundManager.play('break');
                    }
                }
            }
        }

        this.health -= damage;
        this.lastDamageTime = Date.now();
        // Knockback or sound?
        if (window.soundManager) window.soundManager.play('break'); // Placeholder damage sound
        if (this.health <= 0) {
            this.respawn();
        }
        // Update UI if exists
        if (this.game.updateHealthUI) this.game.updateHealthUI();
    }

    respawn() {
        // Find safe spawn height dynamically
        if (this.game.world && this.game.world.getSurfaceHeight) {
            let safeY = this.game.world.getSurfaceHeight(this.spawnPoint.x, this.spawnPoint.z) + 1;
            // Ensure 2-block high clear space (non-solid air/liquid) so player does not suffocate inside solid blocks
            while (safeY < 250) {
                const bFeet = this.game.world.getBlock(Math.floor(this.spawnPoint.x), Math.floor(safeY), Math.floor(this.spawnPoint.z));
                const bHead = this.game.world.getBlock(Math.floor(this.spawnPoint.x), Math.floor(safeY + 1), Math.floor(this.spawnPoint.z));
                const defFeet = window.BLOCKS[bFeet];
                const defHead = window.BLOCKS[bHead];
                const feetSolid = defFeet && defFeet.solid;
                const headSolid = defHead && defHead.solid;
                if (!feetSolid && !headSolid) break;
                safeY++;
            }
            this.spawnPoint.y = safeY;
        }
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

        if (this.gamemode === 3 || this.spectator) {
            this.flying = true;
            this.noclip = true;
            if (!this.activeEffects || !this.activeEffects.some(e => e.name === 'Night Vision')) {
                this.addEffect('Night Vision', '👁️', 999999);
            }
        }

        // Potion effects update
        if (this.activeEffects && this.activeEffects.length > 0) {
            for (let i = this.activeEffects.length - 1; i >= 0; i--) {
                this.activeEffects[i].duration -= dt;
                if (this.activeEffects[i].duration <= 0) {
                    this.activeEffects.splice(i, 1);
                }
            }
            if (this.game && this.game.ui && this.game.ui.updatePotionEffectsUI) {
                this.game.ui.updatePotionEffectsUI();
            }
        }

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

        // Riding Logic
        if (this.riding) {
            if (this.riding.isDead) {
                this.riding = null;
            } else {
                this.x = this.riding.x;
                this.y = this.riding.y + this.riding.height * 0.75; // Sit slightly inside/on top
                this.z = this.riding.z;
                this.vx = this.riding.vx;
                this.vy = this.riding.vy;
                this.vz = this.riding.vz;

                // Dismount with Sneak
                if (controls && controls.sneak) {
                    this.riding = null;
                }
            }
            return;
        }

        // Physics integration
        let moveSpeed = this.speed;

        // Soul Sand Slowing
        if (this.onGround) {
            const minX = Math.floor(this.x - this.width / 2);
            const maxX = Math.floor(this.x + this.width / 2);
            const feetBlockY = Math.floor(this.y - 1.5);
            const minZ = Math.floor(this.z - this.width / 2);
            const maxZ = Math.floor(this.z + this.width / 2);
            let onSoulSand = false;
            for (let bx = minX; bx <= maxX; bx++) {
                for (let bz = minZ; bz <= maxZ; bz++) {
                    if (this.game.world.getBlock(bx, feetBlockY, bz) === window.BLOCK.SOUL_SAND) {
                        onSoulSand = true;
                        break;
                    }
                }
                if (onSoulSand) break;
            }
            if (onSoulSand) {
                 moveSpeed *= 0.4;
            }
        }


        // Honey Block Sliding & Slowdown
        let onHoney = false;
        const checkHoney = (bx, by, bz) => {
            return this.game.world && this.game.world.getBlock(bx, by, bz) === window.BLOCK.HONEY_BLOCK;
        };
        const pMinX = Math.floor(this.x - this.width/2 - 0.1);
        const pMaxX = Math.floor(this.x + this.width/2 + 0.1);
        const pMinY = Math.floor(this.y - 0.1);
        const pMaxY = Math.floor(this.y + this.height + 0.1);
        const pMinZ = Math.floor(this.z - this.width/2 - 0.1);
        const pMaxZ = Math.floor(this.z + this.width/2 + 0.1);

        for (let bx = pMinX; bx <= pMaxX; bx++) {
            for (let by = pMinY; by <= pMaxY; by++) {
                for (let bz = pMinZ; bz <= pMaxZ; bz++) {
                    if (checkHoney(bx, by, bz)) {
                        onHoney = true;
                        break;
                    }
                }
                if (onHoney) break;
            }
            if (onHoney) break;
        }

        if (onHoney && !this.flying && this.vy < -2.0) {
            this.vy = -2.0; // Slide down slowly on honey block
        }

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

        // Double Jump Logic for Creative Fly Toggle
        if (controls.jump && !this.wasJumpDown) {
            const now = Date.now();
            if (this.gamemode === 1 && now - this.lastJumpTime < 400) {
                this.flying = !this.flying;
                this.lastJumpTime = 0;
            } else {
                this.lastJumpTime = now;
            }
        }
        this.wasJumpDown = controls.jump;

        if (controls.jump && (this.onGround || this.flying || inWater)) {
            if (this.flying) {
                 this.vy = moveSpeed;
            } else if (inWater) {
                 this.vy = 2.0; // Swim up
            } else {
                 // Only jump if we didn't just toggle flying
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
                    // Check if landed on Honey Block or Slime Block
                    const feetY = Math.floor(this.y - 0.5);
                    const feetX = Math.floor(this.x);
                    const feetZ = Math.floor(this.z);
                    const landedBlock = this.game.world ? this.game.world.getBlock(feetX, feetY, feetZ) : 0;

                    if (landedBlock === window.BLOCK.SLIME_BLOCK && !this.keys['ShiftLeft'] && !this.keys['ShiftRight']) {
                        // Bounce mechanics: bounce back with velocity proportional to fall distance, negate fall damage
                        this.vy = Math.min(Math.abs(this.vy) * 0.8, 15.0);
                        if (this.vy < 2.0) this.vy = 0;
                    } else {
                        let damage = Math.floor(this.fallDistance - 3);
                        if (landedBlock === window.BLOCK.HONEY_BLOCK) {
                            damage = Math.floor(damage * 0.2); // 80% reduction
                        } else if (landedBlock === window.BLOCK.SLIME_BLOCK) {
                            damage = 0; // Sneaking on slime block negates fall damage without bouncing
                        }
                        if (damage > 0) {
                            this.takeDamage(damage);
                            window.soundManager.play('break');
                        }
                    }
                }
                this.fallDistance = 0;
            }
        } else {
            // Reset if flying or in water
            this.fallDistance = 0;
        }

        // Cactus Damage & Magma Block Damage
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

        if (this.onGround && !controls.sneak && this.gamemode !== 1 && this.gamemode !== 3 && !this.spectator) {
            const feetX = Math.floor(this.x);
            const feetY = Math.floor(this.y - 0.1);
            const feetZ = Math.floor(this.z);
            if (this.game.world && this.game.world.getBlock(feetX, feetY, feetZ) === window.BLOCK.MAGMA_BLOCK) {
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

    isBlocking() {
        return !!this.blocking;
    }

    useItem(itemType) {
        return this.eat(itemType);
    }

    eat(itemType) {
        if (itemType === BLOCK.ITEM_POTION) {
            this.health = Math.min(this.maxHealth, this.health + 6);
            this.addEffect('Regeneration', '🧪', 45);
            if (window.soundManager) window.soundManager.play('eat');
            if (this.game.updateHealthUI) this.game.updateHealthUI();
            return true;
        }
        const blockDef = BLOCKS[itemType];
        if (blockDef && blockDef.food) {
            // Restore hunger
            this.hunger = Math.min(this.maxHunger, this.hunger + blockDef.food);

            if (window.soundManager) window.soundManager.play('eat');

            if (this.game.updateHealthUI) this.game.updateHealthUI();

            return true;
        }
        return false;
    }

    moveBy(dx, dy, dz) {
        if (this.gamemode === 3 || this.spectator || this.noclip) {
            this.x += dx;
            this.y += dy;
            this.z += dz;
            return;
        }
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
                    if (def && def.isSlab) {
                        const meta = this.game.world.getMetadata(b.x, b.y, b.z);
                        const isTop = (meta & 8) !== 0;
                        top = isTop ? b.y + 1.0 : b.y + 0.5;
                    }

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
