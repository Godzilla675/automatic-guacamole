const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
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
    await page.click('#start-game');

    // Wait for the game to initialize
    await page.waitForTimeout(3000);

    // Try doing various actions
    await page.keyboard.press('e'); // Inventory
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape'); // Close
    await page.waitForTimeout(500);

    await page.keyboard.press('c'); // Crafting
    await page.waitForTimeout(500);
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
    await page.click('#pause-btn');
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