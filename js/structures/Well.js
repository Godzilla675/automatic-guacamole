class WellStructure {
    constructor() {}

    generate(world, chunk, x, y, z) {
        const wx = chunk.cx * 16 + x;
        const wz = chunk.cz * 16 + z;

        // Simple Well: 3x3 Cobblestone base, water in middle
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                world.setBlock(wx + dx, y, wz + dz, BLOCK.COBBLESTONE);
                // Pillars
                if ((Math.abs(dx) === 1 && Math.abs(dz) === 1)) {
                    world.setBlock(wx+dx, y+1, wz+dz, BLOCK.WOOD);
                    world.setBlock(wx+dx, y+2, wz+dz, BLOCK.WOOD);
                }
            }
        }
        // Roof
        for (let dx = -1; dx <= 1; dx++) {
             for (let dz = -1; dz <= 1; dz++) {
                 world.setBlock(wx+dx, y+3, wz+dz, BLOCK.COBBLESTONE);
             }
        }

        // Water
        world.setBlock(wx, y, wz, BLOCK.WATER);
        world.setBlock(wx, y-1, wz, BLOCK.WATER);
        world.setBlock(wx, y-2, wz, BLOCK.WATER);
        world.setBlock(wx, y-3, wz, BLOCK.COBBLESTONE); // Bottom
    }
}

window.WellStructure = WellStructure;
