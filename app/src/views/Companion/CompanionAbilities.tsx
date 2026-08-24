import type { Ability, CompanionSheet } from '@character-forge/schema/types.ts'
import { ABILITY_COLOR, ABILITY_SOFT } from '../../components/chips/colorMaps'
import type { CSSVarStyle } from '../../components/chips/css-vars'
import { ABILITY_ORDER, signed } from '../MainSheet/format'
import { CheckRow } from '../MainSheet/CheckRow'

function abilityStyle(ability: Ability): CSSVarStyle {
  return { '--chip-fg': ABILITY_COLOR[ability], '--chip-bg': ABILITY_SOFT[ability] }
}

/** The six ability scores, ability-colored — same rail styling as the main sheet (T08). */
export function CompanionAbilityRail({ companion }: { companion: CompanionSheet }) {
  return (
    <section className="abilities" aria-label={`${companion.name} ability scores`}>
      {ABILITY_ORDER.map((ability) => {
        const score = companion.abilities[ability]
        return (
          <div key={ability} className="ability" style={abilityStyle(ability)}>
            <span className="ability__abbr">{ability}</span>
            <span className="ability__mod">{signed(score.modifier)}</span>
            <span className="ability__score">{score.final}</span>
          </div>
        )
      })}
    </section>
  )
}

/** Saving throws, if the companion sheet defines them (Tiresia does; not every companion will). */
export function CompanionSaves({ companion }: { companion: CompanionSheet }) {
  if (!companion.saves || companion.saves.length === 0) return null
  const byAbility = new Map(companion.saves.map((s) => [s.ability, s]))
  return (
    <section className="panel saves" aria-label={`${companion.name} saving throws`}>
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
              rollLabel={`${companion.name} ${ability} save`}
            />
          )
        })}
      </ul>
    </section>
  )
}

/** Skills, if the companion sheet defines them. */
export function CompanionSkills({ companion }: { companion: CompanionSheet }) {
  if (!companion.skills || companion.skills.length === 0) return null
  return (
    <section className="panel skills" aria-label={`${companion.name} skills`}>
      <h2 className="panel__title">Skills</h2>
      <ul className="check-list">
        {companion.skills.map((skill) => (
          <CheckRow
            key={skill.name}
            label={skill.name}
            ability={skill.ability}
            modifier={skill.modifier}
            proficiency={skill.proficiency}
            edge={skill.edge}
            bonusDice={skill.bonusDice}
            note={skill.note}
            rollLabel={`${companion.name} ${skill.name}`}
          />
        ))}
      </ul>
    </section>
  )
}
