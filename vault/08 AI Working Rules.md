# AI Working Rules

Read these before changing any code. They apply to every AI tool used on this repo.

1. **Work on a branch**, never directly on `main`. Name it `task/<short-name>`.
2. **One task at a time**, scoped by a task brief. Touch only the files the brief names.
3. **Never write inversion or numerical geophysics logic.** pyGIMLi does that. If a task seems to need custom numerical code, stop and ask.
4. **Do not change** `infra/`, `.devcontainer/`, `backend/CMakePresets.json`, or `inversion-service/requirements.txt` pins unless the brief says so.
5. **Do not invent geophysics conventions.** List ambiguities as open questions.
6. **Run what you claim.** Report real command output. If something could not be run, say so; don't say "should work".
7. **No workarounds around blockers** (chroot hacks, disabling checks, weakening tests). Stop and report the blocker.
8. **Keep secrets out of git.** Dev credentials only; no real keys.
9. **Don't commit or push.** Leave changes on the branch for review.
10. When finished, produce a **review request** ([[Templates/Review Request]]).

## Review flow (before anything reaches `main`)
1. The AI tool finishes on a branch and fills in a review request.
2. In the terminal: `git diff main...HEAD > /tmp/review.diff` (and `git status --short`).
3. Paste the review request and the diff to Claude for review.
4. Fix what the review finds, re-run the checks.
5. Only after approval: merge to `main`, then push.
