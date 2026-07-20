import React from 'react'
import { cn } from '../../lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginatedListProps<T> {
  items: T[]
  pageSize: number
  renderItem: (item: T, index: number) => React.ReactNode
  ariaLabel: string
  emptyMessage?: string
  className?: string
}

export function PaginatedList<T>({
  items,
  pageSize,
  renderItem,
  ariaLabel,
  emptyMessage = 'No items found',
  className,
}: PaginatedListProps<T>) {
  const [page, setPage] = React.useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)
  const topRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  const goToPage = (p: number) => {
    setPage(p)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    topRef.current?.focus()
  }

  if (items.length === 0) {
    return (
      <p className="text-center text-slate-500 py-8" role="status">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className={className}>
      <div
        ref={topRef}
        tabIndex={-1}
        role="group"
        aria-label={`${ariaLabel}, page ${currentPage} of ${totalPages}`}
        className="space-y-4 outline-none"
      >
        {pageItems.map((item, i) => renderItem(item, start + i))}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-center gap-2 mt-8"
        >
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-primary"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span>Previous</span>
          </button>

          <span className="text-sm text-slate-600 px-2" aria-current="page">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-primary"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  )
}

export default PaginatedList
