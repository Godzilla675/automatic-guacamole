class World {
    constructor() {
        this.chunks = new Map();
        this.pendingBlocks = new Map();
        this.blockEntities = new Map(); // Store complex data like Furnace state { "x,y,z": { ... } }
        this.chunkSize = 16;
        this.renderDistance = 6;
        this.worldHeight = 128;
        this.seed = Math.random() * 10000;

        this.biomeManager = new window.BiomeManager(this.seed);
        this.structureManager = new window.StructureManager(this);

        this.activeFluids = new Set();
        this.activeRedstone = new Set();
        this.fluidTickTimer = 0;

        this.dimension = 'overworld'; // 'overworld', 'nether'

        this.weather = 'clear'; // 'clear', 'rain', 'snow'
        this.weatherTimer = 0;
    }

    setWeather(type) {
        this.weather = type;
        if (window.game && window.game.chat) window.game.chat.addMessage(`Weather changed to ${type}`);
    }

    getChunkKey(cx, cz) {
        return `${cx},${cz}`;
    }

    getChunk(cx, cz) {
        return this.chunks.get(this.getChunkKey(cx, cz));
    }

    getChunkAt(x, z) {
        const cx = Math.floor(x / this.chunkSize);
        const cz = Math.floor(z / this.chunkSize);
        return this.getChunk(cx, cz);
    }

    getBlockEntity(x, y, z) {
        return this.blockEntities.get(`${x},${y},${z}`);
    }

    setBlockEntity(x, y, z, data) {
        this.blockEntities.set(`${x},${y},${z}`, data);
    }

    removeBlockEntity(x, y, z) {
        this.blockEntities.delete(`${x},${y},${z}`);
    }

    setBlock(x, y, z, type) {
        const cx = Math.floor(x / this.chunkSize);
        const cz = Math.floor(z / this.chunkSize);
        const lx = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const lz = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;

        let chunk = this.getChunk(cx, cz);
        if (!chunk) {
            // If setting a block in non-existent chunk, store it for later
            const key = this.getChunkKey(cx, cz);
            if (!this.pendingBlocks.has(key)) {
                this.pendingBlocks.set(key, []);
            }
            this.pendingBlocks.get(key).push({x: lx, y, z: lz, type});
            return;
        }

        const oldType = chunk.getBlock(lx, y, lz);
        chunk.setBlock(lx, y, lz, type);

        // Remove old block entity if it exists
        this.removeBlockEntity(x, y, z);

        // Update neighbors if on edge to ensure culling is updated
        if (lx === 0) { const c = this.getChunk(cx - 1, cz); if (c) c.modified = true; }
        if (lx === this.chunkSize - 1) { const c = this.getChunk(cx + 1, cz); if (c) c.modified = true; }
        if (lz === 0) { const c = this.getChunk(cx, cz - 1); if (c) c.modified = true; }
        if (lz === this.chunkSize - 1) { const c = this.getChunk(cx, cz + 1); if (c) c.modified = true; }

        // Fluid Updates
        if (type === BLOCK.WATER) {
            this.activeFluids.add(`${x},${y},${z}`);
        } else if (oldType === BLOCK.WATER) {
             // Removed water, check neighbors to update their flow
             this.scheduleNeighborFluidUpdates(x, y, z);
        } else {
             // Placed/Removed solid block, neighbors might flow into this or stop flowing
             this.scheduleNeighborFluidUpdates(x, y, z);
        }

        // Lighting Updates
        const blockDef = window.BLOCKS[type];
        const oldBlockDef = window.BLOCKS[oldType];

        // If placed a light source
        if (blockDef && blockDef.light) {
            this.updateLighting(x, y, z);
        }
        // If removed a light source or placed an opaque block blocking light
        else if ((oldBlockDef && oldBlockDef.light) || (blockDef && blockDef.solid)) {
             this.recalcLocalLight(x, y, z);
        }
        // If removed an opaque block, light might flow in
        else if (oldBlockDef && oldBlockDef.solid && (!blockDef || !blockDef.solid)) {
             this.recalcLocalLight(x, y, z);
        }

        // Check Structural Integrity of neighbors
        this.checkNeighborIntegrity(x, y, z);

        // Redstone Updates
        // If we placed or removed something that interacts with redstone
        if ((blockDef && (blockDef.isWire || blockDef.isTorch || blockDef.id === window.BLOCK.REDSTONE_LAMP || blockDef.id === window.BLOCK.REDSTONE_LAMP_ACTIVE)) ||
            (oldBlockDef && (oldBlockDef.isWire || oldBlockDef.isTorch || oldBlockDef.id === window.BLOCK.REDSTONE_LAMP || oldBlockDef.id === window.BLOCK.REDSTONE_LAMP_ACTIVE))) {
            this.scheduleNeighborRedstoneUpdates(x, y, z);
            this.activeRedstone.add(`${x},${y},${z}`);
        } else {
            // Placing a block might connect/disconnect wire, or block a signal?
            // For now, simple neighbor check
             this.scheduleNeighborRedstoneUpdates(x, y, z);
        }
    }

    checkNeighborIntegrity(x, y, z) {
        const neighbors = [
            {x:x, y:y+1, z:z},
            {x:x+1, y:y, z:z}, {x:x-1, y:y, z:z},
            {x:x, y:y, z:z+1}, {x:x, y:y, z:z-1}
        ];
        for (const n of neighbors) {
            this.checkStructuralIntegrity(n.x, n.y, n.z);
        }
    }

    checkStructuralIntegrity(x, y, z) {
        const type = this.getBlock(x, y, z);
        if (type === BLOCK.AIR) return;
        const def = window.BLOCKS[type];
        if (!def) return;

        // Check if block needs support
        if (def.isTorch || def.isWire || type === BLOCK.REDSTONE_TORCH_OFF || type === BLOCK.REDSTONE_TORCH || type === BLOCK.TORCH || type === BLOCK.RAIL || type === BLOCK.POWERED_RAIL || type === BLOCK.DETECTOR_RAIL || type === BLOCK.BREWING_STAND || type === BLOCK.WHEAT || type === BLOCK.CARROTS || type === BLOCK.POTATOES) {
             const below = this.getBlock(x, y-1, z);
             const belowDef = window.BLOCKS[below];
             // Must be on solid block (or farmland for crops)
             // Simplified: just check if below is solid.
             // Crops strictly need farmland.
             let valid = false;
             if (type === BLOCK.WHEAT || type === BLOCK.CARROTS || type === BLOCK.POTATOES) {
                 if (below === BLOCK.FARMLAND) valid = true;
             } else {
                 if (belowDef && belowDef.solid) valid = true;
             }

             if (!valid) {
                 this.setBlock(x, y, z, BLOCK.AIR);
                 // Drop item
                 if (this.game && this.game.drops) {
                     const dropType = def.drop ? def.drop.type : type;
                     const dropCount = def.drop ? def.drop.count : 1;
                     if (dropCount > 0) {
                         this.game.drops.push(new window.Drop(this.game, x+0.5, y+0.5, z+0.5, dropType, dropCount));
                     }
                 }
             }
        } else if (type === BLOCK.SIGN_POST) {
             const below = this.getBlock(x, y-1, z);
             const belowDef = window.BLOCKS[below];
             if (!belowDef || !belowDef.solid) {
                 this.setBlock(x, y, z, BLOCK.AIR);
                 if (this.game && this.game.drops) {
                     this.game.drops.push(new window.Drop(this.game, x+0.5, y+0.5, z+0.5, BLOCK.ITEM_SIGN, 1));
                 }
                 this.removeBlockEntity(x, y, z);
             }
        } else if (type === BLOCK.WALL_SIGN) {
             const meta = this.getMetadata(x, y, z);
             let supportPos = null;
             // 2: North (attached to Z+1), 3: South (attached to Z-1), 4: West (attached to X+1), 5: East (attached to X-1)
             if (meta === 2) supportPos = {x, y, z: z+1};
             else if (meta === 3) supportPos = {x, y, z: z-1};
             else if (meta === 4) supportPos = {x: x+1, y, z};
             else if (meta === 5) supportPos = {x: x-1, y, z};

             let valid = false;
             if (supportPos) {
                 const support = this.getBlock(supportPos.x, supportPos.y, supportPos.z);
                 const supportDef = window.BLOCKS[support];
                 if (supportDef && supportDef.solid) valid = true;
             }

             if (!valid) {
                 this.setBlock(x, y, z, BLOCK.AIR);
                 if (this.game && this.game.drops) {
                     this.game.drops.push(new window.Drop(this.game, x+0.5, y+0.5, z+0.5, BLOCK.ITEM_SIGN, 1));
                 }
                 this.removeBlockEntity(x, y, z);
             }
        }
    }

    scheduleNeighborRedstoneUpdates(x, y, z) {
        const neighbors = [
            {x:x+1, y:y, z:z}, {x:x-1, y:y, z:z},
            {x:x, y:y+1, z:z}, {x:x, y:y-1, z:z},
            {x:x, y:y, z:z+1}, {x:x, y:y, z:z-1}
        ];
        for (const n of neighbors) {
            this.activeRedstone.add(`${n.x},${n.y},${n.z}`);
        }
    }

    isBlockPowered(x, y, z) {
        const neighbors = [
            {x:x+1, y:y, z:z}, {x:x-1, y:y, z:z},
            {x:x, y:y+1, z:z}, {x:x, y:y-1, z:z},
            {x:x, y:y, z:z+1}, {x:x, y:y, z:z-1}
        ];
        for (const n of neighbors) {
            const type = this.getBlock(n.x, n.y, n.z);
            const def = window.BLOCKS[type];
            if (def) {
                if (def.isWire && this.getMetadata(n.x, n.y, n.z) > 0) return true;
                if (def.isTorch && def.id !== window.BLOCK.TORCH && type !== window.BLOCK.REDSTONE_TORCH_OFF) {
                    // Torch powers neighbors EXCEPT the one it is attached to.
                    // Assuming standing torch attached to block below (n.y - 1).
                    // If the torch is at n.x, n.y, n.z, and we are checking x, y, z.
                    // If n.y == y + 1, then the torch is above us, so we are the block below.
                    if (n.y === y + 1) continue;
                    return true;
                }
                if (type === window.BLOCK.REDSTONE_LAMP_ACTIVE) return false;
            }
        }
        return false;
    }

    updateRedstone() {
        if (this.activeRedstone.size === 0) return;

        // Process a batch (breadth-firstish)
        // We iterate current set, clear it. Any new updates go to next frame/tick.
        const processing = Array.from(this.activeRedstone);
        this.activeRedstone.clear();

        for (const key of processing) {
            const [x, y, z] = key.split(',').map(Number);
            const type = this.getBlock(x, y, z);
            const blockDef = window.BLOCKS[type];
            if (!blockDef) continue;

            if (blockDef.isWire) {
                const currentPower = this.getMetadata(x, y, z);
                let newPower = 0;

                const neighbors = [
                    {x:x+1, y:y, z:z}, {x:x-1, y:y, z:z},
                    {x:x, y:y, z:z+1}, {x:x, y:y, z:z-1},
                    {x:x, y:y+1, z:z}, {x:x, y:y-1, z:z}
                ];

                for (const n of neighbors) {
                    const nType = this.getBlock(n.x, n.y, n.z);
                    const nDef = window.BLOCKS[nType];
                    if (!nDef) continue;

                    if (nDef.isTorch && nType !== window.BLOCK.REDSTONE_TORCH_OFF) {
                        newPower = 15;
                    } else if (nDef.isWire) {
                        const nPower = this.getMetadata(n.x, n.y, n.z);
                        if (nPower - 1 > newPower) {
                            newPower = nPower - 1;
                        }
                    } else if (nType === window.BLOCK.REDSTONE_LAMP_ACTIVE) {
                         // Active lamp doesn't power wire back unless it's a source block?
                         // In MC, Lamps are consumers.
                    }
                    // TODO: Levers, Buttons, etc.
                }

                if (newPower !== currentPower) {
                    this.setMetadata(x, y, z, newPower);
                    // Notify neighbors of change
                    this.scheduleNeighborRedstoneUpdates(x, y, z);
                }
            } else if (type === window.BLOCK.REDSTONE_LAMP || type === window.BLOCK.REDSTONE_LAMP_ACTIVE) {
                 let powered = false;
                 const neighbors = [
                    {x:x+1, y:y, z:z}, {x:x-1, y:y, z:z},
                    {x:x, y:y, z:z+1}, {x:x, y:y, z:z-1},
                    {x:x, y:y+1, z:z}, {x:x, y:y-1, z:z}
                ];

                for (const n of neighbors) {
                     const nType = this.getBlock(n.x, n.y, n.z);
                     const nDef = window.BLOCKS[nType];
                     if (nDef) {
                         if (nDef.isTorch) powered = true;
                         else if (nDef.isWire && this.getMetadata(n.x, n.y, n.z) > 0) powered = true;
                     }
                }

                if (powered && type === window.BLOCK.REDSTONE_LAMP) {
                    this.setBlock(x, y, z, window.BLOCK.REDSTONE_LAMP_ACTIVE);
                    // setBlock triggers scheduleNeighborRedstoneUpdates, so neighbors will know lamp changed
                } else if (!powered && type === window.BLOCK.REDSTONE_LAMP_ACTIVE) {
                    this.setBlock(x, y, z, window.BLOCK.REDSTONE_LAMP);
                }
            } else if (blockDef.isTorch && blockDef.id !== window.BLOCK.TORCH) { // Redstone Torch
                 // Check block below
                 const supportPos = {x, y: y-1, z};
                 const supportType = this.getBlock(supportPos.x, supportPos.y, supportPos.z);

                 // Check if support block is receiving power
                 const isPowered = this.isBlockPowered(supportPos.x, supportPos.y, supportPos.z);

                 if (isPowered && type === window.BLOCK.REDSTONE_TORCH) {
                     this.setBlock(x, y, z, window.BLOCK.REDSTONE_TORCH_OFF);
                     this.scheduleNeighborRedstoneUpdates(x, y, z); // Notify neighbors (wire above/side)
                 } else if (!isPowered && type === window.BLOCK.REDSTONE_TORCH_OFF) {
                     this.setBlock(x, y, z, window.BLOCK.REDSTONE_TORCH);
                     this.scheduleNeighborRedstoneUpdates(x, y, z);
                 }
            } else if (blockDef.isPiston) {
                const powered = this.isBlockPowered(x, y, z);
                const meta = this.getMetadata(x, y, z);
                const extended = (meta & 8) !== 0;

                if (powered && !extended) {
                    this.extendPiston(x, y, z, meta);
                } else if (!powered && extended) {
                    this.retractPiston(x, y, z, meta);
                }
            }
        }
    }

    getDirectionVector(orientation) {
        const dirs = [
            {x:0, y:-1, z:0}, {x:0, y:1, z:0}, // 0: Down, 1: Up
            {x:0, y:0, z:-1}, {x:0, y:0, z:1}, // 2: North (Z-), 3: South (Z+)
            {x:-1, y:0, z:0}, {x:1, y:0, z:0}  // 4: West (X-), 5: East (X+)
        ];
        return dirs[orientation & 7] || {x:0,y:1,z:0};
    }

    extendPiston(x, y, z, meta) {
        const orientation = meta & 7;
        const dir = this.getDirectionVector(orientation);
        const headPos = {x: x+dir.x, y: y+dir.y, z: z+dir.z};

        // Check collision/push
        // We need to push blocks starting from headPos
        // Max 12 blocks.

        const toPush = [];
        let curr = { ...headPos };
        let possible = true;

        for(let i=0; i<12; i++) {
             const b = this.getBlock(curr.x, curr.y, curr.z);
             if (b === BLOCK.AIR) break;

             const def = window.BLOCKS[b];
             // Immovable checks
             if (!def) { possible = false; break; }
             if (b === BLOCK.BEDROCK || b === BLOCK.OBSIDIAN || b === BLOCK.PISTON_HEAD || b === BLOCK.STICKY_PISTON_HEAD) {
                 possible = false; break;
             }
             if (def.isPiston && (this.getMetadata(curr.x, curr.y, curr.z) & 8)) {
                 // Extended piston is immovable
                 possible = false; break;
             }
             // Add to list
             toPush.push({x: curr.x, y: curr.y, z: curr.z, type: b, meta: this.getMetadata(curr.x, curr.y, curr.z)});

             curr.x += dir.x;
             curr.y += dir.y;
             curr.z += dir.z;
        }

        // Check if last block can be pushed into empty space
        if (possible) {
             const endBlock = this.getBlock(curr.x, curr.y, curr.z);
             if (endBlock !== BLOCK.AIR) {
                 const endDef = window.BLOCKS[endBlock];
                 // If we stopped because of non-air, check if it's replacable.
                 // Actually the loop stops if AIR. So endBlock should be AIR if successful push chain ends in AIR.
                 // If loop ran 12 times, endBlock is the 13th block. It MUST be AIR or replaceable liquid.
                 if (endDef && (endDef.solid || endDef.isPiston)) possible = false;
             }
        }

        if (possible) {
             // Push blocks in reverse order
             // curr is the empty spot
             let target = { ...curr };

             for(let i=toPush.length-1; i>=0; i--) {
                 const block = toPush[i];
                 // Move block to target
                 this.setBlock(target.x, target.y, target.z, block.type);
                 this.setMetadata(target.x, target.y, target.z, block.meta);

                 // Update target to be this block's old pos
                 target = {x: block.x, y: block.y, z: block.z};
             }

             // Place Piston Head
             this.setBlock(headPos.x, headPos.y, headPos.z, (this.getBlock(x,y,z) === BLOCK.STICKY_PISTON) ? BLOCK.STICKY_PISTON_HEAD : BLOCK.PISTON_HEAD);
             this.setMetadata(headPos.x, headPos.y, headPos.z, orientation | 8);

             // Update Piston Base to Extended
             this.setMetadata(x, y, z, meta | 8);

             if (window.soundManager) window.soundManager.play('place');
        }
    }

    retractPiston(x, y, z, meta) {
        const orientation = meta & 7;
        const dir = this.getDirectionVector(orientation);
        const headPos = {x: x+dir.x, y: y+dir.y, z: z+dir.z};

        // Remove Head
        const headType = this.getBlock(headPos.x, headPos.y, headPos.z);
        if (headType === BLOCK.PISTON_HEAD || headType === BLOCK.STICKY_PISTON_HEAD) {
            this.setBlock(headPos.x, headPos.y, headPos.z, BLOCK.AIR);
        }

        // Update Base
        this.setMetadata(x, y, z, meta & 7); // Clear bit 3

        if (window.soundManager) window.soundManager.play('place');

        // Sticky Logic
        const isSticky = (this.getBlock(x,y,z) === BLOCK.STICKY_PISTON);
        if (isSticky) {
             const pullPos = {x: headPos.x + dir.x, y: headPos.y + dir.y, z: headPos.z + dir.z};
             const pullBlock = this.getBlock(pullPos.x, pullPos.y, pullPos.z);

             if (pullBlock !== BLOCK.AIR && pullBlock !== BLOCK.BEDROCK && pullBlock !== BLOCK.OBSIDIAN) {
                 // Check if movable
                 const def = window.BLOCKS[pullBlock];
                 if (def && !def.isPiston && !def.isTileEntity) {
                      const metaPull = this.getMetadata(pullPos.x, pullPos.y, pullPos.z);

                      this.setBlock(headPos.x, headPos.y, headPos.z, pullBlock);
                      this.setMetadata(headPos.x, headPos.y, headPos.z, metaPull);

                      this.setBlock(pullPos.x, pullPos.y, pullPos.z, BLOCK.AIR);
                 }
             }
        }
    }

    scheduleNeighborFluidUpdates(x, y, z) {
        const neighbors = [
            {x:x+1, y:y, z:z}, {x:x-1, y:y, z:z},
            {x:x, y:y+1, z:z}, {x:x, y:y-1, z:z}, // Check Up too? If water is above, it flows down.
            {x:x, y:y, z:z+1}, {x:x, y:y, z:z-1}
        ];
        for (const n of neighbors) {
            if (this.getBlock(n.x, n.y, n.z) === BLOCK.WATER) {
                this.activeFluids.add(`${n.x},${n.y},${n.z}`);
            }
        }
    }

    updateFluids() {
        if (this.activeFluids.size === 0) return;

        // Process a batch
        const processing = Array.from(this.activeFluids);
        this.activeFluids.clear();

        for (const key of processing) {
            const [x, y, z] = key.split(',').map(Number);
            const type = this.getBlock(x, y, z);
            if (type !== BLOCK.WATER) continue;

            let meta = this.getMetadata(x, y, z);

            // Infinite Source Creation
            if (meta !== 8) {
                let sourceNeighbors = 0;
                const horizontal = [
                    {x:x+1, y:y, z:z}, {x:x-1, y:y, z:z},
                    {x:x, y:y, z:z+1}, {x:x, y:y, z:z-1}
                ];
                for (const n of horizontal) {
                     if (this.getBlock(n.x, n.y, n.z) === BLOCK.WATER && this.getMetadata(n.x, n.y, n.z) === 8) {
                         sourceNeighbors++;
                     }
                }
                if (sourceNeighbors >= 2) {
                    meta = 8;
                    this.setMetadata(x, y, z, 8);
                }
            }

            const isSource = meta === 8; // Assuming 8 is source

            // Flow Logic
            // 1. Flow Down
            const below = { x, y: y - 1, z };
            const belowType = this.getBlock(below.x, below.y, below.z);

            if (belowType === BLOCK.AIR || (belowType === BLOCK.WATER && this.getMetadata(below.x, below.y, below.z) !== 8)) {
                // Flow down (set to max flow level 7, or 8 if we want falling water to be full)
                // If below is water but source, don't overwrite source.
                // If below is water not source, update it.
                if (belowType !== BLOCK.WATER || this.getMetadata(below.x, below.y, below.z) !== 7) {
                     this.setBlock(below.x, below.y, below.z, BLOCK.WATER);
                     this.setMetadata(below.x, below.y, below.z, 7); // Falling water
                }
                // Don't flow sideways if falling? MC rule: if falling, doesn't spread sideways unless solid below.
                continue;
            } else if (window.BLOCKS[belowType] && !window.BLOCKS[belowType].solid && belowType !== BLOCK.WATER) {
                 // Wash away non-solid blocks (like grass, torches, flowers)
                 this.setBlock(below.x, below.y, below.z, BLOCK.WATER);
                 this.setMetadata(below.x, below.y, below.z, 7); // Falling water
                 continue;
            }

            // 2. Flow Sideways (if blocked below)
            if (belowType !== BLOCK.AIR && (belowType === BLOCK.WATER || (window.BLOCKS[belowType] && window.BLOCKS[belowType].solid))) {
                const decay = 1;
                const newMeta = meta - decay;

                if (newMeta > 0) {
                     const neighbors = [
                        {x:x+1, y:y, z:z}, {x:x-1, y:y, z:z},
                        {x:x, y:y, z:z+1}, {x:x, y:y, z:z-1}
                     ];
                     for (const n of neighbors) {
                         const nType = this.getBlock(n.x, n.y, n.z);
                         if (nType === BLOCK.AIR) {
                             this.setBlock(n.x, n.y, n.z, BLOCK.WATER);
                             this.setMetadata(n.x, n.y, n.z, newMeta);
                         } else if (nType === BLOCK.WATER) {
                             const nMeta = this.getMetadata(n.x, n.y, n.z);
                             if (nMeta < newMeta && nMeta !== 8) { // Don't overwrite source or higher level
                                 this.setMetadata(n.x, n.y, n.z, newMeta);
                                 this.activeFluids.add(`${n.x},${n.y},${n.z}`); // Re-evaluate neighbor
                             }
                         }
                     }
                }
            }

            // Check if this block should dry up (if no source)
            // This is hard with local automata.
            // MC uses recursions or distance maps.
            // Simplified: We only spread. We don't dry up unless we check parents.
            // If we implement drying, we need to check if any neighbor is level+1 or source.
            // If not, this block turns to air.

            if (!isSource) {
                let maxNeighbor = 0;
                // Check neighbors including Up
                const neighbors = [
                    {x:x+1, y:y, z:z}, {x:x-1, y:y, z:z},
                    {x:x, y:y, z:z+1}, {x:x, y:y, z:z-1},
                    {x:x, y:y+1, z:z} // Up
                ];

                for (const n of neighbors) {
                    if (this.getBlock(n.x, n.y, n.z) === BLOCK.WATER) {
                         const nm = this.getMetadata(n.x, n.y, n.z);
                         // If neighbor is Up, it feeds us if it's any water (falling)
                         if (n.y > y) {
                             maxNeighbor = 8; // Fed from above
                         } else {
                             if (nm > maxNeighbor) maxNeighbor = nm;
                         }
                    }
                }

                if (maxNeighbor === 0 || maxNeighbor - 1 <= 0) {
                    // Dry up
                    this.setBlock(x, y, z, BLOCK.AIR);
                } else if (maxNeighbor === 8) {
                    // Fed from above, stay at 7 (falling)
                    if (meta !== 7) {
                        this.setMetadata(x, y, z, 7);
                        this.activeFluids.add(key);
                    }
                } else {
                    // Fed from side
                    const target = maxNeighbor - 1;
                    if (meta !== target) {
                        this.setMetadata(x, y, z, target);
                        this.activeFluids.add(key);
                    }
                }
            }
        }
    }

    getBlock(x, y, z) {
        const cx = Math.floor(x / this.chunkSize);
        const cz = Math.floor(z / this.chunkSize);
        const lx = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const lz = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;

        let chunk = this.getChunk(cx, cz);
        if (!chunk) return BLOCK.AIR;
        return chunk.getBlock(lx, y, lz);
    }

    getMetadata(x, y, z) {
        const cx = Math.floor(x / this.chunkSize);
        const cz = Math.floor(z / this.chunkSize);
        const lx = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const lz = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;

        let chunk = this.getChunk(cx, cz);
        if (!chunk) return 0;
        return chunk.getMetadata(lx, y, lz);
    }

    setMetadata(x, y, z, val) {
        const cx = Math.floor(x / this.chunkSize);
        const cz = Math.floor(z / this.chunkSize);
        const lx = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const lz = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;

        let chunk = this.getChunk(cx, cz);
        if (chunk) {
            chunk.setMetadata(lx, y, lz, val);
        }
    }

    getLight(x, y, z) {
        const cx = Math.floor(x / this.chunkSize);
        const cz = Math.floor(z / this.chunkSize);
        const lx = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const lz = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;

        let chunk = this.getChunk(cx, cz);
        if (!chunk) return 15; // Assume bright if unloaded (day) or handle properly
        return chunk.getLight(lx, y, lz);
    }

    setLight(x, y, z, val) {
        const cx = Math.floor(x / this.chunkSize);
        const cz = Math.floor(z / this.chunkSize);
        const lx = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const lz = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;

        let chunk = this.getChunk(cx, cz);
        if (chunk) {
            chunk.setLight(lx, y, lz, val);
        }
    }

    updateLighting(x, y, z) {
        // Simple BFS light propagation from a source
        const queue = [];
        const visited = new Set();

        // Initial check: if we just placed a torch
        const type = this.getBlock(x, y, z);
        const blockDef = window.BLOCKS[type];

        if (blockDef && blockDef.light) {
            queue.push({x, y, z, level: blockDef.light});
            this.setLight(x, y, z, blockDef.light);
        } else {
             this.recalcLocalLight(x, y, z);
             return;
        }

        while(queue.length > 0) {
            const node = queue.shift();
            const {x, y, z, level} = node;

            if (level <= 1) continue;

            const neighbors = [
                {x: x+1, y: y, z: z}, {x: x-1, y: y, z: z},
                {x: x, y: y+1, z: z}, {x: x, y: y-1, z: z},
                {x: x, y: y, z: z+1}, {x: x, y: y, z: z-1}
            ];

            for (const n of neighbors) {
                const key = `${n.x},${n.y},${n.z}`;
                if (visited.has(key)) continue;

                const nType = this.getBlock(n.x, n.y, n.z);
                const nDef = window.BLOCKS[nType];
                if (nType === BLOCK.AIR || (nDef && nDef.transparent)) {
                    const currentLight = this.getLight(n.x, n.y, n.z);
                    if (currentLight < level - 1) {
                         this.setLight(n.x, n.y, n.z, level - 1);
                         queue.push({x: n.x, y: n.y, z: n.z, level: level - 1});
                         visited.add(key);
                    }
                }
            }
        }
    }

    recalcLocalLight(cx, cy, cz) {
        // Reset light in a small radius and find sources
        const rad = 15;
        const sources = [];

        // 1. Reset
        for (let x = cx - rad; x <= cx + rad; x++) {
            for (let y = cy - rad; y <= cy + rad; y++) {
                for (let z = cz - rad; z <= cz + rad; z++) {
                    const b = this.getBlock(x, y, z);
                    const def = window.BLOCKS[b];
                    if (def && def.light) {
                        sources.push({x, y, z, level: def.light});
                        this.setLight(x, y, z, def.light);
                    } else {
                        // Don't fully reset to 0 if we are far from the change, but for now reset in radius.
                        // This might cause dark spots if other sources are outside radius.
                        // Optimization for later.
                        this.setLight(x, y, z, 0);
                    }

                    // Check boundary for external light sources to propagate back in
                    if (x === cx - rad) {
                         const l = this.getLight(x - 1, y, z);
                         if (l > 0) sources.push({x: x-1, y, z, level: l});
                    }
                    if (x === cx + rad) {
                         const l = this.getLight(x + 1, y, z);
                         if (l > 0) sources.push({x: x+1, y, z, level: l});
                    }
                    if (y === cy - rad) {
                         const l = this.getLight(x, y - 1, z);
                         if (l > 0) sources.push({x, y: y-1, z, level: l});
                    }
                    if (y === cy + rad) {
                         const l = this.getLight(x, y + 1, z);
                         if (l > 0) sources.push({x, y: y+1, z, level: l});
                    }
                    if (z === cz - rad) {
                         const l = this.getLight(x, y, z - 1);
                         if (l > 0) sources.push({x, y, z: z-1, level: l});
                    }
                    if (z === cz + rad) {
                         const l = this.getLight(x, y, z + 1);
                         if (l > 0) sources.push({x, y, z: z+1, level: l});
                    }
                }
            }
        }

        // 2. Propagate all sources
        const queue = [...sources];

        while(queue.length > 0) {
            const node = queue.shift();
            const {x, y, z, level} = node;

            if (level <= 1) continue;

            const neighbors = [
                {x: x+1, y: y, z: z}, {x: x-1, y: y, z: z},
                {x: x, y: y+1, z: z}, {x: x, y: y-1, z: z},
                {x: x, y: y, z: z+1}, {x: x, y: y, z: z-1}
            ];

            for (const n of neighbors) {
                 const nType = this.getBlock(n.x, n.y, n.z);
                 const nDef = window.BLOCKS[nType];
                 if (nType === BLOCK.AIR || (nDef && nDef.transparent)) {
                     const currentLevel = this.getLight(n.x, n.y, n.z);
                     if (currentLevel < level - 1) {
                         this.setLight(n.x, n.y, n.z, level - 1);
                         queue.push({x: n.x, y: n.y, z: n.z, level: level - 1});
                     }
                 }
            }
        }
    }

    getHighestBlockY(x, z) {
        for (let y = this.worldHeight - 1; y >= 0; y--) {
            if (this.getBlock(x, y, z) !== BLOCK.AIR) {
                return y + 1;
            }
        }
        return 0;
    }

    unloadFarChunks(playerX, playerZ, renderDist) {
        const centerCX = Math.floor(playerX / this.chunkSize);
        const centerCZ = Math.floor(playerZ / this.chunkSize);
        const unloadDist = renderDist + 2; // Keep a buffer around render distance

        for (const key of this.chunks.keys()) {
             const [cxStr, czStr] = key.split(',');
             const cx = parseInt(cxStr);
             const cz = parseInt(czStr);

             if (Math.abs(cx - centerCX) > unloadDist || Math.abs(cz - centerCZ) > unloadDist) {
                 this.chunks.delete(key);
             }
        }
    }

    generateChunk(cx, cz) {
        if (this.dimension === 'nether') {
            this.generateNetherChunk(cx, cz);
        } else {
            this.generateOverworldChunk(cx, cz);
        }
    }

    generateNetherChunk(cx, cz) {
        if (this.chunks.has(this.getChunkKey(cx, cz))) return;

        const chunk = new Chunk(cx, cz);
        const baseX = cx * this.chunkSize;
        const baseZ = cz * this.chunkSize;

        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                const worldX = baseX + x;
                const worldZ = baseZ + z;

                // Bedrock
                chunk.setBlock(x, 0, z, BLOCK.BEDROCK);
                chunk.setBlock(x, 127, z, BLOCK.BEDROCK);

                // Noise for Caves/Terrain
                const scale = 0.05;

                for (let y = 1; y < 127; y++) {
                     const noise = window.perlin.noise(worldX * scale, y * scale, worldZ * scale);

                     // In Nether, we want solid netherrack with open caves (cheese)
                     // If noise < 0.2, solid. Else air.
                     if (noise < 0.2) {
                         chunk.setBlock(x, y, z, BLOCK.NETHERRACK);

                         // Ores
                         if (Math.random() < 0.005) chunk.setBlock(x, y, z, BLOCK.QUARTZ_ORE);
                         else if (Math.random() < 0.005) chunk.setBlock(x, y, z, BLOCK.GLOWSTONE); // Clump logic simplified to random
                     } else {
                         // Air
                         if (y <= 32) {
                             chunk.setBlock(x, y, z, BLOCK.LAVA);
                             chunk.setMetadata(x, y, z, 8); // Source
                         } else {
                             chunk.setBlock(x, y, z, BLOCK.AIR);
                         }
                     }
                }
            }
        }

        const key = this.getChunkKey(cx, cz);
        this.chunks.set(key, chunk);

        if (this.pendingBlocks.has(key)) {
            const pending = this.pendingBlocks.get(key);
            for (const b of pending) {
                chunk.setBlock(b.x, b.y, b.z, b.type);
            }
            this.pendingBlocks.delete(key);
        }
    }

    generateOverworldChunk(cx, cz) {
        if (this.chunks.has(this.getChunkKey(cx, cz))) return;

        const chunk = new Chunk(cx, cz);
        const baseX = cx * this.chunkSize;
        const baseZ = cz * this.chunkSize;

        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                const worldX = baseX + x;
                const worldZ = baseZ + z;

                const biome = this.biomeManager.getBiome(worldX, worldZ);
                const heightOffset = biome.heightOffset || 0;

                // Terrain Height Noise
                const scale = 0.03;
                const noise = window.perlin.noise(worldX * scale, worldZ * scale, this.seed);
                // Detail noise
                const detail = window.perlin.noise(worldX * 0.1, worldZ * 0.1, this.seed) * 2;

                let height = Math.floor(20 + heightOffset + noise * 10 + detail);

                // River Generation
                // Use a different scale and offset for rivers
                const riverNoise = window.perlin.noise(worldX * 0.005, worldZ * 0.005, this.seed + 100);
                let isRiver = false;
                if (Math.abs(riverNoise) < 0.06) {
                    isRiver = true;
                    // Clamp height for riverbed (below water level 16)
                    if (height > 12) height = 12;
                }

                // Bedrock
                chunk.setBlock(x, 0, z, BLOCK.BEDROCK);

                // Underground
                for (let y = 1; y < height; y++) {
                    // Cave generation (3D noise)
                    const caveNoise = window.perlin.noise(worldX * 0.05, y * 0.05, worldZ * 0.05);
                    if (caveNoise > 0.4) {
                        chunk.setBlock(x, y, z, BLOCK.AIR);
                    } else {
                        // Ores
                        if (Math.random() < 0.01) chunk.setBlock(x, y, z, BLOCK.ORE_COAL);
                        else if (y < 20 && Math.random() < 0.005) chunk.setBlock(x, y, z, BLOCK.ORE_IRON);
                        else if (y < 10 && Math.random() < 0.002) chunk.setBlock(x, y, z, BLOCK.ORE_DIAMOND);
                        else chunk.setBlock(x, y, z, BLOCK.STONE);
                    }
                }

                // Surface
                if (height < this.worldHeight) {
                    let topBlock = biome.topBlock || BLOCK.GRASS;
                    let underBlock = biome.underBlock || BLOCK.DIRT;

                    if (height < 18) { // Beach/Water level
                         if (biome.name !== 'Ocean') {
                             topBlock = BLOCK.SAND;
                             underBlock = BLOCK.SAND;
                         }
                    }

                    chunk.setBlock(x, height, z, topBlock);
                    for (let d = 1; d <= 3; d++) {
                        if (height - d > 0) {
                             if (chunk.getBlock(x, height-d, z) === BLOCK.STONE) {
                                chunk.setBlock(x, height - d, z, underBlock);
                             }
                        }
                    }
                }

                // Water
                for (let y = height + 1; y <= 16; y++) {
                    if (biome.snow && y >= 16) {
                        chunk.setBlock(x, y, z, BLOCK.ICE);
                    } else {
                        chunk.setBlock(x, y, z, BLOCK.WATER);
                        chunk.setMetadata(x, y, z, 8); // Source block
                    }
                }

                // Structures
                if (height > 18) {
                    if (biome.treeChance && Math.random() < biome.treeChance) {
                        let type = 'oak';
                        if (biome.snow) type = 'spruce';
                        else if (biome.name === 'Jungle') type = 'jungle';
                        else if (biome.name === 'Forest' && Math.random() < 0.2) type = 'birch';

                        this.structureManager.generateTree(chunk, x, height + 1, z, type);
                    }
                    if (biome.cactusChance && Math.random() < biome.cactusChance) {
                        this.structureManager.generateCactus(chunk, x, height + 1, z);
                    }

                    // Village Check
                    let spawnedVillage = false;
                    if (biome.name === 'Plains') {
                         if (Math.abs(chunk.cx % 10) === 0 && Math.abs(chunk.cz % 10) === 0) {
                             if (x === 8 && z === 8) { // Center of chunk
                                 this.structureManager.generateVillage(chunk, x, height+1, z);
                                 spawnedVillage = true;
                             }
                         }
                    }

                    if (!spawnedVillage && biome.structureChance && Math.random() < biome.structureChance) {
                         // Random structure
                         const r = Math.random();
                         if (r < 0.5) this.structureManager.generateStructure(chunk, x, height+1, z, 'well');
                         else this.structureManager.generateStructure(chunk, x, height+1, z, 'house');
                    }
                }
            }
        }

        const key = this.getChunkKey(cx, cz);
        this.chunks.set(key, chunk);

        // Apply pending blocks
        if (this.pendingBlocks.has(key)) {
            const pending = this.pendingBlocks.get(key);
            for (const b of pending) {
                chunk.setBlock(b.x, b.y, b.z, b.type);
            }
            this.pendingBlocks.delete(key);
        }
    }

    saveWorld(slotName = 'default') {
        // Limit number of chunks to save to avoid quota limit
        // We only really need to save chunks that might have been modified?
        // Or just save all current chunks. 16KB * 20 = 320KB. Safe.
        // We'll filter out chunks too far away to keep it small.

        const chunksData = [];
// Optimized conversion
        const toBinaryString = (bytes) => {
            const CHUNK_SIZE = 8192;
            let binary = '';
            for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
                binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK_SIZE));
            }
            return binary;
        };

        this.chunks.forEach((chunk) => {
             const packed = chunk.pack();

             chunksData.push({
                 cx: chunk.cx,
                 cz: chunk.cz,
                 blocks: btoa(toBinaryString(packed.blocks)),
                 metadata: btoa(toBinaryString(packed.metadata))
             });
        });

        const blockEntitiesData = {};
        for (const [key, value] of this.blockEntities) {
            blockEntitiesData[key] = value;
        }

        const data = {
            seed: this.seed,
            chunks: chunksData,
            blockEntities: blockEntitiesData
        };

        if (this.game && this.game.player) {
            const p = this.game.player;
            data.player = {
                x: p.x, y: p.y, z: p.z,
                yaw: p.yaw, pitch: p.pitch,
                health: p.health, hunger: p.hunger,
                xp: p.xp, level: p.level,
                inventory: p.inventory,
                unlockedRecipes: Array.from(p.unlockedRecipes)
            };
        }

        try {
            localStorage.setItem('voxelWorldSave_' + slotName, JSON.stringify(data));
            console.log("World saved to slot:", slotName, chunksData.length, "chunks");
            // Also notify user
            if (window.game) window.game.chat?.addMessage("World Saved!");
            alert("World Saved: " + slotName);
        } catch(e) {
            console.error("Save failed", e);
            alert("Save failed (Quota exceeded?)");
        }
    }

    loadWorld(slotName = 'default') {
        const dataStr = localStorage.getItem('voxelWorldSave_' + slotName);
        if (dataStr) {
            try {
                const data = JSON.parse(dataStr);
                this.seed = data.seed;
                this.chunks.clear();

                if (data.chunks) {
                    data.chunks.forEach(cData => {
                        const chunk = new Chunk(cData.cx, cData.cz);

                        const fromBase64 = (str) => {
                            const binary = atob(str);
                            const bytes = new Uint8Array(binary.length);
                            for(let i=0; i<binary.length; i++) {
                                bytes[i] = binary.charCodeAt(i);
                            }
                            return bytes;
                        };

                        chunk.unpack({
                            blocks: fromBase64(cData.blocks),
                            metadata: cData.metadata ? fromBase64(cData.metadata) : null
                        });

                        chunk.modified = true; // Force visual update
                        this.chunks.set(this.getChunkKey(cData.cx, cData.cz), chunk);
                    });
                }

                if (data.blockEntities) {
                    this.blockEntities = new Map(Object.entries(data.blockEntities));
                }

                if (data.player && this.game && this.game.player) {
                    const p = this.game.player;
                    const dp = data.player;
                    p.x = dp.x; p.y = dp.y; p.z = dp.z;
                    p.yaw = dp.yaw; p.pitch = dp.pitch;
                    p.health = dp.health; p.hunger = dp.hunger;
                    p.xp = dp.xp; p.level = dp.level;
                    if (dp.inventory) p.inventory = dp.inventory;
                    if (dp.unlockedRecipes) p.unlockedRecipes = new Set(dp.unlockedRecipes);

                    if (this.game.updateHealthUI) this.game.updateHealthUI();
                    if (this.game.updateHotbarUI) this.game.updateHotbarUI();
                }

                console.log("World loaded from slot:", slotName);
                alert("World Loaded: " + slotName);
            } catch(e) {
                console.error("Load failed", e);
                alert("Load Failed");
            }
        } else {
            alert("No save found for slot: " + slotName);
        }
    }
}

window.World = World;
