# Geo-Calc Geophysical Data Platform

## Overview
A web platform for geophysicists that reduces data interpretation and presentation time from days to hours/minutes. Users take field readings, upload data, and the platform handles corrections, inversion, interpretation, and visualization — all from one interface.

**Target:** Solo developer, extended timeline (12-18 months)
**Goal:** Cut interpretation time — all they do is take the reading

---

## Tech Stack

| Layer | Language | Key Libraries |
|-------|----------|---------------|
| **Frontend** | React + TypeScript | Vite, Stitch design system, MapLibre + deck.gl (maps), Three.js / React Three Fiber (3D), Plotly.js (charts), PDFMake (reports) |
| **Backend API** | C++20 | Crow (HTTP), nlohmann/json, Protobuf, Redis client |
| **Processing Engine** | C++20 (primary) | Eigen (linear algebra), GDAL (geospatial), HDF5 (data storage), PROJ (coordinate transforms), BERT (2D ERT inversion) |
| **Inversions** | **1D/2D: C++** (BERT, Talwani, custom) — **3D only: Python via pybind11** (SimPEG, 200-line wrapper) |
| **Infrastructure** | Docker Compose | Redis (job queue), MinIO (S3-compatible storage), PostgreSQL (metadata) |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        React + TypeScript Frontend               │
│  Dashboard │ Map (MapLibre) │ 3D Viewer (Three.js) │ Reports    │
│  Data Entry │ QC Panel │ Inversion Config │ Export              │
└────────────────────────────────┬─────────────────────────────────┘
                                 │ REST API (JSON/Protobuf)
