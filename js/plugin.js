class PluginAPI {
    constructor(game) {
        this.game = game;
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(cb => cb(data));
        }
    }

    registerBlock(id, def) {
        if (window.BLOCKS[id]) {
            console.warn(`Block ID ${id} already exists`);
            return;
        }
        window.BLOCKS[id] = def;
        // Also update BLOCK constant if possible, but it's const so we might need to rely on BLOCKS lookups
        // Actually BLOCK is a const object, we can't easily add to it if it was frozen, but here it's likely just an object.
        // However, user scripts usually use BLOCK.NAME.
        // For now, just adding to BLOCKS is enough for rendering/physics.
    }
}

window.PluginAPI = PluginAPI;
