# Known Issues and Lessons

## Lessons
- **Alpine vs glibc:** pyGIMLi's compiled core (pgcore) has no musl wheels. Use Ubuntu.
- **CMake toolchain:** `CMAKE_TOOLCHAIN_FILE` set after `project()` is ignored. The preset in `backend/CMakePresets.json` supplies it. Don't re-add the `set(...)` line.
- **Blank React page:** a missing import (`Navigate`) passes the build and crashes at runtime. Check the browser console; the `ErrorBoundary` now shows errors on the page.
- **MinIO is gone:** community images were withdrawn. Use SeaweedFS.
- **Agent reports describe what the agent did, not always what is true.** Run the checks yourself. One agent worked around a blocker (a chroot) instead of stopping.
- **Free model limits:** usage caps can block an AI tool for a day. Keep the manual terminal path working.

## Open items
- Verify pyGIMLi inside the container
- Inspect the Postgres schema against the planned tables
- Decide where authentication lives
- Encryption at rest on SeaweedFS is off (fine for dev, revisit before deployment)
