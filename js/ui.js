class UIManager {
    constructor(game) {
        this.game = game;
        this.cursorItem = null;
        this.activeFurnace = null;
    }

    init() {
        this.updateHotbarUI();

        // Bind Settings
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.toggleSettings();
            });
        }
        const closeSettings = document.getElementById('close-settings');
        if (closeSettings) {
            closeSettings.addEventListener('click', () => {
                document.getElementById('settings-screen').classList.add('hidden');
            });
        }
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) / 100;
                if(window.soundManager) window.soundManager.volume = val;
            });
        }

        // Bind Furnace Close
        const closeFurnace = document.getElementById('close-furnace');
        if (closeFurnace) {
            closeFurnace.addEventListener('click', () => {
                this.closeFurnace();
            });
        }

        // Bind Furnace Slots
        ['furnace-input', 'furnace-fuel', 'furnace-output'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('click', () => {
                    this.handleFurnaceClick(id);
                });
            }
        });
    }

    toggleInventory() {
        const inv = document.getElementById('inventory-screen');
        inv.classList.toggle('hidden');
        if (inv.classList.contains('hidden')) {
            if (!this.game.isMobile) this.game.canvas.requestPointerLock();
        } else {
            document.exitPointerLock();
            this.refreshInventoryUI();
        }
    }

    toggleSettings() {
        const ui = document.getElementById('settings-screen');
        ui.classList.remove('hidden');
        document.getElementById('pause-screen').classList.add('hidden'); // Hide pause menu
    }

    craftingUI() {
        const ui = document.getElementById('crafting-screen');
        ui.classList.remove('hidden');
        document.exitPointerLock();
    }

    openFurnace(entity) {
        this.activeFurnace = entity;
        const ui = document.getElementById('furnace-screen');
        ui.classList.remove('hidden');
        document.exitPointerLock();
        this.updateFurnaceUI();
    }

    closeFurnace() {
        this.activeFurnace = null;
        document.getElementById('furnace-screen').classList.add('hidden');
        if (!this.game.isMobile) this.game.canvas.requestPointerLock();
    }

    pauseGame() {
        document.getElementById('pause-screen').classList.remove('hidden');
        document.exitPointerLock();
    }

    resumeGame() {
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('settings-screen').classList.add('hidden');
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
            this.renderSlotItem(slot, item);
        }
    }

    refreshInventoryUI() {
        const grid = document.getElementById('inventory-grid');
        grid.innerHTML = '';

        // Display all 36 slots
        for (let i = 0; i < 36; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-item'; // Reusing style
            slot.dataset.index = i;

            // Visual distinction for hotbar (0-8)
            if (i < 9) {
                slot.style.borderColor = '#FFD700'; // Gold border for hotbar
            }

            const item = this.game.player.inventory[i];

            // Icon container
            const icon = document.createElement('span');
            icon.className = 'block-icon';
            slot.appendChild(icon);

            // Count overlay
            const count = document.createElement('span');
            count.className = 'slot-count';
            count.style.position = 'absolute';
            count.style.bottom = '2px';
            count.style.right = '2px';
            count.style.fontSize = '12px';
            count.style.color = 'white';
            count.style.textShadow = '1px 1px 1px black';
            slot.appendChild(count);

            this.renderSlotItem(slot, item);

            slot.addEventListener('click', () => {
                this.handleInventoryClick(i);
            });

            grid.appendChild(slot);
        }
    }

    handleFurnaceClick(slotId) {
        if (!this.activeFurnace) return;
        const entity = this.activeFurnace;
        const cursor = this.cursorItem;
        let slotItem = null;
        let slotName = '';

        if (slotId === 'furnace-input') { slotItem = entity.input; slotName = 'input'; }
        else if (slotId === 'furnace-fuel') { slotItem = entity.fuelItem; slotName = 'fuelItem'; }
        else if (slotId === 'furnace-output') { slotItem = entity.output; slotName = 'output'; }

        if (!cursor) {
            // Take from slot
            if (slotItem) {
                this.cursorItem = slotItem;
                entity[slotName] = null;
            }
        } else {
             // Put into slot
             if (slotId === 'furnace-output') {
                 // Can only take from output if cursor matches or is empty.
                 if (slotItem && slotItem.type === cursor.type) {
                      // Stack check?
                      if (cursor.count + slotItem.count <= 64) {
                          cursor.count += slotItem.count;
                          entity[slotName] = null;
                      } else {
                          // Take what fits
                          const space = 64 - cursor.count;
                          cursor.count += space;
                          slotItem.count -= space;
                      }
                 }
                 return;
             }

             if (!slotItem) {
                 entity[slotName] = cursor;
                 this.cursorItem = null;
             } else {
                 // Swap or Stack
                 if (slotItem.type === cursor.type) {
                      slotItem.count += cursor.count; // Simplified stack
                      this.cursorItem = null;
                 } else {
                     // Swap
                     entity[slotName] = cursor;
                     this.cursorItem = slotItem;
                 }
             }
        }
        this.updateFurnaceUI();
        this.updateCursorUI();
    }

    renderSlotItem(slotElement, item) {
        const icon = slotElement.querySelector('.block-icon');
        const count = slotElement.querySelector('.slot-count');

        // Clear existing durability bar if any
        const existingBar = slotElement.querySelector('.durability-bar-bg');
        if (existingBar) existingBar.remove();

        if (item) {
            const blockDef = window.BLOCKS[item.type];
            if (blockDef) {
                icon.textContent = blockDef.icon || '';
                icon.style.backgroundColor = blockDef.color || 'transparent';
            }
            if (count) count.textContent = item.count > 1 ? item.count : '';

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
                    slotElement.appendChild(barBg);
                }
            }
        } else {
            icon.style.backgroundColor = 'transparent';
            icon.textContent = '';
            if (count) count.textContent = '';
        }
    }

    handleInventoryClick(index) {
        const player = this.game.player;
        const clickedItem = player.inventory[index];
        const cursor = this.cursorItem;

        if (!cursor) {
            // Pick up
            if (clickedItem) {
                this.cursorItem = clickedItem;
                player.inventory[index] = null;
            }
        } else {
            // Place or Swap
            if (!clickedItem) {
                player.inventory[index] = cursor;
                this.cursorItem = null;
            } else {
                // Swap
                // Check if same type -> stack
                if (clickedItem.type === cursor.type && clickedItem.count < 64) {
                    const space = 64 - clickedItem.count;
                    const toAdd = Math.min(space, cursor.count);
                    clickedItem.count += toAdd;
                    cursor.count -= toAdd;
                    if (cursor.count <= 0) {
                        this.cursorItem = null;
                    }
                } else {
                    // Swap
                    player.inventory[index] = cursor;
                    this.cursorItem = clickedItem;
                }
            }
        }
        this.refreshInventoryUI();
        this.updateHotbarUI();
        this.updateCursorUI();
    }

    updateCursorUI() {
        // We could render a floating item following mouse, but for now
        // let's just indicate selection state via slot highlighting or text?
        // A simple way is to change the cursor or show a floating div.
        // For MVP, if cursorItem exists, maybe show it in a fixed place or changing cursor.
        // Or just trust the user remembers what they hold.
        // Let's create a floating element if it doesn't exist.

        let float = document.getElementById('cursor-item');
        if (!float) {
            float = document.createElement('div');
            float.id = 'cursor-item';
            float.style.position = 'fixed';
            float.style.pointerEvents = 'none';
            float.style.zIndex = '1000';
            float.style.width = '40px';
            float.style.height = '40px';
            float.style.background = 'rgba(255,255,255,0.5)';
            float.style.display = 'none';
            float.style.alignItems = 'center';
            float.style.justifyContent = 'center';
            float.style.fontSize = '24px';
            float.style.borderRadius = '5px';
            document.body.appendChild(float);

            document.addEventListener('mousemove', (e) => {
                float.style.left = (e.clientX + 10) + 'px';
                float.style.top = (e.clientY + 10) + 'px';
            });
        }

        if (this.cursorItem) {
            float.style.display = 'flex';
            const blockDef = window.BLOCKS[this.cursorItem.type];
            float.textContent = blockDef ? blockDef.icon : '?';
            float.style.backgroundColor = blockDef ? blockDef.color : '#ccc';
        } else {
            float.style.display = 'none';
        }
    }

    updateFurnaceUI() {
        if (!this.activeFurnace) return;
        const entity = this.activeFurnace;

        // Render slots
        const renderFurnaceSlot = (id, item) => {
            const slot = document.getElementById(id);
            slot.innerHTML = '';

            if (item) {
                const icon = document.createElement('span');
                icon.className = 'block-icon';
                const blockDef = window.BLOCKS[item.type];
                icon.textContent = blockDef ? blockDef.icon : '';
                icon.style.backgroundColor = blockDef ? blockDef.color : 'transparent';
                slot.appendChild(icon);

                if (item.count > 1) {
                     const count = document.createElement('span');
                     count.style.position = 'absolute';
                     count.style.bottom = '2px';
                     count.style.right = '2px';
                     count.style.fontSize = '12px';
                     count.style.color = 'white';
                     count.textContent = item.count;
                     slot.appendChild(count);
                }
            }
        };

        renderFurnaceSlot('furnace-input', entity.input);
        renderFurnaceSlot('furnace-fuel', entity.fuelItem);
        renderFurnaceSlot('furnace-output', entity.output);

        // Progress
        const prog = document.getElementById('furnace-progress');
        // Assume maxProgress is 100 for now, or use entity.maxProgress
        const pct = (entity.progress / (entity.maxProgress || 100)) * 100;
        prog.style.width = pct + '%';

        // Burn
        const burn = document.getElementById('furnace-burn');
        if (entity.burnTime > 0) burn.classList.add('active');
        else burn.classList.remove('active');

        // Bind clicks (simple implementation: click to put cursor item in, click to take out)
        // Note: This requires re-binding every update which is bad.
        // Better to bind once in init, but we need entity reference.
        // Actually, we can use binding in init that references this.activeFurnace.
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
