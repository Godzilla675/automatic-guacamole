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
    TORCH: 18,
    // New Features
    FURNACE: 20,
    HAY_BLOCK: 21,
    FARMLAND: 22,
    BED: 23,
    WHEAT: 24,
    CARROTS: 241, // Using high ID to avoid conflict? No, let's keep it close if possible, or just append
    POTATOES: 242,
    MELON_BLOCK: 243,
    PUMPKIN: 244,
    MELON_STEM: 245,
    PUMPKIN_STEM: 246,
    TNT: 247,

    // Biome Blocks
    SNOW: 25,
    ICE: 26,
    SPRUCE_WOOD: 27,
    SPRUCE_LEAVES: 28,

    // Concrete (30-45)
    CONCRETE_WHITE: 30,
    CONCRETE_ORANGE: 31,
    CONCRETE_MAGENTA: 32,
    CONCRETE_LIGHT_BLUE: 33,
    CONCRETE_YELLOW: 34,
    CONCRETE_LIME: 35,
    CONCRETE_PINK: 36,
    CONCRETE_GRAY: 37,
    CONCRETE_LIGHT_GRAY: 38,
    CONCRETE_CYAN: 39,
    CONCRETE_PURPLE: 40,
    CONCRETE_BLUE: 41,
    CONCRETE_BROWN: 42,
    CONCRETE_GREEN: 43,
    CONCRETE_RED: 44,
    CONCRETE_BLACK: 45,

    // Wool (50-65)
    WOOL_WHITE: 50,
    WOOL_ORANGE: 51,
    WOOL_MAGENTA: 52,
    WOOL_LIGHT_BLUE: 53,
    WOOL_YELLOW: 54,
    WOOL_LIME: 55,
    WOOL_PINK: 56,
    WOOL_GRAY: 57,
    WOOL_LIGHT_GRAY: 58,
    WOOL_CYAN: 59,
    WOOL_PURPLE: 60,
    WOOL_BLUE: 61,
    WOOL_BROWN: 62,
    WOOL_GREEN: 63,
    WOOL_RED: 64,
    WOOL_BLACK: 65,

    // Slabs
    SLAB_WOOD: 70,
    SLAB_STONE: 71,
    SLAB_COBBLESTONE: 72,

    // Doors
    DOOR_WOOD_BOTTOM: 73,
    DOOR_WOOD_TOP: 74,

    // Chest
    CHEST: 75,

    // Stairs
    STAIRS_WOOD: 80,
    STAIRS_COBBLESTONE: 81,

    // New Building Blocks
    FENCE: 90,
    FENCE_GATE: 91,
    TRAPDOOR: 92,
    GLASS_PANE: 93,

    // New Wood Types
    BIRCH_WOOD: 94,
    BIRCH_LEAVES: 95,
    BIRCH_PLANK: 96,
    JUNGLE_WOOD: 97,
    JUNGLE_LEAVES: 98,
    JUNGLE_PLANK: 99,

    COCOA_BLOCK: 150,
    SANDSTONE: 151,

    // Redstone
    REDSTONE_WIRE: 160,
    REDSTONE_TORCH: 161,
    REDSTONE_LAMP: 162,
    REDSTONE_LAMP_ACTIVE: 163,
    REDSTONE_TORCH_OFF: 164,

    // Saplings
    OAK_SAPLING: 170,
    BIRCH_SAPLING: 171,
    SPRUCE_SAPLING: 172,
    JUNGLE_SAPLING: 173,

    // Pistons
    PISTON: 180,
    PISTON_HEAD: 181,
    STICKY_PISTON: 182,
    STICKY_PISTON_HEAD: 183,

    // Nether Blocks
    NETHERRACK: 190,
    SOUL_SAND: 191,
    GLOWSTONE: 192,
    NETHER_BRICK: 193,
    QUARTZ_ORE: 194,
    OBSIDIAN: 195,
    PORTAL: 196,

    // Functional Blocks
    BREWING_STAND: 200,
    CAULDRON: 201,
    ENCHANTING_TABLE: 202,
    RAIL: 203,
    POWERED_RAIL: 204,
    DETECTOR_RAIL: 205,

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
    HOE_WOOD: 120,
    HOE_STONE: 121,
    HOE_IRON: 122,
    HOE_DIAMOND: 123,
    SWORD_WOOD: 104,
    SWORD_STONE: 105,
    SWORD_IRON: 106,
    SWORD_DIAMOND: 107,

    FISHING_ROD: 130,
    BOW: 140,
    SHIELD: 141,

    // Mob Drops
    ITEM_ROTTEN_FLESH: 200,
    ITEM_BONE: 201,
    ITEM_STRING: 202,
    ITEM_PORKCHOP: 203,
    ITEM_LEATHER: 204,
    ITEM_WOOL: 205, // Deprecated, use WOOL_WHITE
    ITEM_MUTTON: 206,

    // Crafting Items
    ITEM_STICK: 210,
    ITEM_COAL: 211,
    ITEM_IRON_INGOT: 212,
    ITEM_GOLD_INGOT: 213,
    ITEM_DIAMOND: 214,
    ITEM_APPLE: 215,
    ITEM_WHEAT_SEEDS: 220,
    ITEM_WHEAT: 221,
    ITEM_CARROT: 222,
    ITEM_POTATO: 223,
    ITEM_MELON_SEEDS: 224,
    ITEM_PUMPKIN_SEEDS: 225,
    ITEM_MELON_SLICE: 226,

    ITEM_RAW_FISH: 230,
    ITEM_ARROW: 240,

    // Mob Drops (New)
    ITEM_FEATHER: 260,
    ITEM_CHICKEN: 261, // Raw Chicken
    ITEM_GUNPOWDER: 262,
    ITEM_ENDER_PEARL: 263,

    // New Items
    ITEM_COCOA_BEANS: 250,
    ITEM_COOKED_FISH: 251,
    ITEM_EMERALD: 252,

    ITEM_REDSTONE_DUST: 300,

    // New Items
    ITEM_QUARTZ: 310,
    ITEM_BLAZE_ROD: 311,
    ITEM_GHAST_TEAR: 312,
    ITEM_NETHER_WART: 313,
    ITEM_GLOWSTONE_DUST: 314,
    ITEM_GLASS_BOTTLE: 315,
    ITEM_POTION: 316,
    ITEM_ENCHANTED_BOOK: 317,
    ITEM_LAPIS_LAZULI: 318,
    ITEM_MINECART: 320,
    ITEM_BOAT: 321,
    ITEM_SIGN: 322,
    ITEM_BUCKET: 323,
    ITEM_WATER_BUCKET: 324,
    ITEM_LAVA_BUCKET: 325
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

    [BLOCK.HOE_WOOD]: { type: 'hoe', speed: 2, damage: 1, durability: 60 },
    [BLOCK.HOE_STONE]: { type: 'hoe', speed: 4, damage: 1, durability: 132 },
    [BLOCK.HOE_IRON]: { type: 'hoe', speed: 6, damage: 1, durability: 250 },
    [BLOCK.HOE_DIAMOND]: { type: 'hoe', speed: 8, damage: 1, durability: 1561 },

    [BLOCK.SWORD_WOOD]: { type: 'sword', speed: 1.5, damage: 4, durability: 60 },
    [BLOCK.SWORD_STONE]: { type: 'sword', speed: 1.5, damage: 5, durability: 132 },
    [BLOCK.SWORD_IRON]: { type: 'sword', speed: 1.5, damage: 6, durability: 250 },
    [BLOCK.SWORD_DIAMOND]: { type: 'sword', speed: 1.5, damage: 7, durability: 1561 },

    [BLOCK.BOW]: { type: 'bow', speed: 1, damage: 4, durability: 384 },
    [BLOCK.SHIELD]: { type: 'shield', durability: 336 }
};

