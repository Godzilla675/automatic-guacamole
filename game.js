// Minecraft Clone Game Engine - Canvas 2D Version
// Simplified voxel world using 2D canvas for 3D projection

class VoxelWorld {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.chunks = new Map();
        this.blockCount = 0;
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
        const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        const hasTouchSupport =
            ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0) ||
            ('msMaxTouchPoints' in navigator && navigator.msMaxTouchPoints > 0) ||
            (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

        const isSmallScreen =
            (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) ||
            (window.innerWidth < 768);

        // Consider a device mobile if it has mobile UA and either touch or small screen,
        // or if it has both touch support and a small screen (e.g., tablets).
        return (isMobileUserAgent && (hasTouchSupport || isSmallScreen)) ||
               (hasTouchSupport && isSmallScreen);
    }

    async init() {
        // Set up canvas with device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        
        if (this.ctx && this.ctx.setTransform) {
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        
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

            // Generate some trees (only above water level)
            for (let i = 0; i < 15; i++) {
                const x = Math.floor(Math.random() * this.chunkSize * 6) - this.chunkSize * 3;
                const z = Math.floor(Math.random() * this.chunkSize * 6) - this.chunkSize * 3;
                const y = this.getHeightAt(x, z);
                // Only place trees above water level (water level is at y = 16) and below height limit
                if (y >= 16 && y < 30) {
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
        const cx = Math.floor(x / this.chunkSize);
        const cz = Math.floor(z / this.chunkSize);
        const chunkKey = `${cx},${cz}`;
        const blockKey = `${x},${y},${z}`;
        
        if (type === null) {
            if (this.chunks.has(chunkKey)) {
                const chunk = this.chunks.get(chunkKey);
                if (chunk.has(blockKey)) {
                    chunk.delete(blockKey);
                    this.blockCount--;
                    if (chunk.size === 0) {
                        this.chunks.delete(chunkKey);
                    }
                }
            }
            return;
        }

        // Add world size limits to prevent excessive memory usage
        // Limit world to reasonable bounds around spawn
        const maxDistance = 500;
        if (Math.abs(x) > maxDistance || Math.abs(z) > maxDistance || y < 0 || y > this.worldHeight * 2) {
            console.warn('Block placement outside world bounds:', x, y, z);
            return;
        }

        // Memory Management: Remove distant chunks if limit reached
        const maxBlocks = 500000;
        if (this.blockCount >= maxBlocks) {
            // Find chunk furthest from player
            const pcx = Math.floor(this.player.x / this.chunkSize);
            const pcz = Math.floor(this.player.z / this.chunkSize);

            let furthestKey = null;
            let maxDistSq = -1;

            for (const key of this.chunks.keys()) {
                const [kcx, kcz] = key.split(',').map(Number);
                const dx = kcx - pcx;
                const dz = kcz - pcz;
                const distSq = dx * dx + dz * dz;

                if (distSq > maxDistSq) {
                    maxDistSq = distSq;
                    furthestKey = key;
                }
            }

            if (furthestKey) {
                const removedChunk = this.chunks.get(furthestKey);
                this.blockCount -= removedChunk.size;
                this.chunks.delete(furthestKey);
            }
        }

        if (!this.chunks.has(chunkKey)) {
            this.chunks.set(chunkKey, new Map());
        }

        const chunk = this.chunks.get(chunkKey);
        if (!chunk.has(blockKey)) {
            this.blockCount++;
        }
        chunk.set(blockKey, { x, y, z, type });
    }

    getBlock(x, y, z) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const iz = Math.floor(z);

        const cx = Math.floor(ix / this.chunkSize);
        const cz = Math.floor(iz / this.chunkSize);
        const chunkKey = `${cx},${cz}`;

        if (this.chunks.has(chunkKey)) {
            const chunk = this.chunks.get(chunkKey);
            const blockKey = `${ix},${iy},${iz}`;
            const block = chunk.get(blockKey);
            return block ? block.type : null;
        }
        return null;
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
            const dpr = window.devicePixelRatio || 1;
            const width = window.innerWidth;
            const height = window.innerHeight;

            // Set the display size in CSS pixels
            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';

            // Set the internal canvas resolution in device pixels
            this.canvas.width = width * dpr;
            this.canvas.height = height * dpr;

            // Scale the drawing context so game logic can continue using CSS pixels
            if (this.ctx && this.ctx.setTransform) {
                this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
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

        // Jump button - both touch and keyboard support
        const jumpBtn = document.getElementById('jump-btn');
        jumpBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.controls.jump = true;
        });
        jumpBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.controls.jump = false;
        });
        jumpBtn.addEventListener('click', () => {
            this.controls.jump = true;
            setTimeout(() => { this.controls.jump = false; }, 100);
        });

        // Break button - both touch and keyboard support
        const breakBtn = document.getElementById('break-btn');
        breakBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.breakBlock();
        });
        breakBtn.addEventListener('click', () => {
            this.breakBlock();
        });

        // Place button - both touch and keyboard support
        const placeBtn = document.getElementById('place-btn');
        placeBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.placeBlock();
        });
        placeBtn.addEventListener('click', () => {
            this.placeBlock();
        });

        // Fly button - both touch and keyboard support
        const flyBtn = document.getElementById('fly-btn');
        flyBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.player.flying = !this.player.flying;
        });
        flyBtn.addEventListener('click', () => {
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

            // Improved bounding box check for block placement
            const px = this.player.x, py = this.player.y, pz = this.player.z;
            const blockCenterX = newX + 0.5;
            const blockCenterZ = newZ + 0.5;
            const dx = blockCenterX - px;
            const dz = blockCenterZ - pz;
            const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
            const radius = this.player.width / 2;
            const horizontallyInside = horizontalDistance < radius;
            const verticallyInside = newY >= py && newY <= py + this.player.height;
            const inPlayer = horizontallyInside && verticallyInside;

            if (!inPlayer) {
                this.setBlock(newX, newY, newZ, this.selectedBlock);
            }
        }
    }

    raycast() {
        const maxDist = 5;

        // Improved Raycast using DDA (Digital Differential Analyzer) algorithm
        const startX = this.player.x;
        const startY = this.player.y + this.player.height - 0.2;
        const startZ = this.player.z;

        const dirX = Math.sin(this.player.yaw) * Math.cos(this.player.pitch);
        const dirY = -Math.sin(this.player.pitch);
        const dirZ = Math.cos(this.player.yaw) * Math.cos(this.player.pitch);

        let x = Math.floor(startX);
        let y = Math.floor(startY);
        let z = Math.floor(startZ);

        const stepX = Math.sign(dirX);
        const stepY = Math.sign(dirY);
        const stepZ = Math.sign(dirZ);

        const tDeltaX = dirX !== 0 ? Math.abs(1 / dirX) : Infinity;
        const tDeltaY = dirY !== 0 ? Math.abs(1 / dirY) : Infinity;
        const tDeltaZ = dirZ !== 0 ? Math.abs(1 / dirZ) : Infinity;

        let tMaxX = dirX !== 0 ? (stepX > 0 ? (x + 1 - startX) : (startX - x)) * tDeltaX : Infinity;
        let tMaxY = dirY !== 0 ? (stepY > 0 ? (y + 1 - startY) : (startY - y)) * tDeltaY : Infinity;
        let tMaxZ = dirZ !== 0 ? (stepZ > 0 ? (z + 1 - startZ) : (startZ - z)) * tDeltaZ : Infinity;

        let face = null;

        // Check starting block
        const startBlock = this.getBlock(x, y, z);
        if (startBlock !== null && this.blockTypes[startBlock].solid) {
             return { x, y, z, type: startBlock, face: null };
        }

        while (true) {
            if (tMaxX < tMaxY) {
                if (tMaxX < tMaxZ) {
                    if (tMaxX > maxDist) break;
                    x += stepX;
                    tMaxX += tDeltaX;
                    face = { x: -stepX, y: 0, z: 0 };
                } else {
                    if (tMaxZ > maxDist) break;
                    z += stepZ;
                    tMaxZ += tDeltaZ;
                    face = { x: 0, y: 0, z: -stepZ };
                }
            } else {
                if (tMaxY < tMaxZ) {
                    if (tMaxY > maxDist) break;
                    y += stepY;
                    tMaxY += tDeltaY;
                    face = { x: 0, y: -stepY, z: 0 };
                } else {
                    if (tMaxZ > maxDist) break;
                    z += stepZ;
                    tMaxZ += tDeltaZ;
                    face = { x: 0, y: 0, z: -stepZ };
                }
            }

            const blockType = this.getBlock(x, y, z);
            if (blockType !== null && this.blockTypes[blockType].solid) {
                return { x, y, z, type: blockType, face };
            }
        }

        return null;
    }

    toggleInventory() {
        const inventory = document.getElementById('inventory-screen');
        inventory.classList.toggle('hidden');
        
        if (!inventory.classList.contains('hidden')) {
            // Exiting pointer lock when opening inventory
            if (document.pointerLockElement) {
                document.exitPointerLock();
            }
        } else {
            // Re-request pointer lock when closing inventory on non-mobile devices
            if (!this.isMobile && document.pointerLockElement !== this.canvas) {
                this.canvas.requestPointerLock();
            }
        }
    }

    pauseGame() {
        document.getElementById('pause-screen').classList.remove('hidden');
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    resumeGame() {
        // Re-request pointer lock when resuming on non-mobile devices
        document.getElementById('pause-screen').classList.add('hidden');
        if (!this.isMobile && document.pointerLockElement !== this.canvas) {
            this.canvas.requestPointerLock();
        }
    }

    saveGame() {
        try {
            // Optimized Binary Encoding for World Data
            // Format: Base64 encoded Int32Array
            // Each block is packed into a single 32-bit integer:
            // Bits 0-9:   x + 512 (10 bits, range -512 to 511)
            // Bits 10-19: z + 512 (10 bits, range -512 to 511)
            // Bits 20-26: y (7 bits, range 0 to 127)
            // Bits 27-30: type (4 bits, range 0 to 15)

            // Collect all blocks from all chunks
            const blocks = [];
            this.chunks.forEach(chunk => {
                chunk.forEach(block => {
                    blocks.push(block);
                });
            });

            const buffer = new Int32Array(blocks.length);

            blocks.forEach((b, i) => {
                const x = Math.max(-512, Math.min(511, b.x));
                const z = Math.max(-512, Math.min(511, b.z));
                const y = Math.max(0, Math.min(127, b.y)); // Expanded to 7 bits to support height > 63
                const type = b.type & 0xF; // 4 bits

                buffer[i] = (x + 512) | ((z + 512) << 10) | (y << 20) | (type << 27);
            });

            // Convert buffer to Base64 string
            // We can't use Buffer (Node.js) in browser, so we use a FileReader or simple loop
            // Since it's Int32, let's treat it as bytes.
            const uint8Array = new Uint8Array(buffer.buffer);
            let binary = '';
            // Chunking to avoid stack overflow with String.fromCharCode
            for (let i = 0; i < uint8Array.byteLength; i += 32768) {
                binary += String.fromCharCode.apply(null, uint8Array.subarray(i, i + 32768));
            }
            const base64World = btoa(binary);

            const saveData = {
                worldData: base64World,
                player: this.player,
                gameTime: this.gameTime,
                version: 2
            };

            const jsonString = JSON.stringify(saveData);

            if (jsonString.length > 4500000) {
                 console.warn('Save file is very large:', (jsonString.length / 1024 / 1024).toFixed(2), 'MB');
            }

            localStorage.setItem('voxel-world-save', jsonString);
            alert('Game Saved Successfully!');
        } catch (e) {
            console.error('Failed to save game:', e);
            if (e.name === 'QuotaExceededError' || e.message.includes('quota')) {
                 alert('Failed to save game. Storage is full. Try exploring less before saving.');
            } else {
                 alert('Failed to save game: ' + e.message);
            }
        }
    }

    loadGame() {
        try {
            const saveString = localStorage.getItem('voxel-world-save');
            if (!saveString) {
                alert('No saved game found!');
                return;
            }

            const saveData = JSON.parse(saveString);
            this.world = new Map();

            // Handle different versions
            if (saveData.version === 2 && saveData.worldData) {
                // Version 2: Base64 encoded Int32Array
                try {
                    const binary = atob(saveData.worldData);
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) {
                        bytes[i] = binary.charCodeAt(i);
                    }
                    const buffer = new Int32Array(bytes.buffer);

                    for (let i = 0; i < buffer.length; i++) {
                        const val = buffer[i];
                        const x = (val & 0x3FF) - 512;
                        const z = ((val >> 10) & 0x3FF) - 512;
                        const y = (val >> 20) & 0x7F; // 7 bits mask
                        const type = (val >> 27) & 0xF;

                        this.setBlock(x, y, z, type);
                    }
                } catch (err) {
                    console.error('Failed to parse version 2 save data', err);
                    throw new Error('Save data corruption');
                }
            } else if (saveData.world) {
                // Fallback to older versions (Array or Map)
                if (Array.isArray(saveData.world)) {
                    const firstItem = saveData.world[0];
                    if (Array.isArray(firstItem) && typeof firstItem[0] === 'number') {
                        // Compact Array format [x,y,z,type]
                        saveData.world.forEach(b => {
                            const [x, y, z, type] = b;
                            this.setBlock(x, y, z, type);
                        });
                    } else {
                        // Legacy Map entries
                        try {
                            const tempMap = new Map(saveData.world);
                            tempMap.forEach((val) => {
                                 if (val && typeof val.x === 'number') {
                                     this.setBlock(val.x, val.y, val.z, val.type);
                                 }
                            });
                        } catch (err) {
                             // Try direct iteration if it was just array of values (unlikely based on old code)
                             console.error("Failed to parse legacy world format", err);
                        }
                    }
                }
            }

            // Restore player
            this.player = { ...this.player, ...saveData.player };

            // Restore time
            this.gameTime = saveData.gameTime || 0;

            alert('Game Loaded Successfully!');
            this.resumeGame();
        } catch (e) {
            console.error('Failed to load game:', e);
            alert('Failed to load game. Save file might be corrupted.');
        }
    }

    updatePhysics(deltaTime) {
        // Normalize deltaTime to ensure frame-rate independent physics (target: 60 FPS)
        const TARGET_FRAME_TIME_MS = 16.67;
        const dtFactor = deltaTime / TARGET_FRAME_TIME_MS;
        const moveSpeed = this.player.speed * dtFactor;
        const gravity = this.player.gravity * dtFactor;
        
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
            this.player.vy += gravity;
            if (this.controls.jump && this.player.onGround) {
                // Jump force is fixed initial velocity, not scaled by deltaTime
                this.player.vy = this.player.jumpForce;
                this.player.onGround = false;
            }
        }

        this.player.vx *= 0.8;
        this.player.vz *= 0.8;

        // Collision detection with improved step size to prevent clipping
        const checkCollision = (x, y, z) => {
            // Use smaller step size (0.3) to check more positions and prevent head clipping
            for (let dy = 0; dy <= this.player.height; dy += 0.3) {
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
            // Respawn at safe height above terrain
            const safeGroundY = this.getHeightAt(Math.floor(this.player.x), Math.floor(this.player.z));
            this.player.y = safeGroundY + 1;
            this.player.vy = 0;
        }
    }

    updateDayNightCycle(deltaTime) {
        // Use actual deltaTime for consistent cycle duration regardless of frame rate
        this.gameTime += deltaTime;
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

        document.getElementById('block-count').textContent = this.blockCount;
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

        // Collect visible blocks from chunks
        const blocks = [];
        const viewDist = 50;
        // Chunk-based culling
        const pcx = Math.floor(this.player.x / this.chunkSize);
        const pcz = Math.floor(this.player.z / this.chunkSize);
        const renderDistChunks = Math.ceil(viewDist / this.chunkSize) + 1;

        for (let cx = pcx - renderDistChunks; cx <= pcx + renderDistChunks; cx++) {
            for (let cz = pcz - renderDistChunks; cz <= pcz + renderDistChunks; cz++) {
                const chunkKey = `${cx},${cz}`;
                if (this.chunks.has(chunkKey)) {
                     const chunk = this.chunks.get(chunkKey);
                     chunk.forEach(block => {
                         const dx = block.x - this.player.x;
                         const dy = block.y - (this.player.y + this.player.height - 0.2);
                         const dz = block.z - this.player.z;
                         const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                         if (dist < viewDist) {
                            // Rotate around player (yaw rotation)
                            const sinY = Math.sin(-this.player.yaw);
                            const cosY = Math.cos(-this.player.yaw);
                            const rotatedX = dx * cosY - dz * sinY;
                            const rotatedZAfterYaw = dx * sinY + dz * cosY;

                            // Pitch rotation
                            const sinP = Math.sin(-this.player.pitch);
                            const cosP = Math.cos(-this.player.pitch);
                            const rotatedY = dy * cosP - rotatedZAfterYaw * sinP;
                            const rotatedZAfterPitch = dy * sinP + rotatedZAfterYaw * cosP;

                            // Only include blocks in front of camera
                            if (rotatedZAfterPitch > 0.1) {
                                blocks.push({
                                    ...block,
                                    rx: rotatedX,
                                    ry: rotatedY,
                                    rz: rotatedZAfterPitch,
                                    dist
                                });
                            }
                        }
                    });
                }
            }
        }

        // Sort by distance (far to near) for painter's algorithm
        // NOTE: Full array sort on every frame is O(n log n). For better performance,
        // consider using a more efficient sorting algorithm for nearly-sorted data
        // or implement a depth buffer approach to avoid sorting altogether.
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

    adjustColor(color, brightness) {
        // Handle hex colors (#RRGGBB or #RGB)
        if (typeof color === 'string' && color[0] === '#') {
            let hex = color.slice(1);

            // Expand shorthand hex (#RGB -> #RRGGBB)
            if (hex.length === 3) {
                hex = hex.split('').map(ch => ch + ch).join('');
            }

            if (hex.length === 6) {
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);

                if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
                    const rr = Math.max(0, Math.min(255, Math.floor(r * brightness)));
                    const gg = Math.max(0, Math.min(255, Math.floor(g * brightness)));
                    const bb = Math.max(0, Math.min(255, Math.floor(b * brightness)));
                    return `rgb(${rr}, ${gg}, ${bb})`;
                }
            }

            // Fallback: if hex parsing failed, return original color
            return color;
        }

        // Handle rgb(...) / rgba(...)
        if (typeof color === 'string' && color.toLowerCase().startsWith('rgb')) {
            const match = color.match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+)\s*)?\)$/i);
            if (match) {
                let r = parseFloat(match[1]);
                let g = parseFloat(match[2]);
                let b = parseFloat(match[3]);
                const a = match[4] !== undefined ? parseFloat(match[4]) : undefined;

                if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
                    r = Math.max(0, Math.min(255, Math.floor(r * brightness)));
                    g = Math.max(0, Math.min(255, Math.floor(g * brightness)));
                    b = Math.max(0, Math.min(255, Math.floor(b * brightness)));

                    if (a !== undefined && !Number.isNaN(a)) {
                        return `rgba(${r}, ${g}, ${b}, ${a})`;
                    }
                    return `rgb(${r}, ${g}, ${b})`;
                }
            }

            // Fallback: if rgb(a) parsing failed, return original color
            return color;
        }

        // Unsupported format: return original color unchanged
        return color;
    }

    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());

        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.updatePhysics(deltaTime);
        this.updateDayNightCycle(deltaTime);
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
    // Note: resumeGame() now handles hiding the pause screen
    if (game) {
        game.resumeGame();
    }
});

document.getElementById('save-game').addEventListener('click', () => {
    if (game) game.saveGame();
});

document.getElementById('load-game').addEventListener('click', () => {
    if (game) game.loadGame();
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
        
        if (!game) {
            console.warn('Inventory item clicked before game was initialized.');
            return;
        }
        
        if (!(type in typeMap)) {
            console.error('Invalid inventory block type selected:', type);
            alert('This inventory item is not available. Please select another block.');
            return;
        }
        
        game.selectBlock(typeMap[type]);
        document.getElementById('inventory-screen').classList.add('hidden');
    });
});
