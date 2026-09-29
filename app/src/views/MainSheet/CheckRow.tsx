import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import type { Ability, EdgeState, Markup } from '@character-forge/schema/types.ts'
import { ABILITY_COLOR, ABILITY_SOFT } from '../../components/chips/colorMaps'
import type { CSSVarStyle } from '../../components/chips/css-vars'
import { MarkupText } from '../../library'
import { useCharacter } from '../../character/CharacterProvider'
import { useInspectMode } from '../../app/InspectModeProvider'
import { useInspectPopover, InspectPopoverPanel } from '../../components/InspectPopover'
import { rollCheck, rollableProps } from '../../dice'
import type { RollMode } from '../../dice'
import { PROF_LABEL } from './Abilities'
import { signed } from './format'

/** Mirrors `library/LibrarySurface.tsx`'s device-adaptive check (T28 D49):
 *  hover on desktop, tap on touch. */
const MOBILE_QUERY = '(max-width: 767.98px)'
function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const onChange = () => setMobile(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return mobile
}

/** A `{ref:KEY}`/`{ref:KEY|LABEL}` tag anywhere in the note (grammar §3). */
const REF_TAG = /\{ref:([a-z0-9]+(?:-[a-z0-9]+)*)(?:\|((?:[^{}|\\]|\\.)*))?\}/

/** Splits a note into its prose (the ref tag removed — T28 D49 drops the
 *  second nested tappable link) and, if the note names a source feature, a
 *  "via <Feature Name>" byline resolved from the ref's label or the library. */
function splitNoteSource(
  note: Markup,
  nameOf: (ref: string | undefined, displayName?: string) => string,
): { prose?: Markup; viaLabel?: string } {
  const match = REF_TAG.exec(note)
  if (!match) return { prose: note }
  const [full, key, label] = match
  const prose = note.replace(full, '').trim()
  return { prose: prose || undefined, viaLabel: nameOf(key, label) }
}

/** Asterisk-triggered note tooltip (T28 D49) — replaces the old chevron/
 *  inline-expand mechanism. Same anchored-`.panel` recipe as `IdentityChip`. */
function NoteTrigger({ note, label }: { note: Markup; label: string }) {
  const { nameOf } = useCharacter()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const { prose, viaLabel } = splitNoteSource(note, nameOf)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const stop = (e: ReactMouseEvent) => e.stopPropagation()
  const touchProps = {
    onClick: (e: ReactMouseEvent) => {
      stop(e)
      setOpen((o) => !o)
    },
  }
  const hoverProps = {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    onClick: stop,
  }

  return (
    <span className="note-trigger" ref={ref}>
      <button
        type="button"
        className="note-trigger__asterisk"
        aria-label={`${label} note`}
        aria-expanded={open}
        {...(isMobile ? touchProps : hoverProps)}
      >
        *
      </button>
      {open && (
        <div className="panel note-trigger__panel" role="tooltip">
          {prose && <MarkupText source={prose} />}
          {viaLabel && <div className="note-trigger__via">via {viaLabel}</div>}
        </div>
      )}
    </span>
  )
}

/** Only a `-situational` edge is armable (T27 D44) — a plain `adv`/`dis` is
 *  unconditional and already folded into how the build plays, nothing to
 *  opt into per roll. */
function isArmableEdge(edge: EdgeState): boolean {
  return edge.endsWith('-situational')
}

/** Monster-forge's literal roll-log badge (`rl-advlbl`) — bordered text, not an
 *  icon. A distinct component from `AdvBadge`/`DisBadge` (chips/), which stay
 *  icon-based for inline prose (`{adv}`/`{dis}` markup tokens) — this is a new
 *  row-level context Francesco asked to match monster-forge's source exactly.
 *  A `-situational` edge is also an arm/disarm toggle (T27 D44): tapping it
 *  applies it to this row's next roll and keeps applying until tapped off —
 *  `is-armed` fills the badge solid instead of its default bordered-only look
 *  as the visible reminder. */
