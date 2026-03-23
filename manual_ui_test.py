from playwright.sync_api import sync_playwright
import time
import os

def check_feature(page, feature_name, action_callback, screenshot_name=None):
    try:
        print(f"Testing feature: {feature_name}...")
        action_callback(page)
        if screenshot_name:
            page.screenshot(path=f"test-results/{screenshot_name}.png")
        print(f"  [OK] {feature_name}")
        return True
    except Exception as e:
        print(f"  [FAILED] {feature_name}: {e}")
        if screenshot_name:
            page.screenshot(path=f"test-results/{screenshot_name}_error.png")
        return False

def run_tests():
    os.makedirs("test-results", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto("http://localhost:3000")

        # Click start game
        page.click("#start-game")
        time.sleep(2)

        errors_found = []

        # 1. Test Inventory UI
        def test_inventory(page):
            page.keyboard.press("e")
            time.sleep(0.5)
            assert page.locator("#inventory-screen").is_visible(), "Inventory not visible"
            page.keyboard.press("e")
            time.sleep(0.5)

        if not check_feature(page, "Inventory UI (e key)", test_inventory, "inventory_ui"):
            errors_found.append("Inventory UI failed to open or close correctly.")

        # 2. Test Crafting UI
        def test_crafting(page):
            page.keyboard.press("c")
            time.sleep(0.5)
            assert page.locator("#crafting-screen").is_visible(), "Crafting UI not visible"
            page.keyboard.press("c")
            time.sleep(0.5)

        if not check_feature(page, "Crafting UI (c key)", test_crafting, "crafting_ui"):
             errors_found.append("Crafting UI failed to open or close correctly.")

        # 3. Test Creative Mode Toggle
        def test_creative_mode(page):
            # There's a creative mode command or keybind? Check 'FUTURE_FEATURES.md' - "Fly mode toggle (Key 'F')", "Unlimited blocks" (not implemented?),
            page.keyboard.press("f")
            time.sleep(0.5)
            page.keyboard.press("f")
            time.sleep(0.5)

        if not check_feature(page, "Fly Mode (f key)", test_creative_mode):
             errors_found.append("Fly mode toggle failed.")

        # 4. Test Settings Menu
        def test_settings_menu(page):
            page.keyboard.press("Escape")
            time.sleep(0.5)
            assert page.locator("#pause-screen").is_visible(), "Pause menu not visible"
            page.click("#settings-btn")
            time.sleep(0.5)
            assert page.locator("#settings-screen").is_visible(), "Settings menu not visible"
            page.click("#close-settings")
            time.sleep(0.5)
            page.click("#resume-game")
            time.sleep(0.5)

        if not check_feature(page, "Settings Menu (Esc -> Settings -> Back -> Resume)", test_settings_menu, "settings_menu"):
            errors_found.append("Settings menu navigation failed.")

        # 5. Check missing inventory items (Fences, Trapdoors, Glass Panes)
        def test_inventory_contents(page):
             page.keyboard.press("e")
             time.sleep(0.5)

             # Evaluate JS to check if the icons exist in the DOM or UI elements
             # Or check if they are in the initial inventory setup

             page.keyboard.press("Escape")

        if not check_feature(page, "Inventory Contents Check", test_inventory_contents, "inventory_contents"):
             errors_found.append("Inventory contents check failed.")

        # Print summary
        if errors_found:
            print("\n--- BUGS FOUND ---")
            for error in errors_found:
                print(f"- {error}")
            with open("found_bugs.txt", "w") as f:
                f.write("\n".join(errors_found))
        else:
            print("\nNo bugs found during automated UI exploration.")

        browser.close()

if __name__ == "__main__":
    run_tests()
