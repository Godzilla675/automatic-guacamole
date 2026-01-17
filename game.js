// Minecraft Clone Game Engine
// Full-featured voxel world with terrain generation, physics, and mobile support

class VoxelWorld {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = new Map();
        this.blockTypes = this.initBlockTypes();
        this.chunkSize = 16;
        this.renderDistance = 3;
        this.worldHeight = 64;
        this.player = {
            position: new THREE.Vector3(0, 32, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            onGround: false,
            flying: false,
            speed: 0.1,
            jumpForce: 0.2,
            gravity: -0.02,
            height: 1.8,
            width: 0.6
        };
        this.controls = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            sneak: false
        };
        this.mouse = {
            x: 0,
            y: 0,
            locked: false
        };
        this.selectedBlock = 0;
        this.blockBreakStart = 0;
        this.blockBreakTime = 300;
        this.lastTime = Date.now();
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTime = Date.now();
        this.gameTime = 0;
        this.dayLength = 120000;
        this.isMobile = this.detectMobile();
        this.joystick = { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 };
        this.lookTouch = { active: false, startX: 0, startY: 0 };
    }

    initBlockTypes() {
        return {
            0: { name: 'dirt', color: 0x8B4513, solid: true },
            1: { name: 'stone', color: 0x808080, solid: true },
            2: { name: 'grass', color: 0x228B22, solid: true },
            3: { name: 'wood', color: 0x8B7355, solid: true },
            4: { name: 'leaves', color: 0x90EE90, solid: true, transparent: true },
            5: { name: 'sand', color: 0xF4A460, solid: true },
            6: { name: 'water', color: 0x4169E1, solid: false, transparent: true },
            7: { name: 'glass', color: 0xADD8E6, solid: true, transparent: true }
        };
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth < 768);
    }

    async init() {
        // Initialize Three.js
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 1, this.chunkSize * this.renderDistance * 1.5);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: !this.isMobile
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.sunLight.position.set(50, 100, 50);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.camera.left = -50;
        this.sunLight.shadow.camera.right = 50;
        this.sunLight.shadow.camera.top = 50;
        this.sunLight.shadow.camera.bottom = -50;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);

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
            const centerChunkX = Math.floor(this.player.position.x / this.chunkSize);
            const centerChunkZ = Math.floor(this.player.position.z / this.chunkSize);

            for (let cx = centerChunkX - this.renderDistance; cx <= centerChunkX + this.renderDistance; cx++) {
                for (let cz = centerChunkZ - this.renderDistance; cz <= centerChunkZ + this.renderDistance; cz++) {
                    this.generateChunk(cx, cz);
                }
            }

            // Generate some trees
            for (let i = 0; i < 20; i++) {
                const x = Math.floor(Math.random() * this.chunkSize * this.renderDistance * 2) - this.chunkSize * this.renderDistance;
                const z = Math.floor(Math.random() * this.chunkSize * this.renderDistance * 2) - this.chunkSize * this.renderDistance;
                const y = this.getHeightAt(x, z);
                if (y > 0) {
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

                // Bedrock layer
                this.setBlock(worldX, 0, worldZ, 1);

                // Stone layers
                for (let y = 1; y < height - 3; y++) {
                    this.setBlock(worldX, y, worldZ, 1);
                }

                // Dirt layers
                for (let y = Math.max(1, height - 3); y < height; y++) {
                    this.setBlock(worldX, y, worldZ, 0);
                }

                // Grass top or sand near water
                if (height < 20) {
                    this.setBlock(worldX, height, worldZ, 5); // Sand
                } else {
                    this.setBlock(worldX, height, worldZ, 2); // Grass
                }

                // Water below sea level
                if (height < 18) {
                    for (let y = height + 1; y <= 18; y++) {
                        this.setBlock(worldX, y, worldZ, 6);
                    }
                }
            }
        }
    }

    getHeightAt(x, z) {
        // Simple perlin-like noise simulation
        const scale = 0.05;
        const noise = Math.sin(x * scale) * Math.cos(z * scale) * 5 +
                     Math.sin(x * scale * 2) * Math.cos(z * scale * 2) * 2;
        return Math.floor(20 + noise);
    }

    generateTree(x, y, z) {
        // Trunk
        for (let ty = 0; ty < 5; ty++) {
            this.setBlock(x, y + ty, z, 3);
        }

        // Leaves
        for (let lx = -2; lx <= 2; lx++) {
            for (let lz = -2; lz <= 2; lz++) {
                for (let ly = 4; ly <= 6; ly++) {
                    if (Math.abs(lx) + Math.abs(lz) + (ly - 4) < 5) {
                        if (!(lx === 0 && lz === 0 && ly < 6)) {
                            this.setBlock(x + lx, y + ly, z + lz, 4);
                        }
                    }
                }
            }
        }
    }

    setBlock(x, y, z, type) {
        const key = `${x},${y},${z}`;
        
        if (type === null) {
            const existing = this.world.get(key);
            if (existing) {
                this.scene.remove(existing);
                this.world.delete(key);
            }
            return;
        }

        const blockType = this.blockTypes[type];
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshLambertMaterial({
            color: blockType.color,
            transparent: blockType.transparent || false,
            opacity: blockType.transparent ? 0.7 : 1
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.userData = { type, x, y, z };
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const existing = this.world.get(key);
        if (existing) {
            this.scene.remove(existing);
        }

        this.scene.add(mesh);
        this.world.set(key, mesh);
    }

    getBlock(x, y, z) {
        const key = `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
        const block = this.world.get(key);
        return block ? block.userData.type : null;
    }

    setupEventListeners() {
        // Keyboard controls
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
                case 'KeyF':
                    this.player.flying = !this.player.flying;
                    break;
                case 'KeyE':
                    this.toggleInventory();
                    break;
                case 'Digit1': this.selectBlock(0); break;
                case 'Digit2': this.selectBlock(1); break;
                case 'Digit3': this.selectBlock(2); break;
                case 'Digit4': this.selectBlock(3); break;
                case 'Digit5': this.selectBlock(4); break;
                case 'Escape':
                    this.pauseGame();
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

        // Mouse controls
        document.getElementById('game-canvas').addEventListener('click', () => {
            if (!this.isMobile) {
                document.getElementById('game-canvas').requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.mouse.locked = document.pointerLockElement === document.getElementById('game-canvas');
        });

        document.addEventListener('mousemove', (e) => {
            if (this.mouse.locked) {
                this.player.rotation.y -= e.movementX * 0.002;
                this.player.rotation.x -= e.movementY * 0.002;
                this.player.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.rotation.x));
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (this.mouse.locked) {
                if (e.button === 0) {
                    this.breakBlock();
                } else if (e.button === 2) {
                    this.placeBlock();
                    e.preventDefault();
                }
            }
        });

        document.addEventListener('contextmenu', (e) => e.preventDefault());

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Hotbar clicks
        document.querySelectorAll('.hotbar-slot').forEach((slot, index) => {
            slot.addEventListener('click', () => this.selectBlock(index));
        });
    }

    setupMobileControls() {
        const joystickContainer = document.getElementById('joystick-container');
        const joystickStick = document.getElementById('joystick-stick');
        const canvas = document.getElementById('game-canvas');

        // Joystick
        joystickContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.joystick.active = true;
            const touch = e.touches[0];
            const rect = joystickContainer.getBoundingClientRect();
            this.joystick.startX = rect.left + rect.width / 2;
            this.joystick.startY = rect.top + rect.height / 2;
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
            
            this.joystick.currentX = dx / maxDistance;
            this.joystick.currentY = dy / maxDistance;

            // Update controls
            this.controls.forward = this.joystick.currentY < -0.3;
            this.controls.backward = this.joystick.currentY > 0.3;
            this.controls.left = this.joystick.currentX < -0.3;
            this.controls.right = this.joystick.currentX > 0.3;
        });

        const resetJoystick = () => {
            this.joystick.active = false;
            joystickStick.style.transform = 'translate(-50%, -50%)';
            this.joystick.currentX = 0;
            this.joystick.currentY = 0;
            this.controls.forward = false;
            this.controls.backward = false;
            this.controls.left = false;
            this.controls.right = false;
        };

        joystickContainer.addEventListener('touchend', resetJoystick);
        joystickContainer.addEventListener('touchcancel', resetJoystick);

        // Look controls (right side of screen)
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                if (touch.clientX > window.innerWidth / 2) {
                    this.lookTouch.active = true;
                    this.lookTouch.startX = touch.clientX;
                    this.lookTouch.startY = touch.clientY;
                }
            }
        });

        canvas.addEventListener('touchmove', (e) => {
            if (this.lookTouch.active && e.touches.length === 1) {
                e.preventDefault();
                const touch = e.touches[0];
                const dx = touch.clientX - this.lookTouch.startX;
                const dy = touch.clientY - this.lookTouch.startY;

                this.player.rotation.y -= dx * 0.005;
                this.player.rotation.x -= dy * 0.005;
                this.player.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.rotation.x));

                this.lookTouch.startX = touch.clientX;
                this.lookTouch.startY = touch.clientY;
            }
        });

        canvas.addEventListener('touchend', () => {
            this.lookTouch.active = false;
        });

        // Action buttons
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
        const raycaster = new THREE.Raycaster();
        const direction = new THREE.Vector3();
        
        this.camera.getWorldDirection(direction);
        raycaster.set(this.camera.position, direction);

        const intersects = raycaster.intersectObjects(this.scene.children.filter(obj => obj.userData.type !== undefined));

        if (intersects.length > 0) {
            const block = intersects[0].object;
            const { x, y, z } = block.userData;
            this.setBlock(x, y, z, null);
        }
    }

    placeBlock() {
        const raycaster = new THREE.Raycaster();
        const direction = new THREE.Vector3();
        
        this.camera.getWorldDirection(direction);
        raycaster.set(this.camera.position, direction);

        const intersects = raycaster.intersectObjects(this.scene.children.filter(obj => obj.userData.type !== undefined));

        if (intersects.length > 0) {
            const normal = intersects[0].face.normal;
            const blockPos = intersects[0].object.position;
            const newX = Math.floor(blockPos.x + normal.x);
            const newY = Math.floor(blockPos.y + normal.y);
            const newZ = Math.floor(blockPos.z + normal.z);

            // Don't place block where player is
            const playerBox = new THREE.Box3(
                new THREE.Vector3(
                    this.player.position.x - this.player.width / 2,
                    this.player.position.y,
                    this.player.position.z - this.player.width / 2
                ),
                new THREE.Vector3(
                    this.player.position.x + this.player.width / 2,
                    this.player.position.y + this.player.height,
                    this.player.position.z + this.player.width / 2
                )
            );

            const newBlockBox = new THREE.Box3(
                new THREE.Vector3(newX - 0.5, newY - 0.5, newZ - 0.5),
                new THREE.Vector3(newX + 0.5, newY + 0.5, newZ + 0.5)
            );

            if (!playerBox.intersectsBox(newBlockBox)) {
                this.setBlock(newX, newY, newZ, this.selectedBlock);
            }
        }
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
        const pauseScreen = document.getElementById('pause-screen');
        pauseScreen.classList.remove('hidden');
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    updatePhysics(deltaTime) {
        const moveSpeed = this.player.speed;
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();

        // Calculate movement directions
        forward.set(
            -Math.sin(this.player.rotation.y),
            0,
            -Math.cos(this.player.rotation.y)
        );
        right.set(
            Math.cos(this.player.rotation.y),
            0,
            -Math.sin(this.player.rotation.y)
        );

        // Apply movement
        if (this.controls.forward) {
            this.player.velocity.x += forward.x * moveSpeed;
            this.player.velocity.z += forward.z * moveSpeed;
        }
        if (this.controls.backward) {
            this.player.velocity.x -= forward.x * moveSpeed;
            this.player.velocity.z -= forward.z * moveSpeed;
        }
        if (this.controls.left) {
            this.player.velocity.x -= right.x * moveSpeed;
            this.player.velocity.z -= right.z * moveSpeed;
        }
        if (this.controls.right) {
            this.player.velocity.x += right.x * moveSpeed;
            this.player.velocity.z += right.z * moveSpeed;
        }

        // Flying mode
        if (this.player.flying) {
            this.player.velocity.y *= 0.8;
            if (this.controls.jump) {
                this.player.velocity.y = moveSpeed * 2;
            }
            if (this.controls.sneak) {
                this.player.velocity.y = -moveSpeed * 2;
            }
        } else {
            // Gravity
            this.player.velocity.y += this.player.gravity;

            // Jumping
            if (this.controls.jump && this.player.onGround) {
                this.player.velocity.y = this.player.jumpForce;
                this.player.onGround = false;
            }
        }

        // Apply friction
        this.player.velocity.x *= 0.8;
        this.player.velocity.z *= 0.8;

        // Update position with collision detection
        const newPos = this.player.position.clone();
        newPos.x += this.player.velocity.x;
        newPos.y += this.player.velocity.y;
        newPos.z += this.player.velocity.z;

        // Simple collision detection
        const checkCollision = (pos) => {
            for (let y = 0; y < this.player.height; y += 0.5) {
                const checkY = Math.floor(pos.y + y);
                if (this.getBlock(pos.x, checkY, pos.z) !== null) {
                    return true;
                }
            }
            return false;
        };

        // Check X axis
        const testX = newPos.clone();
        testX.y = this.player.position.y;
        testX.z = this.player.position.z;
        if (!checkCollision(testX)) {
            this.player.position.x = newPos.x;
        } else {
            this.player.velocity.x = 0;
        }

        // Check Z axis
        const testZ = newPos.clone();
        testZ.x = this.player.position.x;
        testZ.y = this.player.position.y;
        if (!checkCollision(testZ)) {
            this.player.position.z = newPos.z;
        } else {
            this.player.velocity.z = 0;
        }

        // Check Y axis
        const testY = newPos.clone();
        testY.x = this.player.position.x;
        testY.z = this.player.position.z;
        
        this.player.onGround = false;
        
        if (this.player.velocity.y < 0) {
            // Check ground
            if (checkCollision(testY)) {
                this.player.velocity.y = 0;
                this.player.onGround = true;
                this.player.position.y = Math.floor(testY.y) + 1;
            } else {
                this.player.position.y = newPos.y;
            }
        } else {
            // Check ceiling
            if (checkCollision(testY)) {
                this.player.velocity.y = 0;
            } else {
                this.player.position.y = newPos.y;
            }
        }

        // Prevent falling through world
        if (this.player.position.y < 0) {
            this.player.position.y = 32;
            this.player.velocity.y = 0;
        }

        // Update camera
        this.camera.position.copy(this.player.position);
        this.camera.position.y += this.player.height - 0.2;
        this.camera.rotation.set(this.player.rotation.x, this.player.rotation.y, 0);
    }

    updateDayNightCycle() {
        this.gameTime += 16;
        const cycle = (this.gameTime % this.dayLength) / this.dayLength;
        
        // Update sun position
        const angle = cycle * Math.PI * 2;
        this.sunLight.position.x = Math.cos(angle) * 100;
        this.sunLight.position.y = Math.sin(angle) * 100;
        
        // Update lighting
        const isDay = this.sunLight.position.y > 0;
        const timeOfDay = isDay ? 'Day' : 'Night';
        document.getElementById('game-time').textContent = timeOfDay;
        
        if (isDay) {
            const brightness = Math.max(0.3, this.sunLight.position.y / 100);
            this.scene.background = new THREE.Color(0x87CEEB).multiplyScalar(brightness);
            this.sunLight.intensity = brightness;
        } else {
            this.scene.background = new THREE.Color(0x000033);
            this.sunLight.intensity = 0.1;
        }
    }

    updateHUD() {
        // FPS counter
        this.frameCount++;
        const now = Date.now();
        if (now - this.fpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTime = now;
            document.getElementById('fps').textContent = this.fps;
        }

        // Position
        document.getElementById('position').textContent = 
            `${Math.floor(this.player.position.x)}, ${Math.floor(this.player.position.y)}, ${Math.floor(this.player.position.z)}`;

        // Block count
        document.getElementById('block-count').textContent = this.world.size;
    }

    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());

        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.updatePhysics(deltaTime);
        this.updateDayNightCycle();
        this.updateHUD();

        this.renderer.render(this.scene, this.camera);
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
    const controlsInfo = document.getElementById('controls-info');
    controlsInfo.classList.toggle('hidden');
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

// Inventory item selection
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
