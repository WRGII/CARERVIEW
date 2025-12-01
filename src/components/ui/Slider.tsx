import React from 'react'
import { cn } from '../../lib/utils'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
  disabled?: boolean
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  className,
  disabled = false
}) => {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('relative w-full', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-track focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      />
      <div className="flex justify-between text-xs text-slate-500 mt-2">
        {Array.from({ length: max - min + 1 }, (_, i) => (
          <span key={i} className="text-center flex-1">
            {min + i}
          </span>
        ))}
      </div>
      <div 
        className="absolute top-1/2 w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-md transform -translate-y-1/2 -translate-x-1/2 pointer-events-none"
        style={{ left: `${percentage}%` }}
      />
      <style>{`
        .slider-track::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #3B82F6;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
        }
        .slider-track::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #3B82F6;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}