# character-forge — Decisions

> Append-only. Continues the `D#` numbering started in `PROJECT-SCOPE.md` §3
> (D1–D15, 2026-07-04). New entries land here from this point forward — richer
> format (rejected options, verbatim notes) than the original scoping table.
> Status lifecycle: `OPEN → DECIDED → SUPERSEDED` (or `DISMISSED`, kept so the
> same idea isn't re-litigated).

---

### D16 — UX/UI skeleton pass: guidelines + quick wins, not a full redo · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 1 round
Raw note: "Guidelines + quick wins now"
Options: A guidelines-only, no code / B guidelines + fix the small confirmed items now / C full execution this session (T23 redo)
Chosen: B — the doc + task list still gets its own reviewable scope, but the
already-confirmed, low-risk fixes (focus ring, Features section-title voice,
Companion/Features reusing `.panel`) land today instead of waiting on a T25 PR.
Rejected A — leaves known bugs sitting for no reason. Rejected C — skips the
per-item review the project's task convention otherwise gets.
Enforced by: prose only — this session's own scope.
Affects: this session's execution plan.

### D17 — Guidelines live in a new repo doc, not the task file · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 1 round
Raw note: (selected) "New repo doc (Recommended)"
Options: A new `docs/DESIGN-SYSTEM.md` (repo) + `T25` task file (data folder) / B fold into the task file's Context section only / C chat-only, nothing written
Chosen: A — `docs/DESIGN-SYSTEM.md`, linked from `CLAUDE.md`/`README.md`, is the
durable reference this repo doesn't have yet (monster-forge doesn't have one
either — this sets a better precedent). `planning/tasks/T25-*.md` in the data
folder carries the prioritized backlog, matching T01–T24 convention.
Rejected B — rules would live inside a to-do item, not somewhere a future
session checks by default. Rejected C — nothing persists.
Enforced by: prose only.
Affects: `docs/DESIGN-SYSTEM.md` (new), `docs/README.md` (index), `CLAUDE.md`
(pointer), `planning/tasks/T25-ux-skeleton.md` (new, data folder).

### D18 — Nav shape: top tabs (desktop) stay; mobile switches to a bottom tab bar · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 2 rounds (+ visual mockup: bottom tab bar vs.
segmented pill switcher, phone-width, actual app tokens)
Raw note round 1: "Top tabs for desktop, but move them to the bottom for
mobile or let's consider a switch between tabs more comfortable for mobile
users." Round 2 (after the mockup): "Bottom tab bar (Recommended)."
Options (round 2): A bottom tab bar (icons, always visible, thumb-reachable)
/ B segmented pill switcher pinned near top (evolves current look, no
bottom-space tax) / C swipe between sections (no persistent chrome, hides
discoverability)
Chosen: A for mobile (≤ some breakpoint TBD in T25); top tab bar unchanged
for desktop — confirmed as a deliberate, permanent divergence from
monster-forge's rail nav, not a leftover default (see D-context below).
Rejected B — still a reach-up motion on a tall phone even sticky. Rejected C —
discoverability risk, conflicts with any horizontally-scrollable content
inside a view.
Context (not re-litigated): monster-forge's primary nav is a resizable left
rail, collapsing to a hamburger + slide-over drawer on mobile — not tabs at
all. Character-forge intentionally does not copy this: a rail is a desktop
power-user pattern that doesn't serve one-handed phone reading, and the two
apps have genuinely different primary contexts (DM desktop tool vs. player's
phone at the table).
Enforced by: prose only; becomes an implementation detail of T25.
Affects: `app/src/app/appShell.css`, the shell component, needs a new
breakpoint-driven bottom-tab-bar component + icon set (see D21).

