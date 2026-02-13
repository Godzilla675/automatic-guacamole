const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM('<!DOCTYPE html><body></body>');
global.window = dom.window;
global.document = dom.window.document;

// Load blocks.js
const blocksContent = fs.readFileSync('js/blocks.js', 'utf8');
eval(blocksContent);

// Load entity.js
const entityContent = fs.readFileSync('js/entity.js', 'utf8');
eval(entityContent);

// Load mob.js
const mobContent = fs.readFileSync('js/mob.js', 'utf8');
eval(mobContent);

// Mock Game
const gameMock = {
    world: {
        getBlock: () => 0
    },
    mobs: []
};

// Verify Mob Types
const typesToCheck = ['WOLF', 'OCELOT', 'VILLAGER', 'IRON_GOLEM'];
let errors = [];

typesToCheck.forEach(type => {
    if (!window.MOB_TYPE[type]) {
        errors.push(`Missing MOB_TYPE.${type}`);
    } else {
        try {
            const mob = new window.Mob(gameMock, 0, 0, 0, window.MOB_TYPE[type]);
            console.log(`Created ${type}: Health=${mob.maxHealth}, Speed=${mob.speed}`);

            if (type === 'WOLF' && mob.maxHealth !== 8) errors.push('Wolf health wrong');
            if (type === 'IRON_GOLEM' && mob.maxHealth !== 100) errors.push('Golem health wrong');

            // Verify AI methods exist
            if (typeof mob.updateAI !== 'function') errors.push('Missing updateAI');
        } catch (e) {
            errors.push(`Error creating ${type}: ${e.message}`);
        }
    }
});

if (errors.length > 0) {
    console.error('Errors found:');
    errors.forEach(e => console.error(e));
    process.exit(1);
} else {
    console.log('All new mobs verified.');
}
