// src/components/common/Footer.tsx
import React from 'react'
import { useSiteSettings } from '../../hooks/useSiteSettings'

export default function Footer({ className = '' }: { className?: string }) {
  const { data } = useSiteSettings()
  const logo =
    data?.logo_url || '/CareView_logo_1_colored_highres.png' // fallback to existing asset

  return (
    <footer className={`py-16 text-center border-t border-slate-gray/20 ${className}`}>
      <div className="flex items-center justify-center mb-6">
        <img
          src={logo}
          alt="CarerView Logo"
          className="w-12 h-12 object-contain"
          loading="lazy"
        />
      </div>

      <p className="text-slate-gray/60 text-sm mb-4">
        Built with caregivers & clinicians in mind. Categories reflect widely used ADL & IADL
        frameworks and occupational-therapy best practices, translated into everyday language
        families can use together.
      </p>

      <p className="text-slate-gray/50 text-xs">
        © {new Date().getFullYear()} CarerView App&nbsp;| All rights reserved | a GrifDigi company
      </p>
    </footer>
  )
}
