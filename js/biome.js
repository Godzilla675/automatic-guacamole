class BiomeManager {
    constructor(seed) {
        this.seed = seed || Math.random();
        this.biomes = {
            OCEAN: { name: 'Ocean', topBlock: BLOCK.SAND, underBlock: BLOCK.SAND, heightOffset: -10, treeChance: 0 },
            BEACH: { name: 'Beach', topBlock: BLOCK.SAND, underBlock: BLOCK.SAND, heightOffset: -2, treeChance: 0.005, cactusChance: 0 },
            PLAINS: { name: 'Plains', topBlock: BLOCK.GRASS, underBlock: BLOCK.DIRT, heightOffset: 0, treeChance: 0.002, structureChance: 0.005 },
            FOREST: { name: 'Forest', topBlock: BLOCK.GRASS, underBlock: BLOCK.DIRT, heightOffset: 2, treeChance: 0.05 },
            DESERT: { name: 'Desert', topBlock: BLOCK.SAND, underBlock: BLOCK.SAND, heightOffset: 1, treeChance: 0, cactusChance: 0.02 },
            SNOW: { name: 'Snow', topBlock: BLOCK.SNOW, underBlock: BLOCK.DIRT, heightOffset: 5, treeChance: 0.02, snow: true }
        };
    }

    getBiome(x, z) {
        const scale = 0.005;
        const temp = window.perlin.noise(x * scale, z * scale, this.seed);
        const humidity = window.perlin.noise(x * scale + 1000, z * scale + 1000, this.seed);

        if (temp > 0.5) {
            if (humidity < 0) return this.biomes.DESERT;
            return this.biomes.FOREST;
        } else if (temp < -0.3) {
            return this.biomes.SNOW;
        } else {
            if (humidity > 0.2) return this.biomes.FOREST;
            return this.biomes.PLAINS;
        }
    }
}

window.BiomeManager = BiomeManager;
