from playwright.sync_api import sync_playwright, expect
import time

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000", wait_until="networkidle")

        # Test if ITEM_BEEF is in window.BLOCK
        has_beef = page.evaluate("window.BLOCK.ITEM_BEEF !== undefined")
        print(f"Has ITEM_BEEF defined: {has_beef}")

        has_fence_gate = page.evaluate("window.BLOCK.FENCE_GATE !== undefined")
        print(f"Has FENCE_GATE defined: {has_fence_gate}")

        browser.close()

if __name__ == "__main__":
    test()
