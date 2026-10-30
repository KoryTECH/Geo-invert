import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ProjectView from './pages/ProjectView.jsx'
import DataEntry from './pages/DataEntry.jsx'
import SurveyDetail from './pages/SurveyDetail.jsx'
import DataTab from './pages/tabs/DataTab.jsx'
import QCTab from './pages/tabs/QCTab.jsx'
import ThreeDTab from './pages/tabs/ThreeDTab.jsx'
import InterpretationTab from './pages/tabs/InterpretationTab.jsx'
import ExportTab from './pages/tabs/ExportTab.jsx'
import NotFound from './pages/NotFound.jsx'

// App shell: fixed sidebar + top bar + scrollable main content.
function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <header className="topbar">
          <div className="search" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span>Search datasets…</span>
          </div>
          <span className="topbar-meta mono">SHELL 0.1 — NO LIVE DATA YET</span>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects/:projectId" element={<ProjectView />} />
        <Route path="/projects/:projectId/surveys/new" element={<DataEntry />} />
        <Route
          path="/surveys/:surveyId"
          element={<SurveyDetail />}
        >
          {/* /surveys/:id lands on the Data tab */}
          <Route index element={<Navigate to="data" replace />} />
          <Route path="data" element={<DataTab />} />
          <Route path="qc" element={<QCTab />} />
          <Route path="3d" element={<ThreeDTab />} />
          <Route path="interpretation" element={<InterpretationTab />} />
          <Route path="export" element={<ExportTab />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
