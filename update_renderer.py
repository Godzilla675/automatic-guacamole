import re

with open('js/renderer.js', 'r') as f:
    content = f.read()

# 1. Update Constructor
old_constructor_end = """        if (window.TextureManager) {
            this.textureManager = new TextureManager();
            this.textureManager.init();
        }
    }"""

new_constructor_end = """        if (window.TextureManager) {
            this.textureManager = new TextureManager();
            this.textureManager.init();
        }

        // Cache HUD elements
        this.fpsEl = document.getElementById('fps');
        this.posEl = document.getElementById('position');
        this.blockEl = document.getElementById('block-count');
        this.timeEl = document.getElementById('game-time');
    }"""

if old_constructor_end in content:
    content = content.replace(old_constructor_end, new_constructor_end)
    print("Constructor updated.")
else:
    print("Failed to find constructor end.")

# 2. Update Render Loop
old_hud_block = """        // HUD Updates
        const fpsEl = document.getElementById('fps');
        if (fpsEl) fpsEl.textContent = this.game.fps;

        const posEl = document.getElementById('position');
        if (posEl) posEl.textContent = `${Math.floor(px)}, ${Math.floor(py)}, ${Math.floor(pz)}`;

        const blockEl = document.getElementById('block-count');
        if (blockEl) blockEl.textContent = blocksToDraw.length;

        const timeEl = document.getElementById('game-time');
        if (timeEl) {
            const cycle = (this.game.gameTime % this.game.dayLength) / this.game.dayLength;
            const isDay = cycle < 0.5;
            timeEl.textContent = isDay ? 'Day' : 'Night';
        }"""

new_hud_block = """        // HUD Updates
        if (this.fpsEl) this.fpsEl.textContent = this.game.fps;

        if (this.posEl) this.posEl.textContent = `${Math.floor(px)}, ${Math.floor(py)}, ${Math.floor(pz)}`;

        if (this.blockEl) this.blockEl.textContent = blocksToDraw.length;

        if (this.timeEl) {
            const cycle = (this.game.gameTime % this.game.dayLength) / this.game.dayLength;
            const isDay = cycle < 0.5;
            this.timeEl.textContent = isDay ? 'Day' : 'Night';
        }"""

if old_hud_block in content:
    content = content.replace(old_hud_block, new_hud_block)
    print("HUD block updated.")
else:
    print("Failed to find HUD block.")
    # Debug: print what we are looking for vs what is there
    start_index = content.find("// HUD Updates")
    if start_index != -1:
        print("Found '// HUD Updates' at", start_index)
        print("Content snippet:\n", content[start_index:start_index+500])

with open('js/renderer.js', 'w') as f:
    f.write(content)
