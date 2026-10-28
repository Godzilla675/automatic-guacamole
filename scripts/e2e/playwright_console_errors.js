const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    if (!fs.existsSync('verification')) {
        fs.mkdirSync('verification', { recursive: true });
    }

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Capture console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    page.on('pageerror', error => {
        errors.push(error.message);
    });

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:3000');

    await page.waitForSelector('#start-game', { state: 'visible', timeout: 5000 });
    await page.evaluate(() => document.getElementById('start-game').click());

    // Wait for the game canvas to be present
    await page.waitForSelector('#game-canvas', { state: 'attached', timeout: 10000 });
    await page.waitForTimeout(3000);

    // Inventory
    await page.keyboard.press('e');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'verification/playwright_inv.png' });
    await page.keyboard.press('e'); // Close
    await page.waitForTimeout(500);

    // Crafting
    await page.keyboard.press('c');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'verification/playwright_craft.png' });
    await page.keyboard.press('c'); // Close Crafting
    await page.waitForTimeout(500);

    // Walk forward
    await page.keyboard.down('w');
    await page.waitForTimeout(1000);
    await page.keyboard.up('w');

    // Jump
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    // Pause menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'verification/playwright_pause.png' });

    // Settings
    await page.click('#settings-btn');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'verification/playwright_settings.png' });

    await page.click('#close-settings');
    await page.waitForTimeout(500);

    await page.click('#resume-game');
    await page.waitForTimeout(500);

    console.log("Recorded Errors:");
    console.log(errors.length === 0 ? "No errors" : errors.join('\n'));

    await browser.close();
})();
