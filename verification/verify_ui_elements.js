const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const dom = new JSDOM(indexHtml);
global.window = dom.window;
global.document = dom.window.document;

console.log('--- Verifying UI Elements ---');

const rbScreen = document.getElementById('recipe-book-screen');
if (rbScreen) {
    console.log('✅ Recipe Book Screen found.');
} else {
    console.error('❌ Recipe Book Screen MISSING.');
}

const openBtn = document.getElementById('open-recipe-book');
if (openBtn) {
    console.log('✅ Open Recipe Book Button found.');
} else {
    console.error('❌ Open Recipe Book Button MISSING.');
}

const closeBtn = document.getElementById('close-recipe-book');
if (closeBtn) {
    console.log('✅ Close Recipe Book Button found.');
} else {
    console.error('❌ Close Recipe Book Button MISSING.');
}

console.log('--- Verification Complete ---');
