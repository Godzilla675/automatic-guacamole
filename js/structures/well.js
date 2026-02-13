(function() {
    const Structure = window.Structure;
    
    class WellStructure extends Structure {
        generate(chunk, x, y, z) {
            const wx = chunk.cx * 16 + x;
            const wz = chunk.cz * 16 + z;
            const BLOCK = window.BLOCK;

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

    window.WellStructure = WellStructure;
})();
