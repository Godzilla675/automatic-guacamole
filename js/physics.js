class Physics {
    constructor(world) {
        this.world = world;
    }

    getBlockBoundingBox(x, y, z) {
        const block = this.world.getBlock(x, y, z);
        const blockDef = BLOCKS[block];
        if (!block || block === BLOCK.AIR || !blockDef || !blockDef.solid) {
            return null;
        }

        const meta = this.world.getMetadata(x, y, z);
        if (blockDef.isSlab) {
            const isTop = (meta & 8) !== 0;
            return {
                minX: x, maxX: x + 1,
                minY: isTop ? y + 0.5 : y, maxY: isTop ? y + 1.0 : y + 0.5,
                minZ: z, maxZ: z + 1
            };
        }

        if (blockDef.isStair) {
            const isUpsideDown = (meta & 4) !== 0;
            return {
                minX: x, maxX: x + 1,
                minY: y, maxY: y + 1,
                minZ: z, maxZ: z + 1
            };
        }

        if (blockDef.isFence) {
            return {
                minX: x + 0.375, maxX: x + 0.625,
                minY: y, maxY: y + 1.5,
                minZ: z + 0.375, maxZ: z + 0.625
            };
        }

        return {
            minX: x, maxX: x + 1,
            minY: y, maxY: y + 1,
            minZ: z, maxZ: z + 1
        };
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
                            if (meta & 4) {
                                // Open Door Collision (Thin Slab)
                                const thickness = 0.1875;
                                const orient = meta & 3; // Bits 0-1

                                let dMinX = x, dMaxX = x + 1;
                                let dMinZ = z, dMaxZ = z + 1;

                                if (orient === 0) { dMinZ = z + 1 - thickness; dMaxZ = z + 1; } // West Side -> Open to North
                                else if (orient === 1) { dMinZ = z; dMaxZ = z + thickness; } // East Side -> Open to South
                                else if (orient === 2) { dMinX = x + 1 - thickness; dMaxX = x + 1; } // North Side -> Open to East
                                else if (orient === 3) { dMinX = x; dMaxX = x + thickness; } // South Side -> Open to West

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
                                continue;
                            } // proceed to next block

                            // Closed Door Collision (Thin Slab)
                            const thickness = 0.1875;
                            const orient = meta & 3; // Bits 0-1

                            // Default full block if unknown, but let's try to match orientation
                            let dMinX = x, dMaxX = x + 1;
                            let dMinZ = z, dMaxZ = z + 1;

                            if (orient === 0) { dMinX = x; dMaxX = x + thickness; } // West Side
                            else if (orient === 1) { dMinX = x + 1 - thickness; dMaxX = x + 1; } // East Side
                            else if (orient === 2) { dMinZ = z; dMaxZ = z + thickness; } // North Side
                            else if (orient === 3) { dMinZ = z + 1 - thickness; dMaxZ = z + 1; } // South Side

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

                            const isUpsideDown = (meta & 4) !== 0;
                            const dir = meta & 3;

                            // 1. Base Slab (Bottom half if normal, Top half if upside down)
                            const baseMinY = isUpsideDown ? y + 0.5 : y;
                            const baseMaxY = isUpsideDown ? y + 1.0 : y + 0.5;

                            if (x < pMaxX && x + 1 > pMinX &&
                                baseMinY < pMaxY && baseMaxY > pMinY &&
                                z < pMaxZ && z + 1 > pMinZ) {
                                return true;
                            }

                            // 2. Step Half (Quadrant)
                            let stepMinX = x, stepMaxX = x + 1;
                            let stepMinZ = z, stepMaxZ = z + 1;
                            const stepMinY = isUpsideDown ? y : y + 0.5;
                            const stepMaxY = isUpsideDown ? y + 0.5 : y + 1.0;

                            if (dir === 0) stepMinX = x + 0.5; // East step
                            else if (dir === 1) stepMaxX = x + 0.5; // West step
                            else if (dir === 2) stepMinZ = z + 0.5; // South step
                            else if (dir === 3) stepMaxZ = z + 0.5; // North step

                            if (stepMinX < pMaxX && stepMaxX > pMinX &&
                                stepMinY < pMaxY && stepMaxY > pMinY &&
                                stepMinZ < pMaxZ && stepMaxZ > pMinZ) {
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
                        let bMinY = y;
                        let bMaxY = y + 1.0;
                        if (blockDef.isSlab) {
                            const meta = this.world.getMetadata(x, y, z);
                            const isTop = (meta & 8) !== 0;
                            bMinY = isTop ? y + 0.5 : y;
                            bMaxY = isTop ? y + 1.0 : y + 0.5;
                        }

                        const pMinX = box.x - box.width/2;
                        const pMaxX = box.x + box.width/2;
                        const pMinY = box.y;
                        const pMaxY = box.y + box.height;
                        const pMinZ = box.z - box.width/2;
                        const pMaxZ = box.z + box.width/2;

                        if (x < pMaxX && x + 1 > pMinX &&
                            bMinY < pMaxY && bMaxY > pMinY &&
                            z < pMaxZ && z + 1 > pMinZ) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    raycastSubBox(origin, direction, tEntry, tExit, boxMin, boxMax) {
        if (direction.x === 0 && (origin.x < boxMin.x || origin.x > boxMax.x)) return null;
        if (direction.y === 0 && (origin.y < boxMin.y || origin.y > boxMax.y)) return null;
        if (direction.z === 0 && (origin.z < boxMin.z || origin.z > boxMax.z)) return null;

        let tMinX = direction.x === 0 ? -Infinity : (boxMin.x - origin.x) / direction.x;
        let tMaxX = direction.x === 0 ? Infinity : (boxMax.x - origin.x) / direction.x;
        if (tMinX > tMaxX) [tMinX, tMaxX] = [tMaxX, tMinX];

        let tMinY = direction.y === 0 ? -Infinity : (boxMin.y - origin.y) / direction.y;
        let tMaxY = direction.y === 0 ? Infinity : (boxMax.y - origin.y) / direction.y;
        if (tMinY > tMaxY) [tMinY, tMaxY] = [tMaxY, tMinY];

        let tMinZ = direction.z === 0 ? -Infinity : (boxMin.z - origin.z) / direction.z;
        let tMaxZ = direction.z === 0 ? Infinity : (boxMax.z - origin.z) / direction.z;
        if (tMinZ > tMaxZ) [tMinZ, tMaxZ] = [tMaxZ, tMinZ];

        const tNear = Math.max(tEntry, tMinX, tMinY, tMinZ);
        const tFar = Math.min(tExit, tMaxX, tMaxY, tMaxZ);

        if (tNear <= tFar && tNear >= 0) {
            return tNear;
        }
        return null;
    }

    raycast(origin, direction, maxDist, includeLiquids = false) {
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

        let nx = 0, ny = 0, nz = 0;

        while (t < maxDist) {
            const block = this.world.getBlock(x, y, z);
            const blockDef = BLOCKS[block];
            if (block !== BLOCK.AIR && blockDef && (blockDef.solid || (includeLiquids && blockDef.liquid))) {
                const tExit = Math.min(tMaxX, tMaxY, tMaxZ, maxDist);

                // Check Slab Raycast
                if (blockDef.isSlab) {
                    const meta = this.world.getMetadata(x, y, z);
                    const isTop = (meta & 8) !== 0;
                    const boxMin = { x, y: isTop ? y + 0.5 : y, z };
                    const boxMax = { x: x + 1, y: isTop ? y + 1.0 : y + 0.5, z: z + 1 };

                    const tHit = this.raycastSubBox(origin, direction, t, tExit, boxMin, boxMax);
                    if (tHit !== null) {
                        return { x, y, z, type: block, face: (nx === 0 && ny === 0 && nz === 0) ? null : { x: nx, y: ny, z: nz }, dist: tHit, point: { x: origin.x + direction.x * tHit, y: origin.y + direction.y * tHit, z: origin.z + direction.z * tHit } };
                    }
                } else if (blockDef.isStair) {
                    const meta = this.world.getMetadata(x, y, z);
                    const isUpsideDown = (meta & 4) !== 0;
                    const dir = meta & 3;

                    const baseBoxMin = { x, y: isUpsideDown ? y + 0.5 : y, z };
                    const baseBoxMax = { x: x + 1, y: isUpsideDown ? y + 1.0 : y + 0.5, z: z + 1 };
                    let tHit = this.raycastSubBox(origin, direction, t, tExit, baseBoxMin, baseBoxMax);

                    let stepMinX = x, stepMaxX = x + 1;
                    let stepMinZ = z, stepMaxZ = z + 1;
                    if (dir === 0) stepMinX = x + 0.5;
                    else if (dir === 1) stepMaxX = x + 0.5;
                    else if (dir === 2) stepMinZ = z + 0.5;
                    else if (dir === 3) stepMaxZ = z + 0.5;

                    const stepBoxMin = { x: stepMinX, y: isUpsideDown ? y : y + 0.5, z: stepMinZ };
                    const stepBoxMax = { x: stepMaxX, y: isUpsideDown ? y + 0.5 : y + 1.0, z: stepMaxZ };
                    const stepTHit = this.raycastSubBox(origin, direction, t, tExit, stepBoxMin, stepBoxMax);

                    if (stepTHit !== null && (tHit === null || stepTHit < tHit)) {
                        tHit = stepTHit;
                    }

                    if (tHit !== null) {
                        return { x, y, z, type: block, face: (nx === 0 && ny === 0 && nz === 0) ? null : { x: nx, y: ny, z: nz }, dist: tHit, point: { x: origin.x + direction.x * tHit, y: origin.y + direction.y * tHit, z: origin.z + direction.z * tHit } };
                    }
                } else if (blockDef.isFence || blockDef.isPane) {
                    const boxMin = { x: x + 0.375, y, z: z + 0.375 };
                    const boxMax = { x: x + 0.625, y: y + 1.0, z: z + 0.625 };

                    const tHit = this.raycastSubBox(origin, direction, t, tExit, boxMin, boxMax);
                    if (tHit !== null) {
                        return { x, y, z, type: block, face: (nx === 0 && ny === 0 && nz === 0) ? null : { x: nx, y: ny, z: nz }, dist: tHit, point: { x: origin.x + direction.x * tHit, y: origin.y + direction.y * tHit, z: origin.z + direction.z * tHit } };
                    }
                } else if (blockDef.isTrapdoor) {
                    const meta = this.world.getMetadata(x, y, z);
                    const open = (meta & 4) !== 0;
                    const top = (meta & 8) !== 0;
                    const thickness = 0.1875;

                    let boxMin, boxMax;
                    if (open) {
                        const orient = meta & 3;
                        if (orient === 0) { boxMin = { x, y, z }; boxMax = { x: x + thickness, y: y + 1, z: z + 1 }; }
                        else if (orient === 1) { boxMin = { x: x + 1 - thickness, y, z }; boxMax = { x: x + 1, y: y + 1, z: z + 1 }; }
                        else if (orient === 2) { boxMin = { x, y, z }; boxMax = { x: x + 1, y: y + 1, z: z + thickness }; }
                        else { boxMin = { x, y, z: z + 1 - thickness }; boxMax = { x: x + 1, y: y + 1, z: z + 1 }; }
                    } else {
                        if (top) { boxMin = { x, y: y + 1 - thickness, z }; boxMax = { x: x + 1, y: y + 1, z: z + 1 }; }
                        else { boxMin = { x, y, z }; boxMax = { x: x + 1, y: y + thickness, z: z + 1 }; }
                    }

                    const tHit = this.raycastSubBox(origin, direction, t, tExit, boxMin, boxMax);
                    if (tHit !== null) {
                        return { x, y, z, type: block, face: (nx === 0 && ny === 0 && nz === 0) ? null : { x: nx, y: ny, z: nz }, dist: tHit, point: { x: origin.x + direction.x * tHit, y: origin.y + direction.y * tHit, z: origin.z + direction.z * tHit } };
                    }
                } else {
                    return {
                        x, y, z,
                        type: block,
                        face: (nx === 0 && ny === 0 && nz === 0) ? null : { x: nx, y: ny, z: nz },
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
                    nx = -stepX; ny = 0; nz = 0;
                } else {
                    z += stepZ;
                    t = tMaxZ;
                    tMaxZ += tDeltaZ;
                    nx = 0; ny = 0; nz = -stepZ;
                }
            } else {
                if (tMaxY < tMaxZ) {
                    y += stepY;
                    t = tMaxY;
                    tMaxY += tDeltaY;
                    nx = 0; ny = -stepY; nz = 0;
                } else {
                    z += stepZ;
                    t = tMaxZ;
                    tMaxZ += tDeltaZ;
                    nx = 0; ny = 0; nz = -stepZ;
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

        return { entity: closest, dist: minDist, point: closest ? { x: origin.x + dir.x * minDist, y: origin.y + dir.y * minDist, z: origin.z + dir.z * minDist } : null };
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
