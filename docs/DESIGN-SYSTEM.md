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
  character-forge's modal/scrim chrome should converge on one shared base the
  same way (see §4, still owed).
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

| Role                  | Class                                  | Notes                                                                                                                                                                                           |
| --------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section block         | `.panel` / `.panel__title`             | Amber uppercase micro-label title. **Every** section header in **every** view and dialog uses this — no local `background/border/border-radius` recipe that happens to match it by coincidence. |
| Field label           | _(new — see below)_                    | Dim uppercase micro-label, same voice as `.panel__title` but `--ink-muted` not `--accent-2`. Applies inside dialogs too (D20).                                                                  |
| Divider               | `.section-div`                         |                                                                                                                                                                                                 |
| Text input / textarea | element-level base in `primitives.css` |                                                                                                                                                                                                 |
| Checkbox              | `input[type=checkbox]` skin            |                                                                                                                                                                                                 |
| Selected state        | `.is-selected`                         | Border + tint, no glow — see §2.                                                                                                                                                                |
| Stepper button        | `.step-btn` (`mainSheet.css`)          | 44px comfort target, a **deliberate** divergence from monster-forge's 20px stacked column — documented inline, keep it.                                                                         |

**Confirmed violations, fixed 2026-08-24:**

- `views/Features/features.css` had its own `.feature-section` (duplicating
  `.panel`'s exact recipe) and `.feature-section__title` (bold, no uppercase/
  letter-spacing/color — skipped the micro-label voice entirely). Now
  consumes `.panel`/`.panel__title`.
- `views/Companion/companion.css` had its own `.companion-identity`
  (duplicating `.panel`'s exact recipe). Now consumes `.panel`.

**Still owed (→ `T25`):**

- A `FieldLabel` component/class so dialog forms (Add item, Manage spells,
  Manage masteries) stop using ad-hoc bold `label` styling and pick up the
  same micro-label voice as the sheet (D20).
- A shared modal/scrim base — `.modal`/`.scrim` chrome currently isn't
  converged across `library/`, `manage/`, `session/additions/` the way
  monster-forge's `.menu`/`.popover`/`.modal` are.

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

character-forge barely uses icons today (2 inline-SVG files: `DiceStateIcon`,
`RecoverIcon`). That changes with the mobile bottom tab bar (D18, needs 5
nav icons). Rule, so it doesn't drift the way monster-forge's primary nav
did (a visible mix of filled Font-Awesome-style glyphs and Feather-style
outline icons, even within its own 4-button rail):

- **One outline icon set, one stroke-width, one size grid.** Source:
  `lucide-react` or `@tabler/icons-react` (pick one in T25; don't mix).
- **Bundled as tree-shaken SVG React components — never a CDN webfont.**
  This isn't a style preference, it's parity with an existing, load-bearing
  rule: `tokens.css` documents Inter as "bundled via @fontsource,
  offline-safe — no Google Fonts at runtime" specifically because
  character-forge is an installable offline PWA (T17). A CDN icon font would
  silently break the moment the app is used offline at the table.
- No hero/bespoke icon exception exists yet. If one emerges later (a d20/
  brand mark, say), it needs to be named explicitly as an exception here —
  not introduced quietly.

## 7. Responsive

- Breakpoints: reuse whatever's already in `mainSheet.css`/`appShell.css`
  (phone-first, single content breakpoint around 480px per the 2026-07-05 UX
  audit) — don't invent a new ad-hoc breakpoint per component the way
  monster-forge did (5 different hardcoded breakpoints, none shared as a
  token).
- Safe-area: character-forge already handles `env(safe-area-inset-*)` for
  the standalone-iOS sticky tab bar (T17/UX audit) — monster-forge barely
  addresses this at all (one instance, in its player-mode bottom sheet). The
  new bottom tab bar (D18) needs the same safe-area treatment; don't regress
  it.
- Touch targets: 44px comfort target, not monster-forge's 24px AA floor (D22,
  §1).

## 8. What's still open (owed to `planning/tasks/T25-ux-skeleton.md`)

- Bottom tab bar for mobile nav (D18) — new component, icon set (D21),
  breakpoint swap with the existing top tab bar.
- `FieldLabel` primitive + dialog form sweep (D20) — Add item, Manage
  spells, Manage masteries.
- Shared modal/scrim base across `library/`, `manage/`, `session/additions/`.
- Chip/badge audit against §5's checklist as new views get built (T22 and
  beyond) — not urgent today, just don't skip the check.
