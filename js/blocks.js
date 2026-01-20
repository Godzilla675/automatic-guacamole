// Block definitions

const BLOCK = {
    AIR: 0,

    DIRT: 1,
    STONE: 2,
    GRASS: 3,
    WOOD: 4,
    LEAVES: 5,
    SAND: 6,
    WATER: 7,
    GLASS: 8,
    // New blocks
    BRICK: 9,
    PLANK: 10,
    COBBLESTONE: 11,
    BEDROCK: 12,
    ORE_COAL: 13,
    ORE_IRON: 14,
    ORE_GOLD: 15,
    ORE_DIAMOND: 16,
    CACTUS: 17,
    // Tools/Items (IDs start at 100 to avoid conflict with blocks)
    PICKAXE_WOOD: 100,
    PICKAXE_STONE: 101,
    PICKAXE_IRON: 102,
    PICKAXE_DIAMOND: 103,
    AXE_WOOD: 108,
    AXE_STONE: 109,
    AXE_IRON: 110,
    AXE_DIAMOND: 111,
    SHOVEL_WOOD: 112,
    SHOVEL_STONE: 113,
    SHOVEL_IRON: 114,
    SHOVEL_DIAMOND: 115,
    SWORD_WOOD: 104,
    SWORD_STONE: 105,
    SWORD_IRON: 106,
    SWORD_DIAMOND: 107,

    // Mob Drops
    ITEM_ROTTEN_FLESH: 200,
    ITEM_BONE: 201,
    ITEM_STRING: 202,
    ITEM_PORKCHOP: 203,
    ITEM_LEATHER: 204
};

const TOOLS = {
    [BLOCK.PICKAXE_WOOD]: { type: 'pickaxe', speed: 2, damage: 2, durability: 60 },
    [BLOCK.PICKAXE_STONE]: { type: 'pickaxe', speed: 4, damage: 3, durability: 132 },
    [BLOCK.PICKAXE_IRON]: { type: 'pickaxe', speed: 6, damage: 4, durability: 250 },
    [BLOCK.PICKAXE_DIAMOND]: { type: 'pickaxe', speed: 8, damage: 5, durability: 1561 },

    [BLOCK.AXE_WOOD]: { type: 'axe', speed: 2, damage: 3, durability: 60 },
    [BLOCK.AXE_STONE]: { type: 'axe', speed: 4, damage: 4, durability: 132 },
    [BLOCK.AXE_IRON]: { type: 'axe', speed: 6, damage: 5, durability: 250 },
    [BLOCK.AXE_DIAMOND]: { type: 'axe', speed: 8, damage: 6, durability: 1561 },

    [BLOCK.SHOVEL_WOOD]: { type: 'shovel', speed: 2, damage: 1, durability: 60 },
    [BLOCK.SHOVEL_STONE]: { type: 'shovel', speed: 4, damage: 2, durability: 132 },
    [BLOCK.SHOVEL_IRON]: { type: 'shovel', speed: 6, damage: 3, durability: 250 },
    [BLOCK.SHOVEL_DIAMOND]: { type: 'shovel', speed: 8, damage: 4, durability: 1561 },

    [BLOCK.SWORD_WOOD]: { type: 'sword', speed: 1.5, damage: 4, durability: 60 },
    [BLOCK.SWORD_STONE]: { type: 'sword', speed: 1.5, damage: 5, durability: 132 },
    [BLOCK.SWORD_IRON]: { type: 'sword', speed: 1.5, damage: 6, durability: 250 },
    [BLOCK.SWORD_DIAMOND]: { type: 'sword', speed: 1.5, damage: 7, durability: 1561 }
};

