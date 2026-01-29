from playwright.sync_api import sync_playwright
import time
import math

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:8000")

        # Handle prompt
        page.on("dialog", lambda dialog: dialog.accept("Tester"))

        # Wait for Start Button
        start_btn = page.locator("#start-game")
        start_btn.wait_for()

        # Click Start
        start_btn.click()

        # Wait for game to load
        page.wait_for_function("window.game !== undefined && window.game.player !== undefined")

        # Wait for world generation
        time.sleep(3)

        # Get player pos
        pos = page.evaluate("() => { return {x: window.game.player.x, y: window.game.player.y, z: window.game.player.z, yaw: window.game.player.yaw} }")
        print(f"Player at: {pos}")

        x = math.floor(pos['x'])
        y = math.floor(pos['y'])
        z = math.floor(pos['z'])

        # Place blocks in front (assuming yaw 0 is East +X?)
        # Let's place them in a line
        # Use simple evaluate calls

        # Fence
        page.evaluate(f"window.game.world.setBlock({x+2}, {y}, {z}, 90)")
        # Fence Gate
        page.evaluate(f"window.game.world.setBlock({x+2}, {y}, {z+2}, 91)")
        # Glass Pane
        page.evaluate(f"window.game.world.setBlock({x+2}, {y}, {z-2}, 92)")
        # Trapdoor (Open)
        page.evaluate(f"window.game.world.setBlock({x+2}, {y}, {z+4}, 93)")
        page.evaluate(f"window.game.world.setMetadata({x+2}, {y}, {z+4}, 4)") # Open

        # Force render update not needed as loop runs.
        time.sleep(1)

        # Take screenshot
        page.screenshot(path="verification/verification.png")
        print("Screenshot taken at verification/verification.png")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
