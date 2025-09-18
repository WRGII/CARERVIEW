import { useNavigate } from 'react-router-dom'

export default function NewObservationType() {
  const navigate = useNavigate()
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-slate-800 mb-2">Create Observation</h1>
      <p className="text-slate-600 mb-6">Choose the type of form to start.</p>

      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/caregiver/observations/new/adl')}
          className="rounded-2xl border bg-white p-6 text-left hover:shadow transition"
        >
          <div className="text-lg font-semibold">ADL Observation</div>
          <div className="text-slate-600 mt-1">
            Activities of Daily Living (e.g., eating, dressing, bathing)
          </div>
        </button>

        <button
          onClick={() => navigate('/caregiver/observations/new/iadl')}
          className="rounded-2xl border bg-white p-6 text-left hover:shadow transition"
        >
          <div className="text-lg font-semibold">IADL Observation</div>
          <div className="text-slate-600 mt-1">
            Instrumental ADLs (e.g., shopping, managing meds, housekeeping)
          </div>
        </button>
      </div>
    </div>
  )
}