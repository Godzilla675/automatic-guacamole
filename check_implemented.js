const fs = require('fs');

const featuresFile = fs.readFileSync('FUTURE_FEATURES.md', 'utf8');
const lines = featuresFile.split('\n').filter(l => l.includes('- [ ]'));

const codeFiles = [
    'js/game.js', 'js/world.js', 'js/player.js', 'js/mob.js',
    'js/renderer.js', 'js/ui.js', 'js/blocks.js', 'js/structures.js',
    'js/item_use.js', 'js/biome.js', 'js/particles.js'
];

let allCode = '';
for (const file of codeFiles) {
    if (fs.existsSync(file)) {
        allCode += fs.readFileSync(file, 'utf8') + '\n';
    }
}

for (const line of lines) {
    // Extract key nouns from the line
    const match = line.match(/\*\*([^*]+)\*\*/);
    if (match) {
        const title = match[1];
        // simple heuristic
        const keywords = title.replace(/New Task: /g, '').replace(/Add /g, '').replace(/Implement /g, '').split(' ').filter(w => w.length > 3);
        let foundCount = 0;
        for (const kw of keywords) {
            if (allCode.toLowerCase().includes(kw.toLowerCase())) {
                foundCount++;
            }
        }
        if (foundCount > 0 && foundCount >= keywords.length * 0.5) {
            console.log(`Potential match for "${title}": found ${foundCount}/${keywords.length} keywords`);
        }
    }
}
