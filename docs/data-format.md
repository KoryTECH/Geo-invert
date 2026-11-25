# Geo-Invert common data format — SP profile

Spec version: **0.1** (mirrors `format_version` in the file)
Status: draft for review
Schema: `docs/schemas/survey.schema.json` (JSON Schema, draft 2020-12)
Example: `docs/examples/sp_example.json`

This document specifies the JSON format that C++ parsers produce and that the
Python service and frontend consume. Version 0.1 fully specifies the SP
profile method only. Other methods are reserved (see [Extension plan](#8-extension-plan-todo)).
This task specifies data only: no parser code, no C++, no routes.

## 1. Design rules

1. **SI units, stated explicitly.** Every file carries a `survey.units` block
   (`"length": "m"`, `"potential": "mV"`). Nothing is implied.
2. **Raw values are immutable.** A correction is stored as a separate
   `corrected` value next to the `raw` value plus a `correction` description.
   Raw values are never overwritten, never removed — including for readings
   flagged `rejected`.
3. **Every reading carries a quality flag** (`ok`, `suspect`, `rejected`) and
   may carry a free-text `note`.
4. **One file, one survey.** The file must be producible by a C++ parser in the
   backend and consumable by the Python service and frontend without extra
   side files.
5. **No invented geophysics conventions.** Anything ambiguous is listed in
   [Open questions](#10-open-questions-for-the-geophysicist), not silently
   decided.

## 2. Top-level object

| Field            | Type   | Required | Meaning                                                                 |
|------------------|--------|----------|-------------------------------------------------------------------------|
| `format_version` | string | yes      | `"0.1"` for this spec.                                                  |
| `method`         | string | yes      | `"sp"` now; `"ves"`, `"hp"`, `"ert2d"`, `"ip"`, `"ert3d"` reserved.     |
| `survey`         | object | yes      | Survey metadata (see §3).                                               |
| `instrument`     | object | yes      | Instrument metadata (see §4).                                           |
| `provenance`     | object | yes      | Source-file provenance (see §5).                                        |
| `data`           | object | yes      | Method-specific data block (§6 for SP; reserved methods see §8).        |

Unknown top-level fields are rejected by the schema (`additionalProperties:
false`) so that format drift fails loudly instead of silently.

## 3. Survey metadata (`survey`)

| Field      | Type   | Required | Meaning                                                          |
|------------|--------|----------|------------------------------------------------------------------|
| `title`    | string | yes      | Human-readable survey title.                                     |
| `date`     | string | yes      | Survey date, RFC 3339 `full-date` (`YYYY-MM-DD`).                |
| `operator` | string | yes      | Operator / crew name (free text).                                |
| `site`     | string | yes      | Site name or description (free text).                            |
| `crs`      | string | yes      | CRS identifier string, e.g. `"EPSG:32632"` (open question: format and coordinate order). |
| `units`    | object | yes      | `{"length": "m", "potential": "mV"}`. Both constants are enforced by the schema. |
| `notes`    | string | no       | Free-text survey notes.                                          |

## 4. Instrument metadata (`instrument`)

| Field            | Type   | Required | Meaning                                    |
|------------------|--------|----------|--------------------------------------------|
| `name`           | string | yes      | Instrument name/model (free text).         |
| `electrode_type` | string | yes      | Electrode type (free text).                |
| `notes`          | string | no       | Free-text instrument notes.                |

## 5. Provenance (`provenance`)

| Field            | Type   | Required | Meaning                                            |
|------------------|--------|----------|----------------------------------------------------|
| `source_file`    | string | yes      | Name of the source file the parser read.           |
| `parser_name`    | string | yes      | Name of the parser that produced the file.         |
| `parser_version` | string | yes      | Version of that parser.                            |
| `source_sha256`  | string | yes      | SHA-256 of the source file, 64 lowercase hex chars (open question: algorithm choice). |
| `parsed_at`      | string | no       | Parse timestamp, RFC 3339 date-time.               |

## 6. SP data block (`data`, when `method` is `"sp"`)

| Field                 | Type   | Required | Meaning                                                                 |
|-----------------------|--------|----------|-------------------------------------------------------------------------|
| `base_station`        | object | yes      | Base (reference) station: `id`, `x`, `y` (meters), optional `z`.        |
| `polarity_convention` | string | yes      | Explicit statement of the sign convention used by the values. Not defaulted (open question). |
| `stations`            | array  | yes      | List of station records, at least one.                                  |

Each station record:

| Field             | Type   | Required | Meaning                                                                       |
|-------------------|--------|----------|-------------------------------------------------------------------------------|
| `id`              | string | yes      | Station id.                                                                   |
| `x`, `y`          | number | yes      | Coordinates in meters (see open question on coordinate order/meaning).        |
| `z`               | number | no       | Optional elevation/height in meters (open question on datum).                 |
| `line_id`         | string | yes      | Line / profile id.                                                            |
| `potential_mv`    | object | yes      | Reading: `raw` (mV) required; optional `corrected` (mV) and `correction` (see below). |
| `quality`         | string | yes      | `ok`, `suspect` or `rejected`.                                                |
| `note`            | string | no       | Free-text note for this reading.                                              |
| `repeat_readings` | array  | no       | Optional list of repeat readings (see below).                                 |

### 6.1 `potential_mv`: raw and corrected kept separate

- `raw` — the original measured value in mV. Always present, never overwritten.
- `corrected` — the value after an explicitly described correction. Present
  only together with `correction`; the schema enforces the pairing
  (`corrected` present **iff** `correction` present).
- `correction` — object describing what was applied:
  - `type`: `"drift"` or `"loop_closure"`,
  - `description`: free text (which method, over what baseline),
  - `applied_at`: optional RFC 3339 date-time.

When no correction was applied, only `raw` is present. A `rejected` reading
normally has no correction and no corrected value — the raw value is kept so
nothing is lost.

### 6.2 Repeat readings

Each entry of `repeat_readings` is an additional independent reading with its
own `raw` value (mV), optional `time` (RFC 3339 date-time) and optional `note`.
Repeats are preserved as measured; the format does **not** aggregate them
(open question on aggregation policy).

## 7. Validation

Validate the example against the schema (draft 2020-12) with the `jsonschema`
package in a throwaway venv outside the repo (do **not** add it to
`inversion-service/requirements.txt`):

```console
$ python3 -m venv /tmp/opencode/sp-venv
$ /tmp/opencode/sp-venv/bin/pip install jsonschema
$ /tmp/opencode/sp-venv/bin/python /tmp/opencode/validate_sp_example.py
```

The validator script loads `docs/schemas/survey.schema.json`, checks the schema
itself, and validates `docs/examples/sp_example.json` with the format checker
enabled (so `date` / `date-time` strings are actually checked).

## 8. Extension plan (TODO)

Reserved `method` values `"ves"`, `"hp"`, `"ert2d"`, `"ip"`, `"ert3d"` are
accepted by the schema but their `data` layout is deliberately **not**
specified yet. TODO for a later spec version:

- **VES / HP:** array type (Schlumberger/Wenner/etc. — not chosen here),
  electrode positions (A, M, N, B or half-spacing), injected current (mA or A —
  to be decided), measured voltage (mV or V — to be decided), geometric factor,
  apparent resistivity (Ω·m) and whether it is stored raw, corrected, or both.
- **2D ERT (`ert2d`) / IP:** the above plus per-quadrupole current/potential
  electrode pairs, sequence number, and how IP chargeability values relate to
  the resistance readings.
- **3D ERT (`ert3d`):** electrode grid definition and per-quadripole mapping
  into the grid.

For reserved methods the schema only requires `data` to be an object; any
string fields that later become structured must not be relied upon yet.

## 9. Summary of design choices

- Units are constants enforced by the schema (`m`, `mV`), not free strings, so
  a parser cannot drift into V or feet unnoticed.
- `potential_mv` is an object with `raw` always present and `corrected`
  optional; the schema forces `corrected` and `correction` to appear together,
  which makes "silently overwriting raw" impossible by construction.
- Quality flag per reading; rejected readings stay in `stations` with their raw
  value preserved rather than being dropped or moved.
- Provenance is a top-level block tied to the source file, not to stations.
- Repeat readings are kept verbatim; no aggregation happens in the format.
- Reserved methods are accepted but unvalidated beyond "must be an object", to
  keep v0.1 scope SP-only without blocking parser work on other methods.

## 10. Open questions for the geophysicist

1. **Polarity / sign convention.** Does a positive mV value mean the roving
   electrode is at higher potential than the base electrode, and is that the
   instrument's displayed sign or a parser-applied convention?
2. **Drift correction method.** Loop closures → linear distribution between
   closures? Per-line single drift rate? No drift correction in the parser
   (corrections left to the analysis stage)? The schema supports any of these;
   the *policy* needs a decision.
3. **Coordinate order and meaning.** For a projected CRS (e.g. EPSG:32632),
   is `x` the easting and `y` the northing? What convention applies if the CRS
   is geographic (lon/lat) — should that even be allowed for `x`/`y` in meters?
4. **Base-station handling.** One base station per survey or per line? May the
   base coincide with a station id in `stations`? How are repeat readings at
   the base handled for loop closure?
5. **`z` semantics.** Orthometric elevation vs ellipsoidal height, and which
   datum/vertical reference?
6. **Repeat reading aggregation.** Which value is authoritative when repeats
   disagree (first reading, mean, median, last good)? Currently the format
   keeps all values and decides nothing.
7. **Source hash algorithm.** SHA-256 chosen — acceptable, or is another
   digest already used by existing field software?
8. **Timestamps and timezone.** Are all `date-time` values to be recorded in
   UTC (as in the example), or in local field time with offset?
9. **Rejected readings.** Kept inline with `quality: "rejected"` (current
   choice) or moved to a separate list so analysis can filter trivially?
