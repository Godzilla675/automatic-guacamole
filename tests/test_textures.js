const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Set up JSDOM with canvas support
const dom = new JSDOM('<!DOCTYPE html><body></body>', {
    url: "http://localhost/",
    pretendToBeVisual: true
});
global.window = dom.window;
global.document = dom.window.document;

// Load blocks.js to get BLOCK constants and BLOCKS definitions
const blocksCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'blocks.js'), 'utf8');
dom.window.eval(blocksCode);

// Load textures.js
const texturesCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'textures.js'), 'utf8');
dom.window.eval(texturesCode);

const BLOCK = dom.window.BLOCK;
const BLOCKS = dom.window.BLOCKS;
// XP uses a special string key ('xp') rather than a numeric block ID
const EXCLUDED_IDS = ['xp'];

describe('TextureManager', () => {
    let tm;

    before(() => {
        tm = new dom.window.TextureManager();
        tm.init();
    });

    describe('Initialization', () => {
        it('should create a TextureManager instance', () => {
            assert.ok(tm);
            assert.ok(tm.textures);
            assert.ok(tm.mobTextures);
        });

        it('should have a default texture size of 16', () => {
            assert.strictEqual(tm.size, 16);
        });
    });

    describe('Block Textures', () => {
        const coreBlocks = [
            'DIRT', 'STONE', 'GRASS', 'WOOD', 'LEAVES', 'SAND',
            'COBBLESTONE', 'BEDROCK', 'PLANK', 'BRICK',
            'GLASS', 'SNOW', 'ICE', 'WATER', 'LAVA'
        ];

        coreBlocks.forEach(name => {
            it(`should generate texture for ${name}`, () => {
                const id = BLOCK[name];
                assert.ok(id !== undefined, `BLOCK.${name} is undefined`);
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name} (ID: ${id})`);
                assert.ok(tex.width > 0, `Texture width should be > 0`);
                assert.ok(tex.height > 0, `Texture height should be > 0`);
            });
        });

        it('should generate textures for all ore types', () => {
            ['ORE_COAL', 'ORE_IRON', 'ORE_GOLD', 'ORE_DIAMOND'].forEach(name => {
                const id = BLOCK[name];
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name}`);
            });
        });

        it('should generate textures for all wood types', () => {
            ['WOOD', 'SPRUCE_WOOD', 'BIRCH_WOOD', 'JUNGLE_WOOD'].forEach(name => {
                const id = BLOCK[name];
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name}`);
            });
        });

        it('should generate textures for all leaf types', () => {
            ['LEAVES', 'SPRUCE_LEAVES', 'BIRCH_LEAVES', 'JUNGLE_LEAVES'].forEach(name => {
                const id = BLOCK[name];
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name}`);
            });
        });

        it('should generate textures for nether blocks', () => {
            ['NETHERRACK', 'SOUL_SAND', 'GLOWSTONE', 'OBSIDIAN', 'PORTAL', 'NETHER_BRICK'].forEach(name => {
                const id = BLOCK[name];
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name}`);
            });
        });

        it('should generate textures for functional blocks', () => {
            ['FURNACE', 'CHEST', 'TNT', 'ANVIL', 'JUKEBOX'].forEach(name => {
                const id = BLOCK[name];
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name}`);
            });
        });

        it('should generate textures for all 16 wool colors', () => {
            const colors = [
                'WOOL_WHITE', 'WOOL_ORANGE', 'WOOL_MAGENTA', 'WOOL_LIGHT_BLUE',
                'WOOL_YELLOW', 'WOOL_LIME', 'WOOL_PINK', 'WOOL_GRAY',
                'WOOL_LIGHT_GRAY', 'WOOL_CYAN', 'WOOL_PURPLE', 'WOOL_BLUE',
                'WOOL_BROWN', 'WOOL_GREEN', 'WOOL_RED', 'WOOL_BLACK'
            ];
            colors.forEach(name => {
                const id = BLOCK[name];
                assert.ok(id !== undefined, `BLOCK.${name} is undefined`);
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name}`);
            });
        });

        it('should generate textures for all 16 concrete colors', () => {
            const colors = [
                'CONCRETE_WHITE', 'CONCRETE_ORANGE', 'CONCRETE_MAGENTA', 'CONCRETE_LIGHT_BLUE',
                'CONCRETE_YELLOW', 'CONCRETE_LIME', 'CONCRETE_PINK', 'CONCRETE_GRAY',
                'CONCRETE_LIGHT_GRAY', 'CONCRETE_CYAN', 'CONCRETE_PURPLE', 'CONCRETE_BLUE',
                'CONCRETE_BROWN', 'CONCRETE_GREEN', 'CONCRETE_RED', 'CONCRETE_BLACK'
            ];
            colors.forEach(name => {
                const id = BLOCK[name];
                assert.ok(id !== undefined, `BLOCK.${name} is undefined`);
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name}`);
            });
        });

        it('should cover all non-item block types defined in BLOCKS', () => {
            let missing = [];
            for (const id of Object.keys(BLOCKS)) {
                const def = BLOCKS[id];
                if (def && !def.isItem && !EXCLUDED_IDS.includes(id)) {
                    const numId = parseInt(id);
                    if (!isNaN(numId) && !tm.getBlockTexture(numId)) {
                        missing.push(`${def.name} (ID: ${id})`);
                    }
                }
            }
            assert.strictEqual(missing.length, 0,
                `Missing block textures: ${missing.join(', ')}`);
        });
    });

    describe('Item Textures', () => {
        it('should generate textures for all pickaxe tiers', () => {
            ['PICKAXE_WOOD', 'PICKAXE_STONE', 'PICKAXE_IRON', 'PICKAXE_DIAMOND'].forEach(name => {
                const id = BLOCK[name];
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name}`);
            });
        });

        it('should generate textures for all axe tiers', () => {
            ['AXE_WOOD', 'AXE_STONE', 'AXE_IRON', 'AXE_DIAMOND'].forEach(name => {
                const id = BLOCK[name];
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name}`);
            });
        });

        it('should generate textures for all sword tiers', () => {
            ['SWORD_WOOD', 'SWORD_STONE', 'SWORD_IRON', 'SWORD_DIAMOND'].forEach(name => {
                const id = BLOCK[name];
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name}`);
            });
        });

        it('should generate textures for all shovel tiers', () => {
            ['SHOVEL_WOOD', 'SHOVEL_STONE', 'SHOVEL_IRON', 'SHOVEL_DIAMOND'].forEach(name => {
                const id = BLOCK[name];
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name}`);
            });
        });

        it('should generate textures for all hoe tiers', () => {
            ['HOE_WOOD', 'HOE_STONE', 'HOE_IRON', 'HOE_DIAMOND'].forEach(name => {
                const id = BLOCK[name];
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name}`);
            });
        });

        it('should generate textures for weapons and combat items', () => {
            ['BOW', 'SHIELD', 'FISHING_ROD', 'ITEM_ARROW'].forEach(name => {
                const id = BLOCK[name];
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name}`);
            });
        });

        it('should generate textures for food items', () => {
            [
                'ITEM_APPLE', 'ITEM_PORKCHOP', 'ITEM_MUTTON', 'ITEM_CHICKEN',
                'ITEM_RAW_FISH', 'ITEM_COOKED_FISH', 'ITEM_CARROT', 'ITEM_POTATO',
                'ITEM_MELON_SLICE', 'ITEM_ROTTEN_FLESH'
            ].forEach(name => {
                const id = BLOCK[name];
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name}`);
            });
        });

        it('should generate textures for material items', () => {
            [
                'ITEM_STICK', 'ITEM_COAL', 'ITEM_IRON_INGOT', 'ITEM_GOLD_INGOT',
                'ITEM_DIAMOND', 'ITEM_EMERALD', 'ITEM_REDSTONE_DUST',
                'ITEM_LEATHER', 'ITEM_STRING', 'ITEM_FEATHER', 'ITEM_BONE'
            ].forEach(name => {
                const id = BLOCK[name];
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name}`);
            });
        });

        it('should generate textures for all armor pieces', () => {
            const materials = ['LEATHER', 'IRON', 'GOLD', 'DIAMOND'];
            const pieces = ['HELMET', 'CHESTPLATE', 'LEGGINGS', 'BOOTS'];
            materials.forEach(mat => {
                pieces.forEach(piece => {
                    const name = `ITEM_${piece}_${mat}`;
                    const id = BLOCK[name];
                    assert.ok(id !== undefined, `BLOCK.${name} is undefined`);
                    const tex = tm.getBlockTexture(id);
                    assert.ok(tex, `No texture for ${name}`);
                });
            });
        });

        it('should generate textures for bucket variants', () => {
            ['ITEM_BUCKET', 'ITEM_WATER_BUCKET', 'ITEM_LAVA_BUCKET'].forEach(name => {
                const id = BLOCK[name];
                const tex = tm.getBlockTexture(id);
                assert.ok(tex, `No texture for ${name}`);
            });
        });

        it('should cover all item types defined in BLOCKS', () => {
            let missing = [];
            for (const id of Object.keys(BLOCKS)) {
                const def = BLOCKS[id];
                if (def && def.isItem && !EXCLUDED_IDS.includes(id)) {
                    const numId = parseInt(id);
                    if (!isNaN(numId) && !tm.getBlockTexture(numId)) {
                        missing.push(`${def.name} (ID: ${id})`);
                    }
                }
            }
            assert.strictEqual(missing.length, 0,
                `Missing item textures: ${missing.join(', ')}`);
        });
    });

    describe('Mob Textures', () => {
        const mobTypes = [
            'cow', 'pig', 'sheep', 'chicken', 'zombie', 'skeleton',
            'spider', 'creeper', 'enderman', 'wolf', 'ocelot',
            'villager', 'iron_golem', 'pigman', 'ghast', 'blaze'
        ];

        mobTypes.forEach(type => {
            it(`should generate texture for mob: ${type}`, () => {
                const tex = tm.getMobTexture(type);
                assert.ok(tex, `No texture for mob: ${type}`);
                assert.ok(tex.width > 0, `Mob texture width should be > 0`);
                assert.ok(tex.height > 0, `Mob texture height should be > 0`);
            });
        });

        it('should cover all 16 mob types', () => {
            let count = 0;
            for (const key of Object.keys(tm.mobTextures)) {
                if (tm.mobTextures[key]) count++;
            }
            assert.strictEqual(count, 16, `Expected 16 mob textures, got ${count}`);
        });
    });

    describe('Texture Canvas Properties', () => {
        it('should produce 16x16 canvases for standard block textures', () => {
            const tex = tm.getBlockTexture(BLOCK.DIRT);
            assert.strictEqual(tex.width, 16);
            assert.strictEqual(tex.height, 16);
        });

        it('should produce 16x16 canvases for item textures', () => {
            const tex = tm.getBlockTexture(BLOCK.SWORD_DIAMOND);
            assert.strictEqual(tex.width, 16);
            assert.strictEqual(tex.height, 16);
        });

        it('should produce canvas elements with valid 2d context', () => {
            const tex = tm.getBlockTexture(BLOCK.GRASS);
            const ctx = tex.getContext('2d');
            assert.ok(ctx, 'Canvas should have a valid 2d context');
        });

        it('should return null for non-existent block textures', () => {
            const tex = tm.getBlockTexture(99999);
            assert.strictEqual(tex, null);
        });

        it('should return null for non-existent mob textures', () => {
            const tex = tm.getMobTexture('dragon');
            assert.strictEqual(tex, null);
        });
    });

    describe('Renderer Integration', () => {
        it('should be accessible via window.TextureManager', () => {
            assert.ok(dom.window.TextureManager, 'TextureManager should be on window');
        });

        it('should initialize correctly when constructed fresh', () => {
            const tm2 = new dom.window.TextureManager();
            tm2.init();
            // Verify it generated textures
            assert.ok(Object.keys(tm2.textures).length > 0, 'Should have block/item textures');
            assert.ok(Object.keys(tm2.mobTextures).length > 0, 'Should have mob textures');
        });

        it('should provide textures usable with drawImage pattern', () => {
            // Create a target canvas simulating the renderer
            const target = dom.window.document.createElement('canvas');
            target.width = 100;
            target.height = 100;
            const ctx = target.getContext('2d');

            // Get a block texture and draw it (simulating renderer behavior)
            const tex = tm.getBlockTexture(BLOCK.STONE);
            assert.ok(tex, 'Should have stone texture');

            // This simulates the renderer's: ctx.drawImage(tex, drawX, drawY, drawW, drawH)
            assert.doesNotThrow(() => {
                ctx.drawImage(tex, 0, 0, 32, 32);
            }, 'drawImage should not throw with block texture');

            // Same for mob texture
            const mobTex = tm.getMobTexture('creeper');
            assert.ok(mobTex, 'Should have creeper texture');
            assert.doesNotThrow(() => {
                ctx.drawImage(mobTex, 50, 50, 16, 32);
            }, 'drawImage should not throw with mob texture');
        });
    });
});
