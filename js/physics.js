class Physics {
    constructor(world) {
        this.world = world;
    }

    checkCollision(box) {
        // Box: {x, y, z, width, height}
        const minX = Math.floor(box.x - box.width/2);
        const maxX = Math.floor(box.x + box.width/2);
        // Expand search down by 1 to catch 1.5 high fences
        const minY = Math.floor(box.y) - 1;
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

                        // Check for Trapdoors
                        if (blockDef.isTrapdoor) {
                            const meta = this.world.getMetadata(x, y, z);
                            if (meta & 1) return false; // Open -> No collision (simplified)
                            // Closed -> Bottom 0.2 height
                             const pMinX = box.x - box.width/2;
                            const pMaxX = box.x + box.width/2;
                            const pMinY = box.y;
                            const pMaxY = box.y + box.height;
                            const pMinZ = box.z - box.width/2;
                            const pMaxZ = box.z + box.width/2;

                            if (x < pMaxX && x + 1 > pMinX &&
                                y < pMaxY && y + 0.2 > pMinY &&
                                z < pMaxZ && z + 1 > pMinZ) {
                                return true;
                            }
                            continue;
                        }

                        // Check for Fence/Gate
                        if (blockDef.isFence || blockDef.isGate) {
                            const meta = this.world.getMetadata(x, y, z);
                            if (blockDef.isGate && (meta & 1)) return false; // Open gate -> No collision

                            // Fence/Closed Gate: 1.5 Height
                            const pMinX = box.x - box.width/2;
                            const pMaxX = box.x + box.width/2;
                            const pMinY = box.y;
                            const pMaxY = box.y + box.height;
                            const pMinZ = box.z - box.width/2;
                            const pMaxZ = box.z + box.width/2;

                            // Center post collision approx (0.25 to 0.75)?
                            // For simplicity, full width but 1.5 height for now to block movement effectively
                            if (x < pMaxX && x + 1 > pMinX &&
                                y < pMaxY && y + 1.5 > pMinY &&
                                z < pMaxZ && z + 1 > pMinZ) {
                                return true;
                            }
                            continue;
                        }

                        // Check for Glass Pane
                        if (blockDef.isPane) {
                             const pMinX = box.x - box.width/2;
                            const pMaxX = box.x + box.width/2;
                            const pMinY = box.y;
                            const pMaxY = box.y + box.height;
                            const pMinZ = box.z - box.width/2;
                            const pMaxZ = box.z + box.width/2;

                            // Center thin box (0.375 to 0.625)
                            const tMinX = x + 0.375;
                            const tMaxX = x + 0.625;
                            const tMinZ = z + 0.375;
                            const tMaxZ = z + 0.625;

                            if (tMinX < pMaxX && tMaxX > pMinX &&
                                y < pMaxY && y + 1 > pMinY &&
                                tMinZ < pMaxZ && tMaxZ > pMinZ) {
                                return true;
                            }
                            continue;
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
                } else if (blockDef.isTrapdoor) {
                    const meta = this.world.getMetadata(x, y, z);
                    const hx = origin.x + direction.x * t;
                    const hy = origin.y + direction.y * t;
                    const hz = origin.z + direction.z * t;
                    const ry = hy - y;

                    if (meta & 1) { // Open
                        return { x, y, z, type: block, face: lastFace, dist: t }; // Full block for open for now
                    } else { // Closed
                        if (ry >= 0 && ry <= 0.2) return { x, y, z, type: block, face: lastFace, dist: t };
                    }
                } else if (blockDef.isFence || blockDef.isGate) {
                    const meta = this.world.getMetadata(x, y, z);
                    if (blockDef.isGate && (meta & 1)) {
                         // Open gate - allow raycast to pass?
                         // If we want to be able to close it, we must hit it.
                         // But if we want to walk through and interact with blocks behind?
                         // Let's treat it as side posts?
                         // For simplicity, treat open gate as NO HIT (like air) except for the frame?
                         // To close it, we might need to hit the frame.
                         // Frame is at x or z edges.
                         // Simplified: Treat open gate as AIR for raycast (interact with block below to close? No).
                         // Treat as thin frame?
                         return { x, y, z, type: block, face: lastFace, dist: t }; // Full Hit for now
                    }
                    const hx = origin.x + direction.x * t;
                    const hz = origin.z + direction.z * t;
                    const rx = hx - x;
                    const rz = hz - z;
                    // Center post 0.375 - 0.625
                    if (rx >= 0.375 && rx <= 0.625 && rz >= 0.375 && rz <= 0.625) {
                        return { x, y, z, type: block, face: lastFace, dist: t };
                    }
                    // TODO: Check connections?
                    // For now, center post only.
                } else if (blockDef.isPane) {
                     const hx = origin.x + direction.x * t;
                    const hz = origin.z + direction.z * t;
                    const rx = hx - x;
                    const rz = hz - z;
                    // Center post/pane
                    if ((rx >= 0.375 && rx <= 0.625) || (rz >= 0.375 && rz <= 0.625)) {
                        return { x, y, z, type: block, face: lastFace, dist: t };
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
