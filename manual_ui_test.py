from playwright.sync_api import sync_playwright, expect
import time

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.click("#start-game")
        page.wait_for_timeout(2000)

        # Test missing inventory items from UI
        # Press 'E'
        page.keyboard.press("e")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/test_inventory.png")

        # Test crafting 'C'
        page.keyboard.press("c")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/test_crafting.png")

        # Look around and break a block
        page.keyboard.press("Escape")
        page.wait_for_timeout(500)
        page.click("#resume-game")
        page.wait_for_timeout(500)

        # Move forward, look down, break block
        page.mouse.move(500, 500)
        page.mouse.down()
        page.wait_for_timeout(2000)
        page.mouse.up()

        page.screenshot(path="verification/test_gameplay.png")
        browser.close()

if __name__ == "__main__":
    test()
