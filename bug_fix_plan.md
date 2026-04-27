## Plan

1. **Fix `Vehicle` item dropping:**
   - In `js/vehicle.js`, update `Vehicle.takeDamage` method.
   - Replace the `if (this.game && this.game.spawnItem)` block with `this.game.drops.push(new window.Drop(this.game, this.x, this.y, this.z, dropType, 1))`. This addresses the issue where `this.game.spawnItem` is not implemented in `js/game.js`, correctly using `Drop` class to spawn the vehicle item.

2. **Write a test script:**
   - Create a test script using Playwright or JS (like mocha + JSDOM) to verify the item drop functionality when vehicles (e.g., boat, minecart) take damage and are destroyed.

3. **Run the test script:**
   - Ensure the new logic works correctly.
   - If there are other tests failing, investigate and fix them.

4. **Update `FUTURE_FEATURES.md`:**
   - Mark the following task as complete:
     `- [ ] **Bug: Vehicle item drops missing Drop class implementation**: Vehicle classes (Boat, Minecart) use this.game.spawnItem which doesn't exist. They need to be updated to use this.game.drops.push(new Drop(...)).`
     `- [ ] **Bug: Boat drops on destruction**: Destroying a boat should drop its item form instead of disappearing. (Partial: Destroying boat calls this.game.spawnItem which does not exist in game.js. Need to use this.drops.push(new Drop(...)) instead)`

5. **Complete pre-commit steps:**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

6. **Submit:**
   - Submit the fix branch.
