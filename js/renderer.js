class Renderer {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        this.textureManager = null;
        if (window.TextureManager) {
            this.textureManager = new TextureManager();
            this.textureManager.init();
        }
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

    drawSky(w, h) {
        const ctx = this.ctx;
        const cycle = (this.game.gameTime % this.game.dayLength) / this.game.dayLength;
        const angle = cycle * 2 * Math.PI;

        // Sky Gradient
        const b = this.game.sunBrightness;
        const gradient = ctx.createLinearGradient(0, 0, 0, h);

        if (cycle > 0.45 && cycle < 0.55) { // Sunset
             gradient.addColorStop(0, `rgb(20, 20, 60)`);
             gradient.addColorStop(1, `rgb(255, 100, 50)`);
        } else if (cycle > 0.95 || cycle < 0.05) { // Sunrise
             gradient.addColorStop(0, `rgb(20, 20, 60)`);
             gradient.addColorStop(1, `rgb(255, 150, 50)`);
        } else if (b < 0.5) { // Night
             gradient.addColorStop(0, `rgb(0, 0, 10)`);
             gradient.addColorStop(1, `rgb(0, 0, 30)`);
        } else { // Day
             gradient.addColorStop(0, `rgb(100, 180, 255)`);
             gradient.addColorStop(1, `rgb(200, 230, 255)`);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Sun/Moon Position
        const r = 1000;
        const sunX = Math.cos(angle) * r;
        const sunY = Math.sin(angle) * r;

        this.drawCelestialBody(w, h, sunX, sunY, 0, 'sun');
        this.drawCelestialBody(w, h, -sunX, -sunY, 0, 'moon');
    }

    drawCelestialBody(w, h, x, y, z, type) {
        const yaw = this.game.player.yaw;
        const pitch = this.game.player.pitch;

        const sinY = Math.sin(-yaw);
        const cosY = Math.cos(-yaw);
        const sinP = Math.sin(-pitch);
        const cosP = Math.cos(-pitch);

        const rx = x * cosY - z * sinY;
        const rz = x * sinY + z * cosY;
        const ry = y * cosP - rz * sinP;
        const rz2 = y * sinP + rz * cosP;

        if (rz2 > 0) {
             const scale = (h / 2) / Math.tan(this.game.fov * Math.PI / 360);
             const size = scale * 0.15;

             const sx = (rx / rz2) * scale + w / 2;
             const sy = (ry / rz2) * scale + h / 2;

             this.ctx.beginPath();
             if (type === 'sun') {
                 this.ctx.fillStyle = '#FFFF00';
                 this.ctx.arc(sx, sy, size, 0, Math.PI * 2);
                 this.ctx.fill();

                 this.ctx.globalAlpha = 0.2;
                 this.ctx.fillStyle = '#FFA500';
                 this.ctx.beginPath();
                 this.ctx.arc(sx, sy, size * 1.5, 0, Math.PI * 2);
                 this.ctx.fill();
                 this.ctx.globalAlpha = 1.0;
             } else {
                 this.ctx.fillStyle = '#F0F0F0';
                 this.ctx.fillRect(sx - size, sy - size, size * 2, size * 2);
             }
        }
    }

    render() {
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);
        const ctx = this.ctx;

        // Sky
        this.drawSky(w, h);

        // Water Overlay (Under water)
        const headBlock = this.game.world.getBlock(Math.floor(this.game.player.x), Math.floor(this.game.player.y + this.game.player.height - 0.2), Math.floor(this.game.player.z));
        if (headBlock === BLOCK.WATER) {
            ctx.fillStyle = 'rgba(0, 50, 150, 0.5)';
            ctx.fillRect(0, 0, w, h);
        }

        // Render Blocks
        // Chunk-based rendering + Frustum/Distance Culling

        const blocksToDraw = [];
        const px = this.game.player.x;
        const py = this.game.player.y + this.game.player.height - 0.2; // Camera Y
        const pz = this.game.player.z;
        const yaw = this.game.player.yaw;
        const pitch = this.game.player.pitch;

        const sinY = Math.sin(-yaw);
        const cosY = Math.cos(-yaw);
        const sinP = Math.sin(-pitch);
        const cosP = Math.cos(-pitch);

        const renderDist = this.game.renderDistance; // View distance in blocks

        // We should iterate chunks, but for now let's iterate blocks in loaded chunks nearby
        // Optimization: Only iterate chunks within renderDist

        const centerCX = Math.floor(px / 16);
        const centerCZ = Math.floor(pz / 16);
        const chunkRad = Math.ceil(renderDist / 16);

        for (let cx = centerCX - chunkRad; cx <= centerCX + chunkRad; cx++) {
            for (let cz = centerCZ - chunkRad; cz <= centerCZ + chunkRad; cz++) {
                const chunk = this.game.world.getChunk(cx, cz);
                if (!chunk) continue;

                // Ensure chunk cache is built
                if (chunk.modified) {
                    chunk.updateVisibleBlocks(this.game.world);
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
                        const blockDef = window.BLOCKS[b.type];
                        if (blockDef && blockDef.isStair) {
                            // Stairs: Push 2 parts
                            // 1. Bottom Half (Center at y - 0.25)
                            const dy1 = dy - 0.25;
                            const rx1 = dx * cosY - dz * sinY;
                            const rz1 = dx * sinY + dz * cosY;
                            const ry1 = dy1 * cosP - rz1 * sinP;
                            const rz1_depth = dy1 * sinP + rz1 * cosP;

                            blocksToDraw.push({
                                type: b.type,
                                rx: rx1, ry: ry1, rz: rz1_depth,
                                dist,
                                light: chunk.getLight(b.x, b.y, b.z),
                                metadata: chunk.getMetadata(b.x, b.y, b.z),
                                isStairPart: 'bottom'
                            });

                            // 2. Top Half (Center at y + 0.25, shifted X/Z)
                            const meta = chunk.getMetadata(b.x, b.y, b.z);
                            let offX = 0, offZ = 0;
                            // 0=East (+X), 1=West (-X), 2=South (+Z), 3=North (-Z)
                            if (meta === 0) offX = 0.25;
                            else if (meta === 1) offX = -0.25;
                            else if (meta === 2) offZ = 0.25;
                            else if (meta === 3) offZ = -0.25;

                            const dx2 = dx + offX;
                            const dy2 = dy + 0.25;
                            const dz2 = dz + offZ;

                            const rx2 = dx2 * cosY - dz2 * sinY;
                            const rz2_top = dx2 * sinY + dz2 * cosY;
                            const ry2 = dy2 * cosP - rz2_top * sinP;
                            const rz2_top_depth = dy2 * sinP + rz2_top * cosP;

                             blocksToDraw.push({
                                type: b.type,
                                rx: rx2, ry: ry2, rz: rz2_top_depth,
                                dist,
                                light: chunk.getLight(b.x, b.y, b.z),
                                metadata: meta,
                                isStairPart: 'top'
                            });
                        } else if (blockDef.isFence || blockDef.isPane) {
                             blocksToDraw.push({
                                type: b.type,
                                rx, ry, rz: rz2,
                                dist,
                                light: chunk.getLight(b.x, b.y, b.z),
                                metadata: chunk.getMetadata(b.x, b.y, b.z),
                                isFencePost: true
                             });
                        } else if (blockDef.isTrapdoor) {
                             blocksToDraw.push({
                                type: b.type,
                                rx, ry, rz: rz2,
                                dist,
                                light: chunk.getLight(b.x, b.y, b.z),
                                metadata: chunk.getMetadata(b.x, b.y, b.z),
                                isTrapdoor: true
                             });
                        } else if (blockDef.isGate) {
                             blocksToDraw.push({
                                type: b.type,
                                rx, ry, rz: rz2,
                                dist,
                                light: chunk.getLight(b.x, b.y, b.z),
                                metadata: chunk.getMetadata(b.x, b.y, b.z),
                                isGate: true
                             });
                        } else {
                            blocksToDraw.push({
                                type: b.type,
                                rx, ry: ry, rz: rz2,
                                dist,
                                light: chunk.getLight(b.x, b.y, b.z),
                                metadata: chunk.getMetadata(b.x, b.y, b.z),
                                cx: cx, cz: cz, bx: b.x, by: b.y, bz: b.z
                            });
                        }
                    }
                }
            }
        }

        // Sort
        blocksToDraw.sort((a, b) => b.dist - a.dist);

        // Draw
        blocksToDraw.forEach(b => {
             const scale = (h / 2) / Math.tan(this.game.fov * Math.PI / 360);
             const size = scale / b.rz;
             const sx = (b.rx / b.rz) * scale + w / 2;
             const sy = (b.ry / b.rz) * scale + h / 2;

             if (size > 0.5 && sx > -size && sx < w+size && sy > -size && sy < h+size) {
                 const blockDef = BLOCKS[b.type];
                 if (!blockDef) return;

                 const distFactor = Math.min(1, b.dist / 50);
                 const fog = distFactor * distFactor;

                 // Basic lighting from chunk data + distance fog
                 // We don't have exact face lighting here easily without normal data
                 // Just use the block type color
                 let drawHeight = size;
                 let drawSy = sy;

                 if (b.type === window.BLOCK.WATER) {
                     const time = Date.now() / 500;
                     const shift = Math.sin(time + b.x * 0.2 + b.z * 0.2) * 20;
                     // Base #4169E1 -> 65, 105, 225
                     ctx.fillStyle = `rgb(${65 + shift/2}, ${105 + shift/2}, ${225 + shift})`;

                     // Water Level
                     const level = b.metadata || 8;
                     const hFactor = level >= 8 ? 0.9 : (level / 9); // 1-7 -> 1/9 to 7/9
                     drawHeight = size * hFactor;
                     // Align bottom
                     drawSy = sy + (size - drawHeight) / 2;

                 } else {
                     ctx.fillStyle = blockDef.color;
                     // Slabs
                     if (blockDef.isSlab) {
                         drawHeight = size * 0.5;
                         drawSy = sy + (size - drawHeight) / 2;
                     }
                     // Stairs
                     if (blockDef.isStair) {
                         drawHeight = size * 0.5;
                         drawSy = sy; // Already centered by loop calculation
                     }
                     // Doors
                     if (blockDef.isDoor) {
                         const meta = b.metadata;
                         if (meta & 4) { // Open (Bit 2)
                             ctx.globalAlpha = 0.2; // Transparent
                         }
                     }
                     // Fences
                     if (b.isFencePost) {
                         drawHeight = size;
                         const width = size * 0.25;
                         ctx.fillRect(Math.floor(sx - width/2), Math.floor(drawSy - drawHeight/2), Math.ceil(width), Math.ceil(drawHeight));

                         // Simple bars (visual hack: just draw a wider thin bar in middle)
                         ctx.fillRect(Math.floor(sx - size/2), Math.floor(drawSy - size*0.1), Math.ceil(size), Math.ceil(size*0.2));

                         return;
                     }
                     // Trapdoors
                     if (b.isTrapdoor) {
                         const meta = b.metadata;
                         const open = (meta & 4) !== 0;
                         const top = (meta & 8) !== 0;

                         if (open) {
                             drawHeight = size;
                             const width = size * 0.1875;
                             ctx.fillRect(Math.floor(sx - width/2), Math.floor(drawSy - drawHeight/2), Math.ceil(width), Math.ceil(drawHeight));
                         } else {
                             drawHeight = size * 0.1875;
                             let yOffset = 0;
                             if (top) yOffset = -size/2 + drawHeight/2; // Top
                             else yOffset = size/2 - drawHeight/2; // Bottom

                             ctx.fillRect(Math.floor(sx - size/2), Math.floor(drawSy + yOffset - drawHeight/2), Math.ceil(size), Math.ceil(drawHeight));
                         }
                         return;
                     }
                     // Gates
                     if (b.isGate) {
                         const meta = b.metadata;
                         const open = (meta & 4) !== 0;
                         drawHeight = size;
                         const width = size * 0.25;
                         if (open) ctx.globalAlpha = 0.2;
                         ctx.fillRect(Math.floor(sx - width/2), Math.floor(drawSy - drawHeight/2), Math.ceil(width), Math.ceil(drawHeight));
                         ctx.globalAlpha = 1.0;
                         return;
                     }
                     // Signs
                     if (blockDef.isSign) {
                         if (b.type === window.BLOCK.SIGN_POST) {
                             // Draw Stick
                             const stickW = size * 0.1;
                             const stickH = size * 0.5;
                             ctx.fillStyle = '#8B4513';
                             ctx.fillRect(Math.floor(sx - stickW/2), Math.floor(drawSy + size/2 - stickH), Math.ceil(stickW), Math.ceil(stickH));

                             // Draw Board
                             const boardW = size * 0.8;
                             const boardH = size * 0.5;
                             ctx.fillStyle = blockDef.color;
                             ctx.fillRect(Math.floor(sx - boardW/2), Math.floor(drawSy - size/2), Math.ceil(boardW), Math.ceil(boardH));

                             // Draw Text
                             if (b.cx !== undefined) {
                                 const entity = this.game.world.getBlockEntity(b.cx * 16 + b.bx, b.by, b.cz * 16 + b.bz);
                                 if (entity && entity.text) {
                                     ctx.fillStyle = 'black';
                                     ctx.font = `bold ${Math.max(8, Math.ceil(size * 0.12))}px Arial`;
                                     ctx.textAlign = 'center';
                                     let lineY = drawSy - size/2 + size*0.1 + size*0.12;
                                     entity.text.forEach(line => {
                                         ctx.fillText(line, sx, lineY);
                                         lineY += size * 0.12;
                                     });
                                 }
                             }
                             return;
                         } else {
                             // Wall Sign
                             const boardW = size * 0.8;
                             const boardH = size * 0.5;
                             ctx.fillStyle = blockDef.color;
                             ctx.fillRect(Math.floor(sx - boardW/2), Math.floor(drawSy - size/4), Math.ceil(boardW), Math.ceil(boardH));

                             if (b.cx !== undefined) {
                                 const entity = this.game.world.getBlockEntity(b.cx * 16 + b.bx, b.by, b.cz * 16 + b.bz);
                                 if (entity && entity.text) {
                                     ctx.fillStyle = 'black';
                                     ctx.font = `bold ${Math.max(8, Math.ceil(size * 0.12))}px Arial`;
                                     ctx.textAlign = 'center';
                                     let lineY = drawSy - size/4 + size*0.1 + size*0.12;
                                     entity.text.forEach(line => {
                                         ctx.fillText(line, sx, lineY);
                                         lineY += size * 0.12;
                                     });
                                 }
                             }
                             return;
                         }
                     }
                     // Torches (Normal & Redstone)
                     if (blockDef.isTorch) {
                         drawHeight = size * 0.6;
                         const width = size * 0.15;
                         // Stick
                         ctx.fillStyle = '#8B4513';
                         ctx.fillRect(Math.floor(sx - width/2), Math.floor(drawSy + size/2 - drawHeight), Math.ceil(width), Math.ceil(drawHeight));
                         // Head
                         ctx.fillStyle = blockDef.color; // Gold or Red
                         ctx.fillRect(Math.floor(sx - width/2), Math.floor(drawSy + size/2 - drawHeight), Math.ceil(width), Math.ceil(width));
                         return;
                     }
                     // Redstone Wire
                     if (blockDef.isWire) {
                         const power = b.metadata; // 0-15
                         const intensity = Math.max(60, power * 17); // 60 to 255
                         ctx.fillStyle = `rgb(${intensity}, 0, 0)`;

                         drawHeight = size * 0.1; // Flat
                         const drawSyWire = sy + size/2 - drawHeight/2; // Bottom

                         const centerSize = size * 0.3;

                         // Draw Center
                         ctx.fillRect(Math.floor(sx - centerSize/2), Math.floor(drawSyWire - drawHeight/2), Math.ceil(centerSize), Math.ceil(drawHeight));

                         // Draw Connections
                         // We need to check neighbors. 'b' has local coords x,y,z.
                         // Using chunk.getBlock handles out of bounds by returning AIR (in my memory, let's verify)
                         // Actually Chunk.getBlock checks bounds and returns AIR.
                         // To see across chunks we need world.getBlock but we only have 'chunk' easily here.
                         // We can compute world coords.
                         const wx = cx * 16 + b.x;
                         const wz = cz * 16 + b.z;

                         const checkConnect = (dx, dz) => {
                             const nb = this.game.world.getBlock(wx + dx, b.y, wz + dz);
                             const nd = window.BLOCKS[nb];
                             // Connect to Wire, Torch, or Power Source
                             // Simplified: Connect to anything that is Wire or Torch or Lamp
                             return (nd && (nd.isWire || nd.isTorch || nd.id === window.BLOCK.REDSTONE_LAMP || nd.id === window.BLOCK.REDSTONE_LAMP_ACTIVE));
                         };

                         const armLen = (size - centerSize) / 2;
                         const armWidth = centerSize; // Wire width

                         if (checkConnect(1, 0)) { // East (+X)
                              // 2D projection is tricky.
                              // sx is screen X. As we rotate, +X direction changes on screen.
                              // We already calculated rotated coordinates: rx, rz.
                              // We need to draw lines in 3D space projected to 2D.
                              // But here we are just drawing rects at 'sx, sy'.
                              // Doing proper 3D lines with fillRect is hard without proper projection of endpoints.

                              // Fallback: Just draw a cross always for now?
                              // Or better: Draw arms based on screen-projected directions?
                              // That's too complex for this "fake 3D" renderer which just scales sprites.

                              // Alternative: Just draw a larger flat square if connected?
                         }

                         // For this engine (billboard/sprite scaling), we can't easily draw directional arms
                         // because we don't know which way is "East" on the screen easily (we do, but it requires math).

                         // Hack: Draw a cross always. It looks like wire.
                         ctx.fillRect(Math.floor(sx - size/2), Math.floor(drawSyWire - drawHeight/2), Math.ceil(size), Math.ceil(drawHeight)); // Horizontal bar
                         ctx.fillRect(Math.floor(sx - centerSize/2), Math.floor(drawSyWire - size/2 + drawHeight/2), Math.ceil(centerSize), Math.ceil(size/2 + drawHeight/2)); // Vertical bar (approx)
                         // Actually, this just draws a cross on screen, which rotates with player view (billboarding).
                         // Real wire should lay on ground.
                         // Since we don't have true geometry, let's just draw a red flat square on the floor.

                         // Reset and just draw flat square
                         ctx.fillStyle = `rgb(${intensity}, 0, 0)`;
                         const wireSize = size * 0.8;
                         ctx.fillRect(Math.floor(sx - wireSize/2), Math.floor(drawSyWire - drawHeight/2), Math.ceil(wireSize), Math.ceil(drawHeight));

                         return;
                     }
                 }
                 // We could adjust brightness by b.light (0-15)
                 // let lightMult = b.light / 15;
                 // ctx.fillStyle = this.adjustColor(blockDef.color, lightMult);

                 const drawX = Math.floor(sx - size/2);
                 const drawY = Math.floor(drawSy - drawHeight/2);
                 const drawW = Math.ceil(size);
                 const drawH = Math.ceil(drawHeight);
                 const tex = this.textureManager ? this.textureManager.getBlockTexture(b.type) : null;
                 if (tex) {
                     ctx.drawImage(tex, drawX, drawY, drawW, drawH);
                 } else {
                     ctx.fillRect(drawX, drawY, drawW, drawH);
                 }
                 ctx.globalAlpha = 1.0;
             }
        });

        // Draw Mobs (simple billboards)
        this.game.mobs.forEach(mob => {
             const dx = mob.x - px;
             const dy = mob.y - py;
             const dz = mob.z - pz;

             const rx = dx * cosY - dz * sinY;
             const rz = dx * sinY + dz * cosY;
             const ry = dy * cosP - rz * sinP;
             const rz2 = dy * sinP + rz * cosP;

             if (rz2 > 0.1) {
                 const scale = (h / 2) / Math.tan(this.game.fov * Math.PI / 360);
                 const size = (scale / rz2) * mob.height;
                 const sx = (rx / rz2) * scale + w / 2;
                 const sy = (ry / rz2) * scale + h / 2;

                 ctx.fillStyle = mob.color;
                 const mobTex = this.textureManager ? this.textureManager.getMobTexture(mob.type) : null;
                 if (mobTex) {
                     ctx.drawImage(mobTex, sx - size/4, sy - size, size/2, size);
                 } else {
                     ctx.fillRect(sx - size/4, sy - size, size/2, size);
                 }
             }
        });

        // Draw Vehicles
        if (this.game.vehicles) {
            this.game.vehicles.forEach(v => {
                 const dx = v.x - px;
                 const dy = v.y - py;
                 const dz = v.z - pz;

                 const rx = dx * cosY - dz * sinY;
                 const rz = dx * sinY + dz * cosY;
                 const ry = dy * cosP - rz * sinP;
                 const rz2 = dy * sinP + rz * cosP;

                 if (rz2 > 0.1) {
                     const scale = (h / 2) / Math.tan(this.game.fov * Math.PI / 360);
                     const size = (scale / rz2) * v.height; // Use height scaling
                     const width = (scale / rz2) * v.width;
                     const sx = (rx / rz2) * scale + w / 2;
                     const sy = (ry / rz2) * scale + h / 2;

                     if (v.type === 'minecart') ctx.fillStyle = '#808080';
                     else if (v.type === 'boat') ctx.fillStyle = '#8B4513';
                     else ctx.fillStyle = '#FFFFFF';

                     // Center bottom
                     ctx.fillRect(sx - width/2, sy - size, width, size);
                 }
            });
        }

        // Draw Drops
        this.game.drops.forEach(drop => {
             const dx = drop.x - px;
             const dy = drop.y - py;
             const dz = drop.z - pz;

             const rx = dx * cosY - dz * sinY;
             const rz = dx * sinY + dz * cosY;
             const ry = dy * cosP - rz * sinP;
             const rz2 = dy * sinP + rz * cosP;

             if (rz2 > 0.1) {
                 const scale = (h / 2) / Math.tan(this.game.fov * Math.PI / 360);
                 const size = (scale / rz2) * 0.3; // Small size
                 const sx = (rx / rz2) * scale + w / 2;
                 const sy = (ry / rz2) * scale + h / 2;

                 // Simple rotating cube effect (just changing width slightly)
                 const rotSize = size * (0.8 + 0.2 * Math.sin(drop.rotY));

                 const blockDef = window.BLOCKS[drop.type];
                 ctx.fillStyle = blockDef ? blockDef.color : '#FFFFFF';
                 const dropTex = this.textureManager ? this.textureManager.getBlockTexture(drop.type) : null;
                 if (dropTex) {
                     ctx.drawImage(dropTex, sx - rotSize/2, sy - size/2, rotSize, size);
                 } else {
                     ctx.fillRect(sx - rotSize/2, sy - size/2, rotSize, size);
                 }

                 // Outline
                 ctx.strokeStyle = 'black';
                 ctx.lineWidth = 1;
                 ctx.strokeRect(sx - rotSize/2, sy - size/2, rotSize, size);
             }
        });

        // Draw Particles
        if (this.game.particles && this.game.particles.particles) {
            this.game.particles.particles.forEach(p => {
                 const dx = p.x - px;
                 const dy = p.y - py;
                 const dz = p.z - pz;

                 const rx = dx * cosY - dz * sinY;
                 const rz = dx * sinY + dz * cosY;
                 const ry = dy * cosP - rz * sinP;
                 const rz2 = dy * sinP + rz * cosP;

                 if (rz2 > 0.1) {
                     const scale = (h / 2) / Math.tan(this.game.fov * Math.PI / 360);
                     const size = (scale / rz2) * p.size;
                     const sx = (rx / rz2) * scale + w / 2;
                     const sy = (ry / rz2) * scale + h / 2;

                     ctx.fillStyle = p.color || 'white';
                     ctx.fillRect(sx - size/2, sy - size/2, size, size);
                 }
            });
        }

        // Draw TNT
        this.game.tntPrimed.forEach(tnt => {
             const dx = tnt.x - px;
             const dy = tnt.y - py;
             const dz = tnt.z - pz;

             const rx = dx * cosY - dz * sinY;
             const rz = dx * sinY + dz * cosY;
             const ry = dy * cosP - rz * sinP;
             const rz2 = dy * sinP + rz * cosP;

             if (rz2 > 0.1) {
                 const scale = (h / 2) / Math.tan(this.game.fov * Math.PI / 360);
                 const size = (scale / rz2);
                 const sx = (rx / rz2) * scale + w / 2;
                 const sy = (ry / rz2) * scale + h / 2;

                 // Flash white
                 if (Math.floor(tnt.fuse * 5) % 2 === 0) ctx.fillStyle = 'white';
                 else ctx.fillStyle = 'red';

                 ctx.fillRect(sx - size/2, sy - size/2, size, size);
             }
        });

        // Draw Projectiles
        this.game.projectiles.forEach(p => {
             const dx = p.x - px;
             const dy = p.y - py;
             const dz = p.z - pz;

             const rx = dx * cosY - dz * sinY;
             const rz = dx * sinY + dz * cosY;
             const ry = dy * cosP - rz * sinP;
             const rz2 = dy * sinP + rz * cosP;

             if (rz2 > 0.1) {
                 const scale = (h / 2) / Math.tan(this.game.fov * Math.PI / 360);
                 const size = (scale / rz2) * 0.2;
                 const sx = (rx / rz2) * scale + w / 2;
                 const sy = (ry / rz2) * scale + h / 2;

                 ctx.fillStyle = 'white';
                 ctx.fillRect(sx - size/2, sy - size/2, size, size);
             }
        });

        // Draw Fishing Bobber
        if (this.game.bobber) {
             const b = this.game.bobber;
             const dx = b.x - px;
             const dy = b.y - py;
             const dz = b.z - pz;

             const rx = dx * cosY - dz * sinY;
             const rz = dx * sinY + dz * cosY;
             const ry = dy * cosP - rz * sinP;
             const rz2 = dy * sinP + rz * cosP;

             if (rz2 > 0.1) {
                 const scale = (h / 2) / Math.tan(this.game.fov * Math.PI / 360);
                 const size = (scale / rz2) * 0.2;
                 const sx = (rx / rz2) * scale + w / 2;
                 const sy = (ry / rz2) * scale + h / 2;

                 ctx.fillStyle = b.state === 'hooked' ? 'red' : 'white';
                 ctx.fillRect(sx - size/2, sy - size/2, size, size);
                 ctx.fillStyle = 'red';
                 ctx.fillRect(sx - size/2, sy - size/2, size, size/2); // Top half red

                 // Draw line from bottom right (hand approx) to bobber
                 ctx.beginPath();
                 ctx.moveTo(w * 0.7, h * 0.8); // Approx hand position
                 ctx.lineTo(sx, sy);
                 ctx.strokeStyle = '#FFFFFF';
                 ctx.lineWidth = 1;
                 ctx.stroke();
             }
        }

        // Draw Other Players
        if (this.game.network && this.game.network.otherPlayers) {
            this.game.network.otherPlayers.forEach(p => {
                 const dx = p.x - px;
                 const dy = p.y - py;
                 const dz = p.z - pz;

                 const rx = dx * cosY - dz * sinY;
                 const rz = dx * sinY + dz * cosY;
                 const ry = dy * cosP - rz * sinP;
                 const rz2 = dy * sinP + rz * cosP;

                 if (rz2 > 0.1) {
                     const scale = (h / 2) / Math.tan(this.game.fov * Math.PI / 360);
                     const size = (scale / rz2) * 1.8; // Player height
                     const sx = (rx / rz2) * scale + w / 2;
                     const sy = (ry / rz2) * scale + h / 2;

                     ctx.fillStyle = p.skinColor || 'blue';
                     ctx.fillRect(sx - size/4, sy - size, size/2, size);

                     // Name tag
                     ctx.fillStyle = 'white';
                     ctx.font = '12px Arial';
                     ctx.textAlign = 'center';
                     ctx.fillText(p.name || 'Player', sx, sy - size - 10);
                     ctx.textAlign = 'left'; // Reset
                 }
            });
        }

        // Draw Weather
        if (this.game.world.weather !== 'clear') {
            const isRain = this.game.world.weather === 'rain';
            ctx.strokeStyle = isRain ? 'rgba(100, 100, 255, 0.6)' : 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = isRain ? 1 : 2;
            ctx.beginPath();

            // Simple screen-space particles (random every frame = static noise effect, better to animate)
            // For simplicity, just random lines.
            const count = 100;
            for (let i = 0; i < count; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                const len = isRain ? 20 : 5;

                ctx.moveTo(x, y);
                ctx.lineTo(x - (isRain ? 2 : 1), y + len);
            }
            ctx.stroke();

            // Darken sky
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, w, h);
        }

        // HUD Updates
        const fpsEl = document.getElementById('fps');
        if (fpsEl) fpsEl.textContent = this.game.fps;

        const posEl = document.getElementById('position');
        if (posEl) posEl.textContent = `${Math.floor(px)}, ${Math.floor(py)}, ${Math.floor(pz)}`;

        const blockEl = document.getElementById('block-count');
        if (blockEl) blockEl.textContent = blocksToDraw.length;

        const timeEl = document.getElementById('game-time');
        if (timeEl) {
            const cycle = (this.game.gameTime % this.game.dayLength) / this.game.dayLength;
            const isDay = cycle < 0.5;
            timeEl.textContent = isDay ? 'Day' : 'Night';
        }

        if (this.game.ui) this.game.ui.updateHealthUI();

        // Breaking Indicator
        if (this.game.breaking) {
            const pct = Math.min(1, this.game.breaking.progress / this.game.breaking.limit);
            const size = 20;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(w/2 - size, h/2 - size, size*2, size*2 * pct);
            ctx.strokeStyle = 'white';
            ctx.strokeRect(w/2 - size, h/2 - size, size*2, size*2);
        }
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
}

window.Renderer = Renderer;
