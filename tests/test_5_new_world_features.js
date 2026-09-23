const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('5 New Major World Generation Features Test Suite', function() {
    this.timeout(10000);
    let dom;
    let window;

    beforeEach(() => {
        dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
            runScripts: "dangerously",
            resources: "usable"
        });
        window = dom.window;
        global.window = window;
        global.document = window.document;

        // Mocks for canvas context
        window.HTMLCanvasElement.prototype.getContext = function () {
            return {
                fillRect: () => {},
                clearRect: () => {},
                getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
                putImageData: () => {},
                createImageData: () => ([]),
                setTransform: () => {},
                drawImage: () => {},
                save: () => {},
                fillText: () => {},
                restore: () => {},
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                stroke: () => {},
                createPattern: () => ({ setTransform: () => {} })
            };
        };

        window.perlin = {
            noise: (x, y, z) => Math.sin(x) * Math.cos(y || 0) * 0.5
        };

        const loadScript = (filePath) => {
            const code = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
            eval(code);
        };

        loadScript('js/blocks.js');
        global.BLOCK = window.BLOCK;
        global.BLOCKS = window.BLOCKS;

        loadScript('js/textures.js');
        loadScript('js/biome.js');
        global.BiomeManager = window.BiomeManager;

        loadScript('js/village.js');
        loadScript('js/structures.js');
        global.StructureManager = window.StructureManager;

        loadScript('js/world.js');
        global.World = window.World;

        class MockChunk {
            constructor(cx, cz) {
                this.cx = cx;
                this.cz = cz;
                this.blocks = new Uint16Array(16 * 128 * 16);
                this.metadata = new Uint8Array(16 * 128 * 16);
            }
            getBlock(x, y, z) {
                return this.blocks[x + z * 16 + y * 256];
            }
            setBlock(x, y, z, type) {
                this.blocks[x + z * 16 + y * 256] = type;
            }
            getMetadata(x, y, z) {
                return this.metadata[x + z * 16 + y * 256];
            }
            setMetadata(x, y, z, val) {
                this.metadata[x + z * 16 + y * 256] = val;
            }
            getLight() { return 15; }
            setLight() {}
            pack() { return { blocks: this.blocks, metadata: this.metadata }; }
            unpack(data) { if (data.blocks) this.blocks = data.blocks; }
        }
        global.Chunk = MockChunk;
        window.Chunk = MockChunk;
    });

    it('Feature 1: PACKED_ICE block exists and has valid properties', () => {
        assert.ok(window.BLOCK.PACKED_ICE, 'PACKED_ICE block ID defined');
        const def = window.BLOCKS[window.BLOCK.PACKED_ICE];
        assert.ok(def, 'PACKED_ICE definition exists in BLOCKS');
        assert.strictEqual(def.name, 'Packed Ice');
        assert.strictEqual(def.solid, true);
    });

    it('Feature 2: ICE_SPIKES, SNOWY_TAIGA, and BADLANDS biomes are configured in BiomeManager', () => {
        const bm = new window.BiomeManager(12345);
        assert.ok(bm.biomes.ICE_SPIKES, 'ICE_SPIKES biome registered');
        assert.ok(bm.biomes.SNOWY_TAIGA, 'SNOWY_TAIGA biome registered');
        assert.ok(bm.biomes.BADLANDS, 'BADLANDS biome registered');

        assert.strictEqual(bm.biomes.ICE_SPIKES.underBlock, window.BLOCK.PACKED_ICE);
        assert.strictEqual(bm.biomes.SNOWY_TAIGA.snow, true);
        assert.strictEqual(bm.biomes.BADLANDS.underBlock, window.BLOCK.CONCRETE_ORANGE);
    });

    it('Feature 3: Ice Spike structure generation places Packed Ice blocks', () => {
        const world = new window.World();
        const sm = new window.StructureManager(world);
        const chunk = new window.Chunk(0, 0);
        world.chunks.set("0,0", chunk);

        sm.generateIceSpike(chunk, 8, 20, 8);
        assert.strictEqual(world.getBlock(8, 20, 8), window.BLOCK.PACKED_ICE);
    });

    it('Feature 4: Igloo structure generation places snow dome and interior items', () => {
        const world = new window.World();
        const sm = new window.StructureManager(world);
        const chunk = new window.Chunk(0, 0);
        world.chunks.set("0,0", chunk);

        sm.generateIgloo(chunk, 8, 20, 8);
        assert.strictEqual(world.getBlock(8, 20, 8), window.BLOCK.BED);
        assert.strictEqual(world.getBlock(7, 20, 8), window.BLOCK.FURNACE);
    });

    it('Feature 5: Nether Fortress structure generation builds Nether Brick corridors', () => {
        const world = new window.World();
        const sm = new window.StructureManager(world);
        const chunk = new window.Chunk(0, 0);
        world.chunks.set("0,0", chunk);

        sm.generateNetherFortress(chunk, 8, 30, 8);
        assert.strictEqual(world.getBlock(8, 30, 8), window.BLOCK.NETHER_BRICK);
        assert.strictEqual(world.getBlock(8, 31, 8), window.BLOCK.SOUL_SAND);
        assert.strictEqual(world.getBlock(8, 32, 8), window.BLOCK.ITEM_NETHER_WART);
    });
});
