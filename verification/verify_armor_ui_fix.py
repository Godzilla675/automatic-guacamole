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
        page.wait_for_timeout(1500) # wait for loading screen to disappear

        # Click Start Game
        page.click("#start-game", force=True)

        # Wait for game container
        page.wait_for_selector("#game-container", state="visible")

        # Wait a bit for initialization
        page.wait_for_timeout(2000)

        # Press E to open Inventory
        page.keyboard.press("e")

        # Wait for inventory screen
        page.wait_for_selector("#inventory-screen", state="visible")

        # Take screenshot of inventory showing armor slots properly rendered without crashing
        page.screenshot(path="verification/armor_ui_fixed.png")

        browser.close()

if __name__ == "__main__":
    run()
