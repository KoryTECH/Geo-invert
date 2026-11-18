import { NavLink, Outlet, useParams } from 'react-router-dom'

const TABS = [
  { to: 'data', label: 'Data' },
  { to: 'qc', label: 'QC' },
  { to: '3d', label: '3D' },
  { to: 'interpretation', label: 'Interpretation' },
  { to: 'export', label: 'Export' },
]

// Survey detail shell: header + tab bar + nested tab pages via <Outlet/>.
export default function SurveyDetail() {
  const { surveyId } = useParams()
  return (
    <div className="survey-detail">
      <div className="survey-head">
        <h1>Survey: <span className="mono survey-id">{surveyId}</span></h1>
        <span className="survey-meta mono">ID: {surveyId}</span>
      </div>
      <nav className="tabs">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => `tab${isActive ? ' active' : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <div className="tab-panel">
        <Outlet />
      </div>
    </div>
  )
}
