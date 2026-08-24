# `docs/DESIGN-SYSTEM.md` — the component-level skeleton

> Written 2026-08-24, after studying monster-forge directly (its `styles.css`,
> not a secondhand summary) and auditing character-forge's actual CSS/live UI
> against it. The decisions behind every rule here are in
> [`DECISIONS.md`](DECISIONS.md) D16–D22 — this doc states the rules; that one
> states the why and the rejected alternatives. Read this before touching any
> component CSS.

## The one thing to internalize

**character-forge and monster-forge are siblings, not clones.** They share a
token layer (dark scale, radius steps, Inter, the uppercase-micro-label
_pattern_) because Francesco wants them to read as built by the same hand.
They deliberately diverge on accent color, nav shape, and touch-target size
because they solve different problems on different devices — monster-forge is
a DM's desktop combat tracker; character-forge is a player's phone at the
table. **Never "align" a deliberate divergence away.** Section 1 lists what's
locked; don't reopen it without a decision from Francesco first (D19).

Equally important: **monster-forge is not a model of consistency to copy
wholesale.** Its own commit history (`ARCHIVE.md` Batch 100) admits its
chip/pill/tag system sprawled to 35+ overlapping classes and was never fixed,
its CTA buttons (`.btn`/`.fab`/`.start-combat`) were never unified, and its
primary-nav icons are a visible mix of two different styles. Where this doc
says "adopt monster-forge's X," it means a _stated, enforced_ rule found in
its source — not an accident to inherit. Where character-forge already does
something monster-forge never got around to (a real spacing/type scale, PWA
safe-area handling, 44px tap targets), **keep it** — character-forge is ahead
there, not behind.

---

## 1. Locked — do not reopen without a decision from Francesco

| What                                         | character-forge                                              | monster-forge                                                              | Why they differ                                                                                                                                                                                                            |
| -------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accent                                       | Arcane indigo `#7a6fe0`                                      | Coral/terracotta `#e2654d`                                                 | Deliberately different hue so the two apps are never confused at a glance (confirmed 2026-07-04).                                                                                                                          |
| Primary nav shape                            | Top tab bar (desktop); bottom tab bar (mobile, D18)          | Resizable left rail → hamburger + slide-over drawer on mobile              | A rail is a desktop power-user pattern; it doesn't serve one-handed phone reading. Different primary device, different nav.                                                                                                |
| Touch targets                                | 44px comfort target (stepper buttons, tap targets generally) | 24px WCAG-AA floor, deliberate density tradeoff for a DM tool              | Player-facing phone app vs. desktop-dense tracker (D22).                                                                                                                                                                   |
| Vecna font                                   | Dice faces only, never UI chrome                             | Dice faces only, never UI chrome                                           | Same rule, both apps — not a divergence, just worth restating since it's easy to reach for a "cool D&D font" elsewhere.                                                                                                    |
| Ability/damage/origin/recovery color grammar | character-forge's own (sheet-canon derived)                  | N/A (monster-forge has no per-damage-type coding — one red for all damage) | character-forge's paper-sheet source material specifically color-codes by damage type; monster-forge's statblocks color-code by grammatical role instead. Different source material, both legitimate — not a gap to close. |

## 2. Adopted from monster-forge, verified against its actual source (not a summary)

- **Dark-only, single theme.** `color-scheme: dark` on `:root`, no light-mode
  branch anywhere. Matches monster-forge exactly; light mode is backlog (D10).
- **Selected/active state = 1px accent border + faint tint, never a glow.**
  Monster-forge unified this in Batch 100 after finding it rendered four
  different ways across its own views — don't reinvent a fifth here.
  `.is-selected` in `primitives.css` already does this correctly.
- **Popup-surface base** (menu/popover/modal share background, border,
  radius, shadow) — one of monster-forge's genuine consistency wins.
  Fixed 2026-08-24 (D26): the Manage/Import + Add dialogs now share
  `.modal-overlay`/`.modal-surface` (§3). The library's own popover/sheet
  stays its own component — a different role (anchored popover, not a
  centered confirmation dialog), matching monster-forge's own
  `.popover`-vs-`.modal` split, not one undifferentiated class.
