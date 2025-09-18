// src/pages/caregiver/NewObservationType.tsx
import { Link } from 'react-router-dom';

export default function NewObservationType() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-slate-800 mb-2">Create Observation</h1>
      <p className="text-slate-600 mb-6">Choose the type of form to start.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {/* ADL */}
        <Link
          to="/caregiver/observations/new/adl"
          aria-label="Start an ADL observation"
          className="rounded-2xl border bg-white p-6 text-left hover:shadow transition outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 block"
        >
          <div className="text-lg font-semibold">ADL Observation</div>
          <div className="text-slate-600 mt-1">
            Activities of Daily Living (e.g., eating, dressing, bathing)
          </div>
        </Link>

        {/* IADL */}
        <Link
          to="/caregiver/observations/new/iadl"
          aria-label="Start an IADL observation"
          className="rounded-2xl border bg-white p-6 text-left hover:shadow transition outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 block"
        >
          <div className="text-lg font-semibold">IADL Observation</div>
          <div className="text-slate-600 mt-1">
            Instrumental ADLs (e.g., shopping, managing meds, housekeeping)
          </div>
        </Link>
      </div>
    </div>
  );
}
