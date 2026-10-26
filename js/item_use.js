// Item Use Registry
//
// Right-click ("item-use") behaviour for items lives here instead of in one
// giant if/else chain inside Game.startAction(). Each item id maps to a handler:
//
//     ItemUse.register(BLOCK.ITEM_MY_ITEM, (game, slot, eyePos, dir, isOffhandActive) => {
//         // game            - the Game instance (game.world, game.player, game.ui, ...)
//         // slot            - held inventory item object { type, count, durability, ... }
//         // eyePos          - player eye position { x, y, z }
//         // dir             - player look direction unit vector { x, y, z }
//         // isOffhandActive - boolean indicating if using offhand slot
//         // Return true when the item action was handled / consumed.
//     });

const ItemUse = (() => {
    const handlers = new Map();

    /**
     * Register an item-use handler for one or more item/block ids.
     */
    function register(itemTypes, handler) {
        if (typeof handler !== 'function') throw new TypeError('ItemUse.register: handler must be a function');
        const ids = Array.isArray(itemTypes) ? itemTypes : [itemTypes];
        for (const id of ids) {
            if (id === undefined || id === null) throw new TypeError('ItemUse.register: item id is undefined');
            handlers.set(id, handler);
        }
        return handler;
    }

    function unregister(itemType) {
        return handlers.delete(itemType);
    }

    function get(itemType) {
        return handlers.get(itemType) || null;
    }

    function has(itemType) {
        return handlers.has(itemType);
    }

    /** Run the handler for item type in slot. Returns true when the action was consumed. */
    function dispatch(game, slot, eyePos, dir, isOffhandActive) {
        if (!slot || !slot.type) return false;
        const handler = handlers.get(slot.type);
        if (!handler) return false;
        return handler(game, slot, eyePos, dir, isOffhandActive) === true;
    }

    function registeredTypes() {
        return Array.from(handlers.keys());
    }

    return { register, unregister, get, has, dispatch, registeredTypes };
})();

