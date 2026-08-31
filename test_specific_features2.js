const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("http://localhost:3000");

    await page.waitForTimeout(2000);
    // Use evaluate to just click it in JS
    await page.evaluate(() => {
        document.getElementById('start-game').click();
    });

    await page.waitForTimeout(1000);

    const checks = await page.evaluate(() => {
        const issues = [];
        // Test spectator mode
        if (window.game.player.gamemode !== undefined && window.game.player.spectator !== undefined) {
             // implemented
        } else {
             if (window.game.gamemode === undefined && window.game.player.spectator === undefined) {
                  issues.push("Spectator mode variables missing");
             }
        }

        // Test spyglass FOV
        if (!window.BLOCK.ITEM_SPYGLASS) issues.push("Spyglass missing");

        // Fishing check? Partially implemented
        if (!window.BLOCK.ITEM_FISHING_ROD) issues.push("Fishing rod missing");

        return issues;
    });

    console.log(checks.length ? "Issues found: " + checks.join(", ") : "No issues found in specific checks.");

    await browser.close();
})();
