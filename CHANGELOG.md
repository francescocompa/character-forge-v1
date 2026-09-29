# Changelog

Newest batch first. One entry per task/batch; reference the planning task ids
(T01–T22) where applicable. T01–T16 batches archived 2026-08-24 —
[`docs/ARCHIVE.md`](docs/ARCHIVE.md).

## 2026-08-25 — feat: T28 post-T27 polish (D45–D56)

All twelve items from the T27-review interview built in one session, `verify`
green throughout (220/41/50 tests), screenshot-verified at 1280px and 375px
against a richer sample character (temporary local fixture edits, reverted
before commit — resistances/immunities/vulnerabilities/conditionAdvantages
aren't exercised by the checked-in synthetic fixture).

- **Typography: full-app unsized-text audit (D45).** Grepped every CSS file
  for text-rendering selectors with no explicit `font-size`, cross-referenced
  against BEM-combined sibling classes and ancestor cascades to filter false
  positives (icon-only rules, `:hover`/`.is-active` color-only state
  modifiers, children already sized by an immediate parent), then sized ~35
  genuine gaps explicitly — `.check-row__mod` (confirmed inheriting the 14px
  body base, per D45's own finding) plus row/item name labels app-wide
  (`.attack__name`, `.resource__name`, `.gear-item__name`, `.boon__name`,
  `.cast-source-row__name`, etc. → `--font-size-md`), popover/prose text
  (`.inspect-popover`, `.md-p`, `.mng-dialog__lede`, `.session-note__body`,
  etc. → `--font-size-sm`), and the five view-root wrappers
  (`.main-sheet`/`.features-view`/`.spells-view`/`.equipment-view`/
  `.companion-view`) that relied on bare inheritance instead of declaring
  their own size the way monster-forge's components always do.
- **Tools: drop the bonus entirely (D46).** `ToolRow` (`CheckRow.tsx`)
  retired back to a plain capitalized (`text-transform: capitalize`, since
  compiled tool names are lowercase) name chip — no PB, no bonusDice/edge
  badges, no roll affordance. Supersedes T27 D41's bonusDice/edge display;
  `ToolProficiency` schema stays as-is (rendering-only change).
- **Save/skill row spacing: 36px → 28px (D47).** `.check-row__main`
  `min-height`. ⚑ Same on-device tap-accuracy check T27 D39 already owed,
  still outstanding — not blocking this task's Done.
- **Proficiency indicator redesign (D48).** `ProficiencyDot` removed;
  4-state logic merges into `CheckChip`. Chip fill is now binary:
  not-proficient = outline-only (transparent bg, ability-tinted border);
  half/proficient/expertise = the existing soft-tint fill. A small leading
  dot marks the three non-none states (half = hollow ring, proficient =
  solid, expertise = solid + thin ring, scaled down from the old standalone
  dot).
- **Notes → asterisk tooltip (D49).** `CheckChip`'s chevron/inline-expand
  note replaced by a `NoteTrigger` asterisk (hover on desktop, tap on touch —
  mirrors `library/LibrarySurface.tsx`'s `useIsMobile` pattern) opening a
  `.panel` tooltip anchored the same way as `IdentityChip`. A `{ref:...}` tag
  in the note is stripped from the prose and resolved to a dim "via <Feature
  Name>" byline instead of a second nested tappable link.
- **Hover/click-to-roll convention (D50).** One rule, `.rollable:hover`
  (`dice/dice.css`) — a rounded-square `--surface-panel3` background over the
  existing click target, app-wide via `rollableProps`/`.rollable`. Nested
  arm-toggle badges and the note asterisk carry no `.rollable`/`data-roll` of
  their own, so they already kept a plain cursor with no further change
  needed.
- **Passives: session-state, any skill, checkbox-picker modal (D51).** New
  `Passives.tsx` under Tools (moved out of the Senses card). Pinned passives
  are session state (`trackers.pinnedPassives`, schema + types + engine +
  `setPinnedPassives`), computed live as `10 + skill.modifier` for any of the
  18 skills — never stale after a recompile. Seeded from compiled `passives`
  on first load and on reconcile for pre-T28 sessions; pruned against current
  skill names on every reconcile after that. One picker modal (all 18 skills
  as checkboxes, already-pinned pre-checked) manages the whole set.
- **Defenses redesign + reposition (D52).** `DefensesBlock` rewritten: one
  line per category (Resist/Immune/Vulnerable/Cond.), each entry's compiled
  markup parsed for `{dtype:}`/`{dmg:}` tags and rendered as a colored chip
  (`colorMaps.ts` `damageColor()`) — no multiplier prefix, prose-only entries
  fall back to plain text so nothing the compiler wrote is silently dropped.
  Condition entries parsed for `{cond:}`/`{adv:}`: the existing `AdvBadge`
  when `{adv}` is present, a new `ImmunityIcon` (lucide `ShieldCheck`,
  `components/chips/ImmunityIcon.tsx`) when it's phrased as outright
  immunity. Card moved from the detail column to `main-sheet__rail`, directly
  under Saves.
- **Senses: drop the duplicate label (D53).** `SensesBlock`'s inner
  field-label removed — the panel title already says "Senses."
- **Identity: move to the topbar (D54).** `IdentityChip` (T27 D42) moved out
  of `MainSheet`'s retired `IdentityStrip` header into `AppShell`'s topbar,
  next to the name and "‹ Characters" back button; `variantLabel` badge moved
  with it. `MainSheet`'s first visible content is now the ability rail.
  `.identity-chip*`/`.identity__variant` CSS moved from `mainSheet.css` to
  `appShell.css`; the now-fully-dead `.identity`/`.identity__name-row`/
  `.identity__name` rules deleted, `.identity` dropped from the shared
  `.panel` surface selector in `primitives.css`.
- **Spellcasting on Main tab (D55).** `Defense.tsx`'s `SpellcastingSummary`
  rebuilt on the shared `.stat`/`.stat-row` tiles (T27 D43, same recipe the
  Spells tab's `CastingHeaders` uses) — tiles only, no source list. The Atk
  tile rolls via the existing `rollCheck`/`rollableProps` convention. Dead
  `.cast-summary__list/__row/__name/__stat/__k/__abil` CSS removed.
- **Hover-state consistency: full inventory (D56).** Cross-referenced every
  CSS rule with `cursor: pointer` against existing `:hover` coverage
  (accounting for BEM-combined base classes and `font: inherit` deliberate
  sizing) to find real gaps, then fixed each: `.variant-chip`,
  `.view-toggle__btn`, `.app-tab`, `.bottom-tab`, `.add-kind`,
  `.add-recover__btn`, `.companion-switcher__btn`, `.manage-toggle` (all
  color-lift on the inactive state); `.gear-item__toggle`,
  `.feature-section__header`, `.passive-picker__item` (background/color
  lift); `.mastery-option`/`.manage-option` selectable cards (border lift on
  the unselected state); `.tick` (background tint, chosen over a
  border-color change so it layers safely under the death-save pips' own
  success/fail border colors); `button.edge-badge`/`.bonus-dice-pill` arm
  toggles (color-mix tint keyed off `currentColor`, so it follows whichever
  of `--adv`/`--dis` the badge resolved to).

Verified: fixtures (`synthetic.character.json`,
`synthetic-variant.character.json`) and both real characters
(`vice.character.json`, `shigen.character.json`) pass
`character-forge-validate` with only the pre-existing unreferenced-library
warnings. `git diff` on `fixtures/` is empty — the richer-defenses/`{ref:}`
fixture edits used for D49/D52 screenshot verification were reverted, not
committed.

## 2026-08-25 — style: monster-forge B310 tracking/leading alignment (D57)

Not a planning-task batch — a direct handoff from a monster-forge session
(`docs/HANDOFF-monster-forge-B310.md`, now deleted per its own checklist),
executed and folded into `docs/DESIGN-SYSTEM.md`/`DECISIONS.md` per its
instructions.

- **No tracking anywhere.** `--letter-spacing-chrome`/`--letter-spacing-title`
  (`tokens.css`) both set to `normal`, matching monster-forge's own B310
  rule (its D-053: "any tracking that isn't the default one" reads as an AI
  tell). Tokens kept, not deleted — the follow-up removal is a deliberate
  second step, not bundled here. Two stray non-tokenized literals found and
  resolved alongside: `.edge-badge`'s hardcoded `0.05em` now routes through
  the token; `.ability-chip__value`'s explicit `letter-spacing: normal`
  reset deleted outright (redundant once its parent chip also resolves to
  `normal`).
- **Prose leading matched to 1.5.** Asked directly rather than assumed (the
  handoff flagged this one as not its call) — `--line-height-prose` was
  `1.4` (a deliberate T26 choice); Francesco chose to match monster-forge's
  own newly-standardized `1.5` over keeping the phone-density divergence.
  Five stray literals (four `1.5`, one `1.4` in `library.css`/`manage.css`)
  now route through the token too.
- Checked and found clean: the handoff's "phantom weight" finding
  (monster-forge declared 800/900 with only 400–700 loaded) doesn't apply
  here — character-forge only declares 400/600/700 and loads exactly
  400/500/600/700 via `@fontsource/inter`.
- Verified by direct `grep` (every `letter-spacing` call site outside the
  two token definitions confirmed gone) rather than the handoff's suggested
  resolved-declaration diff tool — appropriate for a change this size per
  `docs/DECISIONS.md` D57, which also names what a larger refactor would
  still need the diff tool for.

`verify` green throughout (220/41/50 tests); screenshot-verified live
(micro-labels read tight/untracked, nothing else visibly moved).

## 2026-08-24 — feat: T27 UX declutter + inspect mode (D38–D44)

All seven items from the T27 interview built in one session, `verify` green
throughout (220/41/50 tests), screenshot-verified at 1280px and 375px.

- **Typography/link audit (D38).** `body { font-size: var(--font-size-md) }`
  (14px, matching monster-forge's base — nothing set this before, so the
  whole rem scale was silently inflated). `.ref-link` → `color: inherit`
  (was hardcoded DEX blue in every container). Two stray hardcoded
  `font-size: 11px/9px` in `mainSheet.css` folded into the scale — 11px maps
  exactly to the existing `--font-size-chrome`; 9px got a new
  `--font-size-xs` token (below chrome, nothing existed there).
- **Check-row density (D39).** `.check-row`'s `border-bottom` removed;
  `.check-row__main`'s `min-height` 44px → 36px. Real on-device tap-accuracy
  check still owed — not verifiable from this session.
- **Passive scores: compact tiles, new Senses card (D40).** `Defenses.tsx`'s
  old combined "Senses & proficiencies" panel split into **Senses**
  (darkvision list + new passive tiles) and **Proficiencies**
  (languages/armor/weapons, unchanged). Passives moved out of `SkillsBlock`
  into a `PassivesRow`: Perception always shown as a small ability-tinted
  tile; a dashed ghost "+"/"−" tile toggles Investigation/Insight inline, no
  settings round-trip.
- **Tools: PB-only, structured type (D41).** New `ToolProficiency` type
  (`schema/types.ts` + `character.schema.json`) — `name`, optional
  `bonusDice`/`edge`/`note`, no ability/modifier field (tools render
  PB-only, matching monster-forge). `proficiencies.tools` changed from
  `string[]` to `ToolProficiency[]` — a breaking schema change, backfilled
  into both repo fixtures, `fixtures/invalid/*`, and all four data-folder
  character files (Vice ×3, Shigen). New shared `ToolRow` (`CheckRow.tsx`)
  gives tools the same check-row anatomy as saves/skills, minus the ability
  tint. **Compile bug fixed alongside**: Shigen's Woodcarver's Tools now
  carries Mark of Making's +1d4 (Artisan's Intuition applies to any
  Artisan's-Tools check, not just the Arcana row it was wrongly limited to).
- **Identity header (D42).** `IdentityStrip.tsx`'s three stacked rows
  replaced by one square-cornered `IdentityChip` reading "`<species> ·
<class 1> <level> / <class 2> <level>`", inline beside the name when width
  allows and wrapping to its own row otherwise (pure flex-wrap, no JS).
  Clicking it opens a small anchored panel (`AppShell`'s `ShellMenu` recipe)
  with species/background, each class's subclass + unlock level, and a new
  `meta.concept` field — one or two sentences, compiler-compressed from the
  chassis doc's Concept section, may be non-English per the project's own
  convention. Backfilled into both repo fixtures, Vice, and Shigen (Vice's
  and Shigen's concept text pulled from their actual chassis docs, Italian,
  compressed per the new `pipeline/compile.md` §6 rule).
- **Spellcasting collapse (D43).** `CastingHeaders.tsx` no longer repeats a
  full header per source — ability/DC/Atk render once as shared `.stat`
  tiles (promoted to `components/primitives.css` so Spells and MainSheet
  use the identical recipe instead of two copies) from the first source.
  Below, a collapsed "N sources" row expands to `kind · name` (kind read
  from the referenced library entry's `type`); a source whose own DC/Atk
  genuinely diverges (the synthetic fixture's own dual-source spell setup
  exercises this — Ember Cartographer's Compass is DC 14 vs Wizard's DC 13)
  gets an inline override chip instead of silently inheriting the shared
  tiles. Clicking a source shows its prepare rule + the spells it grants
  (`spellcasting.spells[]` filtered by `origins[]`).
- **Roll-chip arming + inspect mode (D44) — the largest item.** A
  `-situational` edge badge or `bonusDice` pill is now a real arm/disarm
  toggle (`is-armed` fills it solid) wired into `dice/index.ts`'s
  `rollCheck` (`bonusDice` appends to the roll expression, additive on the
  existing multi-term parser); stays armed until tapped off, independent
  per row. A plain (non-situational) `adv`/`dis` edge stays a static badge —
  nothing conditional to opt into. The existing Shift/Ctrl-click
  adv/dis convention is untouched and takes precedence when used.
  **Inspect mode**: a new top-right toggle (`InspectModeProvider`,
  `AppShell`'s `InspectModeToggle`) modeled on monster-forge's Rule Finder —
  icon swap (`CircleHelp`/`X`), `body.inspect-mode` class, Escape exits.
  Full scope as specified: ability scores, AC, HP, saves, skills, tools —
  each now shows a breakdown popover (composed from real ability/PB/
  proficiency data, plus the compiled `note`) instead of rolling while
  active. This is also where the AC/HP/ability-score provenance notes that
  used to always render inline (`.stat__note`/`.ability__note`) finally
  move to — exactly the clutter fix named in
  `character-forge-sheet-notes` memory.

Affects: `schema/types.ts`, `schema/character.schema.json`, `app/src/app/`
(new `InspectModeProvider.tsx`, `AppShell.tsx`), `app/src/components/`
(new `InspectPopover.tsx`, `primitives.css`), `app/src/dice/index.ts`,
`app/src/views/MainSheet/*`, `app/src/views/Spells/CastingHeaders.tsx`,
`app/src/views/Companion/CompanionDefense.tsx`, `pipeline/compile.md`,
`fixtures/*`, and the data-folder character files.

## 2026-08-24 — T22 step 1: Shigen cold-run pipeline proof; docs-only T27 scoping

**T22 (end-to-end acceptance), step 1** — the multiclass pipeline proof, run
cold following only `pipeline/` docs: interview → `Characters/shigen.chassis.md`
→ compile → `Characters/shigen.character.json` → validate (0 errors, 0
warnings) → imported into the live app via the real drop path and
screenshot-verified at 1280px and 375px. ~40 min interview (incl. decoding
the hand-written source PDF at 300 dpi), ~25 min compile+validate.

- **Found a real bug in the compile recipe itself.** `pipeline/compile.md`
  §5 says to-hit excludes a separable magic bonus; `schema/types.ts`'s
  `ToHit.modifier` is documented as the total _including_ `magicBonus`. The
  two disagree; the schema wins per the recipe's own precedence rule. All
  three of Shigen's weapon attacks were off by 1 until corrected. Doc fix
  still owed — see `docs/DECISIONS.md`.
- **T22's own premise was stale.** The task file names Shigen's "Spellfire
  Spark" and "Mark of Making" feats as homebrew; both are now official 2024
  KB entries (FRHoF p.38, EFA p.40/45), matching the source sheet's
  shorthand line for line. Only Archer Priest (background) is genuinely
  homebrew. The KB was refreshed between T22's authoring (2026-07-04) and
  this run.
- **Independent parity check**: 32 values compared against the source PDF
  directly — 29 match exactly; the 3 that differ are precisely the ones
  confirmed stale (a CHA save/Deception/Performance/spell-attack/DC set that
  predates the sheet's own Potent Dragonmark CHA bump), each confirmed
  individually rather than silently "corrected."
- Full detail, every `FLAG`/`UNCONFIRMED`, and five pipeline-doc friction
  points found along the way: `Characters/shigen.compile-notes.md`.
  `docs/DECISIONS.md` D36–D37 (the 2014-spell-with-no-2024-reprint policy;
  the stale-sheet-value handling rule).

**Docs-only: T27 scoped, not built.** Reviewing the rendered Shigen sheet
surfaced a large UX feedback batch (same pattern as D23→T25/T26). Francesco
chose to pause T22 and scope it properly rather than fold it into T22's
punch list — a 7-topic interview (mockups + AskUserQuestion) produced
`planning/tasks/T27-ux-declutter-and-inspect.md` and `docs/DECISIONS.md`
D38–D44: a monster-forge typography/link audit (root-caused, not guessed —
`body` had no base `font-size`, and `.ref-link` hardcoded DEX's blue for
every ref regardless of target), check-row density, passive scores as
compact tiles in a new Senses card, tools going PB-only like monster-forge,
a collapsed identity header needing a new `meta.concept` schema field,
spellcasting source collapse, and a persistent roll-chip arm system paired
with an inspect mode modeled directly on monster-forge's Rule Finder. No
app code changed for T27 this session — it's the next task, not built yet.

`verify` green throughout (220/41/50 tests); `character-forge-validate`
passes both fixtures.

## 2026-08-24 — feat: T26 check-row redesign, line spacing, macro nav direction

A real back-and-forth design interview (in-chat mockups + AskUserQuestion,
several rounds each) on T25's three leftover items grew into a genuine
redesign of the ability/save/skill area. Full rationale and every rejected
option: `docs/DECISIONS.md` D29–D34.

- **Line spacing.** `--line-height-prose: 1.4` (new token, `tokens.css`) —
  no line-height was set anywhere before, so wrapping prose fell back to the
  browser/Inter default of ~1.2. Applied to the ~15 selectors that render
  wrapping secondary text; single-line labels untouched. Verified live at
  375px against the actual concern — an inline dice/condition chip inside a
  wrapped attack rider, no encroachment.
- **`CheckRow`** (new, `app/src/views/MainSheet/CheckRow.tsx`): the shared
  save/skill row — proficiency dot, ability-tinted name chip (reuses
  `.ability-chip`'s recipe), an optional edge badge (monster-forge's literal
  bordered `ADV`/`DIS` text convention, verified against its actual source)
  and bonus-dice pill, modifier right-aligned, note collapsed behind the
  chip's own chevron. One component, four consumers: `SavesBlock`/
  `SkillsBlock` (main sheet) and `CompanionSaves`/`CompanionSkills`
  (Companion view) — all previously independent implementations.
- **Layout.** Ability cards unchanged (augmenting them with a full save row
  proved too tight, confirmed live). `SavesBlock` moved back into
  `.main-sheet__rail`, next to `AbilityRail` — supersedes T25's D23#9
  adjacency placement. Skills now render all 18 (previously only 2 existed
  in the sample data), plus a proficient-tools chip row below a divider.
- **Schema.** `Save`/`Skill` gained optional `edge?: EdgeState` and
  `bonusDice?: string` (`schema/types.ts` + `character.schema.json`) —
  advantage and bonus dice are circumstantial, never folded into the flat
  modifier number. Both fields backward-compatible; existing files still
  validate.
- **Fixture completeness.** `fixtures/synthetic.character.json` (+ variant)
  now carry all 6 saves and all 18 skills (previously 3 and 2), computed
  from the character's real ability mods + PB, plus worked `edge`/
  `bonusDice` examples. This is the wholly-invented, public-repo-safe
  fixture (not a real character file) — completing it is in-repo scope.
- **Macro nav.** Direction confirmed (a persistent desktop-only character-
  list rail beside the open sheet) but not built — filed to `T26` so the
  direction doesn't need re-litigating later.
- **Backlog, named not built:** a reminders-pinning system (per-row optional
  pins for situational features/spells) and a monster-forge-style inspect/
  breakdown tool (score composition, proficiency source) — both need their
  own design pass first.
- **Tools duplication (D35), fixed post-review.** "Tools" rendered in both
  the new Skills chip row and the existing Senses & Proficiencies flat
  list. Removed from `SensesBlock` — Tools stays exclusively in Skills
  (it has a check-shaped role), Senses & Proficiencies keeps Armor/Weapons
  (never rolled).

`verify` green throughout (220/41/50 tests); `character-forge-validate`
passes both fixtures; screenshot-verified at 1280px and 375px on the main
sheet and the Companion view.

## 2026-08-24 — feat: T25 UX/UI skeleton pass executed (D24–D28)

Everything D23's post-interview audit filed to `T25` is done except the one
item Francesco deferred. Seven commits, `verify` green throughout,
screenshot-verified at 1280px and 375px after each one:

- **Type scale.** `--font-size-lg/xl/2xl/3xl/inline` added to `tokens.css`;
  all 19 rem/em hardcoded call sites (10 files) migrated. The 20th
  (`global.css`'s 16px iOS zoom-prevention fix) is intentionally untouched.
- **Button taxonomy.** `.btn`/`--primary`/`--ghost`/`--danger` + `.btn-icon`
  added to `components/primitives.css`. Manage/Import and Add dialogs'
  near-duplicate button families unified onto it — fixed a real
  radius/size drift (`.add-btn` was `--radius-md` at a larger size than
  `.mng-btn`'s `--radius-pill` for the identical role) and a silent no-op
  (`.add-btn--ghost` had no CSS at all). `.rest-btn`'s stray radius aligned
  to pill (D25).
- **`FieldLabel`.** `.field-label` added to `primitives.css`; 6 independent
  copies of the dim-uppercase micro-label recipe (one genuinely wrong,
  non-uppercase voice) consolidated onto it — sheet stat labels and dialog
  field labels are the same role, D20. Phone legibility re-check done.
- **Shared modal base.** `.modal-overlay`/`.modal-surface`/`--wide` added;
  Manage/Import + Add dialogs (byte-identical CSS in two files) converged
  onto it, and Manage/Import picked up bottom-sheet-on-mobile behavior the
  Add dialog already had. The library's own popover stays a deliberate,
  documented exception — different component role (D26).
- **Icon library + mobile bottom tab bar + rest icons.** `lucide-react`
  added as a real dependency (confirmed bundled via `npm run build`, no CDN
  request). New `.bottom-tab-bar` swaps in for the top tab bar at 768px,
  fixed to the viewport bottom, safe-area-correct (D18/D21).
  `RecoverIcon` redone with `Sun`/`Moon`/`Sunrise`; `DiceStateIcon`
  deliberately left bespoke — no library icon matches its d20+chevron glyph.
- **Saves + Skills adjacent.** `SavesBlock` moved next to `SkillsBlock` in
  `.main-sheet__col--detail` — minimum bar per the task; the full
  combined-table merge (monster-forge's precedent) is a future pass with
  its own mockup, not guessed here (D23 #9).
- **Gear section layout.** Each card split into an identity row
  (name/qty/attuned) and a controls/stats row (toggles left, weight/cost
  right, now consistently aligned across a section) — tokens were already
  correct, this was purely grouping/alignment (D23 #14).
- **Top-bar consolidation.** Francesco picked the overflow-menu shape
  directly; a `ShellMenu` settings dropdown collapses Export session,
  Level/Build, and the variant switcher into one "⚙" — topbar down to one
  row on desktop. A real mobile-overflow bug (panel anchored to the
  trigger instead of the full topbar) was found and fixed during
  verification (D27).
- **D19 acceptance spot-check.** Found and fixed two more `.panel`-recipe
  duplicates beyond the ones already caught: `.identity` and
  `.casting-header`.
- **Scoped, not built:** #3/#8 (Second Wind tappability) is a compile-
  pipeline data gap, not a UI fix (D24). #11 (macro character-list ↔ sheet
  nav) is deferred at Francesco's own request (D28) — not broken enough to
  prioritize right now.

Full rationale, rejected options, and verification notes for every item:
`docs/DECISIONS.md` D24–D28.

## 2026-08-24 — docs + fix: D23, Francesco's own UX audit filed to T25

After the interview batch below, Francesco reviewed the live app himself and
flagged 10 more findings the interview hadn't surfaced (buttons, feature
tappability, block organization, top-bar clutter, macro nav, contrast,
spacing, gear density, type scale). Each verified against the actual
code/live UI before filing — see `docs/DECISIONS.md` D23.

- **Fixed today:** `.variant-chip.is-active` contrast (`app/appShell.css`)
  — was `--ink-primary` (near-white) on `--accent-soft` (light lavender),
  two light colors; now `--ink-on-accent`, the token that already existed
  for exactly this case. A leftover duplicate `:focus-visible` override
  removed from `equipment.css` (dead code once the global rule landed).
- **Filed to `T25`** (data folder): a real button taxonomy (18 controls
  mixing `--radius-pill` with the sm/md/lg/xl scale, no rule for which gets
  which — monster-forge's own unresolved CTA-unification mistake,
  inherited rather than fixed); rest icons redone in the new outline set
  (currently flat-filled SVG, reads as emoji); a feature-tappability gap
  (`ProgressionRow` — needs a UI-vs-compile-pipeline call first, not
  guessed); Saves+Skills moved adjacent (monster-forge's actual statblock
  renderer combines ability/mod/save into one table, skills as one line
  below — verified precedent); top-bar consolidation into a settings
  affordance; the macro character-list↔sheet nav layer; a real layout pass
  on Equipment/gear; the type scale extended past chrome/sm/md (20
  hardcoded `font-size` values today) and migrated.
- `verify` green; contrast fix screenshot-verified live.

## 2026-08-24 — docs + fix: UX/UI skeleton interview, quick wins (T25 opened)

T23 (monster-forge DS alignment) merged without its acceptance boxes ticked
or a Done note — no record of what it actually finished. Francesco asked for
a fresh pass: study monster-forge directly (its actual `styles.css`, not a
secondhand summary), audit character-forge's live UI against it, interview
him on the open questions, distill guidelines. 7 AskUserQuestion rounds + 2
visual mockups (mobile nav pattern, dialog label voice).

Headline correction to what T23 assumed: monster-forge's own primary nav is
a resizable left rail (not tabs), and its accent is coral/terracotta
`#e2654d` (not indigo) — character-forge's indigo + tab shell were already
confirmed deliberate divergences (2026-07-04), not a mislabeled port; now
documented as such with the actual reasoning.

- **`docs/DESIGN-SYSTEM.md`** (new): the component-level skeleton — what's
  locked (accent, nav shape, touch targets — deliberate divergences from
  monster-forge), what's adopted from monster-forge (verified against its
  source, not its own unresolved rough edges like the 35-class chip sprawl),
  the shared-primitives hard rule, the micro-label voice, chip/icon
  conventions.
- **`docs/DECISIONS.md`** (new): D16–D22, continuing `PROJECT-SCOPE.md`'s D#
  numbering with a richer format (rejected options, verbatim notes).
- **Fixed today** (the small, already-confirmed items):
  - Focus ring: one global `:focus-visible` outline rule (`primitives.css`),
    replacing a 23-instance per-component `box-shadow` ring — T23 asked for
    this in July and it never happened.
  - `.feature-section` (Features) and `.companion-identity` (Companion) now
    share `.panel`'s surface recipe via one primitives.css declaration,
    instead of two independent copies of the same three values.
  - The "Feats" section title (Features view) now uses the amber micro-label
    voice, matching every other plain-label section title in the app.
- **T25 opened** (`planning/tasks/T25-ux-skeleton.md`, data folder) for the
  real remaining work: mobile bottom tab bar + icon library, a `FieldLabel`
  primitive + dialog sweep, a shared modal/scrim base.
- `npm run verify` green (220 app tests); fixes screenshot-verified live.

## 2026-08-24 — docs: finish T21 (project docs)

Completed the deliverables the 2026-07-26 index commit left open.

- **`CLAUDE.md`**: added the missing guardrails (app never writes character
  files, schema is the contract, no cross-contamination), the `schema/`
  pointer, and a conventions section (strict TS, tokens-only styling,
  conventional commits). Fixed a stale claim that the data folder is
  Google Drive-synced — it's local-only.
- **`README.md`**: added an architecture section (pipeline diagram +
  `schema`/`pipeline`/`app` roles), an install link, and a license line.
  Screenshot still owed (manual capture).
- **License resolved with Francesco (not assumed): MIT.** Added `LICENSE`,
  updated `package.json`.
- **`docs/README.md`**: was a stale stub ("land in later tasks") — now
  cross-links the doc set.
- Data-folder `CLAUDE.md` written and the top-level `~/Documents/D&D/CLAUDE.md`
  sub-context list updated (4th row) — both outside this repo, in the local
  data home and the synced D&D `Local Files` folder.
- **⚑ Flagged, not fixed:** `docs/PROJECT-SCOPE.md` (D3, D9) and
  `docs/INSTALL.md` assume the data folder is Drive-synced for phone
  transfer; it isn't. Needs a decision from Francesco before those get
  rewritten — see T21's Done note in `planning/tasks/`.

## 2026-07-05 — chore: prettier sweep + format gate in verify

Housekeeping after merging the T19/T20/T23/T24 branches to main.

- `npm run format` sweep — 50 files, no functional changes (formatting had
  drifted because nothing gated it).
- Root `verify` now runs `format:check` first, so CI fails on drift instead
  of letting it accumulate.

## 2026-07-05 — UX audit: sticky section tabs + phone layout fixes

External-auditor pass over the whole journey (library → sheet → tabs → dice →
add/export) at 1280px and 375px. CSS-only; no markup or behavior changes.

- **Sticky tabs** (`appShell.css`): the section tab bar now pins to the top of
  the viewport (z 50 — above sheet content, under every overlay; `top` respects
  the standalone-iOS safe-area inset). The sheet runs 2000px+, and switching
  sections is the most frequent at-the-table action — it previously required
  scrolling all the way back up.
- **Phone topbar 3 rows → 2** (≤ 480px): shell buttons and the Level/Build
  toggle drop to `--font-size-sm` with slimmer padding, so + Add / Export
  session / toggle share one row (tap targets stay ≥ 44px). All five tabs now
  fit 375px with no horizontal scroll.
- **Phone grids pinned** (`mainSheet.css` ≤ 480px): abilities 3×2 (was a ragged
  4+2), AC/Initiative/Prof/Speed 2×2 (was 3+1), death saves relaid as label
  over [successes | failures] on one row (pips were wrapping 2+1).
- **Gear sub-headers demoted** (`equipment.css`): `.gear-section__title` takes
  the dim micro-label voice like `.action-group__header` — only panel titles
  speak amber (fixes the double-amber "GEAR"/"EQUIPMENT" stack from T23).
- Verified: all five views + library + manage/add dialogs + 2D/3D dice at
  1280px and 375px; `verify` green (220 app tests).

## 2026-07-05 — T24 3D dice (ported from monster-forge)

Rollable 3D dice, ported and distilled from monster-forge's `dice3d.js` (real
cannon.js physics + three.js), re-toned to character-forge's arcane-indigo
accent with Vecna numerals on the faces (the only place Vecna is used). Tap an
ability, save, skill, initiative, or attack to-hit to roll a d20 + modifier;
tap a `{dice:}`/`{dmg:}` chip to roll its expression. Shift-click = advantage,
Alt/Ctrl-click = disadvantage (2d20 with the unkept die dimmed). Every roll is
also announced on an `aria-live` region and, when 3D can't run, shown as a 2D
toast.

- **`app/src/dice/engine.js`** (+ `engine.d.ts`): the ported physics/paint core,
  kept as guarded browser JS (T24 permits this for the core). cannon pre-roll →
  paint the predetermined value onto the landing face → replay the identical
  fixed-step sim, so the shown value never changes at settle. Single look: an
  indigo "stone" material derived from `--accent`; no material presets, no
  max-face logo. Held cursor-die on desktop hover, result card (total + reroll +
  auto-dismiss bar), crit flourish (bloom + sheen) on a natural max, dropped-die
  dimming. Every THREE/CANNON/WebGL/document touch is lazy + guarded, so the
  Vitest `node` env and no-WebGL browsers no-op cleanly.
- **`app/src/dice/index.ts`**: the typed front door — rolls values in JS, embeds
  them in the engine's parts grammar (`2d20kh1:[15,8]`), and hands off to
  `rollDice3D`. `buildRoll` is the pure, unit-tested core (the card total always
  equals the kept dice shown plus the modifier). `rollableProps` turns any
  surface into a keyboard-focusable, `data-roll`-tagged rollable.
- **Lazy-load off the boot path**: three (~590KB) + cannon (~132KB) are vendored
  under `app/public/vendor/` and injected via `<script>` on first roll intent
  (desktop hover preloads; touch's first roll falls back to the toast, the next
  is 3D) — never imported, so they stay out of the initial bundle (verified via
  the `vite build` chunk report). Vecna (`vecna.otf`) loads via the FontFace API,
  scoped to the dice faces only.
- **Rollable surfaces**: ability cells, save/skill rows, initiative
  (`Abilities.tsx`, `Defense.tsx`), attack to-hit (`Attacks.tsx`), and
  damage/dice chips (`DamageText.tsx`).
- **PWA precache** (`vite.config.ts`): globs now include the vendor blobs + `otf`
  so the first offline roll works; size cap lifted to fit three.min.js.
- **Tooling**: ESLint override for `src/dice/*.js` (browser + THREE/CANNON
  globals); `public/vendor` excluded from ESLint + Prettier. New
  `src/dice/dice.test.ts` (value invariant, adv/dis keep, crit, fuzz).

## 2026-07-05 — T23 monster-forge design-system alignment

Finishes the offshoot restyle: the component-level skins now match
monster-forge, so the two apps read as siblings on one DS — with
character-forge's arcane-indigo accent, never terracotta. Token-first; the
sheet-canon ability/damage/origin/recovery grammar is untouched.

- **`app/src/tokens/tokens.css`**: new shared tokens — `--accent-2` amber (the
  secondary voice for section titles) + `--accent-2-soft`, `--surface-panel3`,
  `--border-hover`, `--scrim`, `--shadow-pop`, `--radius-xl`, `--check-mask`
  (checkbox tick), `--letter-spacing-title`, and `color-scheme: dark` on
  `:root`. Cleared the stale "provisional accent" note (indigo is confirmed).
- **`app/src/components/primitives.css`** (new, imported once in `main.tsx`):
  the shared DS layer — global hygiene (tap-highlight, `accent-color`, dark
  scrollbars), the `.panel`/`.panel__title` **SectionCard** (title now amber),
  `.section-div`, the text-input well + accent-focus base, the monster-forge
  **custom checkbox** (accent fill + masked white tick), the `.is-selected`
  card pattern (colored border + faint tint, no glow), and a reduced-motion
  guard. Reused app-wide — no per-view forks.
- **Section titles → amber**: `.panel__title` (moved out of `mainSheet.css`)
  and `.gear-section__title`. Field micro-labels stay dim — only titles take
  the accent-2 voice.
- **Selected states → border + tint**: `.manage-option--selected` and
  `.mastery-option--selected` drop the outline glow for the `--sel-accent`
  border + `color-mix` tint.
- **Overlay chrome**: library popover, manage/add dialogs and the update toast
  now share `--scrim`, `--shadow-pop`, and `--radius-xl`; the toast picks up
  the accent ring on the `--in` well.
- **Stepper**: `.step-btn` hover adopts the panel3 lift + accent glyph; the ±
  layout and 44px mobile tap targets are kept deliberately over mf's 20px
  column (usability note in T23).
- No component imports monster-forge files; ability/damage/origin colors
  unchanged; focus-visible, ≥44px targets, and reduced-motion intact.
  `verify` green (213 app tests). Verified across all five views + shell +
  library surface at 1280px and 375px.

## 2026-07-05 — T20 follow-up: unified-diff context fix + bin-link note

Audit pass over the T20 batch.

- **`kbDiff.ts`** — hunks emitted only 2 trailing context lines instead of 3
  (the trim ran before the current op was pushed, over-trimming by one). Output
  now matches `diff -U3`; two tests pin leading/trailing context and hunk
  splitting (19 kb-diff tests). Classification untouched — the real Vice run
  reproduces T20's acceptance counts exactly.
- **`pipeline/kb-audit.md`** — note the `npm rebuild @character-forge/validate`
  escape hatch when `npx character-forge-kb-diff` 404s because `node_modules`
  predates the bin (npm doesn't relink bins into an already-reified tree).

## 2026-07-05 — T20 kb-audit (extract-drift diff + refresh recipe)

The maintenance path for decision D5: characters embed the KB's full text at
compile time, so when the KB is re-compiled those copies can go stale. This batch
adds the tooling to find and fix that drift.

- **`pipeline/validate/src/kbDiff.ts` + `kbDiff.cli.ts`** — the
  `character-forge-kb-diff` bin (second bin in the validate workspace). For every
  non-Homebrew `library` extract it resolves the current KB entry via
  `MANIFEST.json` (match on `name` + `edition`; `source` then `type` break ties),
  reads the `## <name>` block out of the entry's file, whitespace-normalises both
  sides, and classifies `unchanged` / `changed` (with a context-3 unified diff) /
  `missing-from-kb` / `not-in-manifest` / `homebrew-skipped`. Dependency-free LCS
  diff. `--json` report documented in `pipeline/validate/README.md`; exit 0 when
  nothing needs action. Never reads or emits Homebrew text (scope §4).
- **`pipeline/kb-audit.md`** — the recipe: run kb-diff over `Characters/`, triage
  each `changed` (cosmetic/boilerplate → refresh; substantive rules change → spell
  out the mechanical consequence + the summaries/stats it invalidates, and ask
  Francesco), flag missing/unfindable without ever deleting an extract, then
  refresh + fix derived numbers + re-validate (T04) + record an audit note.
- **`fixtures/fake-kb/`** — a tiny invented-content KB mirroring the synthetic
  fixture's non-Homebrew entries, seeding one of each status. `kbDiff.test.ts`
  (17 tests) exercises all five plus the pure helpers.
- Docs: `pipeline/README.md`, `pipeline/validate/README.md`, `fixtures/README.md`.
- **Real run (acceptance):** kb-diff on the local Vice file against the current KB
  (v2.31.0) — 25 `unchanged` (all spells + the Autognome species, verbatim match),
  4 `changed` (invocation extracts where the compiler intentionally dropped the
  KB's `Prerequisite:`/`Type:` boilerplate — mechanical body identical, benign),
  1 `missing-from-kb` (the Warlock class overview is a `#`-level heading in a
  composite class file, not a top-level `##` block), 10 `not-in-manifest` (class/
  subclass features and one reflavored subclass name — the KB doesn't index these
  individually), 5 Homebrew skipped. No stale rules text; the deltas are the
  compiler's deliberate compression, not KB drift. (Run described only; no WotC
  text in this repo — scope §4.)

## 2026-07-05 — T19 compile recipe (chassis doc → character.json), proven on Vice

The compiler itself — instructions a cold Claude session follows to turn a
`*.chassis.md` into a validated, self-contained `*.character.json`. Docs only —
no code touched. Proven by recompiling Vice to a file mechanically equivalent to
the T03 ground truth (the M3 milestone check).

- **`pipeline/compile.md`**: the recipe. Inputs (chassis doc, KB path,
  `currentLevel`, optional session file for adopting `additions[]`); retrieval
  discipline (MANIFEST-first, edition filter, verbatim extracts, no paraphrase);
  the **compression style guide** (§6) — action-economy-first, keep every number,
  drop flavor, resolve choices inline, colour with markup, plus the honesty rule —
  with 6–8 worked before/after examples (invented content, repo-safe); pool
  embedding (D13); multiclass duties (D11 — class order, per-class hit dice,
  per-source spellcasting, coexisting slot pools, origin tags); variants (D12);
  progression + `unlockLevel`/`TBD` semantics; computation duties (scores, PB,
  saves, skills, AC/HP by the doc's method, per-source DC/attack, structured
  mixed recovery); library assembly + referential integrity; the ≤ 5 MB budget +
  lore-first trimming; the validator loop + self-review checklist; and the
  **level-up path** (§16 — bump level + class levels, resolve that level's TBDs,
  recompile, adopt session additions).
- **`pipeline/proof-vice-diff.md`**: the T19 proof. Recompiling Vice from a
  freshly-written `vice.chassis.md` reproduces the T03 file with **0 structural or
  computed-value differences** (874 leaf paths, 0 added/removed); the only deltas
  are re-authored summary wording (mechanically equivalent, human-reviewed). Both
  files validate green. One recipe gap found and fixed (level-up must bump class
  `levels` with `currentLevel`); the Vice 2 → 3 level-up path exercised once.
- Repo-safe by construction: the chassis doc, recompiled file, and level-3 dry run
  live in the local data home (`Characters/`), never here; `proof-vice-diff.md`
  describes differences only and holds no WotC text (scope §4).

## 2026-07-05 — T18 pipeline front door (interview + chassis format)

The pipeline's authoring layer: how a build idea becomes a `*.chassis.md`, and
how that document maps onto the schema. Docs only — no code touched. Phase 4
starts here (compile T19, kb-audit T20, docs T21 follow).

- **`pipeline/chassis-format.md`**: the human-first chassis document format —
  frontmatter (identity + rules envelope: `ruleset`/`sources`/`currentLevel`/
  `targetLevel`) and the sections concept & reflavoring · chassis (species,
  background, class(es) with order/levels/hit die/planned subclass) · homebrew
  (full rules text, verbatim → `library` extracts) · level-by-level progression
  · volatile-pool defaults (D13) · equipment · companions · variants (D12). A
  fully annotated **multiclass** example anchored to
  `fixtures/synthetic.character.json` (provable round-trip), precise **`TBD(...)`
  semantics** (at/below `currentLevel` = blocking; above = non-blocking planned),
  and a **field → schema mapping table** flagging each region as read-from-doc
  vs compiler-derived.
- **`pipeline/interview.md`**: cold-start instructions for a Claude session to
  co-write the chassis doc — rules-accurate collaborator (2–3 cited options, no
  invented rules), KB lookup via `MANIFEST.json` + `_legend.md`, per-entry
  user-approved edition mixing, verbatim homebrew protocol, `TBD`/`FLAG`
  discipline, and the hard rule that the interview **never** writes a
  `character.json` (compile is a separate step).
- **`pipeline/README.md`**: one-page interview → compile → validate overview +
  when to run kb-audit; links the four pipeline docs.
- **`pipeline/examples/thessaly-quill.chassis.md`**: a worked dry-run product,
  wholly invented content (public-repo safe) — single-class caster, reflavored
  species, DM-approved homebrew background, a prepared-spell pool, a companion, a
  planned subclass, one variant, and TBD markers above the current level.
- **`.gitignore`**: added `!pipeline/examples/**/*.chassis.md` so the synthetic
  example is tracked while real `*.chassis.md` build docs stay ignored (mirrors
  the existing `!fixtures/**` IP-guardrail exceptions).

## 2026-07-05 — T17 PWA polish & offline hardening

Character Forge is now a real installable, offline-first app: a dark-matching
launch surface, a complete icon set, a controlled update flow, and iOS quirks
handled. No network calls at runtime beyond service-worker update checks (§8).

- **Manifest** (`app/vite.config.ts`): name "Character Forge" / short_name
  "Forge", standalone + portrait, dark `theme_color`/`background_color` from the
  `--surface-bg` token (D10), and `scope`/`start_url`/`id` pinned to the Pages
  sub-path `/character-forge/`. Icons: `pwa-192`, `pwa-512` (any) +
  `maskable-icon-512` (maskable, glyph in the safe zone).
- **Icons** (`app/public/`): a neutral d20 glyph in the arcane-indigo accent on
  the dark surface, drawn as `icon.svg` / `icon-maskable.svg` and rasterized to
  the PNG set (192/512/maskable/apple-touch/favicon). Placeholder by intent —
  Francesco restyles later.
- **Service worker** (vite-plugin-pwa, `registerType: 'prompt'`): precache the
  full shell **including the bundled Inter woff/woff2** (the default glob omits
  fonts — critical for offline text) via an explicit `globPatterns`;
  `navigateFallback` so deep reloads work offline under the sub-path;
  `globIgnores` skips any `*.character.json` dropped in `public/` (KB extracts
  never get precached). Build precaches 75 entries (~1.6 MB).
- **Update flow** (`app/src/app/UpdateToast.tsx` + `updateToast.css`): a
  bottom "New version available — Reload / Later" toast via `useRegisterSW`;
  the new shell is fetched but never swapped mid-session until Reload. Also a
  one-time "Ready to work offline" confirmation after first install.
- **iOS specifics** (`app/index.html`, `app/src/app/global.css`):
  `apple-mobile-web-app-*` tags (translucent status bar, home-screen title),
  `apple-touch-icon`, `theme-color`; safe-area insets on the shell + library
  roots and both bottom sheets (already had `env(safe-area-inset-bottom)`);
  `viewport-fit=cover` (kept); **inputs forced to 16px on narrow widths** to
  kill iOS focus-zoom; `overscroll-behavior: contain` on scroll surfaces;
  `-webkit-text-size-adjust: 100%`.
- **Persistent storage** (`app/src/app/persistStorage.ts`): best-effort
  `navigator.storage.persist()` on boot to reduce IndexedDB eviction of the
  character library + session layer. Never throws.
- **Docs** (`docs/INSTALL.md`): plain-language install steps for iPhone
  (Share → Add to Home Screen) and desktop, plus the Google Drive → import
  flow, written for future-Francesco.
- Verified: `verify` green; production build emits `sw.js` + a valid
  `manifest.webmanifest` (icons, scope, dark colors) with the real character
  file excluded from precache. Lighthouse-installable / airplane-mode / device
  safe-area checks are the on-device acceptance step (Pages deploy + iPhone).

→ archived 2026-08-24: T01–T16 (Phase 0 foundation through T16 character
management) — docs/ARCHIVE.md
