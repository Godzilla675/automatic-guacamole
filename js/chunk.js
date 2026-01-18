class Chunk {
    constructor(cx, cz) {
        this.cx = cx;
        this.cz = cz;
        this.size = 16;
        this.height = 32;
        // Flattened array for blocks: x + z*size + y*size*size
        // Or simple 3D map. For JS, object map is slow.
        // Let's use a Map for sparse storage or Uint8Array for dense.
        // Uint8Array is much better for memory. 16*16*64 = 16384 bytes per chunk.
        // Let's assume max height 64.
        this.maxHeight = 64;
        this.blocks = new Uint8Array(this.size * this.size * this.maxHeight);
        this.modified = true; // Start modified to trigger update
        this.visibleBlocks = []; // Cache of visible blocks
    }

    getIndex(x, y, z) {
        return x + z * this.size + y * this.size * this.size;
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= this.size || z < 0 || z >= this.size || y < 0 || y >= this.maxHeight) {
            return BLOCK.AIR; // Air
        }
        return this.blocks[this.getIndex(x, y, z)];
    }

    setBlock(x, y, z, type) {
        if (x < 0 || x >= this.size || z < 0 || z >= this.size || y < 0 || y >= this.maxHeight) {
            return;
        }
        this.blocks[this.getIndex(x, y, z)] = type;
        this.modified = true;
    }

    updateVisibleBlocks() {
        if (!this.modified) return;
        this.visibleBlocks = [];

        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                for (let y = 0; y < this.maxHeight; y++) {
                    const type = this.getBlock(x, y, z);
                    if (type === BLOCK.AIR) continue;

                    // Check neighbors (simple check within chunk, ignores chunk borders for simplicity for now)
                    // For perfect culling, we need world context, but chunk-local is a good start.
                    // We check if ANY face is exposed.
                    if (this.isExposed(x, y, z)) {
                        this.visibleBlocks.push({ x, y, z, type });
                    }
                }
            }
        }
        this.modified = false;
    }

    isExposed(x, y, z) {
        // Check 6 directions
        if (this.getBlock(x+1, y, z) === BLOCK.AIR) return true;
        if (this.getBlock(x-1, y, z) === BLOCK.AIR) return true;
        if (this.getBlock(x, y+1, z) === BLOCK.AIR) return true;
        if (this.getBlock(x, y-1, z) === BLOCK.AIR) return true;
        if (this.getBlock(x, y, z+1) === BLOCK.AIR) return true;
        if (this.getBlock(x, y, z-1) === BLOCK.AIR) return true;
        return false;
    }
}

window.Chunk = Chunk;
