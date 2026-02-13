from playwright.sync_api import sync_playwright, expect
import time

def test_recipe_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err}"))

        page.goto("http://localhost:8080", wait_until="networkidle")

        # Wait for button to be interactive
        expect(page.locator("#start-game")).to_be_visible()

        # Start Game
        page.click("#start-game")

        # Wait for game to load
        expect(page.locator("#game-canvas")).to_be_visible()

        # Wait for window.game
        page.wait_for_function("window.game !== null")

        # Click canvas to focus
        page.click("#game-canvas")

        # Wait a bit for init
        time.sleep(1)

        # Open Crafting (via JS to avoid keypress issues)
        page.evaluate("window.game.ui.craftingUI()")

        # Check Crafting Screen visible
        expect(page.locator("#crafting-screen")).to_be_visible()

        # Click Recipe Book
        page.click("#open-recipe-book")

        # Check Recipe Book visible
        expect(page.locator("#recipe-book-screen")).to_be_visible()

        recipe_list = page.locator("#recipe-list")
        expect(recipe_list).to_contain_text("Planks")
        expect(recipe_list).to_contain_text("Stick")
        expect(recipe_list).to_contain_text("Furnace")

        expect(recipe_list).not_to_contain_text("Fence")

        # Take screenshot
        page.screenshot(path="verification/recipe_ui.png")

        print("Recipe UI verification passed")
        browser.close()

if __name__ == "__main__":
    test_recipe_ui()
