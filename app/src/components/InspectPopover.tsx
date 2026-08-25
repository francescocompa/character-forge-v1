import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Shared open/close + click-outside/Escape wiring for a small anchored
 *  popover (same recipe as `IdentityChip`/`ShellMenu`). Used by every
 *  inspect-mode breakdown trigger (T27 D44) so each call site only owns its
 *  own content, not the interaction plumbing. */
export function useInspectPopover<T extends HTMLElement>() {
  const [open, setOpen] = useState(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return { open, setOpen, ref }
}

/** The breakdown panel surface itself — a `.panel` positioned below its
 *  anchor, same visual recipe as `IdentityChip`'s tooltip. */
export function InspectPopoverPanel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="panel inspect-popover" role="dialog" aria-label={label}>
      {children}
    </div>
  )
}
