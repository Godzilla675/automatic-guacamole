// Procedural Texture Manager - Generates 16x16 pixel-art textures for blocks and mobs

class TextureManager {
    constructor() {
        this.textures = {};
        this.mobTextures = {};
        this.size = 16;
    }

    init() {
        this.generateBlockTextures();
        this.generateItemTextures();
        this.generateMobTextures();
    }

    createCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w || this.size;
        c.height = h || this.size;
        return c;
    }

    hexToRgb(hex) {
        if (!hex || hex[0] !== '#') return { r: 128, g: 128, b: 128 };
        let h = hex.slice(1);
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        return {
            r: parseInt(h.slice(0, 2), 16),
            g: parseInt(h.slice(2, 4), 16),
            b: parseInt(h.slice(4, 6), 16)
        };
    }

    varyColor(rgb, amount) {
        const v = (Math.random() - 0.5) * amount * 2;
        return {
            r: Math.max(0, Math.min(255, Math.floor(rgb.r + v))),
            g: Math.max(0, Math.min(255, Math.floor(rgb.g + v))),
            b: Math.max(0, Math.min(255, Math.floor(rgb.b + v)))
        };
    }

    fillNoise(ctx, rgb, amount, w, h) {
        w = w || this.size;
        h = h || this.size;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const c = this.varyColor(rgb, amount);
                ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    // --- Block Texture Generators ---

    generateBlockTextures() {
        const B = window.BLOCK;
        if (!B) return;

        // Natural blocks
        this.textures[B.DIRT] = this.genDirt();
        this.textures[B.GRASS] = this.genGrass();
        this.textures[B.STONE] = this.genStone();
        this.textures[B.COBBLESTONE] = this.genCobblestone();
        this.textures[B.SAND] = this.genSand();
        this.textures[B.WOOD] = this.genWood('#5C4033', '#4A3228');
        this.textures[B.LEAVES] = this.genLeaves('#90EE90', '#228B22');
        this.textures[B.PLANK] = this.genPlank('#DEB887');
        this.textures[B.BEDROCK] = this.genBedrock();
        this.textures[B.SNOW] = this.genSnow();
        this.textures[B.ICE] = this.genIce();

        // Ores
        this.textures[B.ORE_COAL] = this.genOre('#808080', '#2F2F2F');
        this.textures[B.ORE_IRON] = this.genOre('#808080', '#D2B48C');
        this.textures[B.ORE_GOLD] = this.genOre('#808080', '#FFD700');
        this.textures[B.ORE_DIAMOND] = this.genOre('#808080', '#00FFFF');

        // Bricks
        this.textures[B.BRICK] = this.genBrick('#8B0000', '#A52A2A');
        this.textures[B.NETHER_BRICK] = this.genBrick('#400000', '#550000');

        // Wood types
        this.textures[B.SPRUCE_WOOD] = this.genWood('#3d2817', '#2a1c10');
        this.textures[B.SPRUCE_LEAVES] = this.genLeaves('#2d4c2d', '#1a3a1a');
        this.textures[B.BIRCH_WOOD] = this.genBirchWood();
        this.textures[B.BIRCH_LEAVES] = this.genLeaves('#80a755', '#5a8030');
        this.textures[B.BIRCH_PLANK] = this.genPlank('#c4b07d');
        this.textures[B.JUNGLE_WOOD] = this.genWood('#56441d', '#3d3015');
        this.textures[B.JUNGLE_LEAVES] = this.genLeaves('#30bb0b', '#20800a');
        this.textures[B.JUNGLE_PLANK] = this.genPlank('#a07350');

        // Glass
        this.textures[B.GLASS] = this.genGlass();
        this.textures[B.GLASS_PANE] = this.genGlass();

        // Special blocks
        this.textures[B.WATER] = this.genWater();
        this.textures[B.LAVA] = this.genLava();
        this.textures[B.CACTUS] = this.genCactus();
        this.textures[B.TNT] = this.genTNT();
        this.textures[B.FURNACE] = this.genFurnace();
        this.textures[B.CHEST] = this.genChest();
        this.textures[B.SANDSTONE] = this.genSandstone();
        this.textures[B.FARMLAND] = this.genFarmland();

        // Nether
        this.textures[B.NETHERRACK] = this.genNetherrack();
        this.textures[B.SOUL_SAND] = this.genSoulSand();
        this.textures[B.GLOWSTONE] = this.genGlowstone();
        this.textures[B.OBSIDIAN] = this.genObsidian();
        this.textures[B.PORTAL] = this.genPortal();

        // Functional
        this.textures[B.REDSTONE_LAMP] = this.genRedstoneLamp(false);
        this.textures[B.REDSTONE_LAMP_ACTIVE] = this.genRedstoneLamp(true);
        this.textures[B.PISTON] = this.genPiston(false);
        this.textures[B.STICKY_PISTON] = this.genPiston(true);
        this.textures[B.JUKEBOX] = this.genJukebox();
        this.textures[B.ANVIL] = this.genAnvil();

        // Melon/Pumpkin
        this.textures[B.MELON_BLOCK] = this.genMelon();
        this.textures[B.PUMPKIN] = this.genPumpkin();

        // Additional blocks
        this.textures[B.TORCH] = this.genTorch('#FFD700');
        this.textures[B.HAY_BLOCK] = this.genHayBlock();
        this.textures[B.BED] = this.genBed();
        this.textures[B.WHEAT] = this.genWheatCrop();
        this.textures[B.COCOA_BLOCK] = this.genCocoa();
        this.textures[B.QUARTZ_ORE] = this.genOre('#800000', '#FFFFFF');

        // Slabs
        this.textures[B.SLAB_WOOD] = this.genPlank('#5C4033');
        this.textures[B.SLAB_STONE] = this.genStone();
        this.textures[B.SLAB_COBBLESTONE] = this.genCobblestone();

        // Doors
        this.textures[B.DOOR_WOOD_BOTTOM] = this.genDoor();
        this.textures[B.DOOR_WOOD_TOP] = this.genDoor();

        // Stairs
        this.textures[B.STAIRS_WOOD] = this.genPlank('#5C4033');
        this.textures[B.STAIRS_COBBLESTONE] = this.genCobblestone();

        // Fences/Gates/Trapdoor
        this.textures[B.FENCE] = this.genPlank('#5C4033');
        this.textures[B.FENCE_GATE] = this.genPlank('#5C4033');
        this.textures[B.TRAPDOOR] = this.genPlank('#5C4033');

        // Saplings
        this.textures[B.OAK_SAPLING] = this.genSapling('#228B22');
        this.textures[B.BIRCH_SAPLING] = this.genSapling('#80a755');
        this.textures[B.SPRUCE_SAPLING] = this.genSapling('#2d4c2d');
        this.textures[B.JUNGLE_SAPLING] = this.genSapling('#30bb0b');

        // Piston heads
        this.textures[B.PISTON_HEAD] = this.genPlank('#A0522D');
        this.textures[B.STICKY_PISTON_HEAD] = this.genPlank('#006400');

        // Redstone components
        this.textures[B.REDSTONE_TORCH] = this.genTorch('#FF0000');
        this.textures[B.REDSTONE_TORCH_OFF] = this.genTorch('#550000');
        this.textures[B.REDSTONE_WIRE] = this.genDust('#FF0000');

        // Signs
        this.textures[B.WALL_SIGN] = this.genPlank('#DEB887');

        // Crops
        this.textures[B.CARROTS] = this.genCropTexture('#FFA500');
        this.textures[B.POTATOES] = this.genCropTexture('#F4A460');
        this.textures[B.MELON_STEM] = this.genStemTexture();
        this.textures[B.PUMPKIN_STEM] = this.genStemTexture();

        // Colored blocks (wool + concrete) - generate from base color
        const colors = {
            WHITE: '#FFFFFF', ORANGE: '#FFA500', MAGENTA: '#FF00FF',
            LIGHT_BLUE: '#ADD8E6', YELLOW: '#FFFF00', LIME: '#00FF00',
            PINK: '#FFC0CB', GRAY: '#808080', LIGHT_GRAY: '#D3D3D3',
            CYAN: '#00FFFF', PURPLE: '#800080', BLUE: '#0000FF',
            BROWN: '#8B4513', GREEN: '#008000', RED: '#FF0000', BLACK: '#1a1a1a'
        };

        for (const [name, color] of Object.entries(colors)) {
            const woolId = B['WOOL_' + name];
            const concreteId = B['CONCRETE_' + name];
            if (woolId !== undefined) this.textures[woolId] = this.genWool(color);
            if (concreteId !== undefined) this.textures[concreteId] = this.genConcrete(color);
        }
    }

    // -- Individual texture generators --

    genDirt() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 139, g: 69, b: 19 }, 20);
        // Pebbles
        for (let i = 0; i < 4; i++) {
            const x = Math.floor(Math.random() * 14) + 1;
            const y = Math.floor(Math.random() * 14) + 1;
            ctx.fillStyle = '#6B3410';
            ctx.fillRect(x, y, 2, 1);
        }
        return c;
    }

    genGrass() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Dirt base
        this.fillNoise(ctx, { r: 139, g: 69, b: 19 }, 15);
        // Green top rows
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 16; x++) {
                const g = this.varyColor({ r: 34, g: 139, b: 34 }, 25);
                ctx.fillStyle = `rgb(${g.r},${g.g},${g.b})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        // Grass-dirt transition
        for (let x = 0; x < 16; x++) {
            const depth = 4 + Math.floor(Math.random() * 2);
            const g = this.varyColor({ r: 50, g: 120, b: 30 }, 15);
            ctx.fillStyle = `rgb(${g.r},${g.g},${g.b})`;
            ctx.fillRect(x, depth, 1, 1);
        }
        return c;
    }

    genStone() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 128, g: 128, b: 128 }, 15);
        // Cracks
        for (let i = 0; i < 3; i++) {
            const x = Math.floor(Math.random() * 12) + 2;
            const y = Math.floor(Math.random() * 14) + 1;
            ctx.fillStyle = '#606060';
            ctx.fillRect(x, y, 1, 2);
        }
        return c;
    }

    genCobblestone() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Base gray
        this.fillNoise(ctx, { r: 105, g: 105, b: 105 }, 20);
        // Stone patches
        for (let i = 0; i < 6; i++) {
            const x = Math.floor(Math.random() * 12);
            const y = Math.floor(Math.random() * 12);
            const w = 2 + Math.floor(Math.random() * 3);
            const h = 2 + Math.floor(Math.random() * 3);
            const shade = 80 + Math.floor(Math.random() * 40);
            ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
            ctx.fillRect(x, y, w, h);
        }
        // Darker lines between
        for (let i = 0; i < 8; i++) {
            const x = Math.floor(Math.random() * 15);
            const y = Math.floor(Math.random() * 15);
            ctx.fillStyle = '#505050';
            ctx.fillRect(x, y, 1, 1);
        }
        return c;
    }

    genSand() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 244, g: 164, b: 96 }, 15);
        // Light specks
        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = '#FFE4B5';
            ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
        }
        return c;
    }

    genWood(baseColor, darkColor) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const base = this.hexToRgb(baseColor);
        const dark = this.hexToRgb(darkColor);
        // Vertical bark lines
        for (let x = 0; x < 16; x++) {
            const isLine = (x % 4 === 0 || x % 4 === 1);
            const rgb = isLine ? dark : base;
            for (let y = 0; y < 16; y++) {
                const v = this.varyColor(rgb, 10);
                ctx.fillStyle = `rgb(${v.r},${v.g},${v.b})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        return c;
    }

    genBirchWood() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // White bark with dark marks
        this.fillNoise(ctx, { r: 227, g: 220, b: 211 }, 8);
        for (let i = 0; i < 5; i++) {
            const x = Math.floor(Math.random() * 14);
            const y = Math.floor(Math.random() * 14);
            ctx.fillStyle = '#3a3a3a';
            ctx.fillRect(x, y, 2 + Math.floor(Math.random() * 2), 1);
        }
        return c;
    }

    genLeaves(lightColor, darkColor) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const light = this.hexToRgb(lightColor);
        const dark = this.hexToRgb(darkColor);
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const rgb = Math.random() > 0.4 ? light : dark;
                const v = this.varyColor(rgb, 20);
                ctx.fillStyle = `rgb(${v.r},${v.g},${v.b})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        return c;
    }

    genPlank(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const base = this.hexToRgb(color);
        // Horizontal planks with lines
        for (let y = 0; y < 16; y++) {
            const isGap = (y % 4 === 3);
            for (let x = 0; x < 16; x++) {
                if (isGap) {
                    ctx.fillStyle = `rgb(${Math.max(0, base.r - 40)},${Math.max(0, base.g - 40)},${Math.max(0, base.b - 40)})`;
                } else {
                    const v = this.varyColor(base, 8);
                    ctx.fillStyle = `rgb(${v.r},${v.g},${v.b})`;
                }
                ctx.fillRect(x, y, 1, 1);
            }
        }
        return c;
    }

    genBedrock() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const v = Math.floor(Math.random() * 40);
                ctx.fillStyle = `rgb(${v},${v},${v})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        return c;
    }

    genSnow() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 240, g: 240, b: 245 }, 8);
        return c;
    }

    genIce() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 165, g: 220, b: 243 }, 10);
        // Cracks
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(3, 2, 1, 6);
        ctx.fillRect(4, 7, 5, 1);
        ctx.fillRect(10, 4, 1, 5);
        return c;
    }

    genOre(stoneColor, oreColor) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const stone = this.hexToRgb(stoneColor);
        this.fillNoise(ctx, stone, 15);
        // Ore specks in clusters
        const ore = this.hexToRgb(oreColor);
        const cx = 4 + Math.floor(Math.random() * 8);
        const cy = 4 + Math.floor(Math.random() * 8);
        for (let i = 0; i < 8; i++) {
            const ox = cx + Math.floor(Math.random() * 5) - 2;
            const oy = cy + Math.floor(Math.random() * 5) - 2;
            if (ox >= 0 && ox < 16 && oy >= 0 && oy < 16) {
                const v = this.varyColor(ore, 15);
                ctx.fillStyle = `rgb(${v.r},${v.g},${v.b})`;
                ctx.fillRect(ox, oy, 1, 1);
            }
        }
        return c;
    }

    genBrick(color1, color2) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const brick = this.hexToRgb(color1);
        const mortar = this.hexToRgb(color2);
        // Fill with mortar
        ctx.fillStyle = `rgb(${mortar.r},${mortar.g},${mortar.b})`;
        ctx.fillRect(0, 0, 16, 16);
        // Draw bricks
        for (let row = 0; row < 4; row++) {
            const y = row * 4;
            const offset = (row % 2) * 4;
            for (let col = 0; col < 3; col++) {
                const x = offset + col * 8;
                for (let py = y; py < y + 3 && py < 16; py++) {
                    for (let px = x; px < x + 7 && px < 16; px++) {
                        if (px >= 0) {
                            const v = this.varyColor(brick, 12);
                            ctx.fillStyle = `rgb(${v.r},${v.g},${v.b})`;
                            ctx.fillRect(px % 16, py, 1, 1);
                        }
                    }
                }
            }
        }
        return c;
    }

    genGlass() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Mostly transparent/light blue
        ctx.fillStyle = 'rgba(173,216,230,0.3)';
        ctx.fillRect(0, 0, 16, 16);
        // Border frame
        ctx.fillStyle = 'rgba(173,216,230,0.7)';
        ctx.fillRect(0, 0, 16, 1);
        ctx.fillRect(0, 15, 16, 1);
        ctx.fillRect(0, 0, 1, 16);
        ctx.fillRect(15, 0, 1, 16);
        // Cross panes
        ctx.fillRect(7, 0, 1, 16);
        ctx.fillRect(0, 7, 16, 1);
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(2, 2, 2, 2);
        return c;
    }

    genWater() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const wave = Math.sin(x * 0.5 + y * 0.3) * 20;
                ctx.fillStyle = `rgba(${65 + wave}, ${105 + wave / 2}, 225, 0.7)`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        return c;
    }

    genLava() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const v = Math.sin(x * 0.6 + y * 0.4) * 30;
                const r = Math.min(255, 200 + v + Math.random() * 30);
                const g = Math.max(0, 60 + v);
                ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},0)`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        return c;
    }

    genCactus() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const base = { r: 46, g: 139, b: 87 };
        this.fillNoise(ctx, base, 15);
        // Lighter stripes
        for (let y = 0; y < 16; y++) {
            if (y % 4 === 0) {
                for (let x = 2; x < 14; x++) {
                    ctx.fillStyle = '#3CB371';
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        // Spines
        ctx.fillStyle = '#8FBC8F';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(Math.floor(Math.random() * 12) + 2, Math.floor(Math.random() * 14) + 1, 1, 1);
        }
        return c;
    }

    genTNT() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Red body
        this.fillNoise(ctx, { r: 219, g: 112, b: 147 }, 10);
        // Dark band in middle
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(0, 5, 16, 6);
        // TNT text area (lighter)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(3, 6, 10, 4);
        // T
        ctx.fillStyle = '#000000';
        ctx.fillRect(4, 7, 3, 1);
        ctx.fillRect(5, 7, 1, 3);
        // N
        ctx.fillRect(8, 7, 1, 3);
        ctx.fillRect(9, 7, 1, 1);
        ctx.fillRect(10, 7, 1, 3);
        // Top
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 16, 2);
        return c;
    }

    genFurnace() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 105, g: 105, b: 105 }, 12);
        // Front face
        ctx.fillStyle = '#404040';
        ctx.fillRect(3, 4, 10, 8);
        // Opening
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(5, 6, 6, 5);
        // Fire glow
        ctx.fillStyle = '#FF6600';
        ctx.fillRect(6, 8, 4, 2);
        return c;
    }

    genChest() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 139, g: 69, b: 19 }, 10);
        // Lid line
        ctx.fillStyle = '#5C3317';
        ctx.fillRect(0, 6, 16, 1);
        // Lock
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(7, 5, 2, 3);
        // Edges
        ctx.fillStyle = '#4A2B0F';
        ctx.fillRect(0, 0, 16, 1);
        ctx.fillRect(0, 15, 16, 1);
        return c;
    }

    genSandstone() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 219, g: 211, b: 160 }, 10);
        // Horizontal layers
        ctx.fillStyle = 'rgba(190,180,130,0.5)';
        ctx.fillRect(0, 4, 16, 1);
        ctx.fillRect(0, 10, 16, 1);
        return c;
    }

    genFarmland() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 62, g: 39, b: 35 }, 10);
        // Furrows
        for (let x = 0; x < 16; x += 4) {
            ctx.fillStyle = '#2E1F1A';
            ctx.fillRect(x, 0, 1, 16);
        }
        return c;
    }

    genNetherrack() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 128, g: 0, b: 0 }, 25);
        return c;
    }

    genSoulSand() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 80, g: 48, b: 48 }, 15);
        // Faces
        for (let i = 0; i < 2; i++) {
            const x = 2 + Math.floor(Math.random() * 10);
            const y = 2 + Math.floor(Math.random() * 10);
            ctx.fillStyle = '#3a2020';
            ctx.fillRect(x, y, 2, 1);
            ctx.fillRect(x, y + 2, 2, 1);
        }
        return c;
    }

    genGlowstone() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const v = Math.random();
                if (v > 0.6) {
                    ctx.fillStyle = '#FFE680';
                } else if (v > 0.3) {
                    ctx.fillStyle = '#FFD700';
                } else {
                    ctx.fillStyle = '#CC9900';
                }
                ctx.fillRect(x, y, 1, 1);
            }
        }
        return c;
    }

    genObsidian() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const v = Math.floor(Math.random() * 30);
                ctx.fillStyle = `rgb(${26 + v}, ${17 + v}, ${32 + v})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        return c;
    }

    genPortal() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const v = Math.sin(x * 0.5 + y * 0.4) * 40;
                ctx.fillStyle = `rgba(${128 + v}, 0, ${128 + v}, 0.7)`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        return c;
    }

    genRedstoneLamp(active) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        if (active) {
            this.fillNoise(ctx, { r: 200, g: 150, b: 50 }, 20);
            ctx.fillStyle = 'rgba(255,215,0,0.5)';
            ctx.fillRect(4, 4, 8, 8);
        } else {
            this.fillNoise(ctx, { r: 74, g: 43, b: 43 }, 12);
            ctx.fillStyle = '#5a3333';
            ctx.fillRect(4, 4, 8, 8);
        }
        // Border
        ctx.fillStyle = active ? '#8B6914' : '#3a2020';
        ctx.fillRect(0, 0, 16, 1);
        ctx.fillRect(0, 15, 16, 1);
        ctx.fillRect(0, 0, 1, 16);
        ctx.fillRect(15, 0, 1, 16);
        return c;
    }

    genPiston(sticky) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Stone body
        this.fillNoise(ctx, { r: 128, g: 128, b: 128 }, 10);
        // Top face (wood or green)
        const topColor = sticky ? { r: 0, g: 100, b: 0 } : { r: 160, g: 82, b: 45 };
        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 4; y++) {
                const v = this.varyColor(topColor, 10);
                ctx.fillStyle = `rgb(${v.r},${v.g},${v.b})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        return c;
    }

    genJukebox() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 74, g: 43, b: 43 }, 10);
        // Record slot
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(4, 6, 8, 2);
        // Top
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, 16, 2);
        return c;
    }

    genAnvil() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.clearRect(0, 0, 16, 16);
        // Base
        this.fillNoise(ctx, { r: 64, g: 64, b: 64 }, 8);
        // Darker top plate
        ctx.fillStyle = '#505050';
        ctx.fillRect(2, 2, 12, 4);
        // Stem
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(5, 6, 6, 4);
        // Base plate
        ctx.fillStyle = '#505050';
        ctx.fillRect(1, 10, 14, 4);
        return c;
    }

    genMelon() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 0, g: 180, b: 0 }, 20);
        // Stripes
        for (let x = 0; x < 16; x += 4) {
            for (let y = 0; y < 16; y++) {
                ctx.fillStyle = '#006400';
                ctx.fillRect(x, y, 1, 1);
            }
        }
        return c;
    }

    genPumpkin() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 255, g: 140, b: 0 }, 15);
        // Vertical ridges
        for (let x = 0; x < 16; x += 4) {
            for (let y = 0; y < 16; y++) {
                ctx.fillStyle = '#CC6600';
                ctx.fillRect(x, y, 1, 1);
            }
        }
        // Face
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(3, 6, 2, 2); // Left eye
        ctx.fillRect(11, 6, 2, 2); // Right eye
        ctx.fillRect(5, 10, 6, 2); // Mouth
        return c;
    }

    genTorch(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Stick
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(7, 4, 2, 10);
        // Flame
        const rgb = this.hexToRgb(color);
        ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        ctx.fillRect(6, 1, 4, 2);
        ctx.fillRect(7, 3, 2, 2);
        return c;
    }

    genHayBlock() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 218, g: 165, b: 32 }, 15);
        // Stripes
        ctx.fillStyle = '#8B7500';
        ctx.fillRect(0, 4, 16, 1);
        ctx.fillRect(0, 11, 16, 1);
        return c;
    }

    genBed() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Frame
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(1, 10, 14, 4);
        // Mattress
        ctx.fillStyle = '#F0F0F0';
        ctx.fillRect(1, 5, 14, 5);
        // Pillow
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(1, 3, 4, 3);
        // Blanket
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(5, 5, 10, 5);
        return c;
    }

    genWheatCrop() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Stalks
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(3, 2, 1, 12);
        ctx.fillRect(6, 3, 1, 11);
        ctx.fillRect(9, 2, 1, 12);
        ctx.fillRect(12, 4, 1, 10);
        // Heads
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(2, 0, 3, 3);
        ctx.fillRect(5, 1, 3, 3);
        ctx.fillRect(8, 0, 3, 3);
        ctx.fillRect(11, 2, 3, 3);
        return c;
    }

    genCocoa() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#915325';
        ctx.fillRect(4, 3, 8, 10);
        ctx.fillRect(5, 2, 6, 1);
        ctx.fillRect(5, 13, 6, 1);
        ctx.fillStyle = '#6B3A18';
        ctx.fillRect(7, 4, 2, 8);
        return c;
    }

    genDoor() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 139, g: 69, b: 19 }, 8);
        // Panels
        ctx.fillStyle = '#6B3410';
        ctx.fillRect(2, 1, 5, 6);
        ctx.fillRect(9, 1, 5, 6);
        ctx.fillRect(2, 9, 5, 6);
        ctx.fillRect(9, 9, 5, 6);
        // Handle
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(11, 7, 2, 2);
        return c;
    }

    genSapling(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const rgb = this.hexToRgb(color);
        // Leaves
        ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        ctx.fillRect(5, 2, 6, 3);
        ctx.fillRect(4, 5, 8, 3);
        ctx.fillRect(6, 8, 4, 2);
        // Trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(7, 8, 2, 6);
        return c;
    }

    genCropTexture(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const rgb = this.hexToRgb(color);
        // Plant stalks
        ctx.fillStyle = '#228B22';
        ctx.fillRect(3, 4, 1, 10);
        ctx.fillRect(7, 3, 1, 11);
        ctx.fillRect(11, 5, 1, 9);
        // Crop buds
        ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        ctx.fillRect(2, 2, 3, 3);
        ctx.fillRect(6, 1, 3, 3);
        ctx.fillRect(10, 3, 3, 3);
        return c;
    }

    genStemTexture() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#32CD32';
        // Thin vine/stem
        ctx.fillRect(7, 2, 2, 12);
        ctx.fillRect(5, 4, 2, 1);
        ctx.fillRect(9, 7, 2, 1);
        ctx.fillRect(5, 10, 2, 1);
        return c;
    }

    genWool(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const rgb = this.hexToRgb(color);
        // Fluffy wool with noise
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const v = this.varyColor(rgb, 20);
                ctx.fillStyle = `rgb(${v.r},${v.g},${v.b})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        return c;
    }

    genConcrete(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const rgb = this.hexToRgb(color);
        // Smooth concrete with very slight noise
        this.fillNoise(ctx, rgb, 5);
        return c;
    }

    // --- Item Texture Generators ---

    generateItemTextures() {
        const B = window.BLOCK;
        if (!B) return;

        // Tools - Pickaxes
        this.textures[B.PICKAXE_WOOD] = this.genPickaxe('#8B4513', '#8B4513');
        this.textures[B.PICKAXE_STONE] = this.genPickaxe('#808080', '#8B4513');
        this.textures[B.PICKAXE_IRON] = this.genPickaxe('#C0C0C0', '#8B4513');
        this.textures[B.PICKAXE_DIAMOND] = this.genPickaxe('#00FFFF', '#8B4513');

        // Tools - Axes
        this.textures[B.AXE_WOOD] = this.genAxe('#8B4513', '#8B4513');
        this.textures[B.AXE_STONE] = this.genAxe('#808080', '#8B4513');
        this.textures[B.AXE_IRON] = this.genAxe('#C0C0C0', '#8B4513');
        this.textures[B.AXE_DIAMOND] = this.genAxe('#00FFFF', '#8B4513');

        // Tools - Shovels
        this.textures[B.SHOVEL_WOOD] = this.genShovel('#8B4513', '#8B4513');
        this.textures[B.SHOVEL_STONE] = this.genShovel('#808080', '#8B4513');
        this.textures[B.SHOVEL_IRON] = this.genShovel('#C0C0C0', '#8B4513');
        this.textures[B.SHOVEL_DIAMOND] = this.genShovel('#00FFFF', '#8B4513');

        // Tools - Hoes
        this.textures[B.HOE_WOOD] = this.genHoe('#8B4513', '#8B4513');
        this.textures[B.HOE_STONE] = this.genHoe('#808080', '#8B4513');
        this.textures[B.HOE_IRON] = this.genHoe('#C0C0C0', '#8B4513');
        this.textures[B.HOE_DIAMOND] = this.genHoe('#00FFFF', '#8B4513');

        // Weapons - Swords
        this.textures[B.SWORD_WOOD] = this.genSword('#8B4513', '#8B4513');
        this.textures[B.SWORD_STONE] = this.genSword('#808080', '#8B4513');
        this.textures[B.SWORD_IRON] = this.genSword('#C0C0C0', '#8B4513');
        this.textures[B.SWORD_DIAMOND] = this.genSword('#00FFFF', '#8B4513');

        // Other weapons/tools
        this.textures[B.BOW] = this.genBow();
        this.textures[B.FISHING_ROD] = this.genFishingRod();
        this.textures[B.SHIELD] = this.genShield();
        this.textures[B.ITEM_ARROW] = this.genArrow();

        // Materials
        this.textures[B.ITEM_STICK] = this.genStick();
        this.textures[B.ITEM_COAL] = this.genCoal();
        this.textures[B.ITEM_IRON_INGOT] = this.genIngot('#C0C0C0');
        this.textures[B.ITEM_GOLD_INGOT] = this.genIngot('#FFD700');
        this.textures[B.ITEM_DIAMOND] = this.genGem('#00FFFF');
        this.textures[B.ITEM_EMERALD] = this.genGem('#50C878');
        this.textures[B.ITEM_QUARTZ] = this.genGem('#FFFFFF');
        this.textures[B.ITEM_LAPIS_LAZULI] = this.genGem('#00008B');
        this.textures[B.ITEM_REDSTONE_DUST] = this.genDust('#FF0000');
        this.textures[B.ITEM_GLOWSTONE_DUST] = this.genDust('#FFD700');
        this.textures[B.ITEM_GUNPOWDER] = this.genDust('#696969');
        this.textures[B.ITEM_LEATHER] = this.genLeather();
        this.textures[B.ITEM_STRING] = this.genString();
        this.textures[B.ITEM_FEATHER] = this.genFeather();
        this.textures[B.ITEM_BONE] = this.genBone();
        this.textures[B.ITEM_BLAZE_ROD] = this.genBlazeRod();
        this.textures[B.ITEM_GHAST_TEAR] = this.genGhastTear();
        this.textures[B.ITEM_ENDER_PEARL] = this.genEnderPearl();
        this.textures[B.ITEM_NETHER_WART] = this.genNetherWart();
        this.textures[B.ITEM_COCOA_BEANS] = this.genCocoaBeans();

        // Food
        this.textures[B.ITEM_APPLE] = this.genApple();
        this.textures[B.ITEM_PORKCHOP] = this.genMeat('#FFB6C1');
        this.textures[B.ITEM_MUTTON] = this.genMeat('#B22222');
        this.textures[B.ITEM_CHICKEN] = this.genMeat('#FFDAB9');
        this.textures[B.ITEM_ROTTEN_FLESH] = this.genMeat('#6B8E23');
        this.textures[B.ITEM_RAW_FISH] = this.genFish('#87CEEB');
        this.textures[B.ITEM_COOKED_FISH] = this.genFish('#D2691E');
        this.textures[B.ITEM_CARROT] = this.genCarrot();
        this.textures[B.ITEM_POTATO] = this.genPotato();
        this.textures[B.ITEM_MELON_SLICE] = this.genMelonSlice();
        this.textures[B.ITEM_WHEAT] = this.genWheatItem();
        this.textures[B.ITEM_WHEAT_SEEDS] = this.genSeeds('#32CD32');
        this.textures[B.ITEM_MELON_SEEDS] = this.genSeeds('#000000');
        this.textures[B.ITEM_PUMPKIN_SEEDS] = this.genSeeds('#F5DEB3');

        // Containers / tools
        this.textures[B.ITEM_BUCKET] = this.genBucket('#C0C0C0');
        this.textures[B.ITEM_WATER_BUCKET] = this.genBucket('#0000FF');
        this.textures[B.ITEM_LAVA_BUCKET] = this.genBucket('#FF4500');
        this.textures[B.ITEM_GLASS_BOTTLE] = this.genGlassBottle();
        this.textures[B.ITEM_POTION] = this.genPotion();

        // Misc items
        this.textures[B.ITEM_ENCHANTED_BOOK] = this.genEnchantedBook();
        this.textures[B.ITEM_SIGN] = this.genSignItem();
        this.textures[B.ITEM_BOAT] = this.genBoatItem();
        this.textures[B.ITEM_MINECART] = this.genMinecartItem();
        this.textures[B.ITEM_MUSIC_DISC] = this.genMusicDisc();
        this.textures[B.ITEM_WOOL] = this.genWool('#FFFFFF');

        // Armor - Leather
        this.textures[B.ITEM_HELMET_LEATHER] = this.genHelmet('#8B4513');
        this.textures[B.ITEM_CHESTPLATE_LEATHER] = this.genChestplate('#8B4513');
        this.textures[B.ITEM_LEGGINGS_LEATHER] = this.genLeggings('#8B4513');
        this.textures[B.ITEM_BOOTS_LEATHER] = this.genBoots('#8B4513');

        // Armor - Iron
        this.textures[B.ITEM_HELMET_IRON] = this.genHelmet('#C0C0C0');
        this.textures[B.ITEM_CHESTPLATE_IRON] = this.genChestplate('#C0C0C0');
        this.textures[B.ITEM_LEGGINGS_IRON] = this.genLeggings('#C0C0C0');
        this.textures[B.ITEM_BOOTS_IRON] = this.genBoots('#C0C0C0');

        // Armor - Gold
        this.textures[B.ITEM_HELMET_GOLD] = this.genHelmet('#FFD700');
        this.textures[B.ITEM_CHESTPLATE_GOLD] = this.genChestplate('#FFD700');
        this.textures[B.ITEM_LEGGINGS_GOLD] = this.genLeggings('#FFD700');
        this.textures[B.ITEM_BOOTS_GOLD] = this.genBoots('#FFD700');

        // Armor - Diamond
        this.textures[B.ITEM_HELMET_DIAMOND] = this.genHelmet('#00FFFF');
        this.textures[B.ITEM_CHESTPLATE_DIAMOND] = this.genChestplate('#00FFFF');
        this.textures[B.ITEM_LEGGINGS_DIAMOND] = this.genLeggings('#00FFFF');
        this.textures[B.ITEM_BOOTS_DIAMOND] = this.genBoots('#00FFFF');
    }

    // -- Tool textures --

    genPickaxe(headColor, handleColor) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const head = this.hexToRgb(headColor);
        const handle = this.hexToRgb(handleColor);
        // Handle (diagonal)
        ctx.fillStyle = `rgb(${handle.r},${handle.g},${handle.b})`;
        ctx.fillRect(7, 8, 2, 2);
        ctx.fillRect(6, 10, 2, 2);
        ctx.fillRect(5, 12, 2, 2);
        ctx.fillRect(4, 14, 2, 2);
        // Head
        ctx.fillStyle = `rgb(${head.r},${head.g},${head.b})`;
        ctx.fillRect(3, 3, 10, 2);
        ctx.fillRect(3, 5, 2, 2);
        ctx.fillRect(11, 5, 2, 2);
        ctx.fillRect(7, 5, 2, 3);
        return c;
    }

    genAxe(headColor, handleColor) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const head = this.hexToRgb(headColor);
        const handle = this.hexToRgb(handleColor);
        // Handle
        ctx.fillStyle = `rgb(${handle.r},${handle.g},${handle.b})`;
        ctx.fillRect(7, 7, 2, 2);
        ctx.fillRect(6, 9, 2, 2);
        ctx.fillRect(5, 11, 2, 2);
        ctx.fillRect(4, 13, 2, 2);
        // Axe head
        ctx.fillStyle = `rgb(${head.r},${head.g},${head.b})`;
        ctx.fillRect(8, 2, 4, 2);
        ctx.fillRect(9, 4, 4, 2);
        ctx.fillRect(9, 6, 3, 2);
        return c;
    }

    genShovel(headColor, handleColor) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const head = this.hexToRgb(headColor);
        const handle = this.hexToRgb(handleColor);
        // Handle
        ctx.fillStyle = `rgb(${handle.r},${handle.g},${handle.b})`;
        ctx.fillRect(7, 6, 2, 2);
        ctx.fillRect(7, 8, 2, 2);
        ctx.fillRect(7, 10, 2, 2);
        ctx.fillRect(7, 12, 2, 2);
        // Blade
        ctx.fillStyle = `rgb(${head.r},${head.g},${head.b})`;
        ctx.fillRect(6, 1, 4, 2);
        ctx.fillRect(5, 3, 6, 2);
        ctx.fillRect(6, 5, 4, 2);
        return c;
    }

    genHoe(headColor, handleColor) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const head = this.hexToRgb(headColor);
        const handle = this.hexToRgb(handleColor);
        // Handle
        ctx.fillStyle = `rgb(${handle.r},${handle.g},${handle.b})`;
        ctx.fillRect(7, 7, 2, 2);
        ctx.fillRect(6, 9, 2, 2);
        ctx.fillRect(5, 11, 2, 2);
        ctx.fillRect(4, 13, 2, 2);
        // Head
        ctx.fillStyle = `rgb(${head.r},${head.g},${head.b})`;
        ctx.fillRect(8, 3, 5, 2);
        ctx.fillRect(8, 5, 2, 2);
        return c;
    }

    genSword(bladeColor, handleColor) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const blade = this.hexToRgb(bladeColor);
        const handle = this.hexToRgb(handleColor);
        // Handle
        ctx.fillStyle = `rgb(${handle.r},${handle.g},${handle.b})`;
        ctx.fillRect(7, 11, 2, 2);
        ctx.fillRect(6, 13, 4, 2);
        // Guard
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(5, 9, 6, 2);
        // Blade
        ctx.fillStyle = `rgb(${blade.r},${blade.g},${blade.b})`;
        ctx.fillRect(7, 1, 2, 2);
        ctx.fillRect(7, 3, 2, 2);
        ctx.fillRect(7, 5, 2, 2);
        ctx.fillRect(7, 7, 2, 2);
        // Tip
        ctx.fillRect(7, 0, 2, 1);
        return c;
    }

    genBow() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Bow body (curved)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(4, 2, 2, 1);
        ctx.fillRect(3, 3, 2, 2);
        ctx.fillRect(3, 5, 2, 2);
        ctx.fillRect(3, 7, 2, 2);
        ctx.fillRect(3, 9, 2, 2);
        ctx.fillRect(4, 11, 2, 2);
        ctx.fillRect(5, 13, 2, 1);
        // String
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(10, 2, 1, 1);
        ctx.fillRect(9, 3, 1, 2);
        ctx.fillRect(8, 5, 1, 2);
        ctx.fillRect(7, 7, 1, 2);
        ctx.fillRect(8, 9, 1, 2);
        ctx.fillRect(9, 11, 1, 2);
        ctx.fillRect(10, 13, 1, 1);
        return c;
    }

    genFishingRod() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Rod
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(4, 14, 2, 2);
        ctx.fillRect(5, 12, 2, 2);
        ctx.fillRect(6, 10, 2, 2);
        ctx.fillRect(7, 8, 2, 2);
        ctx.fillRect(8, 6, 2, 2);
        ctx.fillRect(9, 4, 2, 2);
        ctx.fillRect(10, 2, 2, 2);
        // Line
        ctx.fillStyle = '#CCCCCC';
        ctx.fillRect(12, 1, 1, 1);
        ctx.fillRect(13, 2, 1, 3);
        ctx.fillRect(12, 5, 1, 2);
        // Hook
        ctx.fillStyle = '#808080';
        ctx.fillRect(11, 7, 1, 1);
        ctx.fillRect(12, 7, 1, 1);
        return c;
    }

    genShield() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Shield shape
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(3, 1, 10, 2);
        ctx.fillRect(2, 3, 12, 4);
        ctx.fillRect(3, 7, 10, 3);
        ctx.fillRect(4, 10, 8, 2);
        ctx.fillRect(5, 12, 6, 1);
        ctx.fillRect(6, 13, 4, 1);
        // Cross pattern
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(7, 3, 2, 9);
        ctx.fillRect(4, 5, 8, 2);
        return c;
    }

    genArrow() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Shaft
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(7, 4, 2, 8);
        // Tip
        ctx.fillStyle = '#808080';
        ctx.fillRect(7, 1, 2, 1);
        ctx.fillRect(6, 2, 4, 1);
        ctx.fillRect(7, 3, 2, 1);
        // Fletching
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(6, 12, 1, 2);
        ctx.fillRect(9, 12, 1, 2);
        ctx.fillRect(7, 14, 2, 1);
        return c;
    }

    // -- Material textures --

    genStick() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(7, 2, 2, 12);
        // Shading
        ctx.fillStyle = '#6B3410';
        ctx.fillRect(7, 2, 1, 12);
        return c;
    }

    genCoal() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(4, 4, 8, 8);
        ctx.fillRect(5, 3, 6, 1);
        ctx.fillRect(5, 12, 6, 1);
        // Shine
        ctx.fillStyle = '#333333';
        ctx.fillRect(5, 5, 2, 2);
        return c;
    }

    genIngot(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const rgb = this.hexToRgb(color);
        // Ingot shape
        ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        ctx.fillRect(3, 6, 10, 4);
        ctx.fillRect(4, 5, 8, 1);
        ctx.fillRect(4, 10, 8, 1);
        // Highlight
        ctx.fillStyle = `rgb(${Math.min(255, rgb.r + 40)},${Math.min(255, rgb.g + 40)},${Math.min(255, rgb.b + 40)})`;
        ctx.fillRect(4, 6, 3, 2);
        // Shadow
        ctx.fillStyle = `rgb(${Math.max(0, rgb.r - 40)},${Math.max(0, rgb.g - 40)},${Math.max(0, rgb.b - 40)})`;
        ctx.fillRect(9, 8, 3, 2);
        return c;
    }

    genGem(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const rgb = this.hexToRgb(color);
        // Diamond/gem shape
        ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        ctx.fillRect(6, 3, 4, 2);
        ctx.fillRect(5, 5, 6, 3);
        ctx.fillRect(4, 8, 8, 2);
        ctx.fillRect(5, 10, 6, 2);
        ctx.fillRect(6, 12, 4, 1);
        // Highlight
        ctx.fillStyle = `rgb(${Math.min(255, rgb.r + 60)},${Math.min(255, rgb.g + 60)},${Math.min(255, rgb.b + 60)})`;
        ctx.fillRect(6, 5, 2, 2);
        ctx.fillRect(5, 8, 2, 1);
        return c;
    }

    genDust(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const rgb = this.hexToRgb(color);
        // Scattered dust particles
        for (let i = 0; i < 12; i++) {
            const x = 3 + Math.floor(Math.random() * 10);
            const y = 3 + Math.floor(Math.random() * 10);
            const v = this.varyColor(rgb, 30);
            ctx.fillStyle = `rgb(${v.r},${v.g},${v.b})`;
            ctx.fillRect(x, y, 2, 2);
        }
        return c;
    }

    genLeather() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(3, 3, 10, 10);
        ctx.fillRect(4, 2, 8, 1);
        ctx.fillRect(4, 13, 8, 1);
        // Grain texture
        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = '#6B3410';
            ctx.fillRect(4 + Math.floor(Math.random() * 8), 4 + Math.floor(Math.random() * 8), 2, 1);
        }
        return c;
    }

    genString() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        // Wavy string
        ctx.fillRect(7, 1, 1, 2);
        ctx.fillRect(8, 3, 1, 2);
        ctx.fillRect(7, 5, 1, 2);
        ctx.fillRect(8, 7, 1, 2);
        ctx.fillRect(7, 9, 1, 2);
        ctx.fillRect(8, 11, 1, 2);
        ctx.fillRect(7, 13, 1, 2);
        return c;
    }

    genFeather() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Quill
        ctx.fillStyle = '#F5F5F5';
        ctx.fillRect(7, 2, 2, 3);
        ctx.fillRect(6, 5, 4, 2);
        ctx.fillRect(5, 7, 6, 2);
        ctx.fillRect(4, 9, 8, 2);
        ctx.fillRect(5, 11, 6, 2);
        ctx.fillRect(6, 13, 4, 1);
        // Stem
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(8, 2, 1, 12);
        return c;
    }

    genBone() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#F0F0F0';
        // Top knob
        ctx.fillRect(5, 2, 2, 2);
        ctx.fillRect(9, 2, 2, 2);
        ctx.fillRect(6, 4, 4, 1);
        // Shaft
        ctx.fillRect(7, 4, 2, 8);
        // Bottom knob
        ctx.fillRect(6, 11, 4, 1);
        ctx.fillRect(5, 12, 2, 2);
        ctx.fillRect(9, 12, 2, 2);
        return c;
    }

    genBlazeRod() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Orange/yellow rod
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(7, 1, 2, 14);
        // Glow segments
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(7, 2, 2, 2);
        ctx.fillRect(7, 6, 2, 2);
        ctx.fillRect(7, 10, 2, 2);
        // Bright center
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(7, 3, 2, 1);
        ctx.fillRect(7, 7, 2, 1);
        ctx.fillRect(7, 11, 2, 1);
        return c;
    }

    genGhastTear() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Teardrop shape
        ctx.fillStyle = '#E8E8E8';
        ctx.fillRect(7, 2, 2, 1);
        ctx.fillRect(6, 3, 4, 2);
        ctx.fillRect(5, 5, 6, 3);
        ctx.fillRect(6, 8, 4, 2);
        ctx.fillRect(7, 10, 2, 2);
        // Shine
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(6, 4, 2, 2);
        return c;
    }

    genEnderPearl() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Dark teal sphere
        ctx.fillStyle = '#006060';
        ctx.fillRect(5, 3, 6, 2);
        ctx.fillRect(4, 5, 8, 4);
        ctx.fillRect(5, 9, 6, 2);
        ctx.fillRect(6, 11, 4, 1);
        // Brighter center
        ctx.fillStyle = '#008B8B';
        ctx.fillRect(6, 5, 4, 3);
        // Sparkle
        ctx.fillStyle = '#00CED1';
        ctx.fillRect(7, 6, 2, 1);
        return c;
    }

    genNetherWart() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#800000';
        // Bumpy top
        ctx.fillRect(4, 3, 3, 3);
        ctx.fillRect(9, 3, 3, 3);
        ctx.fillRect(6, 4, 4, 3);
        // Stem
        ctx.fillRect(7, 7, 2, 4);
        // Base
        ctx.fillStyle = '#550000';
        ctx.fillRect(6, 11, 4, 2);
        return c;
    }

    genCocoaBeans() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#915325';
        // Bean shape
        ctx.fillRect(5, 4, 6, 2);
        ctx.fillRect(4, 6, 8, 4);
        ctx.fillRect(5, 10, 6, 2);
        // Darker line
        ctx.fillStyle = '#6B3A18';
        ctx.fillRect(7, 5, 1, 6);
        return c;
    }

    // -- Food textures --

    genApple() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Stem
        ctx.fillStyle = '#654321';
        ctx.fillRect(7, 1, 2, 3);
        // Leaf
        ctx.fillStyle = '#228B22';
        ctx.fillRect(9, 2, 3, 2);
        // Apple body
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(5, 4, 6, 2);
        ctx.fillRect(4, 6, 8, 4);
        ctx.fillRect(5, 10, 6, 2);
        ctx.fillRect(6, 12, 4, 1);
        // Highlight
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(5, 5, 2, 3);
        return c;
    }

    genMeat(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const rgb = this.hexToRgb(color);
        // Meat shape
        ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        ctx.fillRect(4, 4, 8, 3);
        ctx.fillRect(3, 7, 10, 3);
        ctx.fillRect(4, 10, 8, 2);
        // Bone end
        ctx.fillStyle = '#F0F0F0';
        ctx.fillRect(10, 2, 3, 2);
        ctx.fillRect(11, 4, 2, 2);
        // Fat/marbling
        ctx.fillStyle = `rgb(${Math.min(255, rgb.r + 40)},${Math.min(255, rgb.g + 40)},${Math.min(255, rgb.b + 40)})`;
        ctx.fillRect(5, 7, 2, 2);
        return c;
    }

    genFish(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const rgb = this.hexToRgb(color);
        // Body
        ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        ctx.fillRect(5, 6, 2, 4);
        ctx.fillRect(4, 7, 8, 2);
        ctx.fillRect(7, 6, 3, 4);
        // Tail
        ctx.fillRect(12, 5, 2, 2);
        ctx.fillRect(12, 9, 2, 2);
        ctx.fillRect(11, 7, 1, 2);
        // Eye
        ctx.fillStyle = '#000000';
        ctx.fillRect(5, 7, 1, 1);
        // Belly
        ctx.fillStyle = `rgb(${Math.min(255, rgb.r + 30)},${Math.min(255, rgb.g + 30)},${Math.min(255, rgb.b + 30)})`;
        ctx.fillRect(5, 9, 6, 1);
        return c;
    }

    genCarrot() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Green top
        ctx.fillStyle = '#228B22';
        ctx.fillRect(6, 1, 4, 3);
        // Orange body
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(6, 4, 4, 2);
        ctx.fillRect(7, 6, 3, 3);
        ctx.fillRect(8, 9, 2, 3);
        ctx.fillRect(8, 12, 1, 2);
        // Lines
        ctx.fillStyle = '#CC8400';
        ctx.fillRect(7, 5, 1, 1);
        ctx.fillRect(8, 8, 1, 1);
        return c;
    }

    genPotato() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Potato body
        ctx.fillStyle = '#C4A47C';
        ctx.fillRect(5, 5, 6, 2);
        ctx.fillRect(4, 7, 8, 3);
        ctx.fillRect(5, 10, 6, 2);
        // Eyes/spots
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(5, 7, 1, 1);
        ctx.fillRect(8, 8, 1, 1);
        ctx.fillRect(10, 7, 1, 1);
        return c;
    }

    genMelonSlice() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Red flesh
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(4, 4, 8, 4);
        ctx.fillRect(5, 8, 6, 2);
        // Green rind
        ctx.fillStyle = '#008800';
        ctx.fillRect(3, 10, 10, 2);
        // Seeds
        ctx.fillStyle = '#000000';
        ctx.fillRect(6, 6, 1, 1);
        ctx.fillRect(9, 6, 1, 1);
        ctx.fillRect(7, 8, 1, 1);
        return c;
    }

    genWheatItem() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Wheat stalks
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(5, 2, 2, 3);
        ctx.fillRect(9, 2, 2, 3);
        ctx.fillRect(7, 3, 2, 3);
        // Stems
        ctx.fillStyle = '#8B7500';
        ctx.fillRect(6, 5, 1, 8);
        ctx.fillRect(8, 6, 1, 7);
        ctx.fillRect(10, 5, 1, 8);
        return c;
    }

    genSeeds(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const rgb = this.hexToRgb(color);
        // Seeds scattered
        for (let i = 0; i < 6; i++) {
            const x = 4 + Math.floor(Math.random() * 8);
            const y = 5 + Math.floor(Math.random() * 6);
            const v = this.varyColor(rgb, 20);
            ctx.fillStyle = `rgb(${v.r},${v.g},${v.b})`;
            ctx.fillRect(x, y, 2, 1);
        }
        return c;
    }

    // -- Container/misc item textures --

    genBucket(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Bucket body
        ctx.fillStyle = '#808080';
        ctx.fillRect(4, 4, 8, 2);
        ctx.fillRect(3, 6, 10, 6);
        ctx.fillRect(4, 12, 8, 1);
        // Handle
        ctx.fillRect(3, 2, 1, 3);
        ctx.fillRect(12, 2, 1, 3);
        ctx.fillRect(3, 2, 10, 1);
        // Contents
        if (color !== '#C0C0C0') {
            ctx.fillStyle = color;
            ctx.fillRect(4, 5, 8, 3);
        }
        return c;
    }

    genGlassBottle() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Neck
        ctx.fillStyle = '#ADD8E6';
        ctx.fillRect(7, 1, 2, 3);
        // Body
        ctx.fillRect(5, 4, 6, 2);
        ctx.fillRect(4, 6, 8, 4);
        ctx.fillRect(5, 10, 6, 2);
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(5, 5, 2, 4);
        return c;
    }

    genPotion() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Neck
        ctx.fillStyle = '#ADD8E6';
        ctx.fillRect(7, 1, 2, 3);
        // Body
        ctx.fillRect(5, 4, 6, 2);
        ctx.fillRect(4, 6, 8, 4);
        ctx.fillRect(5, 10, 6, 2);
        // Liquid
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(5, 6, 6, 4);
        ctx.fillRect(6, 10, 4, 1);
        return c;
    }

    genEnchantedBook() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Book cover
        ctx.fillStyle = '#800080';
        ctx.fillRect(3, 3, 10, 10);
        // Spine
        ctx.fillStyle = '#500050';
        ctx.fillRect(3, 3, 1, 10);
        // Pages
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(4, 4, 8, 8);
        // Glow/enchant effect
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(6, 5, 4, 1);
        ctx.fillRect(5, 7, 6, 1);
        ctx.fillRect(6, 9, 4, 1);
        return c;
    }

    genSignItem() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Board
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(2, 2, 12, 7);
        // Stick
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(7, 9, 2, 5);
        // Border
        ctx.fillStyle = '#B8860B';
        ctx.fillRect(2, 2, 12, 1);
        ctx.fillRect(2, 8, 12, 1);
        return c;
    }

    genBoatItem() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#8B4513';
        // Hull
        ctx.fillRect(2, 8, 12, 2);
        ctx.fillRect(3, 6, 10, 2);
        ctx.fillRect(4, 10, 8, 2);
        // Inner
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(4, 7, 8, 2);
        return c;
    }

    genMinecartItem() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Cart body
        ctx.fillStyle = '#808080';
        ctx.fillRect(3, 4, 10, 6);
        ctx.fillRect(4, 3, 8, 1);
        // Inner
        ctx.fillStyle = '#555555';
        ctx.fillRect(4, 5, 8, 4);
        // Wheels
        ctx.fillStyle = '#404040';
        ctx.fillRect(4, 10, 2, 2);
        ctx.fillRect(10, 10, 2, 2);
        return c;
    }

    genMusicDisc() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        // Disc
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(4, 3, 8, 2);
        ctx.fillRect(3, 5, 10, 6);
        ctx.fillRect(4, 11, 8, 2);
        // Center hole
        ctx.fillStyle = '#333333';
        ctx.fillRect(7, 6, 2, 3);
        // Color band
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(4, 5, 8, 1);
        ctx.fillRect(4, 10, 8, 1);
        return c;
    }

    // -- Armor textures --

    genHelmet(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const rgb = this.hexToRgb(color);
        ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        // Top dome
        ctx.fillRect(4, 2, 8, 2);
        ctx.fillRect(3, 4, 10, 4);
        ctx.fillRect(4, 8, 8, 2);
        // Face opening
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(5, 6, 6, 3);
        // Highlight
        ctx.fillStyle = `rgb(${Math.min(255, rgb.r + 40)},${Math.min(255, rgb.g + 40)},${Math.min(255, rgb.b + 40)})`;
        ctx.fillRect(4, 3, 3, 2);
        return c;
    }

    genChestplate(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const rgb = this.hexToRgb(color);
        ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        // Shoulders
        ctx.fillRect(2, 2, 4, 3);
        ctx.fillRect(10, 2, 4, 3);
        // Body
        ctx.fillRect(4, 5, 8, 6);
        ctx.fillRect(5, 11, 6, 2);
        // Neck opening
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(6, 2, 4, 2);
        // Highlight
        ctx.fillStyle = `rgb(${Math.min(255, rgb.r + 40)},${Math.min(255, rgb.g + 40)},${Math.min(255, rgb.b + 40)})`;
        ctx.fillRect(5, 5, 2, 3);
        return c;
    }

    genLeggings(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const rgb = this.hexToRgb(color);
        ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        // Waist
        ctx.fillRect(4, 2, 8, 3);
        // Left leg
        ctx.fillRect(4, 5, 3, 8);
        // Right leg
        ctx.fillRect(9, 5, 3, 8);
        // Belt
        ctx.fillStyle = `rgb(${Math.max(0, rgb.r - 40)},${Math.max(0, rgb.g - 40)},${Math.max(0, rgb.b - 40)})`;
        ctx.fillRect(4, 2, 8, 1);
        return c;
    }

    genBoots(color) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const rgb = this.hexToRgb(color);
        ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        // Left boot
        ctx.fillRect(2, 4, 4, 6);
        ctx.fillRect(1, 10, 5, 2);
        // Right boot
        ctx.fillRect(10, 4, 4, 6);
        ctx.fillRect(10, 10, 5, 2);
        // Soles
        ctx.fillStyle = `rgb(${Math.max(0, rgb.r - 50)},${Math.max(0, rgb.g - 50)},${Math.max(0, rgb.b - 50)})`;
        ctx.fillRect(1, 11, 5, 1);
        ctx.fillRect(10, 11, 5, 1);
        return c;
    }

    generateMobTextures() {
        this.mobTextures.cow = this.genMobCow();
        this.mobTextures.pig = this.genMobPig();
        this.mobTextures.sheep = this.genMobSheep();
        this.mobTextures.chicken = this.genMobChicken();
        this.mobTextures.zombie = this.genMobZombie();
        this.mobTextures.skeleton = this.genMobSkeleton();
        this.mobTextures.spider = this.genMobSpider();
        this.mobTextures.creeper = this.genMobCreeper();
        this.mobTextures.enderman = this.genMobEnderman();
        this.mobTextures.wolf = this.genMobWolf();
        this.mobTextures.ocelot = this.genMobOcelot();
        this.mobTextures.villager = this.genMobVillager();
        this.mobTextures.iron_golem = this.genMobIronGolem();
        this.mobTextures.pigman = this.genMobPigman();
        this.mobTextures.ghast = this.genMobGhast();
        this.mobTextures.blaze = this.genMobBlaze();
    }

    genMobBase(w, h, bodyColor, faceYStart) {
        const c = this.createCanvas(w, h);
        const ctx = c.getContext('2d');
        const rgb = this.hexToRgb(bodyColor);
        this.fillNoise(ctx, rgb, 10, w, h);
        // Eyes
        if (faceYStart !== undefined) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(Math.floor(w * 0.25), faceYStart, 2, 2);
            ctx.fillRect(Math.floor(w * 0.6), faceYStart, 2, 2);
            ctx.fillStyle = '#000000';
            ctx.fillRect(Math.floor(w * 0.25) + 1, faceYStart, 1, 2);
            ctx.fillRect(Math.floor(w * 0.6) + 1, faceYStart, 1, 2);
        }
        return c;
    }

    genMobCow() {
        const c = this.createCanvas(8, 16);
        const ctx = c.getContext('2d');
        // Brown body
        this.fillNoise(ctx, { r: 139, g: 69, b: 19 }, 12, 8, 16);
        // White patches
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(1, 3, 3, 4);
        ctx.fillRect(5, 8, 2, 3);
        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(1, 1, 2, 1);
        ctx.fillRect(5, 1, 2, 1);
        ctx.fillStyle = '#000000';
        ctx.fillRect(2, 1, 1, 1);
        ctx.fillRect(6, 1, 1, 1);
        // Snout
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(3, 2, 2, 2);
        return c;
    }

    genMobPig() {
        const c = this.createCanvas(8, 12);
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 255, g: 192, b: 203 }, 10, 8, 12);
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(2, 2, 1, 1);
        ctx.fillRect(5, 2, 1, 1);
        // Snout
        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(3, 3, 2, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(3, 4, 1, 1);
        ctx.fillRect(4, 4, 1, 1);
        return c;
    }

    genMobSheep() {
        const c = this.createCanvas(8, 14);
        const ctx = c.getContext('2d');
        // Wool body (fluffy)
        for (let y = 0; y < 14; y++) {
            for (let x = 0; x < 8; x++) {
                const v = 220 + Math.floor(Math.random() * 35);
                ctx.fillStyle = `rgb(${v},${v},${v})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        // Face (dark)
        ctx.fillStyle = '#808080';
        ctx.fillRect(2, 0, 4, 4);
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(3, 1, 1, 1);
        ctx.fillRect(5, 1, 1, 1);
        // Legs
        ctx.fillStyle = '#808080';
        ctx.fillRect(1, 12, 1, 2);
        ctx.fillRect(6, 12, 1, 2);
        return c;
    }

    genMobChicken() {
        const c = this.createCanvas(6, 10);
        const ctx = c.getContext('2d');
        // White body
        this.fillNoise(ctx, { r: 255, g: 255, b: 255 }, 8, 6, 10);
        // Head
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(1, 0, 4, 3);
        // Eye
        ctx.fillStyle = '#000000';
        ctx.fillRect(2, 1, 1, 1);
        ctx.fillRect(4, 1, 1, 1);
        // Beak
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(2, 2, 2, 1);
        // Wattle
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(3, 3, 1, 1);
        // Legs
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(2, 8, 1, 2);
        ctx.fillRect(4, 8, 1, 2);
        return c;
    }

    genMobZombie() {
        const c = this.createCanvas(8, 16);
        const ctx = c.getContext('2d');
        // Green body
        this.fillNoise(ctx, { r: 46, g: 139, b: 87 }, 15, 8, 16);
        // Blue shirt
        ctx.fillStyle = '#00008B';
        ctx.fillRect(0, 4, 8, 5);
        // Eyes (red)
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(2, 1, 1, 1);
        ctx.fillRect(5, 1, 1, 1);
        // Mouth
        ctx.fillStyle = '#2E4E2E';
        ctx.fillRect(3, 3, 2, 1);
        // Legs (blue)
        ctx.fillStyle = '#000080';
        ctx.fillRect(2, 10, 2, 6);
        ctx.fillRect(5, 10, 2, 6);
        return c;
    }

    genMobSkeleton() {
        const c = this.createCanvas(8, 16);
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.clearRect(0, 0, 8, 16);
        // Skull
        ctx.fillStyle = '#DDDDDD';
        ctx.fillRect(1, 0, 6, 4);
        // Eye sockets
        ctx.fillStyle = '#000000';
        ctx.fillRect(2, 1, 2, 2);
        ctx.fillRect(5, 1, 2, 2);
        // Nose
        ctx.fillRect(4, 2, 1, 1);
        // Ribcage
        ctx.fillStyle = '#DDDDDD';
        ctx.fillRect(2, 4, 1, 6);
        ctx.fillRect(5, 4, 1, 6);
        ctx.fillRect(2, 5, 4, 1);
        ctx.fillRect(2, 7, 4, 1);
        ctx.fillRect(2, 9, 4, 1);
        // Legs
        ctx.fillRect(2, 11, 1, 5);
        ctx.fillRect(5, 11, 1, 5);
        return c;
    }

    genMobSpider() {
        const c = this.createCanvas(12, 8);
        const ctx = c.getContext('2d');
        // Body
        ctx.fillStyle = '#330000';
        ctx.fillRect(3, 2, 6, 4);
        // Head
        ctx.fillRect(1, 2, 3, 3);
        // Eyes (red)
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(1, 2, 1, 1);
        ctx.fillRect(3, 2, 1, 1);
        ctx.fillRect(1, 3, 1, 1);
        ctx.fillRect(3, 3, 1, 1);
        // Legs
        ctx.fillStyle = '#330000';
        ctx.fillRect(0, 1, 1, 1);
        ctx.fillRect(0, 5, 1, 1);
        ctx.fillRect(11, 1, 1, 1);
        ctx.fillRect(11, 5, 1, 1);
        ctx.fillRect(4, 0, 1, 2);
        ctx.fillRect(7, 0, 1, 2);
        ctx.fillRect(4, 6, 1, 2);
        ctx.fillRect(7, 6, 1, 2);
        return c;
    }

    genMobCreeper() {
        const c = this.createCanvas(8, 16);
        const ctx = c.getContext('2d');
        // Green body with mottled texture
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 8; x++) {
                const v = Math.random();
                if (v > 0.5) {
                    ctx.fillStyle = '#00CC00';
                } else {
                    ctx.fillStyle = '#009900';
                }
                ctx.fillRect(x, y, 1, 1);
            }
        }
        // Face (iconic creeper face)
        ctx.fillStyle = '#000000';
        // Eyes
        ctx.fillRect(1, 2, 2, 2);
        ctx.fillRect(5, 2, 2, 2);
        // Mouth
        ctx.fillRect(3, 4, 2, 1);
        ctx.fillRect(2, 5, 4, 2);
        ctx.fillRect(3, 7, 2, 1);
        // Legs
        ctx.fillRect(1, 12, 2, 4);
        ctx.fillRect(5, 12, 2, 4);
        return c;
    }

    genMobEnderman() {
        const c = this.createCanvas(6, 24);
        const ctx = c.getContext('2d');
        // Tall black body
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 6, 24);
        // Add slight purple tint
        for (let y = 0; y < 24; y++) {
            for (let x = 0; x < 6; x++) {
                if (Math.random() > 0.7) {
                    ctx.fillStyle = 'rgba(80,0,80,0.3)';
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        // Eyes (purple)
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(1, 2, 1, 1);
        ctx.fillRect(4, 2, 1, 1);
        return c;
    }

    genMobWolf() {
        const c = this.createCanvas(8, 10);
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 169, g: 169, b: 169 }, 12, 8, 10);
        // Snout
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(3, 1, 2, 2);
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(2, 1, 1, 1);
        ctx.fillRect(5, 1, 1, 1);
        // Ears
        ctx.fillStyle = '#808080';
        ctx.fillRect(1, 0, 2, 1);
        ctx.fillRect(5, 0, 2, 1);
        // Belly
        ctx.fillStyle = '#E0E0E0';
        ctx.fillRect(2, 5, 4, 3);
        return c;
    }

    genMobOcelot() {
        const c = this.createCanvas(6, 10);
        const ctx = c.getContext('2d');
        this.fillNoise(ctx, { r: 255, g: 255, b: 0 }, 15, 6, 10);
        // Spots
        ctx.fillStyle = '#8B6914';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 6) + 3, 1, 1);
        }
        // Eyes
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(1, 1, 1, 1);
        ctx.fillRect(4, 1, 1, 1);
        return c;
    }

    genMobVillager() {
        const c = this.createCanvas(8, 16);
        const ctx = c.getContext('2d');
        // Brown robe
        this.fillNoise(ctx, { r: 139, g: 69, b: 19 }, 10, 8, 16);
        // Head (skin)
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(1, 0, 6, 5);
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(2, 2, 1, 1);
        ctx.fillRect(5, 2, 1, 1);
        // Nose
        ctx.fillStyle = '#C4A07A';
        ctx.fillRect(3, 3, 2, 2);
        // Green robe body
        ctx.fillStyle = '#006400';
        ctx.fillRect(0, 5, 8, 8);
        return c;
    }

    genMobIronGolem() {
        const c = this.createCanvas(12, 22);
        const ctx = c.getContext('2d');
        // Light gray metallic body
        this.fillNoise(ctx, { r: 192, g: 192, b: 192 }, 10, 12, 22);
        // Eyes
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(3, 3, 2, 1);
        ctx.fillRect(7, 3, 2, 1);
        // Nose
        ctx.fillStyle = '#808080';
        ctx.fillRect(5, 4, 2, 2);
        // Vine/plant
        ctx.fillStyle = '#228B22';
        ctx.fillRect(1, 8, 1, 4);
        return c;
    }

    genMobPigman() {
        const c = this.createCanvas(8, 16);
        const ctx = c.getContext('2d');
        // Pink/zombie skin
        this.fillNoise(ctx, { r: 180, g: 100, b: 100 }, 15, 8, 16);
        // Eyes
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(2, 2, 1, 1);
        ctx.fillRect(5, 2, 1, 1);
        // Golden sword
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(7, 5, 1, 6);
        // Loincloth
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(1, 8, 6, 3);
        return c;
    }

    genMobGhast() {
        const c = this.createCanvas(16, 16);
        const ctx = c.getContext('2d');
        // White body
        this.fillNoise(ctx, { r: 240, g: 240, b: 240 }, 8, 16, 16);
        // Eyes (sad)
        ctx.fillStyle = '#000000';
        ctx.fillRect(4, 4, 2, 3);
        ctx.fillRect(10, 4, 2, 3);
        // Mouth
        ctx.fillStyle = '#800000';
        ctx.fillRect(6, 8, 4, 2);
        // Tentacles
        ctx.fillStyle = '#D0D0D0';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(2 + i * 3, 14, 1, 2);
        }
        return c;
    }

    genMobBlaze() {
        const c = this.createCanvas(8, 14);
        const ctx = c.getContext('2d');
        // Yellow fiery body
        for (let y = 0; y < 14; y++) {
            for (let x = 0; x < 8; x++) {
                const r = 200 + Math.floor(Math.random() * 55);
                const g = 100 + Math.floor(Math.random() * 100);
                ctx.fillStyle = `rgb(${r},${g},0)`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(2, 2, 1, 1);
        ctx.fillRect(5, 2, 1, 1);
        // Rods
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(0, 5, 1, 4);
        ctx.fillRect(7, 5, 1, 4);
        ctx.fillRect(0, 10, 1, 3);
        ctx.fillRect(7, 10, 1, 3);
        return c;
    }

    // --- Access Methods ---

    getBlockTexture(blockType) {
        return this.textures[blockType] || null;
    }

    getMobTexture(mobType) {
        return this.mobTextures[mobType] || null;
    }
}

window.TextureManager = TextureManager;