┌──────────────────────────────────────────────────────────────────┐
│                       C++ Backend (One Binary)                    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  HTTP API Layer (Crow)                                    │  │
│  │  Routes │ Auth │ WebSocket (progress) │ File upload       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           │                                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Job Queue + Worker Pool (Redis)                          │  │
│  │  Processing jobs │ Inversion jobs │ Export jobs            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           │                                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Processing Engine (All C++)                               │  │
│  │  ├── File parsers: SEG-Y, CSV, XYZ, GeoTIFF, ABEM,       │  │
│  │  │                  Res2DInv, Magnetometer formats         │  │
│  │  ├── Coordinate transforms: PROJ (lat/lon ↔ UTM ↔ local) │  │
│  │  ├── QC + Corrections: drift, IGRF, diurnal, tide,       │  │
│  │  │   terrain, topographic, geometric factors              │  │
│  │  ├── 1D Inversions: VES, layered mag/gravity, MT 1D      │  │
│  │  ├── 2D Inversions: BERT (ERT/IP), Talwani (mag/grav),   │  │
│  │  │   Occam smoothness-constrained                         │  │
│  │  ├── Depth Estimation: Euler deconvolution, analytic      │  │
│  │  │   signal, power spectrum                               │  │
│  │  └── Exports: GeoJSON, CSV, PDF, depth-slice tiles,      │  │
│  │      cross-section images                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           │                                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  pybind11 Bridge (~200 lines Python)                       │  │
│  │  ONLY for 3D inversion via SimPEG                          │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────────────────────────────────────────────┐
│  Storage Layer                                                   │
│  ├── Redis: Job queue + caching                                 │
│  ├── MinIO: Raw uploads, processed files, exports               │
│  └── PostgreSQL: Users, projects, surveys, metadata             │
└──────────────────────────────────────────────────────────────────┘
```

---

## Supported Geophysical Methods

### 1. Electrical Resistivity / Induced Polarization (ERT/IP)
| Sub-methods | Array Types |
|-------------|-------------|
| VES (Vertical Electrical Sounding) | Schlumberger, Wenner, Wenner-Schlumberger |
| 2D Profiling | Wenner, Schlumberger, Dipole-Dipole, Pole-Pole, Pole-Dipole, Gradient |
| 3D Imaging | All arrays (grid format) |
| IP (chargeability) | All arrays, time-domain + frequency-domain |

**Processing (C++):**
- Geometric factor computation
- Topographic correction (finite element)
- **1D: Smooth layered inversion** (Marquardt-Levenberg)
- **2D: BERT integration** (2.5D finite element inversion)
- **3D: Optional Python via SimPEG** (fully 3D unstructured mesh)
- Apparent resistivity pseudo-section generation

### 2. Magnetics
| Sub-methods | Data Types |
|-------------|------------|
| Ground Magnetics | Proton, Overhauser, Cesium vapor |
| Airborne Magnetics | Fixed-wing, helicopter |
| Marine Magnetics | Towed magnetometer |

**Processing (C++):**
- IGRF correction (World Magnetic Model)
- Diurnal correction
- Leveling / micro-leveling
- Reduction to Pole (RTP)
- Upward / downward continuation
- Analytic signal
- **1D/2D inversion: Talwani polygons**
- **3D inversion: Optional Python via SimPEG**
- **Depth estimation: Euler deconvolution, analytic signal width, power spectrum**

### 3. Gravity
| Sub-methods | Data Types |
|-------------|------------|
| Ground Gravity | Relative (LaCoste, Scintrex), Absolute (A10, FG5) |
| Microgravity | Engineering, void detection |
| Marine Gravity | Shipborne |
| Airborne Gravity | Airborne gravimetry (SGL, TAGS) |
| Gradiometry | Full tensor, SGG |

**Processing (C++):**
- Drift correction
- Tide correction
- Terrain correction (Nagy, Kane methods)
- Bouguer slab + terrain (complete Bouguer anomaly)
- Latitude correction / normal gravity (GRS80 / WGS84)
- Free-air correction
- Isostatic correction
- **1D/2D inversion: Talwani (2D polygons), Parker-Oldenburg (density interface)**
- **3D inversion: Optional Python via SimPEG**
- **Depth estimation: Euler deconvolution, analytic signal**

### 4. Electromagnetics (EM)
| Sub-methods | Configurations |
|-------------|----------------|
| FDEM (Frequency Domain) | Slingram (HCP/VCP), Broadband (GRTEM), Multicoil |
| TDEM (Time Domain) | Central loop, separated loop, in-loop |
| Airborne EM (AEM) | VTEM, SkyTEM, HeliTEM, Resolve |
| Ground Conductivity | EM31, EM34, EM38 |
| Controlled-Source Audio-Magnetotellurics (CSAMT) | Scalar, tensor |

**Processing (C++):**
- System calibration
- Altitude correction
- Phase rotation
- Apparent conductivity computation
- Layered earth inversion (1D — C++ forward model)
- **3D inversion: Optional Python via SimPEG**

### 5. Ground Penetrating Radar (GPR)
| Sub-methods | Antenna Configurations |
|-------------|----------------------|
| Reflection Profiling | Common offset, common midpoint, WARR |
| CMP / WARR | Multi-offset |
| Borehole GPR | Single-hole, crosshole |
| Tomography | Crosshole, surface-to-borehole |

**Processing (C++):**
- Dewow (DC removal)
- Time-zero correction
- Background removal
- Gain (SEC, AGC, manual)
- Bandpass filtering
- Migration (Kirchhoff, Stolt F-K, phase-shift)
- Velocity analysis (hyperbola fitting, CMP)
- Trace stacking
- **1D inversion: only forward modeling**
- **3D imaging: optional Python (maturity-based)**

### 6. Seismic
| Sub-methods | Configurations |
|-------------|----------------|
| Refraction | 1D, 2D, tomography |
| Reflection | 2D, 3D, VSP |
| Surface Wave (MASW) | Active, passive (ReMi, f-k) |
| Downhole / Crosshole | P-wave, S-wave |
| Microseismic | Passive monitoring |

**Processing (C++) — Partial:**
- First break picking (custom)
- Statics corrections (refraction)
- Butterworth/Bandpass filters
- AGC, mute, gain
- FK filter
- **Tomography: C++ (custom ray tracer + SIRT solver)**
- **Full Waveform Inversion (FWI): Can't in C++ solo** — limited scope

**Note:** Full seismic processing (deconvolution, NMO, stack, migration) is its own industry. Scope to first-break traveltime tomography + MASW dispersion inversion.

### 7. Radiometrics
| Sub-methods | Configurations |
|-------------|----------------|
| Ground Spectrometry | K, U, Th channels, total count |
| Airborne Spectrometry | 256/512 channel, full spectrum |

**Processing (C++):**
- Stripping correction (Compton scattering)
- Background correction
- Altitude correction (inverse square law)
- Radon removal
- Sensitivity calibration
- K/U/Th triangular plots
- **No inversion needed** — anomaly mapping only

### 8. Magnetotellurics (MT)
| Sub-methods | Configurations |
|-------------|----------------|
| AMT (Audio-MT) | Broadband MT (BBMT) |
| Long Period MT (LMT) | Controlled Source (CSAMT) |
| Geomagnetic Depth Sounding (GDS) | |

**Processing (C++):**
- Time-series processing
- Robust impedance estimation
- Apparent resistivity + phase
- **1D inversion: C++ (Occam type)**
- **2D/3D inversion: Optional Python (ModEM, SimPEG)**

### 9. Well Logging
| Sub-methods | Tools |
|-------------|-------|
| Resistivity | Laterolog, Induction |
| Spontaneous Potential (SP) | |
| Gamma Ray | Total, spectral |
| Density | Compensated |
| Neutron | Thermal, epithermal |
| Sonic | Compressional, shear |

**Processing (C++):**
- Environmental corrections
- Borehole compensation
- Depth matching / drift correction
- Bad log / spike removal
- **Forward modeling only**

---

## Data Flow: Field Reading → Final Presentation

```
STEP 1: FIELD
─────────────────────────────────────────────────
  Take readings (resistivity, mag, gravity, etc.)
  Record in instrument / field tablet
  ↓

