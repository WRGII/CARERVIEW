import React from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

export function Footer() {
  const [logoUrl, setLogoUrl] = React.useState<string>('/CareView_logo_1_colored_highres.png')

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase
          .schema('app')
          .from('site_settings')
          .select('logo_url')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!mounted) return
        if (data?.logo_url) setLogoUrl(data.logo_url)
      } catch {
        // keep fallback
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const year = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <img
            src={logoUrl}
            alt="CarerView"
            className="w-6 h-6 object-contain opacity-80"
          />
        </div>
        <p className="text-slate-600 text-sm mb-2">
          Built with caregivers &amp; clinicians in mind. Categories reflect widely used ADL &amp; IADL frameworks and occupational-therapy best practices, translated into everyday language families can use together.
        </p>
        <div className="mb-4">
          <Link
            to="/about"
            className="text-cyan-primary hover:text-cyan-hover font-medium underline text-sm"
          >
            About CarerView
          </Link>
        </div>
        <p className="text-slate-500 text-xs">
          © {year} CarerView App | All rights reserved | a GrifDigi company
        </p>
      </div>
    </footer>
  )
}

// Provide default export too so either import style works.
export default Footer
