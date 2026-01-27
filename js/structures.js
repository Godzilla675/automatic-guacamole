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
            trunk = BLOCK.SPRUCE_WOOD;
            leaves = BLOCK.SPRUCE_LEAVES;
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
        else if (structureName === 'village') this.generateVillage(chunk, x, y, z);
    }

    generateVillage(chunk, x, y, z) {
        // Simple Village: Well in center, 2 Houses
        this.generateWell(chunk, x, y, z);

        // House 1
        this.generateHouse(chunk, x - 7, y, z);

        // House 2
        this.generateHouse(chunk, x + 7, y, z);
    }

    generateHouse(chunk, x, y, z) {
        const wx = chunk.cx * 16 + x;
        const wz = chunk.cz * 16 + z;

        // 5x5 House
        // Floor
        for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
                this.world.setBlock(wx + i, y, wz + j, BLOCK.COBBLESTONE);
            }
        }

        // Walls
        for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
                if (Math.abs(i) === 2 || Math.abs(j) === 2) {
                    this.world.setBlock(wx + i, y + 1, wz + j, BLOCK.PLANK);
                    this.world.setBlock(wx + i, y + 2, wz + j, BLOCK.PLANK);
                    this.world.setBlock(wx + i, y + 3, wz + j, BLOCK.PLANK);
                } else {
                    this.world.setBlock(wx + i, y + 1, wz + j, BLOCK.AIR);
                    this.world.setBlock(wx + i, y + 2, wz + j, BLOCK.AIR);
                    this.world.setBlock(wx + i, y + 3, wz + j, BLOCK.AIR);
                }
            }
        }

        // Door (Front: Z+2)
        this.world.setBlock(wx, y + 1, wz + 2, BLOCK.DOOR_WOOD_BOTTOM);
        this.world.setBlock(wx, y + 2, wz + 2, BLOCK.DOOR_WOOD_TOP);

        // Windows (Sides: X-2, X+2)
        this.world.setBlock(wx - 2, y + 2, wz, BLOCK.GLASS_PANE);
        this.world.setBlock(wx + 2, y + 2, wz, BLOCK.GLASS_PANE);

        // Roof (Pyramid Planks/Wood)
        // Level 4 (Full cover)
        for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
                this.world.setBlock(wx + i, y + 4, wz + j, BLOCK.WOOD);
            }
        }
        // Level 5 (3x3)
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                this.world.setBlock(wx + i, y + 5, wz + j, BLOCK.WOOD);
            }
        }
        // Level 6 (1x1)
        this.world.setBlock(wx, y + 6, wz, BLOCK.WOOD);
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
