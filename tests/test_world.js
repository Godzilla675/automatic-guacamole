const assert = require('assert');
const { JSDOM } = require('jsdom');

const dom = new JSDOM(`<!DOCTYPE html>`);
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
    store: {},
    setItem: function(k, v) { this.store[k] = v; },
    getItem: function(k) { return this.store[k]; }
};

// Mock globals
global.Chunk = class Chunk {
    constructor(cx, cz) {
        this.cx = cx;
        this.cz = cz;
        this.blocks = new Uint8Array(10); // dummy
        this.modified = false;
    }
    updateVisibleBlocks() {}
}
global.alert = (msg) => {};

// Load World code
const fs = require('fs');
const worldCode = fs.readFileSync('js/world.js', 'utf8');
eval(worldCode);

describe('World Saving', () => {
    let world;

    beforeEach(() => {
        world = new window.World();
        world.chunks.set("0,0", new global.Chunk(0, 0));
        global.localStorage.store = {};
    });

    it('should save to default slot if no name provided', () => {
        world.saveWorld();
        assert.ok(global.localStorage.store['voxelWorldSave_default']);
    });

    it('should save to specific slot', () => {
        world.saveWorld('slot1');
        assert.ok(global.localStorage.store['voxelWorldSave_slot1']);
    });

    it('should load from specific slot', () => {
        global.localStorage.store['voxelWorldSave_slot2'] = JSON.stringify({ seed: 123, chunks: [] });
        world.loadWorld('slot2');
        assert.strictEqual(world.seed, 123);
    });
});
