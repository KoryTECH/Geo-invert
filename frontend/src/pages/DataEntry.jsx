import { useParams } from 'react-router-dom'
import Placeholder from '../components/Placeholder.jsx'

export default function DataEntry() {
  const { projectId } = useParams()
  return (
    <Placeholder
      section="DATA ENTRY"
      title={`New survey in ${projectId}`}
      description="Upload wizard for raw field data (CSV, SEG-Y, instrument formats) and manual reading entry. File upload, method selection and coordinate detection land here later."
    />
  )
}
