class StructureManager {
    constructor(world) {
        this.world = world;
        this.treeStructure = new TreeStructure();
        this.cactusStructure = new CactusStructure();
        this.wellStructure = new WellStructure();
    }

    generateTree(chunk, x, y, z, type = 'oak') {
        if (type === 'cactus') {
             this.cactusStructure.generate(this.world, chunk, x, y, z);
             return;
        }
        this.treeStructure.generate(this.world, chunk, x, y, z, type);
    }

    generateCactus(chunk, x, y, z) {
        this.cactusStructure.generate(this.world, chunk, x, y, z);
    }

    generateStructure(chunk, x, y, z, structureName) {
        if (structureName === 'well') this.generateWell(chunk, x, y, z);
    }

    generateWell(chunk, x, y, z) {
        this.wellStructure.generate(this.world, chunk, x, y, z);
    }
}

window.StructureManager = StructureManager;
