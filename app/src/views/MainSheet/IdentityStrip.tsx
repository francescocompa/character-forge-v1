import { useEffect, useRef, useState } from 'react'
import { FutureWrap, RefLink } from '../../components/chips'
import { MarkupText, useLibrary } from '../../library'
import { useCharacter } from '../../character/CharacterProvider'

/** A library term rendered as a tappable popover trigger (name resolved from the library). */
function RefTerm({ refKey, label }: { refKey?: string; label: string }) {
  const { openRef } = useLibrary()
  if (!refKey) return <span>{label}</span>
  return <RefLink label={label} onClick={() => openRef(refKey)} />
}

/**
 * Identity chip (T27 D42): a single square-cornered chip reading
 * "<species> · <class 1> <level> / <class 2> <level>" — replaces the old
 * three stacked rows (name / class badges / species+background). Clicking it
 * opens a small anchored panel (same recipe as `AppShell`'s `ShellMenu`: a
 * `.panel` surface, click-outside/Escape to close) with species, background,
 * each class's subclass + unlock level, and the build-concept summary.
 */
function IdentityChip({ label }: { label: string }) {
  const { character, nameOf, viewMode, isVisible, isFuture } = useCharacter()
  const { chassis, meta } = character
  const classes = [...chassis.classes].sort((a, b) => a.classOrder - b.classOrder)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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

  return (
    <div className="identity-chip" ref={ref}>
      <button
        type="button"
        className="identity-chip__trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </button>
      {open && (
        <div className="panel identity-chip__panel" role="dialog" aria-label="Character summary">
          <div className="identity-chip__row">
            <span className="field-label">Species</span>
            <RefTerm
              refKey={chassis.species.ref}
              label={nameOf(chassis.species.ref, chassis.species.displayName)}
            />
          </div>
          <div className="identity-chip__row">
            <span className="field-label">Background</span>
            <RefTerm
              refKey={chassis.background.ref}
              label={nameOf(chassis.background.ref, chassis.background.displayName)}
            />
          </div>
          {classes.map((cls) => {
            const sub = cls.subclass
            const showSub = sub && isVisible(sub.unlockLevel)
            const subFuture = sub && isFuture(sub.unlockLevel)
            const subName = sub ? nameOf(sub.ref, sub.displayName) : undefined
            return (
              <div className="identity-chip__row" key={cls.ref}>
                <span className="field-label">
                  {nameOf(cls.ref, cls.displayName)} {cls.levels}
                </span>
                {showSub ? (
                  subFuture && viewMode === 'build' ? (
                    <FutureWrap level={sub!.unlockLevel}>
                      <RefTerm refKey={sub!.ref} label={subName!} />
                    </FutureWrap>
                  ) : (
                    <RefTerm refKey={sub!.ref} label={subName!} />
                  )
                ) : (
                  <span className="identity-chip__none">No subclass yet</span>
                )}
              </div>
            )
          })}
          {meta.concept && (
            <div className="identity-chip__concept">
              <MarkupText source={meta.concept} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** Identity strip: name headline + the responsive identity chip (T27 D42). */
export function IdentityStrip() {
  const { character, nameOf } = useCharacter()
  const { chassis, meta } = character
  const classes = [...chassis.classes].sort((a, b) => a.classOrder - b.classOrder)
  const speciesName = nameOf(chassis.species.ref, chassis.species.displayName)
  const classLabel = classes
    .map((cls) => `${nameOf(cls.ref, cls.displayName)} ${cls.levels}`)
    .join(' / ')

  return (
    <header className="identity">
      <div className="identity__name-row">
        <h1 className="identity__name">{meta.name}</h1>
        {meta.variantLabel && <span className="identity__variant">{meta.variantLabel}</span>}
        <IdentityChip label={`${speciesName} · ${classLabel}`} />
      </div>
    </header>
  )
}
