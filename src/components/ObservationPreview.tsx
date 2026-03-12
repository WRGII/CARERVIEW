import { ThumbsDown, ThumbsUp } from 'lucide-react'

const SCORE_LABELS: Record<number, string> = {
  1: 'Fully Independent',
  2: 'Independent with Difficulty',
  3: 'Independent with Support',
  4: 'Constant Shared Effort',
  5: 'Total Assistance',
}

const FILLED_SHADES: Record<number, string> = {
  1: 'bg-mint-green text-slate-gray border-mint-green',
  2: 'bg-mint-green/70 text-slate-gray border-mint-green/70',
  3: 'bg-cyan-primary/30 text-slate-gray border-cyan-primary/30',
  4: 'bg-peach-blush/70 text-white border-peach-blush/70',
  5: 'bg-peach-blush text-white border-peach-blush',
}

const MUTED_OUTLINES: Record<number, string> = {
  1: 'border-mint-green/40 text-slate-gray/40 bg-transparent',
  2: 'border-mint-green/30 text-slate-gray/40 bg-transparent',
  3: 'border-cyan-primary/20 text-slate-gray/40 bg-transparent',
  4: 'border-peach-blush/30 text-slate-gray/40 bg-transparent',
  5: 'border-peach-blush/40 text-slate-gray/40 bg-transparent',
}

type Props = {
  questionText: string
  selectedScore: number
  accentColor: 'cyan' | 'mint'
}

export default function ObservationPreview({ questionText, selectedScore, accentColor }: Props) {
  const borderAccent = accentColor === 'cyan'
    ? 'border-l-cyan-primary'
    : 'border-l-mint-green'

  return (
    <div
      className={`mt-6 border-l-4 ${borderAccent} bg-slate-50/60 rounded-r-lg p-4 sm:p-5`}
      role="presentation"
      aria-label={`Example observation question with a score of ${selectedScore} out of 5, meaning ${SCORE_LABELS[selectedScore]}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-gray/50 mb-3">
        Example from an Observation
      </p>

      <p className="text-slate-gray text-sm sm:text-base font-medium mb-4 leading-relaxed">
        {questionText}
      </p>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center flex-shrink-0">
          <ThumbsUp className="w-3 h-3 text-white" />
        </div>

        <div className="flex gap-1 flex-1 max-w-md">
          {[1, 2, 3, 4, 5].map((n) => {
            const isSelected = n === selectedScore
            const style = isSelected ? FILLED_SHADES[n] : MUTED_OUTLINES[n]
            return (
              <div
                key={n}
                className={`flex-1 border-2 rounded-md py-1.5 sm:py-2 flex flex-col items-center justify-center transition-all ${style} ${
                  isSelected ? 'shadow-sm scale-[1.03]' : ''
                }`}
              >
                <span className={`text-sm sm:text-base font-bold leading-none ${isSelected ? '' : 'opacity-50'}`}>
                  {n}
                </span>
                <span
                  className={`text-[7px] sm:text-[9px] font-semibold leading-tight text-center mt-0.5 px-0.5 ${
                    isSelected ? '' : 'opacity-40'
                  }`}
                >
                  {SCORE_LABELS[n]}
                </span>
              </div>
            )
          })}
        </div>

        <div className="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center flex-shrink-0">
          <ThumbsDown className="w-3 h-3 text-white" />
        </div>
      </div>

      <p className="mt-3 text-xs sm:text-sm text-slate-gray/60 italic">
        A score of {selectedScore} means "{SCORE_LABELS[selectedScore]}"
        {selectedScore === 2 && ' \u2014 they can manage on their own, but it takes extra time or effort'}
      </p>
    </div>
  )
}
