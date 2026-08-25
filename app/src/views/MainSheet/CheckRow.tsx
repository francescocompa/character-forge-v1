import { useState, type KeyboardEvent } from 'react'
import type { Ability, EdgeState, Markup } from '@character-forge/schema/types.ts'
import { ABILITY_COLOR, ABILITY_SOFT } from '../../components/chips/colorMaps'
import type { CSSVarStyle } from '../../components/chips/css-vars'
import { MarkupText } from '../../library'
import { useCharacter } from '../../character/CharacterProvider'
import { useInspectMode } from '../../app/InspectModeProvider'
import { useInspectPopover, InspectPopoverPanel } from '../../components/InspectPopover'
import { rollCheck, rollableProps } from '../../dice'
import type { RollMode } from '../../dice'
import { ProficiencyDot, PROF_LABEL } from './Abilities'
import { signed } from './format'

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

/** Ability-tinted name chip; becomes a toggle button (chevron inside) when a
 *  note exists and inspect mode isn't active (inspect mode's row-level
 *  breakdown already includes the note, so the chip stays static then). */
function CheckChip({
  label,
  ability,
  neutral,
  hasNote,
  expanded,
  onToggle,
}: {
  label: string
  ability?: Ability
  neutral?: boolean
  hasNote: boolean
  expanded: boolean
  onToggle: () => void
}) {
  const style: CSSVarStyle | undefined = ability
    ? { '--chip-fg': ABILITY_COLOR[ability], '--chip-bg': ABILITY_SOFT[ability] }
    : undefined
  const cls = `check-chip ${neutral ? 'check-chip--neutral' : ''}`
  if (!hasNote) {
    return (
      <span className={cls} style={style}>
        {label}
      </span>
    )
  }
  return (
    <button
      type="button"
      className={`${cls} check-chip--toggle`}
      style={style}
      aria-expanded={expanded}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
    >
      {label}
      <span className={`check-chip__chevron ${expanded ? 'is-expanded' : ''}`} aria-hidden="true">
        ▾
      </span>
    </button>
  )
}

export interface ToolRowProps {
  name: string
  /** Tools are PB-only (T27 D41) — matching monster-forge's own convention;
   *  ability is a DM's contextual call, never baked into a modifier. */
  proficiencyBonus: number
  edge?: EdgeState
  bonusDice?: string
  note?: Markup
}

/** One proficient-tool row — same anatomy as `CheckRow` (proficiency implied
 *  by presence in the list, so no dot; no ability tint since tools are
 *  PB-only) but its own component since it has no `ability`. */
export function ToolRow({ name, proficiencyBonus, edge, bonusDice, note }: ToolRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [armedEdge, setArmedEdge] = useState(false)
  const [armedDice, setArmedDice] = useState(false)
  const { active: inspecting } = useInspectMode()
  const { open: inspectOpen, setOpen: setInspectOpen, ref } = useInspectPopover<HTMLLIElement>()
  const hasNote = note !== undefined
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
    rollCheck(name, proficiencyBonus, {
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
        'aria-label': `Inspect ${name}`,
        onClick: () => setInspectOpen((o) => !o),
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setInspectOpen((o) => !o)
          }
        },
      }
    : rollableProps(runRoll, { className: 'check-row__main', label: `Roll ${name}` })

  return (
    <li className="check-row" ref={ref}>
      <div {...mainProps}>
        {hasNote && !inspecting ? (
          <CheckChip
            label={name}
            neutral
            hasNote
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
          />
        ) : (
          <CheckChip label={name} neutral hasNote={false} expanded={false} onToggle={() => {}} />
        )}
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
        <span className="check-row__mod">{signed(proficiencyBonus)}</span>
      </div>
      {hasNote && expanded && !inspecting && (
        <div className="check-row__note">
          <MarkupText source={note!} />
        </div>
      )}
      {inspecting && inspectOpen && (
        <InspectPopoverPanel label={`${name} breakdown`}>
          <div className="inspect-popover__row">
            <span className="field-label">Proficiency bonus</span>
            <span>{signed(proficiencyBonus)}</span>
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
  const [expanded, setExpanded] = useState(false)
  const [armedEdge, setArmedEdge] = useState(false)
  const [armedDice, setArmedDice] = useState(false)
  const { character } = useCharacter()
  const { active: inspecting } = useInspectMode()
  const { open: inspectOpen, setOpen: setInspectOpen, ref } = useInspectPopover<HTMLLIElement>()
  const hasNote = note !== undefined
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
        <ProficiencyDot level={proficiency} />
        <CheckChip
          label={label}
          ability={ability}
          hasNote={hasNote && !inspecting}
          expanded={expanded}
          onToggle={() => setExpanded((e) => !e)}
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
      {hasNote && expanded && !inspecting && (
        <div className="check-row__note">
          <MarkupText source={note!} />
        </div>
      )}
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
