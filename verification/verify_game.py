from playwright.sync_api import sync_playwright
import os

def verify_game():
    if not os.path.exists("verification"):
        os.makedirs("verification")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8080")

        # Click Start Game
        page.click("#start-game")

        # Wait for game canvas
        page.wait_for_selector("#game-canvas")

        # Wait a bit for init
        page.wait_for_timeout(2000)

        # Modify durability of slot 0 (Diamond Pickaxe) to show bar
        # Max durability is 1561. Set to 500 to show bar (~1/3).
        page.evaluate("""
            const item = { type: window.BLOCK.PICKAXE_DIAMOND, count: 1, durability: 500 };
            window.game.player.inventory[0] = item;
            window.game.updateHotbarUI();
        """)

        # Take screenshot
        page.screenshot(path="verification/game_hud.png")

        browser.close()

if __name__ == "__main__":
    verify_game()