function EdgeBadge({
  edge,
  armed,
  onToggle,
}: {
  edge: EdgeState
  armed: boolean
  onToggle?: () => void
}) {
  const isAdv = edge.startsWith('adv')
  const tone = isAdv ? 'adv' : 'dis'
  const cls = `edge-badge edge-badge--${tone} ${armed ? 'is-armed' : ''}`
  if (!onToggle) {
    return <span className={cls}>{isAdv ? 'ADV' : 'DIS'}</span>
  }
  return (
    <button
      type="button"
      className={cls}
      aria-pressed={armed}
      aria-label={`${armed ? 'Disarm' : 'Arm'} ${isAdv ? 'advantage' : 'disadvantage'} for the next roll`}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
    >
      {isAdv ? 'ADV' : 'DIS'}
    </button>
  )
}

/** Extra dice on top of the modifier — always shown, never folded into one
 *  number. Also an arm/disarm toggle (T27 D44), same convention as `EdgeBadge`. */
function BonusDicePill({
  dice,
  armed,
  onToggle,
}: {
  dice: string
  armed: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className={`bonus-dice-pill ${armed ? 'is-armed' : ''}`}
      aria-pressed={armed}
      aria-label={`${armed ? 'Disarm' : 'Arm'} +${dice} for the next roll`}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
    >
      +{dice}
    </button>
  )
}

/** Leading dot for the three non-none proficiency states (T28 D48) — half a
 *  hollow ring, proficient a solid dot, expertise a solid dot with a thin
 *  ring around it (scaled down from the old standalone `ProficiencyDot`). */
function ProficiencyLeadDot({ level }: { level: 'half' | 'proficient' | 'expertise' }) {
  return <span className={`check-chip__dot check-chip__dot--${level}`} aria-hidden="true" />
}

/** Ability-tinted name chip (T28 D48/D49). Proficiency is now the chip's own
 *  fill: not-proficient is outline-only, half/proficient/expertise keep the
 *  existing soft-tint look with a small leading dot. A note (when present)
 *  gets its own asterisk tooltip trigger instead of making the whole chip
 *  a toggle. */
function CheckChip({
  label,
  ability,
  neutral,
  proficiency,
  note,
}: {
  label: string
  ability?: Ability
  neutral?: boolean
  proficiency?: keyof typeof PROF_LABEL
  note?: Markup
}) {
  const style: CSSVarStyle | undefined = ability
    ? { '--chip-fg': ABILITY_COLOR[ability], '--chip-bg': ABILITY_SOFT[ability] }
    : undefined
  const profClass = proficiency ? `check-chip--${proficiency}` : ''
  const cls = `check-chip ${neutral ? 'check-chip--neutral' : ''} ${profClass}`.trim()
  return (
    <span className={cls} style={style} title={proficiency ? PROF_LABEL[proficiency] : undefined}>
      {proficiency && proficiency !== 'none' && <ProficiencyLeadDot level={proficiency} />}
      {label}
      {note !== undefined && <NoteTrigger note={note} label={label} />}
    </span>
  )
}

export interface ToolRowProps {
  name: string
  note?: Markup
}

/** One proficient-tool row (T28 D46): a plain capitalized name chip — no PB,
 *  no edge/bonus-dice badges, no roll affordance (supersedes T27 D41).
 *  Proficiency is implied by presence in the list, so no dot; no ability
 *  tint since tools have no fixed ability in the schema. */
export function ToolRow({ name, note }: ToolRowProps) {
  return (
    <li className="check-row">
      <div className="check-row__main check-row__main--static">
        <CheckChip label={name} neutral note={note} />
      </div>
    </li>
  )
}

export interface CheckRowProps {
  /** Ability abbreviation (saves) or skill name. */
  label: string
  ability: Ability
  modifier: number
  proficiency: keyof typeof PROF_LABEL
  edge?: EdgeState
  bonusDice?: string
  note?: Markup
  rollLabel: string
}

