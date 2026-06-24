---
name: Technical Precision
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#38393a'
  surface-container-lowest: '#0d0e0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#292a2a'
  surface-container-highest: '#343535'
  on-surface: '#e3e2e2'
  on-surface-variant: '#c1c6d6'
  inverse-surface: '#e3e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#8b909f'
  outline-variant: '#414754'
  surface-tint: '#adc7ff'
  primary: '#adc7ff'
  on-primary: '#002e68'
  primary-container: '#1a73e8'
  on-primary-container: '#ffffff'
  inverse-primary: '#005bc0'
  secondary: '#6ddd81'
  on-secondary: '#003914'
  secondary-container: '#30a550'
  on-secondary-container: '#003210'
  tertiary: '#fbbc05'
  on-tertiary: '#402d00'
  tertiary-container: '#987000'
  on-tertiary-container: '#ffffff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc7ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#89fa9b'
  secondary-fixed-dim: '#6ddd81'
  on-secondary-fixed: '#002108'
  on-secondary-fixed-variant: '#005320'
  tertiary-fixed: '#ffdfa0'
  tertiary-fixed-dim: '#fbbc05'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#121414'
  on-background: '#e3e2e2'
  surface-variant: '#343535'
typography:
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  h3:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  h4:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  sidebar_width: 260px
  sidebar_collapsed: 64px
---

## Brand & Style
The design system is engineered for high-density geophysical data analysis. The brand personality is rooted in technical authority and mathematical precision, targeting geophysicists, engineers, and data scientists who require a focused, low-fatigue environment for long-duration work.

The visual style is **Corporate Modern** with a focus on functional utility. It utilizes a structured layout to manage complex data sets, punctuated by subtle **Glassmorphism** for transient layers (modals, overlays) to maintain spatial context without cluttering the primary workspace. The interface prioritizes clarity and legibility, ensuring that critical anomalies are immediately identifiable through a disciplined use of semantic color.

## Colors
The default state for the design system is **Dark Mode**, optimized for high-contrast data visualization and reduced eye strain in laboratory or field environments. 

- **Primary (Geophysics Blue):** Used for primary actions, active states, and navigational highlights.
- **Secondary (Survey Green):** Reserved for "Success" states and validated data points.
- **Tertiary (Anomaly Yellow):** Specifically for warnings, areas of interest, or pending calculations.
- **Danger (Error Red):** Strictly for system errors, failed computations, or destructive actions.
- **Neutrals:** A range of greys used to define hierarchy within the UI, from deep background layers to crisp, high-legibility text.

## Typography
The system employs a dual-font strategy to balance readability with technical utility. 

- **Inter** handles all UI chrome, navigational elements, and body text. It is chosen for its exceptional legibility and neutral character.
- **JetBrains Mono** is utilized for all coordinate data, mathematical strings, and tabular data. The monospaced nature ensures that columns of numbers align perfectly, allowing for easier visual scanning of numerical patterns.

All headings use a Bold or Semi-Bold weight to anchor the sections of data-heavy screens. For mobile views, headers scale down slightly, but the primary 14px body size remains constant to ensure data is never unreadable.

## Layout & Spacing
This design system uses a **Fluid Grid** model with a base unit of 4px. This tight spacing scale allows for high information density without sacrificing clarity. 

- **Sidebar:** A collapsible left-hand navigation that minimizes to an icon-only rail to maximize workspace for maps and 3D views.
- **Main Content:** Occupies the remaining viewport width. For data tables, content should stretch to 100% width with sticky headers and pinned columns for horizontal scrolling.
- **Containers:** Visualization containers (Maps/3D) should prioritize vertical real estate, using floating toolbars rather than fixed header bars where possible.
- **Breakpoints:**
  - Desktop: 1280px+ (Full sidebar, multi-pane views).
  - Tablet: 768px - 1279px (Collapsed sidebar, stacked panes).
  - Mobile: <768px (Single pane focus, drawer navigation).

## Elevation & Depth
Depth is used sparingly to maintain a "scientific instrument" feel. 

- **Tonal Layers:** The primary depth mechanism. The background is the lowest layer (`#121212`), cards and main panels sit on top (`#1E1E1E`), and interactive surfaces like inputs or active buttons sit on the highest surface tier (`#2A2A2A`).
- **Glassmorphism:** Reserved for temporary overlays, such as command palettes, tooltips, and modal dialogs. Use a 12px backdrop blur with a semi-transparent surface (`rgba(30, 30, 30, 0.8)`) and a 1px subtle border.
- **Shadows:** Use extremely soft, low-opacity shadows (e.g., `0 4px 20px rgba(0,0,0,0.5)`) only on floating elements to separate them from the grid below.

## Shapes
The design system uses a **Soft** shape language (`0.25rem`). This small radius provides a modern feel while maintaining the structural, "boxy" efficiency required for technical software. 

- **Standard Elements:** Buttons, inputs, and small cards use a 4px (0.25rem) radius.
- **Large Containers:** Modals and main dashboard cards use an 8px (0.5rem) radius.
- **Interactive Indicators:** Radio buttons and checkboxes follow standard conventions (round and square with small radius, respectively).

## Components
- **Buttons:** Primary buttons use a solid #1A73E8 fill. Secondary buttons are outlined. Use the `data-mono` font for buttons containing coordinates or specific numerical values.
- **Data Tables:** Headers must be sticky with a distinct background color (`#2A2A2A`). Row height should be compact (32px - 36px) to maximize data visibility. Use JetBrains Mono for all cell data.
- **Sidebar:** Features an icon-plus-label structure. When collapsed, only the outlined icon is visible. The active state is indicated by a 3px vertical "Primary Blue" bar on the left edge.
- **Input Fields:** Outlined style with a 1px border. In dark mode, the border is `#3A3A3A`, turning `#1A73E8` on focus. Labels sit above the field in `caption` style.
- **Status Indicators:** Small circular pips or subtle background chips using Survey Green, Anomaly Yellow, or Error Red to communicate the health of data streams or computation status.
- **Floating Toolbars:** Used within 3D/Map views. These should be glassmorphic with high-contrast outlined icons.