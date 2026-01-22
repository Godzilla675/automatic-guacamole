const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');

const dom = new JSDOM(`<!DOCTYPE html>`, {
    runScripts: "dangerously",
    url: "http://localhost/"
});
// Don't set global.window

// Mock globals
dom.window.Chunk = class Chunk {
    constructor(cx, cz) {
        this.cx = cx;
        this.cz = cz;
        this.blocks = new Uint8Array(10); // dummy
        this.modified = false;
    }
    updateVisibleBlocks() {}
}
dom.window.alert = (msg) => {};

// Load World code
const worldCode = fs.readFileSync('js/world.js', 'utf8');
dom.window.eval(worldCode);

describe('World Saving', () => {
    let world;

    beforeEach(() => {
        world = new dom.window.World();
        world.chunks.set("0,0", new dom.window.Chunk(0, 0));
        dom.window.localStorage.clear();
    });

    it('should save to default slot if no name provided', () => {
        world.saveWorld();
        assert.ok(dom.window.localStorage.getItem('voxelWorldSave_default'));
    });

    it('should save to specific slot', () => {
        world.saveWorld('slot1');
        assert.ok(dom.window.localStorage.getItem('voxelWorldSave_slot1'));
    });

    it('should load from specific slot', () => {
        dom.window.localStorage.setItem('voxelWorldSave_slot2', JSON.stringify({ seed: 123, chunks: [] }));
        world.loadWorld('slot2');
        assert.strictEqual(world.seed, 123);
    });
});
