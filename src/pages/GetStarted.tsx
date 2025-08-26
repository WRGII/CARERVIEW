import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

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
    <div style={{ maxWidth: 460, margin: '3rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: '1rem' }}>CarerView — Sign In</h1>
      <p style={{ margin: '0 0 1rem' }}>Enter your name and email to continue.</p>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <label>
          <div style={{ fontSize: 14, marginBottom: 4 }}>Display name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Jane Doe"
            style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #ccc' }}
          />
        </label>
        <label>
          <div style={{ fontSize: 14, marginBottom: 4 }}>Email</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="jane@example.com"
            style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #ccc' }}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.7rem 1rem',
            borderRadius: 8,
            border: '1px solid #222',
            background: '#111',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Please wait…' : 'Continue'}
        </button>
        {err && <p style={{ color: 'crimson', marginTop: 8 }}>{err}</p>}
      </form>
    </div>
  )
}