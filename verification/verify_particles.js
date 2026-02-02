const assert = require('assert');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

require('../js/particles.js');

console.log('Verifying Particles...');

const game = {};
const ps = new window.ParticleSystem(game);

ps.spawn(0, 10, 0, '#FFF', 1);
assert.strictEqual(ps.particles.length, 1, 'Particles spawned');

const p = ps.particles[0];
const initialVy = p.vy;

ps.update(0.1);

assert.ok(p.vy < initialVy, 'Gravity reduced vy');
console.log('Particles Verified!');
