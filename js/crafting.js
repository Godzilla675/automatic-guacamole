class CraftingSystem {
    constructor(game) {
        this.game = game;

        this.smeltingRecipes = [
            { input: BLOCK.ORE_IRON, output: { type: BLOCK.ITEM_IRON_INGOT, count: 1 } },
            { input: BLOCK.ORE_GOLD, output: { type: BLOCK.ITEM_GOLD_INGOT, count: 1 } },
            { input: BLOCK.SAND, output: { type: BLOCK.GLASS, count: 1 } },
            { input: BLOCK.COBBLESTONE, output: { type: BLOCK.STONE, count: 1 } },
            { input: BLOCK.WOOD, output: { type: BLOCK.ITEM_COAL, count: 1 } }
        ];

        this.recipes = [
            // Basics
            {
                name: "Planks (4)",
                result: { type: BLOCK.PLANK, count: 4 },
                ingredients: [ { type: BLOCK.WOOD, count: 1 } ]
            },
            // Furnaces
            {
                name: "Furnace",
                result: { type: BLOCK.FURNACE, count: 1 },
                ingredients: [ { type: BLOCK.COBBLESTONE, count: 8 } ]
            },
            {
                name: "Stick (4)",
                result: { type: BLOCK.ITEM_STICK, count: 4 },
                ingredients: [ { type: BLOCK.PLANK, count: 2 } ]
            },
            // Ingots (Manual Smelting)
            {
                name: "Iron Ingot",
                result: { type: BLOCK.ITEM_IRON_INGOT, count: 1 },
                ingredients: [ { type: BLOCK.ORE_IRON, count: 1 } ]
            },
            {
                name: "Gold Ingot",
                result: { type: BLOCK.ITEM_GOLD_INGOT, count: 1 },
                ingredients: [ { type: BLOCK.ORE_GOLD, count: 1 } ]
            },
            // Tools - Wood
            {
                name: "Wood Pickaxe",
                result: { type: BLOCK.PICKAXE_WOOD, count: 1 },
                ingredients: [ { type: BLOCK.PLANK, count: 3 }, { type: BLOCK.ITEM_STICK, count: 2 } ]
            },
            {
                name: "Wood Sword",
                result: { type: BLOCK.SWORD_WOOD, count: 1 },
                ingredients: [ { type: BLOCK.PLANK, count: 2 }, { type: BLOCK.ITEM_STICK, count: 1 } ]
            },
            {
                name: "Wood Axe",
                result: { type: BLOCK.AXE_WOOD, count: 1 },
                ingredients: [ { type: BLOCK.PLANK, count: 3 }, { type: BLOCK.ITEM_STICK, count: 2 } ]
            },
             {
                name: "Wood Shovel",
                result: { type: BLOCK.SHOVEL_WOOD, count: 1 },
                ingredients: [ { type: BLOCK.PLANK, count: 1 }, { type: BLOCK.ITEM_STICK, count: 2 } ]
            },
            // Tools - Stone
            {
                name: "Stone Pickaxe",
                result: { type: BLOCK.PICKAXE_STONE, count: 1 },
                ingredients: [ { type: BLOCK.COBBLESTONE, count: 3 }, { type: BLOCK.ITEM_STICK, count: 2 } ]
            },
            {
                name: "Stone Sword",
                result: { type: BLOCK.SWORD_STONE, count: 1 },
                ingredients: [ { type: BLOCK.COBBLESTONE, count: 2 }, { type: BLOCK.ITEM_STICK, count: 1 } ]
            },
            {
                name: "Stone Axe",
                result: { type: BLOCK.AXE_STONE, count: 1 },
                ingredients: [ { type: BLOCK.COBBLESTONE, count: 3 }, { type: BLOCK.ITEM_STICK, count: 2 } ]
            },
             {
                name: "Stone Shovel",
                result: { type: BLOCK.SHOVEL_STONE, count: 1 },
                ingredients: [ { type: BLOCK.COBBLESTONE, count: 1 }, { type: BLOCK.ITEM_STICK, count: 2 } ]
            },
             // Tools - Iron
            {
                name: "Iron Pickaxe",
                result: { type: BLOCK.PICKAXE_IRON, count: 1 },
                ingredients: [ { type: BLOCK.ITEM_IRON_INGOT, count: 3 }, { type: BLOCK.ITEM_STICK, count: 2 } ]
            },
            {
                name: "Iron Sword",
                result: { type: BLOCK.SWORD_IRON, count: 1 },
                ingredients: [ { type: BLOCK.ITEM_IRON_INGOT, count: 2 }, { type: BLOCK.ITEM_STICK, count: 1 } ]
            },
            {
                name: "Iron Axe",
                result: { type: BLOCK.AXE_IRON, count: 1 },
                ingredients: [ { type: BLOCK.ITEM_IRON_INGOT, count: 3 }, { type: BLOCK.ITEM_STICK, count: 2 } ]
            },
             {
                name: "Iron Shovel",
                result: { type: BLOCK.SHOVEL_IRON, count: 1 },
                ingredients: [ { type: BLOCK.ITEM_IRON_INGOT, count: 1 }, { type: BLOCK.ITEM_STICK, count: 2 } ]
            },
            // Tools - Diamond
            {
                name: "Diamond Pickaxe",
                result: { type: BLOCK.PICKAXE_DIAMOND, count: 1 },
                ingredients: [ { type: BLOCK.ITEM_DIAMOND, count: 3 }, { type: BLOCK.ITEM_STICK, count: 2 } ]
            },
            {
                name: "Diamond Sword",
                result: { type: BLOCK.SWORD_DIAMOND, count: 1 },
                ingredients: [ { type: BLOCK.ITEM_DIAMOND, count: 2 }, { type: BLOCK.ITEM_STICK, count: 1 } ]
            },
            {
                name: "Diamond Axe",
                result: { type: BLOCK.AXE_DIAMOND, count: 1 },
                ingredients: [ { type: BLOCK.ITEM_DIAMOND, count: 3 }, { type: BLOCK.ITEM_STICK, count: 2 } ]
            },
             {
                name: "Diamond Shovel",
                result: { type: BLOCK.SHOVEL_DIAMOND, count: 1 },
                ingredients: [ { type: BLOCK.ITEM_DIAMOND, count: 1 }, { type: BLOCK.ITEM_STICK, count: 2 } ]
            },
            // Others
            {
                name: "Bricks (1)",
                result: { type: BLOCK.BRICK, count: 1 },
                ingredients: [ { type: BLOCK.DIRT, count: 2 } ]
            },
            {
                name: "Stone (1)",
                result: { type: BLOCK.STONE, count: 1 },
                ingredients: [ { type: BLOCK.COBBLESTONE, count: 1 } ]
            },
            {
                name: "Torch (4)",
                result: { type: BLOCK.TORCH, count: 4 },
                ingredients: [ { type: BLOCK.ITEM_STICK, count: 1 }, { type: BLOCK.ITEM_COAL, count: 1 } ]
            }
        ];
    }

    getSmeltingResult(inputType) {
        const recipe = this.smeltingRecipes.find(r => r.input === inputType);
        return recipe ? recipe.output : null;
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
            // Drop remaining items
            const player = this.game.player;
            // Throw slightly in front
            const dirX = Math.sin(player.yaw);
            const dirZ = Math.cos(player.yaw);

            if (window.Drop) {
                const drop = new window.Drop(this.game, player.x + dirX, player.y + 1.5, player.z + dirZ, typeToAdd, countToAdd);
                // Add velocity away from player
                drop.vx = dirX * 5;
                drop.vz = dirZ * 5;
                drop.vy = 5;
                this.game.drops.push(drop);
                alert(`Crafted ${recipe.name}! (Inventory full, items dropped)`);
            } else {
                alert("Inventory full! Items lost.");
            }
        } else {
             alert(`Crafted ${recipe.name}!`);
        }
    }
}

window.CraftingSystem = CraftingSystem;
