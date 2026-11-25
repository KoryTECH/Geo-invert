# Project Overview

**Geo-Invert** is a web platform for geophysicists that cuts interpretation and presentation time from days to hours. Users upload field data; the platform handles quality control, inversion, interpretation support, visualization and report generation.

- Solo side project, no fixed deadline.
- Repo: `KoryTECH/Geo-invert` (branch `main`).
- Scope: **ERT/IP only** until results are validated by FUTA lecturers. Other methods come later; long-term plan is multiple methods and possibly a SaaS once funding is sorted.
- Core rule: **do not write custom inversion math.** pyGIMLi does the inversion. Custom code covers parsing, the API, orchestration, the UI, 3D visualization and reports.
- AI-written numerical or inversion logic must be checked against synthetic datasets before it is trusted.
- Interpretation text and material suggestions are drafts. A geophysicist reviews them before anything goes to a client.

## Method build order (resistivity)
SP -> VES -> HP -> 2D ERT -> IP -> 3D ERT

- SP (Self Potential) first: passive, no current injection, no inversion, no pyGIMLi. It proves the upload -> QC -> visualize -> report pipeline.
- HP (Horizontal Profiling) is the same as 2D profiling under different terminology.

## Array selection flow
Method -> Survey Type -> Array

| Survey type | Arrays |
|---|---|
| SP | none |
| VES | Schlumberger, Wenner, Wenner-Schlumberger |
| HP | Wenner, Dipole-Dipole, Schlumberger, Pole-Pole |
| 2D ERT | Wenner, Dipole-Dipole, Schlumberger, Pole-Pole, Pole-Dipole, Gradient |
| IP | same as 2D ERT |
| 3D ERT | all arrays, grid format |

The array choice drives the parser, the geometric factor, pyGIMLi parameters and the upload column format.

See [[02 Architecture]].