/** One save or skill row — shared anatomy (T26): proficiency dot, ability-tinted
 *  name chip, optional edge badge + bonus-dice pill, modifier right-aligned, and
 *  a note that only appears once the chip is toggled open. Edge/bonus-dice badges
 *  double as an arm/disarm toggle (T27 D44) that feeds `rollCheck`; inspect mode
 *  (D44) replaces the roll-on-click with a breakdown popover instead. */
export function CheckRow({
  label,
  ability,
  modifier,
  proficiency,
  edge,
  bonusDice,
  note,
  rollLabel,
}: CheckRowProps) {
  const [armedEdge, setArmedEdge] = useState(false)
  const [armedDice, setArmedDice] = useState(false)
  const { character } = useCharacter()
  const { active: inspecting } = useInspectMode()
  const { open: inspectOpen, setOpen: setInspectOpen, ref } = useInspectPopover<HTMLLIElement>()
  const armableEdge = edge && isArmableEdge(edge)

  const runRoll = (mode: RollMode) => {
    const effectiveMode: RollMode =
      mode !== 'normal'
        ? mode
        : armedEdge && edge
          ? edge.startsWith('adv')
            ? 'adv'
            : 'dis'
          : 'normal'
    rollCheck(rollLabel, modifier, {
      mode: effectiveMode,
      isAttack: false,
      bonusDice: armedDice ? bonusDice : undefined,
    })
  }

  const mainProps = inspecting
    ? {
        className: 'check-row__main',
        role: 'button' as const,
        tabIndex: 0,
        'aria-label': `Inspect ${rollLabel}`,
        onClick: () => setInspectOpen((o) => !o),
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setInspectOpen((o) => !o)
          }
        },
      }
    : rollableProps(runRoll, { className: 'check-row__main', label: `Roll ${rollLabel}` })

  const abilityMod = character.abilities[ability].modifier
  const pb = character.stats.proficiencyBonus
  const profContribution =
    proficiency === 'expertise'
      ? pb * 2
      : proficiency === 'proficient'
        ? pb
        : proficiency === 'half'
          ? Math.floor(pb / 2)
          : 0

  return (
    <li className="check-row" ref={ref}>
      <div {...mainProps}>
        <CheckChip
          label={label}
          ability={ability}
          proficiency={proficiency}
          note={!inspecting ? note : undefined}
        />
        {edge &&
          (armableEdge ? (
            <EdgeBadge edge={edge} armed={armedEdge} onToggle={() => setArmedEdge((a) => !a)} />
          ) : (
            <EdgeBadge edge={edge} armed={false} />
          ))}
        {bonusDice && (
          <BonusDicePill
            dice={bonusDice}
            armed={armedDice}
            onToggle={() => setArmedDice((a) => !a)}
          />
        )}
        <span className="check-row__mod">{signed(modifier)}</span>
      </div>
      {inspecting && inspectOpen && (
        <InspectPopoverPanel label={`${rollLabel} breakdown`}>
          <div className="inspect-popover__row">
            <span className="field-label">{ability} modifier</span>
            <span>{signed(abilityMod)}</span>
          </div>
          <div className="inspect-popover__row">
            <span className="field-label">{PROF_LABEL[proficiency]}</span>
            <span>{profContribution !== 0 ? signed(profContribution) : '—'}</span>
          </div>
          <div className="inspect-popover__row">
            <span className="field-label">Total</span>
            <span className="inspect-popover__total">{signed(modifier)}</span>
          </div>
          {edge && (
            <div className="inspect-popover__row">
              <span className="field-label">Edge</span>
              <span>{edge.startsWith('adv') ? 'Advantage' : 'Disadvantage'}</span>
            </div>
          )}
          {bonusDice && (
            <div className="inspect-popover__row">
              <span className="field-label">Bonus dice</span>
              <span>+{bonusDice}</span>
            </div>
          )}
          {note && (
            <div className="inspect-popover__note">
              <MarkupText source={note} />
            </div>
          )}
        </InspectPopoverPanel>
      )}
    </li>
  )
}