// Default item handlers migrated from Game.prototype.startAction()
(() => {
    const register = (ids, handler) => {
        const present = [].concat(ids).filter(id => id !== undefined && id !== null);
        if (present.length) ItemUse.register(present, handler);
    };

    // Copper Chiseling Logic with Shears
    register(BLOCK.ITEM_SHEARS, function shearsCopperChiseling(game, slot, eyePos, dir) {
        const hit = game.physics.raycast(eyePos, dir, 5);
        if (hit) {
            const targetType = game.world.getBlock(hit.x, hit.y, hit.z);
            const chiselMap = {
                [window.BLOCK.COPPER_BLOCK]: window.BLOCK.CHISELED_COPPER,
                [window.BLOCK.EXPOSED_COPPER_BULB ? window.BLOCK.EXPOSED_COPPER_BULB : 530]: window.BLOCK.EXPOSED_CHISELED_COPPER,
                [window.BLOCK.WEATHERED_COPPER_BULB ? window.BLOCK.WEATHERED_COPPER_BULB : 531]: window.BLOCK.WEATHERED_CHISELED_COPPER,
                [window.BLOCK.OXIDIZED_COPPER_BULB ? window.BLOCK.OXIDIZED_COPPER_BULB : 532]: window.BLOCK.OXIDIZED_CHISELED_COPPER
            };

            if (chiselMap[targetType]) {
                const chiseledType = chiselMap[targetType];
                game.world.setBlock(hit.x, hit.y, hit.z, chiseledType);
                if (game.particles) game.particles.spawn(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5, '#B87333', 12);
                if (window.soundManager) window.soundManager.play('break', { x: hit.x + 0.5, y: hit.y + 0.5, z: hit.z + 0.5 });

                if (game.player.gamemode !== 1) {
                    if (slot.durability === undefined) slot.durability = 238;
                    slot.durability--;
                    if (slot.durability <= 0) game.player.inventory[game.player.selectedSlot] = null;
                    game.updateHotbarUI();
                }
                if (game.ui && game.ui.showNotification) {
                    const def = window.BLOCKS[chiseledType];
                    game.ui.showNotification(`Carved Copper into ${def ? def.name : 'Chiseled Copper'}!`);
                }
                return true;
            }
        }
    });

    // Brush Tool Archaeology Logic
    register(BLOCK.ITEM_BRUSH, function brushArchaeology(game, slot, eyePos, dir) {
        const hit = game.physics.raycast(eyePos, dir, 5);
        if (hit) {
            const targetType = game.world.getBlock(hit.x, hit.y, hit.z);
            if (targetType === BLOCK.SUSPICIOUS_SAND) {
                let entity = game.world.getBlockEntity(hit.x, hit.y, hit.z);
                if (!entity) {
                    entity = { type: 'suspicious_sand', brushProgress: 0 };
                    game.world.setBlockEntity(hit.x, hit.y, hit.z, entity);
                }
                entity.brushProgress++;
                if (game.particles) {
                    game.particles.spawn(hit.x + 0.5, hit.y + 1.0, hit.z + 0.5, '#E0C080', 10);
                }
                if (window.soundManager) window.soundManager.play('break', { x: hit.x + 0.5, y: hit.y + 0.5, z: hit.z + 0.5 });

                if (entity.brushProgress >= 4) {
                    const reward = game.getArchaeologyLoot();
                    if (game.drops && window.Drop) {
                        game.drops.push(new window.Drop(game, hit.x + 0.5, hit.y + 0.5, hit.z + 0.5, reward, 1));
                    }
                    game.world.setBlock(hit.x, hit.y, hit.z, BLOCK.SAND);
                    if (game.particles) {
                        game.particles.spawn(hit.x + 0.5, hit.y + 0.8, hit.z + 0.5, '#FFD700', 20);
                    }
                    if (game.ui && game.ui.showNotification) {
                        const rewardDef = window.BLOCKS[reward];
                        game.ui.showNotification(`Brushed Suspicious Sand! Unburied ${rewardDef ? rewardDef.name : 'Item'}!`);
                    }
                }

                if (game.player.gamemode !== 1) {
                    if (slot.durability === undefined) slot.durability = 64;
                    slot.durability--;
                    if (slot.durability <= 0) game.player.inventory[game.player.selectedSlot] = null;
                    game.updateHotbarUI();
                }
                return true;
            }
        }
    });

    // Flint and Steel Logic
    register(BLOCK.ITEM_FLINT_AND_STEEL, function flintAndSteel(game, slot, eyePos, dir) {
        const hit = game.physics.raycast(eyePos, dir, 5);
        if (hit) {
            const blockType = game.world.getBlock(hit.x, hit.y, hit.z);
            if (blockType === BLOCK.TNT) {
                game.world.setBlock(hit.x, hit.y, hit.z, BLOCK.AIR);
                game.tntPrimed.push({ x: hit.x + 0.5, y: hit.y + 0.5, z: hit.z + 0.5, fuse: 4.0, vy: 5 });
                if (window.soundManager) window.soundManager.play('fuse', { x: hit.x + 0.5, y: hit.y + 0.5, z: hit.z + 0.5 });
            } else if (hit.face) {
                const fx = hit.x + hit.face.x;
                const fy = hit.y + hit.face.y;
                const fz = hit.z + hit.face.z;
                if (game.world.getBlock(fx, fy, fz) === BLOCK.AIR) {
                    game.world.setBlock(fx, fy, fz, BLOCK.FIRE);
                    if (!game.world.activeFires) game.world.activeFires = new Set();
                    game.world.activeFires.add(`${fx},${fy},${fz}`);
                    if (window.soundManager) window.soundManager.play('place', { x: fx + 0.5, y: fy + 0.5, z: fz + 0.5 });
                }
            }
            if (game.player.gamemode !== 1) {
                if (slot.durability === undefined) slot.durability = 64;
                slot.durability--;
                if (slot.durability <= 0) game.player.inventory[game.player.selectedSlot] = null;
                game.updateHotbarUI();
            }
            return true;
        }
    });

    // Firework Logic
    register(BLOCK.ITEM_FIREWORK, function firework(game, slot, eyePos, dir) {
        game.spawnProjectile(game.player.x, game.player.y + game.player.height * 0.9, game.player.z, dir, 'firework');
        if (window.soundManager) window.soundManager.play('fuse', {x: game.player.x, y: game.player.y, z: game.player.z});

        if (game.player.gamemode !== 1) {
            slot.count--;
            if (slot.count <= 0) game.player.inventory[game.player.selectedSlot] = null;
        }
        if (game.ui && game.ui.updateHotbarUI) game.updateHotbarUI();
        return true;
    });

    // Wind Charge Logic
    register(BLOCK.ITEM_WIND_CHARGE, function windCharge(game, slot, eyePos, dir) {
        game.spawnProjectile(game.player.x, game.player.y + game.player.height * 0.9, game.player.z, dir, 'wind_charge');
        if (window.soundManager) window.soundManager.play('jump', {x: game.player.x, y: game.player.y, z: game.player.z});

        if (game.player.gamemode !== 1) {
            slot.count--;
            if (slot.count <= 0) {
                game.player.inventory[game.player.selectedSlot] = null;
            }
        }
        if (game.ui && game.ui.updateHotbarUI) game.ui.updateHotbarUI();
        return true;
    });

    // Fire Charge Logic
    register(BLOCK.ITEM_FIRE_CHARGE, function fireCharge(game, slot, eyePos, dir) {
        game.spawnProjectile(game.player.x, game.player.y + game.player.height * 0.9, game.player.z, dir, 'fireball');
        if (window.soundManager) window.soundManager.play('fire', {x: game.player.x, y: game.player.y, z: game.player.z});

        if (game.player.gamemode !== 1) {
            slot.count--;
            if (slot.count <= 0) {
                game.player.inventory[game.player.selectedSlot] = null;
            }
        }
        if (game.ui && game.ui.updateHotbarUI) game.ui.updateHotbarUI();
        return true;
    });

    // Snowball Logic
    register(BLOCK.ITEM_SNOWBALL, function snowball(game, slot, eyePos, dir) {
        game.spawnProjectile(game.player.x, game.player.y + game.player.height * 0.9, game.player.z, dir, 'snowball');
        if (window.soundManager) window.soundManager.play('jump', {x: game.player.x, y: game.player.y, z: game.player.z});

        if (game.player.gamemode !== 1) {
            slot.count--;
            if (slot.count <= 0) {
                game.player.inventory[game.player.selectedSlot] = null;
            }
        }
        if (game.ui && game.ui.updateHotbarUI) game.ui.updateHotbarUI();
        return true;
    });

    // Spyglass Logic
    register(BLOCK.ITEM_SPYGLASS, function spyglass(game, slot, eyePos, dir) {
        game.player.isUsingSpyglass = !game.player.isUsingSpyglass;
        if (game.player.isUsingSpyglass) {
            game.unzoomedFov = game.fov;
            game.fov = 20; // Zoom in
            if (window.soundManager) window.soundManager.play('place');
        } else {
            game.setFOV(game.unzoomedFov || 60);
        }
        return true;
    });

    // Recovery Compass Logic
    register(BLOCK.ITEM_RECOVERY_COMPASS, function recoveryCompass(game, slot, eyePos, dir) {
        if (!game.player) return false;
        const vec = game.player.getRecoveryCompassVector ? game.player.getRecoveryCompassVector() : null;
        if (vec && game.player.lastDeathPos) {
            const deathPos = game.player.lastDeathPos;
            const dist = Math.floor(vec.distance);
            const msg = `Recovery Compass points to last death at (${Math.floor(deathPos.x)}, ${Math.floor(deathPos.y)}, ${Math.floor(deathPos.z)}), ${dist}m away.`;
            if (game.ui && game.ui.showNotification) {
                game.ui.showNotification(msg);
            }
            if (game.chat && game.chat.addMessage) {
                game.chat.addMessage(msg);
            }
        } else {
            const msg = "Recovery Compass spins aimlessly (no previous death location recorded).";
            if (game.ui && game.ui.showNotification) {
                game.ui.showNotification(msg);
            }
            if (game.chat && game.chat.addMessage) {
                game.chat.addMessage(msg);
            }
        }
        if (window.soundManager) window.soundManager.play('place');
        return true;
    });

    // Goat Horn Instrument Logic
    register(BLOCK.ITEM_GOAT_HORN, function goatHorn(game, slot, eyePos, dir) {
        if (window.soundManager) {
            window.soundManager.play('goat_horn', { x: game.player.x, y: game.player.y, z: game.player.z });
        }
        if (game.ui && game.ui.showNotification) {
            game.ui.showNotification('📯 Played Goat Horn instrument!');
        }
        return true;
    });

})();

window.ItemUse = ItemUse;
