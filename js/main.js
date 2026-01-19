// Main Game Class

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Modules
        this.world = new World();
        this.physics = new Physics(this.world);
        this.player = new Player(this);
        this.mobs = [];
        this.network = new NetworkManager(this);
        this.crafting = new CraftingSystem(this);

        // Game State
        this.lastTime = Date.now();
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTime = Date.now();
        this.gameTime = 0;
        this.dayLength = 120000;
        this.sunBrightness = 1.0;

        // Controls
        this.controls = {
            forward: false, backward: false,
            left: false, right: false,
            jump: false, sneak: false
        };
        this.mouse = { locked: false };
        this.isMobile = this.detectMobile();
        this.joystick = { active: false, x: 0, y: 0 };
        this.lookTouch = { active: false, startX: 0, startY: 0 };

        // Rendering
        this.fov = 60;
        this.renderDistance = 60; // blocks
    }

    detectMobile() {
        const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const hasTouchSupport = ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0);
        const isSmallScreen = window.innerWidth < 768;
        return (isMobileUserAgent && (hasTouchSupport || isSmallScreen)) || (hasTouchSupport && isSmallScreen);
    }

    async init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Generate initial world around player
        this.updateChunks();

        // Init Mobs
        for (let i = 0; i < 3; i++) {
            this.mobs.push(new Mob(this, 8 + i*2, 40, 8 + i*2, MOB_TYPE.COW));
        }
        for (let i = 0; i < 2; i++) {
            this.mobs.push(new Mob(this, 15 + i*2, 40, 15 + i*2, MOB_TYPE.ZOMBIE));
        }
        this.mobs.push(new Mob(this, 12, 40, 12, MOB_TYPE.PIG));

        // Connect Multiplayer
        this.network.connect('ws://localhost:8080');

        this.crafting.initUI();
        this.setupEventListeners();

        if (this.isMobile) {
            document.getElementById('mobile-controls').classList.remove('hidden');
            this.setupMobileControls();
        }

        // Start Loop
        this.gameLoop();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;

        if (this.ctx.setTransform) {
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
    }

    updateChunks() {
        const centerChunkX = Math.floor(this.player.x / 16);
        const centerChunkZ = Math.floor(this.player.z / 16);
        const dist = this.world.renderDistance; // In chunks

        for (let cx = centerChunkX - dist; cx <= centerChunkX + dist; cx++) {
            for (let cz = centerChunkZ - dist; cz <= centerChunkZ + dist; cz++) {
                this.world.generateChunk(cx, cz);
            }
        }
    }

    setupEventListeners() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            switch(e.code) {
                case 'KeyW': this.controls.forward = true; break;
                case 'KeyS': this.controls.backward = true; break;
                case 'KeyA': this.controls.left = true; break;
                case 'KeyD': this.controls.right = true; break;
                case 'Space': this.controls.jump = true; break;
                case 'ShiftLeft': this.controls.sneak = true; break;
                case 'KeyF': this.player.flying = !this.player.flying; break;
                case 'KeyE': this.toggleInventory(); break;
                case 'Escape': this.pauseGame(); break;
                case 'KeyC': this.craftingUI(); break;
                case 'KeyO': {
                    const name = prompt("Save World Name:", "default");
                    if (name) this.world.saveWorld(name);
                    break;
                }
                case 'KeyL': {
                    const name = prompt("Load World Name:", "default");
                    if (name) this.world.loadWorld(name);
                    break;
                }
                // Hotbar keys 1-9
                default:
                    if (e.code.startsWith('Digit')) {
                        const digit = parseInt(e.code.replace('Digit', ''));
                        if (digit > 0 && digit <= 9) {
                            this.player.selectedSlot = digit - 1;
                            this.updateHotbarUI();
                        }
                    }
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'KeyW': this.controls.forward = false; break;
                case 'KeyS': this.controls.backward = false; break;
                case 'KeyA': this.controls.left = false; break;
                case 'KeyD': this.controls.right = false; break;
                case 'Space': this.controls.jump = false; break;
                case 'ShiftLeft': this.controls.sneak = false; break;
            }
        });

        // Mouse
        this.canvas.addEventListener('click', () => {
            if (!this.isMobile && !document.pointerLockElement) {
                this.canvas.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.mouse.locked = document.pointerLockElement === this.canvas;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.mouse.locked) {
                this.player.yaw -= e.movementX * 0.003;
                this.player.pitch -= e.movementY * 0.003;
                this.player.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.pitch));
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (this.mouse.locked) {
                if (e.button === 0) this.breakBlock();
                else if (e.button === 2) this.placeBlock();
            }
        });

        document.addEventListener('contextmenu', e => e.preventDefault());

        // Inventory UI clicks (simplified)
        document.querySelectorAll('.hotbar-slot').forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.player.selectedSlot = index;
                this.updateHotbarUI();
            });
        });
    }

    setupMobileControls() {
        // Reuse logic from original game.js for joystick/buttons
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

            this.controls.forward = this.joystick.y < -0.3;
            this.controls.backward = this.joystick.y > 0.3;
            this.controls.left = this.joystick.x < -0.3;
            this.controls.right = this.joystick.x > 0.3;
        });

        const resetJoystick = () => {
             this.joystick.active = false;
             joystickStick.style.transform = 'translate(-50%, -50%)';
             this.joystick.x = 0;
             this.joystick.y = 0;
             this.controls.forward = false;
             this.controls.backward = false;
             this.controls.left = false;
             this.controls.right = false;
        };
        joystickContainer.addEventListener('touchend', resetJoystick);
        joystickContainer.addEventListener('touchcancel', resetJoystick);

        // Touch look
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1 && e.touches[0].clientX > window.innerWidth/2) {
                 this.lookTouch.active = true;
                 this.lookTouch.startX = e.touches[0].clientX;
                 this.lookTouch.startY = e.touches[0].clientY;
            }
        });
        this.canvas.addEventListener('touchmove', (e) => {
            if (this.lookTouch.active && e.touches.length === 1) {
                e.preventDefault();
                const dx = e.touches[0].clientX - this.lookTouch.startX;
                const dy = e.touches[0].clientY - this.lookTouch.startY;
                this.player.yaw -= dx * 0.005;
                this.player.pitch -= dy * 0.005;
                this.player.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.player.pitch));
                this.lookTouch.startX = e.touches[0].clientX;
                this.lookTouch.startY = e.touches[0].clientY;
            }
        });
        this.canvas.addEventListener('touchend', () => this.lookTouch.active = false);

        // Buttons
        document.getElementById('jump-btn').addEventListener('touchstart', (e) => { e.preventDefault(); this.controls.jump = true; });
        document.getElementById('jump-btn').addEventListener('touchend', (e) => { e.preventDefault(); this.controls.jump = false; });
        document.getElementById('break-btn').addEventListener('touchstart', (e) => { e.preventDefault(); this.breakBlock(); });
        document.getElementById('place-btn').addEventListener('touchstart', (e) => { e.preventDefault(); this.placeBlock(); });
        document.getElementById('fly-btn').addEventListener('touchstart', (e) => { e.preventDefault(); this.player.flying = !this.player.flying; });
    }

    breakBlock() {
        const dir = {
            x: Math.sin(this.player.yaw) * Math.cos(this.player.pitch),
            y: -Math.sin(this.player.pitch),
            z: Math.cos(this.player.yaw) * Math.cos(this.player.pitch)
        };
        const hit = this.physics.raycast(this.player, dir, 5);
        if (hit) {
            this.world.setBlock(hit.x, hit.y, hit.z, BLOCK.AIR);
            window.soundManager.play('break');
            // Drop item?
            // Add to inventory?
            this.network.sendBlockUpdate(hit.x, hit.y, hit.z, BLOCK.AIR);
        }
    }

    placeBlock() {
        const dir = {
            x: Math.sin(this.player.yaw) * Math.cos(this.player.pitch),
            y: -Math.sin(this.player.pitch),
            z: Math.cos(this.player.yaw) * Math.cos(this.player.pitch)
        };
        const hit = this.physics.raycast(this.player, dir, 5);
        if (hit && hit.face) {
            const nx = hit.x + hit.face.x;
            const ny = hit.y + hit.face.y;
            const nz = hit.z + hit.face.z;

            // Check player collision
            const pBox = { x: this.player.x, y: this.player.y, z: this.player.z, width: this.player.width, height: this.player.height };
            // Simple check if point is inside player box
            // A better check would be AABB vs AABB (block vs player)
            if (this.physics.checkCollision({x: nx + 0.5, y: ny, z: nz + 0.5, width: 1, height: 1}) &&
                Math.abs(nx + 0.5 - this.player.x) < 0.8 && // approximate check
                Math.abs(nz + 0.5 - this.player.z) < 0.8 &&
                (ny >= this.player.y && ny < this.player.y + this.player.height)) {
                return; // Inside player
            }

            const slot = this.player.inventory[this.player.selectedSlot];
            if (slot && slot.count > 0) {
                 // Check if it's an item/tool, not a block
                 const blockDef = BLOCKS[slot.type];
                 if (blockDef && blockDef.isItem) return;

                 this.world.setBlock(nx, ny, nz, slot.type);
                 window.soundManager.play('place');
                 this.network.sendBlockUpdate(nx, ny, nz, slot.type);
            }
        }
    }

    toggleInventory() {
        const inv = document.getElementById('inventory-screen');
        inv.classList.toggle('hidden');
        if (inv.classList.contains('hidden')) {
            if (!this.isMobile) this.canvas.requestPointerLock();
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
        if (!this.isMobile) this.canvas.requestPointerLock();
    }

    updateHotbarUI() {
        document.querySelectorAll('.hotbar-slot').forEach((slot, i) => {
            slot.classList.toggle('active', i === this.player.selectedSlot);
        });
    }

    update(dt) {
        this.player.update(dt / 1000);
        this.mobs.forEach(mob => mob.update(dt / 1000));

        this.gameTime += dt;
        const cycle = (this.gameTime % this.dayLength) / this.dayLength;
        const isDay = cycle < 0.5;
        this.sunBrightness = isDay ? 0.8 + Math.sin(cycle * Math.PI) * 0.2 : 0.3;

        // Chunk Loading
        if (this.frameCount % 60 === 0) { // Check every second
            this.updateChunks();
        }

        // Multiplayer Sync
        if (this.frameCount % 3 === 0) { // Send every 3 frames (~20fps)
            this.network.sendPosition(this.player.x, this.player.y, this.player.z, this.player.yaw, this.player.pitch);
        }
    }

    render() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;

        // Sky
        const brightness = this.sunBrightness;
        const skyR = Math.floor(135 * brightness);
        const skyG = Math.floor(206 * brightness);
        const skyB = Math.floor(235 * brightness);
        ctx.fillStyle = `rgb(${skyR},${skyG},${skyB})`;
        ctx.fillRect(0, 0, w, h);

        // Render Blocks
        // Chunk-based rendering + Frustum/Distance Culling

        const blocksToDraw = [];
        const px = this.player.x;
        const py = this.player.y + this.player.height - 0.2; // Camera Y
        const pz = this.player.z;
        const yaw = this.player.yaw;
        const pitch = this.player.pitch;

        const sinY = Math.sin(-yaw);
        const cosY = Math.cos(-yaw);
        const sinP = Math.sin(-pitch);
        const cosP = Math.cos(-pitch);

        const renderDist = 50; // View distance in blocks

        // We should iterate chunks, but for now let's iterate blocks in loaded chunks nearby
        // Optimization: Only iterate chunks within renderDist

        const centerCX = Math.floor(px / 16);
        const centerCZ = Math.floor(pz / 16);
        const chunkRad = Math.ceil(renderDist / 16);

        for (let cx = centerCX - chunkRad; cx <= centerCX + chunkRad; cx++) {
            for (let cz = centerCZ - chunkRad; cz <= centerCZ + chunkRad; cz++) {
                const chunk = this.world.getChunk(cx, cz);
                if (!chunk) continue;

                // Ensure chunk cache is built
                if (chunk.modified) {
                    chunk.updateVisibleBlocks();
                }

                // Iterate cached visible blocks
                for (let i = 0; i < chunk.visibleBlocks.length; i++) {
                    const b = chunk.visibleBlocks[i];

                    const wx = cx * 16 + b.x;
                    const wy = b.y;
                    const wz = cz * 16 + b.z;

                    const dx = wx - px;
                    const dy = wy - py;
                    const dz = wz - pz;

                    // Simple distance check before sqrt
                    if (Math.abs(dx) > renderDist || Math.abs(dz) > renderDist) continue;

                    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    if (dist > renderDist) continue;

                    // Rotation
                    const rx = dx * cosY - dz * sinY;
                    const rz = dx * sinY + dz * cosY;
                    const ry = dy * cosP - rz * sinP;
                    const rz2 = dy * sinP + rz * cosP; // Depth

                    if (rz2 > 0.1) {
                        blocksToDraw.push({
                            type: b.type,
                            rx, ry: ry, rz: rz2,
                            dist
                        });
                    }
                }
            }
        }

        // Sort
        blocksToDraw.sort((a, b) => b.dist - a.dist);

        // Draw
        blocksToDraw.forEach(b => {
             const scale = (h / 2) / Math.tan(this.fov * Math.PI / 360);
             const size = scale / b.rz;
             const sx = (b.rx / b.rz) * scale + w / 2;
             const sy = (b.ry / b.rz) * scale + h / 2;

             if (size > 0.5 && sx > -size && sx < w+size && sy > -size && sy < h+size) {
                 const blockDef = BLOCKS[b.type];
                 if (!blockDef) return;

                 const light = Math.min(1, (brightness * 0.7) + 0.3 / (1 + b.dist * 0.05));

                 ctx.fillStyle = this.adjustColor(blockDef.top, light * 1.1);
                 ctx.fillRect(sx - size/2, sy - size, size, size/2);

                 ctx.fillStyle = this.adjustColor(blockDef.color, light * 0.8);
                 ctx.fillRect(sx - size/2, sy - size/2, size, size);

                 ctx.fillStyle = this.adjustColor(blockDef.color, light * 0.6);
                 // Side face
                 ctx.beginPath();
                 ctx.moveTo(sx + size/2, sy - size/2);
                 ctx.lineTo(sx + size, sy - size*0.75);
                 ctx.lineTo(sx + size, sy - size*0.25);
                 ctx.lineTo(sx + size/2, sy + size/2);
                 ctx.fill();
             }
        });

        // Draw Mobs (simple billboards)
        this.mobs.forEach(mob => {
             const dx = mob.x - px;
             const dy = mob.y - py;
             const dz = mob.z - pz;

             const rx = dx * cosY - dz * sinY;
             const rz = dx * sinY + dz * cosY;
             const ry = dy * cosP - rz * sinP;
             const rz2 = dy * sinP + rz * cosP;

             if (rz2 > 0.1) {
                 const scale = (h / 2) / Math.tan(this.fov * Math.PI / 360);
                 const size = (scale / rz2) * mob.height;
                 const sx = (rx / rz2) * scale + w / 2;
                 const sy = (ry / rz2) * scale + h / 2;

                 ctx.fillStyle = mob.color;
                 ctx.fillRect(sx - size/4, sy - size, size/2, size);
             }
        });

        // Draw Other Players
        if (this.network && this.network.otherPlayers) {
            this.network.otherPlayers.forEach(p => {
                 const dx = p.x - px;
                 const dy = p.y - py;
                 const dz = p.z - pz;

                 const rx = dx * cosY - dz * sinY;
                 const rz = dx * sinY + dz * cosY;
                 const ry = dy * cosP - rz * sinP;
                 const rz2 = dy * sinP + rz * cosP;

                 if (rz2 > 0.1) {
                     const scale = (h / 2) / Math.tan(this.fov * Math.PI / 360);
                     const size = (scale / rz2) * 1.8; // Player height
                     const sx = (rx / rz2) * scale + w / 2;
                     const sy = (ry / rz2) * scale + h / 2;

                     ctx.fillStyle = 'blue';
                     ctx.fillRect(sx - size/4, sy - size, size/2, size);

                     // Name tag?
                     ctx.fillStyle = 'white';
                     ctx.font = '10px Arial';
                     ctx.fillText('Player', sx - 10, sy - size - 5);
                 }
            });
        }

        // HUD Updates
        document.getElementById('fps').textContent = this.fps;
        document.getElementById('position').textContent = `${Math.floor(px)}, ${Math.floor(py)}, ${Math.floor(pz)}`;
        document.getElementById('block-count').textContent = blocksToDraw.length;
        document.getElementById('game-time').textContent = isDay ? 'Day' : 'Night';
    }

    adjustColor(color, brightness) {
        if (typeof color === 'string' && color[0] === '#') {
            let hex = color.slice(1);
            if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
            if (hex.length === 6) {
                const r = parseInt(hex.slice(0,2), 16);
                const g = parseInt(hex.slice(2,4), 16);
                const b = parseInt(hex.slice(4,6), 16);
                const rr = Math.max(0, Math.min(255, Math.floor(r*brightness)));
                const gg = Math.max(0, Math.min(255, Math.floor(g*brightness)));
                const bb = Math.max(0, Math.min(255, Math.floor(b*brightness)));
                return `rgb(${rr},${gg},${bb})`;
            }
        }
        return color;
    }

    gameLoop() {
        const now = Date.now();
        const dt = now - this.lastTime;
        this.lastTime = now;

        if (now - this.fpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTime = now;
        }
        this.frameCount++;

        this.update(dt);
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialization
let game = null;
window.onload = () => {
    // UI Logic
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('menu-screen').classList.remove('hidden');
    }, 1000);

    document.getElementById('start-game').addEventListener('click', () => {
        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        if (!game) {
            game = new Game();
            game.init();
        }
    });

    document.getElementById('resume-game').addEventListener('click', () => game.resumeGame());
    document.getElementById('return-menu').addEventListener('click', () => {
         // Reload page to reset for now
         location.reload();
    });
    document.getElementById('close-inventory').addEventListener('click', () => {
         game.toggleInventory();
    });
};
