# Review Request: Stage 2 — SP data format (spec v0.1)

**Branch:** task/sp-data-format
**Brief:** vault/06 Stage 2 SP Data Format Brief.md

## What changed

- `docs/data-format.md` — new: format spec v0.1 (SP only), design rules, field tables, extension plan (TODO) for VES/HP/2D ERT, 9 open questions, design-choice summary.
- `docs/schemas/survey.schema.json` — new: JSON Schema draft 2020-12 for the whole file; method-conditional `data` validation (strict for `sp`, any-object for reserved methods); raw/corrected/correction pairing enforced by the schema.
- `docs/examples/sp_example.json` — new: synthetic SP profile, 20 stations at 10 m spacing, negative anomaly (min −41.6 mV raw near x=100 m) and positive anomaly (14.5 mV raw near x=180 m), one `suspect` station with two repeat readings, one `rejected` station keeping its raw value, linear loop-closure drift correction with raw and corrected kept separate.
- `vault/reviews/sp-data-format.md` — this review request (required by AI rule 10; vault is untracked in git right now).

## Commands run and real output

Branch (no commit, no push):

```console
$ git switch -c task/sp-data-format
Switched to a new branch 'task/sp-data-format'
$ git branch --show-current
task/sp-data-format
```

Source hash used in the example's `provenance.source_sha256` (hash of a real placeholder string, not of a field file — the source file itself is hypothetical):

```console
$ printf '%s' 'synthetic placeholder content hashed for the example provenance field (not a real field file)' | sha256sum
7314719c2d9af4b38a611c93bfbe8c09b604f0ce211dd3811bbcc1fb8df88b45  -
```

Validation venv, outside the repo (`jsonschema` NOT added to `inversion-service/requirements.txt`):

```console
$ python3 -m venv /tmp/opencode/sp-venv
$ /tmp/opencode/sp-venv/bin/pip install --quiet jsonschema
$ /tmp/opencode/sp-venv/bin/pip show jsonschema | head -2
Name: jsonschema
Version: 4.26.0
```

Validator script kept at `/tmp/opencode/validate_sp_example.py` (repo-untracked); it loads the schema, runs `Draft202012Validator.check_schema`, then validates the example with `FormatChecker` enabled (so `date`/`date-time` strings are checked):

```console
$ /tmp/opencode/sp-venv/bin/python /tmp/opencode/validate_sp_example.py; echo "EXIT: $?"
schema OK: /workspaces/Geo-invert/docs/schemas/survey.schema.json (draft 2020-12)
VALID: /workspaces/Geo-invert/docs/examples/sp_example.json
  validated against /workspaces/Geo-invert/docs/schemas/survey.schema.json
  stations: 20, method: sp
EXIT: 0
```

Negative test (copy of the example with 2 deliberate violations injected, kept in /tmp) — proves the validator rejects, not rubber-stamps:

```console
$ /tmp/opencode/sp-venv/bin/python - <<'PY'
... (loads sp_example_bad.json: corrected without correction, and units "V")
negative test: 2 violation(s) found (expected: 2):
 - $data.stations.0.potential_mv -> 'correction' is a required property
 - $survey.units.potential -> 'mV' was expected
PY
```

Git state (nothing committed, per rule 9):

```console
$ git status --short
 A docs/data-format.md
 A docs/examples/sp_example.json
 A docs/schemas/survey.schema.json
?? vault/
$ git diff main...HEAD --stat
(empty output — there are no commits on the branch)
$ git diff --stat
 docs/data-format.md             | 191 ++++++++++++++++++++++++++++++++++++++
 docs/examples/sp_example.json   | 199 ++++++++++++++++++++++++++++++++++++++++
 docs/schemas/survey.schema.json | 193 ++++++++++++++++++++++++++++++++++++++
 3 files changed, 583 insertions(+)
```

## Deviations from the brief

- `git add -N` (intent-to-add) was used on the three docs files so `git diff` shows their content while nothing is committed. No commit was made (rule 9); the index entry can be undone with `git restore --staged` if unwanted.
- Because there are no branch commits, the vault's review-flow command `git diff main...HEAD` is empty by construction. The working-tree diff was saved to `/tmp/review.diff` (601 lines) instead; full file contents are also in the repo under `docs/`.
- The negative-test run is extra, not requested by the brief; its artifacts live only in `/tmp/opencode/`.
- Local `main` is 1 commit behind `origin/main` (`cb667e9 "added a vault for easy access from claude"`); not pulled — no authorization to change `main`, and it does not affect this docs-only branch.

## Open questions

Geophysics (full list in docs/data-format.md §10; needs a human decision before parsers are written):

1. Polarity/sign convention — what does the instrument's displayed sign actually mean (roving vs base electrode)?
2. Drift-correction policy — linear distribution between loop closures (as in the example), per-line rate, or no correction in the parser at all?
3. Coordinate order/meaning — `x`=easting, `y`=northing for projected CRS? Is a geographic CRS even allowed?
4. Base-station handling — per survey or per line; may the base coincide with a station id?
5. `z` semantics — orthometric elevation vs ellipsoidal height, which datum?
6. Repeat-reading aggregation — authoritative value when repeats disagree (format currently keeps all, decides nothing).
7. Source hash — is SHA-256 acceptable to existing field software?
8. Timestamps — UTC everywhere (as in the example) or local field time?
9. Rejected readings — inline with `quality: "rejected"` (current choice) or a separate list?

Process:

- The example's drift correction applies a concrete method ("linear distribution by station index") as an illustration; it is flagged `EXAMPLE ONLY, NOT CONFIRMED` in `polarity_convention` and in the open questions — please confirm or correct.
- The example's `provenance.source_sha256` is a real SHA-256 of a synthetic placeholder string (the hypothetical source CSV does not exist); a real parser must hash the actual source file.

## Diff

Nothing committed, so `git diff main...HEAD` is empty (see real output above). Working-tree diff of the three files: `git diff` → 583 insertions, saved to `/tmp/review.diff`. The three files' full contents are the deliverables: `docs/data-format.md` (191 lines), `docs/schemas/survey.schema.json` (193 lines), `docs/examples/sp_example.json` (199 lines).
