from playwright.sync_api import Page, expect, sync_playwright
import time

def test_door_render(page: Page):
    page.goto("http://localhost:8000")

    # Click Start Game
    # Use selector for button id start-game
    page.locator("#start-game").click()

    # Wait for game to init (canvas to exist)
    expect(page.locator("#game-canvas")).to_be_visible()

    # Wait a bit for chunks to generate
    time.sleep(2)

    # Inject JS to place a door in front of player
    page.evaluate("""
        const game = window.game;
        const p = game.player;

        // Ensure player is at known location
        p.x = 8.5;
        p.y = 40;
        p.z = 8.5;
        p.yaw = 0; // Look East (Positive X) -> Wait, yaw 0 is South?
        // In my test: "Yaw 0 should produce Meta 0 (East)".
        // If 0 is East, then +X is East.

        // Place door at 10, 40, 8 (East of player)
        const x = 10;
        const y = 40;
        const z = 8;

        // Clear area
        game.world.setBlock(x, y, z, 0);
        game.world.setBlock(x, y+1, z, 0);

        // Give door
        game.player.inventory[game.player.selectedSlot] = { type: window.BLOCK.DOOR_WOOD_BOTTOM, count: 1 };

        // Place manually via logic to ensure we test rendering
        // Meta 0: East.
        game.world.setBlock(x, y, z, window.BLOCK.DOOR_WOOD_BOTTOM);
        game.world.setMetadata(x, y, z, 0);
        game.world.setBlock(x, y+1, z, window.BLOCK.DOOR_WOOD_TOP);
        game.world.setMetadata(x, y+1, z, 0);

        // Look at it
        // Player at 8.5, 40, 8.5. Door at 10, 40, 8.
        // dx = 1.5. dz = -0.5.
        // Yaw needed: atan2(dx, dz) ? No, renderer uses sin/cos.
        // Look East.
    """)

    time.sleep(1)

    page.screenshot(path="/home/jules/verification/door_render.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_door_render(page)
        finally:
            browser.close()
