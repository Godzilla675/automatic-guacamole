from playwright.sync_api import sync_playwright
import time

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000")
        page.wait_for_timeout(2000)
        page.click("#start-game", force=True)
        time.sleep(1)

        # Test Jukebox
        page.evaluate("window.game.ui.openJukebox()")
        time.sleep(1)

        # Click something in jukebox?
        browser.close()

if __name__ == "__main__":
    test()
