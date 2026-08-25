import { useState } from 'react'
import type { Ability, Markup, Stats } from '@character-forge/schema/types.ts'
import { ABILITY_COLOR, ABILITY_SOFT } from '../../components/chips/colorMaps'
import type { CSSVarStyle } from '../../components/chips/css-vars'
import { MarkupText } from '../../library'
import { useCharacter } from '../../character/CharacterProvider'

function ChipList({ title, items, tone }: { title: string; items?: Markup[]; tone: string }) {
  if (!items || items.length === 0) return null
  return (
    <div className={`defenses__group defenses__group--${tone}`}>
      <span className="field-label">{title}</span>
      <ul className="defenses__items">
        {items.map((item, i) => (
          <li key={i} className="defenses__item">
            <MarkupText source={item} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Resistances / immunities / vulnerabilities / condition-advantage chips (markup-rendered). */
export function DefensesBlock() {
  const { character } = useCharacter()
  const { resistances, immunities, vulnerabilities, conditionAdvantages } = character.stats
  const any =
    resistances?.length ||
    immunities?.length ||
    vulnerabilities?.length ||
    conditionAdvantages?.length
  if (!any) return null
  return (
    <section className="panel defenses" aria-label="Resistances and immunities">
      <h2 className="panel__title">Defenses</h2>
      <ChipList title="Resistances" items={resistances} tone="resist" />
      <ChipList title="Immunities" items={immunities} tone="immune" />
      <ChipList title="Vulnerabilities" items={vulnerabilities} tone="vuln" />
      <ChipList title="Condition advantage" items={conditionAdvantages} tone="cond" />
    </section>
  )
}

const PASSIVE_ABILITY: Record<'perception' | 'investigation' | 'insight', Ability> = {
  perception: 'WIS',
  investigation: 'INT',
  insight: 'WIS',
}
const PASSIVE_LABEL: Record<'perception' | 'investigation' | 'insight', string> = {
  perception: 'Perception',
  investigation: 'Investigation',
  insight: 'Insight',
}

function passiveStyle(ability: Ability): CSSVarStyle {
  return { '--chip-fg': ABILITY_COLOR[ability], '--chip-bg': ABILITY_SOFT[ability] }
}

function PassiveTile({
  kind,
  value,
}: {
  kind: 'perception' | 'investigation' | 'insight'
  value: number
}) {
  return (
    <div className="passive-tile" style={passiveStyle(PASSIVE_ABILITY[kind])}>
      <span className="passive-tile__label">{PASSIVE_LABEL[kind]}</span>
      <span className="passive-tile__value">{value}</span>
    </div>
  )
}

/**
 * Passive scores as compact tinted tiles (T27 D40) — Perception shown by
 * default, Investigation/Insight tucked behind a ghost "+" tile so the
 * common case (just Perception) stays dense. No settings round-trip:
 * expand state is local, tap-to-reveal.
 */
function PassivesRow({ passives }: { passives: NonNullable<Stats['passives']> }) {
  const [expanded, setExpanded] = useState(false)
  const extra = (['investigation', 'insight'] as const).filter((k) => passives[k] !== undefined)
  return (
    <div className="passives-row">
      {passives.perception !== undefined && (
        <PassiveTile kind="perception" value={passives.perception} />
      )}
      {expanded && extra.map((k) => <PassiveTile key={k} kind={k} value={passives[k] as number} />)}
      {extra.length > 0 && (
        <button
          type="button"
          className="passive-tile passive-tile--ghost"
          onClick={() => setExpanded((e) => !e)}
          aria-label={
            expanded ? 'Hide additional passive scores' : 'Show additional passive scores'
          }
          aria-expanded={expanded}
        >
          {expanded ? '−' : '+'}
        </button>
      )}
    </div>
  )
}

/** Senses (T27 D40): darkvision etc. + passive score tiles. Split out of the
 *  old combined "Senses & proficiencies" panel — proficiencies moved to
 *  their own card below. */
export function SensesBlock() {
  const { character } = useCharacter()
  const { senses, passives } = character.stats
  const hasPassives =
    passives &&
    (passives.perception !== undefined ||
      passives.investigation !== undefined ||
      passives.insight !== undefined)
  if (!senses?.length && !hasPassives) return null
  return (
    <section className="panel senses" aria-label="Senses">
      <h2 className="panel__title">Senses</h2>
      {senses && senses.length > 0 && (
        <div className="senses__group">
          <span className="field-label">Senses</span>
          <ul className="senses__items">
            {senses.map((s, i) => (
              <li key={i}>
                <MarkupText source={s} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {hasPassives && <PassivesRow passives={passives!} />}
    </section>
  )
}

/**
 * Languages and armor/weapon proficiencies. Tool proficiencies live in the
 * Skills panel instead (T26) — tools get a check, same as skills;
 * armor/weapons don't, so they stay here as a flat reference list.
 */
export function ProficienciesBlock() {
  const { character } = useCharacter()
  const { languages, proficiencies } = character.stats
  const hasProf = proficiencies?.armor?.length || proficiencies?.weapons?.length
  if (!languages?.length && !hasProf) return null
  return (
    <section className="panel senses" aria-label="Proficiencies">
      <h2 className="panel__title">Proficiencies</h2>
      {languages && languages.length > 0 && (
        <div className="senses__group">
          <span className="field-label">Languages</span>
          <span className="senses__value">{languages.join(', ')}</span>
        </div>
      )}
      {proficiencies?.armor && proficiencies.armor.length > 0 && (
        <div className="senses__group">
          <span className="field-label">Armor</span>
          <span className="senses__value">{proficiencies.armor.join(', ')}</span>
        </div>
      )}
      {proficiencies?.weapons && proficiencies.weapons.length > 0 && (
        <div className="senses__group">
          <span className="field-label">Weapons</span>
          <span className="senses__value">{proficiencies.weapons.join(', ')}</span>
        </div>
      )}
    </section>
  )
}
