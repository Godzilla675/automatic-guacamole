1. **Analyze `FUTURE_FEATURES.md` against codebase**:
   - I have checked `Jungle Biome`: partially in `js/biome.js`
   - Checked `Shears`: partially in `js/mob.js` and `js/blocks.js`
   - Checked `Boat`: `js/game.js`, `js/blocks.js` (Implemented)
   - Checked `Enderman Teleportation Logic` & `Water Avoidance`: `js/mob.js` (Implemented)
   - Checked `Anvil`: `js/ui.js`, `js/blocks.js` (Implemented)
   - Checked `Weather system`: `js/renderer.js` (Implemented)
2. **Update `FUTURE_FEATURES.md`**:
   - Change `[ ] **Jungle Biome**` -> `[x] **Jungle Biome**` (It is in `js/biome.js` with tree chance, underBlock, topBlock). But wait, does it have bamboo/cocoa? It's just a basic implementation. We will mark it as `[x] **Jungle Biome**` and maybe leave bamboo separate. But `FUTURE_FEATURES.md` already has `Bamboo Jungle` as separate. I will mark `Jungle Biome` as `[x]`.
   - Update `[ ] **Implement Shears Functionality**`: The task says "(Shear sheep, leaves, grass)". Sheep shearing is implemented! Leaves and grass shearing is NOT implemented yet. I should update the note to say "(Partial: sheep shearing implemented, missing leaves/grass)".
   - Change `[ ] **Implement Endermen Teleportation Logic**`: Code has teleportation randomly on attack and taking damage in water. I will mark it as `[x]`.
   - Add new features to the list to replace the ones that are done, e.g.:
     - `**New Task: Add Armor Stand**`
     - `**New Task: Implement Name Tags**`
     - `**New Task: Add Foxes**`
     - `**New Task: Add Horses**`
3. **Format and maintain**: Ensure no real code is changed. Just the `.md` files.
4. **Pre-commit step**: Run testing/pre-commit checks.
