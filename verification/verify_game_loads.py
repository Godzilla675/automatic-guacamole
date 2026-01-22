from playwright.sync_api import sync_playwright, expect
import os

def test_game_load(page):
    page.goto("http://localhost:3000")

    # Check menu screen
    menu = page.locator("#menu-screen")
    expect(menu).to_be_visible(timeout=5000)
    print("Menu screen visible")

    # Start Game
    page.click("#start-game")
    print("Clicked Start Game")

    # Check game container visible
    game_container = page.locator("#game-container")
    expect(game_container).to_be_visible()
    print("Game container visible")

    # Wait a bit for game to init (chunks generation etc)
    page.wait_for_timeout(3000)

    # Check if canvas exists
    canvas = page.locator("#game-canvas")
    expect(canvas).to_be_visible()
    print("Canvas visible")

    # Check that game variable is initialized on window
    is_game_init = page.evaluate("window.game !== null && window.game !== undefined")
    if is_game_init:
        print("window.game is initialized")
    else:
        print("window.game is NOT initialized")

    # Take screenshot
    page.screenshot(path="verification/game_load.png")
    print("Screenshot taken at verification/game_load.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_game_load(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
