import { NavLink } from 'react-router-dom'
import BackendStatus from './BackendStatus.jsx'

// Shell navigation only. "Reports" and "Settings" exist in the Stitch design
// but have no routes yet, so they render as disabled items.
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/projects/demo-project', label: 'Projects' },
  { to: '/surveys/demo-survey', label: 'Surveys' },
  { to: '/projects/demo-project/surveys/new', label: 'Data Entry' },
  { label: 'Reports', disabled: true },
  { label: 'Settings', disabled: true },
]

function NavIcon({ d }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const ICONS = {
  dashboard: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  surveys: 'M3 11l9-8 9 8M5 11v9h14v-9M9 20v-6h6v6',
  dataEntry: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z',
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-name">GeoAnalysis Pro</span>
        <span className="brand-version mono">v4.2.0-alpha</span>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map((item) =>
          item.disabled ? (
            <span key={item.label} className="nav-link nav-link-disabled" title="Not part of this shell yet">
              {item.label === 'Reports' ? <NavIcon d={ICONS.folder} /> : <NavIcon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1L15 4.6h-4l-.3 2.4a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4L6.6 12a7.8 7.8 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 1.7 1l.3 2.4h4l.3-2.4a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.4z" />}
              <span className="nav-label">{item.label}</span>
            </span>
          ) : (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <NavIcon
                d={
                  item.label === 'Dashboard'
                    ? ICONS.dashboard
                    : item.label === 'Projects'
                      ? ICONS.folder
                      : item.label === 'Surveys'
                        ? ICONS.surveys
                        : ICONS.dataEntry
                }
              />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>

      <BackendStatus />
    </aside>
  )
}
