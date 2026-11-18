import { useLocation } from 'react-router-dom'

// Shared placeholder: Stitch-styled card with a section tag, title and
// short description. Pages pass their copy in; nothing is live yet.
export default function Placeholder({ section, title, description }) {
  const location = useLocation()
  return (
    <div className="card placeholder">
      <span className="placeholder-tag mono">{section}</span>
      <h1>{title}</h1>
      <p className="description">{description}</p>
      <span className="mono-note mono">route: {location.pathname}</span>
    </div>
  )
}
