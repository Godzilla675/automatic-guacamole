# Agent Instructions & Guidelines

This is the working agreement for every agent (and human) that opens a PR against this repository.
The game is a plain-JavaScript, no-build-step voxel game; the rules below exist because hundreds of
small feature PRs taught us what breaks it.

## 🚨 Priority Hierarchy

Pick work in this order. Do **not** start a new feature while something higher on the list is open.

1. **A broken game or a red test suite.** If `npm test` fails on `main`, or the game does not boot in a
   browser, fixing that is the only acceptable task.
2. **Bugs** listed under *🐛 Bugs & Defects* in `FUTURE_FEATURES.md` (or in GitHub issues).
3. **Engineering & Architecture** tasks in `FUTURE_FEATURES.md`. These make every later feature cheaper
   and safer; they are deliberately ranked above new content.
4. **New features / content** from the themed sections of `FUTURE_FEATURES.md`.
5. **Documentation and polish.**

Rule of thumb: a feature PR that lands without a test, or that makes an existing test flaky, is a net
negative for this project even if the feature works.

## 📋 Task Workflow

1. **Read `FUTURE_FEATURES.md`.** It only contains *open* work. Everything already shipped is archived in
   `docs/COMPLETED_FEATURES.md` - do not re-add archived items and do not re-implement them.
2. **Pick exactly one task per PR.** Say which line you are taking in the PR description.
3. **Reproduce first** (for bugs): write the failing test, then fix it.
4. **Implement** following the Development Guidelines below.
5. **Verify**: run the full suite (`npm test`) and, for anything touching `game.js`, `world.js`,
   `renderer.js`, `index.html` or `ui.js`, also boot the game in a browser or in the JSDOM harness and
   play a few seconds (place/break a block, open the inventory, walk).
6. **Update tracking** in the same PR:
   - remove the finished line from `FUTURE_FEATURES.md` and add it (checked, `[x]`) to
     `docs/COMPLETED_FEATURES.md`;
   - add any bug you discovered to *🐛 Bugs & Defects* with a reproduction;
   - add new ideas to the matching themed section, one line each, after checking for duplicates.
7. **PR description**: what changed, why, how it was verified (paste the `npm test` summary line).

## 🛠️ Development Guidelines

### Architecture (where code goes)
- `js/` files are classic browser scripts loaded by `index.html` in a fixed order; there is no bundler.
  A new file must be added to `index.html` **and** to any test harness list that enumerates scripts
  (`tests/helpers/game_env.js` reads `index.html`, so the harness picks it up automatically).
- **Do not grow the god-methods.** `Game.interact()`, `Game.startAction()`, `Game.placeBlock()` and
  `Game.update()` are already hundreds of lines of `if (type === BLOCK.X)`. New behaviour goes into a
  registry instead:
  - right-click on a block -> `BlockInteractions.register(BLOCK.X, handler)` in `js/interactions.js`;
  - periodic block logic -> a block entity (`world.setBlockEntity`) that is ticked, never a per-frame
    scan of all loaded chunks (see `World.updateHoppers` for the pattern);
  - item-use / placement rules -> see the open registry tasks in *Engineering* before adding another
    branch.
- World generation must go through `World.generateChunk()`; any `world.setBlock` inside generation is
  automatically treated as terrain (not a player edit) and skips the per-block light recalculation.
  Blocks changed by gameplay flag the chunk `edited`, which keeps it alive when it scrolls out of range.
- Per-frame code must be O(entities), never O(blocks). Never iterate every block of every loaded chunk
  inside `update()` or `render()`.
- The game must survive a thrown exception in one system: wrap new per-frame subsystems so an error is
  reported via `game.reportFrameError(...)` rather than killing the loop.
- Keep `window.*` lookups out of hot loops (cache `BLOCK`/`BLOCKS` in a local const).

### Tests
- Every behaviour change ships with a test in `tests/`. Name the file after the feature
  (`test_hoppers.js`), never after a batch number.
- Use the shared harness:
  ```js
  const { createGameEnv } = require('./helpers/game_env');
  const env = createGameEnv();          // isolated JSDOM window with every js/ script loaded
  const game = env.createGame();        // new window.Game(); call game.init() only if you really need it
  ```
  It evaluates scripts inside the window's own VM context, so **no `global.window = ...` pollution**.
  Objects from the game window live in a different realm: use `assert.deepEqual`, not `deepStrictEqual`.
- `game.init()` is slow under JSDOM (seconds). Prefer `world.generateChunk(0, 0)` and direct calls.
- Run the whole suite with `npm test` (per-file processes). `npx mocha tests/*.js` in one process is
  **not** a valid signal - legacy files share globals and fail spuriously that way.
- Texture tests need the native `canvas` package; if it is missing locally those files fail with
  `Cannot find module 'canvas'` and nothing else - CI has it. Do not "fix" them by stubbing canvas in
  committed code.
- Never delete or weaken an existing test to make a PR green. If a test is wrong, say so in the PR.

### Hygiene
- No scratch files, screenshots, reports or `verify_*.js` scripts in the repository root. Browser smoke
  scripts belong in `scripts/e2e/`, write-ups in `docs/reports/`.
- Do not commit `node_modules/`, `test-results/`, or images produced by test runs (see `.gitignore`).
- Do not delete, rename or wholesale rewrite `FUTURE_FEATURES.md`, `docs/COMPLETED_FEATURES.md`,
  `AGENTS.md` or `README.md`; edit the relevant lines.
- Keep PRs small. One task, one PR, a handful of files. Large "batch of 5 features" PRs are rejected.

## ✅ Definition of Done

A task is done when all of the following are true:

- [ ] `npm test` passes (paste the final `Files: N/N passed   Tests: ...` line in the PR).
- [ ] `node --check` passes for every file you touched.
- [ ] The game boots (`python3 -m http.server 8000`, open `index.html`) with no console errors, and the
      touched feature was exercised by hand or by a test that goes through the real `Game` object.
- [ ] A regression test exists for the change.
- [ ] `FUTURE_FEATURES.md` / `docs/COMPLETED_FEATURES.md` were updated.
- [ ] No new file in the repository root; no generated artifacts committed.
