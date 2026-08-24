import { useState } from 'react'
import type { Ability, EdgeState, Markup } from '@character-forge/schema/types.ts'
import { ABILITY_COLOR, ABILITY_SOFT } from '../../components/chips/colorMaps'
import type { CSSVarStyle } from '../../components/chips/css-vars'
import { MarkupText } from '../../library'
import { rollCheck, rollableProps } from '../../dice'
import type { RollMode } from '../../dice'
import { ProficiencyDot, type PROF_LABEL } from './Abilities'
import { signed } from './format'

/** Monster-forge's literal roll-log badge (`rl-advlbl`) — bordered text, not an
 *  icon. A distinct component from `AdvBadge`/`DisBadge` (chips/), which stay
 *  icon-based for inline prose (`{adv}`/`{dis}` markup tokens) — this is a new
 *  row-level context Francesco asked to match monster-forge's source exactly. */
function EdgeBadge({ edge }: { edge: EdgeState }) {
  const isAdv = edge.startsWith('adv')
  return (
    <span className={`edge-badge ${isAdv ? 'edge-badge--adv' : 'edge-badge--dis'}`}>
      {isAdv ? 'ADV' : 'DIS'}
    </span>
  )
}

/** Extra dice on top of the modifier — always shown, never folded into one number. */
function BonusDicePill({ dice }: { dice: string }) {
  return <span className="bonus-dice-pill">+{dice}</span>
}

/** Ability-tinted name chip; becomes a toggle button (chevron inside) when a note exists. */
function CheckChip({
  label,
  ability,
  hasNote,
  expanded,
  onToggle,
}: {
  label: string
  ability: Ability
  hasNote: boolean
  expanded: boolean
  onToggle: () => void
}) {
  const style: CSSVarStyle = {
    '--chip-fg': ABILITY_COLOR[ability],
    '--chip-bg': ABILITY_SOFT[ability],
  }
  if (!hasNote) {
    return (
      <span className="check-chip" style={style}>
        {label}
      </span>
    )
  }
  return (
    <button
      type="button"
      className="check-chip check-chip--toggle"
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
 *  a note that only appears once the chip is toggled open. */
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
  const hasNote = note !== undefined

  return (
    <li className="check-row">
      <div
        {...rollableProps(
          (mode: RollMode) => rollCheck(rollLabel, modifier, { mode, isAttack: false }),
          {
            className: 'check-row__main',
            label: `Roll ${rollLabel}`,
          },
        )}
      >
        <ProficiencyDot level={proficiency} />
        <CheckChip
          label={label}
          ability={ability}
          hasNote={hasNote}
          expanded={expanded}
          onToggle={() => setExpanded((e) => !e)}
        />
        {edge && <EdgeBadge edge={edge} />}
        {bonusDice && <BonusDicePill dice={bonusDice} />}
        <span className="check-row__mod">{signed(modifier)}</span>
      </div>
      {hasNote && expanded && (
        <div className="check-row__note">
          <MarkupText source={note!} />
        </div>
      )}
    </li>
  )
}
