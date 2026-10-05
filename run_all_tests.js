const { execSync } = require("child_process");
const fs = require("fs");

let errorFound = false;

const files = [
    ...fs.readdirSync("tests").filter(f => f.endsWith(".js")).map(f => `tests/${f}`),
    ...fs.readdirSync("verification").filter(f => f.endsWith(".js")).map(f => `verification/${f}`)
];

// Group files in batches of 3 to avoid JSDOM memory accumulation limits while reducing spawn overhead
const BATCH_SIZE = 3;
for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    try {
        execSync(`npx mocha ${batch.join(" ")}`, { stdio: "pipe" });
    } catch (e) {
        console.error(`Batch failed starting with ${batch[0]}`);
        errorFound = true;
    }
}

if (errorFound) {
    process.exit(1);
} else {
    console.log(`All ${files.length} test files passed!`);
}
