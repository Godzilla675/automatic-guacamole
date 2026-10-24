// Block Interaction Registry
//
// Right-click ("use") behaviour for individual blocks lives here instead of in one
// giant if/else chain inside Game.interact().  Each block id maps to a handler:
//
//     BlockInteractions.register(BLOCK.MY_BLOCK, (game, x, y, z, blockType, pos) => {
//         // game  - the Game instance (game.world, game.player, game.ui, game.particles, ...)
//         // x,y,z - integer block coordinates that were clicked
//         // pos   - block centre {x, y, z} (handy for sounds/particles)
//         // Return true when the click was consumed (prevents block placement).
//         // Return false/undefined to let Game.interact() keep looking (e.g. "not holding the right item").
//     });
//
// Blocks that are matched by *flags* on their definition (isDoor, isTrapdoor, isGate, isFence)
// are still handled directly in Game.interact(), because they are not keyed by a single id.
//
// New features should add their handlers here (or in their own file loaded after this one)
// rather than growing Game.interact().  See AGENTS.md.

const BlockInteractions = (() => {
    const handlers = new Map();

    /**
     * Register a right-click handler for one or more block ids.
     * Registering again for the same id replaces the previous handler (last one wins),
     * which lets plugins/overrides take precedence over the defaults below.
     */
    function register(blockTypes, handler) {
        if (typeof handler !== 'function') throw new TypeError('BlockInteractions.register: handler must be a function');
        const ids = Array.isArray(blockTypes) ? blockTypes : [blockTypes];
        for (const id of ids) {
            if (id === undefined || id === null) throw new TypeError('BlockInteractions.register: block id is undefined (typo in BLOCK.* name?)');
            handlers.set(id, handler);
        }
        return handler;
    }

    function unregister(blockType) {
        return handlers.delete(blockType);
    }

    function get(blockType) {
        return handlers.get(blockType) || null;
    }

    function has(blockType) {
        return handlers.has(blockType);
    }

    /** Run the handler for blockType (if any). Returns true when the click was consumed. */
    function dispatch(game, x, y, z, blockType, pos) {
        const handler = handlers.get(blockType);
        if (!handler) return false;
        return handler(game, x, y, z, blockType, pos) === true;
    }

    function registeredTypes() {
        return Array.from(handlers.keys());
    }

    return { register, unregister, get, has, dispatch, registeredTypes };
})();

