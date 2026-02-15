class ChatManager {
    constructor(game) {
        this.game = game;
        this.container = document.getElementById('chat-container');
        this.messages = document.getElementById('chat-messages');
        this.input = document.getElementById('chat-input');
        this.isOpen = false;

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.send();
                this.close();
            } else if (e.key === 'Escape') {
                this.close();
            }
            e.stopPropagation(); // Prevent game controls
        });
    }

    addMessage(text, sender) {
        if (this.game.pluginAPI) this.game.pluginAPI.emit('chat', {text, sender});

        const line = document.createElement('div');
        line.className = 'message';
        line.textContent = sender ? `<${sender}> ${text}` : text;
        this.messages.appendChild(line);
        this.messages.scrollTop = this.messages.scrollHeight;

        // Remove old messages from DOM
        if (this.messages.children.length > 50) {
            this.messages.removeChild(this.messages.firstChild);
        }

        // Auto-remove message from DOM after fade animation (11s matches CSS)
        setTimeout(() => {
            if (line.parentNode) line.parentNode.removeChild(line);
        }, 11000);
    }

    open() {
        this.isOpen = true;
        this.input.classList.remove('hidden');
        this.input.focus();
        document.exitPointerLock();
        this.game.controls.enabled = false; // Disable game controls
    }

    close() {
        this.isOpen = false;
        this.input.classList.add('hidden');
        this.input.blur();
        if (!this.game.isMobile) this.game.canvas.requestPointerLock();
        this.game.controls.enabled = true;
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    send() {
        const text = this.input.value.trim();
        if (text) {
            if (text.startsWith('/')) {
                this.handleCommand(text);
            } else {
                this.game.network.sendChat(text);
                // this.addMessage(text, this.game.player.name); // Server will echo back usually
            }
            this.input.value = '';
        }
    }

    handleCommand(text) {
        const parts = text.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (cmd === '/time' && args[0] === 'set') {
            const val = args[1];
            if (val === 'day') {
                this.game.gameTime = 0;
                this.addMessage("Time set to Day");
            } else if (val === 'night') {
                this.game.gameTime = this.game.dayLength / 2;
                this.addMessage("Time set to Night");
            } else {
                const time = parseInt(val);
                if (!isNaN(time)) {
                    this.game.gameTime = time;
                    this.addMessage("Time set to " + time);
                }
            }
        } else if (cmd === '/fill') {
            if (args.length >= 7) {
                const x1 = Math.floor(parseFloat(args[0]));
                const y1 = Math.floor(parseFloat(args[1]));
                const z1 = Math.floor(parseFloat(args[2]));
                const x2 = Math.floor(parseFloat(args[3]));
                const y2 = Math.floor(parseFloat(args[4]));
                const z2 = Math.floor(parseFloat(args[5]));
                const blockName = args[6].toLowerCase();

                let blockType = null;
                // Find block ID
                for (const key in window.BLOCKS) {
                    if (window.BLOCKS[key].name && window.BLOCKS[key].name.toLowerCase() === blockName) {
                        blockType = parseInt(key);
                        break;
                    }
                }

                if (blockType !== null) {
                    const minX = Math.min(x1, x2);
                    const maxX = Math.max(x1, x2);
                    const minY = Math.min(y1, y2);
                    const maxY = Math.max(y1, y2);
                    const minZ = Math.min(z1, z2);
                    const maxZ = Math.max(z1, z2);

                    let count = 0;
                    for (let x = minX; x <= maxX; x++) {
                        for (let y = minY; y <= maxY; y++) {
                            for (let z = minZ; z <= maxZ; z++) {
                                this.game.world.setBlock(x, y, z, blockType);
                                if (blockType === window.BLOCK.WATER) {
                                    this.game.world.setMetadata(x, y, z, 8); // Source
                                }
                                this.game.network.sendBlockUpdate(x, y, z, blockType);
                                count++;
                            }
                        }
                    }
                    this.addMessage(`Filled ${count} blocks with ${blockName}`);
                } else {
                    this.addMessage("Unknown block: " + blockName);
                }
            } else {
                this.addMessage("Usage: /fill x1 y1 z1 x2 y2 z2 blockName");
            }
        } else if (cmd === '/gamemode') {
            if (args.length >= 1) {
                const mode = args[0].toLowerCase();
                let gm = -1;
                if (mode === '0' || mode === 'survival' || mode === 's') gm = 0;
                else if (mode === '1' || mode === 'creative' || mode === 'c') gm = 1;

                if (gm !== -1) {
                    this.game.player.gamemode = gm;
                    this.addMessage(`Set gamemode to ${gm === 1 ? 'Creative' : 'Survival'}`);
                    if (gm === 0) {
                        this.game.player.flying = false;
                    }
                } else {
                    this.addMessage("Unknown gamemode: " + mode);
                }
            } else {
                this.addMessage("Usage: /gamemode <survival|creative>");
            }
        } else if (cmd === '/give') {
            if (args.length >= 1) {
                const itemName = args[0].toLowerCase();
                const count = args.length >= 2 ? parseInt(args[1]) : 1;

                let type = null;
                // Try ID
                if (!isNaN(parseInt(itemName))) {
                    type = parseInt(itemName);
                } else {
                    // Try Name
                    for (const key in window.BLOCKS) {
                        if (window.BLOCKS[key].name && window.BLOCKS[key].name.toLowerCase() === itemName) {
                            type = parseInt(key);
                            break;
                        }
                    }
                }

                if (type !== null && window.BLOCKS[type]) {
                    // Add to inventory
                    const inventory = this.game.player.inventory;
                    let added = false;

                    // Stack first
                    for(let i=0; i<inventory.length; i++) {
                        if (inventory[i] && inventory[i].type === type && inventory[i].count < 64) {
                            const space = 64 - inventory[i].count;
                            const toAdd = Math.min(space, count);
                            inventory[i].count += toAdd;
                            // count -= toAdd; // Assume single stack give for simplicity
                            added = true;
                            break;
                        }
                    }
                    if (!added) {
                        for(let i=0; i<inventory.length; i++) {
                            if (!inventory[i]) {
                                inventory[i] = { type: type, count: count };
                                added = true;
                                break;
                            }
                        }
                    }

                    if (added) {
                        this.addMessage(`Gave ${count} ${window.BLOCKS[type].name} to Player`);
                        this.game.ui.updateHotbarUI();
                    } else {
                        this.addMessage("Inventory full");
                    }
                } else {
                    this.addMessage("Unknown item: " + itemName);
                }
            } else {
                this.addMessage("Usage: /give <item> [count]");
            }
        } else if (cmd === '/tp') {
            if (args.length === 3) {
                const x = parseFloat(args[0]);
                const y = parseFloat(args[1]);
                const z = parseFloat(args[2]);
                if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                    this.game.player.x = x;
                    this.game.player.y = y;
                    this.game.player.z = z;
                    this.game.player.vx = 0;
                    this.game.player.vy = 0;
                    this.game.player.vz = 0;
                    this.addMessage(`Teleported to ${x}, ${y}, ${z}`);
                } else {
                    this.addMessage("Invalid coordinates");
                }
            } else {
                this.addMessage("Usage: /tp <x> <y> <z>");
            }
        } else if (cmd === '/clear') {
            this.game.player.inventory.fill(null);
            this.game.ui.updateHotbarUI();
            this.addMessage("Cleared inventory");
        } else {
            this.addMessage("Unknown command: " + cmd);
        }
    }
}

window.ChatManager = ChatManager;
