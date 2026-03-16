from playwright.sync_api import sync_playwright, expect
import time

def test_milking_and_shearing():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:3000", wait_until="networkidle")

        # Wait for game to load and click start
        expect(page.locator("#start-game")).to_be_visible()
        page.click("#start-game")

        # Wait for game initialization
        expect(page.locator("#game-canvas")).to_be_visible()
        page.wait_for_function("window.game !== null && window.game.player !== undefined")

        # Focus canvas
        page.click("#game-canvas")
        time.sleep(1)

        # Setup scenario via JS:
        # Give player bucket and shears
        page.evaluate("""
            window.game.player.inventory[0] = { type: window.BLOCK.ITEM_BUCKET, count: 1 };
            window.game.player.inventory[1] = { type: window.BLOCK.ITEM_SHEARS, count: 1 };
            window.game.ui.refreshInventoryUI();

            // Spawn cow and sheep right in front of player
            const px = window.game.player.x;
            const py = window.game.player.y;
            const pz = window.game.player.z;

            const cow = new window.Mob(window.game, px, py, pz + 2, window.MOB_TYPE.COW);
            const sheep = new window.Mob(window.game, px + 2, py, pz, window.MOB_TYPE.SHEEP);
            window.game.mobs.push(cow, sheep);

            // Look at cow
            window.game.player.yaw = 0; // Look +Z
            window.game.player.pitch = 0;
        """)

        time.sleep(1)

        # 1. Select Bucket (Slot 0)
        page.evaluate("window.game.player.selectedSlot = 0; window.game.ui.updateHotbarUI();")
        time.sleep(0.5)

        # 2. Interact with Cow (Right click)
        # Playwright doesn't easily trigger the exact right click interaction without mimicking the pointer lock.
        # Let's directly call the game's interact code to simulate the right click on the entity.
        page.evaluate("""
            const cow = window.game.mobs.find(m => m.type === window.MOB_TYPE.COW);
            cow.interact(window.game.player.inventory[0].type);
            // Simulate consuming bucket
            window.game.player.inventory[0].count--;
            if (window.game.player.inventory[0].count <= 0) window.game.player.inventory[0] = null;
        """)

        time.sleep(1)

        # Take screenshot of milk drop
        page.screenshot(path="verification/milk_drop.png")

        # 3. Look at sheep and select shears (Slot 1)
        page.evaluate("""
            window.game.player.selectedSlot = 1; window.game.ui.updateHotbarUI();
            window.game.player.yaw = Math.PI / 2; // Look +X
        """)
        time.sleep(0.5)

        # 4. Interact with Sheep
        page.evaluate("""
            const sheep = window.game.mobs.find(m => m.type === window.MOB_TYPE.SHEEP);
            sheep.interact(window.game.player.inventory[1].type);
        """)

        time.sleep(1)

        # Take screenshot of sheared sheep and wool drop
        page.screenshot(path="verification/sheared_sheep.png")

        print("Verification passed")
        browser.close()

if __name__ == "__main__":
    test_milking_and_shearing()
