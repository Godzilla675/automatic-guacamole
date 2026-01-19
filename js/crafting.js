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
        const player = this.game.player;
        const inventory = player.inventory;

        // 1. Check if player has all ingredients
        for (const ingredient of recipe.ingredients) {
            let countFound = 0;
            for (const slot of inventory) {
                if (slot && slot.type === ingredient.type) {
                    countFound += slot.count;
                }
            }
            if (countFound < ingredient.count) {
                alert(`Not enough resources! Need ${ingredient.count} of block ID ${ingredient.type}`);
                return;
            }
        }

        // 2. Remove ingredients
        for (const ingredient of recipe.ingredients) {
            let countToRemove = ingredient.count;
            for (let i = 0; i < inventory.length; i++) {
                const slot = inventory[i];
                if (slot && slot.type === ingredient.type) {
                    if (slot.count >= countToRemove) {
                        slot.count -= countToRemove;
                        countToRemove = 0;
                        if (slot.count === 0) inventory[i] = null;
                    } else {
                        countToRemove -= slot.count;
                        inventory[i] = null;
                    }
                    if (countToRemove === 0) break;
                }
            }
        }

        // 3. Add result to inventory
        let countToAdd = recipe.result.count;
        const typeToAdd = recipe.result.type;

        // Try to stack first
        for (let i = 0; i < inventory.length; i++) {
            const slot = inventory[i];
            if (slot && slot.type === typeToAdd && slot.count < 64) {
                const space = 64 - slot.count;
                const toAdd = Math.min(space, countToAdd);
                slot.count += toAdd;
                countToAdd -= toAdd;
                if (countToAdd <= 0) break;
            }
        }

        // Put remaining in empty slot
        if (countToAdd > 0) {
            for (let i = 0; i < inventory.length; i++) {
                if (inventory[i] === null) {
                    inventory[i] = { type: typeToAdd, count: countToAdd };
                    countToAdd = 0;
                    break;
                }
            }
        }

        if (countToAdd > 0) {
            alert("Inventory full! Some items dropped (logic not implemented for drops yet)");
            // In a real game we would drop item entity
        } else {
             alert(`Crafted ${recipe.name}!`);
        }
    }
}

window.CraftingSystem = CraftingSystem;
window.crafting = new CraftingSystem();
