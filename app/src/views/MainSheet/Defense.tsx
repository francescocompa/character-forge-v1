import type { ReactNode } from 'react'
import type { StatValue } from '@character-forge/schema/types.ts'
import { ABILITY_COLOR } from '../../components/chips/colorMaps'
import type { CSSVarStyle } from '../../components/chips/css-vars'
import { MarkupText } from '../../library'
import { useCharacter } from '../../character/CharacterProvider'
import { useSession, useSessionState } from '../../session/SessionProvider'
import { useInspectMode } from '../../app/InspectModeProvider'
import { useInspectPopover, InspectPopoverPanel } from '../../components/InspectPopover'
import { rollCheck, rollableProps } from '../../dice'
import { NumberStepper, TickBoxes } from './Ticks'
import { signed } from './format'

/** Render a compiled stat value verbatim (numbers signed only when asked). */
function statText(stat: StatValue, sign = false): string {
  if (typeof stat.value === 'number') return sign ? signed(stat.value) : String(stat.value)
  return stat.value
}

/**
 * Wraps a field so that in inspect mode (T27 D44) it becomes a click target
 * for a breakdown popover instead of whatever it'd otherwise do (nothing, for
 * AC/HP's label — they aren't rollable). Outside inspect mode it renders
 * `children` completely inert, so it never intrudes on normal play.
 */
function InspectTrigger({
  label,
  className,
  children,
  panel,
}: {
  label: string
  className?: string
  children: ReactNode
  panel: ReactNode
}) {
  const { active: inspecting } = useInspectMode()
  const { open, setOpen, ref } = useInspectPopover<HTMLDivElement>()
  if (!inspecting) return <div className={className}>{children}</div>
  return (
    <div
      className={`${className ?? ''} inspectable`}
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`Inspect ${label}`}
      onClick={() => setOpen((o) => !o)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setOpen((o) => !o)
        }
      }}
    >
      {children}
      {open && <InspectPopoverPanel label={`${label} breakdown`}>{panel}</InspectPopoverPanel>}
    </div>
  )
}

function inspectNotePanel(note: StatValue['note']): ReactNode {
  return note ? (
    <div className="inspect-popover__note">
      <MarkupText source={note} />
    </div>
  ) : (
    <div className="inspect-popover__note">No additional detail.</div>
  )
}

/**
 * MaxHP override (T03 review item F2): the compiled `stats.maxHp` may be an
 * average/standard value, but Francesco often rolls it (Vice's 26). The
 * session layer lets the player record that rolled/hand-edited total without
 * touching the character file; when set, it — not the compiled value — is
 * what "HP to max" restores on a long rest.
 */
function MaxHpOverrideControl({ compiled }: { compiled: number | undefined }) {
  const store = useSession()
  const { trackers } = useSessionState()
  const override = trackers.maxHpOverride
  if (compiled === undefined) return null
  return (
    <label className="hp-max-override">
      <input
        type="checkbox"
        checked={override !== undefined}
        onChange={(e) => store.setMaxHpOverride(e.target.checked ? compiled : undefined)}
      />
      Rolled/edited max
      {override !== undefined && (
        <input
          type="number"
          className="hp-max-override__input"
          value={override}
          min={1}
          aria-label="Override max HP"
          onChange={(e) => {
            const n = Number(e.target.value)
            if (Number.isFinite(n) && n >= 1) store.setMaxHpOverride(Math.round(n))
          }}
        />
      )}
      {override !== undefined && (
        <span className="hp-max-override__compiled">compiled: {compiled}</span>
      )}
    </label>
  )
}

/** HP with interactive current/temp, plus death saves. */
function HpBlock() {
  const { character } = useCharacter()
  const store = useSession()
  const { trackers } = useSessionState()
  const maxHp = character.stats.maxHp
  const maxNumeric = typeof maxHp.value === 'number' ? maxHp.value : undefined
  const override = trackers.maxHpOverride
  const effectiveMax = override ?? maxNumeric
  const current = trackers.hp?.current ?? 0
  const temp = trackers.hp?.temp ?? 0
  const successes = trackers.deathSaves?.successes ?? 0
  const failures = trackers.deathSaves?.failures ?? 0

  return (
    <div className="hp-block">
      <div className="hp-block__main">
        <div className="hp-current">
          <InspectTrigger label="Hit points" panel={inspectNotePanel(maxHp.note)}>
            <span className="field-label">Hit points</span>
          </InspectTrigger>
          <div className="hp-current__row">
            <NumberStepper
              value={current}
              label="Current hit points"
              onChange={(v) => store.setCurrentHp(v, { owner: 'character' })}
              min={0}
              max={effectiveMax}
            />
            <span className="hp-current__max">/ {override ?? statText(maxHp)}</span>
          </div>
          <MaxHpOverrideControl compiled={maxNumeric} />
        </div>
        <div className="hp-temp">
          <span className="field-label">Temp HP</span>
          <NumberStepper
            value={temp}
            label="Temporary hit points"
            onChange={(v) => store.setTempHp(v, { owner: 'character' })}
            min={0}
          />
        </div>
      </div>
      {/* monster-forge death-save pattern (.hpm-ds): successes (green) left
          of the centred label, failures (red) right; circular pips whose
          border color states each group's meaning before any are filled. */}
      <div className="death-saves">
        <div className="death-saves__grp death-saves__grp--success">
          <TickBoxes
            total={3}
            used={successes}
            tone="remaining"
            label="Death save successes"
            onSet={(t) => store.setDeathSaves(t, failures)}
          />
        </div>
        <span className="death-saves__lbl">Death saves</span>
        <div className="death-saves__grp death-saves__grp--fail">
          <TickBoxes
            total={3}
            used={failures}
            label="Death save failures"
            onSet={(t) => store.setDeathSaves(successes, t)}
          />
        </div>
      </div>
    </div>
  )
}