// ---------------------------------------------------------------------------
// Default handlers (moved verbatim from Game.interact(); `this` -> `game`)
// ---------------------------------------------------------------------------
(() => {
    // Tolerant wrapper for the defaults: some unit tests stub BLOCK with only a handful of ids,
    // so skip ids that do not exist instead of throwing. (tests/test_block_interactions.js checks
    // that every default below is registered against the real BLOCK table.)
    const register = (ids, handler) => {
        const present = [].concat(ids).filter(id => id !== undefined && id !== null);
        if (present.length) BlockInteractions.register(present, handler);
    };

    // Lodestone Compass Binding
    register(BLOCK.LODESTONE, function lodestoneCompassBinding(game, x, y, z, blockType, pos) {
        const held = game.player.getHeldItem();
        if (held && (held.type === BLOCK.ITEM_COMPASS || held.type === BLOCK.ITEM_RECOVERY_COMPASS)) {
            held.lodestonePos = { x, y, z };
            game.player.lodestoneTarget = { x, y, z };
            if (game.particles) game.particles.spawn(x + 0.5, y + 1.0, z + 0.5, '#00FFFF', 15);
            if (window.soundManager) window.soundManager.play('place', pos);
            if (game.ui && game.ui.showNotification) {
                game.ui.showNotification(`Compass bound to Lodestone at (${x}, ${y}, ${z})!`);
            }
            return true;
        }
    });

    // Cauldron Bundle Dye Bleaching
    register(BLOCK.CAULDRON, function cauldronBundleDyeBleaching(game, x, y, z, blockType, pos) {
        let meta = game.world.getMetadata(x, y, z);
        if (meta === 0) meta = 3; // Default water level if uninitialized
        if (meta > 0) {
            const held = game.player.getHeldItem();
            if (held && (held.type >= BLOCK.ITEM_BUNDLE_WHITE && held.type <= BLOCK.ITEM_BUNDLE_BLACK)) {
                held.type = BLOCK.ITEM_BUNDLE;
                meta--;
                game.world.setMetadata(x, y, z, meta);
                if (game.particles) game.particles.spawn(x + 0.5, y + 0.8, z + 0.5, '#00FFFF', 12);
                if (window.soundManager) window.soundManager.play('place', pos);
                game.updateHotbarUI();
                if (game.ui && game.ui.showNotification) {
                    game.ui.showNotification("Washed dyed Bundle in Cauldron! Bleached back to default Bundle.");
                }
                return true;
            }
        }
    });

    // Furnace / Smoker / Blast Furnace
    register([BLOCK.FURNACE, BLOCK.SMOKER, BLOCK.BLAST_FURNACE], function furnaceSmokerBlastFurnace(game, x, y, z, blockType, pos) {
        let entity = game.world.getBlockEntity(x, y, z);
        if (!entity) {
            entity = {
                type: blockType === BLOCK.SMOKER ? 'smoker' : (blockType === BLOCK.BLAST_FURNACE ? 'blast_furnace' : 'furnace'),
                fuel: 0, maxFuel: 0,
                progress: 0, maxProgress: (blockType === BLOCK.SMOKER || blockType === BLOCK.BLAST_FURNACE) ? 50 : 100,
                input: null, fuelItem: null, output: null,
                burnTime: 0
            };
            game.world.setBlockEntity(x, y, z, entity);
        }
        game.ui.openFurnace(entity);
        return true;
    });

    // Composter
    register(BLOCK.COMPOSTER, function composter(game, x, y, z, blockType, pos) {
        let entity = game.world.getBlockEntity(x, y, z);
        if (!entity) {
            entity = { type: 'composter', level: 0 };
            game.world.setBlockEntity(x, y, z, entity);
        }
        const held = game.player.getHeldItem();
        if (held && (held.type === BLOCK.ITEM_APPLE || held.type === BLOCK.ITEM_CARROT || held.type === BLOCK.ITEM_POTATO || held.type === BLOCK.ITEM_SWEET_BERRIES || held.type === BLOCK.LEAVES || held.type === BLOCK.OAK_SAPLING)) {
            held.count--;
            if (held.count <= 0) game.player.inventory[game.player.selectedSlot] = null;
            entity.level++;
            if (game.particles) {
                game.particles.spawn(x + 0.5, y + 0.8, z + 0.5, '#5C8E32', 8);
            }
            if (entity.level >= 7) {
                entity.level = 0;
                game.player.addItem({ type: BLOCK.ITEM_BONE, count: 1 });
                if (game.particles) {
                    game.particles.spawn(x + 0.5, y + 1.0, z + 0.5, '#7CFC00', 20);
                }
                if (game.ui && game.ui.showNotification) game.ui.showNotification("Composted! Received Bone / Bone Meal!");
            } else {
                if (game.ui && game.ui.showNotification) game.ui.showNotification(`Composter level: ${entity.level}/7`);
            }
        } else if (entity.level > 0) {
            if (game.ui && game.ui.showNotification) game.ui.showNotification(`Composter level: ${entity.level}/7`);
        }
        return true;
    });

    // Smithing Table
    register(BLOCK.SMITHING_TABLE, function smithingTable(game, x, y, z, blockType, pos) {
        if (game.ui && game.ui.openSmithingTable) {
            game.ui.openSmithingTable();
        }
        return true;
    });

    // Fletching Table
    register(BLOCK.FLETCHING_TABLE, function fletchingTable(game, x, y, z, blockType, pos) {
        if (game.ui && game.ui.openFletchingTable) {
            game.ui.openFletchingTable();
        }
        return true;
    });

    // Stonecutter
    register(BLOCK.STONECUTTER, function stonecutter(game, x, y, z, blockType, pos) {
        game.ui.openStonecutter();
        return true;
    });

    // Crafter
    register(BLOCK.CRAFTER, function crafter(game, x, y, z, blockType, pos) {
        let entity = game.world.getBlockEntity(x, y, z);
        if (!entity) {
            entity = { type: 'crafter', items: new Array(9).fill(null), disabledSlots: new Array(9).fill(false) };
            game.world.setBlockEntity(x, y, z, entity);
        }
        if (game.ui && game.ui.openCrafter) {
            game.ui.openCrafter(entity);
        }
        return true;
    });

    // Chiseled Bookshelf
    register(BLOCK.CHISELED_BOOKSHELF, function chiseledBookshelf(game, x, y, z, blockType, pos) {
        let entity = game.world.getBlockEntity(x, y, z);
        if (!entity) {
            entity = {
                type: 'chiseled_bookshelf',
                items: new Array(6).fill(null)
            };
            game.world.setBlockEntity(x, y, z, entity);
        }
        game.ui.openChiseledBookshelf(entity);
        return true;
    });

    // Dispenser
    register(BLOCK.DISPENSER, function dispenser(game, x, y, z, blockType, pos) {
        let entity = game.world.getBlockEntity(x, y, z);
        if (!entity) {
            entity = {
                type: 'dispenser',
                items: new Array(9).fill(null)
            };
            game.world.setBlockEntity(x, y, z, entity);
        }
        if (game.ui && game.ui.openDispenser) {
            game.ui.openDispenser(entity);
        } else if (game.ui && game.ui.openDropper) {
            game.ui.openDropper(entity);
        }
        return true;
    });

    // Hopper
    register(BLOCK.HOPPER, function hopper(game, x, y, z, blockType, pos) {
        let entity = game.world.getBlockEntity(x, y, z);
        if (!entity) {
            entity = {
                type: 'hopper',
                items: new Array(5).fill(null)
            };
            game.world.setBlockEntity(x, y, z, entity);
        }
        if (game.ui && game.ui.openHopper) {
            game.ui.openHopper(entity);
        }
        return true;
    });

    // Grindstone
    register(BLOCK.GRINDSTONE, function grindstone(game, x, y, z, blockType, pos) {
        if (game.ui && game.ui.openGrindstone) {
            game.ui.openGrindstone();
        }
        return true;
    });

    // Dropper
    register(BLOCK.DROPPER, function dropper(game, x, y, z, blockType, pos) {
        let entity = game.world.getBlockEntity(x, y, z);
        if (!entity) {
            entity = {
                type: 'dropper',
                items: new Array(9).fill(null)
            };
            game.world.setBlockEntity(x, y, z, entity);
        }
        game.ui.openDropper(entity);
        return true;
    });

    // Ender Chest
    register(BLOCK.ENDER_CHEST, function enderChest(game, x, y, z, blockType, pos) {
        if (game.ui && game.ui.openEnderChest) {
            game.ui.openEnderChest();
        }
        return true;
    });

    // Chest
    register(BLOCK.CHEST, function chest(game, x, y, z, blockType, pos) {
         let entity = game.world.getBlockEntity(x, y, z);
         if (!entity) {
             entity = {
                 type: 'chest',
                 items: new Array(27).fill(null)
             };
             game.world.setBlockEntity(x, y, z, entity);
         }
         game.ui.openChest(entity);
         return true;
    });

    // Brewing Stand
    register(BLOCK.BREWING_STAND, function brewingStand(game, x, y, z, blockType, pos) {
        let entity = game.world.getBlockEntity(x, y, z);
        if (!entity) {
            entity = {
                type: 'brewing_stand',
                ingredient: null,
                bottles: [null, null, null],
                brewTime: 0
            };
            game.world.setBlockEntity(x, y, z, entity);
        }
        game.ui.openBrewing(entity);
        return true;
    });

    // Enchanting Table
    register(BLOCK.ENCHANTING_TABLE, function enchantingTable(game, x, y, z, blockType, pos) {
        game.ui.openEnchanting();
        return true;
    });

    // Anvil
    register(BLOCK.ANVIL, function anvil(game, x, y, z, blockType, pos) {
        game.ui.openAnvil();
        return true;
    });

    // Jukebox
    register(BLOCK.JUKEBOX, function jukebox(game, x, y, z, blockType, pos) {
        let entity = game.world.getBlockEntity(x, y, z);
        if (!entity) {
            entity = { type: 'jukebox', disc: null };
            game.world.setBlockEntity(x, y, z, entity);
        }
        const held = game.player ? (typeof game.player.getHeldItem === 'function' ? game.player.getHeldItem() : (game.player.inventory ? game.player.inventory[game.player.selectedSlot] : null)) : null;
        if (entity.disc) {
            // Eject disc
            const discType = entity.disc;
            entity.disc = null;
            if (game.drops && window.Drop) {
                game.drops.push(new window.Drop(game, x + 0.5, y + 1.2, z + 0.5, discType, 1));
            } else if (game.player && game.player.addItem) {
                game.player.addItem(discType, 1);
            }
            if (window.soundManager) window.soundManager.play('place', pos);
            if (game.chat) game.chat.addMessage("Ejected music disc from Jukebox.");
            return true;
        } else if (held && (held.type === BLOCK.ITEM_MUSIC_DISC || (window.BLOCKS && window.BLOCKS[held.type] && window.BLOCKS[held.type].isMusicDisc))) {
            // Insert disc
            entity.disc = held.type;
            if (game.player && game.player.gamemode !== 1) {
                held.count--;
                if (held.count <= 0 && game.player.inventory) game.player.inventory[game.player.selectedSlot] = null;
            }
            if (window.soundManager) window.soundManager.play('music_disc', pos);
            if (game.chat) game.chat.addMessage("Playing music disc in Jukebox!");
            if (game.ui && game.ui.openJukebox) game.ui.openJukebox(entity, { x, y, z });
            return true;
        } else if (game.ui && game.ui.openJukebox) {
            game.ui.openJukebox(entity, { x, y, z });
            return true;
        }
        return true;
    });

    // Redstone Comparator Mode Toggle
    register(BLOCK.REDSTONE_COMPARATOR, function redstoneComparator(game, x, y, z, blockType, pos) {
        let entity = game.world.getBlockEntity(x, y, z);
        if (!entity) {
            entity = { type: 'comparator', mode: 'compare' };
            game.world.setBlockEntity(x, y, z, entity);
        }
        entity.mode = entity.mode === 'subtract' ? 'compare' : 'subtract';
        game.world.activeRedstone.add(`${x},${y},${z}`);
        game.world.scheduleNeighborRedstoneUpdates(x, y, z);
        if (game.particles) {
            game.particles.spawn(x + 0.5, y + 0.5, z + 0.5, entity.mode === 'subtract' ? '#FF4500' : '#FFD700', 8);
        }
        if (window.soundManager) window.soundManager.play('place', pos);
        if (game.ui && game.ui.showNotification) {
            game.ui.showNotification(`Redstone Comparator set to ${entity.mode.toUpperCase()} mode!`);
        }
        return true;
    });

    // Note Block
    register(BLOCK.NOTE_BLOCK, function noteBlock(game, x, y, z, blockType, pos) {
        let meta = game.world.getMetadata(x, y, z);
        meta = (meta + 1) % 25;
        game.world.setMetadata(x, y, z, meta);

        // Spawn note particle
        if (game.particles) {
            game.particles.spawn(pos.x, pos.y + 0.5, pos.z, `hsl(${(meta / 24) * 360}, 100%, 50%)`, 1);
        }

        if (window.soundManager) {
            window.soundManager.play('note', { x: pos.x, y: pos.y, z: pos.z, pitch: meta });
        }
        return true;
    });

    // Bed
    register(BLOCK.BED, function bed(game, x, y, z, blockType, pos) {
        const time = game.gameTime % game.dayLength;
        const isCreative = game.player && (game.player.gamemode === 1 || game.player.isCreative);
        if (time > game.dayLength * 0.5 || isCreative) { // Night or Creative Mode
            // Skip to next morning (e.g. 0.1 of next day)
            const timeToMorning = game.dayLength - time + (game.dayLength * 0.1);
            game.gameTime += timeToMorning;

            game.player.spawnPoint = { x: game.player.x, y: game.player.y, z: game.player.z };
            game.player.health = Math.min(game.player.maxHealth, game.player.health + 10);
            if (game.chat) game.chat.addMessage("Slept through the night. Spawn point set!");
            if (game.ui && game.ui.showNotification) game.ui.showNotification("Slept through the night!");
        } else {
            if (game.chat) game.chat.addMessage("You can only sleep at night.");
        }
        return true;
    });

    // Beehive Interaction
    register(BLOCK.BEEHIVE, function beehive(game, x, y, z, blockType, pos) {
        let entity = game.world.getBlockEntity(x, y, z);
        if (!entity) {
            entity = { type: 'beehive', honeyLevel: 5 };
            game.world.setBlockEntity(x, y, z, entity);
        }
        const held = game.player.getHeldItem();
        if (held && held.type === BLOCK.ITEM_SHEARS) {
            game.player.addItem({ type: BLOCK.HONEYCOMB_BLOCK, count: 1 });
            if (game.particles) game.particles.spawn(x + 0.5, y + 0.8, z + 0.5, '#FFD700', 12);
            if (game.ui && game.ui.showNotification) game.ui.showNotification("Harvested Honeycomb from Beehive!");
            return true;
        } else if (held && held.type === BLOCK.ITEM_GLASS_BOTTLE) {
            held.count--;
            if (held.count <= 0) game.player.inventory[game.player.selectedSlot] = null;
            game.player.addItem({ type: BLOCK.ITEM_POTION, count: 1 });
            game.updateHotbarUI();
            if (game.particles) game.particles.spawn(x + 0.5, y + 0.8, z + 0.5, '#FFA500', 12);
            if (game.ui && game.ui.showNotification) game.ui.showNotification("Collected Honey Bottle from Beehive!");
            return true;
        } else {
            if (game.ui && game.ui.showNotification) game.ui.showNotification("Beehive: Use Shears for Honeycomb or Glass Bottle for Honey!");
            return true;
        }
    });

    // Trial Spawner Interaction
    register(BLOCK.TRIAL_SPAWNER, function trialSpawner(game, x, y, z, blockType, pos) {
        let entity = game.world.getBlockEntity(x, y, z);
        if (!entity) {
            entity = { type: 'trial_spawner', wave: 0, maxWaves: 3, mobCount: 0, isOminous: false };
            game.world.setBlockEntity(x, y, z, entity);
        }

        const hasBadOmen = game.player && game.player.activeEffects && game.player.activeEffects.some(e => e.name === 'Bad Omen');
        if (hasBadOmen && !entity.isOminous) {
            entity.isOminous = true;
            entity.wave = 0;
            entity.maxWaves = 4;
            if (game.particles) game.particles.spawn(x + 0.5, y + 1.0, z + 0.5, '#9400D3', 30);
            if (game.ui && game.ui.showNotification) {
                game.ui.showNotification("Bad Omen upgraded Trial Spawner to Ominous Trial Spawner!");
            }
        }

        if (entity.wave < entity.maxWaves && entity.mobCount <= 0) {
            entity.wave++;
            entity.mobCount = entity.isOminous ? 3 : 2;
            const mobTypeToSpawn = entity.isOminous ? (MOB_TYPE.WITHER_SKELETON || MOB_TYPE.BREEZE) : (MOB_TYPE.BREEZE || MOB_TYPE.ZOMBIE);
            for (let i = 0; i < entity.mobCount; i++) {
                const mob = new Mob(game, x + 1 + i, y + 1, z, mobTypeToSpawn);
                if (entity.isOminous) {
                    mob.maxHealth += 10;
                    mob.health += 10;
                    mob.speed *= 1.2;
                }
                game.mobs.push(mob);
            }
            const particleColor = entity.isOminous ? '#9400D3' : '#FFA500';
            if (game.particles) game.particles.spawn(x + 0.5, y + 1.0, z + 0.5, particleColor, 15);
            if (game.ui && game.ui.showNotification) {
                game.ui.showNotification(`${entity.isOminous ? 'Ominous ' : ''}Trial Spawner Wave ${entity.wave}/${entity.maxWaves} Started!`);
            }
        } else if (entity.wave >= entity.maxWaves) {
            const rewardKey = entity.isOminous ? BLOCK.ITEM_OMINOUS_TRIAL_KEY : BLOCK.ITEM_TRIAL_KEY;
            game.player.addItem({ type: rewardKey, count: 1 });
            if (game.ui && game.ui.showNotification) {
                const keyName = window.BLOCKS[rewardKey] ? window.BLOCKS[rewardKey].name : 'Trial Key';
                game.ui.showNotification(`Trial Spawner Defeated! Earned ${keyName}!`);
            }
            const particleColor = entity.isOminous ? '#9400D3' : '#FFD700';
            if (game.particles) game.particles.spawn(x + 0.5, y + 1.0, z + 0.5, particleColor, 25);
        } else {
            if (game.ui && game.ui.showNotification) {
                game.ui.showNotification("Trial Spawner: Defeat active trial mobs!");
            }
        }
        return true;
    });

    // Trial Vault & Ominous Vault Interaction
    register([BLOCK.TRIAL_VAULT, BLOCK.OMINOUS_VAULT], function trialVaultOminousVault(game, x, y, z, blockType, pos) {
        let entity = game.world.getBlockEntity(x, y, z);
        if (!entity) {
            entity = { type: blockType === BLOCK.OMINOUS_VAULT ? 'ominous_vault' : 'trial_vault', openedPlayers: [] };
            game.world.setBlockEntity(x, y, z, entity);
        }
        if (!entity.openedPlayers) entity.openedPlayers = [];

        const playerId = game.player.name || "Player";
        if (entity.openedPlayers.includes(playerId)) {
            if (game.particles) game.particles.spawn(x + 0.5, y + 1.0, z + 0.5, '#808080', 10);
            if (game.ui && game.ui.showNotification) {
                game.ui.showNotification("Vault is already unlocked and locked for this player!");
            }
            return true;
        }

        const reqKey = blockType === BLOCK.OMINOUS_VAULT ? BLOCK.ITEM_OMINOUS_TRIAL_KEY : BLOCK.ITEM_TRIAL_KEY;
        let held = game.player.getHeldItem();
        let isOffhand = false;
        if ((!held || held.type !== reqKey) && game.player.offhand && game.player.offhand.type === reqKey) {
            held = game.player.offhand;
            isOffhand = true;
        }

        if (held && held.type === reqKey) {
            held.count--;
            if (held.count <= 0) {
                if (isOffhand) {
                    game.player.offhand = null;
                } else {
                    game.player.inventory[game.player.selectedSlot] = null;
                }
            }
            game.updateHotbarUI();
            if (game.ui && game.ui.refreshArmorUI) game.ui.refreshArmorUI();

            entity.openedPlayers.push(playerId);

            // Rewards table
            const rewards = blockType === BLOCK.OMINOUS_VAULT ? [
                { type: BLOCK.HEAVY_CORE, count: 1 },
                { type: BLOCK.ITEM_MACE, count: 1 },
                { type: BLOCK.ITEM_DIAMOND, count: 5 }
            ] : [
                { type: BLOCK.ITEM_DIAMOND, count: 3 },
                { type: BLOCK.ITEM_GOLD_INGOT, count: 5 },
                { type: BLOCK.ITEM_EMERALD, count: 4 }
            ];
            const loot = rewards[Math.floor(Math.random() * rewards.length)];
            game.player.addItem(loot);

            if (game.particles) {
                if (game.particles.spawnVaultOrbit) {
                    game.particles.spawnVaultOrbit(x + 0.5, y + 1.0, z + 0.5, blockType === BLOCK.OMINOUS_VAULT ? '#9400D3' : '#00FFFF');
                } else {
                    game.particles.spawn(x + 0.5, y + 1.0, z + 0.5, blockType === BLOCK.OMINOUS_VAULT ? '#9400D3' : '#00FFFF', 30);
                }
            }
            if (game.ui && game.ui.showNotification) {
                const def = window.BLOCKS[loot.type];
                game.ui.showNotification(`${blockType === BLOCK.OMINOUS_VAULT ? 'Ominous ' : ''}Vault Unlocked! Rewarded ${def ? def.name : 'Loot'} x${loot.count}!`);
            }
            if (window.soundManager) window.soundManager.play('place', pos);
        } else {
            if (game.ui && game.ui.showNotification) {
                const keyDef = window.BLOCKS[reqKey];
                game.ui.showNotification(`Vault requires a ${keyDef ? keyDef.name : 'Key'} to unlock!`);
            }
        }
        return true;
    });

    // Respawn Anchor Interaction
    register(BLOCK.RESPAWN_ANCHOR, function respawnAnchor(game, x, y, z, blockType, pos) {
        let entity = game.world.getBlockEntity(x, y, z);
        if (!entity) {
            entity = { type: 'respawn_anchor', charges: 0 };
            game.world.setBlockEntity(x, y, z, entity);
        }
        const held = game.player.getHeldItem();
        if (held && (held.type === BLOCK.GLOWSTONE || held.type === BLOCK.ITEM_GLOWSTONE_DUST)) {
            if (entity.charges < 4) {
                entity.charges++;
                held.count--;
                if (held.count <= 0) game.player.inventory[game.player.selectedSlot] = null;
                game.updateHotbarUI();
                if (game.particles) {
                    game.particles.spawn(x + 0.5, y + 1.0, z + 0.5, '#FFD700', 12);
                }
                if (game.ui && game.ui.showNotification) {
                    game.ui.showNotification(`Respawn Anchor Charged (${entity.charges}/4)`);
                }
                if (window.soundManager) window.soundManager.play('place', pos);
            }
        } else {
            if (entity.charges > 0) {
                game.player.respawnAnchorPos = { x: x + 0.5, y: y + 1.0, z: z + 0.5, blockX: x, blockY: y, blockZ: z };
                if (game.ui && game.ui.showNotification) {
                    game.ui.showNotification(`Respawn point set at Respawn Anchor! Charges: ${entity.charges}/4`);
                }
                if (window.soundManager) window.soundManager.play('place', pos);
            } else {
                if (game.ui && game.ui.showNotification) {
                    game.ui.showNotification("Respawn Anchor is empty! Charge with Glowstone or Glowstone Dust.");
                }
            }
        }
        return true;
    });

    // Creaking Heart Interaction
    register(BLOCK.CREAKING_HEART, function creakingHeart(game, x, y, z, blockType, pos) {
        let entity = game.world.getBlockEntity(x, y, z);
        if (!entity) {
            entity = { type: 'creaking_heart' };
            game.world.setBlockEntity(x, y, z, entity);
        }
        if (game.drops && window.Drop) {
            game.drops.push(new window.Drop(game, x + 0.5, y + 1.0, z + 0.5, BLOCK.ITEM_RESIN_CLUMP, 2));
        }
        if (game.particles) game.particles.spawn(x + 0.5, y + 0.5, z + 0.5, '#FF6600', 15);
        if (window.soundManager) window.soundManager.play('break', pos);
        if (game.ui && game.ui.showNotification) {
            game.ui.showNotification("Creaking Heart struck! Dropped Resin Clumps!");
        }
        return true;
    });

    // TNT
    register(BLOCK.TNT, function tnt(game, x, y, z, blockType, pos) {
        game.world.setBlock(x, y, z, BLOCK.AIR);
        if (!game.tntPrimed) game.tntPrimed = [];
        game.tntPrimed.push({ x: x+0.5, y: y+0.5, z: z+0.5, fuse: 4.0, vy: 5 }); // 4 seconds fuse, slight jump
        if (window.soundManager) window.soundManager.play('fuse', pos);
        return true;
    });

})();

window.BlockInteractions = BlockInteractions;
