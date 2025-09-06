import React from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useLegend } from '../../hooks/useLegend'

export const ScoreLegendDisplay: React.FC = () => {
  const { data: legend, isLoading, error } = useLegend()

  if (isLoading) {
    return (
      <div className="bg-white border rounded-xl">
        <div className="px-4 py-3 border-b bg-slate-50">
          <h3 className="font-semibold text-slate-900">Score Reference</h3>
        </div>
        <div className="p-6">
          <div className="text-slate-500 text-center py-8">Loading score reference...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border rounded-xl">
        <div className="px-4 py-3 border-b bg-slate-50">
          <h3 className="font-semibold text-slate-900">Score Reference</h3>
        </div>
        <div className="p-6">
          <div className="text-red-600 text-center py-8">Failed to load score reference</div>
        </div>
      </div>
    )
  }

  if (!legend || legend.length === 0) {
    return (
      <div className="bg-white border rounded-xl">
        <div className="px-4 py-3 border-b bg-slate-50">
          <h3 className="font-semibold text-slate-900">Score Reference</h3>
        </div>
        <div className="p-6">
          <div className="text-slate-500 text-center py-8">No score reference available</div>
        </div>
      </div>
    )
  }

  // Filter and sort legend items for scores 1-5
  const filteredLegend = legend
    .filter(item => item.score >= 1 && item.score <= 5)
    .sort((a, b) => a.score - b.score)

  // Color mapping for scores 1-5
  const getScoreColorNew = (score: number) => {
    switch (score) {
      case 1: return 'bg-peach-blush'
      case 2: return 'bg-peach-blush/70'
      case 3: return 'bg-cyan-primary/40'
      case 4: return 'bg-mint-green/70'
      case 5: return 'bg-mint-green'
      default: return 'bg-slate-gray'
    }
  }

  // Extract main title and description from the legend descriptions
  const getScoreInfo = (description: string) => {
    const parts = description.split(' – ')
    if (parts.length >= 2) {
      return {
        title: parts[0].trim(),
        description: parts[1].trim()
      }
    }
    return {
      title: description,
      description: ''
    }
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-slate-50">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-wide">
            CARERVIEW 1-5 ADL SCALE
          </h2>
        </div>

        {/* Horizontal Scale */}
        <div className="flex items-center justify-center space-x-2 md:space-x-4">
          {/* Thumbs Down Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-600 rounded-full flex items-center justify-center">
              <ThumbsDown className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          </div>

          {/* Score Blocks */}
          <div className="flex flex-1 max-w-4xl">
            {filteredLegend.map((item, index) => {
              const scoreInfo = getScoreInfo(item.description)
              const isLast = index === filteredLegend.length - 1
              
              return (
                <div
                  key={item.score}
                  className={`flex-1 ${getScoreColor(item.score)} ${
                    index === 0 ? 'rounded-l-lg' : ''
                  } ${isLast ? 'rounded-r-lg' : ''} relative`}
                  style={{ minHeight: '120px' }}
                >
                  {/* Score Number */}
                  <div className="text-center pt-4 pb-2">
                    <span className="text-2xl md:text-3xl font-bold text-white">
                      {item.score}
                    </span>
                  </div>
                  
                  {/* Score Title */}
                  <div className="px-2 pb-2">
                    <div className="text-center text-white font-semibold text-xs md:text-sm leading-tight">
                      {scoreInfo.title}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Thumbs Up Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-600 rounded-full flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Detailed Descriptions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3">
          {filteredLegend.map((item) => {
            const scoreInfo = getScoreInfo(item.description)
            return (
              <div key={item.score} className="text-center">
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm mb-2 ${getScoreColor(item.score)}`}>
                  {item.score}
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
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