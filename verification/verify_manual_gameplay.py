from playwright.sync_api import sync_playwright

def test_manual_gameplay():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000")

        # Wait for the game to load and click Start Game
        page.wait_for_selector("#start-game")
        # Give it a tiny bit of time to ensure it's fully interactable
        page.wait_for_timeout(1000)
        page.evaluate("document.getElementById('start-game').click();")

        # Wait a moment for the game loop to start running
        page.wait_for_timeout(2000)

        # Move forward
        page.keyboard.down("w")
        page.wait_for_timeout(1000)
        page.keyboard.up("w")

        # Open inventory
        page.keyboard.press("e")
        page.wait_for_timeout(500)

        # Verify inventory is open
        assert page.is_visible("#inventory-screen")

        # Close inventory
        page.keyboard.press("e")
        page.wait_for_timeout(500)
        assert not page.is_visible("#inventory-screen")

        # Open crafting
        page.keyboard.press("c")
        page.wait_for_timeout(500)
        assert page.is_visible("#crafting-screen")

        # Close crafting
        page.keyboard.press("c")
        page.wait_for_timeout(500)
        assert not page.is_visible("#crafting-screen")

        # Open pause menu
        page.keyboard.press("Escape")
        page.wait_for_timeout(500)
        assert page.is_visible("#pause-screen")

        # Resume game
        page.click("#resume-game", force=True)
        page.wait_for_timeout(500)
        assert not page.is_visible("#pause-screen")

        # Jump
        page.keyboard.press(" ")
        page.wait_for_timeout(1000)

        # Break block (left click)
        page.mouse.click(x=page.viewport_size['width']/2, y=page.viewport_size['height']/2, button="left")
        page.wait_for_timeout(500)

        # Place block (right click)
        page.mouse.click(x=page.viewport_size['width']/2, y=page.viewport_size['height']/2, button="right")
        page.wait_for_timeout(500)

        print("Manual gameplay test passed successfully!")

        browser.close()

if __name__ == "__main__":
    test_manual_gameplay()