/** Hit dice per class (Shigen §2.8: 1×d10, 5×d8 tracked separately). */
function HitDiceBlock() {
  const { character, nameOf } = useCharacter()
  const store = useSession()
  const { trackers } = useSessionState()
  const groups = character.stats.hitDice ?? []
  if (groups.length === 0) return null
  return (
    <div className="hit-dice">
      <span className="field-label">Hit dice</span>
      {groups.map((group) => {
        const spent = trackers.hitDice?.[group.classRef]?.spent ?? 0
        const setTo = (target: number) => {
          let cur = spent
          while (cur < target) {
            store.spendHitDie(group.classRef)
            cur++
          }
          while (cur > target) {
            store.regainHitDie(group.classRef)
            cur--
          }
        }
        return (
          <div key={group.classRef} className="hit-dice__group">
            <span className="hit-dice__die">
              {group.count}
              {group.die}
            </span>
            <span className="hit-dice__class">{nameOf(group.classRef)}</span>
            <TickBoxes
              total={group.count}
              used={spent}
              label={`${nameOf(group.classRef)} hit dice`}
              onSet={setTo}
            />
          </div>
        )
      })}
    </div>
  )
}

/**
 * Save DC + spell attack, from the (near-always shared) first casting source
 * (T28 D55) — the same shared `.stat`-tile treatment T27 D43 built for the
 * Spells tab (`CastingHeaders`), tiles only, no "N sources" list (that stays
 * a Spells-tab-only feature, one tap away). The Atk tile rolls, matching the
 * existing `rollCheck`/`rollableProps` convention.
 */
function SpellcastingSummary() {
  const { character } = useCharacter()
  const sources = character.spellcasting?.sources ?? []
  if (sources.length === 0) return null
  const shared = sources[0]
  return (
    <div className="cast-summary">
      <span className="field-label">Spellcasting</span>
      <div className="stat-row">
        <div className="stat" style={{ '--chip-fg': ABILITY_COLOR[shared.ability] } as CSSVarStyle}>
          <span className="field-label">Ability</span>
          <span className="stat__value cast-stats__ability">{shared.ability}</span>
        </div>
        <div className="stat">
          <span className="field-label">Save DC</span>
          <span className="stat__value">{shared.saveDc}</span>
        </div>
        <div
          {...rollableProps(
            (mode) =>
              rollCheck(`${shared.name} attack`, shared.attackMod, { mode, isAttack: true }),
            { className: 'stat', label: `Roll ${shared.name} attack` },
          )}
        >
          <span className="field-label">Attack</span>
          <span className="stat__value">{signed(shared.attackMod)}</span>
        </div>
      </div>
    </div>
  )
}

/** Defense & tempo: AC, initiative, speeds, PB, HP + death saves, hit dice, spell DCs. */
export function DefenseBlock() {
  const { character } = useCharacter()
  const { stats } = character
  return (
    <section className="panel defense" aria-label="Defense and tempo">
      <div className="stat-row">
        <InspectTrigger label="AC" className="stat" panel={inspectNotePanel(stats.ac.note)}>
          <span className="field-label">AC</span>
          <span className="stat__value">{statText(stats.ac)}</span>
        </InspectTrigger>
        {typeof stats.initiative.value === 'number' ? (
          <div
            {...rollableProps(
              (mode) =>
                rollCheck('Initiative', stats.initiative.value as number, {
                  mode,
                  isAttack: false,
                }),
              { className: 'stat', label: 'Roll initiative' },
            )}
          >
            <span className="field-label">Initiative</span>
            <span className="stat__value">{statText(stats.initiative, true)}</span>
          </div>
        ) : (
          <div className="stat">
            <span className="field-label">Initiative</span>
            <span className="stat__value">{statText(stats.initiative, true)}</span>
          </div>
        )}
        <div className="stat">
          <span className="field-label">Prof. bonus</span>
          <span className="stat__value">{signed(stats.proficiencyBonus)}</span>
        </div>
        <div className="stat stat--speeds">
          <span className="field-label">Speed</span>
          <span className="stat__value">
            {stats.speeds.map((s, i) => (
              <span key={`${s.type}-${i}`} className="speed">
                {s.value} ft{s.type !== 'walk' && <span className="speed__type"> {s.type}</span>}
              </span>
            ))}
          </span>
        </div>
      </div>
      <HpBlock />
      <HitDiceBlock />
      <SpellcastingSummary />
    </section>
  )
}
