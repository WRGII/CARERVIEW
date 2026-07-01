// src/lib/subPeriod.ts

/** ISO string without milliseconds jitter */
export function iso(d: Date) {
  const copy = new Date(d.getTime())
  copy.setMilliseconds(0)
  return copy.toISOString()
}

/** Monday 00:00 UTC → +7 days */
export function currentWeekWindowUtc(now = new Date()) {
  const d = new Date(now)
  const day = d.getUTCDay() // 0=Sun ... 6=Sat
  const back = day === 0 ? 6 : day - 1
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0))
  start.setUTCDate(start.getUTCDate() - back)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 7)
  return { start: iso(start), end: iso(end) }
}

/** First day of this month 00:00 UTC → next month 00:00 UTC */
export function currentMonthWindowUtc(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0))
  return { start: iso(start), end: iso(end) }
}

/** 30 days starting at profile.created_at (or now if missing/invalid) */
export function first30dWindowUtc(createdAtIso?: string | null) {
  let start = createdAtIso ? new Date(createdAtIso) : new Date()
  if (isNaN(start.getTime())) start = new Date()
  start.setMilliseconds(0)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 30)
  return { start: start.toISOString(), end: end.toISOString() }
}
