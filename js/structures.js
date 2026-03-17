class StructureManager {
    constructor(world) {
        this.world = world;
    }

    generateTree(chunk, x, y, z, type = 'oak', sync = false) {
        const wx = chunk.cx * 16 + x;
        const wz = chunk.cz * 16 + z;

        if (type === 'cactus') {
             this.generateCactus(chunk, x, y, z, sync);
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
            this.generateJungleTree(chunk, x, y, z, sync);
            return;
        }

        // Trunk
        for (let i = 0; i < height; i++) {
            this.world.setBlock(wx, y + i, wz, trunk);
            if (sync && this.world.game && this.world.game.network) this.world.game.network.sendBlockUpdate(wx, y + i, wz, trunk);
        }

        // Leaves
        for (let lx = -2; lx <= 2; lx++) {
            for (let lz = -2; lz <= 2; lz++) {
                for (let ly = height - 2; ly <= height + 1; ly++) {
                     // Check dist
                     if (Math.abs(lx) + Math.abs(lz) + (ly - (height-2)) < 4) {
                         if (this.world.getBlock(wx+lx, y+ly, wz+lz) === BLOCK.AIR) {
                             this.world.setBlock(wx+lx, y+ly, wz+lz, leaves);
                             if (sync && this.world.game && this.world.game.network) this.world.game.network.sendBlockUpdate(wx+lx, y+ly, wz+lz, leaves);
                         }
                     }
                }
            }
        }
    }

    generateCactus(chunk, x, y, z, sync = false) {
        const wx = chunk.cx * 16 + x;
        const wz = chunk.cz * 16 + z;
        const h = 2 + Math.floor(Math.random() * 2);
        for(let i=0; i<h; i++) {
            this.world.setBlock(wx, y+i, wz, BLOCK.CACTUS);
            if (sync && this.world.game && this.world.game.network) this.world.game.network.sendBlockUpdate(wx, y+i, wz, BLOCK.CACTUS);
        }
    }

    generateStructure(chunk, x, y, z, structureName) {
        if (!this.world.villageManager) {
            if (window.VillageManager) {
                this.world.villageManager = new window.VillageManager(this.world);
            }
        }

        if (this.world.villageManager) {
            if (structureName === 'well') this.world.villageManager.generateWell(chunk, x, y, z);
            if (structureName === 'house') this.world.villageManager.generateHouse(chunk, x, y, z);
            if (structureName === 'path') this.world.villageManager.generatePath(chunk, x, y, z);
            if (structureName === 'village') this.world.villageManager.generateVillage(chunk, x, y, z);
        }
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

}

window.StructureManager = StructureManager;
