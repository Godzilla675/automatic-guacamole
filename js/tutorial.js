class TutorialManager {
    constructor(game) {
        this.game = game;
        this.step = 0;
        this.steps = [
            { text: "Welcome! Use W,A,S,D to move.", check: () => this.game.input.keys['KeyW'] || this.game.input.keys['KeyS'] },
            { text: "Press SPACE to jump.", check: () => this.game.input.keys['Space'] },
            { text: "Hold Left Click to break blocks.", check: () => this.game.breaking },
            { text: "Press E to open Inventory.", check: () => !document.getElementById('inventory-screen').classList.contains('hidden') },
            { text: "Good luck!", timer: 3.0 }
        ];
        this.active = true;
        this.timer = 0;

        this.el = document.createElement('div');
        Object.assign(this.el.style, {
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            pointerEvents: 'none',
            fontSize: '18px',
            zIndex: '150',
            transition: 'opacity 0.5s'
        });
        document.body.appendChild(this.el);
    }

    update(dt) {
        if (!this.active) return;
        if (this.step >= this.steps.length) {
            this.active = false;
            this.el.style.opacity = '0';
            return;
        }

        const current = this.steps[this.step];
        this.el.textContent = current.text;

        if (current.check) {
            if (current.check()) {
                this.step++;
            }
        } else if (current.timer) {
            this.timer += dt;
            if (this.timer > current.timer) {
                this.step++;
                this.timer = 0;
            }
        } else {
            this.step++; // auto advance
        }
    }
}
window.TutorialManager = TutorialManager;
