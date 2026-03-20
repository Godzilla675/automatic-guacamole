from playwright.sync_api import sync_playwright

def verify_crafting():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local index.html directly
        page.goto("http://localhost:3000")

        # Wait for game to initialize and menu overlay to load
        page.wait_for_timeout(2000)

        # Click Start Game
        start_btn = page.locator("#start-game")
        start_btn.click(force=True)

        # Wait a moment for 3D world to render
        page.wait_for_timeout(1000)

        # Press 'C' to open Crafting Menu
        page.keyboard.press('c')
        page.wait_for_timeout(500)

        # Take screenshot of the crafting menu
        page.screenshot(path="verification/verify_crafting_menu_new.png")

        browser.close()

if __name__ == "__main__":
    verify_crafting()
