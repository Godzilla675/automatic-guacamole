const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM('<!DOCTYPE html><body></body>');
global.window = dom.window;
global.document = dom.window.document;

// Load blocks.js
const blocksContent = fs.readFileSync('js/blocks.js', 'utf8');
eval(blocksContent);

const expectedBlocks = [
    'BIRCH_WOOD', 'BIRCH_LEAVES', 'BIRCH_PLANK',
    'JUNGLE_WOOD', 'JUNGLE_LEAVES', 'JUNGLE_PLANK',
    'COCOA_BLOCK', 'SANDSTONE',
    'ITEM_COCOA_BEANS', 'ITEM_COOKED_FISH', 'ITEM_EMERALD'
];

let errors = [];

expectedBlocks.forEach(name => {
    if (window.BLOCK[name] === undefined) {
        errors.push(`Missing constant BLOCK.${name}`);
    } else {
        const id = window.BLOCK[name];
        if (!window.BLOCKS[id]) {
            errors.push(`Missing definition BLOCKS[BLOCK.${name}] (ID ${id})`);
        } else {
            console.log(`Verified ${name}: ID ${id}, Name "${window.BLOCKS[id].name}"`);
        }
    }
});

if (errors.length > 0) {
    console.error('Errors found:');
    errors.forEach(e => console.error(e));
    process.exit(1);
} else {
    console.log('All new blocks verified successfully.');
}
