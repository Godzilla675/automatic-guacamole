class TreeStructure extends Structure {
    generate(chunk, x, y, z, type = 'oak') {
        const wx = chunk.cx * 16 + x;
        const wz = chunk.cz * 16 + z;

        let trunk = window.BLOCK.WOOD;
        let leaves = window.BLOCK.LEAVES;
        let height = 4 + Math.floor(Math.random() * 3);

        if (type === 'spruce') {
            height = 6 + Math.floor(Math.random() * 4);
            trunk = window.BLOCK.SPRUCE_WOOD;
            leaves = window.BLOCK.SPRUCE_LEAVES;
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
                         if (this.world.getBlock(wx+lx, y+ly, wz+lz) === window.BLOCK.AIR) {
                             this.world.setBlock(wx+lx, y+ly, wz+lz, leaves);
                         }
                     }
                }
            }
        }
    }
}

window.TreeStructure = TreeStructure;
