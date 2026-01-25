class StructureManager {
    constructor(world) {
        this.world = world;
    }

    generateTree(chunk, x, y, z, type = 'oak') {
        const wx = chunk.cx * 16 + x;
        const wz = chunk.cz * 16 + z;

        if (type === 'cactus') {
             this.generateCactus(chunk, x, y, z);
             return;
        }

        let trunk = BLOCK.WOOD;
        let leaves = BLOCK.LEAVES;
        let height = 4 + Math.floor(Math.random() * 3);

        if (type === 'spruce') {
            height = 6 + Math.floor(Math.random() * 4);
            // We can use same blocks for now as we don't have SPRUCE_WOOD
        }

        // Trunk
        for (let i = 0; i < height; i++) {
            this.world.setBlock(wx, y + i, wz, trunk);
        }

        // Leaves
        for (let lx = -2; lx <= 2; lx++) {
            for (let lz = -2; lz <= 2; lz++) {
                for (let ly = height - 2; ly <= height + 1; ly++) {
                     // Check dist
                     if (Math.abs(lx) + Math.abs(lz) + (ly - (height-2)) < 4) {
                         if (this.world.getBlock(wx+lx, y+ly, wz+lz) === BLOCK.AIR) {
                             this.world.setBlock(wx+lx, y+ly, wz+lz, leaves);
                         }
                     }
                }
            }
        }
    }

    generateCactus(chunk, x, y, z) {
        const wx = chunk.cx * 16 + x;
        const wz = chunk.cz * 16 + z;
        const h = 2 + Math.floor(Math.random() * 2);
        for(let i=0; i<h; i++) {
            this.world.setBlock(wx, y+i, wz, BLOCK.CACTUS);
        }
    }

    generateStructure(chunk, x, y, z, structureName) {
        if (structureName === 'well') this.generateWell(chunk, x, y, z);
    }

    generateWell(chunk, x, y, z) {
        const wx = chunk.cx * 16 + x;
        const wz = chunk.cz * 16 + z;

        // Simple Well: 3x3 Cobblestone base, water in middle
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                this.world.setBlock(wx + dx, y, wz + dz, BLOCK.COBBLESTONE);
                // Pillars
                if ((Math.abs(dx) === 1 && Math.abs(dz) === 1)) {
                    this.world.setBlock(wx+dx, y+1, wz+dz, BLOCK.WOOD);
                    this.world.setBlock(wx+dx, y+2, wz+dz, BLOCK.WOOD);
                }
            }
        }
        // Roof
        for (let dx = -1; dx <= 1; dx++) {
             for (let dz = -1; dz <= 1; dz++) {
                 this.world.setBlock(wx+dx, y+3, wz+dz, BLOCK.COBBLESTONE);
             }
        }

        // Water
        this.world.setBlock(wx, y, wz, BLOCK.WATER);
        this.world.setBlock(wx, y-1, wz, BLOCK.WATER);
        this.world.setBlock(wx, y-2, wz, BLOCK.WATER);
        this.world.setBlock(wx, y-3, wz, BLOCK.COBBLESTONE); // Bottom
    }
}

window.StructureManager = StructureManager;
