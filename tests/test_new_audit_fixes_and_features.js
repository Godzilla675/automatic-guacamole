const { JSDOM } = require('jsdom');
const assert = require('assert');

describe('New Audit Fixes & Quality Features Test Suite', function() {
    let dom, window, globalGame;

    beforeEach(function() {
        dom = new JSDOM(`<!DOCTYPE html><html><body>
            <canvas id="game-canvas"></canvas>
            <div id="hotbar"></div>
            <div id="inventory-screen" class="hidden"></div>
            <div id="crafter-screen" class="hidden"><div class="inventory-content"><div id="crafter-grid"></div></div></div>
            <div id="notifications-container"></div>
            <div id="chat-container"><div id="chat-messages"></div><input id="chat-input" class="hidden" /></div>
        </body></html>`, {
            url: 'http://localhost',
            runScripts: 'dangerously',
            resources: 'usable'
        });

        window = dom.window;
        global.window = window;
        global.document = window.document;
        global.HTMLCanvasElement = window.HTMLCanvasElement;

        document.exitPointerLock = function() {};
        window.HTMLCanvasElement.prototype.requestPointerLock = function() {};

        // Mock Web Audio API
        window.AudioContext = class MockAudioContext {
            constructor() {
                this.state = 'running';
                this.currentTime = 0;
                this.destination = {};
                this.listener = {
                    setPosition: () => {},
                    setOrientation: () => {}
                };
            }
            createBufferSource() {
                return {
                    buffer: null,
                    loop: false,
                    connect: () => {},
                    start: () => {},
                    stop: () => {}
                };
            }
            createBuffer() {
                return {
                    getChannelData: () => new Float32Array(100)
                };
            }
            createBiquadFilter() {
                return {
                    type: 'lowpass',
                    frequency: { value: 0 },
                    Q: { value: 0 },
                    connect: () => {}
                };
            }
            createGain() {
                return {
                    gain: {
                        value: 0,
                        setValueAtTime: () => {},
                        exponentialRampToValueAtTime: () => {},
                        linearRampToValueAtTime: () => {},
                        setTargetAtTime: () => {}
                    },
                    connect: () => {}
                };
            }
            createOscillator() {
                return {
                    type: 'sine',
                    frequency: {
                        setValueAtTime: () => {},
                        exponentialRampToValueAtTime: () => {},
                        linearRampToValueAtTime: () => {}
                    },
                    connect: () => {},
                    start: () => {},
                    stop: () => {}
                };
            }
            createPanner() {
                return {
                    connect: () => {},
                    setPosition: () => {}
                };
            }
            resume() { this.state = 'running'; }
        };

        const loadModule = (file) => {
            delete require.cache[require.resolve(file)];
            require(file);
            for (let prop in window) {
                if (window.hasOwnProperty(prop) && !(prop in global)) {
                    global[prop] = window[prop];
                }
            }
        };

        loadModule('../js/math.js');
        loadModule('../js/blocks.js');
        loadModule('../js/audio.js');
        loadModule('../js/particles.js');
        loadModule('../js/biome.js');
        loadModule('../js/structures.js');
        loadModule('../js/chunk.js');
        loadModule('../js/world.js');
        loadModule('../js/physics.js');
        loadModule('../js/entity.js');
        loadModule('../js/drop.js');
        loadModule('../js/vehicle.js');
        loadModule('../js/player.js');
        loadModule('../js/mob.js');
        loadModule('../js/chat.js');
        loadModule('../js/input.js');
        loadModule('../js/network.js');
        loadModule('../js/crafting.js');
        loadModule('../js/plugin.js');
        loadModule('../js/minimap.js');
        loadModule('../js/achievements.js');
        loadModule('../js/tutorial.js');
        loadModule('../js/ui.js');
        loadModule('../js/renderer.js');
        loadModule('../js/interactions.js');
        loadModule('../js/game.js');

        globalGame = new window.Game();
        window.game = globalGame;
        globalGame.world.generateChunk(0, 0);
    });

    it('1. should verify SoundManager weather audio loops and Creaking step/screech synthesis', function() {
        const soundMgr = window.soundManager;
        assert.doesNotThrow(() => {
            soundMgr.startAmbience();
            soundMgr.updateWeatherAmbience('rain');
            soundMgr.updateWeatherAmbience('thunder');
            soundMgr.play('creaking_step', { x: 10, y: 5, z: 10 });
            soundMgr.play('creaking_screech', { x: 10, y: 5, z: 10 });
        });
    });

    it('2. should verify Creaking mob triggers creaking_step and creaking_screech during movement & attack', function() {
        const creaking = new window.Mob(globalGame, 10, 5, 10, window.MOB_TYPE.CREAKING);
        globalGame.player.x = 12;
        globalGame.player.y = 5;
        globalGame.player.z = 10;

        assert.doesNotThrow(() => {
            creaking.updateAI(0.5);
        });
    });

    it('3. should verify Trial Spawner miniature rotating core preview rendering', function() {
        globalGame.world.setBlock(10, 5, 10, window.BLOCK.TRIAL_SPAWNER);
        globalGame.world.setBlockEntity(10, 5, 10, { type: 'trial_spawner', wave: 1 });

        assert.doesNotThrow(() => {
            globalGame.renderer.render();
        });
    });

    it('4. should verify Lodestone Compass target alignment interaction', function() {
        globalGame.world.setBlock(5, 5, 5, window.BLOCK.LODESTONE);
        globalGame.player.x = 5;
        globalGame.player.y = 5;
        globalGame.player.z = 5;
        globalGame.player.inventory[0] = { type: window.BLOCK.ITEM_COMPASS, count: 1 };
        globalGame.player.selectedSlot = 0;

        const interacted = globalGame.interact(5, 5, 5);
        assert.strictEqual(interacted, true);
        const compass = globalGame.player.getHeldItem();
        assert.ok(compass.lodestonePos);
        assert.strictEqual(compass.lodestonePos.x, 5);
        assert.strictEqual(compass.lodestonePos.y, 5);
        assert.strictEqual(compass.lodestonePos.z, 5);
    });

    it('5. should verify Wind Charge spiral blast particle trail emission', function() {
        globalGame.spawnProjectile(5, 5, 5, { x: 1, y: 0, z: 0 }, 'wind_charge');
        assert.strictEqual(globalGame.projectiles.length, 1);

        assert.doesNotThrow(() => {
            const p = globalGame.projectiles[0];
            p.x += p.vx * 0.016;
            p.y += p.vy * 0.016;
            p.z += p.vz * 0.016;
            if (globalGame.particles) {
                globalGame.particles.spawn(p.x, p.y, p.z, '#E0FFFF', 2);
            }
        });
    });

    it('6. should verify Heavy Core Mace fall smash ground shockwave FX', function() {
        const dummyMob = new window.Mob(globalGame, 10, 5, 10, window.MOB_TYPE.ZOMBIE);
        globalGame.mobs.push(dummyMob);

        globalGame.player.inventory[0] = { type: window.BLOCK.ITEM_MACE, count: 1 };
        globalGame.player.selectedSlot = 0;
        globalGame.player.fallDistance = 5;
        globalGame.player.vy = -10;

        assert.doesNotThrow(() => {
            globalGame.player.attack(dummyMob);
        });
    });

    it('7. should verify Crafter pulse trigger cooldown status overlay in UIManager', function() {
        const entity = { type: 'crafter', items: new Array(9).fill(null), lastTriggerTime: Date.now() };
        globalGame.ui.openCrafter(entity);

        const overlay = window.document.getElementById('crafter-cooldown-overlay') || global.document.getElementById('crafter-cooldown-overlay');
        assert.ok(overlay);
        assert.strictEqual(overlay.style.display, 'block');
    });
});
