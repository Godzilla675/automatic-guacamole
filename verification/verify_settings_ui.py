from playwright.sync_api import sync_playwright

def verify_settings(page):
    page.goto("http://localhost:8080/index.html")

    # Wait for loading screen to disappear and menu to appear
    print("Waiting for menu screen...")
    page.wait_for_selector("#menu-screen:not(.hidden)", timeout=10000)

    # Start Game
    print("Clicking Start Game...")
    page.click("#start-game")

    # Wait for game container
    print("Waiting for game container...")
    page.wait_for_selector("#game-container:not(.hidden)", timeout=10000)

    # Wait for game init (canvas active)
    page.wait_for_timeout(2000)

    # Click Pause
    print("Clicking Pause...")
    page.click("#pause-btn")

    # Wait for pause screen
    print("Waiting for pause screen...")
    page.wait_for_selector("#pause-screen:not(.hidden)", timeout=15000)

    # Click Settings
    print("Clicking Settings...")
    page.click("#settings-btn")

    # Wait for settings screen
    print("Waiting for settings screen...")
    page.wait_for_selector("#settings-screen:not(.hidden)", timeout=15000)

    # Verify Content
    print("Verifying content...")
    page.wait_for_selector("#settings-screen >> text=Graphics", timeout=5000)
    page.wait_for_selector("#settings-screen >> text=Controls", timeout=5000)
    page.wait_for_selector("#fov-slider")
    page.wait_for_selector("#render-dist-slider")
    page.wait_for_selector("#keybinds-list button")

    # Screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/settings_ui.png")
    print("Screenshot saved to verification/settings_ui.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_settings(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
