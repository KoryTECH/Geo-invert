# Stitch Design Prompt — Geo-Calc

Use this prompt on [Stitch](https://stitch.xyz) (or any AI design tool) to generate the design system and UI layouts for the Geo-Calc geophysical data platform.

---

## Project Description

A web application for geophysicists. Users upload raw field data (magnetic, gravity, resistivity, GPR, EM, seismic, radiometric, MT, well logs), the platform processes and inverts it automatically, and displays results as interactive maps, 3D visualizations, cross-sections, and anomaly maps. Everything is downloadable as PDF reports and data exports.

**Target users:** Geophysics students, field geophysicists, engineering geologists
**Tone:** Professional, technical, clean, modern
**Theme:** Dark mode default (light mode also supported)

---

## Color Palette

```
Primary:       #1A73E8 (geophysics blue)
Secondary:     #34A853 (survey green)
Accent:        #FBBC04 (anomaly yellow)
Danger:        #EA4335 (error red)
Dark BG:       #121212
Dark Card:     #1E1E1E
Dark Surface:  #2A2A2A
Dark Text:     #FFFFFF / #B0B0B0
Light BG:      #F5F5F5
Light Card:    #FFFFFF
Light Surface: #E8E8E8
```

---

## Typography

```
Font: Inter (sans-serif)
Headings: Bold, 24px / 20px / 18px / 16px
Body: Regular, 14px
Caption: Regular, 12px
Monospace: JetBrains Mono (for data tables, coordinates)
```

---

## Design Components Needed

### 1. Navigation / Shell

**Layout:**
- Left sidebar (collapsible): nav links, project switcher
- Top bar: search, notifications, user avatar, settings, dark/light toggle
- Main content area: fills remaining space
- Optional right panel: context inspector (contextual: shows selected anomaly/station details)

**Sidebar Items:**
- Dashboard (home icon)
- My Projects (folder icon)
- Surveys (layers icon)
- Data Entry (edit icon)
- Reports (file-text icon)
- Settings (gear icon)

**Top Bar Elements:**
- Current project name (dropdown to switch)
- Search bar (search surveys, stations, anomalies)
- Bell icon (notifications)
- User avatar + dropdown (profile, logout)
- Dark/light toggle (moon/sun)

---

### 2. Dashboard / Home Page

**Layout:** Card grid

**Cards:**
- Active Projects (count + list of 3 most recent)
- Recent Surveys (table: name, method, date, status badge)
- Processing Queue (progress bars for running jobs)
- Quick Actions (New Project, Upload Data, Open Last Survey)

**Status Badges:** Uploaded / Processing / QC Done / Inverted / Complete / Failed

**Charts (optional):**
- Surveys by method (donut chart)
- Recent activity timeline

---

### 3. Project View

**Layout:** Two-panel

**Left Panel — Project Sidebar:**
- Project name, description, CRS info
- List of surveys in project (expandable by method)
- Add Survey button (floating + icon)
- Project settings (edit name, CRS, delete)

**Right Panel — Main Content:**
- Map view (default) showing all survey locations
- Tabs: Map | Table | Gallery (survey thumbnails)
- When no surveys: empty state with "Create your first survey" prompt

---

### 4. Survey Detail Page (The Core UI)

**Layout:** Tabbed interface

**Tabs Bar:**
| Data | QC | Processing | Inversion | 3D | Interpretation | Export |

#### Tab: Data
- **Top:** Survey info bar (method, sub-method, station count, date, coordinate system)
- **Map:** MapLibre map with station points colored by value
  - Layer toggle: stations, profiles, grid, topography, satellite basemap
  - Click any station → popup with reading values
- **Bottom:** Data table (AG Grid style)
  - Columns: Station ID, Easting, Northing, Elevation, Value, Time, QC Flag
  - Sortable, filterable, exportable to CSV
  - Bulk edit: delete, flag, interpolate selected rows
- **Floating button:** Add Reading (opens modal form)

#### Tab: QC
- **Layout:** Split pane
- **Left:** QC tools panel
  - Histogram of values (with outlier thresholds)
  - Coverage map with flagged stations highlighted red
  - QC metrics summary (min, max, mean, std, flagged %)
  - Correction toggles (IGRF, diurnal, drift, etc.) with Apply button
  - QC report button
- **Right:** Map with QC overlay
  - Green = pass, yellow = warning, red = fail
  - Click station → QC detail popup

#### Tab: Processing
- **Layout:** Vertical wizard / step panel
- **Steps:**
  1. Corrections (already applied in QC, review here)
  2. Compute apparent values (resistivity: ρₐ, magnetics: RTP, etc.)
  3. Generate pseudo-section / cross-section
  4. Filtering options (low-pass, high-pass, median)
- Each step: config panel + preview (map or chart)
- Run Processing button → progress bar → results view

#### Tab: Inversion
- **Layout:** Configuration form + results panel
- **Left (Config):**
  - Inversion type dropdown: 1D, 2D, 3D
  - Parameter inputs:
    - Number of layers / mesh size
    - Regularization strength (lambda slider)
    - Starting model (uniform / gradient / from file)
    - Data error (%) / noise floor
    - Iterations, tolerance
    - Advanced: smoothing weights, reference model, bounds
  - Template presets ("Quick", "Detailed", "High Resolution")
  - Run Inversion button
- **Right (Results):**
  - Progress indicator (bar + ETA)
  - Convergence plot (misfit vs iteration)
  - When done: cross-section (2D) or depth slices (3D)
  - Fit comparison: observed vs calculated (graph + RMS)
  - Model resolution / sensitivity map

#### Tab: 3D (three.js / React Three Fiber)
- **Layout:** Full-screen viewer with toolbar overlay
- **Toolbar:**
  - Orbit / pan controls
  - Tool: Measure (click two points → distance, depth)
  - Tool: Anomaly Pick (click on model → create anomaly object)
  - Tool: Crosshair (slice viewer at point)
  - View preset: Top, Front, Side, Perspective
  - Color scale editor (min/max, colormap picker)
  - Opacity slider
  - Screenshot button
- **3D Scene:**
  - Voxel / isosurface model (semi-transparent)
  - Depth slice plane (draggable, animated sweep with slider)
  - Cross-section planes (3 orthogonal, draggable)
  - Detected anomalies as labeled isosurfaces
  - Station / well paths if available
  - Topography surface from DEM
  - Axes, scale bar, north arrow (AR scene marker)

#### Tab: Interpretation
- **Layout:** Split panel
- **Left — Anomaly List:**
  - Table of detected anomalies:
    - ID, Type (magnetic dipole, gravity sphere, etc.), Easting, Northing, Depth, Amplitude, Confidence
    - Color-coded by type
    - Click → highlight on map + 3D
  - Anomaly detail panel (on click or expand):
    - Coordinates, depth estimate
    - Profile: observed vs calculated (cross-section through anomaly)
    - Auto-classification result with confidence
    - Manual override: rename type, adjust depth, set flag (confirmed/rejected)
  - Add Manual Anomaly button
- **Right — Map + 3D mini-view:**
  - Map with anomaly symbols (diamond, circle, triangle by type)
  - 3D view showing anomaly objects in context
  - Quick toggle: map / 3D / split

#### Tab: Export
- **Layout:** Card grid
- **Export Data Cards:**
  - GeoJSON (stations, anomalies, profiles) → download icon
  - CSV / Excel (raw, processed, inversion model) → download icon
  - UBC-GIF 3D model → download icon
  - XYZ grid (depth slice, anomaly surface) → download icon
  - SEG-Y (processed GPR/seismic) → download icon
  - PDF Report → configure + generate icon
- **PDF Report Builder:**
  - Template: default / branded / custom
  - Sections checklist:
    - [ ] Title page
    - [ ] Survey overview
    - [ ] QC summary (histogram, coverage)
    - [ ] Maps (filtered, RTP, Bouguer, etc.)
    - [ ] Inversion results (cross-section, depth slices)
    - [ ] Anomaly table
    - [ ] Interpretation summary
    - [ ] Recommendations
  - Page size: A4 / Letter
  - Generate PDF button

---

### 5. Data Entry Page (Manual Input)

**Layout:** Map + form split

**Left — Map:**
- Click to place station → auto-fill coordinates
- Existing stations shown as dots
- Profile tools: draw line for multi-station entry

**Right — Form:**
- Project / Survey selector (dropdown)
- Station ID (text, auto-increment)
- Coordinates: Lat/Lon or Easting/Northing + CRS (auto from map click)
- Elevation (auto from DEM if available, editable)
- Reading values:
  - Single reading: one value field
  - Multiple channels: expandable fields (e.g., N, E, V for EM)
  - For arrays (resistivity): electrode positions A, B, M, N + current + voltage
- Time (auto if not set)
- Notes / comments field
- Save & Next (add another station)
- Save & Close (return to survey)

---

### 6. Settings Page

**Layout:** Tabs

**Tabs:**
- Profile: name, email, company, password change
- Preferences: default CRS, default method, dark/light mode, language
- Processing Defaults: default inversion parameters per method
- Report Template: company logo, header, footer, default sections
- API Keys: generate/manage API tokens
- Team (future): invite collaborators, permissions

---

### 7. Modal / Dialog Components

**New Project Modal:**
- Name (text input)
- Description (textarea)
- Default CRS (select: WGS84 / UTM / custom)
- Create button

**New Survey Modal:**
- Name (text input)
- Method (dropdown: Resistivity, Magnetics, Gravity, EM, GPR, Seismic, Radiometrics, MT, Well Logs)
- Sub-method (dropdown, changes based on method)
- Description (textarea)
- Station count (optional number)
- Create button

**Upload Data Modal:**
- Drag & drop zone (accepts .csv, .xyz, .seg, .seg-y, .txt, .dat, .las, .edi, .dzt, etc.)
- Or browse files button
- Upload progress bar
- Auto-detect result: "Detected: Resistivity (Schlumberger) - 47 stations"
- Confirm / override detection
- Parse button → results preview

**Add Reading Modal:**
- Same as Data Entry form (compact version)
- Latitude / Longitude from map click (or manual)
- Method-specific fields change dynamically
- Quick-add: multiple readings at once (grid entry)

**Anomaly Detail Modal:**
- Anomaly ID, type, coordinates, depth, amplitude, confidence
- Profile graph (observed vs calculated)
- Classification result (ML output)
- Edit fields
- Confirm / Reject / Delete buttons

---

## Responsive Breakpoints

- Desktop (1280px+): Full layout with sidebar
- Tablet (768-1280px): Collapsed sidebar, stacked panels
- Mobile (<768px): Bottom navigation, full-width panels

---

## Interaction Patterns

- Hover on station → tooltip with value
- Click station → select, right panel shows details
- Drag on map → selection box (rectangle / lasso)
- Ctrl+click → multi-select stations
- Scrub on chart → crosshair on map/3D
- Double-click 3D → focus / zoom to anomaly
- Scrub through depth slider → 3D model updates realtime

---

## Example Design Prompts for Stitch AI

Prompt your design tool with these to generate specific pages:

### Dashboard
> A dark-themed geophysics software dashboard with a left navigation sidebar (Projects, Surveys, Data Entry, Reports, Settings). The main area shows cards: "Active Projects" (3 recent), "Recent Surveys" (table with method badges), "Processing Queue" (progress bars), and a donut chart of survey methods. Top bar has search, notifications bell, user avatar, and dark/light toggle. Professional, tech-forward, clean.

### Survey Map View
> A dark geophysics web app showing a survey map (MapLibre style) with colorful station points on a dark terrain basemap. Sidebar shows survey info (method: Magnetics, 240 stations). Bottom panel has a data table with columns Station ID, Easting, Northing, Value, QC Flag. Station points are colored by magnetic intensity (blue to red gradient). A collapsible right panel shows selected station details. Clean, technical.

### 3D Inversion Viewer
> A full-screen 3D viewer (Three.js style) showing a semi-transparent voxel model of magnetic susceptibility underground. Depth ranges from 0m to 50m. Red/yellow blobs show anomalies at 15m and 35m depth with labels. Draggable cross-section planes (blue translucent) slice through the volume. A toolbar floats at the top with orbit, zoom, and measurement tools. Opacity slider at bottom. Professional geophysics visualization.

### QC Page
> A dark geophysics QC page split in two panels. Left panel shows QC tools: a histogram of readings with threshold markers, QC metric cards (min, max, mean, std, flagged %), and a vertical list of correction toggles with Apply All button. Right panel is a map where stations are colored green (pass), yellow (warning), and red (fail) dots. Clean, data-dense, technical.

### PDF Report
> A sample geophysics report PDF in A4 landscape showing: a title page with survey name and date, a brief overview table, a color-filled contour map with station locations, a cross-section inversion result with colorbar, a compact anomaly table, and a conclusion paragraph. Professional, clean, blue accent color scheme.

---

## File Export Specifications

### PDF Report (pdfmake-compatible)
```
- A4 / Letter
- Sections: Title → Overview → QC → Map → Inversion → Anomalies → Interpretation
- Header: Project name + company logo
- Footer: Page number, date, "Generated by Geo-Calc"
- Maps: inline PNG screenshots
- Tables: formatted with alternating row colors
```

### GeoJSON Export
```json
{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [easting, northing, elevation]
    },
    "properties": {
      "station_id": "S001",
      "value": 45.2,
      "qc_flag": "pass",
      "depth_estimate": null
    }
  }]
}
```

### CSV Export
```
station_id,easting,northing,elevation,value,qc_flag,anomaly_id
S001,524123.45,6789123.78,45.2,32.1,pass,A01
```

---

## Notes for Stitch AI Design Generation

1. Generate responsive components — map and 3D viewer should flex to fill available space
2. Use glass-morphism for overlays and modals (subtle backdrop blur)
3. Cards should have subtle border + shadow on dark bg
4. Data tables should support sticky headers, horizontal scroll
5. Status indicators should use semantic colors (green/amber/red) consistently
6. Icons should be outlined (Feather or Lucide style)
7. All interactive elements (buttons, links, table rows) should have hover state
8. Maps should default to a dark satellite basemap (dark mode) and light street map (light mode)
9. Colorbar / legend should be present on all map and 3D views
