const assert = require('assert');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

require('../js/blocks.js');
global.BLOCKS = window.BLOCKS;
global.BLOCK = window.BLOCK;

require('../js/chunk.js');
require('../js/world.js');
require('../js/physics.js');
require('../js/player.js');

window.BiomeManager = class { constructor() {} getBiome() { return {}; } };
window.StructureManager = class { constructor() {} };
window.perlin = { noise: () => 0 };
window.soundManager = { play: () => {} };

console.log('Verifying XP System...');

const game = {
    world: new window.World(),
    physics: { getFluidIntersection: () => false, getCollidingBlocks: () => [] },
    controls: {}
};
game.world.game = game;

const player = new window.Player(game);

// 1. Initial State
assert.strictEqual(player.level, 0, 'Level 0 start');
assert.strictEqual(player.xp, 0, 'XP 0 start');

// 2. Add XP
// Level 0 needs 7 XP.
player.addXP(3);
console.log('XP:', player.xp); // 3/7 approx 0.42
assert.ok(player.xp > 0.4 && player.xp < 0.43, 'XP progress correct');
assert.strictEqual(player.level, 0, 'Still level 0');

player.addXP(4); // Total 7
assert.strictEqual(player.level, 1, 'Level up to 1');
assert.strictEqual(player.xp, 0, 'XP reset (exact match)');

// Level 1 needs 7 + 1*2 = 9 XP.
player.addXP(4.5);
assert.strictEqual(player.xp, 0.5, 'XP progress 50%');

console.log('XP System Verified!');
