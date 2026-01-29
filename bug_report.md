# Test Report & Bug Findings

## Summary
A new test suite `tests/test_new_features.js` was created to verify recently added features: Inventory UI, Furnace Logic, Farming, Bed Interaction, and Settings.
Additional verification `verification/verify_all_new_features.js` was created for Stairs, Doors, Slabs, Tool Repair, Water Flow, and Spruce Trees.

The tests revealed confirmed bugs in the Door implementation.

## Bugs Found & Fixed

### 1. Bed Night Skip Logic is Incorrect (FIXED)
**Severity**: High
**Location**: `js/game.js` in `Game.interact`
**Description**: The logic to skip the night does not correctly advance the time to morning.
**Fix**: Updated the time calculation logic to correctly add the remaining time to reach the next morning.

### 2. Settings Volume Slider Not Working (FIXED)
**Severity**: Medium
**Location**: `js/game.js` and `js/ui.js`
**Description**: The event listener for the volume slider is defined in `UIManager.init()`, but `Game.init()` never calls `this.ui.init()`.
**Fix**: Added `this.ui.init()` call in `Game.init()`.

### 3. Missing AudioContext Mock Method (FIXED)
**Severity**: Low (Test Environment Only)
**Location**: `tests/test_new_features.js`
**Description**: The `AudioContext` mock used in tests is missing `exponentialRampToValueAtTime`.
**Fix**: Updated the mock in the test file.

### 4. Door Implementation Incomplete (FIXED)
**Severity**: Medium
**Location**: `js/game.js`, `js/physics.js`, `js/renderer.js`
**Description**:
*   **Placement**: Doors ignored player yaw and always placed with default orientation.
*   **Interaction**: Toggled Bit 0 instead of Bit 2 (Value 4) for Open/Closed state, conflicting with spec.
*   **Collision**: Checked Bit 0 for Open state (incorrect). Closed doors acted as full blocks instead of thin slabs.
*   **Rendering**: Checked Bit 0 for transparency (incorrect).
**Fix**:
*   Updated `Game.placeBlock` to set metadata based on yaw (Bits 0-1) and `Game.interact` to toggle Bit 2.
*   Updated `Physics.checkCollision` to check Bit 2 and implement thin bounding boxes for closed doors based on orientation.
*   Updated `Renderer.render` to check Bit 2 for transparency.

## Test Anomalies (RESOLVED)

### 1. Inventory Test Setup
**Description**: The Inventory UI test failed because the `Player` constructor initializes the inventory with default items.
**Fix**: Cleared the player's inventory before running inventory tests.

## Verification Status

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Inventory UI** | ✅ Verified | Drag & Drop, Stacking, Swapping working. |
| **Furnace Logic** | ✅ Verified | Fuel consumption, progress, and output generation work. |
| **Farming** | ✅ Verified | Hoe usage and planting seeds work. |
| **Bed Interaction** | ✅ Verified | Night skipping now works correctly. |
| **Settings** | ✅ Verified | Volume control binding works. |
| **Stairs** | ✅ Verified | Orientation and L-shape collision working. |
| **Doors** | ✅ Verified | Orientation, Open/Close logic, and Collision working. |
| **Slabs** | ✅ Verified | Half-block collision working. |
| **Tool Repair** | ✅ Verified | Crafting combination adds durability bonus. |
| **Water Flow** | ✅ Verified | Infinite source creation working. |
| **Spruce Trees** | ✅ Verified | Snow biome generates Spruce Wood/Leaves. |
