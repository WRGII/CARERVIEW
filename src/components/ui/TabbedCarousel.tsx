import React, { useState, useId } from 'react'
import { cn } from '../../lib/utils'

interface Slide {
  id: string
  label: string
  content: React.ReactNode
}

interface TabbedCarouselProps {
  slides: Slide[]
  ariaLabel: string
  className?: string
}

export const TabbedCarousel: React.FC<TabbedCarouselProps> = ({
  slides,
  ariaLabel,
  className,
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const baseId = useId()

  if (slides.length === 0) return null

  const focusTab = (i: number) => {
    document.getElementById(`${baseId}-tab-${i}`)?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = (i + 1) % slides.length
      setActiveIndex(next)
      focusTab(next)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = (i - 1 + slides.length) % slides.length
      setActiveIndex(prev)
      focusTab(prev)
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(0)
      focusTab(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveIndex(slides.length - 1)
      focusTab(slides.length - 1)
    }
  }

  return (
    <div role="region" aria-label={ariaLabel} className={cn('w-full', className)}>
      <div role="tablist" aria-label={ariaLabel} className="flex gap-1 mb-4">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            id={`${baseId}-tab-${i}`}
            aria-selected={i === activeIndex}
            aria-controls={`${baseId}-panel-${i}`}
            tabIndex={i === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={cn(
              'px-4 py-2 rounded-t-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-primary',
              i === activeIndex
                ? 'bg-white border border-b-0 border-slate-200 text-cyan-primary'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {slide.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${activeIndex}`}
        aria-labelledby={`${baseId}-tab-${activeIndex}`}
        tabIndex={0}
        className="bg-white border border-slate-200 rounded-b-lg rounded-tr-lg p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-primary"
      >
        {slides[activeIndex].content}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing slide {activeIndex + 1} of {slides.length}
      </p>
    </div>
  )
}

export default TabbedCarousel