STEP 2: UPLOAD (C++)
─────────────────────────────────────────────────
  Upload raw file (CSV / SEG-Y / XYZ / instrument format)
  Auto-detect file type and method
  Parse → validate → HDF5 storage → MinIO backup
  Auto-detect coordinate system (WGS84 / UTM / local)
  Suggest project CRS, allow override
  ↓

STEP 3: QUALITY CONTROL (C++)
─────────────────────────────────────────────────
  Auto-QC: outlier detection, missing stations, time gaps
  Interactive QC panel in frontend:
    - Histograms of readings
    - Coverage map (stations, lines)
    - Flagged points overlay
    - Manual flag / delete / interpolate
  Apply corrections (depending on method):
    - Magnetics: IGRF, diurnal, tie-line leveling
    - Gravity: drift, tide, terrain, Bouguer, latitude
    - EM: calibration, altitude, phase
    - GPR: dewow, zero-time, background removal
    - Resistivity: reciprocity error, topography
    - Radiometrics: stripping, background, altitude
    - Seismic: statics, first breaks
    - MT: robust impedance estimation
    - Well logs: environmental, depth matching
  ↓

STEP 4: PROCESSING (C++)
─────────────────────────────────────────────────
  Method-specific calculations:
    - Resistivity: Geometric factors → apparent resistivity
    - Magnetics: RTP, analytic signal, upward continuation
    - Gravity: Complete Bouguer anomaly, isostatic
    - GPR: SEC gain, migration, velocity analysis
    - Radiometrics: ternary maps, ratios (K/Th, U/K)
    - Seismic: traveltime tomography, MASW dispersion curves
    - MT: apparent resistivity, phase curves
    - Well logs: lithology interpretation, cross-plots
  ↓

STEP 5: INVERSION (C++ / Python)
─────────────────────────────────────────────────
  C++ — 1D inversions for all methods:
    - Resistivity: VES smooth/blocky layered inversion
    - Magnetics: 2D Talwani polygon inversion
    - Gravity: 2D Talwani + 1D Parker-Oldenburg interface
    - EM: 1D layered conductivity
    - MT: 1D resistivity vs depth
    - Seismic: 1D dispersion inversion (Vs vs depth)
    - GPR: 1D velocity profile

  C++ (BERT) — 2D inversions:
    - Resistivity/IP (2.5D finite element)
    - Seismic refraction tomography (ray + SIRT)

  Python (via pybind11) — 3D inversions (optional):
    - SimPEG: Magnetic, Gravity, DC resistivity, EM
    - Depth slices → anomalies with centroid + depth estimate
  ↓

STEP 6: INTERPRETATION (C++ + Frontend)
─────────────────────────────────────────────────
  Auto-anomaly detection:
    - Analytic signal maxima (magnetic, gravity)
    - Horizontal gradient magnitude peaks
    - Segmented blobs → 3D anomaly objects
  Depth estimation (C++):
    - Euler deconvolution (structural index)
    - Analytic signal half-width
    - Power spectrum log-depth (radially averaged)
  Anomaly attributes:
    - Centroid (X, Y, Depth)
    - Amplitude, strike, dip, plunge
    - Uncertainty estimate
  ↓

