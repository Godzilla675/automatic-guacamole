from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000")

        # Handle prompt for name
        page.on("dialog", lambda dialog: dialog.accept("Tester"))

        # Wait for menu
        page.wait_for_selector("#menu-screen", state="visible")

        # Click Start Game
        page.click("#start-game")

        # Wait for game container
        page.wait_for_selector("#game-container", state="visible")

        # Wait a bit for initialization
        page.wait_for_timeout(2000)

        # Press C to open Crafting
        page.keyboard.press("c")

        # Wait for crafting screen
        page.wait_for_selector("#crafting-screen", state="visible")

        # Check if new recipes are visible (e.g. Stick, Iron Ingot)
        # They are dynamically added to #crafting-recipes
        # Just take screenshot
        page.screenshot(path="verification/crafting_screen.png")

        browser.close()

if __name__ == "__main__":
    run()
