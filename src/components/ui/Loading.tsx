import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingProps {
  message?: string
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-warm-white">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-primary mb-4" />
      <p className="text-slate-gray/80 text-lg">{message}</p>
    </div>
  )
}