const BLOCKS = {
    [BLOCK.DIRT]: { name: 'dirt', color: '#8B4513', top: '#A0522D', solid: true, icon: '🟫', hardness: 0.5, tool: 'shovel' },
    [BLOCK.STONE]: { name: 'stone', color: '#808080', top: '#909090', solid: true, icon: '🔲', hardness: 1.5, tool: 'pickaxe', drop: { type: BLOCK.COBBLESTONE, count: 1 } },
    [BLOCK.GRASS]: { name: 'grass', color: '#228B22', top: '#32CD32', solid: true, icon: '🟩', hardness: 0.6, tool: 'shovel', drop: { type: BLOCK.DIRT, count: 1 } },
    [BLOCK.WOOD]: { name: 'wood', color: '#5C4033', top: '#5C4033', solid: true, icon: '🪵', hardness: 2.0, tool: 'axe' },
    [BLOCK.LEAVES]: { name: 'leaves', color: '#90EE90', top: '#98FB98', solid: true, transparent: true, icon: '🌿', hardness: 0.2, drop: { type: BLOCK.OAK_SAPLING, count: 1, chance: 0.05 } },
    [BLOCK.SAND]: { name: 'sand', color: '#F4A460', top: '#FFE4B5', solid: true, icon: '🏖️', hardness: 0.5, tool: 'shovel' },
    [BLOCK.WATER]: { name: 'water', color: '#4169E1', top: '#6495ED', solid: false, transparent: true, liquid: true, icon: '💧', hardness: 100 },
    [BLOCK.GLASS]: { name: 'glass', color: '#ADD8E6', top: '#B0E0E6', solid: true, transparent: true, icon: '🔷', hardness: 0.3, drop: null },

    // New Blocks
    [BLOCK.BRICK]: { name: 'brick', color: '#8B0000', top: '#A52A2A', solid: true, icon: '🧱', hardness: 2.0, tool: 'pickaxe' },
    [BLOCK.PLANK]: { name: 'plank', color: '#DEB887', top: '#DEB887', solid: true, icon: '🪵', hardness: 1.5, tool: 'axe' },
    [BLOCK.COBBLESTONE]: { name: 'cobblestone', color: '#696969', top: '#696969', solid: true, icon: '🪨', hardness: 2.0, tool: 'pickaxe' },
    [BLOCK.BEDROCK]: { name: 'bedrock', color: '#000000', top: '#000000', solid: true, icon: '⬛', hardness: -1, drop: null },

    // Ores
    [BLOCK.ORE_COAL]: { name: 'coal_ore', color: '#808080', top: '#2F4F4F', solid: true, icon: '⚫', hardness: 3.0, tool: 'pickaxe', drop: { type: BLOCK.ITEM_COAL, count: 1 } },
    [BLOCK.ORE_IRON]: { name: 'iron_ore', color: '#808080', top: '#D2B48C', solid: true, icon: '⚪', hardness: 3.0, tool: 'pickaxe' }, // Drops self (needs smelting)
    [BLOCK.ORE_GOLD]: { name: 'gold_ore', color: '#808080', top: '#FFD700', solid: true, icon: '🟡', hardness: 3.0, tool: 'pickaxe' }, // Drops self
    [BLOCK.ORE_DIAMOND]: { name: 'diamond_ore', color: '#808080', top: '#00FFFF', solid: true, icon: '💎', hardness: 3.0, tool: 'pickaxe', drop: { type: BLOCK.ITEM_DIAMOND, count: 1 } },

    [BLOCK.CACTUS]: { name: 'cactus', color: '#2E8B57', top: '#2E8B57', solid: true, icon: '🌵', hardness: 0.4 },
    [BLOCK.TORCH]: { name: 'torch', color: '#FFD700', top: '#FFA500', solid: false, transparent: true, icon: '🔥', hardness: 0.1, light: 15, drop: { type: BLOCK.TORCH, count: 1 } },

    // New Features Blocks
    [BLOCK.FURNACE]: { name: 'furnace', color: '#696969', top: '#505050', solid: true, icon: '🔥', hardness: 3.5, tool: 'pickaxe', drop: { type: BLOCK.FURNACE, count: 1 } },
    [BLOCK.HAY_BLOCK]: { name: 'hay_block', color: '#DAA520', top: '#FFD700', solid: true, icon: '🌾', hardness: 0.5, tool: 'hoe', drop: { type: BLOCK.ITEM_WHEAT, count: 9 } },
    [BLOCK.FARMLAND]: { name: 'farmland', color: '#3E2723', top: '#4E342E', solid: true, icon: '🌱', hardness: 0.6, tool: 'shovel', drop: { type: BLOCK.DIRT, count: 1 } },
    [BLOCK.BED]: { name: 'bed', color: '#8B0000', top: '#F0F0F0', solid: true, icon: '🛏️', hardness: 0.2, drop: { type: BLOCK.BED, count: 1 } },
    [BLOCK.WHEAT]: { name: 'wheat', color: '#DAA520', solid: false, transparent: true, icon: '🌾', hardness: 0.0, drop: { type: BLOCK.ITEM_WHEAT, count: 1 } }, // Drop handled specially for seeds

    [BLOCK.SNOW]: { name: 'snow', color: '#F0F0F0', top: '#FFFFFF', solid: true, icon: '❄️', hardness: 0.2 },
    [BLOCK.ICE]: { name: 'ice', color: '#A5F2F3', top: '#A5F2F3', solid: true, transparent: true, icon: '🧊', hardness: 0.5 },
    [BLOCK.SPRUCE_WOOD]: { name: 'Spruce Wood', color: '#3d2817', top: '#3d2817', solid: true, icon: '🪵', hardness: 2.0, tool: 'axe' },
    [BLOCK.SPRUCE_LEAVES]: { name: 'Spruce Leaves', color: '#2d4c2d', top: '#2d4c2d', solid: true, transparent: true, icon: '🌿', hardness: 0.2, drop: { type: BLOCK.SPRUCE_SAPLING, count: 1, chance: 0.05 } },

    // Concrete
    [BLOCK.CONCRETE_WHITE]: { name: 'White Concrete', color: '#FFFFFF', solid: true, icon: '⬜', hardness: 1.5, tool: 'pickaxe' },
    [BLOCK.CONCRETE_ORANGE]: { name: 'Orange Concrete', color: '#FFA500', solid: true, icon: '🟧', hardness: 1.5, tool: 'pickaxe' },
    [BLOCK.CONCRETE_MAGENTA]: { name: 'Magenta Concrete', color: '#FF00FF', solid: true, icon: '🟪', hardness: 1.5, tool: 'pickaxe' },
    [BLOCK.CONCRETE_LIGHT_BLUE]: { name: 'Light Blue Concrete', color: '#ADD8E6', solid: true, icon: '🟦', hardness: 1.5, tool: 'pickaxe' },
    [BLOCK.CONCRETE_YELLOW]: { name: 'Yellow Concrete', color: '#FFFF00', solid: true, icon: '🟨', hardness: 1.5, tool: 'pickaxe' },
    [BLOCK.CONCRETE_LIME]: { name: 'Lime Concrete', color: '#00FF00', solid: true, icon: '🟩', hardness: 1.5, tool: 'pickaxe' },
    [BLOCK.CONCRETE_PINK]: { name: 'Pink Concrete', color: '#FFC0CB', solid: true, icon: '🌸', hardness: 1.5, tool: 'pickaxe' },
    [BLOCK.CONCRETE_GRAY]: { name: 'Gray Concrete', color: '#808080', solid: true, icon: '⬛', hardness: 1.5, tool: 'pickaxe' },
    [BLOCK.CONCRETE_LIGHT_GRAY]: { name: 'Light Gray Concrete', color: '#D3D3D3', solid: true, icon: '⬜', hardness: 1.5, tool: 'pickaxe' },
    [BLOCK.CONCRETE_CYAN]: { name: 'Cyan Concrete', color: '#00FFFF', solid: true, icon: '🟦', hardness: 1.5, tool: 'pickaxe' },
    [BLOCK.CONCRETE_PURPLE]: { name: 'Purple Concrete', color: '#800080', solid: true, icon: '🟪', hardness: 1.5, tool: 'pickaxe' },
    [BLOCK.CONCRETE_BLUE]: { name: 'Blue Concrete', color: '#0000FF', solid: true, icon: '🟦', hardness: 1.5, tool: 'pickaxe' },
    [BLOCK.CONCRETE_BROWN]: { name: 'Brown Concrete', color: '#8B4513', solid: true, icon: '🟫', hardness: 1.5, tool: 'pickaxe' },
    [BLOCK.CONCRETE_GREEN]: { name: 'Green Concrete', color: '#008000', solid: true, icon: '🟩', hardness: 1.5, tool: 'pickaxe' },
    [BLOCK.CONCRETE_RED]: { name: 'Red Concrete', color: '#FF0000', solid: true, icon: '🟥', hardness: 1.5, tool: 'pickaxe' },
    [BLOCK.CONCRETE_BLACK]: { name: 'Black Concrete', color: '#000000', solid: true, icon: '⬛', hardness: 1.5, tool: 'pickaxe' },

    // Wool
    [BLOCK.WOOL_WHITE]: { name: 'White Wool', color: '#FFFFFF', solid: true, icon: '⬜', hardness: 0.8 },
    [BLOCK.WOOL_ORANGE]: { name: 'Orange Wool', color: '#FFA500', solid: true, icon: '🟧', hardness: 0.8 },
    [BLOCK.WOOL_MAGENTA]: { name: 'Magenta Wool', color: '#FF00FF', solid: true, icon: '🟪', hardness: 0.8 },
    [BLOCK.WOOL_LIGHT_BLUE]: { name: 'Light Blue Wool', color: '#ADD8E6', solid: true, icon: '🟦', hardness: 0.8 },
    [BLOCK.WOOL_YELLOW]: { name: 'Yellow Wool', color: '#FFFF00', solid: true, icon: '🟨', hardness: 0.8 },
    [BLOCK.WOOL_LIME]: { name: 'Lime Wool', color: '#00FF00', solid: true, icon: '🟩', hardness: 0.8 },
    [BLOCK.WOOL_PINK]: { name: 'Pink Wool', color: '#FFC0CB', solid: true, icon: '🌸', hardness: 0.8 },
    [BLOCK.WOOL_GRAY]: { name: 'Gray Wool', color: '#808080', solid: true, icon: '⬛', hardness: 0.8 },
    [BLOCK.WOOL_LIGHT_GRAY]: { name: 'Light Gray Wool', color: '#D3D3D3', solid: true, icon: '⬜', hardness: 0.8 },
    [BLOCK.WOOL_CYAN]: { name: 'Cyan Wool', color: '#00FFFF', solid: true, icon: '🟦', hardness: 0.8 },
    [BLOCK.WOOL_PURPLE]: { name: 'Purple Wool', color: '#800080', solid: true, icon: '🟪', hardness: 0.8 },
    [BLOCK.WOOL_BLUE]: { name: 'Blue Wool', color: '#0000FF', solid: true, icon: '🟦', hardness: 0.8 },
    [BLOCK.WOOL_BROWN]: { name: 'Brown Wool', color: '#8B4513', solid: true, icon: '🟫', hardness: 0.8 },
    [BLOCK.WOOL_GREEN]: { name: 'Green Wool', color: '#008000', solid: true, icon: '🟩', hardness: 0.8 },
    [BLOCK.WOOL_RED]: { name: 'Red Wool', color: '#FF0000', solid: true, icon: '🟥', hardness: 0.8 },
    [BLOCK.WOOL_BLACK]: { name: 'Black Wool', color: '#000000', solid: true, icon: '⬛', hardness: 0.8 },

    // Slabs
    [BLOCK.SLAB_WOOD]: { name: 'Wood Slab', color: '#5C4033', solid: true, icon: '🪵', hardness: 2.0, tool: 'axe', isSlab: true },
    [BLOCK.SLAB_STONE]: { name: 'Stone Slab', color: '#808080', solid: true, icon: '🔲', hardness: 1.5, tool: 'pickaxe', isSlab: true },
    [BLOCK.SLAB_COBBLESTONE]: { name: 'Cobblestone Slab', color: '#696969', solid: true, icon: '🪨', hardness: 2.0, tool: 'pickaxe', isSlab: true },

    // Doors
    [BLOCK.DOOR_WOOD_BOTTOM]: { name: 'Wood Door', color: '#8B4513', solid: true, icon: '🚪', hardness: 3.0, tool: 'axe', isDoor: true },
    [BLOCK.DOOR_WOOD_TOP]: { name: 'Wood Door', color: '#8B4513', solid: true, icon: '🚪', hardness: 3.0, tool: 'axe', isDoor: true },

    // Chest
    [BLOCK.CHEST]: { name: 'Chest', color: '#8B4513', top: '#A0522D', solid: true, icon: '📦', hardness: 2.5, tool: 'axe', drop: { type: BLOCK.CHEST, count: 1 } },

    // Stairs
    [BLOCK.STAIRS_WOOD]: { name: 'Wood Stairs', color: '#5C4033', solid: true, icon: '🪜', hardness: 2.0, tool: 'axe', isStair: true, transparent: true },
    [BLOCK.STAIRS_COBBLESTONE]: { name: 'Cobblestone Stairs', color: '#696969', solid: true, icon: '🪜', hardness: 2.0, tool: 'pickaxe', isStair: true, transparent: true },

    // New Building Blocks
    [BLOCK.FENCE]: { name: 'Fence', color: '#5C4033', solid: true, icon: 'fence', hardness: 2.0, tool: 'axe', isFence: true, transparent: true },
    [BLOCK.FENCE_GATE]: { name: 'Fence Gate', color: '#5C4033', solid: true, icon: 'gate', hardness: 2.0, tool: 'axe', isGate: true, transparent: true },
    [BLOCK.TRAPDOOR]: { name: 'Trapdoor', color: '#5C4033', solid: true, icon: '🚪', hardness: 3.0, tool: 'axe', isTrapdoor: true, transparent: true },
    [BLOCK.GLASS_PANE]: { name: 'Glass Pane', color: '#ADD8E6', solid: true, icon: 'window', hardness: 0.3, isPane: true, transparent: true, drop: null },

    // New Wood Types
    [BLOCK.BIRCH_WOOD]: { name: 'Birch Wood', color: '#e3dcd3', top: '#e3dcd3', solid: true, icon: '🪵', hardness: 2.0, tool: 'axe' },
    [BLOCK.BIRCH_LEAVES]: { name: 'Birch Leaves', color: '#80a755', top: '#80a755', solid: true, transparent: true, icon: '🌿', hardness: 0.2, drop: { type: BLOCK.BIRCH_SAPLING, count: 1, chance: 0.05 } },
    [BLOCK.BIRCH_PLANK]: { name: 'Birch Plank', color: '#c4b07d', top: '#c4b07d', solid: true, icon: '🪵', hardness: 1.5, tool: 'axe' },

    [BLOCK.JUNGLE_WOOD]: { name: 'Jungle Wood', color: '#56441d', top: '#56441d', solid: true, icon: '🪵', hardness: 2.0, tool: 'axe' },
    [BLOCK.JUNGLE_LEAVES]: { name: 'Jungle Leaves', color: '#30bb0b', top: '#30bb0b', solid: true, transparent: true, icon: '🌿', hardness: 0.2, drop: { type: BLOCK.JUNGLE_SAPLING, count: 1, chance: 0.05 } },
    [BLOCK.JUNGLE_PLANK]: { name: 'Jungle Plank', color: '#a07350', top: '#a07350', solid: true, icon: '🪵', hardness: 1.5, tool: 'axe' },

    [BLOCK.COCOA_BLOCK]: { name: 'Cocoa Pod', color: '#915325', solid: true, icon: '🌰', hardness: 0.2, drop: { type: BLOCK.ITEM_COCOA_BEANS, count: 2 } },
    [BLOCK.SANDSTONE]: { name: 'Sandstone', color: '#dbd3a0', top: '#dbd3a0', solid: true, icon: '🟫', hardness: 0.8, tool: 'pickaxe' },

    // Redstone Blocks
    [BLOCK.REDSTONE_WIRE]: { name: 'Redstone Wire', color: '#FF0000', solid: false, transparent: true, icon: '❤️', hardness: 0.0, isWire: true, drop: { type: BLOCK.ITEM_REDSTONE_DUST, count: 1 } },
    [BLOCK.REDSTONE_TORCH]: { name: 'Redstone Torch', color: '#FF0000', solid: false, transparent: true, icon: '📍', hardness: 0.0, light: 7, isTorch: true, drop: { type: BLOCK.REDSTONE_TORCH, count: 1 } },
    [BLOCK.REDSTONE_LAMP]: { name: 'Redstone Lamp', color: '#4A2B2B', solid: true, icon: '🔲', hardness: 0.3, tool: 'pickaxe' },
    [BLOCK.REDSTONE_LAMP_ACTIVE]: { name: 'Redstone Lamp', color: '#8B4513', top: '#FFD700', solid: true, icon: '💡', hardness: 0.3, light: 15, tool: 'pickaxe', drop: { type: BLOCK.REDSTONE_LAMP, count: 1 } },
    [BLOCK.REDSTONE_TORCH_OFF]: { name: 'Redstone Torch (Off)', color: '#550000', solid: false, transparent: true, icon: '📍', hardness: 0.0, isTorch: true, drop: { type: BLOCK.REDSTONE_TORCH, count: 1 } },

    // Pistons
    [BLOCK.PISTON]: { name: 'Piston', color: '#808080', top: '#A0522D', solid: true, icon: '🚜', hardness: 1.5, tool: 'pickaxe', isPiston: true },
    [BLOCK.PISTON_HEAD]: { name: 'Piston Head', color: '#A0522D', solid: true, transparent: true, icon: '🪵', hardness: 1.5, tool: 'pickaxe', drop: null },
    [BLOCK.STICKY_PISTON]: { name: 'Sticky Piston', color: '#808080', top: '#006400', solid: true, icon: '🚜', hardness: 1.5, tool: 'pickaxe', isPiston: true, sticky: true },
    [BLOCK.STICKY_PISTON_HEAD]: { name: 'Sticky Piston Head', color: '#A0522D', solid: true, transparent: true, icon: '🪵', hardness: 1.5, tool: 'pickaxe', drop: null },

    // Nether Blocks
    [BLOCK.NETHERRACK]: { name: 'Netherrack', color: '#800000', solid: true, icon: '🟥', hardness: 0.4, tool: 'pickaxe' },
    [BLOCK.SOUL_SAND]: { name: 'Soul Sand', color: '#503030', solid: true, icon: '🟫', hardness: 0.5, tool: 'shovel', slow: true },
    [BLOCK.GLOWSTONE]: { name: 'Glowstone', color: '#FFD700', solid: true, icon: '✨', hardness: 0.3, light: 15, drop: { type: BLOCK.ITEM_GLOWSTONE_DUST, count: 4 } },
    [BLOCK.NETHER_BRICK]: { name: 'Nether Brick', color: '#400000', solid: true, icon: '🧱', hardness: 2.0, tool: 'pickaxe' },
    [BLOCK.QUARTZ_ORE]: { name: 'Quartz Ore', color: '#800000', top: '#FFFFFF', solid: true, icon: '💎', hardness: 3.0, tool: 'pickaxe', drop: { type: BLOCK.ITEM_QUARTZ, count: 1 } },
    [BLOCK.OBSIDIAN]: { name: 'Obsidian', color: '#1a1120', solid: true, icon: '⬛', hardness: 50.0, tool: 'pickaxe' }, // Only diamond
    [BLOCK.PORTAL]: { name: 'Portal', color: '#800080', solid: false, transparent: true, icon: '🌀', hardness: -1, light: 11 },

    // Functional Blocks
    [BLOCK.BREWING_STAND]: { name: 'Brewing Stand', color: '#808080', solid: false, transparent: true, icon: '🧪', hardness: 0.5, tool: 'pickaxe' },
    [BLOCK.CAULDRON]: { name: 'Cauldron', color: '#404040', solid: false, transparent: true, icon: '🍲', hardness: 2.0, tool: 'pickaxe' },
    [BLOCK.ENCHANTING_TABLE]: { name: 'Enchanting Table', color: '#800000', top: '#FFD700', solid: false, transparent: true, icon: '📖', hardness: 5.0, tool: 'pickaxe', light: 7 },
    [BLOCK.RAIL]: { name: 'Rail', color: '#808080', solid: false, transparent: true, icon: '🛤️', hardness: 0.0 },

    // Saplings
    [BLOCK.OAK_SAPLING]: { name: 'Oak Sapling', color: '#228B22', solid: false, transparent: true, icon: '🌱', hardness: 0.0, isSapling: true, drop: { type: BLOCK.OAK_SAPLING, count: 1 } },
    [BLOCK.BIRCH_SAPLING]: { name: 'Birch Sapling', color: '#80a755', solid: false, transparent: true, icon: '🌱', hardness: 0.0, isSapling: true, drop: { type: BLOCK.BIRCH_SAPLING, count: 1 } },
    [BLOCK.SPRUCE_SAPLING]: { name: 'Spruce Sapling', color: '#2d4c2d', solid: false, transparent: true, icon: '🌱', hardness: 0.0, isSapling: true, drop: { type: BLOCK.SPRUCE_SAPLING, count: 1 } },
    [BLOCK.JUNGLE_SAPLING]: { name: 'Jungle Sapling', color: '#30bb0b', solid: false, transparent: true, icon: '🌱', hardness: 0.0, isSapling: true, drop: { type: BLOCK.JUNGLE_SAPLING, count: 1 } },

    // Tools Visuals
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

    [BLOCK.HOE_WOOD]: { name: 'Wood Hoe', color: '#8B4513', solid: false, isItem: true, icon: '🏒' },
    [BLOCK.HOE_STONE]: { name: 'Stone Hoe', color: '#808080', solid: false, isItem: true, icon: '🏒' },
    [BLOCK.HOE_IRON]: { name: 'Iron Hoe', color: '#C0C0C0', solid: false, isItem: true, icon: '🏒' },
    [BLOCK.HOE_DIAMOND]: { name: 'Diamond Hoe', color: '#00FFFF', solid: false, isItem: true, icon: '🏒' },

    [BLOCK.SWORD_WOOD]: { name: 'Wood Sword', color: '#8B4513', solid: false, isItem: true, icon: '⚔️' },
    [BLOCK.SWORD_STONE]: { name: 'Stone Sword', color: '#808080', solid: false, isItem: true, icon: '⚔️' },
    [BLOCK.SWORD_IRON]: { name: 'Iron Sword', color: '#C0C0C0', solid: false, isItem: true, icon: '⚔️' },
    [BLOCK.SWORD_DIAMOND]: { name: 'Diamond Sword', color: '#00FFFF', solid: false, isItem: true, icon: '⚔️' },

    [BLOCK.FISHING_ROD]: { name: 'Fishing Rod', color: '#8B4513', solid: false, isItem: true, icon: '🎣', durability: 64 },
    [BLOCK.BOW]: { name: 'Bow', color: '#8B4513', solid: false, isItem: true, icon: '🏹', durability: 384 },
    [BLOCK.SHIELD]: { name: 'Shield', color: '#C0C0C0', solid: false, isItem: true, icon: '🛡️', durability: 336 },

    // Mob Drop Items & Food
    [BLOCK.ITEM_ROTTEN_FLESH]: { name: 'Rotten Flesh', color: '#6B8E23', solid: false, isItem: true, icon: '🧟', food: 4 },
    [BLOCK.ITEM_BONE]: { name: 'Bone', color: '#F0F0F0', solid: false, isItem: true, icon: '🦴' },
    [BLOCK.ITEM_STRING]: { name: 'String', color: '#FFFFFF', solid: false, isItem: true, icon: '🕸️' },
    [BLOCK.ITEM_PORKCHOP]: { name: 'Porkchop', color: '#FFB6C1', solid: false, isItem: true, icon: '🥩', food: 8 },
    [BLOCK.ITEM_LEATHER]: { name: 'Leather', color: '#8B4513', solid: false, isItem: true, icon: '🟫' },
    [BLOCK.ITEM_WOOL]: { name: 'White Wool', color: '#FFFFFF', solid: false, isItem: true, icon: '⬜' },
    [BLOCK.ITEM_MUTTON]: { name: 'Raw Mutton', color: '#B22222', solid: false, isItem: true, icon: '🍖', food: 6 },

    [BLOCK.ITEM_FEATHER]: { name: 'Feather', color: '#FFFFFF', solid: false, isItem: true, icon: '🪶' },
    [BLOCK.ITEM_CHICKEN]: { name: 'Raw Chicken', color: '#FFDAB9', solid: false, isItem: true, icon: '🍗', food: 4 },
    [BLOCK.ITEM_GUNPOWDER]: { name: 'Gunpowder', color: '#696969', solid: false, isItem: true, icon: '🌑' },
    [BLOCK.ITEM_ENDER_PEARL]: { name: 'Ender Pearl', color: '#008B8B', solid: false, isItem: true, icon: '🔮' },

    // Crafting Items
    [BLOCK.ITEM_STICK]: { name: 'Stick', color: '#8B4513', solid: false, isItem: true, icon: '🥢' },
    [BLOCK.ITEM_COAL]: { name: 'Coal', color: '#000000', solid: false, isItem: true, icon: '⚫' },
    [BLOCK.ITEM_IRON_INGOT]: { name: 'Iron Ingot', color: '#C0C0C0', solid: false, isItem: true, icon: '⚪' },
    [BLOCK.ITEM_GOLD_INGOT]: { name: 'Gold Ingot', color: '#FFD700', solid: false, isItem: true, icon: '🟡' },
    [BLOCK.ITEM_DIAMOND]: { name: 'Diamond', color: '#00FFFF', solid: false, isItem: true, icon: '💎' },
    [BLOCK.ITEM_APPLE]: { name: 'Apple', color: '#FF0000', solid: false, isItem: true, icon: '🍎', food: 4 },
    [BLOCK.CARROTS]: { name: 'carrots', color: '#FFA500', solid: false, transparent: true, icon: '🥕', hardness: 0.0 },
    [BLOCK.POTATOES]: { name: 'potatoes', color: '#F4A460', solid: false, transparent: true, icon: '🥔', hardness: 0.0 },
    [BLOCK.MELON_BLOCK]: { name: 'Melon', color: '#00FF00', top: '#00FF00', solid: true, icon: '🍉', hardness: 1.0, tool: 'axe' },
    [BLOCK.PUMPKIN]: { name: 'Pumpkin', color: '#FF8C00', top: '#FF8C00', solid: true, icon: '🎃', hardness: 1.0, tool: 'axe' },
    [BLOCK.MELON_STEM]: { name: 'Melon Stem', color: '#32CD32', solid: false, transparent: true, icon: '🌱', hardness: 0.0 },
    [BLOCK.PUMPKIN_STEM]: { name: 'Pumpkin Stem', color: '#32CD32', solid: false, transparent: true, icon: '🌱', hardness: 0.0 },
    [BLOCK.TNT]: { name: 'TNT', color: '#DB7093', top: '#FF0000', solid: true, icon: '🧨', hardness: 0.0 },

    [BLOCK.ITEM_WHEAT_SEEDS]: { name: 'Wheat Seeds', color: '#32CD32', solid: false, isItem: true, icon: '🌰' },
    [BLOCK.ITEM_WHEAT]: { name: 'Wheat', color: '#DAA520', solid: false, isItem: true, icon: '🌾' },
    [BLOCK.ITEM_CARROT]: { name: 'Carrot', color: '#FFA500', solid: false, isItem: true, icon: '🥕', food: 3 },
    [BLOCK.ITEM_POTATO]: { name: 'Potato', color: '#F4A460', solid: false, isItem: true, icon: '🥔', food: 1 },
    [BLOCK.ITEM_MELON_SEEDS]: { name: 'Melon Seeds', color: '#000000', solid: false, isItem: true, icon: '⚫' },
    [BLOCK.ITEM_PUMPKIN_SEEDS]: { name: 'Pumpkin Seeds', color: '#F5DEB3', solid: false, isItem: true, icon: '🎃' },
    [BLOCK.ITEM_MELON_SLICE]: { name: 'Melon Slice', color: '#FF6347', solid: false, isItem: true, icon: '🍉', food: 2 },

    [BLOCK.ITEM_RAW_FISH]: { name: 'Raw Fish', color: '#87CEEB', solid: false, isItem: true, icon: '🐟', food: 5 },
    [BLOCK.ITEM_ARROW]: { name: 'Arrow', color: '#D3D3D3', solid: false, isItem: true, icon: '➵' },

    [BLOCK.ITEM_COCOA_BEANS]: { name: 'Cocoa Beans', color: '#915325', solid: false, isItem: true, icon: '🌰' },
    [BLOCK.ITEM_COOKED_FISH]: { name: 'Cooked Fish', color: '#D2691E', solid: false, isItem: true, icon: '🐟', food: 8 },
    [BLOCK.ITEM_EMERALD]: { name: 'Emerald', color: '#50C878', solid: false, isItem: true, icon: '💎' },

    [BLOCK.ITEM_REDSTONE_DUST]: { name: 'Redstone Dust', color: '#FF0000', solid: false, isItem: true, icon: '🔴' },

    // New Items
    [BLOCK.ITEM_QUARTZ]: { name: 'Nether Quartz', color: '#FFFFFF', solid: false, isItem: true, icon: '💎' },
    [BLOCK.ITEM_BLAZE_ROD]: { name: 'Blaze Rod', color: '#FFA500', solid: false, isItem: true, icon: '🔥' },
    [BLOCK.ITEM_GHAST_TEAR]: { name: 'Ghast Tear', color: '#F0F0F0', solid: false, isItem: true, icon: '💧' },
    [BLOCK.ITEM_NETHER_WART]: { name: 'Nether Wart', color: '#800000', solid: false, isItem: true, icon: '🍄' },
    [BLOCK.ITEM_GLOWSTONE_DUST]: { name: 'Glowstone Dust', color: '#FFD700', solid: false, isItem: true, icon: '✨' },
    [BLOCK.ITEM_GLASS_BOTTLE]: { name: 'Glass Bottle', color: '#ADD8E6', solid: false, isItem: true, icon: '🍾' },
    [BLOCK.ITEM_POTION]: { name: 'Potion', color: '#FF00FF', solid: false, isItem: true, icon: '🧪' },
    [BLOCK.ITEM_ENCHANTED_BOOK]: { name: 'Enchanted Book', color: '#800080', solid: false, isItem: true, icon: '📘' },
    [BLOCK.ITEM_LAPIS_LAZULI]: { name: 'Lapis Lazuli', color: '#00008B', solid: false, isItem: true, icon: '💙' },
    [BLOCK.ITEM_MINECART]: { name: 'Minecart', color: '#808080', solid: false, isItem: true, icon: '🛒' },
    [BLOCK.ITEM_BOAT]: { name: 'Boat', color: '#8B4513', solid: false, isItem: true, icon: '🛶' },
    [BLOCK.ITEM_SIGN]: { name: 'Sign', color: '#DEB887', solid: false, isItem: true, icon: '🪧' },
    [BLOCK.ITEM_BUCKET]: { name: 'Bucket', color: '#C0C0C0', solid: false, isItem: true, icon: '🪣' },
    [BLOCK.ITEM_WATER_BUCKET]: { name: 'Water Bucket', color: '#0000FF', solid: false, isItem: true, icon: '🪣' },
    [BLOCK.ITEM_LAVA_BUCKET]: { name: 'Lava Bucket', color: '#FF4500', solid: false, isItem: true, icon: '🪣' },

    // XP Orb
    'xp': { name: 'XP', color: '#7FFF00', solid: false, isItem: true, icon: '❇️' }
};

window.BLOCK = BLOCK;
window.BLOCKS = BLOCKS;
window.TOOLS = TOOLS;
