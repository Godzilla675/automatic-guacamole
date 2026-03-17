class VillageManager {
    constructor(world) {
        this.world = world;
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

window.VillageManager = VillageManager;