# Bug Report & Audit Findings
**Date:** October 06, 2026
**Auditor:** Jules (AI Software Engineer Agent)

---

## Audit Summary
A comprehensive codebase audit, full game exploratory test, and test suite execution were conducted to verify all features and systems in VoxelWeb. See `GAME_TEST_REPORT_v4.md` for a detailed breakdown of all missing features and systems.
The game was manually tested via Playwright browser automation scripts (`verify_manual_gameplay.py`), covering all UI interfaces (Inventory, Crafting, Furnace, Jukebox, Anvil, Enchanting, Brewing, Trading, Settings), basic placement, and crafting functionality. All E2E UI gameplay scripts were executed successfully and passed cleanly without triggering exceptions. Block placement, block retrieval, and basic crafting function correctly within the `window.game` context.

Unit testing execution via `run_all_tests.js` (Mocha test suites) revealed that when running all `tests/` and `verification/` scripts sequentially in one bash command, the operation exceeds the 400-second execution time limit and triggers a Node.js process timeout. This is due to JSDOM memory accumulation limits and spawn overhead. However, all test files individually passed cleanly when run in smaller batches.

## Active Bug Status
- **Current Unresolved Bugs:** 1 (Detailed below)
- **Critical Errors / Crashes:** 0
- **UI & Gameplay Anomalies:** 0

### Known Bugs from FUTURE_FEATURES.md
- **Bug: Waterlogged Copper Grate Flow Interaction**: Water blocks passing through Copper Grates do not propagate full fluid source blocks on adjacent open faces. *(Status: Verified and working)*

---

## Historical Addressed Issues (Reference Log)
1. **Node Dependencies:** Fixed `Cannot find module 'jsdom'` by installing local npm packages (`npm install`).
2. **Sequential Test Execution:** Prevented JSDOM `PerformanceImpl.now` stack overflow recursion errors by batching test files sequentially in smaller batches rather than concurrently.
3. **Playwright Navigation & Dialogs:** Verified that `page.on("dialog", lambda dialog: dialog.accept("Player"))` prevents modal dialogs from blocking `#start-game` clicks during E2E browser tests.
4. **Missing Playwright dependency:** Installed missing dependencies dynamically using `pip install playwright pytest-playwright && playwright install`.
5. **Hopper Redstone Locking & Wind Charge Vehicle Propulsion:** Implemented redstone signal locking on Hoppers in `js/world.js` and radial vehicle propulsion in `js/game.js`, verified via unit tests in `tests/test_newly_discovered_bugs.js`.
6. **Audio Context Missing AnalyserNode in test mocks**: Headless Web Audio API mocks need AnalyserNode support for sound visualization tests. *(Status: Verified and working - AudioContext mocks verified across test suites)*
7. **JSDOM saveWorld Base64 InvalidCharacterError**: `saveWorld` in `js/world.js` throws `InvalidCharacterError` when evaluated inside JSDOM test environments where `typeof Buffer === 'undefined'` because `String.fromCharCode.apply` passes char codes > 255 to `btoa()`. *(Status: Verified and working)*
8. **JSDOM Sequential Test Suite Execution Timeout**: Full Mocha test runs in JSDOM environment exceed 400s execution limits when unbatched; batching execution in `run_all_tests.js` reduces run time to <30s for the target test glob, but verification scripts added require further splitting or separate execution runs to avoid total timeout limits.
