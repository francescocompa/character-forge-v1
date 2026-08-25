import { useEffect, useRef, useState } from 'react'
import type { Spell, SpellSource } from '@character-forge/schema/types.ts'
import { ABILITY_COLOR } from '../../components/chips/colorMaps'
import type { CSSVarStyle } from '../../components/chips/css-vars'
import { MarkupText } from '../../library'
import { useCharacter } from '../../character/CharacterProvider'
import { signed } from '../MainSheet/format'

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1)
}

/** One casting source in the expanded list: "kind · name" (T27 D43). Clicking
 *  it opens its prepare rule + the spells it grants. Carries its own inline
 *  DC/Atk chip only when it genuinely diverges from the shared header —
 *  neither Vice nor Shigen exercise this today, but the schema allows it
 *  (e.g. an item-granted caster with its own fixed DC). */
function SourceRow({
  source,
  kindLabel,
  sharedAbility,
  sharedDc,
  sharedAtk,
  spells,
}: {
  source: SpellSource
  kindLabel: string
  sharedAbility: string
  sharedDc: number
  sharedAtk: number
  spells: Spell[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLLIElement>(null)
  const diverges =
    source.ability !== sharedAbility || source.saveDc !== sharedDc || source.attackMod !== sharedAtk
  const hasDetail =
    source.prepareRule !== undefined || source.note !== undefined || spells.length > 0

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
    <li className="cast-source-row" ref={ref}>
      <button
        type="button"
        className="cast-source-row__trigger"
        aria-haspopup={hasDetail ? 'true' : undefined}
        aria-expanded={hasDetail ? open : undefined}
        disabled={!hasDetail}
        onClick={() => hasDetail && setOpen((o) => !o)}
      >
        {kindLabel && <span className="field-label">{kindLabel}</span>}
        <span className="cast-source-row__name">{source.name}</span>
        {diverges && (
          <span className="cast-source-row__override">
            DC {source.saveDc} · Atk {signed(source.attackMod)}
          </span>
        )}
      </button>
      {open && hasDetail && (
        <div className="panel cast-source-row__panel" role="dialog" aria-label={source.name}>
          {source.prepareRule && (
            <div className="cast-source-row__rule">
              <MarkupText source={source.prepareRule} />
            </div>
          )}
          {source.note && (
            <div className="cast-source-row__rule">
              <MarkupText source={source.note} />
            </div>
          )}
          {spells.length > 0 && (
            <ul className="cast-source-row__spells">
              {spells.map((sp) => (
                <li key={sp.name}>{sp.displayName ?? sp.name}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}

/**
 * Spellcasting summary (T27 D43): ability/DC/attack as shared `.stat` tiles —
 * rendered once, from the (near-always shared) first source — instead of the
 * old one-header-per-source repetition. A collapsed "N sources" row expands
 * to a `kind · name` list; each row is clickable for its prepare rule + the
 * spells it grants. `SpellSource` carries no `unlockLevel` — a source only
 * exists once its granting class/feat is compiled in, so there's no future
 * state to gray here (unlike slot pools and spells).
 */
export function CastingHeaders() {
  const { character } = useCharacter()
  const sources = character.spellcasting?.sources ?? []
  const spells = character.spellcasting?.spells ?? []
  const [expanded, setExpanded] = useState(false)
  if (sources.length === 0) return null

  const shared = sources[0]

  return (
    <div className="casting-headers">
      <div className="stat-row">
        <div className="stat" style={{ '--chip-fg': ABILITY_COLOR[shared.ability] } as CSSVarStyle}>
          <span className="field-label">Ability</span>
          <span className="stat__value cast-stats__ability">{shared.ability}</span>
        </div>
        <div className="stat">
          <span className="field-label">Save DC</span>
          <span className="stat__value">{shared.saveDc}</span>
        </div>
        <div className="stat">
          <span className="field-label">Attack</span>
          <span className="stat__value">{signed(shared.attackMod)}</span>
        </div>
      </div>

      <button
        type="button"
        className="cast-sources-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
      >
        {sources.length} {sources.length === 1 ? 'source' : 'sources'}
        <span className={`check-chip__chevron ${expanded ? 'is-expanded' : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>

      {expanded && (
        <ul className="cast-sources-list">
          {sources.map((source) => {
            const refKey = source.originRef ?? source.classRef
            const entry = refKey ? character.library[refKey] : undefined
            const kindLabel = entry ? capitalize(entry.type) : ''
            const sourceSpells = spells.filter((sp) => sp.origins.includes(source.id))
            return (
              <SourceRow
                key={source.id}
                source={source}
                kindLabel={kindLabel}
                sharedAbility={shared.ability}
                sharedDc={shared.saveDc}
                sharedAtk={shared.attackMod}
                spells={sourceSpells}
              />
            )
          })}
        </ul>
      )}
    </div>
  )
}
