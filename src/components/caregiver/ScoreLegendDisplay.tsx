import React from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useLegend } from '../../hooks/useLegend'

type Props = {
  /** Smaller paddings / heights / text on small screens. Backward-compatible (optional). */
  compact?: boolean
  /** Allow custom margins from parent */
  className?: string
}

export const ScoreLegendDisplay: React.FC<Props> = ({ compact = false, className }) => {
  const { data: legend, isLoading, error } = useLegend()

  if (isLoading) {
    return (
      <div className={`bg-white border rounded-xl ${className ?? ''}`}>
        <div className="px-4 py-3 border-b bg-slate-50">
          <h3 className="font-semibold text-slate-900">Score Reference</h3>
        </div>
        <div className="p-4 md:p-6">
          <div className="text-slate-500 text-center py-6 md:py-8">Loading score reference...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white border rounded-xl ${className ?? ''}`}>
        <div className="px-4 py-3 border-b bg-slate-50">
          <h3 className="font-semibold text-slate-900">Score Reference</h3>
        </div>
        <div className="p-4 md:p-6">
          <div className="text-red-600 text-center py-6 md:py-8">Failed to load score reference</div>
        </div>
      </div>
    )
  }

  if (!legend || legend.length === 0) {
    return (
      <div className={`bg-white border rounded-xl ${className ?? ''}`}>
        <div className="px-4 py-3 border-b bg-slate-50">
          <h3 className="font-semibold text-slate-900">Score Reference</h3>
        </div>
        <div className="p-4 md:p-6">
          <div className="text-slate-500 text-center py-6 md:py-8">No score reference available</div>
        </div>
      </div>
    )
  }

  const filteredLegend = legend
    .filter(item => item.score >= 1 && item.score <= 5)
    .sort((a, b) => a.score - b.score)

  const getScoreColor = (score: number) => {
    switch (score) {
      case 1: return 'bg-peach-blush'
      case 2: return 'bg-peach-blush/70'
      case 3: return 'bg-cyan-primary/40'
      case 4: return 'bg-mint-green/70'
      case 5: return 'bg-mint-green'
      default: return 'bg-slate-gray'
    }
  }

  const getScoreInfo = (description: string) => {
    const parts = description.split(' – ')
    if (parts.length >= 2) {
      return { title: parts[0].trim(), description: parts[1].trim() }
    }
    return { title: description, description: '' }
  }

  const blockMinH = compact ? 'min-h-[72px] md:min-h-[120px]' : 'min-h-[96px] md:min-h-[120px]'
  const padX = compact ? 'px-3 md:px-4' : 'px-6'
  const padY = compact ? 'py-2 md:py-3' : 'py-4'
  const titleSize = compact ? 'text-xl md:text-3xl' : 'text-2xl md:text-3xl'
  const iconWrap = compact ? 'w-8 h-8 md:w-10 md:h-10' : 'w-12 h-12 md:w-16 md:h-16'
  const icon = compact ? 'w-4 h-4 md:w-5 md:h-5' : 'w-6 h-6 md:w-8 md:h-8'
  const gridCols = compact ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-1 md:grid-cols-5'
  const descText = compact ? 'text-[10px] md:text-xs' : 'text-xs md:text-sm'

  return (
    <div className={`bg-white border rounded-xl overflow-hidden ${className ?? ''}`}>
      <div className={`${padX} ${padY} bg-gradient-to-r from-blue-50 to-slate-50`}>
        {/* Title */}
        <div className={`text-center ${compact ? 'mb-2 md:mb-3' : 'mb-4 md:mb-6'}`}>
          <p className={`${compact ? 'text-xs md:text-sm' : 'text-sm md:text-base'} font-semibold text-slate-500 uppercase tracking-widest mb-0.5`}>
            Activities of Daily Living
          </p>
          <h2 className={`${titleSize} font-bold text-slate-800 tracking-wide`}>
            CarerView 1–5 Scale
          </h2>
        </div>

        {/* Horizontal Scale */}
        <div className={`flex items-center justify-center ${compact ? 'space-x-1 md:space-x-2' : 'space-x-2 md:space-x-4'}`}>
          <div className="flex-shrink-0">
            <div className={`${iconWrap} bg-slate-600 rounded-full flex items-center justify-center`}>
              <ThumbsDown className={`${icon} text-white`} />
            </div>
          </div>

          <div className="flex flex-1 max-w-4xl">
            {filteredLegend.map((item, index) => {
              const scoreInfo = getScoreInfo(item.description)
              const isLast = index === filteredLegend.length - 1
              return (
                <div
                  key={item.score}
                  className={`flex-1 ${getScoreColor(item.score)} ${blockMinH} ${
                    index === 0 ? 'rounded-l-lg' : ''
                  } ${isLast ? 'rounded-r-lg' : ''} relative`}
                >
                  <div className="text-center pt-2 md:pt-4 pb-1 md:pb-2">
                    <span className={`font-bold text-slate-700 ${compact ? 'text-lg md:text-2xl' : 'text-2xl md:text-3xl'}`}>
                      {item.score}
                    </span>
                  </div>
                  <div className={`${compact ? 'px-0.5 md:px-1 pb-1 md:pb-2' : 'px-1 md:px-2 pb-2'}`}>
                    <div className={`text-center text-slate-700 font-semibold leading-tight ${compact ? 'text-[8px] md:text-xs' : 'text-[10px] md:text-sm'}`}>
                      {scoreInfo.title}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex-shrink-0">
            <div className={`${iconWrap} bg-slate-600 rounded-full flex items-center justify-center`}>
              <ThumbsUp className={`${icon} text-white`} />
            </div>
          </div>
        </div>

        {/* Detailed Descriptions */}
        <div className={`${compact ? 'mt-2 md:mt-3' : 'mt-4 md:mt-6'} grid ${gridCols} gap-1 md:gap-2`}>
          {filteredLegend.map((item) => {
            const scoreInfo = getScoreInfo(item.description)
            return (
              <div key={item.score} className="text-center">
                <div
                  className={`inline-flex items-center justify-center rounded-full text-slate-700 font-bold mb-1 md:mb-2 ${
                    compact ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
                  } ${getScoreColor(item.score)}`}
                >
                  {item.score}
                </div>
                <div className={`text-slate-700 leading-tight ${descText}`}>
                  {scoreInfo.description || scoreInfo.title}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
