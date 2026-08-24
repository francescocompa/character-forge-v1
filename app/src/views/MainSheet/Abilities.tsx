import type { Ability } from '@character-forge/schema/types.ts'
import { ABILITY_COLOR, ABILITY_SOFT } from '../../components/chips/colorMaps'
import type { CSSVarStyle } from '../../components/chips/css-vars'
import { MarkupText } from '../../library'
import { useCharacter } from '../../character/CharacterProvider'
import { rollCheck, rollableProps } from '../../dice'
import { ABILITY_ORDER, signed } from './format'
import { CheckRow } from './CheckRow'

function abilityStyle(ability: Ability): CSSVarStyle {
  return { '--chip-fg': ABILITY_COLOR[ability], '--chip-bg': ABILITY_SOFT[ability] }
}

/** The six ability scores: big modifier + score, ability-colored, optional provenance note. */
export function AbilityRail() {
  const { character } = useCharacter()
  return (
    <section className="abilities" aria-label="Ability scores">
      {ABILITY_ORDER.map((ability) => {
        const score = character.abilities[ability]
        return (
          <div
            key={ability}
            style={abilityStyle(ability)}
            {...rollableProps(
              (mode) => rollCheck(`${ability} check`, score.modifier, { mode, isAttack: false }),
              { className: 'ability', label: `Roll ${ability} check` },
            )}
          >
            <span className="ability__abbr">{ability}</span>
            <span className="ability__mod">{signed(score.modifier)}</span>
            <span className="ability__score">{score.final}</span>
            {score.note && (
              <span className="ability__note">
                <MarkupText source={score.note} />
              </span>
            )}
          </div>
        )
      })}
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
  const { skills, passives, proficiencies } = character.stats
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
          <div className="tool-chips">
            {tools.map((tool) => (
              <span key={tool} className="tool-chip">
                {tool}
              </span>
            ))}
          </div>
        </>
      )}
      {passives && (
        <ul className="passives">
          {passives.perception !== undefined && (
            <li>
              <span className="passives__label">Passive perception</span>
              <span className="passives__value">{passives.perception}</span>
            </li>
          )}
          {passives.investigation !== undefined && (
            <li>
              <span className="passives__label">Passive investigation</span>
              <span className="passives__value">{passives.investigation}</span>
            </li>
          )}
          {passives.insight !== undefined && (
            <li>
              <span className="passives__label">Passive insight</span>
              <span className="passives__value">{passives.insight}</span>
            </li>
          )}
        </ul>
      )}
    </section>
  )
}
