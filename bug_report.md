# Bug Report (Updated)

## 1. Physics Collision Bug for Tall Blocks (Fences)
**Status**: FIXED / INVALID
**Verification**: Tested with `verification/verify_bug_fixes_v2.js`. Collision is correctly detected. The code in `js/physics.js` correctly offsets `minY` by -1.

## 2. Trapdoor Placement Anomaly
**Status**: FIXED
**Severity**: Low
**Description**: `Game.placeBlock` failed to correctly identify the top half of a block face because `Physics.raycast` returned integer coordinates instead of the exact intersection point.
**Fix**:
- Updated `Physics.raycast` in `js/physics.js` to return `point: {x, y, z}`.
- Updated `Game.placeBlock` in `js/game.js` to use `hit.point.y` for sub-block placement logic.
**Verification**: Verified with `verification/verify_bug_fixes_v2.js`. Trapdoors are now placed on the top half when aiming at the top half.

## 3. Other Feature Verification
**Status**: VERIFIED
- **Iron Golem**: Verified AI targeting Zombies (`verification/verify_mobs_advanced.js`).
- **Villager**: Verified Trading UI interaction (`verification/verify_mobs_advanced.js`).
