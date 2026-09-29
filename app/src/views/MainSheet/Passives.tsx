import { useEffect, useId, useState } from 'react'
import { ABILITY_COLOR, ABILITY_SOFT } from '../../components/chips/colorMaps'
import type { CSSVarStyle } from '../../components/chips/css-vars'
import { useCharacter } from '../../character/CharacterProvider'
import { useSession, useSessionState } from '../../session/SessionProvider'

function abilityStyle(ability: string): CSSVarStyle {
  const fg = ABILITY_COLOR[ability as keyof typeof ABILITY_COLOR]
  const bg = ABILITY_SOFT[ability as keyof typeof ABILITY_SOFT]
  return { '--chip-fg': fg, '--chip-bg': bg }
}

function PassiveTile({ name, ability, value }: { name: string; ability: string; value: number }) {
  return (
    <div className="passive-tile" style={abilityStyle(ability)}>
      <span className="passive-tile__label">{name}</span>
      <span className="passive-tile__value">{value}</span>
    </div>
  )
}

/** Checkbox-picker modal (T28 D51): all 18 skills, already-pinned ones
 *  pre-checked. Checking pins a passive, unchecking removes it — no
 *  per-tile remove button, one surface manages the whole set. */
function PassivePickerModal({
  pinned,
  onToggle,
  onClose,
}: {
  pinned: string[]
  onToggle: (skillName: string) => void
  onClose: () => void
}) {
  const { character } = useCharacter()
  const titleId = useId()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-surface"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="passive-picker__head">
          <h2 id={titleId} className="panel__title">
            Passives
          </h2>
          <button type="button" className="btn-icon" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>
        <ul className="passive-picker__list">
          {character.stats.skills.map((skill) => (
            <li key={skill.name}>
              <label className="passive-picker__item">
                <input
                  type="checkbox"
                  checked={pinned.includes(skill.name)}
                  onChange={() => onToggle(skill.name)}
                />
                <span className="passive-picker__name">{skill.name}</span>
                <span className="passive-picker__value">{10 + skill.modifier}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="passive-picker__actions">
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Passives (T28 D51): moved from the Senses card to a new label under Tools.
 * Which passives are pinned is session state (like HP/resource ticks — never
 * written to the character file), computed live as `10 + skill.modifier` for
 * any of the 18 skills, not just Perception/Investigation/Insight — so a
 * pinned passive is never stale after a level-up recompiles skills.
 */
export function PassivesBlock() {
  const { character } = useCharacter()
  const store = useSession()
  const { trackers } = useSessionState()
  const [pickerOpen, setPickerOpen] = useState(false)
  const pinned = trackers.pinnedPassives ?? []
  const bySkillName = new Map(character.stats.skills.map((s) => [s.name, s]))

  const toggle = (skillName: string) => {
    const next = pinned.includes(skillName)
      ? pinned.filter((n) => n !== skillName)
      : [...pinned, skillName]
    store.setPinnedPassives(next)
  }

  return (
    <div className="passives-block">
      <span className="field-label">Passives</span>
      <div className="passives-row">
        {pinned.map((name) => {
          const skill = bySkillName.get(name)
          if (!skill) return null
          return (
            <PassiveTile
              key={name}
              name={name}
              ability={skill.ability}
              value={10 + skill.modifier}
            />
          )
        })}
        <button
          type="button"
          className="passive-tile passive-tile--ghost"
          onClick={() => setPickerOpen(true)}
          aria-label="Manage passive scores"
        >
          +
        </button>
      </div>
      {pickerOpen && (
        <PassivePickerModal
          pinned={pinned}
          onToggle={toggle}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}
