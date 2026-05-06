const KEY = 'cv_last_module'

export type LastModule = 'care_plan' | 'memory_book' | 'observations' | null

export function getLastModule(): LastModule {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'care_plan' || v === 'memory_book' || v === 'observations') return v
  } catch {}
  return null
}

export function setLastModule(module: Exclude<LastModule, null>): void {
  try {
    localStorage.setItem(KEY, module)
  } catch {}
}
