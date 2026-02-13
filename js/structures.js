class StructureManager {
    constructor(world) {
        this.world = world;
        this.treeStructure = new TreeStructure();
        this.cactusStructure = new CactusStructure();
        this.wellStructure = new WellStructure();
    }

    generateTree(chunk, x, y, z, type = 'oak', sync = false) {
        if (type === 'cactus') {
             this.cactusStructure.generate(this.world, chunk, x, y, z, sync);
             return;
        }
        if (type === 'jungle') {
            this.generateJungleTree(chunk, x, y, z, sync);
            return;
        }
        this.treeStructure.generate(this.world, chunk, x, y, z, type, sync);
    }

    generateCactus(chunk, x, y, z, sync = false) {
        this.cactusStructure.generate(this.world, chunk, x, y, z, sync);
    }

    generateStructure(chunk, x, y, z, structureName) {
        if (structureName === 'well') this.generateWell(chunk, x, y, z);
        if (structureName === 'house') this.generateHouse(chunk, x, y, z);
        if (structureName === 'path') this.generatePath(chunk, x, y, z);
        if (structureName === 'village') this.generateVillage(chunk, x, y, z);
    }

    generateWell(chunk, x, y, z) {
        this.wellStructure.generate(this.world, chunk, x, y, z);
    }

    generateJungleTree(chunk, x, y, z, sync = false) {
        const wx = chunk.cx * 16 + x;
        const wz = chunk.cz * 16 + z;
        const height = 12 + Math.floor(Math.random() * 8);

        // 2x2 Trunk
        for(let i=0; i<height; i++) {
             this.world.setBlock(wx, y+i, wz, BLOCK.JUNGLE_WOOD);
             this.world.setBlock(wx+1, y+i, wz, BLOCK.JUNGLE_WOOD);
             this.world.setBlock(wx, y+i, wz+1, BLOCK.JUNGLE_WOOD);
             this.world.setBlock(wx+1, y+i, wz+1, BLOCK.JUNGLE_WOOD);

             if (sync && this.world.game && this.world.game.network) {
                 this.world.game.network.sendBlockUpdate(wx, y+i, wz, BLOCK.JUNGLE_WOOD);
                 this.world.game.network.sendBlockUpdate(wx+1, y+i, wz, BLOCK.JUNGLE_WOOD);
                 this.world.game.network.sendBlockUpdate(wx, y+i, wz+1, BLOCK.JUNGLE_WOOD);
                 this.world.game.network.sendBlockUpdate(wx+1, y+i, wz+1, BLOCK.JUNGLE_WOOD);
             }

             // Cocoa
             if (i > 3 && i < height - 3 && Math.random() < 0.2) {
                 let cx = 0, cz = 0;
                 if (Math.random() < 0.25) { cx=wx-1; cz=wz; }
                 else if (Math.random() < 0.5) { cx=wx+2; cz=wz; }
                 else if (Math.random() < 0.75) { cx=wx; cz=wz-1; }
                 else { cx=wx; cz=wz+2; }

                 this.world.setBlock(cx, y+i, cz, BLOCK.COCOA_BLOCK);
                 if (sync && this.world.game && this.world.game.network) this.world.game.network.sendBlockUpdate(cx, y+i, cz, BLOCK.COCOA_BLOCK);
             }
        }

        // Leaves (Canopy)
        for (let lx = -2; lx <= 3; lx++) {
            for (let lz = -2; lz <= 3; lz++) {
                 this.world.setBlock(wx+lx, y+height, wz+lz, BLOCK.JUNGLE_LEAVES);
                 if (sync && this.world.game && this.world.game.network) this.world.game.network.sendBlockUpdate(wx+lx, y+height, wz+lz, BLOCK.JUNGLE_LEAVES);

                 if (Math.abs(lx) <= 1 && Math.abs(lz) <= 1) {
                      this.world.setBlock(wx+lx, y+height+1, wz+lz, BLOCK.JUNGLE_LEAVES);
                      if (sync && this.world.game && this.world.game.network) this.world.game.network.sendBlockUpdate(wx+lx, y+height+1, wz+lz, BLOCK.JUNGLE_LEAVES);
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
}

window.StructureManager = StructureManager;
