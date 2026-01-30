class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Modules
        this.world = new World();
        this.physics = new Physics(this.world);
        this.player = new Player(this);
        this.mobs = [];
        this.drops = [];
        this.projectiles = [];
        this.network = new NetworkManager(this);
        this.crafting = new CraftingSystem(this);

        // New Managers
        this.chat = new ChatManager(this);
        this.ui = new UIManager(this);
        this.input = new InputManager(this);
        this.renderer = new Renderer(this);

        // Game State
        this.lastTime = Date.now();
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTime = Date.now();
        this.gameTime = 0;
        this.dayLength = 120000;
        this.sunBrightness = 1.0;

        // Controls
        this.controls = {
            forward: false, backward: false,
            left: false, right: false,
            jump: false, sneak: false, sprint: false,
            enabled: true
        };

        this.isMobile = this.detectMobile();

        // Rendering state
        this.fov = 60;
        this.renderDistance = 60; // blocks

        // Action State
        this.breaking = null; // {x, y, z, progress, limit}

        // Fluid State
        this.fluidTick = 0;

        // Fishing State
        this.bobber = null;
    }

    detectMobile() {
        const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const hasTouchSupport = ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0);
        const isSmallScreen = window.innerWidth < 768;
        return (isMobileUserAgent && (hasTouchSupport || isSmallScreen)) || (hasTouchSupport && isSmallScreen);
    }

    async init() {
        this.renderer.resize();
        window.addEventListener('resize', () => this.renderer.resize());

        // Generate initial world around player
        this.updateChunks();

        // Init Mobs
        for (let i = 0; i < 3; i++) {
            this.mobs.push(new Mob(this, 8 + i*2, 40, 8 + i*2, MOB_TYPE.COW));
        }
        for (let i = 0; i < 2; i++) {
            this.mobs.push(new Mob(this, 15 + i*2, 40, 15 + i*2, MOB_TYPE.ZOMBIE));
        }
        this.mobs.push(new Mob(this, 12, 40, 12, MOB_TYPE.PIG));
        this.mobs.push(new Mob(this, 20, 40, 20, MOB_TYPE.SKELETON));
        this.mobs.push(new Mob(this, 25, 40, 25, MOB_TYPE.SPIDER));
        this.mobs.push(new Mob(this, 30, 40, 30, MOB_TYPE.SHEEP));

        // Connect Multiplayer
        this.network.connect('ws://localhost:8080');

        // Get Player Name
        const savedName = localStorage.getItem('voxel_player_name');
        let name = prompt("Enter your name:", savedName || "Player");
        if (!name) name = "Guest" + Math.floor(Math.random()*1000);
        localStorage.setItem('voxel_player_name', name);
        this.player.name = name;

        this.crafting.initUI();
        this.ui.init();
        this.updateHealthUI();
        this.input.setupEventListeners();
        this.updateHotbarUI();

        if (this.isMobile) {
            document.getElementById('mobile-controls').classList.remove('hidden');
            this.input.setupMobileControls();
        }

        // Start Loop
        this.gameLoop();
    }

    // Delegation methods for compatibility
    updateHotbarUI() {
        this.ui.updateHotbarUI();
    }

    updateHealthUI() {
        this.ui.updateHealthUI();
    }

    toggleInventory() {
        this.ui.toggleInventory();
    }

    craftingUI() {
        this.ui.craftingUI();
    }

    resumeGame() {
        this.ui.resumeGame();
    }

    resize() {
        this.renderer.resize();
    }

    updateChunks() {
        const centerChunkX = Math.floor(this.player.x / 16);
        const centerChunkZ = Math.floor(this.player.z / 16);
        const dist = this.world.renderDistance; // In chunks

        // Unload far chunks
        this.world.unloadFarChunks(this.player.x, this.player.z, dist);

        for (let cx = centerChunkX - dist; cx <= centerChunkX + dist; cx++) {
            for (let cz = centerChunkZ - dist; cz <= centerChunkZ + dist; cz++) {
                this.world.generateChunk(cx, cz);
            }
        }
    }

    interact(x, y, z) {
        const blockType = this.world.getBlock(x, y, z);

        // Furnace
        if (blockType === BLOCK.FURNACE) {
            let entity = this.world.getBlockEntity(x, y, z);
            if (!entity) {
                entity = {
                    type: 'furnace',
                    fuel: 0, maxFuel: 0,
                    progress: 0, maxProgress: 100,
                    input: null, fuelItem: null, output: null,
                    burnTime: 0
                };
                this.world.setBlockEntity(x, y, z, entity);
            }
            this.ui.openFurnace(entity);
            return true;
        }

        // Chest
        if (blockType === BLOCK.CHEST) {
             let entity = this.world.getBlockEntity(x, y, z);
             if (!entity) {
                 entity = {
                     type: 'chest',
                     items: new Array(27).fill(null)
                 };
                 this.world.setBlockEntity(x, y, z, entity);
             }
             this.ui.openChest(entity);
             return true;
        }

        // Bed
        if (blockType === BLOCK.BED) {
            const time = this.gameTime % this.dayLength;
            if (time > this.dayLength * 0.5) { // Night
                // Skip to next morning (e.g. 0.1 of next day)
                const timeToMorning = this.dayLength - time + (this.dayLength * 0.1);
                this.gameTime += timeToMorning;

                this.player.spawnPoint = { x: this.player.x, y: this.player.y, z: this.player.z };
                this.chat.addMessage("Sleeping... Spawn point set.");
            } else {
                this.chat.addMessage("You can only sleep at night.");
            }
            return true;
        }

        // Doors
        if (window.BLOCKS[blockType] && window.BLOCKS[blockType].isDoor) {
             const meta = this.world.getMetadata(x, y, z);
             const newMeta = meta ^ 1; // Toggle bit 0
             this.world.setMetadata(x, y, z, newMeta);

             // Update other half
             if (blockType === BLOCK.DOOR_WOOD_BOTTOM) {
                 this.world.setMetadata(x, y+1, z, newMeta);
             } else if (blockType === BLOCK.DOOR_WOOD_TOP) {
                 this.world.setMetadata(x, y-1, z, newMeta);
             }

             window.soundManager.play('break'); // Click sound
             return true;
        }

        // Trapdoors / Gates
        if (window.BLOCKS[blockType] && (window.BLOCKS[blockType].isTrapdoor || window.BLOCKS[blockType].isGate)) {
            const meta = this.world.getMetadata(x, y, z);
            const newMeta = meta ^ 4; // Toggle Bit 2 (Open)
            this.world.setMetadata(x, y, z, newMeta);
            window.soundManager.play('break');
            return true;
        }

        return false;
    }

    startAction(isLeftClick) {
        if (!isLeftClick) {
            // Right Click Logic

            const slot = this.player.inventory[this.player.selectedSlot];

            // Bow Logic
            if (slot && slot.type === BLOCK.BOW) {
                // Check for Arrows
                let hasArrow = false;
                let arrowIdx = -1;
                for (let i=0; i<this.player.inventory.length; i++) {
                     if (this.player.inventory[i] && this.player.inventory[i].type === BLOCK.ITEM_ARROW) {
                         hasArrow = true;
                         arrowIdx = i;
                         break;
                     }
                }

                if (hasArrow) {
                     // Fire
                     const dir = {
                        x: Math.sin(this.player.yaw) * Math.cos(this.player.pitch),
                        y: -Math.sin(this.player.pitch),
                        z: Math.cos(this.player.yaw) * Math.cos(this.player.pitch)
                    };
                    this.spawnProjectile(this.player.x, this.player.y + this.player.height*0.9, this.player.z, dir);
                    window.soundManager.play('jump'); // Shoot sound

                    // Consume arrow
                    if (arrowIdx !== -1) {
                        this.player.inventory[arrowIdx].count--;
                        if (this.player.inventory[arrowIdx].count <= 0) {
                            this.player.inventory[arrowIdx] = null;
                        }
                    }
                    // Durability
                    if (slot.durability) slot.durability--;
                    this.updateHotbarUI();
                }
                return;
            }

            // Shield Logic
            if (slot && slot.type === BLOCK.SHIELD) {
                this.player.blocking = true;
                return;
            }

            // Fishing Logic
            if (slot && slot.type === BLOCK.FISHING_ROD) {
                if (this.bobber) {
                    this.reelInBobber();
                } else {
                    this.castBobber();
                }
                return;
            }

            const dir = {
                x: Math.sin(this.player.yaw) * Math.cos(this.player.pitch),
                y: -Math.sin(this.player.pitch),
                z: Math.cos(this.player.yaw) * Math.cos(this.player.pitch)
            };
            const hit = this.physics.raycast(this.player, dir, 5);

            // 1. Interact with block (if hit)
            if (hit) {
                if (this.interact(hit.x, hit.y, hit.z)) return;
            }

            // 2. Use Item (Eat)
            if (slot && slot.count > 0) {
                 const blockDef = BLOCKS[slot.type];
                 if (blockDef && blockDef.food) {
                     if (this.player.hunger < this.player.maxHunger) {
                         if (this.player.eat(slot.type)) {
                             slot.count--;
                             if (slot.count <= 0) {
                                 this.player.inventory[this.player.selectedSlot] = null;
                             }
                             this.updateHotbarUI();
                             return;
                         }
                     }
                 }
            }

            // 3. Place Block / Use Item on Block
            this.placeBlock();
            return;
        }

        const dir = {
            x: Math.sin(this.player.yaw) * Math.cos(this.player.pitch),
            y: -Math.sin(this.player.pitch),
            z: Math.cos(this.player.yaw) * Math.cos(this.player.pitch)
        };

        const eyePos = {
            x: this.player.x,
            y: this.player.y + this.player.height * 0.9,
            z: this.player.z
        };

        // 1. Check Mobs
        let closestMob = null;
        let minMobDist = 4.0; // Melee range

        this.mobs.forEach(mob => {
            if (mob.isDead) return;
            const mobBox = { x: mob.x, y: mob.y, z: mob.z, width: mob.width, height: mob.height };
            // Use improved AABB raycast
            const t = this.physics.rayIntersectAABB(eyePos, dir, mobBox);
            if (t !== null && t < minMobDist) {
                minMobDist = t;
                closestMob = mob;
            }
        });

        if (closestMob) {
            // Check interaction first
            const slot = this.player.inventory[this.player.selectedSlot];
            if (slot && closestMob.interact(slot.type)) {
                 slot.count--;
                 if (slot.count <= 0) this.player.inventory[this.player.selectedSlot] = null;
                 this.updateHotbarUI();
                 return;
            }

            // Attack Mob
            let damage = 1;
            if (slot && window.TOOLS[slot.type]) {
                damage = window.TOOLS[slot.type].damage || 1;
                // Reduce durability
                 if (slot.durability !== undefined) slot.durability--;
                 this.updateHotbarUI();
            }

            // Knockback direction
            const kb = { x: dir.x, z: dir.z };
            closestMob.takeDamage(damage, kb);
            return;
        }

        // 2. Check Block
        const hit = this.physics.raycast(eyePos, dir, 5);
        if (hit) {
            const blockType = this.world.getBlock(hit.x, hit.y, hit.z);
            if (blockType === BLOCK.AIR || blockType === BLOCK.WATER) return;

            const blockDef = BLOCKS[blockType];
            const hardness = blockDef.hardness !== undefined ? blockDef.hardness : 1.0;

            if (hardness < 0) return; // Unbreakable

            // Calculate break time
            let speedMultiplier = 1;
            const slot = this.player.inventory[this.player.selectedSlot];
            let canHarvest = true; // For now everything is harvestable, simplified

            if (slot && window.TOOLS[slot.type]) {
                 const tool = window.TOOLS[slot.type];
                 if (blockDef.tool === tool.type) {
                     speedMultiplier = tool.speed;
                 } else {
                     speedMultiplier = 1;
                 }
            } else {
                // Hand speed?
                speedMultiplier = 1;
            }

            const limit = (hardness * 1.5) / speedMultiplier;

            this.breaking = {
                x: hit.x, y: hit.y, z: hit.z,
                progress: 0,
                limit: limit,
                lastTick: Date.now()
            };
        }
    }

    stopAction() {
        this.breaking = null;
        if (this.player.blocking) this.player.blocking = false;
    }

    finalizeBreakBlock(x, y, z) {
        const blockType = this.world.getBlock(x, y, z);

        // Check for Block Entity Drops (e.g. Furnace contents)
        const entity = this.world.getBlockEntity(x, y, z);
        if (entity) {
             if (entity.type === 'furnace') {
                 if (entity.input) this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, entity.input.type, entity.input.count));
                 if (entity.fuelItem) this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, entity.fuelItem.type, entity.fuelItem.count));
                 if (entity.output) this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, entity.output.type, entity.output.count));
             } else if (entity.type === 'crop') {
                 // Crop drops based on stage
                 if (entity.stage >= 7) {
                     this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, BLOCK.ITEM_WHEAT, 1));
                     this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, BLOCK.ITEM_WHEAT_SEEDS, 1 + Math.floor(Math.random()*2)));
                 } else {
                     this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, BLOCK.ITEM_WHEAT_SEEDS, 1));
                 }
             } else if (entity.type === 'chest' && entity.items) {
                 entity.items.forEach(item => {
                     if (item) this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, item.type, item.count));
                 });
             }
        }

        this.world.setBlock(x, y, z, BLOCK.AIR);
        window.soundManager.play('break');

        // Drop Logic
        if (blockType !== BLOCK.AIR && blockType !== BLOCK.WATER) {
            const blockDef = BLOCKS[blockType];
            if (blockDef) {
                let dropType = blockType;
                let dropCount = 1;

                if (blockDef.drop !== undefined) {
                    if (blockDef.drop === null) {
                        dropCount = 0;
                    } else {
                        dropType = blockDef.drop.type;
                        dropCount = blockDef.drop.count;
                    }
                }

                if (dropCount > 0) {
                     this.drops.push(new Drop(this, x + 0.5, y + 0.5, z + 0.5, dropType, dropCount));
                }
            }
        }

        // Tool Durability
        const slotIdx = this.player.selectedSlot;
        const item = this.player.inventory[slotIdx];
        if (item && window.TOOLS[item.type]) {
            const toolDef = window.TOOLS[item.type];
            if (item.durability === undefined) {
                item.durability = toolDef.durability;
            }
            item.durability--;
            if (item.durability <= 0) {
                 this.player.inventory[slotIdx] = null;
                 window.soundManager.play('break');
            }
            this.updateHotbarUI();
        }

        this.network.sendBlockUpdate(x, y, z, BLOCK.AIR);
    }

    placeBlock() {
        const dir = {
            x: Math.sin(this.player.yaw) * Math.cos(this.player.pitch),
            y: -Math.sin(this.player.pitch),
            z: Math.cos(this.player.yaw) * Math.cos(this.player.pitch)
        };
        const hit = this.physics.raycast(this.player, dir, 5);
        if (hit && hit.face) {
            const nx = hit.x + hit.face.x;
            const ny = hit.y + hit.face.y;
            const nz = hit.z + hit.face.z;

            // Check player collision
            const pBox = { x: this.player.x, y: this.player.y, z: this.player.z, width: this.player.width, height: this.player.height };
            // Simple check if point is inside player box
            if (this.physics.checkCollision({x: nx + 0.5, y: ny, z: nz + 0.5, width: 1, height: 1}) &&
                Math.abs(nx + 0.5 - this.player.x) < 0.8 && // approximate check
                Math.abs(nz + 0.5 - this.player.z) < 0.8 &&
                (ny >= this.player.y && ny < this.player.y + this.player.height)) {
                return; // Inside player
            }

            const slot = this.player.inventory[this.player.selectedSlot];
            if (slot && slot.count > 0) {
                 // Check if it's an item/tool
                 const blockDef = BLOCKS[slot.type];
                 const targetType = this.world.getBlock(hit.x, hit.y, hit.z);

                 // Hoe Logic
                 if (window.TOOLS && window.TOOLS[slot.type] && window.TOOLS[slot.type].type === 'hoe') {
                     if (targetType === BLOCK.GRASS || targetType === BLOCK.DIRT) {
                         this.world.setBlock(hit.x, hit.y, hit.z, BLOCK.FARMLAND);
                         window.soundManager.play('break'); // digging sound
                         // Durability logic would go here
                         return;
                     }
                 }

                 // Seeds Logic
                 if (slot.type === BLOCK.ITEM_WHEAT_SEEDS) {
                     if (targetType === BLOCK.FARMLAND) {
                         // Plant on top
                         const up = { x: hit.x, y: hit.y + 1, z: hit.z };
                         if (this.world.getBlock(up.x, up.y, up.z) === BLOCK.AIR) {
                             this.world.setBlock(up.x, up.y, up.z, BLOCK.WHEAT);
                             this.world.setBlockEntity(up.x, up.y, up.z, { type: 'crop', stage: 0 });
                             slot.count--;
                             if (slot.count <= 0) this.player.inventory[this.player.selectedSlot] = null;
                             this.updateHotbarUI();
                             return;
                         }
                     }
                 }

                 // Door Placement Logic
                 if (slot.type === BLOCK.DOOR_WOOD_BOTTOM) {
                     // Check vertical space (needs 2 blocks)
                     // hit is the block we clicked on. nx,ny,nz is the neighbor (empty space usually).
                     // We place bottom at nx,ny,nz. Top at nx,ny+1,nz.
                     if (this.world.getBlock(nx, ny, nz) === BLOCK.AIR && this.world.getBlock(nx, ny+1, nz) === BLOCK.AIR) {
                         this.world.setBlock(nx, ny, nz, BLOCK.DOOR_WOOD_BOTTOM);
                         this.world.setBlock(nx, ny+1, nz, BLOCK.DOOR_WOOD_TOP);

                         window.soundManager.play('place');
                         this.network.sendBlockUpdate(nx, ny, nz, BLOCK.DOOR_WOOD_BOTTOM);
                         this.network.sendBlockUpdate(nx, ny+1, nz, BLOCK.DOOR_WOOD_TOP);

                         slot.count--;
                         if (slot.count <= 0) this.player.inventory[this.player.selectedSlot] = null;
                         this.updateHotbarUI();
                         return;
                     } else {
                         return; // Can't place
                     }
                 }

                 if (blockDef && blockDef.isItem) return;

                 // nx, ny, nz are already defined in outer scope
                 // const nx = hit.x + hit.face.x;
                 // const ny = hit.y + hit.face.y;
                 // const nz = hit.z + hit.face.z;

                 // Check player collision
                 const pBox = { x: this.player.x, y: this.player.y, z: this.player.z, width: this.player.width, height: this.player.height };
                 // Simple check if point is inside player box
                 if (this.physics.checkCollision({x: nx + 0.5, y: ny, z: nz + 0.5, width: 1, height: 1}) &&
                    Math.abs(nx + 0.5 - this.player.x) < 0.8 && // approximate check
                    Math.abs(nz + 0.5 - this.player.z) < 0.8 &&
                    (ny >= this.player.y && ny < this.player.y + this.player.height)) {
                    return; // Inside player
                 }

                 this.world.setBlock(nx, ny, nz, slot.type);
                 if (slot.type === BLOCK.WATER) {
                     this.world.setMetadata(nx, ny, nz, 8);
                 } else if (BLOCKS[slot.type] && BLOCKS[slot.type].isStair) {
                     // Stairs Logic
                     let r = this.player.yaw % (2*Math.PI);
                     if (r < 0) r += 2*Math.PI;

                     let meta = 0;
                     if (r >= Math.PI/4 && r < 3*Math.PI/4) meta = 2; // South
                     else if (r >= 3*Math.PI/4 && r < 5*Math.PI/4) meta = 1; // West
                     else if (r >= 5*Math.PI/4 && r < 7*Math.PI/4) meta = 3; // North
                     else meta = 0; // East

                     this.world.setMetadata(nx, ny, nz, meta);
                 } else if (BLOCKS[slot.type] && BLOCKS[slot.type].isTrapdoor) {
                     // Trapdoor Logic
                     // Check hit point relative Y
                     let meta = 0;
                     if ((hit.y - Math.floor(hit.y)) > 0.5) meta |= 8; // Top (Bit 3)

                     this.world.setMetadata(nx, ny, nz, meta);
                 } else if (BLOCKS[slot.type] && BLOCKS[slot.type].isGate) {
                     // Gate Logic: Orientation based on yaw
                     let r = this.player.yaw % (2*Math.PI);
                     if (r < 0) r += 2*Math.PI;

                     let meta = 0;
                     if (r >= Math.PI/4 && r < 3*Math.PI/4) meta = 1;
                     else if (r >= 3*Math.PI/4 && r < 5*Math.PI/4) meta = 0;
                     else if (r >= 5*Math.PI/4 && r < 7*Math.PI/4) meta = 1;
                     else meta = 0;

                     this.world.setMetadata(nx, ny, nz, meta);
                 }
                 window.soundManager.play('place');
                 this.network.sendBlockUpdate(nx, ny, nz, slot.type);

                 // Consume item
                 slot.count--;
                 if (slot.count <= 0) {
                     this.player.inventory[this.player.selectedSlot] = null;
                 }
                 this.updateHotbarUI();
            }
        }
    }

    spawnProjectile(x, y, z, dir) {
        this.projectiles.push({
            x, y, z,
            vx: dir.x * 15,
            vy: dir.y * 15,
            vz: dir.z * 15,
            life: 2.0
        });
    }

    spawnMobs() {
        if (this.mobs.length >= 20) return;

        const range = 40;
        const minRange = 16;

        // Attempt spawn
        const angle = Math.random() * Math.PI * 2;
        const dist = minRange + Math.random() * (range - minRange);

        const x = this.player.x + Math.cos(angle) * dist;
        const z = this.player.z + Math.sin(angle) * dist;

        // Find ground
        const floorX = Math.floor(x);
        const floorZ = Math.floor(z);
        const y = this.world.getHighestBlockY(floorX, floorZ);

        if (y <= 0 || y > 60) return;

        // Check if spawn position is valid
        const groundBlock = this.world.getBlock(floorX, y-1, floorZ);
        if (groundBlock === BLOCK.WATER) return; // Don't spawn in water for now

        // Check light level (Day/Night)
        const cycle = (this.gameTime % this.dayLength) / this.dayLength;
        const isDay = cycle < 0.5; // 0 to 0.5 is day

        let type = null;
        if (isDay) {
            // Passive
            const r = Math.random();
            if (r < 0.3) type = MOB_TYPE.COW;
            else if (r < 0.6) type = MOB_TYPE.PIG;
            else type = MOB_TYPE.SHEEP;
        } else {
            // Hostile
            const r = Math.random();
            if (r < 0.33) type = MOB_TYPE.ZOMBIE;
            else if (r < 0.66) type = MOB_TYPE.SKELETON;
            else type = MOB_TYPE.SPIDER;
        }

        if (type) {
            this.mobs.push(new Mob(this, x, y, z, type));
        }
    }

    processFurnace(entity, dt) {
        if (entity.burnTime > 0) {
            entity.burnTime -= dt;
            if (entity.burnTime <= 0) entity.burnTime = 0;

            // Smelting
            if (entity.input && this.canSmelt(entity)) {
                entity.progress += dt * 10; // Speed
                if (entity.progress >= entity.maxProgress) {
                    this.smelt(entity);
                    entity.progress = 0;
                }
            } else {
                entity.progress = 0;
            }
        } else {
            // Check for fuel
            if (entity.input && this.canSmelt(entity) && entity.fuelItem) {
                // Consume fuel
                let fuelValue = 10;
                if (entity.fuelItem.type === BLOCK.ITEM_COAL) fuelValue = 80;
                if (entity.fuelItem.type === BLOCK.WOOD || entity.fuelItem.type === BLOCK.PLANK) fuelValue = 15;

                entity.burnTime = fuelValue;
                entity.maxBurnTime = fuelValue;

                entity.fuelItem.count--;
                if (entity.fuelItem.count <= 0) entity.fuelItem = null;
            } else {
                 if (entity.progress > 0) entity.progress = 0;
            }
        }

        // Sync UI if open
        if (this.ui.activeFurnace === entity) {
            this.ui.updateFurnaceUI();
        }
    }

    canSmelt(entity) {
        const result = this.getSmeltingResult(entity.input.type);
        if (!result) return false;

        if (!entity.output) return true;
        if (entity.output.type !== result.type) return false;
        if (entity.output.count + result.count > 64) return false;
        return true;
    }

    getSmeltingResult(inputType) {
        if (this.crafting.getSmeltingResult) return this.crafting.getSmeltingResult(inputType);

        if (inputType === BLOCK.ORE_IRON) return { type: BLOCK.ITEM_IRON_INGOT, count: 1 };
        if (inputType === BLOCK.ORE_GOLD) return { type: BLOCK.ITEM_GOLD_INGOT, count: 1 };
        if (inputType === BLOCK.SAND) return { type: BLOCK.GLASS, count: 1 };
        if (inputType === BLOCK.COBBLESTONE) return { type: BLOCK.STONE, count: 1 };
        return null;
    }

    smelt(entity) {
        const result = this.getSmeltingResult(entity.input.type);
        if (!entity.output) {
            entity.output = { type: result.type, count: result.count };
        } else {
            entity.output.count += result.count;
        }
        entity.input.count--;
        if (entity.input.count <= 0) entity.input = null;
    }

    castBobber() {
        const yaw = this.player.yaw;
        const pitch = this.player.pitch;
        const dir = {
            x: Math.sin(yaw) * Math.cos(pitch),
            y: -Math.sin(pitch),
            z: Math.cos(yaw) * Math.cos(pitch)
        };

        this.bobber = {
            x: this.player.x,
            y: this.player.y + this.player.height * 0.8,
            z: this.player.z,
            vx: dir.x * 15,
            vy: dir.y * 15,
            vz: dir.z * 15,
            state: 'flying',
            waitTime: 0,
            biteTimer: 0
        };
        window.soundManager.play('jump'); // Whoosh sound?
    }

    reelInBobber() {
        if (!this.bobber) return;

        if (this.bobber.state === 'hooked') {
            // Catch fish
            this.drops.push(new Drop(this, this.player.x, this.player.y, this.player.z, BLOCK.ITEM_RAW_FISH, 1));
            this.chat.addMessage("You caught a fish!");
            window.soundManager.play('place'); // Splash/Catch sound
        }

        this.bobber = null;
    }

    updateBobber(dt) {
        if (!this.bobber) return;

        const b = this.bobber;

        if (b.state === 'flying') {
            b.vy -= 25 * dt; // Gravity
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.z += b.vz * dt;
            b.vx *= 0.99;
            b.vz *= 0.99;

            // Check collision with water
            const block = this.world.getBlock(Math.floor(b.x), Math.floor(b.y), Math.floor(b.z));
            if (block === BLOCK.WATER) {
                b.state = 'floating';
                b.vy = 0;
                b.vx = 0;
                b.vz = 0;
                b.y = Math.floor(b.y) + 0.8; // Float on surface
                b.waitTime = 2 + Math.random() * 5; // Wait 2-7 seconds
                window.soundManager.play('step'); // Splash
            } else if (block !== BLOCK.AIR) {
                // Hit solid block
                this.bobber = null; // Break
            }
        } else if (b.state === 'floating') {
             b.waitTime -= dt;
             if (b.waitTime <= 0) {
                 b.state = 'hooked';
                 b.biteTimer = 1.0; // 1 second to react
                 window.soundManager.play('break'); // Bobber dip sound
             }
        } else if (b.state === 'hooked') {
             b.y -= 0.5 * dt; // Dip visual
             b.biteTimer -= dt;
             if (b.biteTimer <= 0) {
                 b.state = 'floating'; // Missed it
                 b.y += 0.5; // Reset
                 b.waitTime = 2 + Math.random() * 5;
             }
        }
    }

    update(dt) {
        this.player.update(dt / 1000);
        this.updateBobber(dt / 1000);

        // Update Fluids
        this.fluidTick += dt;
        if (this.fluidTick > 100) { // Every 100ms
            this.world.updateFluids();
            this.fluidTick = 0;
        }

        // Process Block Entities (Furnaces & Crops)
        for (const [key, entity] of this.world.blockEntities) {
            if (entity.type === 'furnace') {
                this.processFurnace(entity, dt / 1000);
            } else if (entity.type === 'crop') {
                // Random growth (approx 1 per 2 secs per crop at 60fps? no, 0.001 per frame)
                // Real MC is complicated. Simple: 1/1000 chance per frame.
                if (Math.random() < 0.001) {
                    if (entity.stage < 7) {
                        entity.stage++;
                    }
                }
            }
        }

        // Mobs
        for (let i = this.mobs.length - 1; i >= 0; i--) {
            const mob = this.mobs[i];
            if (mob.isDead) {
                this.mobs.splice(i, 1);
                continue;
            }
            mob.update(dt / 1000);
        }

        // Spawn mobs
        if (this.frameCount % 120 === 0) {
            this.spawnMobs();
        }

        // Drops
        for (let i = this.drops.length - 1; i >= 0; i--) {
            const drop = this.drops[i];
            drop.update(dt / 1000);

            if (drop.lifeTime <= 0) {
                this.drops.splice(i, 1);
                continue;
            }

            // Collection
            const dx = this.player.x - drop.x;
            const dy = (this.player.y + 0.5) - drop.y;
            const dz = this.player.z - drop.z;
            if (dx*dx + dy*dy + dz*dz < 1.5) {
                // Collect
                // Add to inventory
                // Find empty slot or stack
                let added = false;
                // Simple add to first empty or stack logic (simplified)
                for (let j = 0; j < this.player.inventory.length; j++) {
                    const slot = this.player.inventory[j];
                    if (slot && slot.type === drop.type && slot.count < 64) {
                        slot.count += drop.count;
                        added = true;
                        break;
                    }
                }
                if (!added) {
                     for (let j = 0; j < this.player.inventory.length; j++) {
                         if (!this.player.inventory[j]) {
                             this.player.inventory[j] = { type: drop.type, count: drop.count };
                             added = true;
                             break;
                         }
                     }
                }

                if (added) {
                    window.soundManager.play('place'); // Pickup sound?
                    this.drops.splice(i, 1);
                    this.updateHotbarUI();
                }
            }
        }

        // Update Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            const dts = dt / 1000;

            const prevX = p.x;
            const prevY = p.y;
            const prevZ = p.z;

            p.x += p.vx * dts;
            p.y += p.vy * dts;
            p.z += p.vz * dts;
            p.life -= dts;

            // Collision with world
            if (this.world.getBlock(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)) !== BLOCK.AIR) {
                p.life = 0;
            }

            // Collision with player (AABB Raycast)
            const box = {
                x: this.player.x,
                y: this.player.y,
                z: this.player.z,
                width: this.player.width,
                height: this.player.height
            };

            const moveX = p.x - prevX;
            const moveY = p.y - prevY;
            const moveZ = p.z - prevZ;
            const dist = Math.sqrt(moveX*moveX + moveY*moveY + moveZ*moveZ);

            if (dist > 0) {
                const dir = { x: moveX/dist, y: moveY/dist, z: moveZ/dist };
                const t = this.physics.rayIntersectAABB({x: prevX, y: prevY, z: prevZ}, dir, box);

                if (t !== null && t >= 0 && t <= dist) {
                     p.life = 0;
                     // Push player
                     this.player.vx += p.vx * 0.5;
                     this.player.vz += p.vz * 0.5;
                     this.player.takeDamage(2);
                }
            }

            if (p.life <= 0) {
                this.projectiles.splice(i, 1);
            }
        }

        this.gameTime += dt;
        const cycle = (this.gameTime % this.dayLength) / this.dayLength;
        const isDay = cycle < 0.5;
        this.sunBrightness = isDay ? 0.8 + Math.sin(cycle * Math.PI) * 0.2 : 0.3;

        // Chunk Loading
        if (this.frameCount % 60 === 0) { // Check every second
            this.updateChunks();
        }

        // Crosshair Interaction Update
        const lookDir = {
            x: Math.sin(this.player.yaw) * Math.cos(this.player.pitch),
            y: -Math.sin(this.player.pitch),
            z: Math.cos(this.player.yaw) * Math.cos(this.player.pitch)
        };

        let hasTarget = false;

        // Check Mobs
        for (let mob of this.mobs) {
             if (mob.isDead) continue;
             const dx = mob.x - this.player.x;
             const dy = (mob.y + mob.height/2) - (this.player.y + this.player.height);
             const dz = mob.z - this.player.z;
             const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
             if (dist < 4.0) {
                 const dot = (dx*lookDir.x + dy*lookDir.y + dz*lookDir.z) / dist;
                 if (dot > 0.9) {
                     hasTarget = true;
                     break;
                 }
             }
        }

        if (!hasTarget) {
            const hit = this.physics.raycast(this.player, lookDir, 5);
            if (hit) {
                const b = this.world.getBlock(hit.x, hit.y, hit.z);
                if (b !== BLOCK.AIR && b !== BLOCK.WATER) hasTarget = true;
            }
        }

        const crosshair = document.getElementById('crosshair');
        if (crosshair) {
            if (hasTarget) crosshair.classList.add('active');
            else crosshair.classList.remove('active');
        }

        // Breaking Block Logic
        if (this.breaking) {
            const hit = this.physics.raycast(this.player, lookDir, 5); // Reuse lookDir

            if (!hit || hit.x !== this.breaking.x || hit.y !== this.breaking.y || hit.z !== this.breaking.z) {
                this.breaking = null; // Looked away
            } else {
                const now = Date.now();
                const delta = (now - this.breaking.lastTick) / 1000;
                this.breaking.lastTick = now;
                this.breaking.progress += delta;

                if (this.breaking.progress >= this.breaking.limit) {
                    this.finalizeBreakBlock(this.breaking.x, this.breaking.y, this.breaking.z);
                    this.breaking = null;
                }
            }
        }

        // Multiplayer Sync
        if (this.frameCount % 3 === 0) { // Send every 3 frames (~20fps)
            this.network.sendPosition(this.player.x, this.player.y, this.player.z, this.player.yaw, this.player.pitch);
        }

        // Ambience Update
        if (window.soundManager && this.player) {
             let waterIntensity = 0;
             let windIntensity = 0;

             const cx = Math.floor(this.player.x);
             const cy = Math.floor(this.player.y);
             const cz = Math.floor(this.player.z);

             // Check for water nearby
             let waterCount = 0;
             for (let dx = -2; dx <= 2; dx++) {
                 for (let dy = -2; dy <= 2; dy++) {
                     for (let dz = -2; dz <= 2; dz++) {
                         if (this.world.getBlock(cx+dx, cy+dy, cz+dz) === BLOCK.WATER) {
                             waterCount++;
                         }
                     }
                 }
             }
             waterIntensity = Math.min(1.0, waterCount / 20);

             // Wind based on height
             if (this.player.y > 32) {
                 windIntensity = Math.min(1.0, (this.player.y - 32) / 32);
             }

             window.soundManager.updateAmbience(waterIntensity, windIntensity);
        }
    }

    render() {
        this.renderer.render();
    }

    gameLoop() {
        const now = Date.now();
        const dt = now - this.lastTime;
        this.lastTime = now;

        if (now - this.fpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTime = now;
        }
        this.frameCount++;

        this.update(dt);
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }
}

window.Game = Game;
