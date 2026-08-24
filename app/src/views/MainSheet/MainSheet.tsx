import { IdentityStrip } from './IdentityStrip'
import { AbilityRail, SavesBlock, SkillsBlock } from './Abilities'
import { DefenseBlock } from './Defense'
import { DefensesBlock, SensesBlock } from './Defenses'
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
 * global view mode via `CharacterProvider`.
 */
export function MainSheet() {
  return (
    <div className="main-sheet">
      <IdentityStrip />
      <div className="main-sheet__grid">
        <div className="main-sheet__rail">
          <AbilityRail />
        </div>
        <div className="main-sheet__col main-sheet__col--tempo">
          <DefenseBlock />
          <ResourcesPanel />
          <AttacksPanel />
          <ActionsSlot />
        </div>
        <div className="main-sheet__col main-sheet__col--detail">
          {/* Saves + Skills adjacent (D23 #9) — both moved here from the
              narrow rail/tempo split so they read as one related pair,
              matching monster-forge's own ability+save+skill precedent
              without cramming skill names into the rail's 9–12rem width. */}
          <SavesBlock />
          <SkillsBlock />
          <DefensesBlock />
          <SensesBlock />
          <SessionNotesCard />
        </div>
      </div>
    </div>
  )
}