STEP 7: VISUALIZATION (Frontend — React + Three.js)
─────────────────────────────────────────────────
  Interactive Map (MapLibre + deck.gl):
    - Station locations, elevation, coverage
    - Profiles / lines (click to view section)
    - Gridded maps (color-filled contours)
    - Depth-slice animation (slider control)
    - Anomaly overlays (shapes with attributes)

  3D Viewer (Three.js / React Three Fiber):
    - Voxel model (semi-transparent volume)
    - Depth slices (horizontal plane sweep)
    - Cross-sections (vertical planes, draggable)
    - Anomaly isosurfaces (blobs with property labels)
    - Well paths (if well logging data)
    - Orbit controls, measurement tool, screenshot

  Chart Panel (Plotly.js):
    - Profile graphs (observed vs calculated)
    - Sounding curves (depth vs property)
    - Pseudo-sections (grid of profiles)
    - Histograms, cross-plots, ternary plots
    - QC plots (repeatability, drift curves)
  ↓

STEP 8: EXPORT (C++ + Frontend)
─────────────────────────────────────────────────
  Data exports:
    - GeoJSON (stations, anomalies, profiles)
    - CSV / Excel (raw, processed, inversion results)
    - SEG-Y (processed seismic/GPR)
    - UBC-GIF format (3D voxel models)
    - XYZ (gridded surfaces)

  Report generation:
    - PDF (one-click, auto-generated)
      - Title page, survey info
      - Map with station locations, coordinate info
      - Data tables (raw + processed summary)
      - Inversion results (sections, depth slices, fit statistics)
      - Interpretation (anomaly list, depth estimates, recommendations)
    - Company branding template
    - Page size: A4 / Letter

  Image exports:
    - Maps (PNG, GeoTIFF)
    - Cross-sections (SVG, PNG)
    - 3D screenshots (PNG)
    - All with scale bar, north arrow, colorbar
