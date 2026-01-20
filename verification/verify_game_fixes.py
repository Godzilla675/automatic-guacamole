
from playwright.sync_api import sync_playwright

def verify_game_fixes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the game (local http server)
        page.goto("http://localhost:3000")

        # Wait for "Start Game" button and click it
        start_btn = page.locator("#start-game")
        start_btn.wait_for(state="visible", timeout=5000)
        start_btn.click()

        # Wait for game to initialize (canvas visible)
        page.locator("#game-canvas").wait_for(state="visible")

        # --- Verify Crouch Height Fix ---
        # Inject script to set sneak and check player.height
        crouch_height = page.evaluate("""
            () => {
                if (!window.game || !window.game.player) return -1;
                window.game.player.onGround = true;
                window.game.controls.sneak = true;
                window.game.player.update(0.016);
                return window.game.player.height;
            }
        """)

        print(f"Crouch Height: {crouch_height}")
        if crouch_height != 1.5:
            print("FAILURE: Crouch height is not 1.5")
        else:
            print("SUCCESS: Crouch height is 1.5")

        # --- Verify Projectile Damage Fix ---
        # Inject script to spawn projectile hitting player and check health
        health_data = page.evaluate("""
            () => {
                if (!window.game || !window.game.player) return null;
                const startHealth = window.game.player.health;

                // Spawn projectile hitting player
                const proj = {
                    x: window.game.player.x,
                    y: window.game.player.y + 1,
                    z: window.game.player.z,
                    vx: 0, vy: 0, vz: 0,
                    life: 1.0
                };
                window.game.projectiles.push(proj);

                // Update game loop once (handled by requestAnimationFrame usually, but we force logic)
                // We just call update(16)
                try {
                    window.game.update(16);
                } catch(e) {
                    return { error: e.toString() };
                }

                return {
                    start: startHealth,
                    end: window.game.player.health
                };
            }
        """)

        print(f"Health Data: {health_data}")
        if health_data and health_data.get('end') < health_data.get('start'):
             print("SUCCESS: Player took damage")
        else:
             print("FAILURE: Player did not take damage")

        # Take screenshot
        page.screenshot(path="verification/verification.png")
        browser.close()

if __name__ == "__main__":
    verify_game_fixes()
