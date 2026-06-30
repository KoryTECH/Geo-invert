# Geo-Calc Geophysical Data Platform

## Overview
A web platform for geophysicists that reduces data interpretation and presentation
time from days to hours/minutes. Users take field readings, upload data, and the
platform handles corrections, inversion, interpretation, and visualization — all
from one interface.

**Core philosophy: do not reinvent geophysical inversion math.** Wherever a
trusted, peer-reviewed, actively maintained open-source library already solves a
problem, use it directly. Custom code is reserved for the parts no good library
covers: file parsing, the API layer, orchestration, the UI, 3D visualization, and
report generation.

**Target:** Solo developer (AI-assisted for non-numerical code), side project,
no fixed deadline.
**Scope:** One method fully working and validated before starting the next.
Method #1: Electrical Resistivity (ERT/IP).

---

## Tech Stack

| Layer | Language | Key Libraries |
|-------|----------|---------------|
| **Frontend** | React + TypeScript | Vite, MapLibre + deck.gl (maps), Three.js / React Three Fiber (3D), Plotly.js (charts) |
| **Backend (main)** | C++20 | Crow (HTTP framework), nlohmann/json, Redis client, PostgreSQL client (libpqxx) |
| **Inversion Microservice** | Python | pyGIMLi only — nothing else lives in this service |
| **Bridge (C++ ↔ Python)** | HTTP (internal) | C++ backend calls the Python microservice over a simple internal API |
| **Infrastructure** | Docker Compose | Redis (job queue), MinIO (S3-compatible storage), PostgreSQL (metadata) |

**Why this split:** The main backend (API, file parsing, QC logic, job queue,
database access) stays in C++. Python is used *only* for the one part that needs
it — running pyGIMLi. This is a small, separate service, not woven into the C++
code, so:
- You can learn Python gradually on a small, focused codebase instead of all at once
- If something breaks, you can test/debug the Python service completely on its
  own (run it directly, see its own errors) without C++ in the picture
- The two sides only ever talk through one simple API call: C++ sends survey
  data → Python runs pyGIMLi → Python sends back the result

---

## What Changed From the Original Plan

| Original Plan | Revised Plan | Why |
|---|---|---|
| Custom C++ 1D/2D inversion solvers per method (Marquardt-Levenberg, Talwani, Parker-Oldenburg, etc.) | Use existing trusted libraries per method (pyGIMLi for resistivity; evaluate equivalents for other methods later) | Custom inversion math is the highest-risk, hardest-to-validate part of this project. Existing libraries are peer-reviewed and already trusted by the geophysics community — reinventing them adds risk without adding value. |
| BERT (C++) for 2D ERT inversion | pyGIMLi directly (libgimli core), via a Python microservice | BERT now runs on top of pyGIMLi/libgimli for most computation — it's no longer a separate, self-contained C++ engine. Going straight to pyGIMLi skips an unnecessary, increasingly Python-oriented middle layer. |
| All 9 methods staged into an 18-month roadmap | One method (resistivity) fully built and validated before starting the next; no fixed timeline | Removes deadline pressure; avoids spreading effort across many partially-finished methods. |
| pybind11 bridge "only for optional 3D" | A separate Python microservice (HTTP bridge) handles all dimensions (1D/2D/3D) of inversion for the first method | Once custom-from-scratch inversion is dropped, there's no reason to split inversion code by dimensionality. A clean process boundary (HTTP) is easier to debug solo than an in-process bridge (pybind11). |

---

## Supported Geophysical Methods — Status

### 1. Electrical Resistivity / Induced Polarization (ERT/IP) — **Method #1, active**

| Sub-methods | Array Types |
|-------------|-------------|
| VES (Vertical Electrical Sounding) | Schlumberger, Wenner, Wenner-Schlumberger |
| 2D Profiling | Wenner, Schlumberger, Dipole-Dipole, Pole-Pole, Pole-Dipole, Gradient |
| 3D Imaging | All arrays (grid format) |
| IP (chargeability) | All arrays, time-domain + frequency-domain |

**Processing (Python microservice + pyGIMLi):**
- Geometric factor computation — pyGIMLi built-in
- Reciprocity error / bad electrode detection — pyGIMLi built-in
- Topographic correction — pyGIMLi mesh handling
- 1D, 2D, and 3D inversion — pyGIMLi `ert.ERTManager` (covers all dimensions; no
  custom solver needed)
- Apparent resistivity pseudo-section generation — pyGIMLi built-in

