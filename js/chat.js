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
        const line = document.createElement('div');
        line.className = 'message';
        line.textContent = sender ? `<${sender}> ${text}` : text;
        this.messages.appendChild(line);
        this.messages.scrollTop = this.messages.scrollHeight;

        // Remove old messages
        if (this.messages.children.length > 50) {
            this.messages.removeChild(this.messages.firstChild);
        }
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
        } else {
            this.addMessage("Unknown command: " + cmd);
        }
    }
}

window.ChatManager = ChatManager;
