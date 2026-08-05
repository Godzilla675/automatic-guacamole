const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
dom.window.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
setTimeout(() => {
    if(!dom.window.Game) { console.log("Game not loaded"); return; }
    const game = new dom.window.Game();
    // try to use Anvil
    console.log(game.ui.openAnvil ? "Anvil UI exists" : "Anvil UI missing");
    process.exit(0);
}, 2000);
