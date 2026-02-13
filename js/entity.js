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

if (typeof window !== 'undefined') {
    window.Entity = Entity;
} else {
    // For Node.js tests
    global.Entity = Entity;
}
