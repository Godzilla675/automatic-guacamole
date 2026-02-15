class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.isMobile = this.detectMobile();

        // Modules
        this.world = new World();
        this.world.game = this;
        this.physics = new Physics(this.world);
        this.player = new Player(this);
        this.mobs = [];
        this.vehicles = [];
        this.drops = [];
        this.projectiles = [];
        this.tntPrimed = [];
        this.network = new NetworkManager(this);
        this.crafting = new CraftingSystem(this);
        this.particles = new ParticleSystem(this); // Init Particles

        // New Managers
        this.chat = new ChatManager(this);
        this.ui = new UIManager(this);
        this.input = new InputManager(this);
        this.renderer = new Renderer(this);
        this.pluginAPI = new window.PluginAPI(this);
        this.minimap = new window.Minimap(this);
        this.achievements = new window.AchievementManager(this);
        this.tutorial = new window.TutorialManager(this);

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

        // Rendering state
        this.fov = parseInt(localStorage.getItem('voxel_fov')) || 60;
        this.renderDistance = parseInt(localStorage.getItem('voxel_renderDistance')) || 50; // blocks
        this.world.renderDistance = Math.ceil(this.renderDistance / 16);

        // Action State
        this.breaking = null; // {x, y, z, progress, limit}

        // Fluid State
        this.fluidTick = 0;

        // Fishing State
        this.bobber = null;

        // Portal State
        this.portalTimer = 0;
    }

    detectMobile() {
        const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const hasTouchSupport = ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0);
        const isSmallScreen = window.innerWidth < 768;
        return (isMobileUserAgent && (hasTouchSupport || isSmallScreen)) || (hasTouchSupport && isSmallScreen);
    }

    setRenderDistance(val) {
        this.renderDistance = val;
        this.world.renderDistance = Math.ceil(val / 16);
        localStorage.setItem('voxel_renderDistance', val);
        this.updateChunks();
    }

    setFOV(val) {
        this.fov = val;
        localStorage.setItem('voxel_fov', val);
    }

    async init() {
        this.renderer.resize();
        window.addEventListener('resize', () => this.renderer.resize());

        // Generate initial world around player
        this.updateChunks();

        // Set safe spawn height based on generated terrain
        const safeY = this.player.findSafeY(this.player.x, this.player.z);
        this.player.y = safeY;
        this.player.spawnPoint.y = safeY;
        this.player.vy = 0;
        this.player.fallDistance = 0;

        // Init Mobs (spawn at safe heights)
        for (let i = 0; i < 3; i++) {
            const mx = 8 + i*2, mz = 8 + i*2;
            this.mobs.push(new Mob(this, mx, this.player.findSafeY(mx, mz), mz, MOB_TYPE.COW));
        }
        for (let i = 0; i < 2; i++) {
            const mx = 15 + i*2, mz = 15 + i*2;
            this.mobs.push(new Mob(this, mx, this.player.findSafeY(mx, mz), mz, MOB_TYPE.ZOMBIE));
        }
        this.mobs.push(new Mob(this, 12, this.player.findSafeY(12, 12), 12, MOB_TYPE.PIG));
        this.mobs.push(new Mob(this, 20, this.player.findSafeY(20, 20), 20, MOB_TYPE.SKELETON));
        this.mobs.push(new Mob(this, 25, this.player.findSafeY(25, 25), 25, MOB_TYPE.SPIDER));
        this.mobs.push(new Mob(this, 30, this.player.findSafeY(30, 30), 30, MOB_TYPE.SHEEP));

        // Multiplayer: only connect if server URL is provided or user requests it
        // Don't auto-connect in single player to avoid confusing error messages
        // this.network.connect('ws://localhost:8080');

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
        this.lastTime = Date.now(); // Reset to avoid huge first-frame dt
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
        const pos = { x: x + 0.5, y: y + 0.5, z: z + 0.5 };

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

        // Brewing Stand
        if (blockType === BLOCK.BREWING_STAND) {
            let entity = this.world.getBlockEntity(x, y, z);
            if (!entity) {
                entity = {
                    type: 'brewing_stand',
                    ingredient: null,
                    bottles: [null, null, null],
                    brewTime: 0
                };
                this.world.setBlockEntity(x, y, z, entity);
            }
            this.ui.openBrewing(entity);
            return true;
        }

        // Enchanting Table
        if (blockType === BLOCK.ENCHANTING_TABLE) {
            this.ui.openEnchanting();
            return true;
        }

        // Anvil
        if (blockType === BLOCK.ANVIL) {
            this.ui.openAnvil();
            return true;
        }

        // Jukebox
        if (blockType === BLOCK.JUKEBOX) {
            let entity = this.world.getBlockEntity(x, y, z);
            if (!entity) {
                entity = { type: 'jukebox', disc: null };
                this.world.setBlockEntity(x, y, z, entity);
            }

            const slot = this.player.inventory[this.player.selectedSlot];

            if (entity.disc) {
                // Eject
                this.drops.push(new Drop(this, x+0.5, y+1, z+0.5, entity.disc, 1));
                entity.disc = null;
                if (window.soundManager) window.soundManager.play('break', pos); // Placeholder stop
                this.chat.addMessage("Music stopped.");
            } else {
                // Insert
                if (slot && slot.type === BLOCK.ITEM_MUSIC_DISC) {
                    entity.disc = slot.type;
                    if (this.player.gamemode !== 1) {
                        slot.count--;
                        if (slot.count <= 0) this.player.inventory[this.player.selectedSlot] = null;
                        this.updateHotbarUI();
                    }
                    if (window.soundManager) window.soundManager.play('place', pos); // Placeholder play
                    this.chat.addMessage("Now Playing: Cat");
                }
            }
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
             const newMeta = meta ^ 4; // Toggle bit 2 (Value 4)
             this.world.setMetadata(x, y, z, newMeta);

             // Update other half
             if (blockType === BLOCK.DOOR_WOOD_BOTTOM) {
                 this.world.setMetadata(x, y+1, z, newMeta);
             } else if (blockType === BLOCK.DOOR_WOOD_TOP) {
                 this.world.setMetadata(x, y-1, z, newMeta);
             }

             window.soundManager.play('break', pos); // Click sound
             return true;
        }

        // Trapdoors / Gates
        if (window.BLOCKS[blockType] && (window.BLOCKS[blockType].isTrapdoor || window.BLOCKS[blockType].isGate)) {
            const meta = this.world.getMetadata(x, y, z);
            const newMeta = meta ^ 4; // Toggle Bit 2 (Open)
            this.world.setMetadata(x, y, z, newMeta);
            window.soundManager.play('break', pos);
            return true;
        }

        // TNT
        if (blockType === BLOCK.TNT) {
            this.world.setBlock(x, y, z, BLOCK.AIR);
            this.tntPrimed.push({ x: x+0.5, y: y+0.5, z: z+0.5, fuse: 4.0, vy: 5 }); // 4 seconds fuse, slight jump
            window.soundManager.play('fuse', pos); // Need to ensure sound exists or fallback
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
                    window.soundManager.play('jump', {x: this.player.x, y: this.player.y, z: this.player.z}); // Shoot sound

                    // Consume arrow
                    if (arrowIdx !== -1 && this.player.gamemode !== 1) {
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
                             if (this.player.gamemode !== 1) {
                                 slot.count--;
                                 if (slot.count <= 0) {
                                     this.player.inventory[this.player.selectedSlot] = null;
                                 }
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

        // 1. Check Mobs and Vehicles
        const hitMob = this.physics.raycastEntities(eyePos, dir, this.mobs);
        const hitVehicle = this.physics.raycastEntities(eyePos, dir, this.vehicles);

        let closestMob = null;
        let minMobDist = 4.0; // Melee range

        if (hitMob.entity && hitMob.dist < minMobDist) {
            closestMob = hitMob.entity;
            minMobDist = hitMob.dist;
        }
        if (hitVehicle.entity && hitVehicle.dist < minMobDist) {
            closestMob = hitVehicle.entity;
            minMobDist = hitVehicle.dist;
        }

        if (closestMob) {
            // Check interaction first
            const slot = this.player.inventory[this.player.selectedSlot];

            if (closestMob instanceof window.Vehicle) {
                // If hitting with weapon, damage it. Else interact (ride).
                if (!slot || !window.TOOLS[slot.type] || window.TOOLS[slot.type].type !== 'sword') {
                     closestMob.interact(this.player);
                     return;
                }
                // Fallthrough to damage logic
            } else {
                // Mob Interaction
                if (slot && closestMob.interact(slot.type)) {
                     if (this.player.gamemode !== 1) {
                         slot.count--;
                         if (slot.count <= 0) this.player.inventory[this.player.selectedSlot] = null;
                     }
                     this.updateHotbarUI();
                     return;
                }
            }

            // Attack Mob / Vehicle
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

            if (this.player.gamemode === 1) {
                this.finalizeBreakBlock(hit.x, hit.y, hit.z);
                return;
            }

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
        const pos = { x: x + 0.5, y: y + 0.5, z: z + 0.5 };

        // Check for Block Entity Drops (e.g. Furnace contents)
        const entity = this.world.getBlockEntity(x, y, z);
        if (entity) {
             if (entity.type === 'furnace') {
                 if (entity.input) this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, entity.input.type, entity.input.count));
                 if (entity.fuelItem) this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, entity.fuelItem.type, entity.fuelItem.count));
                 if (entity.output) this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, entity.output.type, entity.output.count));
             } else if (entity.type === 'crop') {
                 if (blockType === BLOCK.WHEAT) {
                    if (entity.stage >= 7) {
                        this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, BLOCK.ITEM_WHEAT, 1));
                        this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, BLOCK.ITEM_WHEAT_SEEDS, 1 + Math.floor(Math.random()*2)));
                    } else {
                        this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, BLOCK.ITEM_WHEAT_SEEDS, 1));
                    }
                 } else if (blockType === BLOCK.CARROTS) {
                    this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, BLOCK.ITEM_CARROT, entity.stage >= 7 ? 1 + Math.floor(Math.random()*3) : 1));
                 } else if (blockType === BLOCK.POTATOES) {
                    this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, BLOCK.ITEM_POTATO, entity.stage >= 7 ? 1 + Math.floor(Math.random()*3) : 1));
                 } else if (blockType === BLOCK.MELON_STEM || blockType === BLOCK.PUMPKIN_STEM) {
                     this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, blockType === BLOCK.MELON_STEM ? BLOCK.ITEM_MELON_SEEDS : BLOCK.ITEM_PUMPKIN_SEEDS, 1));
                 }
             } else if (entity.type === 'chest' && entity.items) {
                 entity.items.forEach(item => {
                     if (item) this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, item.type, item.count));
                 });
             }
        }

        this.world.setBlock(x, y, z, BLOCK.AIR);
        if (this.particles) {
             const def = BLOCKS[blockType];
             if (def) this.particles.spawn(x+0.5, y+0.5, z+0.5, def.color, 10);
        }
        window.soundManager.play('break', pos);

        // XP Drops for Ores
        if (blockType === BLOCK.ORE_COAL) this.spawnXP(x, y, z, 1);
        else if (blockType === BLOCK.ORE_DIAMOND) this.spawnXP(x, y, z, 5);
        else if (blockType === BLOCK.QUARTZ_ORE) this.spawnXP(x, y, z, 3);

        // Drop Logic
        if (blockType === BLOCK.MELON_BLOCK) {
            this.drops.push(new Drop(this, x+0.5, y+0.5, z+0.5, BLOCK.ITEM_MELON_SLICE, 3 + Math.floor(Math.random()*5)));
        } else if (blockType !== BLOCK.AIR && blockType !== BLOCK.WATER) {
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
                        if (blockDef.drop.chance !== undefined) {
                            if (Math.random() > blockDef.drop.chance) {
                                dropCount = 0;
                            }
                        }
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
                 window.soundManager.play('break', pos);
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
        const eyePos = {
            x: this.player.x,
            y: this.player.y + this.player.height * 0.9,
            z: this.player.z
        };
        const hit = this.physics.raycast(eyePos, dir, 5);
        if (hit && hit.face) {
            const nx = hit.x + hit.face.x;
            const ny = hit.y + hit.face.y;
            const nz = hit.z + hit.face.z;
            const pos = { x: nx + 0.5, y: ny + 0.5, z: nz + 0.5 };

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
                         window.soundManager.play('break', {x:hit.x+0.5, y:hit.y+0.5, z:hit.z+0.5}); // digging sound
                         // Durability logic would go here
                         return;
                     }
                 }

                 // Redstone Dust Placement
                 if (slot.type === BLOCK.ITEM_REDSTONE_DUST) {
                     // Must place on top of a solid block
                     const below = this.world.getBlock(nx, ny-1, nz);
                     const belowDef = BLOCKS[below];
                     if (belowDef && belowDef.solid) {
                         this.world.setBlock(nx, ny, nz, BLOCK.REDSTONE_WIRE);
                         window.soundManager.play('place', pos);
                         this.network.sendBlockUpdate(nx, ny, nz, BLOCK.REDSTONE_WIRE);

                         if (this.player.gamemode !== 1) {
                             slot.count--;
                             if (slot.count <= 0) this.player.inventory[this.player.selectedSlot] = null;
                         }
                         this.updateHotbarUI();
                         return;
                     } else {
                         return; // Can't place
                     }
                 }

                 // Seeds Logic
                 const seedMap = {
                     [BLOCK.ITEM_WHEAT_SEEDS]: BLOCK.WHEAT,
                     [BLOCK.ITEM_CARROT]: BLOCK.CARROTS,
                     [BLOCK.ITEM_POTATO]: BLOCK.POTATOES,
                     [BLOCK.ITEM_MELON_SEEDS]: BLOCK.MELON_STEM,
                     [BLOCK.ITEM_PUMPKIN_SEEDS]: BLOCK.PUMPKIN_STEM
                 };

                 if (seedMap[slot.type]) {
                     if (targetType === BLOCK.FARMLAND) {
                         const up = { x: hit.x, y: hit.y + 1, z: hit.z };
                         if (this.world.getBlock(up.x, up.y, up.z) === BLOCK.AIR) {
                             this.world.setBlock(up.x, up.y, up.z, seedMap[slot.type]);
                             this.world.setBlockEntity(up.x, up.y, up.z, { type: 'crop', stage: 0 });
                             if (this.player.gamemode !== 1) {
                                 slot.count--;
                                 if (slot.count <= 0) this.player.inventory[this.player.selectedSlot] = null;
                             }
                             this.updateHotbarUI();
                             return;
                         }
                     }
                 }

                 // Sapling Logic
                 if (BLOCKS[slot.type].isSapling) {
                     // Check block below
                     // nx, ny, nz is the target block coords
                     const below = this.world.getBlock(nx, ny-1, nz);
                     if (below === BLOCK.DIRT || below === BLOCK.GRASS || below === BLOCK.FARMLAND) {
                         if (this.world.getBlock(nx, ny, nz) === BLOCK.AIR) {
                             this.world.setBlock(nx, ny, nz, slot.type);

                             let treeType = 'oak';
                             if (slot.type === BLOCK.BIRCH_SAPLING) treeType = 'birch';
                             else if (slot.type === BLOCK.SPRUCE_SAPLING) treeType = 'spruce';
                             else if (slot.type === BLOCK.JUNGLE_SAPLING) treeType = 'jungle';

                             this.world.setBlockEntity(nx, ny, nz, { type: 'sapling', stage: 0, treeType: treeType });

                             window.soundManager.play('place', pos);
                             this.network.sendBlockUpdate(nx, ny, nz, slot.type);

                             if (this.player.gamemode !== 1) {
                                 slot.count--;
                                 if (slot.count <= 0) this.player.inventory[this.player.selectedSlot] = null;
                             }
                             this.updateHotbarUI();
                             return;
                         }
                     } else {
                         return; // Can't place
                     }
                 }

                 // Door Placement Logic
                 if (slot.type === BLOCK.DOOR_WOOD_BOTTOM) {
                     // Check vertical space (needs 2 blocks)
                     if (this.world.getBlock(nx, ny, nz) === BLOCK.AIR && this.world.getBlock(nx, ny+1, nz) === BLOCK.AIR) {
                         this.world.setBlock(nx, ny, nz, BLOCK.DOOR_WOOD_BOTTOM);
                         this.world.setBlock(nx, ny+1, nz, BLOCK.DOOR_WOOD_TOP);

                         // Calculate orientation
                         let r = this.player.yaw % (2*Math.PI);
                         if (r < 0) r += 2*Math.PI;
                         let meta = 0;
                         // Match Stair orientation for consistency
                         if (r >= Math.PI/4 && r < 3*Math.PI/4) meta = 2; // South
                         else if (r >= 3*Math.PI/4 && r < 5*Math.PI/4) meta = 1; // West
                         else if (r >= 5*Math.PI/4 && r < 7*Math.PI/4) meta = 3; // North
                         else meta = 0; // East

                         this.world.setMetadata(nx, ny, nz, meta);
                         this.world.setMetadata(nx, ny+1, nz, meta);

                         window.soundManager.play('place');
                         window.soundManager.play('place', pos);
                         this.network.sendBlockUpdate(nx, ny, nz, BLOCK.DOOR_WOOD_BOTTOM);
                         this.network.sendBlockUpdate(nx, ny+1, nz, BLOCK.DOOR_WOOD_TOP);

                         if (this.player.gamemode !== 1) {
                             slot.count--;
                             if (slot.count <= 0) this.player.inventory[this.player.selectedSlot] = null;
                         }
                         this.updateHotbarUI();
                         return;
                     } else {
                         return; // Can't place
                     }
                 }

                 // Sign Placement Logic
                 if (slot.type === BLOCK.ITEM_SIGN) {
                     if (hit.face.y === 1) { // Top
                         this.world.setBlock(nx, ny, nz, BLOCK.SIGN_POST);
                         // Rotation 0-15 based on player yaw
                         // Yaw 0 is South (+Z).
                         // We want 16 steps.
                         let rot = Math.floor((this.player.yaw / (Math.PI * 2)) * 16 + 8.5) & 15;
                         this.world.setMetadata(nx, ny, nz, rot);
                     } else if (hit.face.y === -1) {
                         return; // Ceiling
                     } else { // Wall
                         this.world.setBlock(nx, ny, nz, BLOCK.WALL_SIGN);
                         let meta = 2; // Default North
                         if (hit.face.z === -1) meta = 2; // North
                         else if (hit.face.z === 1) meta = 3; // South
                         else if (hit.face.x === -1) meta = 4; // West
                         else if (hit.face.x === 1) meta = 5; // East
                         this.world.setMetadata(nx, ny, nz, meta);
                     }

                     window.soundManager.play('place', pos);
                     this.network.sendBlockUpdate(nx, ny, nz, this.world.getBlock(nx, ny, nz));

                     // Open UI
                     this.ui.showSignEditor(nx, ny, nz);

                     if (this.player.gamemode !== 1) {
                         slot.count--;
                         if (slot.count <= 0) this.player.inventory[this.player.selectedSlot] = null;
                     }
                     this.updateHotbarUI();
                     return;
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
                 } else if (BLOCKS[slot.type] && BLOCKS[slot.type].isPiston) {
                     let meta = 0;
                     if (this.player.pitch > Math.PI/4) meta = 1; // Face Up
                     else if (this.player.pitch < -Math.PI/4) meta = 0; // Face Down
                     else {
                         let r = this.player.yaw % (2*Math.PI);
                         if (r < 0) r += 2*Math.PI;

                         if (r >= Math.PI/4 && r < 3*Math.PI/4) meta = 4; // East -> West
                         else if (r >= 3*Math.PI/4 && r < 5*Math.PI/4) meta = 3; // North -> South
                         else if (r >= 5*Math.PI/4 && r < 7*Math.PI/4) meta = 5; // West -> East
                         else meta = 2; // South -> North
                     }
                     this.world.setMetadata(nx, ny, nz, meta);
                 } else if (BLOCKS[slot.type] && BLOCKS[slot.type].isTrapdoor) {
                     // Trapdoor Logic
                     // Check hit point relative Y
                     let meta = 0;
                     // hit.point might be undefined if hit logic didn't return it (e.g. from old Physics), but we updated Physics.
                     // Fallback to 0 if point is missing, or check if hit.point exists.
                     if (hit.point && (hit.point.y - Math.floor(hit.point.y)) > 0.5) meta |= 8; // Top (Bit 3)

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
                 window.soundManager.play('place', pos);
                 this.network.sendBlockUpdate(nx, ny, nz, slot.type);

                 // Consume item
                 if (this.player.gamemode !== 1) {
                     slot.count--;
                     if (slot.count <= 0) {
                         this.player.inventory[this.player.selectedSlot] = null;
                     }
                 }
                 this.updateHotbarUI();
            }
        }
    }

    spawnProjectile(x, y, z, dir, type = 'arrow') {
        const speed = type === 'fireball' ? 10 : 15;
        this.projectiles.push({
            x, y, z,
            vx: dir.x * speed,
            vy: dir.y * speed,
            vz: dir.z * speed,
            life: type === 'fireball' ? 5.0 : 2.0,
            type: type
        });
    }

    spawnXP(x, y, z, amount) {
        if (this.drops) this.drops.push(new Drop(this, x + 0.5, y + 0.5, z + 0.5, 'xp', amount));
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

        let y;
        if (this.world.dimension === 'nether') {
             // Find any solid block in column, preferably lower half
             // Or just spawn mid-air for Ghasts?
             // Simplification: Try to find a surface.
             y = 50; // default search start
             for (let cy = 20; cy < 100; cy++) {
                 if (this.world.getBlock(floorX, cy, floorZ) === BLOCK.AIR &&
                     this.world.getBlock(floorX, cy-1, floorZ) !== BLOCK.AIR) {
                     y = cy;
                     break;
                 }
             }
        } else {
             y = this.world.getHighestBlockY(floorX, floorZ);
        }

        if (y <= 0 || (this.world.dimension !== 'nether' && y > 60)) return;

        // Check if spawn position is valid
        const groundBlock = this.world.getBlock(floorX, y-1, floorZ);
        if (groundBlock === BLOCK.WATER || groundBlock === BLOCK.LAVA) return;

        let type = null;

        if (this.world.dimension === 'nether') {
            const r = Math.random();
            if (r < 0.5) type = MOB_TYPE.PIGMAN;
            else if (r < 0.8) type = MOB_TYPE.BLAZE;
            else type = MOB_TYPE.GHAST;
        } else {
            // Check light level (Day/Night)
            const cycle = (this.gameTime % this.dayLength) / this.dayLength;
            const isDay = cycle < 0.5; // 0 to 0.5 is day

            if (isDay) {
                // Passive
                const r = Math.random();
                if (r < 0.25) type = MOB_TYPE.COW;
                else if (r < 0.5) type = MOB_TYPE.PIG;
                else if (r < 0.75) type = MOB_TYPE.SHEEP;
                else type = MOB_TYPE.CHICKEN;
            } else {
                // Hostile
                const r = Math.random();
                if (r < 0.25) type = MOB_TYPE.ZOMBIE;
                else if (r < 0.5) type = MOB_TYPE.SKELETON;
                else if (r < 0.75) type = MOB_TYPE.SPIDER;
                else {
                    if (Math.random() < 0.5) type = MOB_TYPE.CREEPER;
                    else type = MOB_TYPE.ENDERMAN;
                }
            }
        }

        if (type) {
            this.mobs.push(new Mob(this, x, y, z, type));
        }
    }

    explode(x, y, z, radius) {
        if (this.particles) this.particles.spawn(x, y, z, '#FFA500', 50);
        window.soundManager.play('break', {x,y,z}); // Boom sound
        const r2 = radius * radius;
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                 for (let dz = -radius; dz <= radius; dz++) {
                     if (dx*dx + dy*dy + dz*dz <= r2) {
                         const bx = Math.floor(x + dx);
                         const by = Math.floor(y + dy);
                         const bz = Math.floor(z + dz);
                         const block = this.world.getBlock(bx, by, bz);
                         if (block !== BLOCK.AIR && block !== BLOCK.BEDROCK && block !== BLOCK.WATER) {
                             this.world.setBlock(bx, by, bz, BLOCK.AIR);
                             this.network.sendBlockUpdate(bx, by, bz, BLOCK.AIR);
                         }
                     }
                 }
            }
        }

        // Damage entities
        this.mobs.forEach(mob => {
             const dist = Math.sqrt((mob.x-x)**2 + (mob.y-y)**2 + (mob.z-z)**2);
             if (dist < radius * 2) {
                 const damage = Math.floor((1 - dist/(radius*2)) * 20);
                 if (damage > 0) mob.takeDamage(damage, {x: (mob.x-x)/dist, z: (mob.z-z)/dist});
             }
        });

        // Damage Player
        const pDist = Math.sqrt((this.player.x-x)**2 + (this.player.y-y)**2 + (this.player.z-z)**2);
        if (pDist < radius * 2) {
            const damage = Math.floor((1 - pDist/(radius*2)) * 20);
            if (damage > 0) {
                 this.player.takeDamage(damage);
                 // Knockback
                 const dx = this.player.x - x;
                 const dz = this.player.z - z;
                 const len = Math.sqrt(dx*dx + dz*dz);
                 if (len > 0) {
                     this.player.vx += (dx/len) * 10;
                     this.player.vz += (dz/len) * 10;
                     this.player.vy += 5;
                 }
            }
        }
    }

    processBrewing(entity, dt) {
        const ingredient = entity.ingredient;
        if (!ingredient || ingredient.type !== BLOCK.ITEM_NETHER_WART) {
            entity.brewTime = 0;
            if (this.ui.activeBrewingStand === entity) this.ui.updateBrewingUI();
            return;
        }

        // Check bottles
        let canBrew = false;
        for(let i=0; i<3; i++) {
            if (entity.bottles[i] && entity.bottles[i].type === BLOCK.ITEM_GLASS_BOTTLE) {
                canBrew = true;
                break;
            }
        }

        if (canBrew) {
            entity.brewTime += dt * 20;
            if (entity.brewTime >= 400) {
                entity.brewTime = 0;
                entity.ingredient.count--;
                if (entity.ingredient.count <= 0) entity.ingredient = null;

                for(let i=0; i<3; i++) {
                    if (entity.bottles[i] && entity.bottles[i].type === BLOCK.ITEM_GLASS_BOTTLE) {
                        entity.bottles[i] = { type: BLOCK.ITEM_POTION, count: 1 };
                    }
                }
                if (window.soundManager) window.soundManager.play('place');
            }
        } else {
            entity.brewTime = 0;
        }

        if (this.ui.activeBrewingStand === entity) {
            this.ui.updateBrewingUI();
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
        window.soundManager.play('jump', {x:this.player.x, y:this.player.y, z:this.player.z}); // Whoosh sound?
    }

    reelInBobber() {
        if (!this.bobber) return;

        if (this.bobber.state === 'hooked') {
            // Catch fish
            this.drops.push(new Drop(this, this.player.x, this.player.y, this.player.z, BLOCK.ITEM_RAW_FISH, 1));
            this.chat.addMessage("You caught a fish!");
            window.soundManager.play('place', {x:this.player.x, y:this.player.y, z:this.player.z}); // Splash/Catch sound
        }

        this.bobber = null;
    }

    switchDimension(dimension) {
        if (this.world.dimension === dimension) return;

        this.world.chunks.clear();
        this.world.dimension = dimension;

        if (dimension === 'nether') {
            this.player.x /= 8;
            this.player.z /= 8;
            this.player.y = 60; // Approximate safe height
        } else {
            this.player.x *= 8;
            this.player.z *= 8;
            this.player.y = 80; // Approximate safe height
        }

        this.chat.addMessage(`Switching to ${dimension}...`);
        this.updateChunks();
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
                window.soundManager.play('step', {x:b.x, y:b.y, z:b.z}); // Splash
            } else if (block !== BLOCK.AIR) {
                // Hit solid block
                this.bobber = null; // Break
            }
        } else if (b.state === 'floating') {
             b.waitTime -= dt;
             if (b.waitTime <= 0) {
                 b.state = 'hooked';
                 b.biteTimer = 1.0; // 1 second to react
                 window.soundManager.play('break', {x:b.x, y:b.y, z:b.z}); // Bobber dip sound
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
        // Update Listener
        if (window.soundManager && this.player) {
            window.soundManager.updateListener(this.player.x, this.player.y + this.player.height, this.player.z, this.player.yaw, this.player.pitch);
        }

        this.player.update(dt / 1000);
        this.updateBobber(dt / 1000);
        if (this.particles) this.particles.update(dt / 1000);

        // Portal Check
        const pbx = Math.floor(this.player.x);
        const pby = Math.floor(this.player.y);
        const pbz = Math.floor(this.player.z);
        if (this.world.getBlock(pbx, pby, pbz) === BLOCK.PORTAL) {
            this.portalTimer += dt / 1000;
            if (this.portalTimer > 3.0) {
                this.portalTimer = 0;
                const newDim = this.world.dimension === 'overworld' ? 'nether' : 'overworld';
                this.switchDimension(newDim);
            }
        } else {
            this.portalTimer = 0;
        }

        // Update Fluids
        this.fluidTick += dt;
        if (this.fluidTick > 100) { // Every 100ms
            this.world.updateFluids();
            this.fluidTick = 0;
        }

        if (this.minimap) this.minimap.update();
        if (this.achievements) this.achievements.update();
        if (this.tutorial) this.tutorial.update(dt / 1000);

        // Process Block Entities (Furnaces & Crops)
        for (const [key, entity] of this.world.blockEntities) {
            if (entity.type === 'furnace') {
                this.processFurnace(entity, dt / 1000);
            } else if (entity.type === 'brewing_stand') {
                this.processBrewing(entity, dt / 1000);
            } else if (entity.type === 'crop') {
                // Random growth
                if (Math.random() < 0.001) {
                    if (entity.stage < 7) {
                        entity.stage++;
                    } else {
                        // Spread logic for stems
                        const [x, y, z] = key.split(',').map(Number);
                        const b = this.world.getBlock(x, y, z);
                        if (b === BLOCK.MELON_STEM || b === BLOCK.PUMPKIN_STEM) {
                            // Try spawn fruit
                            const dirs = [{x:1,z:0}, {x:-1,z:0}, {x:0,z:1}, {x:0,z:-1}];
                            const dir = dirs[Math.floor(Math.random()*4)];
                            const target = {x: x+dir.x, y: y, z: z+dir.z};
                            if (this.world.getBlock(target.x, target.y, target.z) === BLOCK.AIR) {
                                // Check block below is dirt/grass/farmland
                                const below = this.world.getBlock(target.x, target.y-1, target.z);
                                if (below === BLOCK.DIRT || below === BLOCK.GRASS || below === BLOCK.FARMLAND) {
                                    this.world.setBlock(target.x, target.y, target.z, b === BLOCK.MELON_STEM ? BLOCK.MELON_BLOCK : BLOCK.PUMPKIN);
                                }
                            }
                        }
                    }
                }
            } else if (entity.type === 'sapling') {
                // Random growth
                if (Math.random() < 0.001) {
                    if (entity.stage < 7) {
                        entity.stage++;
                    } else {
                        // Grow Tree
                        const [x, y, z] = key.split(',').map(Number);
                        const chunk = this.world.getChunkAt(x, z);
                        if (chunk) {
                            // Calculate local coords for StructureManager
                            const lx = x - chunk.cx * 16;
                            const lz = z - chunk.cz * 16;

                            // Remove block entity first
                            this.world.setBlockEntity(x, y, z, null);
                            this.world.setBlock(x, y, z, BLOCK.AIR); // Remove sapling block (replaced by tree trunk)

                            this.world.structureManager.generateTree(chunk, lx, y, lz, entity.treeType || 'oak', true);
                        }
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

        // Vehicles
        for (let i = this.vehicles.length - 1; i >= 0; i--) {
            const v = this.vehicles[i];
            v.update(dt / 1000);
            // Despawn if out of world?
            if (v.y < -10) {
                this.vehicles.splice(i, 1);
            }
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
                // Collect XP
                if (drop.type === 'xp') {
                    this.player.addXP(drop.count);
                    if (window.soundManager) window.soundManager.play('place', {x:this.player.x, y:this.player.y, z:this.player.z});
                    this.drops.splice(i, 1);
                    continue;
                }

                // Collect Item
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
                    window.soundManager.play('place', {x:this.player.x, y:this.player.y, z:this.player.z}); // Pickup sound?
                    this.drops.splice(i, 1);
                    this.updateHotbarUI();

                    // Check Recipe Unlock
                    if (this.crafting && this.crafting.checkUnlock) {
                         this.crafting.checkUnlock(drop.type);
                    }
                }
            }
        }

        // Update TNT
        for (let i = this.tntPrimed.length - 1; i >= 0; i--) {
            const tnt = this.tntPrimed[i];
            const dts = dt / 1000;
            tnt.fuse -= dts;
            // Physics
            tnt.vy -= 25 * dts;
            tnt.y += tnt.vy * dts;
            // Simple collision
            if (this.world.getBlock(Math.floor(tnt.x), Math.floor(tnt.y), Math.floor(tnt.z)) !== BLOCK.AIR) {
                tnt.y = Math.floor(tnt.y) + 1;
                tnt.vy = 0;
            }

            if (tnt.fuse <= 0) {
                this.explode(tnt.x, tnt.y, tnt.z, 4);
                this.tntPrimed.splice(i, 1);
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
            const pb = this.world.getBlock(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z));
            const pbDef = window.BLOCKS[pb];
            if (pb !== BLOCK.AIR && pbDef && pbDef.solid) {
                p.life = 0;
                if (p.type === 'fireball') this.explode(p.x, p.y, p.z, 3);
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
                     if (p.type === 'fireball') {
                         this.explode(p.x, p.y, p.z, 3);
                     } else {
                         // Push player
                         this.player.vx += p.vx * 0.5;
                         this.player.vz += p.vz * 0.5;
                         this.player.takeDamage(2);
                     }
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

        // Weather Cycle
        if (Math.random() < 0.0001) { // Rare change
            const types = ['clear', 'rain', 'snow'];
            const next = types[Math.floor(Math.random() * types.length)];
            if (next !== this.world.weather) this.world.setWeather(next);
        }

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
        if (this.network) this.network.update(dt / 1000);
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
