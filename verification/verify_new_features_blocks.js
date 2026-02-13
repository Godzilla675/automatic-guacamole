const assert = require('assert');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

// Load blocks.js
require('../js/blocks.js');

console.log('Verifying new blocks...');

const requiredBlocks = [
    'PISTON', 'PISTON_HEAD', 'STICKY_PISTON', 'STICKY_PISTON_HEAD',
    'NETHERRACK', 'SOUL_SAND', 'GLOWSTONE', 'NETHER_BRICK', 'QUARTZ_ORE', 'OBSIDIAN', 'PORTAL',
    'BREWING_STAND', 'CAULDRON', 'ENCHANTING_TABLE', 'RAIL'
];

const requiredItems = [
    'ITEM_QUARTZ', 'ITEM_BLAZE_ROD', 'ITEM_GHAST_TEAR', 'ITEM_NETHER_WART',
    'ITEM_GLOWSTONE_DUST', 'ITEM_GLASS_BOTTLE', 'ITEM_POTION', 'ITEM_ENCHANTED_BOOK',
    'ITEM_LAPIS_LAZULI', 'ITEM_MINECART', 'ITEM_BOAT', 'ITEM_SIGN', 'ITEM_BUCKET'
];

let failed = false;

requiredBlocks.forEach(name => {
    if (window.BLOCK[name] === undefined) {
        console.error(`Missing Block: ${name}`);
        failed = true;
    } else {
        const id = window.BLOCK[name];
        if (!window.BLOCKS[id]) {
            console.error(`Block definition missing for ID: ${id} (${name})`);
            failed = true;
        }
    }
});

requiredItems.forEach(name => {
    if (window.BLOCK[name] === undefined) {
        console.error(`Missing Item: ${name}`);
        failed = true;
    } else {
         const id = window.BLOCK[name];
         if (!window.BLOCKS[id]) {
             console.error(`Item definition missing for ID: ${id} (${name})`);
             failed = true;
         }
    }
});

if (failed) {
    console.error('Verification Failed');
    process.exit(1);
} else {
    console.log('All new blocks and items verified successfully!');
}