```

---

## Inversion Detail: What Goes Where

### Fully C++ Inversions

| Method | Inversion Type | Algorithm | Library |
|--------|---------------|-----------|---------|
| **Resistivity** | 1D (VES) | Smoothed / blocky layered Occam | Custom (Eigen) |
| **Resistivity** | 2D | Gauss-Newton + finite element | **BERT** (C++) |
| **Resistivity** | 3D | _Optional Python (SimPEG)_ | — |
| **Magnetics** | 2D polygon | Talwani forward + least-squares | Custom (Eigen) |
| **Magnetics** | 3D | _Optional Python (SimPEG)_ | — |
| **Gravity** | 2D polygon | Talwani forward + least-squares | Custom (Eigen) |
| **Gravity** | Interface (1D) | Parker-Oldenburg iteration | Custom (FFT) |
| **Gravity** | 3D | _Optional Python (SimPEG)_ | — |
| **EM** | 1D layered | Least-squares + singular value decomposition | Custom (Eigen) |
| **EM** | 3D | _Optional Python (SimPEG)_ | — |
| **MT** | 1D | Occam type, smooth | Custom (Eigen) |
| **MT** | 2D/3D | _Optional Python (ModEM/SimPEG)_ | — |
| **Seismic refraction** | 2D tomography | Ray tracer + SIRT | Custom (Eigen) |
| **Seismic MASW** | 1D Vs profile | Dispersion curve inversion + genetic algorithm | Custom (Eigen) |
| **GPR** | Velocity profile | Hyperbola fitting | Custom |
| **All methods** | Depth estimation | Euler deconvolution + analytic signal + power spectrum | Custom (Eigen) |

### Python via pybind11 (200-line wrapper — Optional 3D Only)

| Method | Library | What It Does |
|--------|---------|--------------|
| Magnetic 3D inversion | SimPEG | Voxel or octree mesh inversion |
| Gravity 3D inversion | SimPEG | Voxel or octree mesh inversion |
| DC Resistivity 3D | SimPEG | Unstructured tetrahedral mesh |
| EM 3D inversion | SimPEG | Frequency/time domain 3D |
| MT 2D/3D inversion | SimPEG / ModEM | |
| Anomaly classification | PyTorch | CNN on anomaly shape |

---

## Project Structure

```
geocalc/
├── frontend/                  # React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route pages
│   │   ├── maps/              # MapLibre + deck.gl components
│   │   ├── viewer3d/          # Three.js / React Three Fiber
│   │   ├── charts/            # Plotly.js components
│   │   ├── auth/              # Login / registration
│   │   ├── stores/            # Zustand state management
│   │   ├── api/               # Backend API client (TypeScript)
│   │   ├── types/             # TypeScript types + Protobuf generated
│   │   └── lib/               # Shared utilities
│   ├── public/                # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                   # C++ (CMake)
│   ├── src/
│   │   ├── api/               # HTTP routes (Crow)
│   │   ├── auth/              # JWT authentication
│   │   ├── parsers/           # File parsers (SEG-Y, CSV, XYZ, etc.)
│   │   ├── processing/        # Corrections + QC + computations
│   │   │   ├── magnetics/
│   │   │   ├── gravity/
│   │   │   ├── resistivity/
│   │   │   ├── em/
│   │   │   ├── gpr/
│   │   │   ├── seismic/
│   │   │   ├── radiometrics/
│   │   │   ├── mt/
│   │   │   └── well_logs/
│   │   ├── inversion/         # All C++ inversion engines
│   │   │   ├── resistivity/   # 1D VES + BERT 2D wrapper
│   │   │   ├── magnetics/     # 2D Talwani
│   │   │   ├── gravity/       # 2D Talwani + 1D Parker
│   │   │   ├── em/            # 1D layered
│   │   │   ├── mt/            # 1D Occam
│   │   │   ├── seismic/       # Traveltime + MASW
│   │   │   └── depth_estimation/ # Euler, analytic signal, power spectrum
│   │   ├── python_bridge/     # pybind11 wrappers (200 lines)
│   │   ├── export/            # GeoJSON, CSV, PDF, images
│   │   ├── database/          # PostgreSQL + MinIO access
│   │   ├── queue/             # Redis job queue (hiredis + custom)
│   │   ├── models/            # Protobuf-generated C++ types
│   │   └── main.cpp           # Entry point
│   ├── third_party/           # Vendored deps (BERT, PROJ, GDAL)
│   ├── python/                # Python scripts + env
│   │   ├── inversion_3d.py    # ~200-line SimPEG wrapper
│   │   └── requirements.txt   # simpeg, pytorch, numpy
│   ├── CMakeLists.txt
│   └── Dockerfile
│
├── shared/                    # Protocol Buffers schemas
│   ├── survey.proto           # Survey metadata
│   ├── reading.proto          # Individual readings / stations
│   ├── inversion.proto        # Inversion jobs + results
│   ├── anomaly.proto          # Anomaly objects
│   ├── processing.proto       # Processing parameters
│   └── export.proto           # Export configurations
│
├── infra/                     # Docker Compose + configs
│   ├── docker-compose.yml     # Backend, Redis, MinIO, PostgreSQL
│   ├── nginx.conf             # Reverse proxy
│   └── init.sql               # PostgreSQL schema
│
├── docs/                      # Documentation
│   ├── beginning.md           # This file
│   ├── methods.md             # Detailed method documentation
│   ├── inversion.md           # Inversion theory + parameter guides
│   └── api.md                 # API reference
│
├── scripts/                   # Build + dev scripts
│   ├── setup.ps1              # Windows setup
│   ├── build.ps1              # Build backend
│   └── dev.ps1                # Start dev environment
│
└── README.md
```

---

## Staged Development Plan

### Stage 1: Foundation (Months 1-3)
- [ ] Monorepo with pnpm workspaces (frontend) + CMake (backend)
- [ ] Protobuf schemas: Survey, Reading, InversionJob, Anomaly
- [ ] C++ HTTP API with Crow: basic routes, auth, file upload
- [ ] File parser: CSV, XYZ (generic multi-column)
- [ ] PostgreSQL schema: users, projects, surveys, readings
- [ ] MinIO storage: raw uploads, processed data
- [ ] React + Stitch dashboard shell
- [ ] Docker Compose: backend + Redis + MinIO + PostgreSQL
- [ ] CI/CD: GitHub Actions build + test

### Stage 2: Core Dashboard + Method 1 (Months 3-6)
- [ ] Frontend: Map (MapLibre + deck.gl) — survey overview, station overlay
- [ ] Frontend: Data entry form / upload wizard
- [ ] Frontend: Project settings, survey management
- [ ] C++ parsers: SEG-Y, GeoTIFF, instrument-specific formats (ABEM, Res2DInv, etc.)
- [ ] C++ PROJ coordinate transforms (lat/lon ↔ UTM ↔ local grid)
- [ ] **Method #1: Resistivity (ERT/IP)** — full pipeline
  - [ ] File parser: ABEM, Res2DInv, IRIS Syscal, custom CSV
  - [ ] Geometric factor computation (all array types)
  - [ ] Reciprocity error / bad electrode detection
  - [ ] Topographic correction
  - [ ] Apparent resistivity pseudo-section
  - [ ] 1D VES inversion (C++ — Marquardt-Levenberg)
  - [ ] 2D inversion (C++ — BERT integration)
  - [ ] 3D inversion (Python — SimPEG via pybind11)
- [ ] Frontend: Profile view (cross-section, pseudo-section)
- [ ] Frontend: Chart panel (sounding curves, fit comparison)
- [ ] Frontend: 3D viewer (Three.js) — voxel model + slices
- [ ] Frontend: Export — GeoJSON, CSV, PDF (pdfmake)

### Stage 3: Method Expansion — Magnetic + Gravity (Months 6-9)
- [ ] **Magnetic pipeline (C++)**
  - [ ] File parser: GEM, GSM, Geometrics, custom CSV
  - [ ] IGRF correction (WMM model)
  - [ ] Diurnal correction
  - [ ] Tie-line leveling
  - [ ] RTP (Reduction to Pole)
  - [ ] Analytic signal
  - [ ] Upward / downward continuation
  - [ ] 2D Talwani polygon inversion
  - [ ] Euler deconvolution (depth estimation)
- [ ] **Gravity pipeline (C++)**
  - [ ] File parser: Scintrex, LaCoste, CG-5, custom CSV
  - [ ] Drift correction
  - [ ] Tide correction
  - [ ] Terrain correction (Nagy, Kane)
  - [ ] Bouguer + latitude + free-air corrections
  - [ ] 2D Talwani polygon inversion
  - [ ] 1D Parker-Oldenburg interface inversion
  - [ ] Euler deconvolution (depth estimation)
- [ ] 3D inversion for both (Python — SimPEG via pybind11)
- [ ] Frontend: RTP / Bouguer / analytic signal map layers
- [ ] Frontend: Depth slice animation (slider)
- [ ] Frontend: Euler deconvolution cluster scatter plot

### Stage 4: EM + GPR + Radiometrics (Months 9-12)
- [ ] **EM pipeline (C++)**
  - [ ] File parser: Geonics, Zonge, SkyTEM, Aeroquest formats
  - [ ] System calibration deconvolution
  - [ ] Altitude correction
  - [ ] Phase rotation
  - [ ] Apparent conductivity (all geometries)
  - [ ] 1D layered earth inversion
- [ ] **GPR pipeline (C++)**
  - [ ] File parser: SEG-Y rev2, SEG-GPR, DZT, RD3
  - [ ] Dewow / DC removal
  - [ ] Time-zero correction
  - [ ] Background removal
  - [ ] SEC / AGC gain
  - [ ] Bandpass filter
  - [ ] Kirchhoff + Stolt F-K migration
  - [ ] Hyperbola fitting velocity analysis
  - [ ] Trace extraction (depth conversion)
- [ ] **Radiometrics pipeline (C++)**
  - [ ] File parser: RS-230, GR-320, airborne formats
  - [ ] Stripping correction
  - [ ] Background subtraction
  - [ ] Altitude correction
  - [ ] K/U/Th ratios, ternary maps
- [ ] Frontend: GPR wiggle-trace viewer
- [ ] Frontend: Radiometrics ternary color map
- [ ] Frontend: EM multi-frequency overlay

### Stage 5: Seismic + MT + Well Logs (Months 12-15)
- [ ] **Seismic pipeline (C++) — limited scope**
  - [ ] File parser: SEG-Y (full), SEG-2
  - [ ] First break picking (energy ratio, STA/LTA)
  - [ ] Statics corrections
  - [ ] 2D refraction tomography (ray tracer + SIRT)
  - [ ] MASW dispersion curve extraction + inversion (genetic algorithm)
  - [ ] AGC, bandpass, mute
- [ ] **MT pipeline (C++)**
  - [ ] File parser: EDI, Z-file (custom time series parser)
  - [ ] Robust impedance estimation
  - [ ] Apparent resistivity + phase
  - [ ] 1D Occam inversion
- [ ] **Well Log pipeline (C++)**
  - [ ] File parser: LAS, DLIS
  - [ ] Environmental corrections
  - [ ] Depth matching
  - [ ] Cross-plots, lithology interpretation
- [ ] Frontend: Seismic section viewer (wiggle/variable area)
- [ ] Frontend: MT apparent resistivity / phase curves
- [ ] Frontend: Well log plot (multiple tracks)
- [ ] 3D well path visualization

### Stage 6: Interpretation Automation (Months 15-17)
- [ ] Auto-anomaly detection pipeline
  - [ ] Analytical signal maxima extraction (all potential fields)
  - [ ] Horizontal gradient magnitude peaks
  - [ ] Watershed segmentation → 3D anomaly objects
  - [ ] Depth estimation (Euler, half-width, power spectrum)
  - [ ] Anomaly classification (CNN — Python via pybind11)
- [ ] Multi-method integration
  - [ ] Co-visualization: mag + gravity + resistivity in 3D
  - [ ] Cross-correlation tables
  - [ ] Joint inversion (magnetic + gravity via SimPEG)
- [ ] Frontend: Interpretation workspace
  - [ ] 3D picking (horizons, bodies)
  - [ ] Anomaly inspector (all attributes)
  - [ ] Multi-survey comparison view
  - [ ] Report builder (drag-and-drop template)

### Stage 7: Polish & Deploy (Months 17-18)
- [ ] Performance optimization
  - [ ] Tile generation for large surveys
  - [ ] WebGL instancing (deck.gl)
  - [ ] LOD (level of detail) for 3D
  - [ ] Chunked data loading (100MB+ surveys)
- [ ] Report template engine
  - [ ] PDF generation (pdfmake / wkhtmltopdf)
  - [ ] Custom company branding
  - [ ] Automated report from project
- [ ] Documentation
  - [ ] User guide with examples
  - [ ] API reference (OpenAPI)
  - [ ] Dev setup guide
- [ ] Deployment
  - [ ] Docker Compose (single server)
  - [ ] K8s manifests (scale-out)
  - [ ] S3 for external storage
  - [ ] SSL, domain, HTTPS

---

## Key Libraries

### C++ Libraries
| Library | Purpose | Integration |
|---------|---------|-------------|
| **Crow** | HTTP server, routing, WebSocket | Header-only, easy |
| **nlohmann/json** | JSON parsing/generation | Header-only |
| **Protobuf** | Serialization, shared types | Codegen (C++ + TS) |
| **Eigen** | Linear algebra (matrices, solvers) | Header-only |
| **GDAL** | GeoTIFF, DEM, vector formats | CMake find |
| **PROJ** | Coordinate transforms | CMake find |
| **HDF5** | Efficient data storage | CMake find |
| **BERT** | 2D ERT inversion (C++) | CMake, source build |
| **hiredis** | Redis client | CMake find |
| **libpq** | PostgreSQL client | CMake find |
| **pdf-writer** | Simple C++ PDF generation | Header-only |
| **FreeImage / stb** | Image loading/saving | Header-only |

### Python Libraries (Minimal)
| Library | Purpose | pip |
|---------|---------|-----|
| **SimPEG** | 3D geophysical inversions | `simpeg` |
| **PyTorch** | Anomaly classification | `torch` |
| **NumPy** | Array bridge with C++ | `numpy` |
| **pybind11** | C++ ↔ Python bridge | `pybind11` |

### Frontend Libraries
| Library | Purpose | Notes |
|---------|---------|-------|
| **React + TypeScript** | UI framework | Vite |
| **Stitch** | Design system, components | Syncfusion (free community) |
| **MapLibre GL JS** | Base map | Free, open-source |
| **deck.gl** | Data overlays on map | Uber, geospatial |
| **Three.js / React Three Fiber** | 3D visualization | Voxel, isosurface |
| **Plotly.js** | Interactive charts | Responsive |
| **PDFMake** | Client-side PDF generation | Report generation |
| **Zustand** | State management | Minimal |

---

## Infrastructure

### Docker Compose (dev + prod)
```yaml
services:
  postgres:
    image: postgis/postgis:15-3.3
    volumes: [pgdata:/var/lib/postgresql/data]
    env: [POSTGRES_DB=geocalc, POSTGRES_USER=geocalc, POSTGRES_PASSWORD=...]

  redis:
    image: redis:7-alpine
    volumes: [redisdata:/data]

  minio:
    image: minio/minio
    command: server /data --console-address :9001
    volumes: [miniodata:/data]
    env: [MINIO_ROOT_USER=geocalc, MINIO_ROOT_PASSWORD=...]

  backend:
    build: ./backend
    ports: [8080:8080]
    depends_on: [postgres, redis, minio]
    volumes: [uploads:/uploads, processed:/processed]

  frontend:
    build: ./frontend
    ports: [3000:80]
    depends_on: [backend]
