class Physics {
    constructor(world) {
        this.world = world;
    }

    checkCollision(box) {
        // Box: {x, y, z, width, height}
        const minX = Math.floor(box.x - box.width/2);
        const maxX = Math.floor(box.x + box.width/2);
        const minY = Math.floor(box.y) - 1; // Check 1 block below for tall blocks (fences)
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
                            if (meta & 4) return false; // Open -> No collision (Bit 2)

                            // Closed Door Collision (Thin Slab)
                            const thickness = 0.1875;
                            const orient = meta & 3; // Bits 0-1

                            // Default full block if unknown, but let's try to match orientation
                            let dMinX = x, dMaxX = x + 1;
                            let dMinZ = z, dMaxZ = z + 1;

                            if (orient === 0) dMaxX = x + thickness; // West Side (Face East?)
                            else if (orient === 1) dMinX = x + 1 - thickness; // East Side
                            else if (orient === 2) dMaxZ = z + thickness; // North Side
                            else if (orient === 3) dMinZ = z + 1 - thickness; // South Side

                            const pMinX = box.x - box.width/2;
                            const pMaxX = box.x + box.width/2;
                            const pMinY = box.y;
                            const pMaxY = box.y + box.height;
                            const pMinZ = box.z - box.width/2;
                            const pMaxZ = box.z + box.width/2;

                            if (dMinX < pMaxX && dMaxX > pMinX &&
                                y < pMaxY && y + 1 > pMinY &&
                                dMinZ < pMaxZ && dMaxZ > pMinZ) {
                                return true;
                            }
                            continue; // Processed door, move to next block
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

                        // Check for Fences / Panes
                        if (blockDef.isFence || blockDef.isPane) {
                            // Simplified: Center post collision
                            // Assume 0.375 width (center 0.25 is 0.375 to 0.625)
                            const pMinX = box.x - box.width/2;
                            const pMaxX = box.x + box.width/2;
                            const pMinY = box.y;
                            const pMaxY = box.y + box.height;
                            const pMinZ = box.z - box.width/2;
                            const pMaxZ = box.z + box.width/2;

                            const postMin = 0.375;
                            const postMax = 0.625;

                            if (x + postMin < pMaxX && x + postMax > pMinX &&
                                y < pMaxY && y + 1.5 > pMinY && // Fences are often 1.5 high
                                z + postMin < pMaxZ && z + postMax > pMinZ) {
                                return true;
                            }
                            continue;
                        }

                        // Check for Trapdoors
                        if (blockDef.isTrapdoor) {
                            const meta = this.world.getMetadata(x, y, z);
                            const open = (meta & 4) !== 0;
                            const top = (meta & 8) !== 0;

                            const pMinX = box.x - box.width/2;
                            const pMaxX = box.x + box.width/2;
                            const pMinY = box.y;
                            const pMaxY = box.y + box.height;
                            const pMinZ = box.z - box.width/2;
                            const pMaxZ = box.z + box.width/2;

                            if (open) {
                                // Open: attached to side, full height (1.0), thickness 0.1875
                                return false; // Passable when open
                            } else {
                                // Closed: Flat slab at bottom or top
                                const thickness = 0.1875;
                                let bMinY = y;
                                let bMaxY = y + thickness;
                                if (top) {
                                    bMinY = y + 1.0 - thickness;
                                    bMaxY = y + 1.0;
                                }

                                if (x < pMaxX && x + 1 > pMinX &&
                                    bMinY < pMaxY && bMaxY > pMinY &&
                                    z < pMaxZ && z + 1 > pMinZ) {
                                    return true;
                                }
                            }
                            continue;
                        }

                        // Check for Fence Gates
                        if (blockDef.isGate) {
                            const meta = this.world.getMetadata(x, y, z);
                            const open = (meta & 4) !== 0;
                            if (open) return false;

                             // Closed: similar to fence
                             const pMinX = box.x - box.width/2;
                            const pMaxX = box.x + box.width/2;
                            const pMinY = box.y;
                            const pMaxY = box.y + box.height;
                            const pMinZ = box.z - box.width/2;
                            const pMaxZ = box.z + box.width/2;

                            const postMin = 0.375;
                            const postMax = 0.625;

                            if (x + postMin < pMaxX && x + postMax > pMinX &&
                                y < pMaxY && y + 1.5 > pMinY &&
                                z + postMin < pMaxZ && z + postMax > pMinZ) {
                                return true;
                            }
                            continue;
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
                         return { x, y, z, type: block, face: lastFace, dist: t, point: {x: hx, y: hy, z: hz} };
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
                        return { x, y, z, type: block, face: lastFace, dist: t, point: {x: hx, y: hy, z: hz} };
                    }
                    if (ry > 0.5 && ry <= 1.0) {
                         const meta = this.world.getMetadata(x, y, z);
                         let hit = false;
                         if (meta === 0 && rx >= 0.5) hit = true;
                         else if (meta === 1 && rx <= 0.5) hit = true;
                         else if (meta === 2 && rz >= 0.5) hit = true;
                         else if (meta === 3 && rz <= 0.5) hit = true;

                         if (hit) return { x, y, z, type: block, face: lastFace, dist: t, point: {x: hx, y: hy, z: hz} };
                    }
                    // Else passes through empty part
                } else if (blockDef.isFence || blockDef.isPane) {
                    // Check Center Post
                    const hx = origin.x + direction.x * t;
                    const hz = origin.z + direction.z * t;
                    const rx = hx - x;
                    const rz = hz - z;

                    if (rx >= 0.375 && rx <= 0.625 && rz >= 0.375 && rz <= 0.625) {
                         return { x, y, z, type: block, face: lastFace, dist: t, point: {x: hx, y: origin.y + direction.y * t, z: hz} };
                    }
                    // Pass through side parts for now (simplified selection)
                } else if (blockDef.isTrapdoor) {
                    const hx = origin.x + direction.x * t;
                    const hy = origin.y + direction.y * t;
                    const hz = origin.z + direction.z * t;
                    const ry = hy - y;

                    const meta = this.world.getMetadata(x, y, z);
                    const open = (meta & 4) !== 0;
                    const top = (meta & 8) !== 0;

                    if (open) {
                        return { x, y, z, type: block, face: lastFace, dist: t, point: {x: hx, y: hy, z: hz} };
                    } else {
                        const thickness = 0.1875;
                        if (top) {
                            if (ry >= 1.0 - thickness && ry <= 1.0) return { x, y, z, type: block, face: lastFace, dist: t, point: {x: hx, y: hy, z: hz} };
                        } else {
                            if (ry >= 0 && ry <= thickness) return { x, y, z, type: block, face: lastFace, dist: t, point: {x: hx, y: hy, z: hz} };
                        }
                    }
                } else {
                    return {
                        x, y, z,
                        type: block,
                        face: lastFace,
                        dist: t,
                        point: {
                            x: origin.x + direction.x * t,
                            y: origin.y + direction.y * t,
                            z: origin.z + direction.z * t
                        }
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

    raycastEntities(origin, dir, entities) {
        let closest = null;
        let minDist = Infinity;

        entities.forEach(entity => {
            if (entity.isDead) return;
            const box = { x: entity.x, y: entity.y, z: entity.z, width: entity.width, height: entity.height };
            const t = this.rayIntersectAABB(origin, dir, box);
            if (t !== null && t < minDist) {
                minDist = t;
                closest = entity;
            }
        });

        return { entity: closest, dist: minDist };
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
