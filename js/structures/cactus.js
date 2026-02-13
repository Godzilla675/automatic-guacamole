class CactusStructure extends Structure {
    generate(chunk, x, y, z, sync = false) {
        const wx = chunk.cx * 16 + x;
        const wz = chunk.cz * 16 + z;
        const h = 2 + Math.floor(Math.random() * 2);
        for(let i=0; i<h; i++) {
            this.world.setBlock(wx, y+i, wz, window.BLOCK.CACTUS);
            if (sync && this.world.game && this.world.game.network) {
                this.world.game.network.sendBlockUpdate(wx, y+i, wz, window.BLOCK.CACTUS);
            }
        }
    }
}

window.CactusStructure = CactusStructure;