```

### PostgreSQL Schema (Key Tables)
- `users` — id, email, name, company, role
- `projects` — id, user_id, name, description, CRS
- `surveys` — id, project_id, name, method, sub_method, status, bounds
- `stations` — id, survey_id, station_id, easting, northing, elevation, time
- `readings` — id, station_id, value, channel, frequency, electrode
- `processing_jobs` — id, survey_id, type, status, params, result
- `inversion_jobs` — id, survey_id, type, status, params, result
- `anomalies` — id, survey_id, centroid_geom, depth, amplitude, type, uncertainty
- `exports` — id, user_id, survey_id, format, status, url

---

## API Endpoints (C++ / Crow)

```
GET    /api/health                    # Health check
POST   /api/auth/login                # Login → JWT
POST   /api/auth/register             # Register

GET    /api/projects                  # List projects
POST   /api/projects                  # Create project
GET    /api/projects/:id              # Get project
PUT    /api/projects/:id              # Update project
DELETE /api/projects/:id              # Delete project

GET    /api/projects/:id/surveys      # List surveys
POST   /api/projects/:id/surveys      # Create survey
GET    /api/surveys/:id               # Get survey
PUT    /api/surveys/:id               # Update survey
DELETE /api/surveys/:id               # Delete survey

POST   /api/surveys/:id/upload        # Upload raw data file
POST   /api/surveys/:id/reading       # Add single reading (manual)
GET    /api/surveys/:id/readings      # Get readings (paginated)
POST   /api/surveys/:id/readings/batch # Batch add readings

