const assert = require('assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Setup JSDOM
const dom = new JSDOM(`<!DOCTYPE html><body></body>`, {
    runScripts: "dangerously",
    url: "http://localhost/"
});

// Mock Globals
dom.window.document = dom.window.document;
dom.window.HTMLElement = dom.window.HTMLElement;
dom.window.navigator = { userAgent: "node", maxTouchPoints: 0 };
dom.window.WebSocket = class { constructor() { this.readyState = 1; } send() {} close() {} };
dom.window.AudioContext = class {
    createOscillator() { return { connect:()=>{}, start:()=>{}, stop:()=>{}, frequency:{setValueAtTime:()=>{}, exponentialRampToValueAtTime:()=>{}} }; }
    createGain() { return { connect:()=>{}, gain:{value:0, setValueAtTime:()=>{}, exponentialRampToValueAtTime:()=>{}} }; }
    createBuffer() { return { getChannelData:()=>new Float32Array(1024) }; }
    createBufferSource() { return { connect:()=>{}, start:()=>{}, stop:()=>{}, buffer:null, loop:false }; }
    createBiquadFilter() { return { connect:()=>{}, frequency:{value:0} }; }
    resume() {}
    get state() { return 'running'; }
};
// Minimal Canvas Mock
dom.window.document.getElementById = (id) => {
    if(id==='game-canvas') return {
        getContext: () => ({
            setTransform:()=>{}, fillRect:()=>{}, clearRect:()=>{}, save:()=>{}, restore:()=>{}, scale:()=>{}, translate:()=>{}, createLinearGradient:()=>{ return {addColorStop:()=>{}} }, measureText:()=>{ return {width:0} }, fillText:()=>{}, beginPath:()=>{}, moveTo:()=>{}, lineTo:()=>{}, fill:()=>{}, strokeRect:()=>{}
        }),
        requestPointerLock: ()=>{}
    };
    return {
        classList: { add:()=>{}, remove:()=>{}, toggle:()=>{}, contains:()=>false },
        addEventListener: ()=>{},
        appendChild: ()=>{},
        children: [],
        style: {} // For Mocking style.width
    };
};
dom.window.document.exitPointerLock = ()=>{};

// Mock Perlin
dom.window.perlin = { noise: () => 0 };

// Mock localStorage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: function(key) { return store[key] || null; },
        setItem: function(key, value) { store[key] = value.toString(); },
        clear: function() { store = {}; },
        removeItem: function(key) { delete store[key]; }
    };
})();
dom.window.localStorage = localStorageMock;

// Mock alert
dom.window.alert = (msg) => { console.log("Alert:", msg); };

// Load Scripts
const load = (f) => {
    try {
        const code = fs.readFileSync(path.join('js', f), 'utf8');
        dom.window.eval(code);
    } catch (e) {
        console.error("Error loading " + f, e);
    }
};

['math.js', 'blocks.js', 'chunk.js', 'biome.js', 'structures/Tree.js', 'structures/Cactus.js', 'structures/Well.js', 'structures.js', 'world.js'].forEach(load);

// Test Logic
async function runTest() {
    console.log("Starting Persistence Test...");

    const World = dom.window.World;
    const world = new World();

    // 1. Set Block Entity
    console.log("Setting block entity...");
    world.setBlockEntity(10, 10, 10, { type: 'furnace', fuel: 100 });

    const entity = world.getBlockEntity(10, 10, 10);
    assert.deepStrictEqual(entity, { type: 'furnace', fuel: 100 }, "Entity should be set in memory");

    // 2. Save World
    console.log("Saving world...");
    world.saveWorld('test_save');

    // Check localStorage
    const savedData = dom.window.localStorage.getItem('voxelWorldSave_test_save');
    assert.ok(savedData, "Data should be in localStorage");
    const parsed = JSON.parse(savedData);
    assert.ok(parsed.blockEntities, "Save data should contain blockEntities");
    assert.deepStrictEqual(parsed.blockEntities['10,10,10'], { type: 'furnace', fuel: 100 }, "Save data should match");

    // 3. Clear World
    console.log("Clearing world...");
    world.blockEntities.clear();
    assert.strictEqual(world.getBlockEntity(10, 10, 10), undefined, "Entity cleared");

    // 4. Load World
    console.log("Loading world...");
    world.loadWorld('test_save');

    const loadedEntity = world.getBlockEntity(10, 10, 10);
    console.log("Loaded Entity:", JSON.stringify(loadedEntity));
    // Manual check to debug
    assert.strictEqual(loadedEntity.type, 'furnace');
    assert.strictEqual(loadedEntity.fuel, 100);

    // 5. Test setBlock removal
    console.log("Testing setBlock removal...");

    // Ensure chunk exists so setBlock executes immediately
    world.generateChunk(0, 0);

    world.setBlock(10, 10, 10, dom.window.BLOCK.AIR);
    assert.strictEqual(world.getBlockEntity(10, 10, 10), undefined, "Entity removed after setBlock");

    console.log("✅ Persistence Test Passed!");
}

runTest().catch(e => {
    console.error("❌ Test Failed:", e);
    process.exit(1);
});
