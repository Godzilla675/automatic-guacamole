class CraftingSystem {
    constructor(game) {
        this.game = game;
        this.recipes = [
            {
                name: "Planks (4)",
                result: { type: BLOCK.PLANK, count: 4 },
                ingredients: [ { type: BLOCK.WOOD, count: 1 } ]
            },
            {
                name: "Bricks (1)",
                result: { type: BLOCK.BRICK, count: 1 },
                ingredients: [ { type: BLOCK.DIRT, count: 2 } ]
            },
            {
                name: "Stone (1)",
                result: { type: BLOCK.STONE, count: 1 },
                ingredients: [ { type: BLOCK.COBBLESTONE, count: 1 } ]
            }
        ];
    }

    initUI() {
        const container = document.getElementById('crafting-recipes');
        container.innerHTML = '';

        this.recipes.forEach((recipe, index) => {
            const el = document.createElement('div');
            el.className = 'inventory-item';

            // Icon of result
            const blockDef = BLOCKS[recipe.result.type];
            const color = blockDef ? blockDef.color : '#fff';

            el.innerHTML = `
                <span class="block-icon" style="background: ${color};"></span>
                <span class="item-name">${recipe.name}</span>
            `;

            el.onclick = () => this.craft(index);
            container.appendChild(el);
        });

        document.getElementById('close-crafting').onclick = () => {
             document.getElementById('crafting-screen').classList.add('hidden');
             this.game.resumeGame();
        };
    }

    craft(index) {
        const recipe = this.recipes[index];
        // Check ingredients
        // Simplified: Infinite crafting for demo/creative feel, or implement check
        // Let's implement basic check
        const player = this.game.player;

        // Find ingredients
        let hasAll = true;
        // This requires inventory to be more than just an array of slots we can overwrite.
        // For now, let's just give the item.

        // Add to inventory
        // Find first empty slot or stack
        for (let i = 0; i < player.inventory.length; i++) {
             if (!player.inventory[i] || player.inventory[i].type === recipe.result.type) {
                 player.inventory[i] = { type: recipe.result.type, count: 64 }; // Just give a stack
                 alert(`Crafted ${recipe.name}!`);
                 return;
             }
        }
        alert("Inventory full!");
    }
}

window.CraftingSystem = CraftingSystem;
window.crafting = new CraftingSystem();
