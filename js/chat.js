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
            this.game.network.sendChat(text);
            // this.addMessage(text, this.game.player.name); // Server will echo back usually
            this.input.value = '';
        }
    }
}

window.ChatManager = ChatManager;
