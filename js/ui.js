class UIManager {
    constructor(game) {
        this.game = game;
        this.cursorItem = null;
        this.activeFurnace = null;
        this.activeChest = null;
        this.activeVillager = null;
        this.activeBrewingStand = null;
        this.activeSign = null;
        this.activeAnvil = null;
    }

    init() {
        this.updateHotbarUI();

        // Inject Armor Grid
        const invContent = document.querySelector('#inventory-screen .inventory-content');
        if (invContent && !document.getElementById('armor-grid')) {
            const armorGrid = document.createElement('div');
            armorGrid.id = 'armor-grid';
            armorGrid.style.display = 'flex';
            armorGrid.style.justifyContent = 'center';
            armorGrid.style.gap = '10px';
            armorGrid.style.marginBottom = '10px';

            // Insert before inventory grid
            const grid = document.getElementById('inventory-grid');
            if (grid) invContent.insertBefore(armorGrid, grid);
        }

        // Bind Sign Close
        const closeSign = document.getElementById('close-sign');
        if (closeSign) {
            closeSign.addEventListener('click', () => this.closeSign());
        }

        // Bind Chest Close
        const closeChest = document.getElementById('close-chest');
        if (closeChest) {
            closeChest.addEventListener('click', () => this.closeChest());
        }

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

        const skinPicker = document.getElementById('skin-color-picker');
        if (skinPicker) {
            // Need to set initial value after player is ready, or update logic later
            // We can set it in toggleSettings
            skinPicker.addEventListener('change', (e) => {
                this.game.player.skinColor = e.target.value;
                localStorage.setItem('voxel_skin_color', e.target.value);
            });
        }

        // Sensitivity
        const sensitivitySlider = document.getElementById('sensitivity-slider');
        if (sensitivitySlider) {
            sensitivitySlider.value = this.game.input.sensitivity;
            document.getElementById('sensitivity-value').textContent = this.game.input.sensitivity.toFixed(1);
            sensitivitySlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                this.game.input.sensitivity = val;
                localStorage.setItem('voxel_sensitivity', val);
                document.getElementById('sensitivity-value').textContent = val.toFixed(1);
            });
        }

        // Save/Load
        const saveBtn = document.getElementById('save-game');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const name = prompt("Save World Name:", "default");
                if (name) this.game.world.saveWorld(name);
            });
        }
        const loadBtn = document.getElementById('load-game');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                const name = prompt("Load World Name:", "default");
                if (name) {
                    this.game.world.loadWorld(name);
                    this.resumeGame();
                }
            });
        }
        const resumeBtn = document.getElementById('resume-game');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => this.resumeGame());
        }
        const returnMenuBtn = document.getElementById('return-menu');
        if (returnMenuBtn) {
            returnMenuBtn.addEventListener('click', () => {
                location.reload();
            });
        }

        // Graphics Settings
        const fovSlider = document.getElementById('fov-slider');
        if (fovSlider) {
            fovSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                this.game.setFOV(val);
                document.getElementById('fov-value').textContent = val;
            });
        }

        const renderDistSlider = document.getElementById('render-dist-slider');
        if (renderDistSlider) {
            renderDistSlider.addEventListener('change', (e) => {
                const val = parseInt(e.target.value);
                this.game.setRenderDistance(val);
            });
            renderDistSlider.addEventListener('input', (e) => {
                document.getElementById('render-dist-value').textContent = e.target.value;
            });
        }

        // Controls Reset
        const resetBtn = document.getElementById('reset-controls');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm("Reset all keybinds to default?")) {
                    localStorage.removeItem('voxel_keybinds');
                    this.game.input.keybinds = {
                        forward: 'KeyW',
                        backward: 'KeyS',
                        left: 'KeyA',
                        right: 'KeyD',
                        jump: 'Space',
                        sneak: 'ShiftLeft',
                        sprint: 'ControlLeft',
                        inventory: 'KeyE',
                        fly: 'KeyF',
                        chat: 'KeyT',
                        crafting: 'KeyC'
                    };
                    this.renderSettings();
                }
            });
        }

        // Bind Pause Button
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.pauseGame();
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

        const openRecipeBook = document.getElementById('open-recipe-book');
        if (openRecipeBook) {
            openRecipeBook.addEventListener('click', () => {
                this.toggleRecipeBook();
            });
        }

        const closeRecipeBook = document.getElementById('close-recipe-book');
        if (closeRecipeBook) {
            closeRecipeBook.addEventListener('click', () => {
                document.getElementById('recipe-book-screen').classList.add('hidden');
                document.getElementById('crafting-screen').classList.remove('hidden');
            });
        }

        const closeTrading = document.getElementById('close-trading');
        if (closeTrading) {
            closeTrading.addEventListener('click', () => {
                this.closeTrading();
            });
        }

        const closeBrewing = document.getElementById('close-brewing');
        if (closeBrewing) {
            closeBrewing.addEventListener('click', () => this.closeBrewing());
        }
        ['brewing-ingredient', 'brewing-bottle-1', 'brewing-bottle-2', 'brewing-bottle-3'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', () => this.handleBrewingClick(id));
        });

        const closeEnchanting = document.getElementById('close-enchanting');
        if (closeEnchanting) {
            closeEnchanting.addEventListener('click', () => this.closeEnchanting());
        }
        const enchantItem = document.getElementById('enchanting-item');
        if (enchantItem) {
            enchantItem.addEventListener('click', () => this.handleEnchantingClick());
        }

        const closeAnvil = document.getElementById('close-anvil');
        if (closeAnvil) {
            closeAnvil.addEventListener('click', () => this.closeAnvil());
        }
        ['anvil-input-1', 'anvil-input-2', 'anvil-output'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', () => this.handleAnvilClick(id));
        });
        const anvilName = document.getElementById('anvil-rename');
        if (anvilName) {
            anvilName.addEventListener('input', () => this.updateAnvilUI());
        }
    }

    toggleRecipeBook() {
        document.getElementById('crafting-screen').classList.add('hidden');
        document.getElementById('recipe-book-screen').classList.remove('hidden');
        this.renderRecipeBook();
    }

    renderRecipeBook() {
        const list = document.getElementById('recipe-list');
        list.innerHTML = '';

        if (!this.game.crafting || !this.game.crafting.recipes) return;

        this.game.crafting.recipes.forEach(recipe => {
             if (this.game.player && !this.game.player.unlockedRecipes.has(recipe.name) && !recipe.isRepair) return;

             const container = document.createElement('div');
             container.className = 'recipe-entry';
             container.style.border = '1px solid #ccc';
             container.style.padding = '5px';
             container.style.margin = '5px';
             container.style.background = 'rgba(0,0,0,0.5)';
             container.style.display = 'flex';
             container.style.flexDirection = 'column';
             container.style.alignItems = 'center';
             container.style.width = '120px';

             // Result
             const resDiv = document.createElement('div');
             resDiv.style.display = 'flex';
             resDiv.style.alignItems = 'center';
             resDiv.style.marginBottom = '5px';

             const icon = document.createElement('span');
             icon.className = 'block-icon';
             const blockDef = window.BLOCKS[recipe.result.type];
             icon.textContent = blockDef ? blockDef.icon : '?';
             icon.style.backgroundColor = blockDef ? blockDef.color : 'transparent';

             const name = document.createElement('span');
             name.textContent = recipe.result.count > 1 ? `x${recipe.result.count}` : '';
             name.style.marginLeft = '5px';

             resDiv.appendChild(icon);
             resDiv.appendChild(name);
             container.appendChild(resDiv);

             // Label
             const label = document.createElement('div');
             label.textContent = recipe.name.split('(')[0];
             label.style.fontSize = '12px';
             label.style.marginBottom = '5px';
             container.appendChild(label);

             // Ingredients
             const ingDiv = document.createElement('div');
             ingDiv.style.display = 'flex';
             ingDiv.style.flexWrap = 'wrap';
             ingDiv.style.justifyContent = 'center';
             ingDiv.style.gap = '2px';

             recipe.ingredients.forEach(ing => {
                 const iIcon = document.createElement('span');
                 iIcon.className = 'block-icon';
                 iIcon.style.width = '20px';
                 iIcon.style.height = '20px';
                 iIcon.style.fontSize = '14px';
                 const iDef = window.BLOCKS[ing.type];
                 iIcon.textContent = iDef ? iDef.icon : '?';
                 iIcon.style.backgroundColor = iDef ? iDef.color : 'transparent';
                 iIcon.title = `${iDef ? iDef.name : 'Unknown'} x${ing.count}`;

                 ingDiv.appendChild(iIcon);
             });
             container.appendChild(ingDiv);

             list.appendChild(container);
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

        // Sync sliders
        if (this.game) {
            const fovSlider = document.getElementById('fov-slider');
            if (fovSlider) {
                fovSlider.value = this.game.fov;
                const fovVal = document.getElementById('fov-value');
                if (fovVal) fovVal.textContent = this.game.fov;
            }
            const renderDistSlider = document.getElementById('render-dist-slider');
            if (renderDistSlider) {
                renderDistSlider.value = this.game.renderDistance;
                const rdVal = document.getElementById('render-dist-value');
                if (rdVal) rdVal.textContent = this.game.renderDistance;
            }
            const skinPicker = document.getElementById('skin-color-picker');
            if (skinPicker && this.game.player) {
                skinPicker.value = this.game.player.skinColor;
            }
        }

        this.renderSettings();
    }

    renderSettings() {
        const list = document.getElementById('keybinds-list');
        if (!list) return;
        list.innerHTML = '';

        const binds = this.game.input.keybinds;
        for (const action in binds) {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.alignItems = 'center';
            row.style.padding = '5px';
            row.style.background = 'rgba(0,0,0,0.3)';
            row.style.borderRadius = '4px';

            const label = document.createElement('span');
            label.textContent = action.charAt(0).toUpperCase() + action.slice(1);

            const btn = document.createElement('button');
            btn.className = 'menu-button';
            btn.style.fontSize = '12px';
            btn.style.padding = '2px 8px';
            btn.style.width = '100px';
            btn.textContent = this.formatKeyName(binds[action]);

            btn.addEventListener('click', () => {
                btn.textContent = 'Press key...';
                const handler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.code !== 'Escape') {
                        this.game.input.bindKey(action, e.code);
                    }
                    document.removeEventListener('keydown', handler, true);
                    this.renderSettings();
                };
                document.addEventListener('keydown', handler, true);
            });

            row.appendChild(label);
            row.appendChild(btn);
            list.appendChild(row);
        }
    }

    formatKeyName(code) {
        if (!code) return 'None';
        if (code.startsWith('Key')) return code.replace('Key', '');
        if (code.startsWith('Digit')) return code.replace('Digit', '');
        return code;
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

    openChest(entity) {
        this.activeChest = entity;
        if (!entity.items) entity.items = new Array(27).fill(null);

        const ui = document.getElementById('chest-screen');
        ui.classList.remove('hidden');

        // Open inventory too
        const inv = document.getElementById('inventory-screen');
        inv.classList.remove('hidden');

        document.exitPointerLock();
        this.refreshChestUI();
        this.refreshInventoryUI(); // Ensure inventory events are bound and visible
    }

    closeChest() {
        this.activeChest = null;
        document.getElementById('chest-screen').classList.add('hidden');
        document.getElementById('inventory-screen').classList.add('hidden');
        if (!this.game.isMobile) this.game.canvas.requestPointerLock();
    }

    showSignEditor(x, y, z) {
        this.activeSign = { x, y, z };
        document.getElementById('sign-screen').classList.remove('hidden');
        const input = document.getElementById('sign-input');
        input.value = "";
        input.focus();
        document.exitPointerLock();
    }

    closeSign() {
        if (!this.activeSign) return;
        const input = document.getElementById('sign-input');
        const text = input.value;
        // Split into lines (max 4)
        const lines = text.split('\n').slice(0, 4);

        this.game.world.setBlockEntity(this.activeSign.x, this.activeSign.y, this.activeSign.z, {
            type: 'sign',
            text: lines
        });

        this.activeSign = null;
        document.getElementById('sign-screen').classList.add('hidden');
        if (!this.game.isMobile) this.game.canvas.requestPointerLock();
    }

    openTrading(villager) {
        this.activeVillager = villager;
        // Generate random trades if not present
        if (!villager.trades) {
            villager.trades = [];
            // Simple: 1 Emerald <-> Random Food/Item
            const options = [
                { cost: {type: BLOCK.ITEM_EMERALD, count: 1}, reward: {type: BLOCK.ITEM_APPLE, count: 3} },
                { cost: {type: BLOCK.ITEM_EMERALD, count: 1}, reward: {type: BLOCK.ITEM_COOKED_FISH, count: 2} },
                { cost: {type: BLOCK.ITEM_WHEAT, count: 10}, reward: {type: BLOCK.ITEM_EMERALD, count: 1} },
                { cost: {type: BLOCK.ITEM_RAW_FISH, count: 5}, reward: {type: BLOCK.ITEM_EMERALD, count: 1} },
                { cost: {type: BLOCK.ITEM_COAL, count: 10}, reward: {type: BLOCK.ITEM_EMERALD, count: 1} }
            ];
            // Pick 3 random
            for(let i=0; i<3; i++) {
                villager.trades.push(options[Math.floor(Math.random() * options.length)]);
            }
        }

        document.getElementById('trading-screen').classList.remove('hidden');
        document.getElementById('inventory-screen').classList.remove('hidden'); // Show inventory
        document.exitPointerLock();
        this.renderTrading();
        this.refreshInventoryUI();
    }

    closeTrading() {
        this.activeVillager = null;
        document.getElementById('trading-screen').classList.add('hidden');
        document.getElementById('inventory-screen').classList.add('hidden');
        if (!this.game.isMobile) this.game.canvas.requestPointerLock();
    }

    openBrewing(entity) {
        this.activeBrewingStand = entity;
        // Ensure entity structure
        if (!entity.bottles) entity.bottles = [null, null, null];
        if (!entity.brewTime) entity.brewTime = 0;

        document.getElementById('brewing-screen').classList.remove('hidden');
        document.getElementById('inventory-screen').classList.remove('hidden'); // Show inventory
        document.exitPointerLock();
        this.updateBrewingUI();
        this.refreshInventoryUI();
    }

    closeBrewing() {
        this.activeBrewingStand = null;
        document.getElementById('brewing-screen').classList.add('hidden');
        document.getElementById('inventory-screen').classList.add('hidden');
        if (!this.game.isMobile) this.game.canvas.requestPointerLock();
    }

    openEnchanting(entity) {
        this.activeEnchanting = entity || { item: null };
        document.getElementById('enchanting-screen').classList.remove('hidden');
        document.getElementById('inventory-screen').classList.remove('hidden');
        document.exitPointerLock();
        this.updateEnchantingUI();
        this.refreshInventoryUI();
    }

    closeEnchanting() {
        if (this.activeEnchanting && this.activeEnchanting.item) {
             const item = this.activeEnchanting.item;
             let added = false;
             for(let i=0; i<this.game.player.inventory.length; i++) {
                 if(!this.game.player.inventory[i]) {
                     this.game.player.inventory[i] = item;
                     added = true;
                     break;
                 }
             }
             if(!added) {
                 if (this.game.drops && window.Drop) {
                     this.game.drops.push(new window.Drop(this.game, this.game.player.x, this.game.player.y, this.game.player.z, item.type, item.count));
                 }
             }
        }
        this.activeEnchanting = null;
        document.getElementById('enchanting-screen').classList.add('hidden');
        document.getElementById('inventory-screen').classList.add('hidden');
        if (!this.game.isMobile) this.game.canvas.requestPointerLock();
    }

    openAnvil() {
        this.activeAnvil = {
            input1: null,
            input2: null,
            output: null,
            cost: 0
        };
        document.getElementById('anvil-screen').classList.remove('hidden');
        document.getElementById('inventory-screen').classList.remove('hidden');
        document.exitPointerLock();
        this.updateAnvilUI();
        this.refreshInventoryUI();
    }

    closeAnvil() {
        // Drop items
        if (this.activeAnvil) {
            [this.activeAnvil.input1, this.activeAnvil.input2].forEach(item => {
                if (item) {
                    let added = false;
                    for (let i = 0; i < this.game.player.inventory.length; i++) {
                        if (!this.game.player.inventory[i]) {
                            this.game.player.inventory[i] = item;
                            added = true;
                            break;
                        }
                    }
                    if (!added && window.Drop) {
                        this.game.drops.push(new window.Drop(this.game, this.game.player.x, this.game.player.y, this.game.player.z, item.type, item.count));
                    }
                }
            });
        }
        this.activeAnvil = null;
        document.getElementById('anvil-screen').classList.add('hidden');
        document.getElementById('inventory-screen').classList.add('hidden');
        if (!this.game.isMobile) this.game.canvas.requestPointerLock();
    }

    handleAnvilClick(id) {
        if (!this.activeAnvil) return;
        const anvil = this.activeAnvil;
        const cursor = this.cursorItem;

        if (id === 'anvil-output') {
            if (anvil.output && anvil.cost <= this.game.player.level) {
                if (!cursor) {
                    this.game.player.level -= anvil.cost;
                    this.cursorItem = anvil.output;
                    anvil.input1 = null;
                    anvil.input2 = null;
                    anvil.output = null;
                    anvil.cost = 0;
                    document.getElementById('anvil-rename').value = ""; // Reset name
                    if (window.soundManager) window.soundManager.play('place'); // Anvil use sound
                }
            }
        } else {
            let slot = (id === 'anvil-input-1') ? 'input1' : 'input2';

            if (!cursor) {
                if (anvil[slot]) {
                    this.cursorItem = anvil[slot];
                    anvil[slot] = null;
                }
            } else {
                if (!anvil[slot]) {
                    anvil[slot] = cursor;
                    this.cursorItem = null;
                } else {
                    // Swap
                    const temp = anvil[slot];
                    anvil[slot] = cursor;
                    this.cursorItem = temp;
                }
            }
        }
        this.updateAnvilUI();
        this.updateCursorUI();
    }

    updateAnvilUI() {
        if (!this.activeAnvil) return;
        const anvil = this.activeAnvil;

        // Logic
        anvil.output = null;
        anvil.cost = 0;

        const rename = document.getElementById('anvil-rename').value;

        if (anvil.input1) {
            let cost = 0;
            let output = JSON.parse(JSON.stringify(anvil.input1)); // Clone

            // Rename
            if (rename && rename !== (output.name || window.BLOCKS[output.type].name)) {
                output.name = rename;
                cost += 1;
            }

            // Repair
            if (anvil.input2) {
                // Same item repair
                if (anvil.input2.type === anvil.input1.type) {
                    // Restore durability
                    const def = window.TOOLS[output.type];
                    if (def) {
                        const max = def.durability;
                        const d1 = output.durability !== undefined ? output.durability : max;
                        const d2 = anvil.input2.durability !== undefined ? anvil.input2.durability : max;

                        const damage1 = max - d1;
                        const damage2 = max - d2;

                        // Repair amount: damage2 + 12% of max
                        // Actually Minecraft logic combines both durabilities + 12% bonus
                        // Current durability = d1. Max - d1 = damage taken.
                        // Wait, d1 is "remaining uses".
                        // Uses1 + Uses2 + Bonus

                        const repair = d2 + Math.floor(max * 0.12);
                        const newDurability = Math.min(max, d1 + repair);

                        if (newDurability > d1) {
                            output.durability = newDurability;
                            cost += 2;
                        }
                    }
                }
            }

            if (cost > 0) {
                anvil.output = output;
                anvil.cost = cost;
            }
        }

        // Render Slots
        ['anvil-input-1', 'anvil-input-2', 'anvil-output'].forEach(id => {
            const el = document.getElementById(id);
            el.innerHTML = '';
            let item = null;
            if (id === 'anvil-input-1') item = anvil.input1;
            else if (id === 'anvil-input-2') item = anvil.input2;
            else item = anvil.output;

            if (item) {
                const icon = document.createElement('span');
                icon.className = 'block-icon';
                const def = window.BLOCKS[item.type];
                icon.textContent = def ? def.icon : '';
                icon.style.backgroundColor = def ? def.color : 'transparent';
                el.appendChild(icon);
            }
        });

        const costEl = document.getElementById('anvil-cost');
        if (anvil.output) {
            costEl.textContent = `Cost: ${anvil.cost}`;
            costEl.style.color = (this.game.player.level >= anvil.cost) ? '#55FF55' : '#FF5555';
        } else {
            costEl.textContent = 'Cost: 0';
            costEl.style.color = 'white';
        }
    }

    handleEnchantingClick() {
        if (!this.activeEnchanting) return;

        const cursor = this.cursorItem;
        const slotItem = this.activeEnchanting.item;

        if (!cursor) {
            if (slotItem) {
                this.cursorItem = slotItem;
                this.activeEnchanting.item = null;
            }
        } else {
            if (!slotItem) {
                this.activeEnchanting.item = cursor;
                this.cursorItem = null;
            } else {
                this.activeEnchanting.item = cursor;
                this.cursorItem = slotItem;
            }
        }
        this.updateEnchantingUI();
        this.updateCursorUI();
    }

    updateEnchantingUI() {
        if (!this.activeEnchanting) return;

        const slot = document.getElementById('enchanting-item');
        slot.innerHTML = '';
        const item = this.activeEnchanting.item;

        if (item) {
            const icon = document.createElement('span');
            icon.className = 'block-icon';
            const blockDef = window.BLOCKS[item.type];
            icon.textContent = blockDef ? blockDef.icon : '';
            icon.style.backgroundColor = blockDef ? blockDef.color : 'transparent';
            slot.appendChild(icon);
        }

        const list = document.getElementById('enchanting-options');
        list.innerHTML = '';

        if (item && !item.enchantments) {
             const costs = [1, 2, 3];
             costs.forEach((cost) => {
                 const btn = document.createElement('button');
                 btn.className = 'menu-button';
                 btn.textContent = `Cost: ${cost} Levels`;
                 btn.style.fontSize = '12px';

                 if (this.game.player.level >= cost) {
                     btn.onclick = () => this.enchant(cost);
                 } else {
                     btn.disabled = true;
                     btn.style.opacity = '0.5';
                 }
                 list.appendChild(btn);
             });
        } else if (item && item.enchantments) {
             const div = document.createElement('div');
             div.textContent = "Already Enchanted";
             div.style.color = "yellow";
             list.appendChild(div);
        }
    }

    enchant(cost) {
        if (!this.activeEnchanting || !this.activeEnchanting.item) return;

        if (this.game.player.level >= cost) {
            this.game.player.level -= cost;

            const item = this.activeEnchanting.item;
            if (!item.enchantments) item.enchantments = [];

            const enchants = ['Sharpness', 'Efficiency', 'Unbreaking', 'Power'];
            const type = enchants[Math.floor(Math.random() * enchants.length)];

            item.enchantments.push({ type: type, level: 1 });

            if (window.soundManager) window.soundManager.play('place');
            this.updateEnchantingUI();
            this.updateHealthUI();
        }
    }

    handleBrewingClick(slotId) {
        if (!this.activeBrewingStand) return;
        const entity = this.activeBrewingStand;
        const cursor = this.cursorItem;
        let slotName = '';
        let index = -1;

        if (slotId === 'brewing-ingredient') slotName = 'ingredient';
        else if (slotId === 'brewing-bottle-1') { slotName = 'bottles'; index = 0; }
        else if (slotId === 'brewing-bottle-2') { slotName = 'bottles'; index = 1; }
        else if (slotId === 'brewing-bottle-3') { slotName = 'bottles'; index = 2; }

        let slotItem = index === -1 ? entity[slotName] : entity[slotName][index];

        if (!cursor) {
            if (slotItem) {
                this.cursorItem = slotItem;
                if (index === -1) entity[slotName] = null;
                else entity[slotName][index] = null;
            }
        } else {
            if (!slotItem) {
                if (index === -1) entity[slotName] = cursor;
                else entity[slotName][index] = cursor;
                this.cursorItem = null;
            } else {
                // Swap
                if (index === -1) entity[slotName] = cursor;
                else entity[slotName][index] = cursor;
                this.cursorItem = slotItem;
            }
        }
        this.updateBrewingUI();
        this.updateCursorUI();
    }

    updateBrewingUI() {
        if (!this.activeBrewingStand) return;
        const entity = this.activeBrewingStand;

        const renderSlot = (id, item) => {
            const el = document.getElementById(id);
            el.innerHTML = '';
            if (item) {
                const icon = document.createElement('span');
                icon.className = 'block-icon';
                const def = window.BLOCKS[item.type];
                icon.textContent = def ? def.icon : '';
                icon.style.backgroundColor = def ? def.color : 'transparent';
                el.appendChild(icon);
            }
        };

        renderSlot('brewing-ingredient', entity.ingredient);
        renderSlot('brewing-bottle-1', entity.bottles[0]);
        renderSlot('brewing-bottle-2', entity.bottles[1]);
        renderSlot('brewing-bottle-3', entity.bottles[2]);

        const progress = document.getElementById('brewing-progress');
        if (progress) {
            const pct = (entity.brewTime / 400) * 100;
            progress.style.height = pct + '%';
        }
    }

    renderTrading() {
        if (!this.activeVillager) return;
        const list = document.getElementById('trading-list');
        list.innerHTML = '';

        this.activeVillager.trades.forEach((trade, index) => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.background = 'rgba(0,0,0,0.5)';
            row.style.padding = '5px';
            row.style.borderRadius = '4px';

            const createIcon = (item) => {
                const span = document.createElement('span');
                const def = window.BLOCKS[item.type];
                span.textContent = (def ? def.icon : '?') + ' x' + item.count;
                span.style.marginRight = '10px';
                span.style.fontSize = '20px';
                return span;
            }

            row.appendChild(createIcon(trade.cost));

            const arrow = document.createElement('span');
            arrow.textContent = '➔';
            arrow.style.marginRight = '10px';
            row.appendChild(arrow);

            row.appendChild(createIcon(trade.reward));

            const btn = document.createElement('button');
            btn.className = 'menu-button';
            btn.textContent = 'Trade';
            btn.style.marginLeft = 'auto';
            btn.onclick = () => this.trade(index);

            row.appendChild(btn);
            list.appendChild(row);
        });
    }

    trade(index) {
        if (!this.activeVillager) return;
        const trade = this.activeVillager.trades[index];
        const player = this.game.player;

        // Check cost
        let total = 0;
        player.inventory.forEach(slot => {
            if (slot && slot.type === trade.cost.type) total += slot.count;
        });

        if (total >= trade.cost.count) {
            // Deduct
            let remaining = trade.cost.count;
            for(let i=0; i<player.inventory.length; i++) {
                const slot = player.inventory[i];
                if (slot && slot.type === trade.cost.type) {
                    if (slot.count >= remaining) {
                        slot.count -= remaining;
                        remaining = 0;
                        if (slot.count === 0) player.inventory[i] = null;
                    } else {
                        remaining -= slot.count;
                        player.inventory[i] = null;
                    }
                    if (remaining === 0) break;
                }
            }

            // Add Reward
            let toAdd = trade.reward.count;
             for (let i = 0; i < player.inventory.length; i++) {
                const slot = player.inventory[i];
                if (slot && slot.type === trade.reward.type && slot.count < 64) {
                    const space = 64 - slot.count;
                    const add = Math.min(space, toAdd);
                    slot.count += add;
                    toAdd -= add;
                    if (toAdd === 0) break;
                }
            }
            if (toAdd > 0) {
                 for (let i = 0; i < player.inventory.length; i++) {
                    if (!player.inventory[i]) {
                        player.inventory[i] = {type: trade.reward.type, count: toAdd};
                        toAdd = 0;
                        break;
                    }
                }
            }
            if (toAdd > 0) {
                 // Drop
                 if (window.Drop) {
                     this.game.drops.push(new window.Drop(this.game, player.x, player.y+1, player.z, trade.reward.type, toAdd));
                 }
            }

            if (window.soundManager) window.soundManager.play('place');
            this.refreshInventoryUI();
        } else {
            alert("Not enough resources!");
        }
    }

    refreshChestUI() {
        if (!this.activeChest) return;
        const grid = document.getElementById('chest-grid');
        grid.innerHTML = '';
        const items = this.activeChest.items;

        for (let i = 0; i < 27; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-item';
            slot.dataset.index = i;

            const icon = document.createElement('span');
            icon.className = 'block-icon';
            slot.appendChild(icon);

            const count = document.createElement('span');
            count.className = 'slot-count';
            count.style.position = 'absolute';
            count.style.bottom = '2px';
            count.style.right = '2px';
            count.style.fontSize = '12px';
            count.style.color = 'white';
            slot.appendChild(count);

            this.renderSlotItem(slot, items[i]);

            slot.addEventListener('click', () => {
                this.handleChestClick(i);
            });

            grid.appendChild(slot);
        }
    }

    handleChestClick(index) {
        if (!this.activeChest) return;
        const items = this.activeChest.items;
        const clickedItem = items[index];
        const cursor = this.cursorItem;

        if (!cursor) {
            if (clickedItem) {
                this.cursorItem = clickedItem;
                items[index] = null;
            }
        } else {
            if (!clickedItem) {
                items[index] = cursor;
                this.cursorItem = null;
            } else {
                 if (clickedItem.type === cursor.type && clickedItem.count < 64) {
                     const space = 64 - clickedItem.count;
                     const toAdd = Math.min(space, cursor.count);
                     clickedItem.count += toAdd;
                     cursor.count -= toAdd;
                     if (cursor.count <= 0) this.cursorItem = null;
                 } else {
                     items[index] = cursor;
                     this.cursorItem = clickedItem;
                 }
            }
        }
        this.refreshChestUI();
        this.updateCursorUI();
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

    refreshArmorUI() {
        const grid = document.getElementById('armor-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const placeholders = ['🧢', '👕', '👖', '👢'];

        for (let i = 0; i < 4; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-item';
            slot.dataset.armorSlot = i;
            slot.style.position = 'relative'; // Ensure placeholder positioning works

            // Placeholder bg if empty
            if (!this.game.player.armor[i]) {
                const ph = document.createElement('span');
                ph.textContent = placeholders[i];
                ph.style.opacity = '0.3';
                ph.style.fontSize = '20px';
                ph.style.position = 'absolute';
                ph.style.top = '50%';
                ph.style.left = '50%';
                ph.style.transform = 'translate(-50%, -50%)';
                ph.style.pointerEvents = 'none';
                slot.appendChild(ph);
            }

            this.renderSlotItem(slot, this.game.player.armor[i]);

            slot.addEventListener('click', () => {
                this.handleArmorClick(i);
            });

            grid.appendChild(slot);
        }
    }

    handleArmorClick(index) {
        const player = this.game.player;
        const cursor = this.cursorItem;
        const slotItem = player.armor[index];

        if (!cursor) {
            // Unequip
            if (slotItem) {
                this.cursorItem = slotItem;
                player.armor[index] = null;
            }
        } else {
            // Equip
            if (window.ARMOR && window.ARMOR[cursor.type] && window.ARMOR[cursor.type].slot === index) {
                if (!slotItem) {
                    player.armor[index] = cursor;
                    this.cursorItem = null;
                } else {
                    // Swap
                    player.armor[index] = cursor;
                    this.cursorItem = slotItem;
                }
                if (window.soundManager) window.soundManager.play('place');
            }
        }
        this.refreshArmorUI();
        this.updateCursorUI();
    }

    refreshInventoryUI() {
        this.refreshArmorUI();

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

            if (item.enchantments && item.enchantments.length > 0) {
                slotElement.style.boxShadow = 'inset 0 0 5px #b550e6';
            } else {
                slotElement.style.boxShadow = 'none';
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

    showNotification(message) {
        let container = document.getElementById('notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications-container';
            container.style.position = 'fixed';
            container.style.top = '100px';
            container.style.left = '50%';
            container.style.transform = 'translateX(-50%)';
            container.style.zIndex = '1000';
            container.style.pointerEvents = 'none';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'center';
            container.style.gap = '5px';
            document.body.appendChild(container);
        }

        const div = document.createElement('div');
        div.className = 'notification';
        div.textContent = message;
        div.style.background = 'rgba(0, 0, 0, 0.7)';
        div.style.color = 'white';
        div.style.padding = '10px 20px';
        div.style.borderRadius = '5px';
        div.style.transition = 'opacity 1s';
        div.style.opacity = '1';

        container.appendChild(div);

        setTimeout(() => {
            div.style.opacity = '0';
            setTimeout(() => {
                if (div.parentNode) div.parentNode.removeChild(div);
            }, 1000);
        }, 3000);
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

        const xpBar = document.getElementById('xp-bar');
        const xpLevel = document.getElementById('xp-level');
        if (xpBar && xpLevel) {
            const pct = this.game.player.xp * 100;
            xpBar.style.width = pct + '%';
            xpLevel.textContent = this.game.player.level;
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