### D19 — Shared primitives are a hard rule; exceptions need Francesco's sign-off · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 1 round
Raw note: "Hard rule, only I can ask directly to break conventions or you must
check with me before doing so when required by the situation."
Options: A hard rule, checked every PR / B strong convention, not enforced /
C case-by-case, decide later per instance
Chosen: A, with the specific condition Francesco added: a view or dialog MUST
reuse the shared component (`SectionCard`/`.panel`, `FieldLabel`, etc.) for a
given role — no local reimplementation of the same look. A session (Claude or
otherwise) may not unilaterally decide an exception is warranted; it must ask
Francesco first via AskUserQuestion.
Rejected B — relies on memory, no forcing function. Rejected C — this is
verbatim the mistake monster-forge's own retrospective (Batch 100) flagged as
its unresolved chip/pill/tag sprawl and never fixed.
Enforced by: prose only (no lint/test today) — the hard part is the sign-off
gate, which is a process rule, not a build check. Stated plainly in
`docs/DESIGN-SYSTEM.md`.
Affects: `app/src/views/Features/features.css` (`.feature-section*` →
`.panel`/`.panel__title`), `app/src/views/Companion/companion.css`
(`.companion-identity` → `.panel`) — fixed today as D16 quick wins.

### D20 — Dialog forms unify with the sheet's micro-label voice · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 2 rounds (+ visual mockup: current bold app-chrome
labels vs. unified dim-uppercase sheet labels, using the real "Add to sheet"
dialog fields)
Raw note round 1: "Unclear decision." Round 2 (after the mockup): "Unified
micro-label voice (Recommended)."
Options: A unify with sheet voice (dim/amber uppercase micro-labels
everywhere) / B keep dialogs on a deliberately distinct, bigger/bolder
generic-form voice, named as a two-voice system
Chosen: A — one consistent visual language app-wide; still fully legible at
this size in a short form. Rejected B, but noting Francesco's first read was
genuinely uncertain — this is worth re-checking once implemented (label
legibility on a real phone, not just the mockup) rather than treating as
fully closed.
Enforced by: prose only; folded into D19's shared-primitive rule (dialogs
should consume the same `FieldLabel` component as the sheet, not a
one-off `label` style).
Affects: Add-to-sheet dialog, Manage spells/mastery dialogs (`session/
additions/additions.css`, `manage/manage.css`).

