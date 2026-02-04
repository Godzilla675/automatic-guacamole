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
        this.maxHeight = 128;
        this.blocks = new Uint8Array(this.size * this.size * this.maxHeight);
        this.metadata = new Uint8Array(this.size * this.size * this.maxHeight);
        this.light = new Uint8Array(this.size * this.size * this.maxHeight);
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

    getMetadata(x, y, z) {
        if (x < 0 || x >= this.size || z < 0 || z >= this.size || y < 0 || y >= this.maxHeight) {
            return 0;
        }
        return this.metadata[this.getIndex(x, y, z)];
    }

    getLight(x, y, z) {
        if (x < 0 || x >= this.size || z < 0 || z >= this.size || y < 0 || y >= this.maxHeight) {
            return 15; // Sunlight default for out of bounds/air for now? Or 0?
            // If it's daytime, outside is bright.
        }
        return this.light[this.getIndex(x, y, z)];
    }

    setBlock(x, y, z, type) {
        if (x < 0 || x >= this.size || z < 0 || z >= this.size || y < 0 || y >= this.maxHeight) {
            return;
        }
        this.blocks[this.getIndex(x, y, z)] = type;
        this.metadata[this.getIndex(x, y, z)] = 0; // Reset metadata on block change
        this.modified = true;
    }

    setMetadata(x, y, z, val) {
        if (x < 0 || x >= this.size || z < 0 || z >= this.size || y < 0 || y >= this.maxHeight) {
            return;
        }
        this.metadata[this.getIndex(x, y, z)] = val;
        this.modified = true; // Metadata change might affect visuals
    }

    setLight(x, y, z, val) {
        if (x < 0 || x >= this.size || z < 0 || z >= this.size || y < 0 || y >= this.maxHeight) {
            return;
        }
        this.light[this.getIndex(x, y, z)] = val;
        // Light changes don't necessarily need a full mesh rebuild if we pass light via attributes,
        // but for this simple engine we draw immediately in render(), so we don't need to flag 'modified' for geometry,
        // but we might want to flag it if we were baking light into vertices.
        // For now, render() reads light dynamically? No, that's too slow to read from chunk every frame for every block.
        // Actually, render() iterates visible blocks.
    }

    updateVisibleBlocks(world) {
        if (!this.modified) return;
        this.visibleBlocks = [];

        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                for (let y = 0; y < this.maxHeight; y++) {
                    const type = this.getBlock(x, y, z);
                    if (type === BLOCK.AIR) continue;

                    // Check neighbors
                    // We check if ANY face is exposed.
                    if (this.isExposed(x, y, z, world)) {
                        this.visibleBlocks.push({ x, y, z, type });
                    }
                }
            }
        }
        this.modified = false;
    }

    isExposed(x, y, z, world) {
        const isTransparent = (bx, by, bz) => {
            let type;
            // Check bounds for local access
            if (bx >= 0 && bx < this.size && bz >= 0 && bz < this.size && by >= 0 && by < this.maxHeight) {
                type = this.getBlock(bx, by, bz);
            } else if (world) {
                // Neighbor is outside chunk, check world
                const wx = this.cx * this.size + bx;
                const wz = this.cz * this.size + bz;
                const wy = by;
                type = world.getBlock(wx, wy, wz);
            } else {
                // If no world context provided and out of bounds, default to exposed (safe)
                return true;
            }

            if (type === BLOCK.AIR) return true;
            // Check specific transparent blocks (leaves, water, glass)
            if (window.BLOCKS && window.BLOCKS[type] && window.BLOCKS[type].transparent) return true;
            return false;
        };

        if (isTransparent(x+1, y, z)) return true;
        if (isTransparent(x-1, y, z)) return true;
        if (isTransparent(x, y+1, z)) return true;
        if (isTransparent(x, y-1, z)) return true;
        if (isTransparent(x, y, z+1)) return true;
        if (isTransparent(x, y, z-1)) return true;
        return false;
    }

    pack() {
        const runLengthEncode = (data) => {
            const result = [];
            let i = 0;
            while (i < data.length) {
                let count = 1;
                let val = data[i];
                while (i + count < data.length && data[i + count] === val && count < 255) {
                    count++;
                }
                result.push(count);
                result.push(val);
                i += count;
            }
            return new Uint8Array(result);
        };

        const packedBlocks = runLengthEncode(this.blocks);
        const packedMeta = runLengthEncode(this.metadata);

        return {
             blocks: packedBlocks,
             metadata: packedMeta
        };
    }

    unpack(data) {
        const runLengthDecode = (packed, target) => {
            let targetIdx = 0;
            for(let i=0; i<packed.length; i+=2) {
                const count = packed[i];
                const val = packed[i+1];
                for(let j=0; j<count; j++) {
                     if (targetIdx < target.length) {
                         target[targetIdx++] = val;
                     }
                }
            }
        };

        if (data.blocks) runLengthDecode(data.blocks, this.blocks);
        if (data.metadata) runLengthDecode(data.metadata, this.metadata);

        this.modified = true;
    }
}

window.Chunk = Chunk;