- **Micro-label _pattern_, not its un-tokenized values.** Monster-forge's
  section-header voice (uppercase, 600–700 weight, wide letter-spacing, dim
  or amber) is a real, 55-times-repeated rule in its source — but the exact
  numbers (9–12px, .04–.16em) were never tokenized, reinvented per component.
  character-forge already tokenizes this correctly
  (`--font-size-chrome`/`--letter-spacing-title`/`--weight-chrome`) — the gap
  isn't the token system, it's that not every component consumes it (§3).
- **`:focus-visible` as one global rule**, not a per-component ring.
  Monster-forge: `:focus-visible{outline:2px solid var(--accent-soft);
outline-offset:2px}` — one selector, whole app. character-forge had drifted
  to a two-layer `box-shadow` ring duplicated in 18+ places; fixed 2026-08-24
  (D22) to match this exactly.

## 3. Shared primitives — the hard rule (D19)

**A view or dialog reuses the shared component for a given role. It never
reimplements the same look locally.** This is not a style preference — it is
verbatim the mistake monster-forge's own retrospective flagged as its
unresolved chip/pill/tag sprawl (Batch 100) and never fixed. character-forge
gets to not repeat it.

**No session — Claude or otherwise — decides an exception on its own.** If a
component's role genuinely doesn't fit an existing primitive, ask Francesco
via AskUserQuestion before forking. Don't silently add a one-off.

Current shared primitives (`app/src/components/primitives.css`):

| Role                               | Class                                          | Notes                                                                                                                                                                                               |
| ---------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section block                      | `.panel` / `.panel__title`                     | Amber uppercase micro-label title. **Every** section header in **every** view and dialog uses this — no local `background/border/border-radius` recipe that happens to match it by coincidence.     |
| Field label                        | `.field-label`                                 | Dim uppercase micro-label, same voice as `.panel__title` but `--ink-muted` not `--accent-2`. Applies inside dialogs too (D20, fixed 2026-08-24).                                                    |
| Divider                            | `.section-div`                                 |                                                                                                                                                                                                     |
| Text input / textarea              | element-level base in `primitives.css`         |                                                                                                                                                                                                     |
| Checkbox                           | `input[type=checkbox]` skin                    |                                                                                                                                                                                                     |
| Selected state                     | `.is-selected`                                 | Border + tint, no glow — see §2.                                                                                                                                                                    |
| Stepper button                     | `.step-btn` (`mainSheet.css`)                  | 44px comfort target, a **deliberate** divergence from monster-forge's 20px stacked column — documented inline, keep it.                                                                             |
| Action button                      | `.btn` + `--primary`/`--ghost`/`--danger`      | Standalone labeled action button, always pill radius (D25, 2026-08-24). `.mng-btn*`/`.add-btn*` (Manage/Import/Add dialogs) both consume this now — no independent copies.                          |
| Icon-only button                   | `.btn-icon`                                    | Square control (dialog close, and any future icon-only button), always `--radius-sm`, never pill (D25). Both dialogs' close buttons consume this.                                                   |
| Modal (confirmation/action dialog) | `.modal-overlay` / `.modal-surface` + `--wide` | Centered card on desktop, bottom sheet on mobile (D26, 2026-08-24). Manage/Import/Add dialogs consume this. The library's own popover/sheet is a **deliberate** exception — different role, see §2. |

**Confirmed violations, fixed 2026-08-24:**

- `views/Features/features.css` had its own `.feature-section` (duplicating
  `.panel`'s exact recipe) and `.feature-section__title` (bold, no uppercase/
  letter-spacing/color — skipped the micro-label voice entirely). Now
  consumes `.panel`/`.panel__title`.
