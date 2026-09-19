class Entity {
    constructor(game, x, y, z) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.yaw = 0;
        this.pitch = 0;
        this.width = 0.6;
        this.height = 1.8;
        this.onGround = false;
        this.isDead = false;
        this.type = 'entity';
    }

    update(dt) {
        // Base physics
        this.vy -= 25 * dt; // Gravity

        // Move
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.z += this.vz * dt;

        // Simple floor check (if no physics engine is used for this entity)
        // Ideally subclasses override this with proper physics
        if (this.y < -10) this.isDead = true;
    }

    render(ctx) {
        // Placeholder
    }

    takeDamage(amount) {
        // Placeholder
    }
}

class ArmorStand extends Entity {
    constructor(game, x, y, z) {
        super(game, x, y, z);
        this.type = 'armor_stand';
        this.width = 0.5;
        this.height = 1.9;
        this.armor = {
            helmet: null,
            chestplate: null,
            leggings: null,
            boots: null
        };
    }

    interact(player) {
        if (!player) return false;
        const held = player.getHeldItem ? player.getHeldItem() : player.inventory[player.selectedSlot];
        if (held && window.ARMOR && window.ARMOR[held.type]) {
            const slot = window.ARMOR[held.type].slot;
            const slotNames = ['helmet', 'chestplate', 'leggings', 'boots'];
            const key = slotNames[slot];
            if (!this.armor[key]) {
                this.armor[key] = { type: held.type };
                held.count--;
                if (held.count <= 0) player.inventory[player.selectedSlot] = null;
                if (this.game.updateHotbarUI) this.game.updateHotbarUI();
                return true;
            }
        } else {
            const slotNames = ['helmet', 'chestplate', 'leggings', 'boots'];
            for (const key of slotNames) {
                if (this.armor[key]) {
                    const item = this.armor[key];
                    this.armor[key] = null;
                    player.giveItem(item.type, 1);
                    if (this.game.updateHotbarUI) this.game.updateHotbarUI();
                    return true;
                }
            }
        }
        return false;
    }

    takeDamage(amount) {
        this.isDead = true;
        if (this.game && this.game.drops && window.Drop) {
            this.game.drops.push(new window.Drop(this.game, this.x, this.y + 0.5, this.z, window.BLOCK.ITEM_ARMOR_STAND, 1));
            for (const key in this.armor) {
                if (this.armor[key]) {
                    this.game.drops.push(new window.Drop(this.game, this.x, this.y + 0.5, this.z, this.armor[key].type, 1));
                }
            }
        }
    }
}

if (typeof window !== 'undefined') {
    window.Entity = Entity;
    window.ArmorStand = ArmorStand;
} else {
    // For Node.js tests
    global.Entity = Entity;
    global.ArmorStand = ArmorStand;
}
