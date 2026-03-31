const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:3000/index.html');
  await page.waitForTimeout(1000);

  // Click start game
  await page.click('#start-game', { force: true });
  await page.waitForTimeout(1000);

  console.log("Checking UI logic...");
  await page.evaluate(() => {
    try {
      window.game.ui.openTrading({ trades: [{ cost: {type: 3, count: 4}, reward: {type: 1, count: 1} }] });
      console.log("Trading UI with real entity opened successfully");
    } catch (e) {
      console.error("Error opening trading UI: " + e.message);
    }
  });

  await page.waitForTimeout(500);

  await browser.close();
})();
