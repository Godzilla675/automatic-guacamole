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
        if (type === 'birch') {
            trunk = BLOCK.BIRCH_WOOD;
            leaves = BLOCK.BIRCH_LEAVES;
        }
        if (type === 'jungle') {
            this.generateJungleTree(chunk, x, y, z);
            return;
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
        if (structureName === 'house') this.generateHouse(chunk, x, y, z);
        if (structureName === 'path') this.generatePath(chunk, x, y, z);
        if (structureName === 'village') this.generateVillage(chunk, x, y, z);
    }

    generateJungleTree(chunk, x, y, z) {
        const wx = chunk.cx * 16 + x;
        const wz = chunk.cz * 16 + z;
        const height = 12 + Math.floor(Math.random() * 8);

        // 2x2 Trunk
        for(let i=0; i<height; i++) {
             this.world.setBlock(wx, y+i, wz, BLOCK.JUNGLE_WOOD);
             this.world.setBlock(wx+1, y+i, wz, BLOCK.JUNGLE_WOOD);
             this.world.setBlock(wx, y+i, wz+1, BLOCK.JUNGLE_WOOD);
             this.world.setBlock(wx+1, y+i, wz+1, BLOCK.JUNGLE_WOOD);

             // Cocoa
             if (i > 3 && i < height - 3 && Math.random() < 0.2) {
                 if (Math.random() < 0.25) this.world.setBlock(wx-1, y+i, wz, BLOCK.COCOA_BLOCK);
                 else if (Math.random() < 0.5) this.world.setBlock(wx+2, y+i, wz, BLOCK.COCOA_BLOCK);
                 else if (Math.random() < 0.75) this.world.setBlock(wx, y+i, wz-1, BLOCK.COCOA_BLOCK);
                 else this.world.setBlock(wx, y+i, wz+2, BLOCK.COCOA_BLOCK);
             }
        }

        // Leaves (Canopy)
        for (let lx = -2; lx <= 3; lx++) {
            for (let lz = -2; lz <= 3; lz++) {
                 this.world.setBlock(wx+lx, y+height, wz+lz, BLOCK.JUNGLE_LEAVES);
                 if (Math.abs(lx) <= 1 && Math.abs(lz) <= 1) {
                      this.world.setBlock(wx+lx, y+height+1, wz+lz, BLOCK.JUNGLE_LEAVES);
                 }
            }
        }
    }

    generateVillage(chunk, x, y, z) {
        // Center Well
        this.generateWell(chunk, x, y, z);

        // Houses around
        this.generateHouse(chunk, x+8, y, z);
        this.generateHouse(chunk, x-8, y, z);
        this.generateHouse(chunk, x, y, z+8);
        this.generateHouse(chunk, x, y, z-8);

        // Paths connecting
        for(let i=1; i<8; i++) {
            this.world.setBlock(chunk.cx*16+x+i, y, chunk.cz*16+z, BLOCK.SANDSTONE);
            this.world.setBlock(chunk.cx*16+x-i, y, chunk.cz*16+z, BLOCK.SANDSTONE);
            this.world.setBlock(chunk.cx*16+x, y, chunk.cz*16+z+i, BLOCK.SANDSTONE);
            this.world.setBlock(chunk.cx*16+x, y, chunk.cz*16+z-i, BLOCK.SANDSTONE);
        }

        // Spawn Villager if possible
        if (window.Mob && this.world.game) {
             const v = new window.Mob(this.world.game, chunk.cx*16+x+2, y+1, chunk.cz*16+z+2, window.MOB_TYPE.VILLAGER);
             this.world.game.mobs.push(v);
        }
    }

    generateHouse(chunk, x, y, z) {
        const wx = chunk.cx * 16 + x;
        const wz = chunk.cz * 16 + z;

        // 5x5 Wooden House with Cobblestone floor
        const width = 5;
        const depth = 5;
        const height = 4;

        for (let dx = 0; dx < width; dx++) {
            for (let dz = 0; dz < depth; dz++) {
                for (let dy = 0; dy < height; dy++) {
                     const isWall = dx === 0 || dx === width-1 || dz === 0 || dz === depth-1;
                     const isFloor = dy === 0;
                     const isRoof = dy === height-1;

                     let block = BLOCK.AIR;

                     if (isFloor) block = BLOCK.COBBLESTONE;
                     else if (isWall) {
                         // Windows
                         if (dy === 2 && (dx === 2 || dz === 2) && !(dx===2 && dz===0)) { // Avoid door side
                             block = BLOCK.GLASS_PANE;
                         } else {
                             block = BLOCK.PLANK;
                         }
                     }
                     else if (isRoof) block = BLOCK.WOOD;

                     if (block !== BLOCK.AIR) {
                         this.world.setBlock(wx+dx, y+dy, wz+dz, block);
                     } else if (dy > 0 && dy < height-1) {
                         // Clear inside
                         this.world.setBlock(wx+dx, y+dy, wz+dz, BLOCK.AIR);
                     }
                }
            }
        }

        // Door (Front Center, facing Z-)
        this.world.setBlock(wx + 2, y + 1, wz, BLOCK.DOOR_WOOD_BOTTOM);
        this.world.setBlock(wx + 2, y + 2, wz, BLOCK.DOOR_WOOD_TOP);

        // Torch inside
        this.world.setBlock(wx + 2, y + 2, wz + 2, BLOCK.TORCH);
    }

    generatePath(chunk, x, y, z) {
        const wx = chunk.cx * 16 + x;
        const wz = chunk.cz * 16 + z;
        // Simple 3x1 path segment
        for(let dx=-1; dx<=1; dx++) {
            this.world.setBlock(wx+dx, y, wz, BLOCK.SAND); // Path block
        }
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
