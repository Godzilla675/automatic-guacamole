// Minecraft Clone Game Engine - Canvas 2D Version
// Simplified voxel world using 2D canvas for 3D projection

class VoxelWorld {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.world = new Map();
        this.blockTypes = this.initBlockTypes();
        this.chunkSize = 16;
        this.renderDistance = 4;
        this.worldHeight = 32;
        
        this.player = {
            x: 8, y: 25, z: 8,
            vx: 0, vy: 0, vz: 0,
            pitch: 0, yaw: 0,
            onGround: false,
            flying: false,
            speed: 0.15,
            jumpForce: 0.35,
            gravity: -0.03,
            height: 1.8,
            width: 0.6
        };
        
        this.controls = {
            forward: false, backward: false,
            left: false, right: false,
            jump: false, sneak: false
        };
        
        this.mouse = { locked: false, x: 0, y: 0 };
        this.selectedBlock = 0;
        this.lastTime = Date.now();
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTime = Date.now();
        this.gameTime = 0;
        this.dayLength = 120000;
        this.isMobile = this.detectMobile();
        this.joystick = { active: false, x: 0, y: 0 };
        this.lookTouch = { active: false, startX: 0, startY: 0 };
        
        // Projection settings
        this.fov = 60;
        this.nearPlane = 0.1;
        this.farPlane = 100;
    }

    initBlockTypes() {
        return {
            0: { name: 'dirt', color: '#8B4513', top: '#A0522D', solid: true },
            1: { name: 'stone', color: '#808080', top: '#909090', solid: true },
            2: { name: 'grass', color: '#228B22', top: '#32CD32', solid: true },
            3: { name: 'wood', color: '#8B7355', top: '#654321', solid: true },
            4: { name: 'leaves', color: '#90EE90', top: '#98FB98', solid: true, transparent: true },
            5: { name: 'sand', color: '#F4A460', top: '#FFE4B5', solid: true },
            6: { name: 'water', color: '#4169E1', top: '#6495ED', solid: false, transparent: true },
            7: { name: 'glass', color: '#ADD8E6', top: '#B0E0E6', solid: true, transparent: true }
        };
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth < 768);
    }

    async init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Generate initial world
        await this.generateWorld();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Show mobile controls if on mobile
        if (this.isMobile) {
            document.getElementById('mobile-controls').classList.remove('hidden');
            this.setupMobileControls();
        }
        
        // Start game loop
        this.gameLoop();
    }

    generateWorld() {
        return new Promise((resolve) => {
            const centerChunkX = Math.floor(this.player.x / this.chunkSize);
            const centerChunkZ = Math.floor(this.player.z / this.chunkSize);

            for (let cx = centerChunkX - this.renderDistance; cx <= centerChunkX + this.renderDistance; cx++) {
                for (let cz = centerChunkZ - this.renderDistance; cz <= centerChunkZ + this.renderDistance; cz++) {
                    this.generateChunk(cx, cz);
                }
            }

            // Generate some trees
            for (let i = 0; i < 15; i++) {
                const x = Math.floor(Math.random() * this.chunkSize * 6) - this.chunkSize * 3;
                const z = Math.floor(Math.random() * this.chunkSize * 6) - this.chunkSize * 3;
                const y = this.getHeightAt(x, z);
                if (y > 0 && y < 30) {
                    this.generateTree(x, y, z);
                }
            }

            resolve();
        });
    }

    generateChunk(chunkX, chunkZ) {
        const baseX = chunkX * this.chunkSize;
        const baseZ = chunkZ * this.chunkSize;

        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                const worldX = baseX + x;
                const worldZ = baseZ + z;
                const height = this.getHeightAt(worldX, worldZ);

                // Bedrock
                this.setBlock(worldX, 0, worldZ, 1);

                // Stone layers
                for (let y = 1; y < height - 3; y++) {
                    this.setBlock(worldX, y, worldZ, 1);
                }

                // Dirt layers
                for (let y = Math.max(1, height - 3); y < height; y++) {
                    this.setBlock(worldX, y, worldZ, 0);
                }

                // Top layer
                if (height < 18) {
                    this.setBlock(worldX, height, worldZ, 5); // Sand
                } else {
                    this.setBlock(worldX, height, worldZ, 2); // Grass
                }

                // Water
                if (height < 16) {
                    for (let y = height + 1; y <= 16; y++) {
                        this.setBlock(worldX, y, worldZ, 6);
                    }
                }
            }
        }
    }

    getHeightAt(x, z) {
        const scale = 0.08;
        const noise = Math.sin(x * scale) * Math.cos(z * scale) * 4 +
                     Math.sin(x * scale * 2) * Math.cos(z * scale * 2) * 2;
        return Math.floor(18 + noise);
    }

    generateTree(x, y, z) {
        for (let ty = 0; ty < 4; ty++) {
            this.setBlock(x, y + ty + 1, z, 3);
        }

        for (let lx = -2; lx <= 2; lx++) {
            for (let lz = -2; lz <= 2; lz++) {
                for (let ly = 3; ly <= 5; ly++) {
                    if (Math.abs(lx) + Math.abs(lz) + (ly - 3) < 5) {
                        if (!(lx === 0 && lz === 0 && ly < 5)) {
                            this.setBlock(x + lx, y + ly + 1, z + lz, 4);
                        }
                    }
                }
            }
        }
    }

    setBlock(x, y, z, type) {
        const key = `${x},${y},${z}`;
        
        if (type === null) {
            this.world.delete(key);
            return;
        }

        this.world.set(key, { x, y, z, type });
    }

    getBlock(x, y, z) {
        const key = `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
        const block = this.world.get(key);
        return block ? block.type : null;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'KeyW': this.controls.forward = true; break;
                case 'KeyS': this.controls.backward = true; break;
                case 'KeyA': this.controls.left = true; break;
                case 'KeyD': this.controls.right = true; break;
                case 'Space': 
                    this.controls.jump = true;
                    e.preventDefault();
                    break;
                case 'ShiftLeft': this.controls.sneak = true; break;
                case 'KeyF': this.player.flying = !this.player.flying; break;
                case 'KeyE': this.toggleInventory(); break;
                case 'Digit1': this.selectBlock(0); break;
                case 'Digit2': this.selectBlock(1); break;
                case 'Digit3': this.selectBlock(2); break;
                case 'Digit4': this.selectBlock(3); break;
                case 'Digit5': this.selectBlock(4); break;
                case 'Escape': this.pauseGame(); break;
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

        this.canvas.addEventListener('click', () => {
            if (!this.isMobile) {
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
                else if (e.button === 2) {
                    this.placeBlock();
                    e.preventDefault();
                }
            }
        });

        document.addEventListener('contextmenu', (e) => e.preventDefault());

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });

        document.querySelectorAll('.hotbar-slot').forEach((slot, index) => {
            slot.addEventListener('click', () => this.selectBlock(index));
        });
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

        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                if (touch.clientX > window.innerWidth / 2) {
                    this.lookTouch.active = true;
                    this.lookTouch.startX = touch.clientX;
                    this.lookTouch.startY = touch.clientY;
                }
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (this.lookTouch.active && e.touches.length === 1) {
                e.preventDefault();
                const touch = e.touches[0];
                const dx = touch.clientX - this.lookTouch.startX;
                const dy = touch.clientY - this.lookTouch.startY;

                this.player.yaw -= dx * 0.005;
                this.player.pitch -= dy * 0.005;
                this.player.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.pitch));

                this.lookTouch.startX = touch.clientX;
                this.lookTouch.startY = touch.clientY;
            }
        });

        this.canvas.addEventListener('touchend', () => {
            this.lookTouch.active = false;
        });

        document.getElementById('jump-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.controls.jump = true;
        });

        document.getElementById('jump-btn').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.controls.jump = false;
        });

        document.getElementById('break-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.breakBlock();
        });

        document.getElementById('place-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.placeBlock();
        });

        document.getElementById('fly-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.player.flying = !this.player.flying;
        });
    }

    selectBlock(index) {
        this.selectedBlock = index;
        document.querySelectorAll('.hotbar-slot').forEach((slot, i) => {
            slot.classList.toggle('active', i === index);
        });
    }

    breakBlock() {
        const target = this.raycast();
        if (target) {
            this.setBlock(target.x, target.y, target.z, null);
        }
    }

    placeBlock() {
        const target = this.raycast();
        if (target && target.face) {
            const newX = target.x + target.face.x;
            const newY = target.y + target.face.y;
            const newZ = target.z + target.face.z;

            const px = this.player.x, py = this.player.y, pz = this.player.z;
            const inPlayer = Math.abs(newX - px) < 0.6 && 
                           newY >= py && newY < py + this.player.height &&
                           Math.abs(newZ - pz) < 0.6;

            if (!inPlayer) {
                this.setBlock(newX, newY, newZ, this.selectedBlock);
            }
        }
    }

    raycast() {
        const maxDist = 5;
        const step = 0.1;
        const dirX = Math.sin(this.player.yaw) * Math.cos(this.player.pitch);
        const dirY = -Math.sin(this.player.pitch);
        const dirZ = Math.cos(this.player.yaw) * Math.cos(this.player.pitch);

        for (let dist = 0; dist < maxDist; dist += step) {
            const x = Math.floor(this.player.x + dirX * dist);
            const y = Math.floor(this.player.y + this.player.height - 0.2 + dirY * dist);
            const z = Math.floor(this.player.z + dirZ * dist);

            const blockType = this.getBlock(x, y, z);
            if (blockType !== null && this.blockTypes[blockType].solid) {
                const faces = [
                    {x: 1, y: 0, z: 0}, {x: -1, y: 0, z: 0},
                    {x: 0, y: 1, z: 0}, {x: 0, y: -1, z: 0},
                    {x: 0, y: 0, z: 1}, {x: 0, y: 0, z: -1}
                ];
                const fx = (this.player.x + dirX * dist) - x;
                const fy = (this.player.y + this.player.height - 0.2 + dirY * dist) - y;
                const fz = (this.player.z + dirZ * dist) - z;
                
                let bestFace = faces[0];
                let minDist = 999;
                faces.forEach(face => {
                    const d = Math.abs((fx - 0.5) - face.x * 0.5) + 
                             Math.abs((fy - 0.5) - face.y * 0.5) + 
                             Math.abs((fz - 0.5) - face.z * 0.5);
                    if (d < minDist) {
                        minDist = d;
                        bestFace = face;
                    }
                });

                return { x, y, z, type: blockType, face: bestFace };
            }
        }
        return null;
    }

    toggleInventory() {
        const inventory = document.getElementById('inventory-screen');
        inventory.classList.toggle('hidden');
        
        if (!inventory.classList.contains('hidden')) {
            if (document.pointerLockElement) {
                document.exitPointerLock();
            }
        }
    }

    pauseGame() {
        document.getElementById('pause-screen').classList.remove('hidden');
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    updatePhysics(deltaTime) {
        const moveSpeed = this.player.speed;
        const forward = {
            x: Math.sin(this.player.yaw),
            z: Math.cos(this.player.yaw)
        };
        const right = {
            x: Math.cos(this.player.yaw),
            z: -Math.sin(this.player.yaw)
        };

        if (this.controls.forward) {
            this.player.vx += forward.x * moveSpeed;
            this.player.vz += forward.z * moveSpeed;
        }
        if (this.controls.backward) {
            this.player.vx -= forward.x * moveSpeed;
            this.player.vz -= forward.z * moveSpeed;
        }
        if (this.controls.left) {
            this.player.vx -= right.x * moveSpeed;
            this.player.vz -= right.z * moveSpeed;
        }
        if (this.controls.right) {
            this.player.vx += right.x * moveSpeed;
            this.player.vz += right.z * moveSpeed;
        }

        if (this.player.flying) {
            this.player.vy *= 0.8;
            if (this.controls.jump) this.player.vy = moveSpeed * 2;
            if (this.controls.sneak) this.player.vy = -moveSpeed * 2;
        } else {
            this.player.vy += this.player.gravity;
            if (this.controls.jump && this.player.onGround) {
                this.player.vy = this.player.jumpForce;
                this.player.onGround = false;
            }
        }

        this.player.vx *= 0.8;
        this.player.vz *= 0.8;

        // Collision detection
        const checkCollision = (x, y, z) => {
            for (let dy = 0; dy < this.player.height; dy += 0.5) {
                const blockType = this.getBlock(x, y + dy, z);
                if (blockType !== null && this.blockTypes[blockType].solid) {
                    return true;
                }
            }
            return false;
        };

        const newX = this.player.x + this.player.vx;
        if (!checkCollision(newX, this.player.y, this.player.z)) {
            this.player.x = newX;
        } else {
            this.player.vx = 0;
        }

        const newZ = this.player.z + this.player.vz;
        if (!checkCollision(this.player.x, this.player.y, newZ)) {
            this.player.z = newZ;
        } else {
            this.player.vz = 0;
        }

        this.player.onGround = false;
        const newY = this.player.y + this.player.vy;
        
        if (this.player.vy < 0) {
            if (checkCollision(this.player.x, newY, this.player.z)) {
                this.player.vy = 0;
                this.player.onGround = true;
                this.player.y = Math.floor(newY) + 1;
            } else {
                this.player.y = newY;
            }
        } else {
            if (checkCollision(this.player.x, newY, this.player.z)) {
                this.player.vy = 0;
            } else {
                this.player.y = newY;
            }
        }

        if (this.player.y < 0) {
            this.player.y = 25;
            this.player.vy = 0;
        }
    }

    updateDayNightCycle() {
        this.gameTime += 16;
        const cycle = (this.gameTime % this.dayLength) / this.dayLength;
        const isDay = cycle < 0.5;
        document.getElementById('game-time').textContent = isDay ? 'Day' : 'Night';
        this.sunBrightness = isDay ? 0.8 + Math.sin(cycle * Math.PI) * 0.2 : 0.3;
    }

    updateHUD() {
        this.frameCount++;
        const now = Date.now();
        if (now - this.fpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTime = now;
            document.getElementById('fps').textContent = this.fps;
        }

        document.getElementById('position').textContent = 
            `${Math.floor(this.player.x)}, ${Math.floor(this.player.y)}, ${Math.floor(this.player.z)}`;

        document.getElementById('block-count').textContent = this.world.size;
    }

    render() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Sky
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, h);
        const brightness = this.sunBrightness || 0.8;
        const skyR = Math.floor(135 * brightness);
        const skyG = Math.floor(206 * brightness);
        const skyB = Math.floor(235 * brightness);
        skyGradient.addColorStop(0, `rgb(${skyR}, ${skyG}, ${skyB})`);
        skyGradient.addColorStop(1, `rgb(${Math.floor(skyR * 0.7)}, ${Math.floor(skyG * 0.7)}, ${Math.floor(skyB * 0.7)})`);
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, w, h);

        // Collect visible blocks
        const blocks = [];
        const viewDist = 50;
        
        this.world.forEach((block) => {
            const dx = block.x - this.player.x;
            const dy = block.y - (this.player.y + this.player.height - 0.2);
            const dz = block.z - this.player.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < viewDist) {
                // Rotate around player
                const sinY = Math.sin(-this.player.yaw);
                const cosY = Math.cos(-this.player.yaw);
                const rx = dx * cosY - dz * sinY;
                const rz = dx * sinY + dz * cosY;
                
                // Pitch rotation
                const sinP = Math.sin(-this.player.pitch);
                const cosP = Math.cos(-this.player.pitch);
                const ry = dy * cosP - rz * sinP;
                const rz2 = dy * sinP + rz * cosP;
                
                if (rz2 > 0.1) {
                    blocks.push({
                        ...block,
                        rx, ry, rz: rz2,
                        dist
                    });
                }
            }
        });

        // Sort by distance (far to near)
        blocks.sort((a, b) => b.dist - a.dist);

        // Draw blocks
        blocks.forEach(block => {
            const scale = (h / 2) / Math.tan(this.fov * Math.PI / 360);
            const sx = (block.rx / block.rz) * scale + w / 2;
            const sy = (block.ry / block.rz) * scale + h / 2;
            const size = scale / block.rz;

            if (size > 0.5 && sx > -size && sx < w + size && sy > -size && sy < h + size) {
                const blockType = this.blockTypes[block.type];
                
                // Calculate lighting
                const lightLevel = Math.min(1, (brightness * 0.7) + 0.3 / (1 + block.dist * 0.05));
                
                // Draw top face
                this.ctx.fillStyle = this.adjustColor(blockType.top, lightLevel * 1.1);
                this.ctx.fillRect(sx - size / 2, sy - size, size, size / 2);
                
                // Draw front face
                this.ctx.fillStyle = this.adjustColor(blockType.color, lightLevel * 0.8);
                this.ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
                
                // Draw side face
                this.ctx.fillStyle = this.adjustColor(blockType.color, lightLevel * 0.6);
                this.ctx.beginPath();
                this.ctx.moveTo(sx + size / 2, sy - size / 2);
                this.ctx.lineTo(sx + size, sy - size * 0.75);
                this.ctx.lineTo(sx + size, sy - size * 0.25);
                this.ctx.lineTo(sx + size / 2, sy + size / 2);
                this.ctx.closePath();
                this.ctx.fill();
                
                // Outline for transparent blocks
                if (blockType.transparent) {
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(sx - size / 2, sy - size / 2, size, size);
                }
            }
        });
    }

    adjustColor(hexColor, brightness) {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        return `rgb(${Math.floor(r * brightness)}, ${Math.floor(g * brightness)}, ${Math.floor(b * brightness)})`;
    }

    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());

        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.updatePhysics(deltaTime);
        this.updateDayNightCycle();
        this.updateHUD();
        this.render();
    }
}

// Game initialization and menu system
let game = null;

window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('menu-screen').classList.remove('hidden');
    }, 1500);
});

document.getElementById('start-game').addEventListener('click', async () => {
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    
    if (!game) {
        game = new VoxelWorld();
        await game.init();
    }
});

document.getElementById('show-controls').addEventListener('click', () => {
    document.getElementById('controls-info').classList.toggle('hidden');
});

document.getElementById('pause-btn').addEventListener('click', () => {
    document.getElementById('pause-screen').classList.remove('hidden');
    if (document.pointerLockElement) {
        document.exitPointerLock();
    }
});

document.getElementById('resume-game').addEventListener('click', () => {
    document.getElementById('pause-screen').classList.add('hidden');
});

document.getElementById('return-menu').addEventListener('click', () => {
    document.getElementById('pause-screen').classList.add('hidden');
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('menu-screen').classList.remove('hidden');
    if (document.pointerLockElement) {
        document.exitPointerLock();
    }
});

document.getElementById('close-inventory').addEventListener('click', () => {
    document.getElementById('inventory-screen').classList.add('hidden');
});

document.querySelectorAll('.inventory-item').forEach((item) => {
    item.addEventListener('click', () => {
        const type = item.dataset.type;
        const typeMap = {
            'dirt': 0, 'stone': 1, 'grass': 2, 'wood': 3,
            'leaves': 4, 'sand': 5, 'water': 6, 'glass': 7
        };
        if (typeMap[type] !== undefined && game) {
            game.selectBlock(typeMap[type]);
            document.getElementById('inventory-screen').classList.add('hidden');
        }
    });
});
