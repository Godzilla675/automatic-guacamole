class Structure {
    constructor(world) {
        this.world = world;
    }

    // Helper to get block constant (optional, can just use global BLOCK)
    getBlock(name) {
        return window.BLOCK[name];
    }
}

window.Structure = Structure;
