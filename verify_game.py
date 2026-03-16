from playwright.sync_api import sync_playwright

def test_game_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000")
        page.wait_for_timeout(2000)

        # Take screenshot of the initial menu
        page.screenshot(path="verification/game_menu.png")

        # Click Start Game
        page.click("#start-game")

        # Wait a bit for the game to load and render
        page.wait_for_timeout(5000)

        # Take screenshot of the game
        page.screenshot(path="verification/game_running.png")

        # Press 'e' to open inventory
        page.keyboard.press("e")
        page.wait_for_timeout(1000)

        # Take screenshot of the inventory
        page.screenshot(path="verification/game_inventory.png")

        browser.close()

if __name__ == "__main__":
    test_game_loads()
