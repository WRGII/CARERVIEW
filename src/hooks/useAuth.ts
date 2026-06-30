// src/hooks/useAuth.ts
// Re-exports from the centralized AuthContext.
// All consumers now share a single auth subscription via React Context,
// eliminating redundant useState/useEffect instances that caused
// React Error #310 ("Rendered more hooks than during the previous render").
export { useAuth } from '../context/AuthContext'
export type { Profile } from '../context/AuthContext'