### D21 — One outline icon library, bundled as SVG (not a CDN webfont) · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 2 rounds
Raw note round 1: "One outline library, uniform (Recommended)." Round 2 (after
Claude flagged the offline-PWA conflict): "Bundled SVG package (Recommended)."
Options (round 1): A one outline library uniform everywhere / B hand-crafted
bespoke SVGs / C library base + named hero exceptions.
Options (round 2): A bundled SVG package (`lucide-react` or
`@tabler/icons-react`, tree-shaken component imports) / B self-hosted icon
font (like Vecna/Inter)
Chosen: A + A — one outline icon set, sourced as tree-shaken SVG React
components, never a CDN-loaded icon font. This was Claude's own catch, not
Francesco's: a CDN webfont would have broken the existing "no Google Fonts at
runtime, everything offline-safe" rule already locked for Inter
(`tokens.css` header comment) the moment the PWA is used offline at the
table.
Rejected (round 1) B — bespoke work without a documented stroke-width/size
rule risks drifting the way monster-forge's mixed filled/outline nav icons
did. Rejected (round 1) C — no hero icon identified yet; revisit if one
emerges (e.g. a d20/brand mark). Rejected (round 2) B — font-based icons are
a step back from per-icon SVG control (color, size, a11y) for no real benefit
over the SVG package.
Enforced by: prose only; package choice is a `package.json` dependency add in
T25, self-verifying (offline build either works or it doesn't).
Affects: new dependency in `app/package.json`; the D18 bottom-tab-bar icons
are the first consumer.

### D22 — Touch targets and focus ring: confirmed, unchanged · 2026-08-24 · DECIDED

Mechanism: reconfirmed without a fresh AskUserQuestion round — both were
already correct, documented decisions from T23/T24; re-litigating either
would have violated "no clarifying questions on simple, unambiguous
requests."
Chosen: (a) Character-forge keeps its 44px comfort-target stepper buttons
(`mainSheet.css` "T23 usability note"), not monster-forge's 24px WCAG-AA
floor — the two apps have different device contexts (DM desktop tool vs.
player's phone), so this stays a deliberate divergence, not something to
"align down." (b) Focus ring switches from the current two-layer
`box-shadow: var(--focus-ring)` (used in 18+ places across the app) to
monster-forge's single global rule, verified directly in its source:
`:focus-visible{outline:2px solid var(--accent-soft);outline-offset:2px}`
— this one was already decided in T23's spec and simply never executed.
Enforced by: the focus-ring switch is a D16 quick win, done today (one global
selector replacing the per-file box-shadow rule).
Affects: `app/src/tokens/tokens.css` (`--focus-ring` → a single `outline`-based
rule), every file currently setting `box-shadow: var(--focus-ring)` on
`:focus-visible` (drops the per-file declaration once the global rule lands).

### D23 — Francesco's post-interview UX audit: 10 findings, filed to T25 · 2026-08-24 · DECIDED

Mechanism: direct feedback in chat, not an AskUserQuestion round — Francesco
reviewed the live app himself after D16–D22 and flagged 10 items the
interview hadn't surfaced. Each was verified against the actual code/live UI
before filing (not transcribed at face value) — see per-item notes below.
Raw note (verbatim): "the buttons are all over the place: too big sometimes,
usage of rounded buttons that were never used elsewhere, use of emoji like
icons for short and long rest / not all features are clickable showing the
modal (ex. second wind in features should also be) / the organization of
the blocks is weird (ex. skills should be under saves) / saves and in
general the stats should be treated more like they do in monster forge, in
one element / the clunky settings on top should take all that space, but
should be reorganized and nested in settings / the macro navigation
structure (ex. character list and character sheet) should be organized like
monster forge / some elements have not enough visual contrast (ex. variants
chip in your characters) / spacing between lines is too cramped sometimes /
the gear section is a mess / the font sizes are a mess and inconsistent"

Chosen: all 10 are real; filed to `planning/tasks/T25-ux-skeleton.md`
(data folder) as new deliverables, two fixed immediately as trivial
same-session corrections. Verification per item:

1. **Buttons inconsistent** — confirmed: `--radius-pill` (999px) is used on
   18 different button/chip/control types across 12 files, mixed
   indiscriminately with the `--radius-sm/md/lg/xl` scale, with no rule for
   which control gets which. Exactly monster-forge's own unresolved
   `.btn`/`.fab`/`.start-combat` non-unification (Batch 100) — character-forge
   inherited the mistake rather than the fix.
2. **Emoji-like rest icons** — confirmed, but not literally emoji: `RecoverIcon`
   (`components/chips/RecoverIcon.tsx`) is a hand-rolled flat-filled SVG (a
   solid circle for "sun", a solid crescent for "moon") — visually reads as
   emoji-style icon language even though it's real SVG. Conflicts with D21's
   new outline-icon rule; redo it in the new icon library as part of D21's
   rollout, not left as a bespoke exception.
3. **Second Wind not clickable** — confirmed in `ProgressionRow.tsx`: a
   feature name is only a `RefLink` (opens the library popover) when
   `item.ref` is set on the compiled data; when absent it's plain text with
   no way to see more. Open question, not guessed: is this a UI bug (every
   feature should be tappable to _something_, ref or not) or a compile-layer
   data gap (this fixture's Second Wind is just missing a `ref` it should
   have)? Different owners — UI fix belongs in T25, data-completeness fix
   belongs in the compile pipeline. Ask Francesco before assuming which.
4. **Block organization / saves+skills combined** — confirmed in
   `MainSheet.tsx`: `SavesBlock` lives in the left rail; `SkillsBlock` lives
   in the third ("detail") column, after Defense/Resources/Attacks/Actions —
   spatially far apart, and on mobile several unrelated panels stack between
   them. Cross-checked monster-forge's actual statblock renderer
   (`engine.js` `sbAbilityTableHTML`): ability score + modifier + save render
   as **one compact table**, with skills as a single inline paragraph
   directly below it — not three separate cards. Real, verified precedent for
   "in one element."
5. **Top bar clutter** — confirmed by inspection: the chrome above the tab
   row is 3 stacked rows (back+name / +Add+Export+Level·Build / variant
   chips) before any sheet content appears. Needs consolidating into a
   settings affordance rather than permanent top-of-screen real estate —
   design work, not a code bug; scope it in T25 rather than guessing a
   layout.
6. **Macro nav (character list ↔ sheet)** — the character-list screen
   ("Your characters") is a flat list with no persistent structure; opening
   a character replaces it entirely with the sheet (back button to return).
   Not a re-litigation of D18 (which is about in-sheet section tabs) — this
   is the outer app-level navigation layer, genuinely new scope. Needs its
   own look at monster-forge's Forge/Bestiary/Adventures/Combat rail pattern
   for _this_ layer specifically.
7. **Variant chip contrast** — confirmed and fixed today:
   `.variant-chip.is-active` (`app/appShell.css`) set `color: var(--ink-primary)`
   (near-white) on `background: var(--accent-soft)` (a light lavender) — two
   light colors, poor contrast. `--ink-on-accent` exists in `tokens.css`
   specifically for text-on-light-accent-fill and wasn't being used here.
   Now fixed. The _inactive_ chip's dim-on-dark pairing is the same
   `--ink-secondary`-on-`--surface-raised` combo used as the app's standard
   secondary-text convention everywhere else — if that reads as low-contrast
   too, it's an app-wide token question, not a one-off fix; flagged for T25
   rather than changed unilaterally (would touch every secondary-text
   instance in the app).
8. **Cramped line spacing** — not independently verified line-by-line (no
   single root cause found); filed to T25 as a targeted pass rather than a
   guessed global `line-height` bump, since over-correcting risks breaking
   the sheet's intentionally dense, printed-sheet feel.
9. **Gear section a mess** — `equipment.css` itself is actually well-tokenized
   (correct micro-label usage, consistent chrome tokens); the "mess" reads as
   a density/visual-rhythm problem (many near-identical gray
   `surface-overlay` cards stacked with checkbox+qty+weight+cost all inline)
   rather than a code-hygiene one. Needs an actual layout pass, not a token
   fix — filed to T25.
10. **Font sizes a mess** — confirmed: 20 hardcoded `font-size` values (not
    token references) across 10 files — `1.5rem`, `1.25rem`, `1.1rem`,
    `1.05rem`, `0.85em`, `1rem`, etc. Root cause: the type scale
    (`--font-size-chrome/sm/md` in `tokens.css`) only covers three small
    sizes — nothing for headings or big stat numbers — so every view invents
    its own value for anything larger. Real fix is extending the token scale
    (e.g. `--font-size-lg`/`--font-size-xl`), then migrating the 20 call
    sites onto it — filed to T25, not done as a quick win (touches too many
    files to do safely without a dedicated pass).

Fixed today (trivial, same-session): #7 (variant-chip contrast →
`--ink-on-accent`); a leftover duplicate `:focus-visible` override in
`equipment.css` found while investigating #9 (dead code once D22's global
rule landed — removed).
Enforced by: prose only; #1–#6, #8–#10 are new T25 deliverables/acceptance
items; #3 needs a Francesco call before scoping (data vs. UI fix).
Affects: `planning/tasks/T25-ux-skeleton.md` (data folder, expanded),
`app/src/app/appShell.css`, `app/src/views/Equipment/equipment.css` (both
fixed today).
