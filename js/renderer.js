class Renderer {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
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

    render() {
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);
        const ctx = this.ctx;

        // Sky
        const brightness = this.game.sunBrightness;
        const skyR = Math.floor(135 * brightness);
        const skyG = Math.floor(206 * brightness);
        const skyB = Math.floor(235 * brightness);
        ctx.fillStyle = `rgb(${skyR},${skyG},${skyB})`;
        ctx.fillRect(0, 0, w, h);

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

        const renderDist = 50; // View distance in blocks

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
                        } else if (blockDef && blockDef.isDoor) {
                             const meta = chunk.getMetadata(b.x, b.y, b.z);
                             // Shift center based on orientation
                             let offX = 0, offZ = 0;
                             const orient = meta & 3;
                             if (orient === 0) offX = 0.4; // East
                             else if (orient === 1) offX = -0.4; // West
                             else if (orient === 2) offZ = 0.4; // South
                             else if (orient === 3) offZ = -0.4; // North

                             const dx2 = dx + offX;
                             const dz2 = dz + offZ;

                             const rx2 = dx2 * cosY - dz2 * sinY;
                             const rz2_door = dx2 * sinY + dz2 * cosY;
                             const ry2 = dy * cosP - rz2_door * sinP;
                             const rz2_door_depth = dy * sinP + rz2_door * cosP;

                             blocksToDraw.push({
                                 type: b.type,
                                 rx: rx2, ry: ry2, rz: rz2_door_depth,
                                 dist,
                                 light: chunk.getLight(b.x, b.y, b.z),
                                 metadata: meta,
                                 isDoor: true
                             });
                        } else {
                            blocksToDraw.push({
                                type: b.type,
                                rx, ry: ry, rz: rz2,
                                dist,
                                light: chunk.getLight(b.x, b.y, b.z),
                                metadata: chunk.getMetadata(b.x, b.y, b.z)
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
                 }
                 // We could adjust brightness by b.light (0-15)
                 // let lightMult = b.light / 15;
                 // ctx.fillStyle = this.adjustColor(blockDef.color, lightMult);

                 ctx.fillRect(Math.floor(sx - size/2), Math.floor(drawSy - drawHeight/2), Math.ceil(size), Math.ceil(drawHeight));
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
                 ctx.fillRect(sx - size/4, sy - size, size/2, size);
             }
        });

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
                 ctx.fillRect(sx - rotSize/2, sy - size/2, rotSize, size);

                 // Outline
                 ctx.strokeStyle = 'black';
                 ctx.lineWidth = 1;
                 ctx.strokeRect(sx - rotSize/2, sy - size/2, rotSize, size);
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

                     ctx.fillStyle = 'blue';
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
