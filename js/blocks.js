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
    CACTUS: 16,
    // Tools/Items (IDs start at 100 to avoid conflict with blocks)
    PICKAXE_WOOD: 100,
    PICKAXE_STONE: 101,
    PICKAXE_IRON: 102,
    PICKAXE_DIAMOND: 103,
    SWORD_WOOD: 104,
    SWORD_STONE: 105,
    SWORD_IRON: 106,
    SWORD_DIAMOND: 107
};

const TOOLS = {
    [BLOCK.PICKAXE_WOOD]: { type: 'pickaxe', speed: 2, damage: 2, durability: 60 },
    [BLOCK.PICKAXE_STONE]: { type: 'pickaxe', speed: 4, damage: 3, durability: 132 },
    [BLOCK.PICKAXE_IRON]: { type: 'pickaxe', speed: 6, damage: 4, durability: 250 },
    [BLOCK.PICKAXE_DIAMOND]: { type: 'pickaxe', speed: 8, damage: 5, durability: 1561 },
    [BLOCK.SWORD_WOOD]: { type: 'sword', speed: 1.5, damage: 4, durability: 60 },
    [BLOCK.SWORD_STONE]: { type: 'sword', speed: 1.5, damage: 5, durability: 132 },
    [BLOCK.SWORD_IRON]: { type: 'sword', speed: 1.5, damage: 6, durability: 250 },
    [BLOCK.SWORD_DIAMOND]: { type: 'sword', speed: 1.5, damage: 7, durability: 1561 }
};

const BLOCKS = {
    [BLOCK.DIRT]: { name: 'dirt', color: '#8B4513', top: '#A0522D', solid: true, icon: '🟫' },
    [BLOCK.STONE]: { name: 'stone', color: '#808080', top: '#909090', solid: true, icon: '🔲' },
    [BLOCK.GRASS]: { name: 'grass', color: '#228B22', top: '#32CD32', solid: true, icon: '🟩' },
    [BLOCK.WOOD]: { name: 'wood', color: '#5C4033', top: '#5C4033', solid: true, icon: '🪵' }, // Adjusted wood color
    [BLOCK.LEAVES]: { name: 'leaves', color: '#90EE90', top: '#98FB98', solid: true, transparent: true, icon: '🌿' },
    [BLOCK.SAND]: { name: 'sand', color: '#F4A460', top: '#FFE4B5', solid: true, icon: '🏖️' },
    [BLOCK.WATER]: { name: 'water', color: '#4169E1', top: '#6495ED', solid: false, transparent: true, liquid: true, icon: '💧' },
    [BLOCK.GLASS]: { name: 'glass', color: '#ADD8E6', top: '#B0E0E6', solid: true, transparent: true, icon: '🔷' },

    // New Blocks
    [BLOCK.BRICK]: { name: 'brick', color: '#8B0000', top: '#A52A2A', solid: true, icon: '🧱' },
    [BLOCK.PLANK]: { name: 'plank', color: '#DEB887', top: '#DEB887', solid: true, icon: '🪵' },
    [BLOCK.COBBLESTONE]: { name: 'cobblestone', color: '#696969', top: '#696969', solid: true, icon: '🪨' },
    [BLOCK.BEDROCK]: { name: 'bedrock', color: '#000000', top: '#000000', solid: true, icon: '⬛' },

    // Ores
    [BLOCK.ORE_COAL]: { name: 'coal_ore', color: '#808080', top: '#2F4F4F', solid: true, icon: '⚫' }, // Stone with dark spots
    [BLOCK.ORE_IRON]: { name: 'iron_ore', color: '#808080', top: '#D2B48C', solid: true, icon: '⚪' },
    [BLOCK.ORE_GOLD]: { name: 'gold_ore', color: '#808080', top: '#FFD700', solid: true, icon: '🟡' },
    [BLOCK.ORE_DIAMOND]: { name: 'diamond_ore', color: '#808080', top: '#00FFFF', solid: true, icon: '💎' },

    [BLOCK.CACTUS]: { name: 'cactus', color: '#2E8B57', top: '#2E8B57', solid: true, icon: '🌵' },

    // Tools Visuals (Simplified)
    [BLOCK.PICKAXE_WOOD]: { name: 'Wood Pickaxe', color: '#8B4513', solid: false, isItem: true, icon: '⛏️' },
    [BLOCK.PICKAXE_STONE]: { name: 'Stone Pickaxe', color: '#808080', solid: false, isItem: true, icon: '⛏️' },
    [BLOCK.PICKAXE_IRON]: { name: 'Iron Pickaxe', color: '#C0C0C0', solid: false, isItem: true, icon: '⛏️' },
    [BLOCK.PICKAXE_DIAMOND]: { name: 'Diamond Pickaxe', color: '#00FFFF', solid: false, isItem: true, icon: '⛏️' },
    [BLOCK.SWORD_WOOD]: { name: 'Wood Sword', color: '#8B4513', solid: false, isItem: true, icon: '⚔️' },
    [BLOCK.SWORD_STONE]: { name: 'Stone Sword', color: '#808080', solid: false, isItem: true, icon: '⚔️' },
    [BLOCK.SWORD_IRON]: { name: 'Iron Sword', color: '#C0C0C0', solid: false, isItem: true, icon: '⚔️' },
    [BLOCK.SWORD_DIAMOND]: { name: 'Diamond Sword', color: '#00FFFF', solid: false, isItem: true, icon: '⚔️' }
};

window.BLOCK = BLOCK;
window.BLOCKS = BLOCKS;
window.TOOLS = TOOLS;
