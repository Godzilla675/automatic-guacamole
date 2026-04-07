from playwright.sync_api import sync_playwright
import time
import subprocess
import os
import signal

def start_server():
    return subprocess.Popen(
        ["python3", "-m", "http.server", "3000"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        preexec_fn=os.setsid
    )

def test_death():
    server_process = start_server()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000")

        page.wait_for_selector("#start-game")
        page.click("#start-game", force=True)
        time.sleep(2)

        # Test Death
        logs = page.evaluate("""() => {
            const game = window.game;
            game.player.health = 0;
            game.player.update(1/60);
            return game.player.y;
        }""")

        print("Death loop test:")
        print(logs)

        browser.close()

    os.killpg(os.getpgid(server_process.pid), signal.SIGTERM)

if __name__ == "__main__":
    test_death()
