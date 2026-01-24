# Test Report & Bug Findings

## Summary
A new test suite `tests/test_new_features.js` was created to verify recently added features: Inventory UI, Furnace Logic, Farming, Bed Interaction, and Settings.

The tests revealed 3 confirmed bugs and 1 test setup issue.

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
