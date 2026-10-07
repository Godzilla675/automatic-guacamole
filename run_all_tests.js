const { execSync } = require("child_process");
const fs = require("fs");

let errorFound = false;

const testFiles = [
    ...fs.readdirSync("tests").filter(f => f.endsWith(".js") && !f.endsWith(".ignore")).map(f => `tests/${f}`),
    ...fs.readdirSync("verification").filter(f => f.endsWith(".js")).map(f => `verification/${f}`)
];

console.log(`Running ${testFiles.length} test files in small batches...`);

const BATCH_SIZE = 3;
let passedCount = 0;
let failedBatches = [];

for (let i = 0; i < testFiles.length; i += BATCH_SIZE) {
    const batch = testFiles.slice(i, i + BATCH_SIZE);
    try {
        execSync(`npx mocha ${batch.join(" ")}`, { stdio: "pipe" });
        passedCount += batch.length;
    } catch (e) {
        // Fallback to running individually in case of script structure variance
        for (const file of batch) {
            try {
                execSync(`npx mocha ${file}`, { stdio: "pipe" });
                passedCount++;
            } catch (e2) {
                try {
                    execSync(`node ${file}`, { stdio: "pipe" });
                    passedCount++;
                } catch (e3) {
                    console.error(`Test failed: ${file}`);
                    failedBatches.push(file);
                    errorFound = true;
                }
            }
        }
    }
}

if (errorFound) {
    console.error(`\n${failedBatches.length} test files failed:`);
    failedBatches.forEach(f => console.error(` - ${f}`));
    process.exit(1);
} else {
    console.log(`\nAll ${passedCount} test files passed successfully!`);
}