**What we still build ourselves (C++ main backend):**
- File parsers for instrument formats (ABEM, IRIS Syscal, Res2DInv, custom CSV)
  that convert raw exports into the common format the Python microservice expects
- The web UI: upload, QC review panel, inversion parameter controls, 3D viewer,
  report builder
- Orchestration: job queue so inversion runs in the background, not blocking the UI
- Report generation: auto-compiling pyGIMLi's output (model, fit statistics,
  cross-sections) into a client-ready PDF

### 2–9. All other methods (Magnetics, Gravity, EM, GPR, Seismic, Radiometrics, MT,
Well Logging) — **Deferred. Not scoped until Method #1 is fully built and validated.**
When work begins on a future method, the same rule applies: identify the existing
trusted library first (e.g., SimPEG for magnetics/gravity/EM 3D inversion), and
only write custom code for what that library doesn't cover.

---

## Data Flow: Field Reading → Final Presentation (Method #1: Resistivity)

```
STEP 1: FIELD
  Geophysicist takes resistivity readings, records in instrument

STEP 2: UPLOAD
  Upload raw file (ABEM / Syscal / Res2DInv / CSV)
  C++ backend parser converts to common data format
  Store raw file (MinIO) + metadata (PostgreSQL)

STEP 3: QUALITY CONTROL
  Python microservice (pyGIMLi): reciprocity error analysis, bad electrode detection
  Frontend QC panel: histograms, coverage map, flag/remove bad points
  Apply corrections: topography, geometric factors (pyGIMLi handles this)

STEP 4: INVERSION
  C++ backend sends data to Python microservice over internal API
  pyGIMLi ert.ERTManager: builds mesh, runs inversion (1D, 2D, or 3D
  depending on survey type), returns resistivity model + fit statistics
  Runs as a background job (Redis queue) with progress updates to frontend

STEP 5: INTERPRETATION
  Geophysicist reviews inverted model against known geology
  AI-assisted draft interpretation text (human reviews/edits before finalizing —
  never auto-sent to a client unchecked)

STEP 6: VISUALIZATION
  2D: pseudo-sections, cross-sections, sounding curves (Plotly.js)
  3D: interactive CAD-style viewer — see "3D Visualization Spec" below
  Map view of survey layout (MapLibre + deck.gl)

STEP 7: EXPORT
  Auto-generated PDF report: survey info, methodology, inversion results,
  fit statistics, interpretation, recommendations
  Data exports: CSV, GeoJSON, native pyGIMLi format
```

---

## 3D Visualization Spec (interactive, CAD-style)

The 3D viewer is not a static image — it must behave like CAD-style 3D software:
full rotate, zoom, and pan, viewable from any angle.

**Visual style:**
- Black (or dark grey) background — standard in geophysics/scientific visualization
  software (matches tools like RES3DINV), makes color-coded data pop, easier on
  the eyes for long sessions
- 3D volume rendered as a color-coded model (similar to a heat map, but in 3D) —
  color represents the calculated resistivity value at each point
- Axes labeled with real dimensions (meters/feet) on X, Y, and depth (Z), so users
  can read off real-world position/depth of any feature, not just a relative view
- Legend mapping color → resistivity value range
- Slicing tool: cut a cross-section at any depth or angle (standard feature in
  inversion visualization software)

**Important distinction — calculated value vs. interpreted material:**
pyGIMLi's inversion outputs **resistivity values** (a physical property), not
mineral/material names directly. Resistivity ranges *correspond to* likely
materials (e.g., low resistivity often suggests clay/saltwater, high resistivity
often suggests dry rock/air gaps), but mapping a number to an actual material name
is the **interpretation step** — partly rule-based (resistivity range lookup
table), partly the geophysicist's judgment, since the same range can mean
different things in different locations/contexts.

**How this is handled in the product:**
- The 3D viewer always shows the real calculated number (resistivity) by default —
  this is the ground truth, never hidden or replaced
- An optional overlay can suggest a likely material based on resistivity range
  (AI-assisted draft suggestion)
- The geophysicist must review and confirm/edit this suggestion before it's
  treated as the final interpretation — never auto-presented to a client as fact
  (same human-in-the-loop rule as the report generation step)

**Tech for this:** Three.js / React Three Fiber (frontend), fed by 3D grid/mesh
data exported from the Python inversion microservice (pyGIMLi → JSON or binary
array format the frontend can parse into 3D geometry).

---

## Validation Plan

