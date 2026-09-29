const { execSync } = require("child_process");
const fs = require("fs");

let errorFound = false;

const files = [
    ...fs.readdirSync("tests").filter(f => f.endsWith(".js")).map(f => `tests/${f}`),
    ...fs.readdirSync("verification").filter(f => f.endsWith(".js")).map(f => `verification/${f}`)
];

for (const file of files) {
    console.log(`Running ${file}...`);
    try {
        execSync(`npx mocha ${file}`, { stdio: "pipe" });
    } catch (e) {
        console.error(`${file} failed!`);
        errorFound = true;
    }
}

if (errorFound) {
    process.exit(1);
}
