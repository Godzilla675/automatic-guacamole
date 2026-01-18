// Block definitions

const BLOCK = {
    AIR: 0, // Using 0 as AIR/NULL in logic, but standard blocks start at 1 usually.
            // In original game.js: 0=dirt, 1=stone... null=air.
            // Let's standardize: null/undefined is Air.
            // We'll use IDs compatible with old save if possible, or mapping.
            // Old: 0:dirt, 1:stone, 2:grass, 3:wood, 4:leaves, 5:sand, 6:water, 7:glass

    DIRT: 0,
    STONE: 1,
    GRASS: 2,
    WOOD: 3,
    LEAVES: 4,
    SAND: 5,
    WATER: 6,
    GLASS: 7,
    // New blocks
    BRICK: 8,
    PLANK: 9,
    COBBLESTONE: 10,
    BEDROCK: 11,
    ORE_COAL: 12,
    ORE_IRON: 13,
    ORE_GOLD: 14,
    ORE_DIAMOND: 15,
    CACTUS: 16
};

const BLOCKS = {
    [BLOCK.DIRT]: { name: 'dirt', color: '#8B4513', top: '#A0522D', solid: true },
    [BLOCK.STONE]: { name: 'stone', color: '#808080', top: '#909090', solid: true },
    [BLOCK.GRASS]: { name: 'grass', color: '#228B22', top: '#32CD32', solid: true },
    [BLOCK.WOOD]: { name: 'wood', color: '#5C4033', top: '#5C4033', solid: true }, // Adjusted wood color
    [BLOCK.LEAVES]: { name: 'leaves', color: '#90EE90', top: '#98FB98', solid: true, transparent: true },
    [BLOCK.SAND]: { name: 'sand', color: '#F4A460', top: '#FFE4B5', solid: true },
    [BLOCK.WATER]: { name: 'water', color: '#4169E1', top: '#6495ED', solid: false, transparent: true, liquid: true },
    [BLOCK.GLASS]: { name: 'glass', color: '#ADD8E6', top: '#B0E0E6', solid: true, transparent: true },

    // New Blocks
    [BLOCK.BRICK]: { name: 'brick', color: '#8B0000', top: '#A52A2A', solid: true },
    [BLOCK.PLANK]: { name: 'plank', color: '#DEB887', top: '#DEB887', solid: true },
    [BLOCK.COBBLESTONE]: { name: 'cobblestone', color: '#696969', top: '#696969', solid: true },
    [BLOCK.BEDROCK]: { name: 'bedrock', color: '#000000', top: '#000000', solid: true },

    // Ores
    [BLOCK.ORE_COAL]: { name: 'coal_ore', color: '#808080', top: '#2F4F4F', solid: true }, // Stone with dark spots
    [BLOCK.ORE_IRON]: { name: 'iron_ore', color: '#808080', top: '#D2B48C', solid: true },
    [BLOCK.ORE_GOLD]: { name: 'gold_ore', color: '#808080', top: '#FFD700', solid: true },
    [BLOCK.ORE_DIAMOND]: { name: 'diamond_ore', color: '#808080', top: '#00FFFF', solid: true },

    [BLOCK.CACTUS]: { name: 'cactus', color: '#2E8B57', top: '#2E8B57', solid: true }
};

window.BLOCK = BLOCK;
window.BLOCKS = BLOCKS;
