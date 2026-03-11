export default function CommunityLoadingState({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
          <div className="h-3 bg-slate-100 rounded w-full mb-2" />
          <div className="h-3 bg-slate-100 rounded w-2/3 mb-4" />
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-200" />
              <div className="h-3 bg-slate-200 rounded w-20" />
            </div>
            <div className="h-3 bg-slate-100 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
