# Bug Report

## 1. Physics Collision Bug for Tall Blocks (Fences)
**Severity**: High
**Description**: The `Physics.checkCollision` method fails to detect collisions with blocks that are taller than 1.0 block (like Fences, which are 1.5 blocks high) if the collision AABB's bottom `y` is above the block's base `y`.
**Reproduction**:
1. Place a Fence at `y=10`.
2. Move player/entity to `y=11.2`.
3. Check collision.
**Expected**: Collision detected (Fence extends to `y=11.5`).
**Actual**: No collision detected.
**Root Cause**: The collision loop calculates `minY` based on `Math.floor(box.y)`. If `box.y` is 11.2, `minY` is 11. The loop checks blocks starting at `y=11`. It misses the fence rooted at `y=10` that extends upwards.
**Fix**: Adjust `minY` in the loop to look one block below (`Math.floor(box.y) - 1`) to catch tall blocks.

## 2. Trapdoor Placement Anomaly
**Severity**: Low/Unconfirmed
**Description**: In verification tests, `placeBlock()` failed to place a Trapdoor when simulating a click on the top half of a neighbor face.
**Observations**:
- `Glass Pane` placed correctly using `world.setBlock`.
- `Trapdoor` failed using `game.placeBlock`.
- Requires further investigation into `Game.placeBlock` logic or test harness setup.
