import { AbilityRail, SavesBlock, SkillsBlock } from './Abilities'
import { DefenseBlock } from './Defense'
import { DefensesBlock, SensesBlock, ProficienciesBlock } from './Defenses'
import { ResourcesPanel } from './Resources'
import { AttacksPanel } from './Attacks'
import { ActionsSlot } from './ActionsSlot'
import { SessionNotesCard } from '../../session/additions'
import './mainSheet.css'

/**
 * The main sheet (T08): the at-a-glance state of the character, rendered from a
 * compiled `CharacterFile`. Desktop lays the blocks into a multi-column
 * dashboard (abilities rail + central columns); mobile stacks them in
 * at-table-frequency order (HP/resources first). Content visibility follows the
 * global view mode via `CharacterProvider`. No name/identity header of its own
 * (T28 D54) — that moved up into `AppShell`'s topbar; the ability rail is the
 * sheet's first visible content.
 */
export function MainSheet() {
  return (
    <div className="main-sheet">
      <div className="main-sheet__grid">
        <div className="main-sheet__rail">
          {/* Saves next to the ability rail (T26, supersedes D23 #9's
              detail-column placement) — a full save row (edge badge + note
              chevron) turned out too tight to fit inside the small ability
              cards, so it's its own compact list here instead. Defenses sits
              directly under Saves (T28 D52). */}
          <AbilityRail />
          <SavesBlock />
          <DefensesBlock />
        </div>
        <div className="main-sheet__col main-sheet__col--tempo">
          <DefenseBlock />
          <ResourcesPanel />
          <AttacksPanel />
          <ActionsSlot />
        </div>
        <div className="main-sheet__col main-sheet__col--detail">
          <SkillsBlock />
          <SensesBlock />
          <ProficienciesBlock />
          <SessionNotesCard />
        </div>
      </div>
    </div>
  )
}
