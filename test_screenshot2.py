from playwright.sync_api import sync_playwright
import time
import os

def run_tests():
    os.makedirs("test-results", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()
        page.goto("http://localhost:3000")
        page.wait_for_timeout(2000)

        page.click("#start-game", force=True)
        time.sleep(2)

        page.screenshot(path="test-results/crosshair_alignment.png")

        page.keyboard.press("Escape")
        time.sleep(1)
        page.screenshot(path="test-results/settings_menu.png")

        page.keyboard.press("Escape")
        time.sleep(1)
        page.keyboard.press("e")
        time.sleep(1)
        page.screenshot(path="test-results/inventory_items.png")

        page.keyboard.press("Escape")
        time.sleep(1)
        page.keyboard.press("c")
        time.sleep(1)
        page.screenshot(path="test-results/crafting_ui.png")

        print("Screenshots taken")
        browser.close()

if __name__ == "__main__":
    run_tests()
