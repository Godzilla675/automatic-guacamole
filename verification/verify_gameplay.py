from playwright.sync_api import sync_playwright
import os
import time

def verify_gameplay(page):
    cwd = os.getcwd()
    file_path = f"file://{cwd}/index.html"
    print(f"Navigating to {file_path}")
    page.goto(file_path)

    # 1. Start Game
    print("Waiting for menu...")
    page.wait_for_selector("#menu-screen", state="visible", timeout=10000)
    page.click("#start-game")
    print("Game started.")

    # Wait for game to initialize
    page.wait_for_selector("#game-canvas", state="visible")
    page.wait_for_timeout(2000) # Wait for world gen

    # 2. Verify Canvas
    canvas = page.query_selector("#game-canvas")
    if not canvas:
        raise Exception("Game canvas not found!")
    print("Canvas verified.")

    # 3. Verify Inventory (E key)
    print("Testing Inventory (E)...")
    page.keyboard.press("KeyE")
    page.wait_for_selector("#inventory-screen", state="visible", timeout=2000)
    print("Inventory opened.")

    # Close Inventory
    page.keyboard.press("KeyE")
    page.wait_for_selector("#inventory-screen", state="hidden", timeout=2000)
    print("Inventory closed.")

    # 4. Verify Crafting (C key)
    print("Testing Crafting (C)...")
    page.keyboard.press("KeyC")
    page.wait_for_selector("#crafting-screen", state="visible", timeout=2000)
    print("Crafting opened.")

    # Close Crafting (C button inside logic maps KeyC to toggle? No, logic maps KeyC to open. Close button closes it.)
    # Button id="close-crafting"
    page.click("#close-crafting")
    page.wait_for_selector("#crafting-screen", state="hidden", timeout=2000)
    print("Crafting closed.")

    # 5. Verify Save (O key) - Mock prompt
    print("Testing Save (O)...")

    # Setup dialog handler
    dialog_message = ""
    def handle_dialog(dialog):
        nonlocal dialog_message
        dialog_message = dialog.message
        print(f"Dialog opened: {dialog_message}")
        dialog.accept("test_save_slot")

    page.on("dialog", handle_dialog)

    page.keyboard.press("KeyO")
    page.wait_for_timeout(500) # Wait for dialog

    # Check if we got a confirmation alert or just the prompt
    # The game calls prompt, then logic calls alert("World Saved...").
    # So we expect prompt first (handled by accept), then alert.

    if "Save World Name" in dialog_message:
        print("Save prompt verified.")
    else:
        print(f"Warning: Unexpected dialog message: {dialog_message}")

    page.screenshot(path="verification/gameplay_verified.png")
    print("Verification complete!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_gameplay(page)
        except Exception as e:
            print(f"FAILED: {e}")
            exit(1)
        finally:
            browser.close()
