from playwright.sync_api import sync_playwright
import time
import os

def run_tests():
    os.makedirs("test-results", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()
        page.goto("http://localhost:3000")
        page.wait_for_timeout(2000)

        # Click start game
        page.click("#start-game", force=True)
        time.sleep(2)

        # 1. Take screenshot of crosshair to check alignment
        page.screenshot(path="test-results/crosshair_alignment.png")

        # 2. Check inventory for Fences and Glass Panes
        page.keyboard.press("e")
        time.sleep(0.5)
        page.screenshot(path="test-results/inventory_items.png")
        page.keyboard.press("Escape")
        time.sleep(0.5)

        # 3. Try Crafting Wood Door
        # Press C to open crafting
        page.keyboard.press("c")
        time.sleep(0.5)
        # Take screenshot of crafting UI
        page.screenshot(path="test-results/crafting_ui.png")
        page.keyboard.press("Escape")
        time.sleep(0.5)

        # Instead of doing full complex manual crafting here via coordinates,
        # we can just use evaluate to try giving player a door and placing it.
        # But wait, missing Wood Door recipe is in JS. Let's just evaluate JS to get it.
        # Let's see if the recipe is in crafting UI!
        page.evaluate("""
            const index = window.game.crafting.recipes.findIndex(r => r.name === 'Wood Door');
            if (index === -1) throw new Error("Wood Door recipe missing!");

            // Give player the wood blocks to craft it
            window.game.player.inventory[10] = { type: window.BLOCK.PLANK, count: 64 };
            window.game.crafting.craft(index, document.createElement('div'));
        """)

        # Place the door!
        page.evaluate("""
            // Find door in inventory
            const doorIndex = window.game.player.inventory.findIndex(item => item && item.type === window.BLOCK.DOOR_WOOD_BOTTOM);
            if (doorIndex === -1) throw new Error("Wood Door not in inventory!");
            window.game.player.selectedSlot = doorIndex;

            // Place block
            window.game.player.x = 10.5;
            window.game.player.y = 30;
            window.game.player.z = 10.5;
            window.game.player.yaw = 0;
            window.game.player.pitch = -0.5; // Look down

            // clear blocks around
            window.game.world.setBlock(10, 30, 10, window.BLOCK.AIR);
            window.game.world.setBlock(10, 31, 10, window.BLOCK.AIR);

            // Look exactly down and place block using right click simulation?
            // Better yet, just call interact logic directly or check logic:
        """)

        # Take a screenshot after placing the door (Wait, we can't place it easily via evaluate without calling input methods. Let's just use mouse click!)
        page.mouse.move(640, 360) # center of screen

        # Look down
        page.mouse.down()
        page.mouse.move(640, 400)
        page.mouse.up()

        # Try right click
        page.mouse.click(640, 360, button="right")
        time.sleep(0.5)
        page.screenshot(path="test-results/door_placed.png")

        # Let's also run JS evaluation to see if door was placed in the world.
        placed = page.evaluate("""() => {
            const y1 = window.game.world.getBlock(10, 30, 10);
            const y2 = window.game.world.getBlock(10, 31, 10);
            return y1 === window.BLOCK.DOOR_WOOD_BOTTOM && y2 === window.BLOCK.DOOR_WOOD_TOP;
        }""")
        print(f"Door placed correctly in world memory: {placed}")

        print("Tests completed. Screenshots saved to test-results/")
        browser.close()

if __name__ == "__main__":
    run_tests()