import { useEffect, useState } from 'react'
import { establishSessionFromToken } from '../lib/tokenSession'
import { Link } from 'react-router-dom'

export default function Caregiver() {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await establishSessionFromToken()
      } catch (e: any) {
        if (mounted) setErr(e?.message ?? 'Failed to establish session')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) return <Screen><p>Loading…</p></Screen>
  if (err) return <Screen><p style={{ color: 'crimson' }}>{err}</p><Link to="/get-started">Back to sign in</Link></Screen>

  return (
    <Screen>
      <h1>Caregiver Dashboard</h1>
      <p>Welcome to CareView. You're authenticated as <b>caregiver</b>.</p>
      <ul>
        <li><em>Record Observations</em> (add later)</li>
        <li><em>View Reports</em> (add later)</li>
      </ul>
    </Screen>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return <div style={{ maxWidth: 720, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>{children}</div>
}