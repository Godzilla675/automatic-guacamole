class InputManager {
    constructor(game) {
        this.game = game;
        this.mouse = { locked: false };
        this.joystick = { active: false, x: 0, y: 0 };
        this.lookTouch = { active: false, startX: 0, startY: 0 };
    }

    setupEventListeners() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;

            // Chat Toggle (T or Enter)
            if (e.code === 'KeyT' || e.code === 'Enter') {
                if (this.game.chat && !this.game.chat.isOpen) {
                    this.game.chat.open();
                    e.preventDefault();
                    return;
                }
            }

            if (!this.game.controls.enabled) return;

            switch(e.code) {
                case 'F3':
                    e.preventDefault();
                    const debug = document.getElementById('debug-info');
                    if (debug) debug.classList.toggle('hidden');
                    break;
                case 'KeyW': this.game.controls.forward = true; break;
                case 'KeyS': this.game.controls.backward = true; break;
                case 'KeyA': this.game.controls.left = true; break;
                case 'KeyD': this.game.controls.right = true; break;
                case 'Space': this.game.controls.jump = true; break;
                case 'ShiftLeft': this.game.controls.sneak = true; break;
                case 'ControlLeft': this.game.controls.sprint = true; break;
                case 'KeyF': this.game.player.flying = !this.game.player.flying; break;
                case 'KeyE': this.game.ui.toggleInventory(); break;
                case 'Escape': this.game.ui.pauseGame(); break;
                case 'KeyC': this.game.ui.craftingUI(); break;
                case 'KeyO': {
                    const name = prompt("Save World Name:", "default");
                    if (name) this.game.world.saveWorld(name);
                    break;
                }
                case 'KeyL': {
                    const name = prompt("Load World Name:", "default");
                    if (name) this.game.world.loadWorld(name);
                    break;
                }
                // Hotbar keys 1-9
                default:
                    if (e.code.startsWith('Digit')) {
                        const digit = parseInt(e.code.replace('Digit', ''));
                        if (digit > 0 && digit <= 9) {
                            this.game.player.selectedSlot = digit - 1;
                            this.game.ui.updateHotbarUI();
                        }
                    }
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'KeyW': this.game.controls.forward = false; break;
                case 'KeyS': this.game.controls.backward = false; break;
                case 'KeyA': this.game.controls.left = false; break;
                case 'KeyD': this.game.controls.right = false; break;
                case 'Space': this.game.controls.jump = false; break;
                case 'ShiftLeft': this.game.controls.sneak = false; break;
                case 'ControlLeft': this.game.controls.sprint = false; break;
            }
        });

        // Mouse
        this.game.canvas.addEventListener('click', () => {
            if (!this.game.isMobile && !document.pointerLockElement) {
                this.game.canvas.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.mouse.locked = document.pointerLockElement === this.game.canvas;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.mouse.locked) {
                this.game.player.yaw -= e.movementX * 0.003;
                this.game.player.pitch -= e.movementY * 0.003;
                this.game.player.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.game.player.pitch));
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (this.mouse.locked) {
                if (e.button === 0) this.game.startAction(true); // Attack/Break
                else if (e.button === 2) this.game.startAction(false); // Place
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (this.mouse.locked) {
                 if (e.button === 0) this.game.stopAction();
            }
        });

        document.addEventListener('contextmenu', e => e.preventDefault());
    }

    setupMobileControls() {
        const joystickContainer = document.getElementById('joystick-container');
        const joystickStick = document.getElementById('joystick-stick');

        joystickContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.joystick.active = true;
        });

        joystickContainer.addEventListener('touchmove', (e) => {
            if (!this.joystick.active) return;
            e.preventDefault();
            const touch = e.touches[0];
            const rect = joystickContainer.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            let dx = touch.clientX - centerX;
            let dy = touch.clientY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = rect.width / 2;

            if (distance > maxDistance) {
                dx = dx / distance * maxDistance;
                dy = dy / distance * maxDistance;
            }

            joystickStick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

            this.joystick.x = dx / maxDistance;
            this.joystick.y = dy / maxDistance;

            this.game.controls.forward = this.joystick.y < -0.3;
            this.game.controls.backward = this.joystick.y > 0.3;
            this.game.controls.left = this.joystick.x < -0.3;
            this.game.controls.right = this.joystick.x > 0.3;
        });

        const resetJoystick = () => {
             this.joystick.active = false;
             joystickStick.style.transform = 'translate(-50%, -50%)';
             this.joystick.x = 0;
             this.joystick.y = 0;
             this.game.controls.forward = false;
             this.game.controls.backward = false;
             this.game.controls.left = false;
             this.game.controls.right = false;
        };
        joystickContainer.addEventListener('touchend', resetJoystick);
        joystickContainer.addEventListener('touchcancel', resetJoystick);

        // Touch look
        this.game.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1 && e.touches[0].clientX > window.innerWidth/2) {
                 this.lookTouch.active = true;
                 this.lookTouch.startX = e.touches[0].clientX;
                 this.lookTouch.startY = e.touches[0].clientY;
            }
        });
        this.game.canvas.addEventListener('touchmove', (e) => {
            if (this.lookTouch.active && e.touches.length === 1) {
                e.preventDefault();
                const dx = e.touches[0].clientX - this.lookTouch.startX;
                const dy = e.touches[0].clientY - this.lookTouch.startY;
                this.game.player.yaw -= dx * 0.005;
                this.game.player.pitch -= dy * 0.005;
                this.game.player.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.game.player.pitch));
                this.lookTouch.startX = e.touches[0].clientX;
                this.lookTouch.startY = e.touches[0].clientY;
            }
        });
        this.game.canvas.addEventListener('touchend', () => this.lookTouch.active = false);

        // Buttons
        document.getElementById('jump-btn').addEventListener('touchstart', (e) => { e.preventDefault(); this.game.controls.jump = true; });
        document.getElementById('jump-btn').addEventListener('touchend', (e) => { e.preventDefault(); this.game.controls.jump = false; });

        const breakBtn = document.getElementById('break-btn');
        breakBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.game.startAction(true); });
        breakBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.game.stopAction(); });

        const placeBtn = document.getElementById('place-btn');
        placeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.game.startAction(false); });

        document.getElementById('fly-btn').addEventListener('touchstart', (e) => { e.preventDefault(); this.game.player.flying = !this.game.player.flying; });
    }
}

window.InputManager = InputManager;