POST   /api/surveys/:id/qc            # Run QC
GET    /api/surveys/:id/qc/results    # Get QC report
POST   /api/surveys/:id/qc/apply     # Apply corrections

POST   /api/surveys/:id/process       # Run processing pipeline
GET    /api/surveys/:id/process/status # Processing status
GET    /api/surveys/:id/process/results # Processing results

POST   /api/surveys/:id/invert        # Run inversion (params in body)
GET    /api/surveys/:id/invert/status # Inversion status (WebSocket too)
GET    /api/surveys/:id/invert/results # Inversion results
POST   /api/surveys/:id/invert/cancel # Cancel job

GET    /api/surveys/:id/anomalies     # Listed detected anomalies
PUT    /api/anomalies/:id             # Edit anomaly (name, type)

POST   /api/surveys/:id/export        # Generate export (CSV, GeoJSON, PDF)
GET    /api/exports/:id/download      # Download export file

GET    /api/surveys/:id/tiles        # Map tiles (XYZ scheme)
GET    /api/surveys/:id/tiles/3d     # 3D tiles (quantized mesh / 3D tiles)

WS     /ws/surveys/:id/progress       # Real-time job progress
```

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope too large for solo | Medium | Prioritize methods by demand (resistivity → mag → gravity → EM → GPR → rest) |
| BERT integration complexity | Medium | Start with simple 1D → add 2D later; BERT has CLI wrapper |
| 3D inversion performance | Low | Optional feature; SimPEG handles parallelism |
| SimPEG Python dependency | Low | 200-line wrapper; if removed, all 1D/2D still work |
| Frontend 3D performance | Medium | LOD, Web Workers, instancing |
| File format unknown formats | Low | CSV/XYZ as universal fallback; add parsers incrementally |
| PDF report difficult in C++ | Low | pdf-writer for simple; client-side pdfmake for complex |
| Windows dev environment | Medium | CMake + vcpkg for C++; WSL2 alternative |
| No geophysics collaborators | Medium | Document formulas; consult textbooks/SimPEG docs |
