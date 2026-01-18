from playwright.sync_api import sync_playwright
import os

def test_game_load(page):
    # Go to the local file
    cwd = os.getcwd()
    file_path = f"file://{cwd}/index.html"
    print(f"Navigating to {file_path}")
    page.goto(file_path)

    # Wait for the game to load (menu screen)
    # The menu screen has ID 'menu-screen' and should be visible after loading-screen is hidden
    # loading screen is hidden after 1500ms
    page.wait_for_selector("#menu-screen", state="visible", timeout=5000)

    # Click 'Start Game'
    page.click("#start-game")

    # Wait for game container
    page.wait_for_selector("#game-canvas", state="visible")

    # Wait a bit for render
    page.wait_for_timeout(2000)

    # Take screenshot
    page.screenshot(path="verification/game_screenshot.png")
    print("Screenshot taken")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_game_load(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
