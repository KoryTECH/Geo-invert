# Task Brief: Common Data Format (SP first)

**Goal:** design the JSON format that C++ parsers produce and the Python service and frontend consume. Spec first, then schema, then an example. **No parser code, no C++, no routes in this task.**

## Deliverables
1. `docs/data-format.md`, spec version `0.1`
2. `docs/schemas/survey.schema.json` (JSON Schema, draft 2020-12)
3. `docs/examples/sp_example.json`: realistic SP profile, about 20 stations, plausible mV values (positive and negative anomalies)
4. Validate the example against the schema in a temporary venv outside the repo (do not add `jsonschema` to `requirements.txt`) and show the output

## Format requirements
- Top level: `format_version`, `method` (`"sp"` now; `"ves"`, `"hp"`, `"ert2d"`, `"ip"`, `"ert3d"` reserved), survey metadata (title, date, operator, site, CRS code, explicit units: meters, mV), instrument metadata (name, electrode type, free text), and a method-specific `data` block.
- SP data block: base (reference) station with id and coordinates; list of stations (id, x, y, optional z, measured potential in mV, line/profile id); optional repeat readings; optional drift or loop-closure correction fields with **raw and corrected values kept separate, never overwritten**; polarity convention field.
- Per-reading quality flag (`ok`, `suspect`, `rejected`) plus a free-text note. The original raw value is always preserved.
- Provenance: source file name, parser name and version, hash of the source file.
- Reserve but do **not** fully specify the VES/HP/2D ERT additions (array type, electrode positions, current/potential pairs, injected current, measured voltage, geometric factor, apparent resistivity). Put them in an "extension plan" section as TODO.

## Rules
- SI units, stated explicitly.
- Do not silently choose geophysics conventions. List ambiguous ones under **Open questions for the geophysicist** (sign convention, drift correction method, coordinate order, base-station handling).
- End with the open-questions list and a short summary of design choices.

## Review checklist (done in the Claude review step)
- Example validates against the schema (real output shown)
- Raw and corrected values are separate fields
- Open questions list is real, not empty
- Nothing outside `docs/` changed
