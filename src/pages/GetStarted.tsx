import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Activity } from 'lucide-react'

type BootRow = { raw_token?: string; role?: 'admin' | 'caregiver' }

export default function GetStarted() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErr(null)

    const { data, error } = await supabase.rpc('bootstrap_login', {
      _display_name: name,
      _email: email,
    })

    setLoading(false)

    if (error) {
      setErr(error.message)
      return
    }

    const row: BootRow | undefined = Array.isArray(data) ? data[0] : (data as any)
    const token = row?.raw_token
    const role = row?.role
    if (!token || !role) {
      setErr('Login failed — missing token or role.')
      return
    }

    const dest = role === 'admin' ? '/admin' : '/caregiver'
    window.location.href = `${dest}?token=${encodeURIComponent(token)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Activity className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            CarerView
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Functional Assessment and Monitoring Observation System
          </p>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto">
            A professional platform for caregivers to record observation scores across 
            ADA/OT-aligned ADL & IADL categories with secure, token-based access.
          </p>
        </div>

        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">Sign In</h2>
          <p className="text-slate-600 mb-6 text-center">Enter your name and email to continue.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Display name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Doe"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="jane@example.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Please wait…' : 'Continue'}
            </button>
            {err && <p className="text-red-600 text-sm text-center mt-2">{err}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}