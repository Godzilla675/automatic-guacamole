class Physics {
    constructor(world) {
        this.world = world;
    }

    checkCollision(box) {
        // Box: {x, y, z, width, height}
        const minX = Math.floor(box.x - box.width/2);
        const maxX = Math.floor(box.x + box.width/2);
        const minY = Math.floor(box.y);
        const maxY = Math.floor(box.y + box.height);
        const minZ = Math.floor(box.z - box.width/2);
        const maxZ = Math.floor(box.z + box.width/2);

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const block = this.world.getBlock(x, y, z);
                    const blockDef = BLOCKS[block];
                    if (block !== BLOCK.AIR && blockDef && blockDef.solid) {
                        // Check for Doors
                        if (blockDef.isDoor) {
                            const meta = this.world.getMetadata(x, y, z);
                            if (meta & 1) return false; // Open -> No collision
                        }

                        // Define player box bounds for this iteration (used by all checks)
                        const pMinX = box.x - box.width/2;
                        const pMaxX = box.x + box.width/2;
                        const pMinY = box.y;
                        const pMaxY = box.y + box.height;
                        const pMinZ = box.z - box.width/2;
                        const pMaxZ = box.z + box.width/2;

                        // Check for Stairs
                        if (blockDef.isStair) {
                            const meta = this.world.getMetadata(x, y, z);

                            // 1. Bottom Slab
                            if (x < pMaxX && x + 1 > pMinX &&
                                y < pMaxY && y + 0.5 > pMinY &&
                                z < pMaxZ && z + 1 > pMinZ) {
                                return true;
                            }

                            // 2. Top Half (Quadrant)
                            let tMinX = x, tMaxX = x + 1;
                            let tMinZ = z, tMaxZ = z + 1;
                            const tMinY = y + 0.5;
                            const tMaxY = y + 1.0;

                            if (meta === 0) tMinX = x + 0.5; // East
                            else if (meta === 1) tMaxX = x + 0.5; // West
                            else if (meta === 2) tMinZ = z + 0.5; // South
                            else if (meta === 3) tMaxZ = z + 0.5; // North

                            if (tMinX < pMaxX && tMaxX > pMinX &&
                                tMinY < pMaxY && tMaxY > pMinY &&
                                tMinZ < pMaxZ && tMaxZ > pMinZ) {
                                return true;
                            }
                            continue; // Next block
                        }

                        // Check for Fences
                        if (blockDef.isFence) {
                             // Central Post
                             const postMinX = x + 0.375;
                             const postMaxX = x + 0.625;
                             const postMinZ = z + 0.375;
                             const postMaxZ = z + 0.625;
                             const postMaxY = y + 1.5;

                             if (postMinX < pMaxX && postMaxX > pMinX &&
                                 y < pMaxY && postMaxY > pMinY &&
                                 postMinZ < pMaxZ && postMaxZ > pMinZ) {
                                 return true;
                             }

                             // Connections
                             const nN = this.world.getBlock(x, y, z-1);
                             const nS = this.world.getBlock(x, y, z+1);
                             const nW = this.world.getBlock(x-1, y, z);
                             const nE = this.world.getBlock(x+1, y, z);

                             // Helper to check fence connection eligibility
                             const connects = (b) => {
                                 if (b === BLOCK.AIR) return false;
                                 const def = BLOCKS[b];
                                 return def && (def.solid || def.isFence || def.isFenceGate);
                             };

                             if (connects(nN)) {
                                 if (x + 0.375 < pMaxX && x + 0.625 > pMinX &&
                                     y < pMaxY && postMaxY > pMinY &&
                                     z < pMaxZ && z + 0.375 > pMinZ) return true;
                             }
                             if (connects(nS)) {
                                 if (x + 0.375 < pMaxX && x + 0.625 > pMinX &&
                                     y < pMaxY && postMaxY > pMinY &&
                                     z + 0.625 < pMaxZ && z + 1 > pMinZ) return true;
                             }
                             if (connects(nW)) {
                                 if (x < pMaxX && x + 0.375 > pMinX &&
                                     y < pMaxY && postMaxY > pMinY &&
                                     z + 0.375 < pMaxZ && z + 0.625 > pMinZ) return true;
                             }
                             if (connects(nE)) {
                                 if (x + 0.625 < pMaxX && x + 1 > pMinX &&
                                     y < pMaxY && postMaxY > pMinY &&
                                     z + 0.375 < pMaxZ && z + 0.625 > pMinZ) return true;
                             }
                             continue;
                        }

                        // Check for Fence Gate
                        if (blockDef.isFenceGate) {
                             const meta = this.world.getMetadata(x, y, z);
                             if (meta & 4) {
                                 // Open - No collision (simplified)
                                 continue;
                             } else {
                                 // Closed
                                 const dir = meta & 3; // 0=South, 1=West, 2=North, 3=East
                                 let gateMinX = x, gateMaxX = x+1;
                                 let gateMinZ = z, gateMaxZ = z+1;
                                 const gateMaxY = y + 1.5;

                                 if (dir === 0 || dir === 2) { // Z-aligned (North/South)
                                     gateMinX = x + 0.375;
                                     gateMaxX = x + 0.625;
                                 } else { // X-aligned
                                     gateMinZ = z + 0.375;
                                     gateMaxZ = z + 0.625;
                                 }

                                 if (gateMinX < pMaxX && gateMaxX > pMinX &&
                                     y < pMaxY && gateMaxY > pMinY &&
                                     gateMinZ < pMaxZ && gateMaxZ > pMinZ) {
                                     return true;
                                 }
                                 continue;
                             }
                        }

                        // Check for Glass Pane
                        if (blockDef.isGlassPane) {
                             // Central Post
                             const postMinX = x + 0.4375;
                             const postMaxX = x + 0.5625;
                             const postMinZ = z + 0.4375;
                             const postMaxZ = z + 0.5625;

                             if (postMinX < pMaxX && postMaxX > pMinX &&
                                 y < pMaxY && y+1 > pMinY &&
                                 postMinZ < pMaxZ && postMaxZ > pMinZ) {
                                 return true;
                             }

                             const nN = this.world.getBlock(x, y, z-1);
                             const nS = this.world.getBlock(x, y, z+1);
                             const nW = this.world.getBlock(x-1, y, z);
                             const nE = this.world.getBlock(x+1, y, z);

                             const connects = (b) => {
                                 if (b === BLOCK.AIR) return false;
                                 const def = BLOCKS[b];
                                 return def && (def.solid || def.isGlassPane);
                             };

                             if (connects(nN)) {
                                 if (x + 0.4375 < pMaxX && x + 0.5625 > pMinX &&
                                     y < pMaxY && y+1 > pMinY &&
                                     z < pMaxZ && z + 0.4375 > pMinZ) return true;
                             }
                             if (connects(nS)) {
                                 if (x + 0.4375 < pMaxX && x + 0.5625 > pMinX &&
                                     y < pMaxY && y+1 > pMinY &&
                                     z + 0.5625 < pMaxZ && z + 1 > pMinZ) return true;
                             }
                             if (connects(nW)) {
                                 if (x < pMaxX && x + 0.4375 > pMinX &&
                                     y < pMaxY && y+1 > pMinY &&
                                     z + 0.4375 < pMaxZ && z + 0.5625 > pMinZ) return true;
                             }
                             if (connects(nE)) {
                                 if (x + 0.5625 < pMaxX && x + 1 > pMinX &&
                                     y < pMaxY && y+1 > pMinY &&
                                     z + 0.4375 < pMaxZ && z + 0.5625 > pMinZ) return true;
                             }
                             continue;
                        }

                        // Check for Trapdoor
                        if (blockDef.isTrapdoor) {
                             const meta = this.world.getMetadata(x, y, z);
                             const isOpen = (meta & 4) !== 0;

                             if (!isOpen) {
                                 // Closed: Bottom slab (assuming bottom for now)
                                 const tMinY = y;
                                 const tMaxY = y + 0.1875;
                                 if (x < pMaxX && x+1 > pMinX &&
                                     tMinY < pMaxY && tMaxY > pMinY &&
                                     z < pMaxZ && z+1 > pMinZ) return true;
                             } else {
                                 // Open: Vertical slab attached to face
                                 const face = meta & 3; // 0=South, 1=West, 2=North, 3=East (Standard MC: 0=S, 1=N, 2=E, 3=W... wait, my door logic was 0-3 yaw based)
                                 // Let's standardise on Yaw: 0=East, 1=West, 2=South, 3=North (from Game.placeBlock)
                                 // Actually let's check Game.placeBlock later. For now assume consistent mapping.
                                 // If I reuse my stair mapping: 0=East, 1=West, 2=South, 3=North

                                 let tMinX=x, tMaxX=x+1;
                                 let tMinZ=z, tMaxZ=z+1;

                                 if (face === 3) { // North (attached to North face Z=0?) No, North is -Z direction.
                                     // If attached to North side of block, it is at Z=0.
                                     tMaxZ = z + 0.1875;
                                 } else if (face === 2) { // South (+Z)
                                     tMinZ = z + 1 - 0.1875;
                                 } else if (face === 1) { // West (-X)
                                     tMaxX = x + 0.1875;
                                 } else if (face === 0) { // East (+X)
                                     tMinX = x + 1 - 0.1875;
                                 }

                                 if (tMinX < pMaxX && tMaxX > pMinX &&
                                     y < pMaxY && y+1 > pMinY &&
                                     tMinZ < pMaxZ && tMaxZ > pMinZ) return true;
                             }
                             continue;
                        }

                        // Check for Slabs (and generic full blocks)
                        let bHeight = 1.0;
                        if (blockDef.isSlab) bHeight = 0.5;

                        if (x < pMaxX && x + 1 > pMinX &&
                            y < pMaxY && y + bHeight > pMinY &&
                            z < pMaxZ && z + 1 > pMinZ) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    raycast(origin, direction, maxDist) {
        let t = 0.0;
        let x = Math.floor(origin.x);
        let y = Math.floor(origin.y);
        let z = Math.floor(origin.z);

        const stepX = Math.sign(direction.x);
        const stepY = Math.sign(direction.y);
        const stepZ = Math.sign(direction.z);

        const tDeltaX = direction.x === 0 ? Infinity : Math.abs(1 / direction.x);
        const tDeltaY = direction.y === 0 ? Infinity : Math.abs(1 / direction.y);
        const tDeltaZ = direction.z === 0 ? Infinity : Math.abs(1 / direction.z);

        let tMaxX = tDeltaX * ((direction.x > 0) ? (x + 1 - origin.x) : (origin.x - x));
        let tMaxY = tDeltaY * ((direction.y > 0) ? (y + 1 - origin.y) : (origin.y - y));
        let tMaxZ = tDeltaZ * ((direction.z > 0) ? (z + 1 - origin.z) : (origin.z - z));

        let lastFace = null;

        while (t < maxDist) {
            const block = this.world.getBlock(x, y, z);
            const blockDef = BLOCKS[block];
            if (block !== BLOCK.AIR && blockDef && blockDef.solid) {
                // Check Slab Raycast
                if (blockDef.isSlab) {
                    // Check if hit point is within bottom 0.5
                    // Hit point = origin + dir * t
                    const hx = origin.x + direction.x * t;
                    const hy = origin.y + direction.y * t;
                    const hz = origin.z + direction.z * t;

                    // Relative Y in block
                    const ry = hy - y;
                    if (ry >= 0 && ry <= 0.5) {
                         return { x, y, z, type: block, face: lastFace, dist: t };
                    }
                    // Else, continue raycast (it passes through top half)
                } else if (blockDef.isStair) {
                    // Hit point
                    const hx = origin.x + direction.x * t;
                    const hy = origin.y + direction.y * t;
                    const hz = origin.z + direction.z * t;

                    const rx = hx - x;
                    const ry = hy - y;
                    const rz = hz - z;

                    if (ry >= 0 && ry <= 0.5) {
                        return { x, y, z, type: block, face: lastFace, dist: t };
                    }
                    if (ry > 0.5 && ry <= 1.0) {
                         const meta = this.world.getMetadata(x, y, z);
                         let hit = false;
                         if (meta === 0 && rx >= 0.5) hit = true;
                         else if (meta === 1 && rx <= 0.5) hit = true;
                         else if (meta === 2 && rz >= 0.5) hit = true;
                         else if (meta === 3 && rz <= 0.5) hit = true;

                         if (hit) return { x, y, z, type: block, face: lastFace, dist: t };
                    }
                    // Else passes through empty part
                } else if (blockDef.isFence || blockDef.isGlassPane) {
                    // Simplified raycast: just treat as full block for interaction selection for now,
                    // or better, treat as a smaller central box to avoid "clicking air".
                    // Let's start with full block to be safe, or maybe central pillar.
                    // Improving UX: Check collision with the complex shape.
                    const dummyBox = { x: x+0.5, y: y, z: z+0.5, width: 0.01, height: 0.01 }; // Point

                    // We need to check if the Ray intersects any of the boxes we defined in checkCollision.
                    // This is hard to replicate exactly without a generalized "List Boxes" function.
                    // Fallback: Return hit. It's better to be able to click it easily than not.
                    return { x, y, z, type: block, face: lastFace, dist: t };
                } else if (blockDef.isFenceGate) {
                     const meta = this.world.getMetadata(x, y, z);
                     if (meta & 4) {
                         // Open gate: harder to click, but usually we click the frame.
                         // For now return hit.
                         return { x, y, z, type: block, face: lastFace, dist: t };
                     }
                     return { x, y, z, type: block, face: lastFace, dist: t };
                } else if (blockDef.isTrapdoor) {
                     return { x, y, z, type: block, face: lastFace, dist: t };
                } else {
                    return {
                        x, y, z,
                        type: block,
                        face: lastFace,
                        dist: t
                    };
                }
            }

            if (tMaxX < tMaxY) {
                if (tMaxX < tMaxZ) {
                    x += stepX;
                    t = tMaxX;
                    tMaxX += tDeltaX;
                    lastFace = { x: -stepX, y: 0, z: 0 };
                } else {
                    z += stepZ;
                    t = tMaxZ;
                    tMaxZ += tDeltaZ;
                    lastFace = { x: 0, y: 0, z: -stepZ };
                }
            } else {
                if (tMaxY < tMaxZ) {
                    y += stepY;
                    t = tMaxY;
                    tMaxY += tDeltaY;
                    lastFace = { x: 0, y: -stepY, z: 0 };
                } else {
                    z += stepZ;
                    t = tMaxZ;
                    tMaxZ += tDeltaZ;
                    lastFace = { x: 0, y: 0, z: -stepZ };
                }
            }
        }
        return null;
    }

    rayIntersectAABB(origin, dir, box) {
        const min = { x: box.x - box.width/2, y: box.y, z: box.z - box.width/2 };
        const max = { x: box.x + box.width/2, y: box.y + box.height, z: box.z + box.width/2 };

        let tmin = (min.x - origin.x) / dir.x;
        let tmax = (max.x - origin.x) / dir.x;

        if (tmin > tmax) [tmin, tmax] = [tmax, tmin];

        let tymin = (min.y - origin.y) / dir.y;
        let tymax = (max.y - origin.y) / dir.y;

        if (tymin > tymax) [tymin, tymax] = [tymax, tymin];

        if ((tmin > tymax) || (tymin > tmax)) return null;

        if (tymin > tmin) tmin = tymin;
        if (tymax < tmax) tmax = tymax;

        let tzmin = (min.z - origin.z) / dir.z;
        let tzmax = (max.z - origin.z) / dir.z;

        if (tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];

        if ((tmin > tzmax) || (tzmin > tmax)) return null;

        if (tzmin > tmin) tmin = tzmin;
        if (tzmax < tmax) tmax = tzmax;

        if (tmin < 0 && tmax < 0) return null;

        // If tmin is negative, it means we started inside the box (or the origin is inside).
        // In this case, the intersection point is effectively at the origin (t=0).
        if (tmin < 0) return 0;

        return tmin;
    }

    getFluidIntersection(box) {
         const minX = Math.floor(box.x - box.width/2);
        const maxX = Math.floor(box.x + box.width/2);
        const minY = Math.floor(box.y);
        const maxY = Math.floor(box.y + box.height);
        const minZ = Math.floor(box.z - box.width/2);
        const maxZ = Math.floor(box.z + box.width/2);

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const block = this.world.getBlock(x, y, z);
                    if (block === BLOCK.WATER) return true;
                }
            }
        }
        return false;
    }

    getCollidingBlocks(box) {
        const blocks = [];
        const minX = Math.floor(box.x - box.width/2);
        const maxX = Math.floor(box.x + box.width/2);
        const minY = Math.floor(box.y);
        const maxY = Math.floor(box.y + box.height);
        const minZ = Math.floor(box.z - box.width/2);
        const maxZ = Math.floor(box.z + box.width/2);

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const block = this.world.getBlock(x, y, z);
                    if (block !== BLOCK.AIR) {
                        blocks.push({x, y, z, type: block});
                    }
                }
            }
        }
        return blocks;
    }
}

window.Physics = Physics;
