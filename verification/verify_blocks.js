const fs = require('fs');
const vm = require('vm');
const path = require('path');

// Read blocks.js
const blocksCode = fs.readFileSync(path.join(__dirname, '../js/blocks.js'), 'utf8');

// Create a sandbox to execute the code
const sandbox = { window: {} };
vm.createContext(sandbox);

// Execute blocks.js
vm.runInContext(blocksCode, sandbox);

const BLOCK = sandbox.window.BLOCK || sandbox.BLOCK;
const BLOCKS = sandbox.window.BLOCKS || sandbox.BLOCKS;

if (!BLOCK) {
    console.error("FATAL: BLOCK object not found in sandbox.");
    process.exit(1);
}

console.log('--- Verification Report ---');

// Check Concrete
if (BLOCK.CONCRETE !== undefined || Object.values(BLOCKS).some(b => b.name && b.name.includes('concrete'))) {
    console.log('✅ Concrete Block found.');
} else {
    console.log('❌ Concrete Block MISSING.');
}

// Check Wool Colors
// We look for multiple wool blocks or colored wool definitions
const woolBlocks = Object.values(BLOCKS).filter(b => b.name && b.name.toLowerCase().includes('wool') && !b.isItem);
if (woolBlocks.length > 1) {
    console.log(`✅ Found ${woolBlocks.length} Wool Block variants.`);
} else if (woolBlocks.length === 1) {
    console.log(`⚠️ Found 1 Wool Block/Item: ${woolBlocks[0].name}. (Expected multiple colors if "Wool Colors" is implemented)`);
} else {
    console.log('❌ No Wool Blocks found.');
}

// Check if ITEM_WOOL is placeable
const itemWoolId = BLOCK.ITEM_WOOL;
if (itemWoolId) {
    const itemWoolDef = BLOCKS[itemWoolId];
    if (itemWoolDef.isItem) {
        console.log(`ℹ️ ITEM_WOOL (ID ${itemWoolId}) is marked as 'isItem: true'. It might not be placeable as a block.`);
    } else {
        console.log(`✅ ITEM_WOOL (ID ${itemWoolId}) seems to be a block (isItem false or undefined).`);
    }
} else {
    console.log('❌ ITEM_WOOL definition missing in BLOCK enum.');
}

// Check Slabs and Stairs (Just in case)
if (Object.values(BLOCKS).some(b => b.name && (b.name.includes('slab') || b.name.includes('stair')))) {
    console.log('✅ Slabs/Stairs found.');
} else {
    console.log('❌ Slabs/Stairs MISSING (Expected).');
}

console.log('--- End Report ---');
