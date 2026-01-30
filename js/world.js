class World {
    constructor() {
        this.chunks = new Map();
        this.pendingBlocks = new Map();
        this.blockEntities = new Map(); // Store complex data like Furnace state { "x,y,z": { ... } }
        this.chunkSize = 16;
        this.renderDistance = 6;
        this.worldHeight = 64;
        this.seed = Math.random() * 10000;

        this.biomeManager = new window.BiomeManager(this.seed);
        this.structureManager = new window.StructureManager(this);

        this.activeFluids = new Set();
        this.fluidTickTimer = 0;
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

                const height = Math.floor(20 + heightOffset + noise * 10 + detail);

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
                        this.structureManager.generateTree(chunk, x, height + 1, z, type);
                    }
                    if (biome.cactusChance && Math.random() < biome.cactusChance) {
                        this.structureManager.generateCactus(chunk, x, height + 1, z);
                    }
                    if (biome.structureChance && Math.random() < biome.structureChance) {
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
        this.chunks.forEach((chunk) => {
             // Convert Uint8Array to base64
             let binary = '';
             let metaBinary = '';
             const len = chunk.blocks.byteLength;
             for (let i = 0; i < len; i++) {
                 binary += String.fromCharCode(chunk.blocks[i]);
                 metaBinary += String.fromCharCode(chunk.metadata[i]);
             }
             const base64 = btoa(binary);
             const metaBase64 = btoa(metaBinary);

             chunksData.push({
                 cx: chunk.cx,
                 cz: chunk.cz,
                 blocks: base64,
                 metadata: metaBase64
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

                        const binary = atob(cData.blocks);
                        const len = binary.length;
                        for (let i = 0; i < len; i++) {
                            chunk.blocks[i] = binary.charCodeAt(i);
                        }

                        if (cData.metadata) {
                             const metaBinary = atob(cData.metadata);
                             const metaLen = metaBinary.length;
                             for (let i = 0; i < metaLen; i++) {
                                 chunk.metadata[i] = metaBinary.charCodeAt(i);
                             }
                        }

                        chunk.modified = true; // Force visual update
                        this.chunks.set(this.getChunkKey(cData.cx, cData.cz), chunk);
                    });
                }

                if (data.blockEntities) {
                    this.blockEntities = new Map(Object.entries(data.blockEntities));
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
