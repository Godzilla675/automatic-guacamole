from playwright.sync_api import sync_playwright
import time
import os
import traceback

def run_extensive_tests():
    os.makedirs("test-results", exist_ok=True)
    results = {"passed": [], "failed": [], "console_errors": []}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Capture console errors
        def on_console_msg(msg):
            if msg.type == "error":
                results["console_errors"].append(msg.text)
        page.on("console", on_console_msg)

        def on_page_error(error):
            results["console_errors"].append(f"Page Error: {error}")
        page.on("pageerror", on_page_error)

        try:
            print("Navigating to game...")
            page.goto("http://localhost:3000")
            page.wait_for_timeout(2000)

            print("Clicking start game...")
            page.evaluate("document.getElementById('start-game').click();")
            time.sleep(2)

            # Action 1: Movement & Jumping
            try:
                print("Testing Movement & Jumping...")
                page.keyboard.press("w")
                time.sleep(0.5)
                page.keyboard.press("Space")
                time.sleep(0.5)
                page.keyboard.press("a")
                time.sleep(0.5)
                results["passed"].append("Movement & Jumping")
            except Exception as e:
                results["failed"].append(f"Movement & Jumping: {e}")

            # Action 2: Menus
            try:
                print("Testing Menus (Inventory, Crafting, Settings)...")

                # Inventory
                page.keyboard.press("e")
                page.wait_for_selector("#inventory-screen:not(.hidden)", timeout=2000)
                page.keyboard.press("e") # Close it

                # Crafting
                page.keyboard.press("c")
                page.wait_for_selector("#crafting-screen:not(.hidden)", timeout=2000)
                page.keyboard.press("c") # Close it

                # Settings / Pause
                page.keyboard.press("Escape")
                page.wait_for_selector("#pause-screen:not(.hidden)", timeout=2000)
                page.click("#settings-btn")
                page.wait_for_selector("#settings-screen:not(.hidden)", timeout=2000)
                page.click("#close-settings")
                page.click("#resume-game")

                results["passed"].append("Menus Navigation")
            except Exception as e:
                results["failed"].append(f"Menus Navigation: {e}")

            # Action 3: UI Elements check
            try:
                print("Checking UI Elements...")
                assert page.locator("#health-bar").is_visible(), "Health bar missing"
                assert page.locator("#hunger-bar").is_visible(), "Hunger bar missing"
                assert page.locator("#hotbar").is_visible(), "Hotbar missing"
                results["passed"].append("UI Elements Visibility")
            except Exception as e:
                results["failed"].append(f"UI Elements Visibility: {e}")

            # Action 4: Interaction (Placing / Breaking blocks)
            try:
                print("Testing Block Interaction...")
                # Try placing a block
                page.mouse.click(page.viewport_size['width'] / 2, page.viewport_size['height'] / 2, button="right")
                time.sleep(0.5)
                # Try breaking a block
                page.mouse.click(page.viewport_size['width'] / 2, page.viewport_size['height'] / 2, button="left")
                time.sleep(0.5)
                results["passed"].append("Block Interaction")
            except Exception as e:
                results["failed"].append(f"Block Interaction: {e}")

        except Exception as e:
            print(f"Test suite encountered a fatal error: {e}")
            traceback.print_exc()
        finally:
            browser.close()

    # Output results
    print("\n--- Test Results ---")
    print(f"Passed: {len(results['passed'])}")
    for p in results['passed']:
        print(f"  [OK] {p}")

    print(f"\nFailed: {len(results['failed'])}")
    for f in results['failed']:
        print(f"  [FAIL] {f}")

    print(f"\nConsole Errors: {len(results['console_errors'])}")
    for e in results['console_errors']:
        print(f"  [ERROR] {e}")

if __name__ == "__main__":
    run_extensive_tests()
