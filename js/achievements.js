class AchievementManager {
    constructor(game) {
        this.game = game;
        this.unlocked = new Set();
        this.list = {
            'getting_wood': { name: 'Getting Wood', desc: 'Attack a tree' },
            'benchmarking': { name: 'Benchmarking', desc: 'Craft a Workbench' }, // Workbench logic might need updating if we have one
            'hot_stuff': { name: 'Hot Stuff', desc: 'Enter the Nether' },
            'monster_hunter': { name: 'Monster Hunter', desc: 'Kill a mob' }
        };

        // Listeners
        this.game.pluginAPI.on('blockBreak', (data) => {
            if (data.type === window.BLOCK.WOOD) this.unlock('getting_wood');
        });
        this.game.pluginAPI.on('craft', (data) => {
            if (data.recipe.result.type === window.BLOCK.FURNACE) this.unlock('benchmarking');
        });
        this.game.pluginAPI.on('mobDeath', (data) => {
            this.unlock('monster_hunter');
        });
        // Nether check in game update
    }

    unlock(id) {
        if (this.unlocked.has(id)) return;
        if (!this.list[id]) return;
        this.unlocked.add(id);
        if (this.game.ui) this.game.ui.showNotification(`Achievement Get! ${this.list[id].name}`);
        if (window.soundManager) window.soundManager.play('place');
    }

    update() {
        if (this.game.world.dimension === 'nether') this.unlock('hot_stuff');
    }
}
window.AchievementManager = AchievementManager;
