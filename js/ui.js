class UIManager {
    constructor(game) {
        this.game = game;
    }

    init() {
        this.updateHotbarUI();
    }

    toggleInventory() {
        const inv = document.getElementById('inventory-screen');
        inv.classList.toggle('hidden');
        if (inv.classList.contains('hidden')) {
            if (!this.game.isMobile) this.game.canvas.requestPointerLock();
        } else {
            document.exitPointerLock();
        }
    }

    craftingUI() {
        const ui = document.getElementById('crafting-screen');
        ui.classList.remove('hidden');
        document.exitPointerLock();
    }

    pauseGame() {
        document.getElementById('pause-screen').classList.remove('hidden');
        document.exitPointerLock();
    }

    resumeGame() {
        document.getElementById('pause-screen').classList.add('hidden');
        if (!this.game.isMobile) this.game.canvas.requestPointerLock();
    }

    updateHotbarUI() {
        const hotbar = document.getElementById('hotbar');

        // Initialize slots if needed
        if (hotbar.children.length === 0) {
             for (let i = 0; i < 9; i++) {
                 const slot = document.createElement('div');
                 slot.className = 'hotbar-slot';
                 slot.dataset.slot = i;

                 const icon = document.createElement('span');
                 icon.className = 'block-icon';
                 slot.appendChild(icon);

                 const num = document.createElement('span');
                 num.className = 'slot-number';
                 num.textContent = i + 1;
                 slot.appendChild(num);

                 slot.addEventListener('click', () => {
                    this.game.player.selectedSlot = i;
                    this.updateHotbarUI();
                 });

                 hotbar.appendChild(slot);
             }
        }

        const slots = hotbar.children;
        for (let i = 0; i < 9; i++) {
            const slot = slots[i];
            if (!slot) continue;

            slot.classList.toggle('active', i === this.game.player.selectedSlot);

            const item = this.game.player.inventory[i];
            const icon = slot.querySelector('.block-icon');

            // Clear existing durability bar
            const existingBar = slot.querySelector('.durability-bar-bg');
            if (existingBar) existingBar.remove();

            if (item) {
                const blockDef = window.BLOCKS[item.type];
                if (blockDef) {
                    icon.textContent = blockDef.icon || '';
                    icon.style.backgroundColor = blockDef.color || 'transparent';
                }

                // Durability Bar
                if (window.TOOLS && window.TOOLS[item.type]) {
                    const toolDef = window.TOOLS[item.type];
                    const max = toolDef.durability;
                    const current = item.durability !== undefined ? item.durability : max;

                    if (current < max) {
                        const pct = Math.max(0, Math.min(100, (current / max) * 100));

                        const barBg = document.createElement('div');
                        barBg.className = 'durability-bar-bg';
                        const bar = document.createElement('div');
                        bar.className = 'durability-bar';
                        bar.style.width = pct + '%';

                        if (pct < 20) bar.style.backgroundColor = '#FF0000';
                        else if (pct < 50) bar.style.backgroundColor = '#FFFF00';

                        barBg.appendChild(bar);
                        slot.appendChild(barBg);
                    }
                }
            } else {
                icon.style.backgroundColor = 'transparent';
                icon.textContent = '';
            }
        }
    }

    updateHealthUI() {
        const bar = document.getElementById('health-bar');
        if (bar) {
            const pct = (this.game.player.health / this.game.player.maxHealth) * 100;
            bar.style.width = pct + '%';
        }

        const hungerBar = document.getElementById('hunger-bar');
        if (hungerBar) {
            const pct = (this.game.player.hunger / this.game.player.maxHunger) * 100;
            hungerBar.style.width = pct + '%';
        }

        // Damage Overlay
        const overlay = document.getElementById('damage-overlay');
        if (overlay && this.game.player.health < this.game.player.maxHealth) {
             // Flash red if recently damaged
             if (Date.now() - this.game.player.lastDamageTime < 200) {
                 overlay.style.opacity = 0.5;
             } else {
                 overlay.style.opacity = 0;
             }
        }
    }
}

window.UIManager = UIManager;
