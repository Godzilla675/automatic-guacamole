class World {
    constructor() {
        this.chunks = new Map();
        this.chunkSize = 16;
        this.renderDistance = 6;
        this.worldHeight = 64;
        this.seed = Math.random() * 10000;
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

    setBlock(x, y, z, type) {
        const cx = Math.floor(x / this.chunkSize);
        const cz = Math.floor(z / this.chunkSize);
        const lx = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const lz = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;

        let chunk = this.getChunk(cx, cz);
        if (!chunk) {
            // If setting a block in non-existent chunk, usually we ignore or generate
            // But if player places it, we might need to create it?
            // Better to only allow placement in loaded chunks.
            return;
        }
        chunk.setBlock(lx, y, lz, type);

        // Update neighbors if on edge to ensure culling is updated
        if (lx === 0) { const c = this.getChunk(cx - 1, cz); if (c) c.modified = true; }
        if (lx === this.chunkSize - 1) { const c = this.getChunk(cx + 1, cz); if (c) c.modified = true; }
        if (lz === 0) { const c = this.getChunk(cx, cz - 1); if (c) c.modified = true; }
        if (lz === this.chunkSize - 1) { const c = this.getChunk(cx, cz + 1); if (c) c.modified = true; }
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

                // Terrain Height Noise
                const scale = 0.03;
                const noise = window.perlin.noise(worldX * scale, worldZ * scale, this.seed);
                // Detail noise
                const detail = window.perlin.noise(worldX * 0.1, worldZ * 0.1, this.seed) * 2;

                const height = Math.floor(20 + noise * 10 + detail);

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
                    let topBlock = BLOCK.GRASS;
                    let underBlock = BLOCK.DIRT;

                    if (height < 18) { // Beach/Water level
                         topBlock = BLOCK.SAND;
                         underBlock = BLOCK.SAND;
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
                    chunk.setBlock(x, y, z, BLOCK.WATER);
                }

                // Trees
                if (height > 18 && Math.random() < 0.02) {
                    this.generateTree(chunk, x, height + 1, z);
                }
                // Cactus
                if (height < 18 && height > 16 && Math.random() < 0.01) {
                     chunk.setBlock(x, height+1, z, BLOCK.CACTUS);
                     chunk.setBlock(x, height+2, z, BLOCK.CACTUS);
                }
            }
        }

        this.chunks.set(this.getChunkKey(cx, cz), chunk);
    }

    generateTree(chunk, x, y, z) {
        // Simple tree within chunk bounds (simplified for now)
        // If tree crosses chunk boundary, it might be cut off.
        // Proper solution requires multi-pass generation or checking neighbors.
        // We will just draw safely inside.
        if (x < 2 || x > 13 || z < 2 || z > 13) return;

        for (let i = 0; i < 4; i++) {
            chunk.setBlock(x, y + i, z, BLOCK.WOOD);
        }
        for (let lx = -2; lx <= 2; lx++) {
            for (let lz = -2; lz <= 2; lz++) {
                for (let ly = 2; ly <= 4; ly++) {
                     if (Math.abs(lx) + Math.abs(lz) + (ly-2) < 4) {
                         if (chunk.getBlock(x+lx, y+ly, z+lz) === BLOCK.AIR) {
                             chunk.setBlock(x+lx, y+ly, z+lz, BLOCK.LEAVES);
                         }
                     }
                }
            }
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
             // Using reduce to avoid stack overflow with spread
             let binary = '';
             const len = chunk.blocks.byteLength;
             for (let i = 0; i < len; i++) {
                 binary += String.fromCharCode(chunk.blocks[i]);
             }
             const base64 = btoa(binary);

             chunksData.push({
                 cx: chunk.cx,
                 cz: chunk.cz,
                 blocks: base64
             });
        });

        const data = {
            seed: this.seed,
            chunks: chunksData
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
                        chunk.modified = true; // Force visual update
                        this.chunks.set(this.getChunkKey(cData.cx, cData.cz), chunk);
                    });
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
