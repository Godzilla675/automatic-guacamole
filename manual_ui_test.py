from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(f"JS Error: {err}"))
        page.on("console", lambda msg: errors.append(f"Console {msg.type}: {msg.text}") if msg.type == "error" else None)

        page.goto("http://localhost:3000")

        page.wait_for_timeout(2000)
        page.evaluate("document.getElementById('start-game').click()")
        page.wait_for_timeout(2000)

        has_beef = page.evaluate("window.BLOCK && window.BLOCK.ITEM_BEEF !== undefined")
        has_fences_gates = page.evaluate("window.BLOCK && window.BLOCK.FENCE_GATE !== undefined")

        browser.close()

        print(f"Has ITEM_BEEF defined: {has_beef}")
        print(f"Has FENCE_GATE defined: {has_fences_gates}")

if __name__ == "__main__":
    run()