Before trusting this system's output on real client work:
1. Run synthetic test datasets (known underground structure) through the pipeline
   and confirm the inversion recovers the known answer
2. Compare results against pyGIMLi's own published examples/tutorials to confirm
   our wrapper isn't introducing errors in data conversion or parameter handling
3. Have a FUTA lecturer/professor review real or past survey results processed
   through the system against their own manual interpretation
4. Only after consistent validation, begin using it on live client surveys

---

## Project Structure (C++ main backend + Python inversion microservice)

```
geocalc/
├── frontend/                  # React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── maps/               # MapLibre + deck.gl
│   │   ├── viewer3d/           # Three.js / React Three Fiber
│   │   ├── charts/              # Plotly.js
│   │   ├── api/                 # Backend API client
│   │   └── lib/
│   └── package.json
│
├── backend/                   # C++20 (main backend — Crow)
│   ├── parsers/                 # ABEM, Syscal, Res2DInv, CSV → common format
│   ├── qc/                       # Reciprocity, outlier flagging logic
│   ├── reports/                   # PDF report generation
│   ├── queue/                      # Redis job queue
│   ├── database/                    # PostgreSQL + MinIO access
│   ├── inversion_client/             # Calls the Python microservice
│   ├── main.cpp                       # Crow entry point
│   └── CMakeLists.txt
│
├── inversion-service/         # Python microservice (pyGIMLi ONLY)
│   ├── app.py                   # Minimal API: receive data, run pyGIMLi, return result
│   ├── invert.py                  # pyGIMLi wrapper functions
│   └── requirements.txt              # pygimli, fastapi (or flask), etc.
│
├── infra/
│   ├── docker-compose.yml
│   └── init.sql
│
├── docs/
│   └── beginning.md
│
└── README.md
```

---

## Staged Development Plan (revised — no fixed timeline)

### Stage 1: Foundation
- [ ] C++ backend skeleton: routes (Crow), auth, file upload
- [ ] PostgreSQL schema: users, projects, surveys, readings
- [ ] MinIO storage setup
- [ ] React dashboard shell
- [ ] Python microservice skeleton: minimal API that just echoes data back (proves the bridge works before adding pyGIMLi)
- [ ] Docker Compose: C++ backend + Python microservice + Redis + MinIO + PostgreSQL

### Stage 2: Resistivity Method — Full Pipeline
- [ ] File parsers (C++): ABEM, IRIS Syscal, Res2DInv, generic CSV → common format
- [ ] Python microservice: pyGIMLi integration — data loading, QC (reciprocity, bad electrode detection)
- [ ] Python microservice: pyGIMLi integration — 1D/2D/3D inversion via `ert.ERTManager`
- [ ] C++ ↔ Python bridge: internal API call, error handling for when the microservice is unreachable or fails
- [ ] Background job queue (Redis) for inversion runs with progress reporting
- [ ] Frontend: upload wizard, QC review panel
- [ ] Frontend: pseudo-section / cross-section viewer (Plotly.js)
- [ ] Frontend: 3D viewer (Three.js) — see 3D Visualization Spec
- [ ] Report generation: auto PDF (survey info, results, interpretation, recommendations)
- [ ] Validation: synthetic datasets + lecturer review (see Validation Plan)

### Stage 3+: Future Methods (not scoped yet)
- Only begin once Stage 2 is fully working and validated
- For each new method: identify the existing trusted library first
  (e.g., SimPEG for magnetics/gravity/EM), scope custom work to gaps only

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope too large for solo, even long-term | Medium | One method fully done before starting the next; no fixed deadline |
| AI-generated inversion/numerical logic silently wrong | High | Never write custom inversion math — use pyGIMLi directly; validate any AI-touched logic against synthetic data + lecturer review before trusting it |
| C++ ↔ Python bridge complexity | Low-Medium | Keep the bridge to one simple internal API call; test the Python microservice standalone before wiring it to C++ |
| Frontend 3D performance | Medium | LOD (level of detail — showing less geometry detail when zoomed out), Web Workers, instancing |
| Unknown/unsupported file formats | Low | CSV/XYZ as universal fallback; add parsers incrementally as real instrument files are encountered |
| PDF report generation in C++ | Low | pdf-writer for simple cases; client-side library for complex layouts if needed |
| Windows dev environment | Medium | CMake + vcpkg for C++; WSL2 (Windows Subsystem for Linux) as an alternative |
| No geophysics collaborators | Low | Resolved — FUTA lecturers available for validation and review |