- `views/Companion/companion.css` had its own `.companion-identity`
  (duplicating `.panel`'s exact recipe). Now consumes `.panel`.
- `manage/manage.css`'s `.mng-btn*`/`.mng-dialog__close` and `session/
additions/additions.css`'s `.add-btn*`/`.add-sheet__close` were
  near-duplicate CSS for the same two roles (dialog action button, dialog
  close button) with real drift between the copies (`.add-btn` used
  `--radius-md` at a larger size than `.mng-btn`'s `--radius-pill`; the
  Add dialog's `--ghost` modifier had no CSS at all — a silent no-op). Both
  now consume `.btn`/`.btn-icon` (D25).
- `views/MainSheet/mainSheet.css`'s `.stat__label`/`.chassis-item__label`/
  `.defenses__label`/`.senses__label` and the dialogs' `.add-preview__label`/
  `.add-field__label` (wrong, non-uppercase voice)/`.mng-field__label`/
  `.mng-change__label` were 6 independent copies (one genuinely wrong) of
  the same field-label recipe. All now consume `.field-label`; checked
  `views/Spells`' and `views/Equipment`'s manage flows (the task's named
  "Manage spells/masteries") and found no bold-label violation there — they
  already use `.panel__title` correctly, so nothing to fix.
- `manage/manage.css`'s `.mng-overlay`/`.mng-dialog` and `session/additions/
additions.css`'s `.add-overlay`/`.add-sheet` were byte-identical CSS in
  two files. Both now consume `.modal-overlay`/`.modal-surface` (D26); the
  Manage/Import dialogs also picked up the bottom-sheet-on-mobile behavior
  the Add dialog already had (a deliberate convergence, not just dedup).

**Known, deliberately deferred (not part of this pass):** `spells.css`'s
`.spell-slots__level-label`/`.manage-source__level-label`/`.spell-row__role`/
`.spell-swap__level` and `equipment.css`'s `.gear-section__title` re-declare
the same chrome-micro-label recipe locally rather than consuming a shared
class — a D19-style duplication, but a different semantic role (sub-section/
role tag, not "names one input") and not a wrong-voice bug like the dialogs
were. Worth a future consolidation pass; out of scope for T25's "quick wins,
not a full redo" (D16).

## 4. Micro-label voice — the two roles

Both roles share the shape (uppercase, wide letter-spacing, small); they
differ only in color, which encodes hierarchy:

| Role                | Color                | Token                        | Use                                                 |
| ------------------- | -------------------- | ---------------------------- | --------------------------------------------------- |
| Panel/section title | `--accent-2` (amber) | `.panel__title`              | "SAVES", "RESOURCES", "GEAR" — names a whole block. |
| Field/sub-label     | `--ink-muted` (dim)  | _(new `FieldLabel`, see §3)_ | "AC", "Qty", "Name" — names one value or input.     |

Never a third voice. The dialog forms' current bold, non-uppercase labels are
a third voice by accident, not by design — D20 removes it.

## 5. Chips, badges, tags — the anti-sprawl checklist

character-forge's chip system today (`components/chips/chips.css`, ~10
families: ability, damage, condition, origin, save-badge, school-label,
recover-icon, state-icon, ref-link, generic `.chip`) is already small and
semantic — nowhere near monster-forge's 35-class chip sprawl (+ 15 tag + 7
badge + 4 pill classes, admittedly never unified). The risk is future growth,
not today's state. Before adding a new chip/badge/tag class, ask:

1. **Is this a genuinely new semantic category** — a new _kind_ of game data
   that doesn't map to an existing family (ability/damage/condition/origin/
   save/school/recovery/state)? → A new class is justified. Follow the
   existing BEM-ish naming (`<noun>-chip`, `<noun>__element`).
2. **Or is it a visual variant of something that already exists** — a color,
   size, or interaction-state difference? → Extend the existing class with a
   modifier (`.chip--tappable`, not `.chip2`). This is exactly where
   monster-forge's `.pc-chip`/`.pc-dchip`/`.dchip`/`.dchip2` fork happened.

If genuinely unsure which bucket a new one falls into, ask Francesco rather
than guessing — same rule as §3.

## 6. Icons (D21)

Rule, so this doesn't drift the way monster-forge's primary nav did (a
visible mix of filled Font-Awesome-style glyphs and Feather-style outline
icons, even within its own 4-button rail):

- **One outline icon set, one stroke-width, one size grid.** Fixed
  2026-08-24: `lucide-react` (tree-shaken component imports, never a CDN
  webfont — parity with `tokens.css`'s existing offline-safe Inter rule).
  `npm run build` confirms real bundling (79 precache entries, no external
  request).
- **Consumers:** the bottom tab bar's 5 nav icons (`LayoutDashboard`,
  `Sparkles`, `BookOpen`, `Backpack`, `PawPrint` — §7 has the mapping) and
  `RecoverIcon` (`Sun`/`Moon`/`Sunrise`, replacing the old flat-filled
  shapes that read as emoji-style icon language, D23 #7).
- **`DiceStateIcon`** (the bespoke d20-outline + chevron advantage/
  disadvantage glyph) is a **named, deliberate exception** — no library
  icon matches a d20 with a direction chevron, and forcing a generic
  up/down-arrow swap would lose the D&D-specific meaning. Not converted;
  don't revisit without a reason.

## 7. Responsive

- Breakpoints: reuse whatever's already in `mainSheet.css`/`appShell.css`
  (phone-first, single content breakpoint around 480px per the 2026-07-05 UX
  audit) — don't invent a new ad-hoc breakpoint per component the way
  monster-forge did (5 different hardcoded breakpoints, none shared as a
  token).
- Safe-area: character-forge already handles `env(safe-area-inset-*)` for
  the standalone-iOS sticky tab bar (T17/UX audit) — monster-forge barely
  addresses this at all (one instance, in its player-mode bottom sheet). The
  bottom tab bar (D18) does the same: `padding-bottom:
env(safe-area-inset-bottom, 0px)` on the bar itself, plus a
  `padding-bottom` reservation on `.app-shell__view` so content never sits
  under the fixed bar. Swaps with the top `.app-shell__tabs` at the
  existing 768px breakpoint (`display: none` either side, one `tabs`/`tab`
  state, not a duplicated component).
- Touch targets: 44px comfort target, not monster-forge's 24px AA floor (D22,
  §1).

## 8. What's still open (owed to `planning/tasks/T25-ux-skeleton.md`)

- ~~Bottom tab bar for mobile nav (D18)~~ — done, see §7.
- ~~`FieldLabel` primitive + dialog form sweep (D20)~~ — done, see §3.
- ~~Shared modal/scrim base~~ — done (D26): Manage/Import/Add dialogs
  converged on `.modal-overlay`/`.modal-surface`; the library popover is a
  deliberate, documented exception (§2/§3).
- Chip/badge audit against §5's checklist as new views get built (T22 and
  beyond) — not urgent today, just don't skip the check.
- **From Francesco's own post-interview UX audit (D23), progress as of
  2026-08-24:**
  - ~~Button taxonomy~~ — done (D25): `.btn`/`.btn-icon` in
    `primitives.css`, dialog actions unified.
  - ~~Type scale~~ — done: `--font-size-lg/xl/2xl/3xl/inline` added, all 19
    rem/em call sites (the 20th, `global.css`'s iOS zoom-fix 16px, is
    intentionally not part of the scale) migrated.
  - ~~Feature-tappability gap~~ — scoped (D24): data fix, not a UI change;
    out of this repo's/T25's engineering scope.
  - ~~Rest icons~~ — done: `Sun`/`Moon`/`Sunrise` (lucide), see §6.
  - Still open: Saves and Skills moved adjacent; top-bar consolidation into
    a settings affordance (needs a mockup + Francesco sign-off); the macro
    character-list ↔ sheet nav layer (not a D18 reopening — a different
    layer, also needs a mockup + sign-off); a real layout pass on the
    Equipment/gear section.
    Full detail and verification notes: `docs/DECISIONS.md` D23–D25.
