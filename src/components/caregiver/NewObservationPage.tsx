// src/pages/caregiver/NewObservationPage.tsx
import { useNavigate } from 'react-router-dom'
import ObservationForm from '../../components/caregiver/ObservationForm'

export default function NewObservationPage() {
  const navigate = useNavigate()
  return <ObservationForm onComplete={() => navigate('/caregiver')} />
}
