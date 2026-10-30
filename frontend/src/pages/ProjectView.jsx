import { useParams } from 'react-router-dom'
import Placeholder from '../components/Placeholder.jsx'

export default function ProjectView() {
  const { projectId } = useParams()
  return (
    <Placeholder
      section="PROJECT"
      title={`Project: ${projectId}`}
      description={`Project overview for “${projectId}”. The survey list, project settings and coverage map will appear here. Survey detail is not linked from a placeholder shell — open /surveys/demo-survey directly.`}
    />
  )
}
