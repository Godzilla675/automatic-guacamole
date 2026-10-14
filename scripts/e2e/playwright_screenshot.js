const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log("Navigating to local game...");
    await page.goto('http://localhost:3000');

    console.log("Waiting for Start Game button...");
    await page.waitForSelector('#start-game', { state: 'visible', timeout: 10000 });
    await page.screenshot({ path: 'verification/playwright_menu.png' });

    console.log("Clicking Start Game...");
    await page.click('#start-game');

    console.log("Waiting for game to load...");
    await page.waitForTimeout(3000); // Give it time to generate world and render
    await page.screenshot({ path: 'verification/playwright_game_start.png' });

    console.log("Pressing E to open inventory...");
    await page.keyboard.press('e');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verification/playwright_inventory.png' });

    console.log("Pressing Esc to close inventory...");
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    console.log("Moving around...");
    await page.keyboard.down('w');
    await page.waitForTimeout(2000);
    await page.keyboard.up('w');

    console.log("Looking around...");
    // Simulate mouse movement
    await page.mouse.move(640, 360);
    await page.mouse.down();
    await page.mouse.move(800, 360, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'verification/playwright_game_moved.png' });

    await browser.close();
    console.log("Done.");
})();