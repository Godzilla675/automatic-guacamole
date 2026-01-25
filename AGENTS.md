# Agent Instructions & Guidelines

This document outlines the priorities and workflow for all agents working on this repository.

## 🚨 Priority Hierarchy

You must strictly follow this priority order when selecting tasks:

1.  **HIGH PRIORITY: New Features & Game Improvements**
    *   Implementing missing features from `FUTURE_FEATURES.md`.
    *   Enhancing existing gameplay mechanics.
    *   Adding new content (blocks, mobs, items).

2.  **MEDIUM PRIORITY: Bug Fixes**
    *   Fixing reported bugs in `FUTURE_FEATURES.md` or the issue tracker.
    *   Addressing critical runtime errors or crashes.
    *   Fixing features that were marked as "Done" but failed verification.

3.  **LOW PRIORITY: Code Quality & Refactors**
    *   Refactoring code for better readability or performance (unless critical for a feature).
    *   Adding tests (unless part of a feature implementation).
    *   Documentation updates.

## 📋 Task Management Workflow

Every time you run, you must perform the following:

1.  **Check `FUTURE_FEATURES.md`**: This is the source of truth for all tasks.
2.  **Verify Implementation**:
    *   Check if features marked as TODO are actually implemented in the codebase.
    *   **Crucial:** If a feature is marked as completed `[x]`, you must **verify** it works correctly by reading the code or running tests.
    *   If implemented **correctly**, leave it as `[x]`.
    *   If implemented **incorrectly** or partially, you must:
        1.  Uncheck it or leave it checked but...
        2.  **Add a new specific task** to the "Bugs & Maintenance" section of `FUTURE_FEATURES.md` detailing what is broken or missing (e.g., "Fix Water Flow Visuals").
3.  **Select Next Task**: Pick the highest priority unimplemented feature (top of the list).
4.  **Update Tracking**:
    *   Once you complete a task, mark it as `[x]` in `FUTURE_FEATURES.md`.
    *   If you discover new bugs, add them to the "Bugs" section.
    *   If you think of a new feature, add it to the appropriate section.

## 🛠️ Development Guidelines

*   **Verify Your Work**: Always run `list_files` or `read_file` to confirm your changes.
*   **Test**: Run relevant tests or create verification scripts.
*   **Maintain Scope**: Do not delete `FUTURE_FEATURES.md` or `AGENTS.md`.
