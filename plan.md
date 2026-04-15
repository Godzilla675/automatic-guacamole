1.  **Bug: Boat drops on destruction**:
    *   **Issue**: `takeDamage` is not fully implemented in `Vehicle` class (`Boat` and `Minecart`), making them indestructible or not dropping items when destroyed. Also, `Vehicle.js` currently misses `takeDamage` implementation which handles their destruction.
    *   **Solution**: Implement `takeDamage(amount)` in `Vehicle` (or `Boat`/`Minecart`) class. When health drops to 0, set `isDead = true`, eject the rider if any, and spawn the corresponding item form (e.g., `BLOCK.ITEM_BOAT` or `BLOCK.ITEM_MINECART`).
    *   **Files to Modify**: `js/vehicle.js`. I will add a `health` property to the `Vehicle` constructor and implement the `takeDamage` method to handle destruction and item dropping.

2.  **Complete pre commit steps**:
    *   Complete pre commit steps to ensure proper testing, verification, review, and reflection are done before submission.

3.  **Submit the change**:
    *   Submit the code with an appropriate commit message.
