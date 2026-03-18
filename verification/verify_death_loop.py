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

        # Wait a bit for initialization and potential death
        page.wait_for_timeout(4000)

        # Take screenshot of the game to ensure there's no chat spam about death
        page.screenshot(path="verification/death_loop_fixed.png")

        browser.close()

if __name__ == "__main__":
    run()
