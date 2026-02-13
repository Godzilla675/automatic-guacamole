class CactusStructure {
    constructor() {}

    generate(world, chunk, x, y, z, sync = false) {
        const wx = chunk.cx * 16 + x;
        const wz = chunk.cz * 16 + z;
        const h = 2 + Math.floor(Math.random() * 2);
        for(let i=0; i<h; i++) {
            world.setBlock(wx, y+i, wz, BLOCK.CACTUS);
            if (sync && world.game && world.game.network) world.game.network.sendBlockUpdate(wx, y+i, wz, BLOCK.CACTUS);
        }
    }
}

window.CactusStructure = CactusStructure;
