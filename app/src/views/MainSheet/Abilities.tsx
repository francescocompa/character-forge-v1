import type { KeyboardEvent } from 'react'
import type { Ability, AbilityScore } from '@character-forge/schema/types.ts'
import { ABILITY_COLOR, ABILITY_SOFT } from '../../components/chips/colorMaps'
import type { CSSVarStyle } from '../../components/chips/css-vars'
import { MarkupText } from '../../library'
import { useCharacter } from '../../character/CharacterProvider'
import { useInspectMode } from '../../app/InspectModeProvider'
import { useInspectPopover, InspectPopoverPanel } from '../../components/InspectPopover'
import { rollCheck, rollableProps } from '../../dice'
import { ABILITY_ORDER, signed } from './format'
import { CheckRow, ToolRow } from './CheckRow'

function abilityStyle(ability: Ability): CSSVarStyle {
  return { '--chip-fg': ABILITY_COLOR[ability], '--chip-bg': ABILITY_SOFT[ability] }
}

/** One ability score tile. Rolls on click normally; in inspect mode (T27
 *  D44) it shows a breakdown (base/final/modifier + provenance note) instead
 *  — the note used to render inline always, which is exactly the clutter
 *  D44 moves behind the inspect toggle (see character-forge-sheet-notes). */
function AbilityTile({ ability, score }: { ability: Ability; score: AbilityScore }) {
  const { active: inspecting } = useInspectMode()
  const { open, setOpen, ref } = useInspectPopover<HTMLDivElement>()

  const mainProps = inspecting
    ? {
        className: 'ability',
        role: 'button' as const,
        tabIndex: 0,
        'aria-label': `Inspect ${ability}`,
        onClick: () => setOpen((o) => !o),
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((o) => !o)
          }
        },
      }
    : rollableProps(
        (mode) => rollCheck(`${ability} check`, score.modifier, { mode, isAttack: false }),
        {
          className: 'ability',
          label: `Roll ${ability} check`,
        },
      )

  return (
    <div key={ability} style={abilityStyle(ability)} ref={ref} className="ability-tile">
      <div {...mainProps}>
        <span className="ability__abbr">{ability}</span>
        <span className="ability__mod">{signed(score.modifier)}</span>
        <span className="ability__score">{score.final}</span>
      </div>
      {inspecting && open && (
        <InspectPopoverPanel label={`${ability} breakdown`}>
          <div className="inspect-popover__row">
            <span className="field-label">Base</span>
            <span>{score.base}</span>
          </div>
          <div className="inspect-popover__row">
            <span className="field-label">Final</span>
            <span>{score.final}</span>
          </div>
          <div className="inspect-popover__row">
            <span className="field-label">Modifier</span>
            <span className="inspect-popover__total">{signed(score.modifier)}</span>
          </div>
          {score.note && (
            <div className="inspect-popover__note">
              <MarkupText source={score.note} />
            </div>
          )}
        </InspectPopoverPanel>
      )}
    </div>
  )
}

/** The six ability scores: big modifier + score, ability-colored. */
export function AbilityRail() {
  const { character } = useCharacter()
  return (
    <section className="abilities" aria-label="Ability scores">
      {ABILITY_ORDER.map((ability) => (
        <AbilityTile key={ability} ability={ability} score={character.abilities[ability]} />
      ))}
    </section>
  )
}

export const PROF_LABEL: Record<string, string> = {
  none: 'Not proficient',
  half: 'Half proficiency',
  proficient: 'Proficient',
  expertise: 'Expertise',
}

/** Proficiency/expertise marker dot, shared with the Companion view (T12). */
export function ProficiencyDot({ level }: { level: keyof typeof PROF_LABEL }) {
  return (
    <span className={`prof-dot prof-dot--${level}`} role="img" aria-label={PROF_LABEL[level]} />
  )
}

/** Saving throws (T26): its own compact list next to the ability rail, same row
 *  anatomy as Skills — moved out of the ability cards (D19-adjacent decision,
 *  T26) once a save with an edge badge + note turned out too tight to fit
 *  inside the small card. */
export function SavesBlock() {
  const { character } = useCharacter()
  // Present saves in canonical ability order regardless of file order.
  const byAbility = new Map(character.stats.saves.map((s) => [s.ability, s]))
  return (
    <section className="panel saves" aria-label="Saving throws">
      <h2 className="panel__title">Saves</h2>
      <ul className="check-list">
        {ABILITY_ORDER.map((ability) => {
          const save = byAbility.get(ability)
          if (!save) return null
          return (
            <CheckRow
              key={ability}
              label={ability}
              ability={ability}
              modifier={save.modifier}
              proficiency={save.proficient ? 'proficient' : 'none'}
              edge={save.edge}
              bonusDice={save.bonusDice}
              note={save.note}
              rollLabel={`${ability} save`}
            />
          )
        })}
      </ul>
    </section>
  )
}

/** Skills (T26): uniform rows — ability-tinted name chip (monster-forge's
 *  cc-skill/cc-ab convention), optional edge badge + bonus dice, modifier
 *  right-aligned, note collapsed behind the chip's own chevron. Tools with
 *  proficiency follow as plain chips (no fixed ability/modifier in the
 *  schema — a DM picks the ability contextually, same as monster-forge). */
export function SkillsBlock() {
  const { character } = useCharacter()
  const { skills, proficiencies, proficiencyBonus } = character.stats
  const tools = proficiencies?.tools ?? []
  return (
    <section className="panel skills" aria-label="Skills">
      <h2 className="panel__title">Skills</h2>
      <ul className="check-list">
        {skills.map((skill) => (
          <CheckRow
            key={skill.name}
            label={skill.name}
            ability={skill.ability}
            modifier={skill.modifier}
            proficiency={skill.proficiency}
            edge={skill.edge}
            bonusDice={skill.bonusDice}
            note={skill.note}
            rollLabel={skill.name}
          />
        ))}
      </ul>
      {tools.length > 0 && (
        <>
          <hr className="section-div" />
          <span className="field-label">Tools</span>
          <ul className="check-list">
            {tools.map((tool) => (
              <ToolRow
                key={tool.name}
                name={tool.name}
                proficiencyBonus={proficiencyBonus}
                edge={tool.edge}
                bonusDice={tool.bonusDice}
                note={tool.note}
              />
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
