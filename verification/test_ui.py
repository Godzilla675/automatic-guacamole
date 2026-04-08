from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000")

    # Wait for the start game button to be visible
    page.wait_for_selector("#start-game", timeout=10000)
    page.wait_for_timeout(2000)

    # Click start game by evaluating JS to bypass overlay issues
    page.evaluate("document.getElementById('start-game').click();")
    page.wait_for_timeout(2000)

    # Put a block in hand to place anvil
    page.evaluate("window.game.player.inventory[0] = {type: window.BLOCK.ANVIL, count: 1}; window.game.ui.updateHotbarUI();")
    page.wait_for_timeout(500)

    # Open inventory to check pane/fence UI fix? Well they aren't generated in inventory by default
    page.keyboard.press("e")
    page.wait_for_timeout(1000)

    # Take screenshot of inventory
    page.screenshot(path="/home/jules/verification/screenshots/inventory.png")
    page.wait_for_timeout(1000)

    # Close inventory
    page.keyboard.press("e")
    page.wait_for_timeout(1000)

    # Open anvil UI
    page.evaluate("window.game.ui.openAnvil();")
    page.wait_for_timeout(1000)

    # Take screenshot of anvil UI before rename
    page.screenshot(path="/home/jules/verification/screenshots/anvil.png")
    page.wait_for_timeout(500)

    # Mock items in UI state manually to simulate renaming
    page.evaluate("""
        window.game.ui.activeAnvil.input1 = {type: window.BLOCK.SWORD_WOOD, count: 1};
        document.getElementById('anvil-rename').value = 'Excalibur';
        window.game.player.level = 10;
        window.game.ui.updateAnvilUI();
    """)
    page.wait_for_timeout(1000)

    # Take screenshot of anvil UI with output
    page.screenshot(path="/home/jules/verification/screenshots/anvil_output.png")
    page.wait_for_timeout(500)

    # Move output to inventory slot 1
    page.evaluate("""
        window.game.player.inventory[1] = window.game.ui.activeAnvil.output;
        window.game.ui.activeAnvil.output = null;
        window.game.ui.closeAnvil();
    """)
    page.wait_for_timeout(1000)

    # Open inventory
    page.keyboard.press("e")
    page.wait_for_timeout(1000)

    # Hover over item to see tooltip
    page.hover(".inventory-item[data-index='1']")
    page.wait_for_timeout(1000)

    # Take screenshot of tooltip
    page.screenshot(path="/home/jules/verification/screenshots/tooltip.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    import os
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={'width': 1280, 'height': 720}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
