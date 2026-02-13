const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    runScripts: "dangerously",
    resources: "usable"
});
global.window = dom.window;
global.document = dom.window.document;

// Mock Perlin for deterministic biomes
window.perlin = {
    noise: () => 0.6
};

// Mock LocalStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: key => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: key => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Load scripts
const scripts = [
    'js/math.js',
    'js/blocks.js',
    'js/chunk.js',
    'js/biome.js',
    'js/structures/Tree.js',
    'js/structures/Cactus.js',
    'js/structures/Well.js',
    'js/structures.js',
    'js/world.js'
];

scripts.forEach(script => {
    const content = fs.readFileSync(path.join(__dirname, '../', script), 'utf8');
    dom.window.eval(content);
});

// Test Logic
const World = dom.window.World;
const BLOCK = dom.window.BLOCK;

console.log('--- Verifying World Gen ---');

const world = new World();
console.log('World initialized.');

if (!world.biomeManager) {
    console.error('❌ BiomeManager not initialized in World.');
    process.exit(1);
}
console.log('✅ BiomeManager initialized.');

if (!world.structureManager) {
    console.error('❌ StructureManager not initialized in World.');
    process.exit(1);
}
console.log('✅ StructureManager initialized.');

if (typeof world.structureManager.generateJungleTree !== 'function' || typeof world.structureManager.generateVillage !== 'function') {
    console.error('❌ StructureManager missing required generation methods.');
    process.exit(1);
}
console.log('✅ StructureManager generation methods present.');

// Helper to find specific biome
function findBiome(type) {
    for (let x = 0; x < 20000; x+=100) {
        for (let z = 0; z < 20000; z+=100) {
            const biome = world.biomeManager.getBiome(x, z);
            if (biome.name === type) return {x, z};
        }
    }
    return null;
}

// Check Desert
const desertPos = findBiome('Desert');
if (desertPos) {
    console.log(`Found Desert at ${desertPos.x}, ${desertPos.z}`);
    const cx = Math.floor(desertPos.x / 16);
    const cz = Math.floor(desertPos.z / 16);
    world.generateChunk(cx, cz);
    const chunk = world.getChunk(cx, cz);

    let hasSand = false;
    let hasCactus = false;

    for(let x=0; x<16; x++) {
        for(let z=0; z<16; z++) {
             for(let y=60; y>0; y--) {
                 const b = chunk.getBlock(x, y, z);
                 if (b === BLOCK.SAND) hasSand = true;
                 if (b === BLOCK.CACTUS) hasCactus = true;
             }
        }
    }

    if (hasSand) console.log('✅ Desert has Sand.');
    else console.error('❌ Desert missing Sand.');

    if (hasCactus) console.log('✅ Desert has Cactus.');
    else console.warn('⚠️ Desert missing Cactus (could be bad luck).');

} else {
    console.warn('⚠️ Could not find Desert biome in search range.');
}

// Check Snow
const snowPos = findBiome('Snow');
if (snowPos) {
    console.log(`Found Snow at ${snowPos.x}, ${snowPos.z}`);
    const cx = Math.floor(snowPos.x / 16);
    const cz = Math.floor(snowPos.z / 16);
    world.generateChunk(cx, cz);
    const chunk = world.getChunk(cx, cz);

    let hasSnow = false;
    for(let x=0; x<16; x++) {
        for(let z=0; z<16; z++) {
             for(let y=60; y>0; y--) {
                 const b = chunk.getBlock(x, y, z);
                 if (b === BLOCK.SNOW) hasSnow = true;
             }
        }
    }
    if (hasSnow) console.log('✅ Snow biome has Snow blocks.');
    else console.error('❌ Snow biome missing Snow blocks.');
} else {
    console.warn('⚠️ Could not find Snow biome in search range.');
}

console.log('--- Verification Complete ---');
