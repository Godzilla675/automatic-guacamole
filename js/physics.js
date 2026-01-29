class Physics {
    constructor(world) {
        this.world = world;
    }

    checkCollision(box) {
        // Box: {x, y, z, width, height}
        const minX = Math.floor(box.x - box.width/2);
        const maxX = Math.floor(box.x + box.width/2);
        const minY = Math.floor(box.y) - 1; // Check one block below for fences/walls
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

                        // Check for Stairs
                        if (blockDef.isStair) {
                            const meta = this.world.getMetadata(x, y, z);
                            const pMinX = box.x - box.width/2;
                            const pMaxX = box.x + box.width/2;
                            const pMinY = box.y;
                            const pMaxY = box.y + box.height;
                            const pMinZ = box.z - box.width/2;
                            const pMaxZ = box.z + box.width/2;

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

                        // Check for Slabs
                        let bHeight = 1.0;
                        if (blockDef.isSlab) bHeight = 0.5;

                        const pMinX = box.x - box.width/2;
                        const pMaxX = box.x + box.width/2;
                        const pMinY = box.y;
                        const pMaxY = box.y + box.height;
                        const pMinZ = box.z - box.width/2;
                        const pMaxZ = box.z + box.width/2;

                        // Generic Cube/Slab Check
                        // Skip if it's a special block that handles its own collision entirely
                        if (!blockDef.isFence && !blockDef.isFenceGate && !blockDef.isTrapdoor && !blockDef.isPane) {
                            if (x < pMaxX && x + 1 > pMinX &&
                                y < pMaxY && y + bHeight > pMinY &&
                                z < pMaxZ && z + 1 > pMinZ) {
                                return true;
                            }
                        }

                        // Check for Fences (1.5 height, 0.5 width center)
                        if (blockDef.isFence) {
                             const cx = x + 0.25;
                             const cw = 0.5;
                             const cy = y;
                             const ch = 1.5;
                             const cz = z + 0.25;
                             const cd = 0.5;

                             if (x + 0.25 < pMaxX && x + 0.75 > pMinX &&
                                 y < pMaxY && y + 1.5 > pMinY &&
                                 z + 0.25 < pMaxZ && z + 0.75 > pMinZ) {
                                 return true;
                             }
                        }

                        // Check for Fence Gates
                        if (blockDef.isFenceGate) {
                            const meta = this.world.getMetadata(x, y, z);
                            if (!(meta & 4)) { // Closed
                                const dir = meta & 3; // 0=S, 1=W, 2=N, 3=E
                                let minBx = x, maxBx = x+1;
                                let minBz = z, maxBz = z+1;

                                if (dir === 0 || dir === 2) { // NS -> Thickness in X
                                    minBx = x + 0.375; maxBx = x + 0.625;
                                } else { // EW -> Thickness in Z
                                    minBz = z + 0.375; maxBz = z + 0.625;
                                }

                                if (minBx < pMaxX && maxBx > pMinX &&
                                    y < pMaxY && y + 1.5 > pMinY &&
                                    minBz < pMaxZ && maxBz > pMinZ) {
                                    return true;
                                }
                            }
                        }

                        // Check for Trapdoors
                        if (blockDef.isTrapdoor) {
                             const meta = this.world.getMetadata(x, y, z);
                             const isOpen = meta & 4;
                             const isTop = meta & 8;
                             const dir = meta & 3; // 0=E, 1=W, 2=S, 3=N

                             let tMinX=x, tMaxX=x+1, tMinY=y, tMaxY=y+1, tMinZ=z, tMaxZ=z+1;
                             const thickness = 0.1875;

                             if (!isOpen) {
                                 if (isTop) {
                                     tMinY = y + 1 - thickness;
                                 } else {
                                     tMaxY = y + thickness;
                                 }
                             } else {
                                 // Open: Against the hinge
                                 if (dir === 0) { // East Hinge -> Box at x
                                     tMaxX = x + thickness;
                                 } else if (dir === 1) { // West Hinge -> Box at x+1-thick
                                     tMinX = x + 1 - thickness;
                                 } else if (dir === 2) { // South Hinge -> Box at z
                                     tMaxZ = z + thickness;
                                 } else if (dir === 3) { // North Hinge -> Box at z+1-thick
                                     tMinZ = z + 1 - thickness;
                                 }
                             }

                             if (tMinX < pMaxX && tMaxX > pMinX &&
                                 tMinY < pMaxY && tMaxY > pMinY &&
                                 tMinZ < pMaxZ && tMaxZ > pMinZ) {
                                 return true;
                             }
                        }

                        // Glass Pane
                        if (blockDef.isPane) {
                             // Center pillar
                             if (x + 0.375 < pMaxX && x + 0.625 > pMinX &&
                                 y < pMaxY && y + 1.0 > pMinY &&
                                 z + 0.375 < pMaxZ && z + 0.625 > pMinZ) {
                                 return true;
                             }
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
                } else if (blockDef.isFence) {
                    const box = { x: x + 0.5, y: y + 0.75, z: z + 0.5, width: 0.25, height: 1.5 };
                    const tInt = this.rayIntersectAABB(origin, direction, box);
                    if (tInt !== null && tInt <= maxDist) {
                         return { x, y, z, type: block, face: lastFace, dist: tInt };
                    }
                } else if (blockDef.isFenceGate) {
                    const meta = this.world.getMetadata(x, y, z);
                    // Hit detection allows interaction
                    const tInt = this.rayIntersectAABB(origin, direction, {x: x+0.5, y: y+0.75, z: z+0.5, width: 1.0, height: 1.5});
                    if (tInt !== null && tInt <= maxDist) {
                        return { x, y, z, type: block, face: lastFace, dist: tInt };
                    }
                } else if (blockDef.isTrapdoor) {
                    const meta = this.world.getMetadata(x, y, z);
                    const isOpen = meta & 4;
                    const isTop = meta & 8;
                    const dir = meta & 3;
                    const th = 0.1875;

                    let minX=x, maxX=x+1, minY=y, maxY=y+1, minZ=z, maxZ=z+1;

                    if (!isOpen) {
                        if (isTop) minY = y + 1 - th;
                        else maxY = y + th;
                    } else {
                         if (dir === 0) maxX = x + th;
                         else if (dir === 1) minX = x + 1 - th;
                         else if (dir === 2) maxZ = z + th;
                         else if (dir === 3) minZ = z + 1 - th;
                    }

                    const bounds = { min: {x: minX, y: minY, z: minZ}, max: {x: maxX, y: maxY, z: maxZ} };
                    const tHit = this.rayIntersectBounds(origin, direction, bounds);

                    if (tHit !== null && tHit <= maxDist) {
                        return { x, y, z, type: block, face: lastFace, dist: tHit };
                    }
                } else if (blockDef.isPane) {
                     const box = { x: x + 0.5, y: y + 0.5, z: z + 0.5, width: 0.25, height: 1.0 };
                     const tHit = this.rayIntersectAABB(origin, direction, box);
                     if (tHit !== null && tHit <= maxDist) {
                         return { x, y, z, type: block, face: lastFace, dist: tHit };
                     }
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

    rayIntersectBounds(origin, dir, bounds) {
        let tmin = (bounds.min.x - origin.x) / dir.x;
        let tmax = (bounds.max.x - origin.x) / dir.x;

        if (tmin > tmax) [tmin, tmax] = [tmax, tmin];

        let tymin = (bounds.min.y - origin.y) / dir.y;
        let tymax = (bounds.max.y - origin.y) / dir.y;

        if (tymin > tymax) [tymin, tymax] = [tymax, tymin];

        if ((tmin > tymax) || (tymin > tmax)) return null;

        if (tymin > tmin) tmin = tymin;
        if (tymax < tmax) tmax = tymax;

        let tzmin = (bounds.min.z - origin.z) / dir.z;
        let tzmax = (bounds.max.z - origin.z) / dir.z;

        if (tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];

        if ((tmin > tzmax) || (tzmin > tmax)) return null;

        if (tzmin > tmin) tmin = tzmin;
        if (tzmax < tmax) tmax = tzmax;

        if (tmin < 0) {
            if (tmax < 0) return null;
            return 0;
        }

        return tmin;
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
