import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/**
 * Inspect mode (T27 D44) — modeled directly on monster-forge's Rule Finder
 * (`engine.js` `#ruleFinderBtn`: a dedicated top-right toggle, a `body`-level
 * mode class, rolls suppressed while active, Escape exits). While active,
 * tapping a stat/check row shows its breakdown instead of rolling it — full
 * scope: ability scores, AC, HP, saves, skills, tools.
 */
export interface InspectModeContextValue {
  active: boolean
  toggle: () => void
  exit: () => void
}

const InspectModeContext = createContext<InspectModeContextValue | null>(null)

export function useInspectMode(): InspectModeContextValue {
  const ctx = useContext(InspectModeContext)
  if (!ctx) throw new Error('useInspectMode must be used within an InspectModeProvider')
  return ctx
}

export function InspectModeProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('inspect-mode', active)
    if (!active) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [active])

  const toggle = useCallback(() => setActive((a) => !a), [])
  const exit = useCallback(() => setActive(false), [])

  const value = useMemo<InspectModeContextValue>(
    () => ({ active, toggle, exit }),
    [active, toggle, exit],
  )

  return <InspectModeContext.Provider value={value}>{children}</InspectModeContext.Provider>
}
