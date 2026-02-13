const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM('<!DOCTYPE html><body></body>');
global.window = dom.window;
global.document = dom.window.document;

// Load blocks.js
const blocksContent = fs.readFileSync('js/blocks.js', 'utf8');
eval(blocksContent);
global.BLOCK = window.BLOCK;
global.BLOCKS = window.BLOCKS;

// Load crafting.js
const craftingContent = fs.readFileSync('js/crafting.js', 'utf8');
eval(craftingContent);

// Mock Game
const gameMock = {};
const crafting = new window.CraftingSystem(gameMock);

// Verify Recipes
const expectedRecipes = ["Birch Planks (4)", "Jungle Planks (4)", "Brown Wool"];
let errors = [];

expectedRecipes.forEach(name => {
    if (!crafting.recipes.find(r => r.name === name)) {
        errors.push(`Missing recipe: ${name}`);
    } else {
        console.log(`Verified recipe: ${name}`);
    }
});

// Verify Smelting
const smelting = crafting.getSmeltingResult(window.BLOCK.ITEM_RAW_FISH);
if (!smelting || smelting.type !== window.BLOCK.ITEM_COOKED_FISH) {
    errors.push("Missing smelting recipe for Cooked Fish");
} else {
    console.log("Verified smelting: Raw Fish -> Cooked Fish");
}

if (errors.length > 0) {
    console.error('Errors found:');
    errors.forEach(e => console.error(e));
    process.exit(1);
} else {
    console.log('All new recipes verified.');
}
