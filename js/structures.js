class StructureManager {
    constructor(world) {
        this.world = world;

        // Initialize strategies
        this.strategies = {
            'tree': new window.TreeStructure(world),
            'cactus': new window.CactusStructure(world),
            'well': new window.WellStructure(world)
        };
    }

    generateTree(chunk, x, y, z, type = 'oak') {
        if (type === 'cactus') {
             this.strategies['cactus'].generate(chunk, x, y, z);
             return;
        }
        this.strategies['tree'].generate(chunk, x, y, z, type);
    }

    generateCactus(chunk, x, y, z) {
        this.strategies['cactus'].generate(chunk, x, y, z);
    }

    generateStructure(chunk, x, y, z, structureName) {
        if (structureName === 'well') {
            this.generateWell(chunk, x, y, z);
        } else if (this.strategies[structureName]) {
            this.strategies[structureName].generate(chunk, x, y, z);
        }
    }

    generateWell(chunk, x, y, z) {
        this.strategies['well'].generate(chunk, x, y, z);
    }
}

window.StructureManager = StructureManager;