const BLOCKS = {
    [BLOCK.DIRT]: { name: 'dirt', color: '#8B4513', top: '#A0522D', solid: true, icon: '🟫', hardness: 0.5, tool: 'shovel' },
    [BLOCK.STONE]: { name: 'stone', color: '#808080', top: '#909090', solid: true, icon: '🔲', hardness: 1.5, tool: 'pickaxe' },
    [BLOCK.GRASS]: { name: 'grass', color: '#228B22', top: '#32CD32', solid: true, icon: '🟩', hardness: 0.6, tool: 'shovel' },
    [BLOCK.WOOD]: { name: 'wood', color: '#5C4033', top: '#5C4033', solid: true, icon: '🪵', hardness: 2.0, tool: 'axe' },
    [BLOCK.LEAVES]: { name: 'leaves', color: '#90EE90', top: '#98FB98', solid: true, transparent: true, icon: '🌿', hardness: 0.2 },
    [BLOCK.SAND]: { name: 'sand', color: '#F4A460', top: '#FFE4B5', solid: true, icon: '🏖️', hardness: 0.5, tool: 'shovel' },
    [BLOCK.WATER]: { name: 'water', color: '#4169E1', top: '#6495ED', solid: false, transparent: true, liquid: true, icon: '💧', hardness: 100 },
    [BLOCK.GLASS]: { name: 'glass', color: '#ADD8E6', top: '#B0E0E6', solid: true, transparent: true, icon: '🔷', hardness: 0.3 },

    // New Blocks
    [BLOCK.BRICK]: { name: 'brick', color: '#8B0000', top: '#A52A2A', solid: true, icon: '🧱', hardness: 2.0, tool: 'pickaxe' },
    [BLOCK.PLANK]: { name: 'plank', color: '#DEB887', top: '#DEB887', solid: true, icon: '🪵', hardness: 1.5, tool: 'axe' },
    [BLOCK.COBBLESTONE]: { name: 'cobblestone', color: '#696969', top: '#696969', solid: true, icon: '🪨', hardness: 2.0, tool: 'pickaxe' },
    [BLOCK.BEDROCK]: { name: 'bedrock', color: '#000000', top: '#000000', solid: true, icon: '⬛', hardness: -1 }, // Unbreakable

    // Ores
    [BLOCK.ORE_COAL]: { name: 'coal_ore', color: '#808080', top: '#2F4F4F', solid: true, icon: '⚫', hardness: 3.0, tool: 'pickaxe' },
    [BLOCK.ORE_IRON]: { name: 'iron_ore', color: '#808080', top: '#D2B48C', solid: true, icon: '⚪', hardness: 3.0, tool: 'pickaxe' },
    [BLOCK.ORE_GOLD]: { name: 'gold_ore', color: '#808080', top: '#FFD700', solid: true, icon: '🟡', hardness: 3.0, tool: 'pickaxe' },
    [BLOCK.ORE_DIAMOND]: { name: 'diamond_ore', color: '#808080', top: '#00FFFF', solid: true, icon: '💎', hardness: 3.0, tool: 'pickaxe' },

    [BLOCK.CACTUS]: { name: 'cactus', color: '#2E8B57', top: '#2E8B57', solid: true, icon: '🌵', hardness: 0.4 },

    // Tools Visuals (Simplified)
    [BLOCK.PICKAXE_WOOD]: { name: 'Wood Pickaxe', color: '#8B4513', solid: false, isItem: true, icon: '⛏️' },
    [BLOCK.PICKAXE_STONE]: { name: 'Stone Pickaxe', color: '#808080', solid: false, isItem: true, icon: '⛏️' },
    [BLOCK.PICKAXE_IRON]: { name: 'Iron Pickaxe', color: '#C0C0C0', solid: false, isItem: true, icon: '⛏️' },
    [BLOCK.PICKAXE_DIAMOND]: { name: 'Diamond Pickaxe', color: '#00FFFF', solid: false, isItem: true, icon: '⛏️' },

    [BLOCK.AXE_WOOD]: { name: 'Wood Axe', color: '#8B4513', solid: false, isItem: true, icon: '🪓' },
    [BLOCK.AXE_STONE]: { name: 'Stone Axe', color: '#808080', solid: false, isItem: true, icon: '🪓' },
    [BLOCK.AXE_IRON]: { name: 'Iron Axe', color: '#C0C0C0', solid: false, isItem: true, icon: '🪓' },
    [BLOCK.AXE_DIAMOND]: { name: 'Diamond Axe', color: '#00FFFF', solid: false, isItem: true, icon: '🪓' },

    [BLOCK.SHOVEL_WOOD]: { name: 'Wood Shovel', color: '#8B4513', solid: false, isItem: true, icon: '🥄' },
    [BLOCK.SHOVEL_STONE]: { name: 'Stone Shovel', color: '#808080', solid: false, isItem: true, icon: '🥄' },
    [BLOCK.SHOVEL_IRON]: { name: 'Iron Shovel', color: '#C0C0C0', solid: false, isItem: true, icon: '🥄' },
    [BLOCK.SHOVEL_DIAMOND]: { name: 'Diamond Shovel', color: '#00FFFF', solid: false, isItem: true, icon: '🥄' },

    [BLOCK.SWORD_WOOD]: { name: 'Wood Sword', color: '#8B4513', solid: false, isItem: true, icon: '⚔️' },
    [BLOCK.SWORD_STONE]: { name: 'Stone Sword', color: '#808080', solid: false, isItem: true, icon: '⚔️' },
    [BLOCK.SWORD_IRON]: { name: 'Iron Sword', color: '#C0C0C0', solid: false, isItem: true, icon: '⚔️' },
    [BLOCK.SWORD_DIAMOND]: { name: 'Diamond Sword', color: '#00FFFF', solid: false, isItem: true, icon: '⚔️' },

    // Mob Drop Items
    [BLOCK.ITEM_ROTTEN_FLESH]: { name: 'Rotten Flesh', color: '#6B8E23', solid: false, isItem: true, icon: '🧟' },
    [BLOCK.ITEM_BONE]: { name: 'Bone', color: '#F0F0F0', solid: false, isItem: true, icon: '🦴' },
    [BLOCK.ITEM_STRING]: { name: 'String', color: '#FFFFFF', solid: false, isItem: true, icon: '🕸️' },
    [BLOCK.ITEM_PORKCHOP]: { name: 'Porkchop', color: '#FFB6C1', solid: false, isItem: true, icon: '🥩' },
    [BLOCK.ITEM_LEATHER]: { name: 'Leather', color: '#8B4513', solid: false, isItem: true, icon: '🟫' }
};

window.BLOCK = BLOCK;
window.BLOCKS = BLOCKS;
window.TOOLS = TOOLS;
