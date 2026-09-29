import { parseMarkup, type MarkupNode } from '@character-forge/schema/markup.ts'
import type { Markup } from '@character-forge/schema/types.ts'
import { AdvBadge, ImmunityIcon } from '../../components/chips'
import { damageColor } from '../../components/chips/colorMaps'
import type { CSSVarStyle } from '../../components/chips/css-vars'
import { MarkupText } from '../../library'
import { useCharacter } from '../../character/CharacterProvider'

/** Collects every occurrence of the named tags anywhere in a parsed markup
 *  tree (including inside bold/italic spans). */
function collectTags(
  nodes: MarkupNode[],
  names: ReadonlySet<string>,
  out: { name: string; args: string[] }[],
): void {
  for (const node of nodes) {
    if (node.type === 'tag' && names.has(node.name)) out.push({ name: node.name, args: node.args })
    if (node.type === 'bold' || node.type === 'italic') collectTags(node.children, names, out)
  }
}

const DAMAGE_TAGS = new Set(['dtype', 'dmg'])

/** One damage-typed chip per `{dtype:}`/`{dmg:}` tag the entry's compiled
 *  markup contains — the colored type name only, no multiplier glyph and no
 *  surrounding prose (T28 D52). An entry with no recognized type tag falls
 *  back to its full markup verbatim in a plain chip, so nothing the compiler
 *  wrote is silently dropped. */
function DamageTypeChips({ item }: { item: Markup }) {
  const { nodes } = parseMarkup(item)
  const tags: { name: string; args: string[] }[] = []
  collectTags(nodes, DAMAGE_TAGS, tags)
  if (tags.length === 0) {
    return (
      <li className="defenses__item defenses__item--plain">
        <MarkupText source={item} />
      </li>
    )
  }
  return (
    <>
      {tags.map((tag, i) => (
        <li
          key={i}
          className="defenses__item"
          style={{ '--chip-fg': damageColor(tag.args[0]) } as CSSVarStyle}
        >
          {tag.args[0]}
        </li>
      ))}
    </>
  )
}

const CONDITION_TAGS = new Set(['cond', 'adv'])

/** A condition chip: the `AdvBadge` when the entry's markup carries `{adv}`
 *  (advantage on saves), `ImmunityIcon` when it doesn't (outright condition
 *  immunity) — detected from the compiled markup's own tags, not guessed
 *  from prose (T28 D52). Falls back to plain markup if no `{cond:}` tag. */
function ConditionAdvItem({ item }: { item: Markup }) {
  const { nodes } = parseMarkup(item)
  const tags: { name: string; args: string[] }[] = []
  collectTags(nodes, CONDITION_TAGS, tags)
  const cond = tags.find((t) => t.name === 'cond')
  if (!cond) {
    return (
      <li className="defenses__item defenses__item--plain">
        <MarkupText source={item} />
      </li>
    )
  }
  const hasAdv = tags.some((t) => t.name === 'adv')
  return (
    <li className="defenses__item defenses__item--cond">
      {hasAdv ? <AdvBadge /> : <ImmunityIcon />}
      {cond.args[0]}
    </li>
  )
}

/** Resistances / immunities / vulnerabilities / condition-advantage, one
 *  line per category (T28 D52) — moved to sit directly under Saves. */
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
      {resistances && resistances.length > 0 && (
        <div className="defenses__group defenses__group--resist">
          <span className="field-label">Resist</span>
          <ul className="defenses__items">
            {resistances.map((item, i) => (
              <DamageTypeChips key={i} item={item} />
            ))}
          </ul>
        </div>
      )}
      {immunities && immunities.length > 0 && (
        <div className="defenses__group defenses__group--immune">
          <span className="field-label">Immune</span>
          <ul className="defenses__items">
            {immunities.map((item, i) => (
              <DamageTypeChips key={i} item={item} />
            ))}
          </ul>
        </div>
      )}
      {vulnerabilities && vulnerabilities.length > 0 && (
        <div className="defenses__group defenses__group--vuln">
          <span className="field-label">Vulnerable</span>
          <ul className="defenses__items">
            {vulnerabilities.map((item, i) => (
              <DamageTypeChips key={i} item={item} />
            ))}
          </ul>
        </div>
      )}
      {conditionAdvantages && conditionAdvantages.length > 0 && (
        <div className="defenses__group defenses__group--cond">
          <span className="field-label">Cond.</span>
          <ul className="defenses__items">
            {conditionAdvantages.map((item, i) => (
              <ConditionAdvItem key={i} item={item} />
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

/** Senses (T27 D40; passives moved out to `Passives.tsx` under Tools, T28
 *  D51): darkvision etc. */
export function SensesBlock() {
  const { character } = useCharacter()
  const { senses } = character.stats
  if (!senses?.length) return null
  return (
    <section className="panel senses" aria-label="Senses">
      <h2 className="panel__title">Senses</h2>
      <div className="senses__group">
        <ul className="senses__items">
          {senses.map((s, i) => (
            <li key={i}>
              <MarkupText source={s} />
            </li>
          ))}
        </ul>
      </div>
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
