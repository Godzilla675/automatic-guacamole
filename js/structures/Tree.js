class TreeStructure {
    constructor() {}

    generate(world, chunk, x, y, z, type = 'oak') {
        const wx = chunk.cx * 16 + x;
        const wz = chunk.cz * 16 + z;

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
            world.setBlock(wx, y + i, wz, trunk);
        }

        // Leaves
        for (let lx = -2; lx <= 2; lx++) {
            for (let lz = -2; lz <= 2; lz++) {
                for (let ly = height - 2; ly <= height + 1; ly++) {
                     // Check dist
                     if (Math.abs(lx) + Math.abs(lz) + (ly - (height-2)) < 4) {
                         if (world.getBlock(wx+lx, y+ly, wz+lz) === BLOCK.AIR) {
                             world.setBlock(wx+lx, y+ly, wz+lz, leaves);
                         }
                     }
                }
            }
        }
    }
}

window.TreeStructure = TreeStructure;
