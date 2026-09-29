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

**Implemented 2026-08-24 (T25 #1):** `.bottom-tab-bar`/`.bottom-tab` added
to `appShell.css`; a new `<nav>` in `AppShell.tsx` renders alongside the
existing `.app-shell__tabs`, sharing the same `tabs`/`tab`/`setTab` state —
one source of truth, CSS `display:none` swaps which renders at the
≤768px breakpoint (`.app-shell__tabs` matches every other mobile
breakpoint already used in this file). Fixed to the viewport bottom (not
sticky) per D18's own rationale — "always visible" means it shouldn't
scroll away. `.app-shell__view` gained a bottom `padding-bottom` so content
never sits under the fixed bar; verified at 375px (bar clears the last
Equipment card) and 1280px (bar absent, top tabs unchanged,
`display:none`/`flex` confirmed via computed styles).

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

**T25 acceptance spot-check (2026-08-24):** grepped every `background:
var(--surface-raised)` + `border: 1px solid var(--border-subtle)` pair
outside `primitives.css`. Found two more real duplicates of `.panel`'s
exact recipe: `.identity` (`views/MainSheet/mainSheet.css`, the character
name/classes header) and `.casting-header` (`views/Spells/spells.css`,
per-source spell-DC header) — both now share the surface via
`primitives.css`, same technique as `.feature-section`/`.companion-identity`
above. Screenshot-verified unchanged. `manage.css`'s `.cf-card` reviewed and
left alone — `--radius-lg` (not `-md`) plus an `overflow:hidden` media-card
structure `.panel` doesn't support: a genuinely different role, not a
duplicate. Buttons/toggles sharing the same two tokens (`.shell-btn`,
`.variant-chip`, `.view-toggle`, `.pwa-toast__btn`, `.manage-toggle`) are a
control skin, not the SectionCard role `.panel` covers — already handled
by D25's button taxonomy.

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

**Implemented 2026-08-24 (T25 #3):** `.field-label` added to
`components/primitives.css`. Consolidated 6 independent copies of the
recipe onto it — the sheet's `.stat__label`/`.chassis-item__label`/
`.defenses__label`/`.senses__label` (already-correct duplicates) plus the
dialogs' `.add-preview__label`/`.mng-field__label`/`.mng-change__label`
(also already-correct duplicates) and `.add-field__label` (the one
genuinely wrong, non-uppercase voice this decision targeted). Checked
Spells'/Equipment's manage-mode flows too (named in the original task text)
— found no bold-label violation there, already `.panel__title`-correct.
The open legibility concern is resolved: screenshot-verified at 375px in
the live Add dialog, clearly legible.

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

**Implemented 2026-08-24 (T25 #2/#7):** picked `lucide-react` (the more
widely adopted of the two options, actively maintained, consistent 24×24
outline grid). `npm run build` confirms real bundling — 79 precache entries
(was 75 before T17), no external font/CDN request. Five nav icons for the
bottom tab bar: `LayoutDashboard` (Main), `Sparkles` (Features), `BookOpen`
(Spells), `Backpack` (Equipment), `PawPrint` (Companion). `RecoverIcon`
(D23 #7) converted to `Sun`/`Moon`/`Sunrise` — a clean semantic swap, same
`--chip-fg` color-var convention as every other chip, snapshot test updated.
`DiceStateIcon` (the bespoke d20+chevron advantage/disadvantage glyph)
deliberately **not** converted — no library icon matches it, and D21's own
text says not to force a swap that isn't clean.

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

   **Implemented 2026-08-24 (T25 #9), minimum bar only:** `SavesBlock` moved
   from `.main-sheet__rail` into `.main-sheet__col--detail`, directly before
   `SkillsBlock` — the two are now adjacent (touching, no panel between)
   on both desktop and mobile. Screenshot-verified at 1280px and 375px.
   Deliberately **not** attempted: the full combined-table merge (one panel,
   ability+save+skill as a single element) monster-forge's precedent shows
   — that's a real layout redesign of two components into one, which the
   task itself frames as optional ("consider... if that reads better once
   mocked up"), not the stated minimum. Left for a future pass with an
   actual mockup, not guessed here.

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

   **Implemented 2026-08-24 (T25 #14):** each gear card split into two
   rows — `.gear-item__row--main` (name/qty/attuned, the identity line) and
   `.gear-item__row--meta` (Equipped/Carried toggles left, weight/cost
   right via `margin-left: auto` on `.gear-item__stats`), separated by a
   subtle hairline. Weight/cost now land at the same right edge on every
   card in a section instead of trailing wherever they fell in one wrapping
   row — the actual "no column alignment" complaint. Tokens untouched (the
   file was already correct); screenshot-verified at 1280px and 375px, 44px
   toggle targets unchanged.

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

### D24 — Second Wind non-tappable (T25 #3/#8): data fix, not a UI change · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 1 round
Raw note: (selected) "Data fix only"
Options: A both — UI degrades gracefully when `ref` is missing, and the
fixture's missing ref is separately flagged as a data gap / B UI fix only —
every feature tappable regardless of `ref` / C data fix only — `ProgressionRow`'s
ref-gated tappability is correct as-is; Second Wind should simply have a `ref`
Chosen: C — `ProgressionRow.tsx`'s current behavior (tappable only when
`item.ref` is set) is correct and stays unchanged. Second Wind's missing ref
is a compile-pipeline/data-completeness gap, not a T25 UI deliverable.
Rejected A and B — no UI change wanted; this is entirely a data-side fix.
Enforced by: prose only. Not a code change in this repo — the fix is adding
`item.ref` to Second Wind wherever it's compiled (fixture and/or real
character data in the local data folder), owned by compile/kb-audit, not T25.
Affects: removes item #8/#3 from T25's open engineering scope (acceptance
box satisfied by this scoping call, no code change here); the actual data
fix belongs to a future compile/kb-audit pass in
`~/Documents/D&D/D&D Character Builder`, not this repo.

### D25 — Button taxonomy scope: unify dialog actions + rest-btn radius, leave segmented controls alone · 2026-08-24 · DECIDED

Mechanism: engineering judgment call while executing T25 #6 (D23 finding #1),
not an AskUserQuestion round — scoped narrow enough to fall inside T25's
existing mandate, not a new design direction.
Chosen: added `.btn`/`.btn--primary`/`.btn--ghost`/`.btn--danger` +
`.btn-icon` to `components/primitives.css` (radius always pill for `.btn`,
always sm for `.btn-icon` — never a coin flip again). Migrated the two
dialog-action-button families onto it: `.mng-btn*` (Manage/Import dialogs)
and `.add-btn*` (Add dialog) were near-duplicate CSS already (confirmed by
the T25 survey) with one real inconsistency — `.add-btn` used
`--radius-md` while `.mng-btn` used `--radius-pill` for the identical role,
and `.add-btn` was sized larger (2.75rem/700-weight) than `.mng-btn`
(2.25rem/600-weight) for no stated reason. Standardized both on `.btn`'s
default (smaller, matching `.mng-btn`'s prior size) rather than the larger
`.add-btn` size — Francesco's own audit note was "buttons... too big
sometimes," so the fix goes toward the smaller size, not the larger one.
Also fixed: `.add-btn--ghost` was referenced in `AddDialog.tsx` with **no
matching CSS rule at all** (a silent no-op — the Cancel button rendered as
plain `.add-btn`, never actually "ghost") — now genuinely styled via
`.btn--ghost`. Also re-radiused `.rest-btn` (sm → pill) as the one other
clear "standalone labeled action button" outlier found in the survey.
Left alone (not migrated): `shell-btn`, `view-toggle__btn`, `variant-chip`,
`app-shell__back`, `companion-switcher__btn`, `app-tab`, `add-kind`,
`add-recover__btn`, `addition-btn` — these are segmented-group members (a
tab strip, a Level/Build toggle, an Item/Boon/Note picker) or compact inline
row controls, a genuinely different component role from a standalone
action button, and all already use pill or sm consistently with the stated
rule. The chip/badge sm-vs-pill mix (`ability-chip`/`level-badge` = sm,
`save-badge`/`condition-chip` = pill) is a **separate** system (§5's
anti-sprawl checklist, D23 item #5) — explicitly deferred there, not
touched here.
Rejected: migrating every pill-radius control onto `.btn` regardless of
role — would blur tabs/toggles into looking like action buttons, which
D16's own framing ("guidelines + quick wins, not a full redo") argues
against, and no mockup/sign-off exists for changing tab/toggle appearance.
Enforced by: `.btn`/`.btn-icon` in `components/primitives.css`; `verify`
green (220 tests), screenshot-verified live (Manage dialog Save/Delete/Keep,
Add dialog Cancel/Add, both dialog close buttons).
Affects: `app/src/components/primitives.css` (new), `app/src/manage/
manage.css`, `app/src/manage/{CharacterList,ManageDialog,ImportDialog}.tsx`,
`app/src/session/additions/additions.css`, `app/src/session/additions/
AddDialog.tsx`, `app/src/views/MainSheet/mainSheet.css` (`.rest-btn` only).

### D26 — Modal base scope: merge Manage/Import + Add dialogs, leave the library popover distinct · 2026-08-24 · DECIDED

Mechanism: engineering judgment call while executing T25 #4, not an
AskUserQuestion round — same kind of call as D25, narrow enough to fall
inside T25's existing mandate.
Chosen: added `.modal-overlay`/`.modal-surface`/`.modal-surface--wide` to
`components/primitives.css`. `.mng-overlay`/`.mng-dialog` (Manage/Import) and
`.add-overlay`/`.add-sheet` (Add) were already byte-identical CSS in two
files (confirmed by the T25 survey) — a clean D19 violation, merged onto the
shared primitive with no visual change on desktop. One real behavior change:
the Manage/Import dialogs previously stayed a centered card on mobile while
the Add dialog became a bottom sheet; both now get the bottom-sheet
treatment, converging on the already-proven pattern rather than the
lesser-tested one. Screenshot-verified at 375px and desktop width.
Left distinct (not merged): the library's own popover/bottom-sheet
(`library/library.css` — `.lib-overlay`/`.lib-scrim`/`.lib-surface`/
`.lib-popover`/`.lib-sheet`). It's a different component role — an anchored
popover on desktop (not centered), an invisible scrim except on mobile, a
higher z-index (1000 vs 100, so it can sit above an open modal), and its own
drag-grabber affordance — not a drop-in match for a centered confirmation
dialog. Forcing it onto `.modal-surface` would mean either losing the
anchored-popover behavior or bolting exceptions onto the shared class,
which defeats the point of sharing it.
Rejected: forcing all three into one literal class (what the original T25
item #4 text suggested, "consumed by all three") — monster-forge's own
stated precedent (DESIGN-SYSTEM.md §2) is a shared _surface recipe_
(background/border/radius/shadow) across `.menu`/`.popover`/`.modal`, not
one undifferentiated class; the library's popover is closer to
monster-forge's `.popover` role, the Manage/Import/Add dialogs to its
`.modal` role. Flagging this for Francesco to override if he wants full
convergence — it's a scope call, not a closed question.
Enforced by: `.modal-overlay`/`.modal-surface` in `components/primitives.css`;
`verify` green (220 tests); screenshot-verified live (Manage dialog now a
bottom sheet on mobile, unchanged centered card on desktop).
Affects: `app/src/components/primitives.css` (new), `app/src/manage/
manage.css`, `app/src/manage/{ManageDialog,ImportDialog}.tsx`,
`app/src/session/additions/additions.css`, `app/src/session/additions/
AddDialog.tsx`. `app/src/library/library.css` untouched — deliberately.

### D27 — Top-bar consolidation shape: overflow menu · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 1 round
Raw note: (selected) "Overflow menu (recommended)"
Options: A overflow menu (a single "⋯"/settings button opens a small
dropdown with Export session, Level/Build toggle, and the variant
switcher) / B settings drawer (gear icon → slide-over/bottom-sheet panel,
same controls, more spacious) / C something else
Chosen: A — lowest footprint, familiar pattern, collapses the topbar to
one row (back+name … +Add, settings button) instead of 2–3.
Rejected B — more chrome than 3 short controls need. C not elaborated —
A was picked directly.
Enforced by: prose only; implementation in T25.
Affects: `app/src/app/AppShell.tsx`, `app/src/app/appShell.css`. `+ Add`
stays outside the menu (primary, frequent action); Export session,
Level/Build toggle, and the variant switcher move inside.

**Implemented 2026-08-24:** `ShellMenu` (`AppShell.tsx`) — a "⚙ Settings"
`.btn-icon` trigger opens `.shell-menu__panel`, reusing `.panel` for the
surface (D19, no new recipe) with a click-outside + Escape handler.
Collapses what was topbar row 1 (back+name / Add+Export+Level·Build) + a
separate variant-chip row into **one** row on desktop (back+name … +Add,
⚙) and two on mobile (down from what would otherwise be three). Bug found
and fixed during verification: the panel was first anchored `right: 0`
relative to `.shell-menu` (the narrow trigger wrapper) — on a phone, where
the topbar wraps to two rows and the trigger sits mid-width rather than at
the screen edge, the panel overflowed off the left of the viewport.
Fixed by making `.app-shell__topbar` (the full-width row) the positioning
context instead, so the panel's right edge always lines up with the
topbar's own content edge. Screenshot-verified at 1280px and 375px
(open/closed, view-toggle click keeps the menu open, variant-select and
Export close it, outside-click and Escape both close it).

### D28 — Macro nav (character list ↔ sheet): deferred, not part of T25 · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 1 round
Raw note: (selected) "Leave it as-is for now"
Options: A persistent list rail on desktop only (mobile unchanged) / B a
quick-switch dropdown in the topbar, both platforms / C leave it as-is,
revisit later
Chosen: C — the flat list + full-replace flow isn't broken enough to
prioritize right now. D23 finding #11 stays open, not closed as "won't
fix" — it can resurface as its own task later.
Enforced by: prose only.
Affects: `planning/tasks/T25-ux-skeleton.md` (#11 marked deferred, not
done); no code changed.

---

## T26 — post-T25 design interview (D23 items #9/#11/#13, reopened 2026-08-24)

Francesco asked to keep going on T25's leftover items via a real back-and-forth
(in-chat mockups + AskUserQuestion rounds, several iterations each) rather than
close them out at the T25-minimum bar. What came out of it grew past the
original three items into a genuine redesign of the ability/save/skill area —
tracked as its own task, `planning/tasks/T26-check-rows.md`.

### D29 — Line spacing: `--line-height-prose` token, value 1.4 · 2026-08-24 · DECIDED

Mechanism: investigation (no line-height was set anywhere in the app —
every wrapping description fell back to the browser/Inter default of
~1.19–1.2, measured directly: a 100px-wide clone of `.rider` rendered at
~15.5px per line against a 13px font) + AskUserQuestion, 1 round, with an
in-chat mockup (three real sheet lines at 1.2/1.4/1.55).
Raw note: "1.4, however the most meaningful test is with an inline chip, to
make sure it doesn't encroach on the nearest lines."
Options: 1.4 (recommended) / 1.55 / skip it entirely.
Chosen: 1.4. Verified live (not just the mockup) against the actual
concern: `.attack__riders .rider` at 375px wraps "Riposte on parry deal
**1d4** extra with your longsword" to two lines with an inline
`DamageText` chip mid-line-1, and the Shortbow rider wraps around an
inline condition chip — both screenshot-verified with clean line
separation, no encroachment.
Rejected 1.55 — Francesco's own earlier framing (T25) was "don't undo the
sheet's dense, printed-sheet feel"; 1.4 already fixed the complaint without
drifting toward article-spacing. Rejected "skip it" — the browser default
is objectively tight for multi-line prose, confirmed by measurement, not
just a subjective read.
Enforced by: one token in `tokens.css`, applied to the ~15 selectors that
render wrapping secondary prose (feature/spell/gear/mastery/attunement/
capacity summaries and notes, attack riders, session notes, the add-dialog
preview, and the new `.check-row__note`). Single-line labels, headers, and
buttons are untouched — the browser default still applies there.
Affects: `app/src/tokens/tokens.css`; `app/src/views/{MainSheet,Features,
Spells,Equipment}/*.css`; `app/src/session/additions/additions.css`.

### D30 — Saves/Skills/Abilities: shared row anatomy, saves move next to the rail · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 5 rounds across the interview, each with an
in-chat mockup (chip-field vs. uniform rows; ability+save merge options A/B;
revised row anatomy; row-anatomy confirmation; save-row placement).
Raw notes (verbatim, in order):

1. "saves could be embedded not with skills, but with their stats" (reframed
   the original T25 D23#9 "merge saves+skills" direction toward "merge
   saves+abilities" instead, matching monster-forge's actual
   `sbAbilityTableHTML` precedent more literally).
2. "skills should follow the monster-forge design convention and be chips
   with a background color tied to their most tied ability."
3. "Skills should be rows of same size, not a chipfield, with only the name
   in chip bg and the number outside right aligned. There could be a
   collapsed dropdown on skills with notes that when opened shows the note.
   However, flat bonuses are included in the number, adv. is shown directly
   in row as well as always on bonus dice."
4. "place the dropdown indicator inside the name chip after the name,
   clicking the name chip opens it; expertise should be marked differently
   in the proficiency indicator and should not be featured as a note (only
   with the inspector later); for adv/disadv., use the chip with text from
   monster-forge." Verified against monster-forge's actual source
   (`engine.js` `rlPartsHTML`/`.rl-advlbl`, `styles.css:753-755`): a small
   bordered text badge ("ADV"/"DIS", `color`/`border-color: var(--ok)`/
   `var(--bad)`), not an icon — a different, new row-level context from the
   existing icon-based `AdvBadge`/`DisBadge` (those stay as-is, used only
   for inline `{adv}`/`{dis}` prose tokens).
5. "Yes, matches" (row anatomy confirmed) / "Separate compact save list,
   next to the rail" (once a mockup showed a full save row — dot + edge
   badge + note chevron — was tight inside the small ability card).
   Options considered: ability+save merge — (A) augment the existing big
   ability cards with a 4th save line [chosen initially] vs. (B) replace them
   with monster-forge's literal compact 2-column table. Save-row home, after
   (A) proved cramped — keep inside the cards vs. (C) a separate compact list
   next to the rail [chosen].
   Chosen: the existing 6 ability cards stay exactly as they were (score/mod
   only, D18-era design, not touched) — merging saves in didn't survive
   contact with the fuller row anatomy the notes/badges needed. `SavesBlock`
   instead moved from `.main-sheet__col--detail` into `.main-sheet__rail`,
   directly under `AbilityRail` — **supersedes T25 D23#9**, which had moved
   `SavesBlock` next to `SkillsBlock` in the detail column as the "minimum
   adjacency" bar. That adjacency is no longer the design; Saves and Skills
   are simply two separate, fully-featured panels now.
   Rejected: the literal monster-forge table (B) — drops the big at-a-glance
   card identity `.ability`/`AbilityRail` already has, which was never in
   question. Rejected keeping the full save row inside the ability card —
   tight even in the mockup, confirmed by Francesco directly.
   Enforced by: `CheckRow` (new, `app/src/views/MainSheet/CheckRow.tsx`) is
   the single shared implementation for both `SavesBlock` and `SkillsBlock`
   (MainSheet) and `CompanionSaves`/`CompanionSkills` (Companion) — one
   component, four consumers (D19). `.check-chip` reuses `.ability-chip`'s
   exact background/border/radius recipe (chips.css) rather than a new one.
   Screenshot-verified at 1280px and 375px on both the main sheet and the
   Companion view (Ember Sprite).
   Affects: `app/src/views/MainSheet/{Abilities,CheckRow,MainSheet,
mainSheet.css}`, `app/src/views/Companion/CompanionAbilities.tsx`.

### D31 — New schema fields: `Save`/`Skill.edge` and `.bonusDice`, structured not parsed · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 1 round.
Raw note: (selected) "New structured fields (recommended)."
Options: A new structured fields (`edge?: EdgeState`, `bonusDice?: string`)
/ B keep the schema as-is, have the UI detect a leading `{adv}`/`{dis}`/
`{dice:}` markup token in `note` and hoist it into the row.
Chosen: A. `EdgeState = 'adv' | 'adv-situational' | 'dis' | 'dis-situational'`
— explicit, no markup-parsing coupling between row rendering and
authoring convention. Both fields optional (backward compatible — no
existing character file needs to change to keep validating).
Rejected B — would make the row's visual state depend on how a compile
session happens to phrase the note's first token, fragile and implicit.
Enforced by: `schema/types.ts` (`EdgeState`, `Save`/`Skill.edge`/
`.bonusDice`) + `schema/character.schema.json` (`$defs.EdgeState`,
both properties on `Save`/`Skill`, `additionalProperties: false` means the
JSON Schema needed the explicit addition too, not just the TS type).
`npx character-forge-validate` confirmed both fixtures still pass.
Affects: `schema/types.ts`, `schema/character.schema.json`.

### D32 — Fixture completeness: all 6 saves, all 18 skills, tools proficiency · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 1 round (framed as "is the all-skills gap
compile-pipeline scope, like D24" — Francesco redirected the framing).
Raw note: "If the current schema supports it, then make sure it is shown
in the precompiled character. In general, make this character more
complete, at least at low levels, so that it renders correctly all
features."
Chosen: rejected the D24-style "out of scope, compile-pipeline only"
framing — `fixtures/synthetic.character.json` (+ its variant) is the
wholly-invented, public-repo-safe synthetic fixture (confirmed via
`app/src/character/characterFile.ts`'s own header comment), not a real
character file bound by the data-folder IP guardrail, so completing it is
squarely in this repo's scope. Previously: 3 of 6 saves present (DEX/WIS/
CHA silently missing — `SavesBlock` rendered nothing for them, not even a
"+0, not proficient" row), 2 of 18 skills present. Now: all 6 saves and all
18 skills, computed from the character's actual ability mods + PB, plus one
worked example each of `edge` (situational) and `bonusDice` on both a save
(DEX/CON) and a skill (Perception/Athletics) so the new UI states have
something real to render. `npx character-forge-validate` passes both
files; `npm run verify` green (220/41/50 tests, no count-specific
assertions broken).
Enforced by: the fixture files themselves + the validator CLI.
Affects: `fixtures/synthetic.character.json`, `fixtures/
synthetic-variant.character.json`.

### D33 — Macro nav direction confirmed: desktop rail; implementation still deferred · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 1 round, in-chat mockup (3 options: current
full-replace / desktop rail / quick-switch dropdown).
Raw note: "Desktop rail, plan for later."
Chosen: **supersedes D28** — D28's "leave it as-is for now" is no longer
the state; a direction is now picked (a persistent, collapsible character-
list rail beside the open sheet, desktop only — mobile stays full-replace).
"Plan for later" means the direction is locked but implementation is still
not part of this pass — filed to `T26` as an explicitly-scoped, not-yet-
built deliverable, so a future session doesn't have to re-litigate the
direction.
Enforced by: prose only; no code changed.
Affects: `planning/tasks/T26-check-rows.md`.

### D34 — Backlog, explicitly not built now: reminders-pinning, full inspect tool · 2026-08-24 · DECIDED

Mechanism: direct feedback in chat, not an AskUserQuestion round — Francesco
flagged both while scoping the check-row redesign, explicitly as future
work ("let's plan for later"), not as part of this pass.
Raw note: "for these sections but also others, there could be a space
where you can pin auto generated reminders (ex. for skills, one could pin
Guidance if available as spell, or Second Wind upgrade, choosing from a
precompiled list of features you have access to). You could also not
choose something, like Enlarge/Reduce adv. on STR saves/checks is
situational... let's plan for later an inspect tool similar to the one in
monster-forge... inspecting a skill should give you a custom tooltip that
includes how the score is made (ex. PB + INT) and from where you got the
proficiency."
Chosen: both logged as named backlog items, not built:

- **Reminders-pinning**: a per-row (skill/save, "but also others") optional
  pin surfacing a relevant situational feature/spell from a precompiled
  list the player chooses from (or declines) — e.g. pinning "Guidance" to
  a skill, or a conditional ASI note to a save. Needs its own design pass
  (what "precompiled list" is generated from, where the pin UI lives).
- **Inspect tool**: a monster-forge-style breakdown tooltip (score
  composition — PB + ability, proficiency source) for any check-row,
  eventually replacing today's plain collapsible note. Explicitly named as
  the reason expertise doesn't get a note in the meantime (D30) — that
  breakdown belongs here, not bolted onto the interim note mechanism.
  Enforced by: prose only — named here so neither gets silently re-proposed
  or built ad hoc inside a future, unrelated task.
  Affects: `planning/tasks/T26-check-rows.md` (backlog section).

### D35 — Tools shown once, in Skills only · 2026-08-24 · DECIDED

Mechanism: direct feedback in chat — Francesco caught, from the T26
screenshots, that "Tools" rendered in both the new Skills panel chip row
and the existing Senses & Proficiencies flat list (same data,
`stats.proficiencies.tools`, two places).
Chosen: removed from `SensesBlock` (`views/MainSheet/Defenses.tsx`) —
Senses & Proficiencies keeps Senses/Languages/Armor/Weapons, a flat
reference list of things that don't get a roll. Tools stays exclusively in
the Skills panel, where they got a check-shaped role in T26 (proficient
tools as chips below a divider) — the same reasoning that put them next to
Skills in the first place (a tool proficiency is closer to "something you
roll for" than to armor/weapon permissions, which never get a check).
`hasProf` (the panel's own visibility gate) updated to stop counting tools,
so a character with only tool proficiency and no armor/weapons doesn't
render an empty Senses & Proficiencies panel.
Enforced by: `verify` green; screenshot-verified live — "Tools" now
appears exactly once.
Affects: `app/src/views/MainSheet/Defenses.tsx`.

### D36 — 2014 entries with no 2024 reprint are allowed, per entry · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion during the T22 Shigen cold run, plus a standing
policy Francesco volunteered in the same answer.
Raw note: "In general, I may want to use 2014 spells that haven't been
reprinted." (selected alongside) "Approve Borrowed Knowledge as 2014
cross-edition."
Chosen: a 2024 build may draw on a **2014 entry that was never reprinted for
2024**, as a per-entry, explicitly-recorded decision — the entry names its
edition and the chassis doc's `sources` must list it. This does not loosen
the edition rule (`pipeline/interview.md` §2, scope §2.7): entries that exist
in _both_ editions still take the build's default edition, and mixing is never
silent. It narrows the common case — "no 2024 version exists" — from a
question that must be asked every time into a policy that only needs
recording.
First application: **Borrowed Knowledge** (`2014/SCC`) in Shigen's prepared
pool, listed in his frontmatter `sources`.
Rejected: dropping the spell for a 2024 replacement — would lose build intent
to a bookkeeping rule, when the 2024 corpus simply has no equivalent.
Enforced by: the chassis doc's `sources` allow-list + the compiler's edition
filter; recorded per character in `*.compile-notes.md`.
Affects: `Characters/shigen.chassis.md`, `Characters/shigen.compile-notes.md`;
future interview sessions.

### D37 — Where the paper sheet contradicts itself, the compiled value wins · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 2 rounds, during the T22 Shigen cold run —
Francesco chose "compile correct, but ask me per discrepancy", then confirmed
each of the five individually.
Raw note: (round 1) "Compile correct, but ask me per discrepancy." (round 2,
all five confirmed stale) "CHA save +3 → +4 / Deception +3 → +4, Performance
+3 → +4 / Spell attack +5 → +7 / Save DC 13 → 15."
Chosen: the compiler emits the **correct** derived value and records the
paper's value as evidence, rather than reproducing a stale field for fidelity's
sake. Shigen's sheet had five fields left over from before Potent Dragonmark
raised CHA 17 → 18; the sheet also contradicts _itself_ (p.1's save-DC badge
reads 15, p.4's casting bar reads 13). **The confirmation is per discrepancy,
not a blanket rule** — a difference could be a house rule, and only Francesco
can tell staleness from intent.
This is the concrete evidence for scope §14.1 (single source of truth): the
app's whole value over paper is that a derived number cannot go stale in one
place while staying right in another.
Rejected: compiling the paper values verbatim — would import the exact defect
the project exists to remove. Rejected a blanket "always silently correct"
rule — it would quietly overwrite deliberate house rules.
Enforced by: `Characters/shigen.compile-notes.md` (the discrepancy table +
evidence); the chassis doc's own Discrepancies section.
Affects: `pipeline/compile.md` §13/§15 practice; future compile sessions.

### D38 — Monster-forge typography/link audit: base size, link color, underline · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 1 round, after a source-verified audit (same
discipline as D30) rather than guessing at the complaint.
Raw note: "the font use, size and overall UI isn't aligned with monster-
forge... everything doesn't seem to follow the correct sizes... the blue
highlight should be removed from links like in monster-forge... everything
seems blue and underlined, it's visually oppressive." Root causes found, not
assumed: `body` never sets a base `font-size` (falls back to the browser's
16px instead of the token system's own `--font-size-md`, 14px — also
monster-forge's exact base, so the whole rem-scale was silently inflated);
`.ref-link` hardcodes `color: var(--ability-dex)` (DEX's blue) for every
`{ref:}` link regardless of what it links to — the only place that variable
leaks outside the ability system, and since refs appear on nearly every
spell/feature/item name, the sole source of "everything is blue"; underline
is always-on (`underline dotted`) vs. monster-forge's no-underline-default +
hover-only.
Chosen: `body { font-size: var(--font-size-md) }`. `.ref-link` color
follow-up in D39-adjacent round: "make it base text color by default, we'll
later map certain terms and type of rules to colors like we did for example
with spells and conditions in monster-forge" — resolved to `color: inherit`
(not a fixed `--ink-primary`, since the actual surrounding summary text is
`--ink-secondary` in every container checked — `inherit` matches exactly,
in every context, without hardcoding a value that only happens to be right
in one place). Underline: "Keep some always-on affordance" — explicitly
rejected hover-only once color stopped being the tap signal; kept the
existing `underline dotted` treatment unchanged (no redesign requested
beyond removing the color).
Rejected: literally copying monster-forge's link color (terracotta,
`--accent`) — stays off-limits per the existing "never terracotta" rule
(planning/tasks/README.md Rev. 3). Hover-only underline — rejected directly.
Per-ref-type semantic coloring (spell school, damage type, etc. on ref
links themselves) — explicitly named as **future** scope, not this task;
today's color removal is a prerequisite for it, not a substitute.
Enforced by: `app/src/app/appShell.css` (`body` font-size),
`app/src/components/chips/chips.css` (`.ref-link` color). Not yet built —
filed to T27.
Affects: `app/src/app/appShell.css`, `app/src/components/chips/chips.css`.

### D39 — Check-row density: dividers removed, tap target 44px → 36px · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 2 rounds.
Raw note: "remove the dividers between skills and saves in their section,
everything could be more compact."
Chosen: remove `.check-row`'s `border-bottom` outright (zero-cost — pure
declutter, doesn't touch spacing or tap targets). Row height is set by
`.check-row__main`'s `min-height: 44px` (the iOS touch-target minimum, not
padding — padding is already `--space-1`, 4px) — flagged as a real
trade-off, not a free compaction, before Francesco chose it: "Yes — shrink
it, e.g. to 36px."
Rejected: lightening the divider instead of removing it — superseded by the
direct "remove them" answer. Keeping 44px — offered as the safe default,
not chosen; density won over the touch-target margin.
Enforced by: `app/src/views/MainSheet/mainSheet.css` (`.check-row`,
`.check-row__main`). Not yet built — filed to T27.
Affects: `app/src/views/MainSheet/mainSheet.css`.
Note: **needs a real on-device tap-accuracy check before this is considered
done** — 36px is below Apple's HIG minimum; verify it doesn't cause mis-taps
at the table, not just a visual pass at 375px in the browser preview.

### D40 — Passive scores: compact tile, inline expand, moved to a new Senses card · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion + in-chat mockup, 4 rounds (two rounds just on
tile style, iterated live).
Raw note: "the passive scores should be displayed differently, perhaps
boxes, and by default should only be perception (the other skills could
still be added through some nested setting)." Style narrowed across
mockups: rejected the ability-card-bordered style ("issue with this tile
style is figuring out how it looks as a lone tile... draft a mockup with
how it would look" → shown next to the ability rail → "compact tinted
tile, but it shouldn't be with the ability scores but either with skills or
senses. The + button should be a ghost tile in size and the + centered").
Placement resolved in the same round: "Senses, separate proficiencies in
its own card."
Chosen: **B** — the compact tinted tile (background wash of the ability
color, no border), matching the bonus-dice-pill's visual weight rather than
the ability card's. The expand control is a ghost tile the same size as the
passive tile itself, dashed border, centered "+" — not a small separate
icon button. Default: Perception only; Investigation/Insight sit behind the
ghost tile, inline (no settings-menu round-trip — rejected explicitly by
choosing "inline" over the ShellMenu option in the prior round). **Senses &
Proficiencies splits into two cards** — a new "Senses" card (Darkvision
etc. + the passive tiles) and a separate "Proficiencies" card (armor/
weapons/languages) — a bigger structural change than originally scoped,
volunteered directly rather than asked for.
Rejected: style A (ability-card bordered) — confirmed orphaned/mismatched
once shown in context next to the heavier-bordered ability row. Settings-
menu location for the expand toggle — inline won on discoverability.
Keeping the combined Senses & Proficiencies panel — split explicitly
requested.
Enforced by: not yet built — filed to T27. Will touch
`app/src/views/MainSheet/Abilities.tsx` (`SkillsBlock`'s passives block
moves out), `app/src/views/MainSheet/Defenses.tsx` (splits into two
components).
Affects: `app/src/views/MainSheet/Abilities.tsx`,
`app/src/views/MainSheet/Defenses.tsx`, `mainSheet.css`.

### D41 — Tools stay PB-only (matching monster-forge), but show bonusDice/edge · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 1 round, after checking monster-forge's actual
source (same discipline as D30/D38).
Raw note: "tools should have the same treatment of skills, with their +x
explicit and in this case the character also has 1d4." Monster-forge's
actual convention, found on inspection: tool rolls are **PB-only** (`engine.js`
"tool = 1d20 + PB (ability is DM's choice, so PB only)"), and it carries an
official 2024 XPHB ch.6 ability-per-tool table (`data.js` `TOOL_ABIL` — e.g.
Woodcarver's Tools → DEX) for reference, not for computing a baked-in
modifier. Surfaced to Francesco as a real divergence from his literal ask
before proceeding.
Chosen: "ignore the bonus modifier, but make sure to indicate any bonuses
such as +1d4 or adv" — tools render PB-only (no ability folded in, matching
monster-forge exactly), but the row must still surface `bonusDice`/`edge`
when the character has them (Shigen's Woodcarver's Tools: PB +3, with a
+1d4 badge from Mark of Making's Artisan's Intuition, which the current
compile — wrongly — only applied to Arcana). Tool-ability source: "Adopt
the same XPHB table" — the same rules-accurate source monster-forge already
uses, kept for future reference/inspect-tool use, not for the displayed
number.
Rejected: full ability+PB modifier (Francesco's literal original phrasing)
— once the monster-forge divergence was surfaced, he chose consistency with
the sibling app over the literal "like skills" framing. Compiler-decided
per-build ability overrides — no case for it yet; the XPHB table is
authoritative unless a future build gives a concrete reason otherwise.
Enforced by: schema needs a structured tool-proficiency type (today
`proficiencies.tools` is a flat `string[]`, carries no `bonusDice`/`edge`) —
not yet built, filed to T27. Also a **compile bug to fix**: Shigen's
Woodcarver's Tools should carry Mark of Making's +1d4 (Artisan's Intuition
applies to "an ability check using Artisan's Tools" generally, not just
Arcana) — currently missing from `Characters/shigen.character.json`.
Affects: `schema/types.ts`, `schema/character.schema.json`,
`app/src/views/MainSheet/Abilities.tsx` (tool-chip rendering),
`Characters/shigen.character.json` (compile fix, separate from the schema
change).

### D42 — Identity header: responsive name/class line + meta.concept field · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion + in-chat mockup, 3 rounds, iterated live.
Raw note: "the main character info in main should be attached to the
character name on the very top, partly inline and partly that appear on
tooltip clicking the name." Refined across mockups to: "if enough space,
put it inline with the name, otherwise move it one row below; the chip
should have rounded corners square shape, not pill; the tooltip should
include a very short summary of the character build concept and backstory."
Chosen: name stays the header's headline. A single subtle chip beneath (or,
space permitting, inline beside) it reads "`<species> · <class 1> <level>
/ <class 2> <level>`" (e.g. "Human · Fighter 1 / Warlock 5") — square
corners (`--radius-sm`/`--radius-md`, not a pill), not multiple separate
badges. Clicking it opens a tooltip: species, background, each class's
subclass + unlock level, **and a short build-concept/backstory summary**.
The concept summary needs a **new schema field** (`meta.concept` or
similar) — nothing today carries chassis-doc Concept prose past compile
time (`Meta` only has name/player/characterId/variantLabel/portrait/
timestamps). Per this project's own convention (mechanics English,
roleplay/backstory may be Italian — CLAUDE.md), the field can be non-
English. Compiled as "one or two sentences, compiler-compressed" — same
compression discipline as feature summaries, applied to flavor instead of
mechanics, not the chassis doc's full prose verbatim.
Rejected: keeping all identity info always inline (three stacked rows, the
status quo) — explicitly being replaced. A pill-shaped chip — square
corners requested directly. Verbatim full concept prose in the tooltip —
"one or two sentences" chosen over the full-paragraph option.
Enforced by: not yet built — filed to T27. New schema field needs
`schema/types.ts` + `character.schema.json` + a `pipeline/compile.md`
addition (how the compiler condenses Concept prose) + backfill for Vice and
Shigen (both currently compiled without it) and the two repo fixtures.
Affects: `app/src/views/MainSheet/IdentityStrip.tsx`, `schema/types.ts`,
`schema/character.schema.json`, `pipeline/compile.md`,
`Characters/vice.character.json`, `Characters/shigen.character.json`,
`fixtures/synthetic.character.json`, `fixtures/synthetic-variant.character.json`.

### D43 — Spellcasting: shared ability/DC/Atk tiles + collapsible source list · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion + in-chat mockup, 3 rounds, iterated live.
Raw note: "spellcasting should only show different save/attack rows if
actually different, multiple lines from different sources only add
clutter. In the spells section, there should be a part dedicated to
spellcasting ability, save and attack and not repeat it everywhere." Shigen
has 5 casting sources, all sharing CHA/DC 15/Atk +7 — `CastingHeaders.tsx`
currently repeats all three on every one of the 5 rows; Vice's 2 sources
also fully coincide, so this is the common case, not an edge case, in both
real builds compiled so far.
Chosen, after two style iterations: ability/DC/attack render as **tiles**
matching the existing AC/HP/Init/PB `.stat` treatment exactly (not a
horizontal chip row) — one shared header regardless of source count. Below
it, a collapsed row reading "N sources" expands to list each source as
**`kind · name`** only (e.g. "Class · Warlock", "Feat · Spellfire Spark",
"Subclass · Celestial Patron") — `kind` derived from the referenced
`library` entry's `type`, not a new field. Clicking a source row opens a
tooltip with that source's full prepare-rule paragraph, any other relevant
info, and the spells it grants (filtered from `spellcasting.spells[]` by
`origins[]`).
Rejected: repeating each source's DC/Atk inline even once collapsed to a
list — first draft did this and was corrected ("the right column in the
sources section is inconsistent: instead, each row only has a label and
name"). A flat header without tiles — superseded once shown next to the
existing AC/HP tiles for comparison.
Enforced by: not yet built — filed to T27. The "genuinely different DC"
case (an item-granted caster, the scenario the schema was built for but
neither Vice nor Shigen currently exercises) needs its own inline DC/Atk
chip on that one source row rather than inheriting the shared tiles —
noted for whoever builds this, not yet needed by real data.
Affects: `app/src/views/Spells/CastingHeaders.tsx`,
`app/src/views/Spells/spells.css`.

### D44 — Roll-chip arm system + inspect mode (monster-forge rule-finder pattern) · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 3 rounds (one per sub-question — arm lifecycle,
coexistence with the existing Shift/Ctrl-click convention, inspect-mode
trigger + scope).
Raw note: "by clicking on the +1dx or ADV/DISADV notes next to skills/
saves, I should be able to set the chip 'on' and apply it to the roll when
clicking on the row and generating a roll." A desktop-only placeholder
already exists (`dice/index.ts` `rollModeFromEvent` — Shift-click = adv,
Alt/Ctrl-click = dis — its own comment calls it "a lightweight ... until
per-surface adv/dis lands"); this is that landing, and it also fixes a real
gap the placeholder has: no Shift-key equivalent exists on a touch tap, so
the interim mechanism was never usable on the phone this is a PWA for.
Chosen: tapping a `-situational` edge badge or a `bonusDice` pill arms it;
**armed state persists until manually toggled off** (not auto-consumed
after one roll — "Stays armed until toggled off", against my own
recommendation, a real risk of a forgotten-on chip silently buffing a later
unrelated roll, worth building a very visible armed indicator to mitigate).
The existing Shift/Ctrl-click convention **stays, coexisting**: chip-arm
covers the build's own compiled situational bonuses, Shift/Ctrl-click stays
for ad hoc DM-granted advantage the sheet doesn't know about.
**Inspect mode**: not a per-row gesture (long-press) as I proposed, but a
**dedicated top-right toggle button**, explicitly modeled on monster-forge's
actual Rule Finder (`engine.js` — `#ruleFinderBtn`, a "?"/"✕" icon toggle,
`body.rule-finder` class, rolls suppressed while active, Escape exits):
"it works like the rule finder of monster forge, a dedicated general button
that activates it in the top right." While active, tapping any stat/check
row shows its breakdown instead of rolling it. Scope: **full** — any
stat/check row (ability scores, AC, HP, saves, skills, tools), not just
today's hidden-provenance cases — "building the trigger + a minimal popover
once ... then rebuilding it later for skills is wasted work."
Rejected: auto-consume-after-roll for armed chips — offered as the safer
default, Francesco chose persistence instead. Long-press as the inspect
trigger — superseded by the explicit rule-finder-button ask. Chip-arm
replacing Shift/Ctrl-click outright — rejected, they serve different cases.
Scoping inspect to just ability/AC/HP first — rejected in favor of full
scope up front.
Enforced by: not yet built — filed to T27, the largest item in it
(touches roll state in `dice/index.ts`/`engine.js`, a new app-wide mode
analogous to `body.rule-finder`, and a content template per field type).
Affects: `app/src/dice/index.ts`, `app/src/dice/engine.js`,
`app/src/views/MainSheet/CheckRow.tsx`, `app/src/app/AppShell.tsx` (new
top-right toggle, alongside the existing Settings gear).

---

## T27 review — D45–D56

Reviewing T27 live (rendered, uncommitted) in the browser the same session it
shipped produced another feedback batch — same pattern as D23→T25 and the
Shigen review→T27. Scoped via `/interview` (11 topics, ~10 rounds, several
with `visualize`-widget mockups iterated live) into **T28**.

### D45 — Typography: full-app audit of unsized text, not just body base · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 1 round, then a direct source comparison against
monster-forge's `styles.css` (not guessed).
Raw note: "the typography check didn't fully get it right. Monster forge
texts mostly feel smaller than this" → "Re-verify not only body base but
also labels and other titles, chips etc - all font sizes present and
comparable."
Diagnosis (found this session): T27's `body { font-size: var(--font-size-md) }`
fix (D38) was correct but incomplete. Comparing character-forge's token
usage against monster-forge's actual `styles.css` values: most sized text
already matches closely (`--font-size-chrome` 11px = monster-forge's
`.fs-title`/`.fs-sub` exactly; `--font-size-sm` 13px ≈ monster-forge's
12–13.5px row/detail text). The real gap is narrower and structural: **any
character-forge element with no explicit `font-size` rule silently inherits
the full 14px body base**, where monster-forge explicitly sizes almost every
component down instead of letting anything inherit body. Confirmed one
instance directly: `.check-row__mod` (the modifier number on every save/
skill/tool row) has no font-size rule at all. Others likely exist unaudited.
Chosen: full-app audit — grep every CSS file for text-rendering selectors
with no `font-size`, size each explicitly against its monster-forge analog
category (chrome/label ≈ 11px, secondary/detail ≈ 12–13px, primary numbers
vary by role), not a blanket token-value drop.
Rejected: just lowering `--font-size-md` further (e.g. 14px→13px) — would
"fix" the symptom everywhere text happens to inherit it, but leaves the
actual bug (unaudited components with no explicit size) unaddressed, and
would also incorrectly shrink the handful of elements that legitimately
want 14px.
Enforced by: Built in T28 — `npm run verify` green (220/41/50 tests).
Affects: every view's CSS file (audit scope is app-wide by design).

### D46 — Tools: drop the bonus number entirely, back to plain capitalized chips · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 1 round. Supersedes part of **D41** (T27,
same-day) — surfaced explicitly as a reversal before accepting, not silently
overwritten.
Raw note: "capitalize tools, remove the bonus from them."
Options offered: keep `bonusDice`/`edge` badges and drop only the flat PB
number (my recommendation) / drop all numeric info, back to pre-T27 plain
reference chips.
Chosen: the latter — tools render as plain capitalized name chips again, no
PB, no `bonusDice`/`edge` badges, no roll affordance. The `ToolProficiency`
schema type (D41: `name`/`bonusDice`/`edge`/`note`) stays as-is — this is a
rendering change, not a schema reversal; the fields just aren't displayed.
Rejected: keeping bonusDice/edge visible while dropping PB — Francesco
picked the simpler full reversal instead of the middle option.
Enforced by: Built in T28 — `npm run verify` green (220/41/50 tests).
Affects: `app/src/views/MainSheet/Abilities.tsx` (`SkillsBlock`'s tool
rendering), `app/src/views/MainSheet/CheckRow.tsx` (`ToolRow` — likely
retired back to a plain chip, no longer a `check-row`).

### D47 — Save/skill row spacing: 36px → 28px · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 1 round.
Raw note: "reduce distance between rows."
Options offered: 32px (modest, my recommendation) / 28px (tight, closer to
monster-forge's own density).
Chosen: 28px. ⚑ Same on-device tap-accuracy caveat as T27's D39 36px→28px
move already carried (this compounds it) — still owed, needs Francesco on a
phone before calling either value final.
Enforced by: Built in T28 — `npm run verify` green (220/41/50 tests).
Affects: `app/src/views/MainSheet/mainSheet.css` (`.check-row__main`
`min-height`).

### D48 — Proficiency indicator: merged dot + binary chip-fill system · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion + `visualize`-widget mockups, 5 iterated rounds
(dot-in-chip vs chip-state-only → both extended to cover expertise → two
expertise-glyph variants → a merge of the two approaches → final polish on
the merge).
Raw note: "the proficiency indicator feels wrong (feels like a clickable
check), try two options, one with an indicator inside the tag and one
without the indicator but with a different name chip state" → (after seeing
all 4 proficiency states mocked) "A - dot style, however expertise could use
some work: try a version with double slightly overlapped prof. dots and one
like the current one, but with the indicator smaller..." → "Merge this
treatment with the chip state (only two states, border for non prof. fill
for all other states)" → "Ring around the dot. However, for the filled
state use the lower opacity version you used in earlier mockups."
Chosen (final): the external `ProficiencyDot` circle is retired. Chip fill
is now binary: **not proficient** = outline-only chip (transparent
background, 1px ability-tinted border, tinted text — same treatment
mocked as "option B" for the not-proficient case); **half/proficient/
expertise** = today's existing soft-tint chip look (unchanged —
`rgba(ability, .22)` background, tinted text), not the bold solid-fill
variant tried mid-interview. A small dot leads the chip label for the three
non-none states: half = hollow ring, proficient = solid dot, expertise =
solid dot + a thin ring around it (today's actual `.prof-dot--expertise`
treatment — box-shadow gap-ring + outer ring — carried over, just scaled
down to match the new ~6px in-chip dot instead of the current standalone
0.7rem dot).
Rejected: a fully solid/opaque filled chip (dark text on full ability
color) for all non-none states — tried mid-interview, reverted in favor of
keeping today's existing soft-tint look. An "overlapped double dot" glyph
for expertise — tried, ring-around-dot (closer to today's actual treatment)
chosen instead.
Enforced by: Built in T28 — `npm run verify` green (220/41/50 tests).
`ProficiencyDot` component (`Abilities.tsx`) removed; its 4-state logic merges into `CheckChip`
(`CheckRow.tsx`).
Affects: `app/src/views/MainSheet/CheckRow.tsx` (`CheckChip`,
`ProficiencyDot` retired), `app/src/views/MainSheet/mainSheet.css`
(`.prof-dot*` rules retired/replaced), `app/src/views/MainSheet/Abilities.tsx`.

### D49 — Notes: asterisk-triggered tooltip replaces the chevron, content separates prose from source · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 2 rounds.
Raw note: "move the notes under skills and saves to tooltips instead
(replace dropdown icon with asterisk), in the tooltip tidy up the content
referencing the source feature."
Chosen: the chip's chevron-toggle-inline-note mechanism (T26) is replaced
by a small asterisk (*) trigger that opens a proper tooltip/popover (same
anchored-`.panel` recipe as `IdentityChip`) rather than an inline
expand-in-place block. Trigger is **hover on desktop, tap on touch** — a
device-adaptive interaction (mirrors the existing `useIsMobile` pattern in
`library/LibrarySurface.tsx`), chosen over "click/tap everywhere" (which
was the recommendation, for cross-device consistency) because Francesco
wanted the faster desktop hover. Content: the note's descriptive prose
renders as the main line; when the note references a source feature (a
`{ref:...}` tag, whether bare or embedded in prose), a small dim "via
<Feature Name>" byline renders underneath instead of leaving the ref as a
second nested tappable link inside the tooltip.
Rejected: click/tap-only trigger (the recommended, single-interaction-model
option) — Francesco chose hover-on-desktop instead. Just stripping the
ref-link's tappable styling without restructuring the content — rejected in
favor of the structured prose/byline split.
Enforced by: Built in T28 — `npm run verify` green (220/41/50 tests).
Affects: `app/src/views/MainSheet/CheckRow.tsx` (`CheckChip`'s note
handling), `app/src/views/MainSheet/mainSheet.css`.

### D50 — Hover/click-to-roll convention: whole-row/tile highlight, nested children override · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 2 rounds.
Raw note: "on hover, the modifiers of skills and saves should show a
rounded square bg, on click. it rolls, do it for other bonuses around the
app; show regular cursor over +1dx or ADV in this section" → (after a
narrow-to-modifier-only option was offered) "Instead of highlighting the
modifier, let's highlight the whole row (unless hovering other clickable
elements such as ADV)" → (scoping which other surfaces) "If the number is
in a tile, the whole tile highlights" + all 4 offered surfaces confirmed.
Chosen: `.rollable` (today has `cursor:pointer` only, no hover feedback at
all — confirmed by reading `dice/dice.css`) gets a rounded-square hover
background app-wide. The roll click-target stays exactly where it is today
(the whole check-row, the whole ability tile, etc.) — not narrowed to just
the number — so the highlight covers the same area as the click target.
Nested interactive children (the arm-toggle edge/bonus-dice badges, the new
asterisk tooltip trigger) get their own distinct hover state that overrides
the parent row's highlight while directly hovered — confirmed those badges
already show a plain pointer cursor today (no `.rollable`/`.inspectable`
class on them), matching the "regular cursor over +1dx/ADV" ask with no
further change needed. Scope confirmed for the same treatment: ability
score modifiers, initiative, attack to-hit numbers, inline damage/dice in
feature & spell summaries (`DamageText`) — all already click-to-roll today,
just missing the hover cue.
Rejected: narrowing the click target to just the modifier number — offered,
Francesco chose to keep the existing whole-row/whole-tile target and just
add the missing hover feedback to match it.
Enforced by: Built in T28 — `npm run verify` green (220/41/50 tests).
Affects: `app/src/dice/dice.css` (`.rollable:hover`), and by extension
every consumer of `rollableProps`/`.rollable` app-wide.

### D51 — Passives: session-state, computed from any skill, managed via a checkbox picker · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion + `visualize`-widget mockup, 3 rounds.
Raw note: "move passives under tools labeled 'passives', adding passives
should let me choose which passive, more than one at a time could be added
and i should choose which to remove" → (after a per-tile ✕ mockup) "Passives
approved, but remove the 'remove' button. Instead, the modal to select the
passives with checkboxes, also shows the already present ones, that can be
deselected hence removed from the list."
Chosen: passives move from the Senses card (T27 D40) to a new "Passives"
label under Tools. Which passives are pinned is **session state** (like HP/
resource ticks — the app already never writes the character file's content,
scope §4), not a schema change: any of the 18 skills can be pinned, not
just Perception/Investigation/Insight, computed live as `10 + that skill's
modifier` from data the app already has — so a pinned passive is never
stale after a level-up recompiles skills. The compiled `passives` object
(perception/investigation/insight, if present) seeds the default pinned set
on first load. Management is one modal: tapping "+" opens a single list of
all 18 skills as checkboxes, already-pinned ones pre-checked; checking adds,
unchecking removes. No per-tile ✕ button.
Rejected: keeping passives schema-only (limited to the 3 compiled fields) —
offered as the simpler option, rejected since the data to compute any
skill's passive already exists and the ask was explicitly "choose which
passive," not just "choose among these three." Per-tile ✕ remove button —
tried in the first mockup, replaced by the single checkbox-picker modal.
Enforced by: Built in T28 — `npm run verify` green (220/41/50 tests). New
`trackers.pinnedPassives` session-state field (default-seeded from compiled `passives`).
Affects: `app/src/views/MainSheet/Defenses.tsx` (`PassivesRow` moves/
rebuilds under a `ToolsBlock`-adjacent location), `app/src/state/`
(session state shape + `sessionEngine.ts` reconciliation), a new picker
modal component.

### D52 — Defenses: damage-typed chips, one line per category, moved under Saves · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion + `visualize`-widget mockups, 4 iterated rounds
(icon+row concept → a unified multiplier-prefixed chip field → back to
per-category lines with the multiplier prefix → final: multiplier prefix
dropped, condition icon consistency fixed).
Raw note: "move and redesign defenses with more visual ui, move them under
saves" → (after the first mockup) "Try defenses resistances/immunities/
vulnerabilities as a chipfield with three chip states and 0x - 1/2x - 2x
written in different font and size as if icon before the text" → (after
the unified-field version) "Go back to lines for each type of damage
modifiers. As for conditions, there should either be the Adv. icon or
immunity icon depending on what's the benefit" → (final polish) "remove
1/2x, 0x etc, leave only damage type; adv mark should be consistent
everywhere."
Chosen (final): one line per category (Resist / Immune / Vulnerable /
Cond.), same structure as today. Damage-type chips reuse the app's
existing damage-type color language (`colorMaps.ts` `DAMAGE_COLOR` /
`--dmg-*` tokens — the same colors `{dtype:}` markup already renders
inline elsewhere) instead of today's plain gray text chips — no multiplier
glyph, just the colored chip. Condition-advantage chips show an icon
matching whichever benefit the entry's own compiled markup actually states:
the app's **existing** `AdvBadge` component (`components/chips/AdvBadge.tsx`
— already used everywhere else `{adv}` renders, reused here rather than a
new invented glyph) when the entry contains an `{adv}` tag, a new
shield-check icon when it's phrased as outright condition immunity —
detected from the compiled markup's own tags, not guessed from prose.
Rejected: a 0×/½×/2× monospace multiplier prefix on damage chips — built
and shown twice, dropped both times in favor of just the colored type name.
A single unified chip field mixing all categories — reverted back to
per-category lines. A newly-invented up-chevron icon for advantage
conditions — replaced with the app's real, already-existing `AdvBadge`.
Enforced by: Built in T28 — `npm run verify` green (220/41/50 tests).
Immunity-vs-advantage is detected by parsing the entry's markup for a
`{cond:}` tag plus an optional `{adv}` tag; new `ImmunityIcon` component
(lucide `ShieldCheck`) alongside the existing `AdvBadge`.
Affects: `app/src/views/MainSheet/Defenses.tsx` (`DefensesBlock`), new
condition-icon detection logic, `app/src/components/chips/` (new
immunity-icon component alongside the existing `AdvBadge`).

### D53 — Senses card: drop the duplicate "Senses" label · 2026-08-24 · DECIDED

Mechanism: direct visual confirmation (no AskUserQuestion needed — a bug,
not a design choice), found while grounding the interview in the live app.
Raw note: "do not repeat senses twice in senses."
Diagnosis: `SensesBlock`'s `.panel__title` reads "Senses" and its own
`senses__group`'s `.field-label` (for the darkvision list) also reads
"Senses" directly underneath — the same word twice, one above the other.
Chosen: drop the inner field-label (the panel title alone already says
what the card is; the list itself needs no second label) — or rename it to
something more specific if a label is still wanted structurally. Exact
resolution left to implementation, since this is a bug fix not a design
decision.
Enforced by: Built in T28 — `npm run verify` green (220/41/50 tests).
Affects: `app/src/views/MainSheet/Defenses.tsx` (`SensesBlock`).

### D54 — Identity: chip moves to the topbar, MainSheet's own header removed · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion + `visualize`-widget mockup, 2 rounds.
Raw note: "the identity header with character info should be moved to the
top instance of the name (next to characters button)" → (mockup shown)
"Remove it entirely" (MainSheet's own name/chip block).
Chosen: the `IdentityChip` (T27 D42 — species/class line + tooltip) moves
from `MainSheet`'s `IdentityStrip` up into the app-level topbar, next to
the existing name display and the "‹ Characters" back button — the same
row that already exists in `AppShell`'s `.app-shell__topbar`. `MainSheet`
drops its own name/chip header block entirely; the sheet's first visible
content becomes the ability rail. The `variantLabel` badge ("Battle Mage")
and the identity tooltip both move up with the chip.
Rejected: keeping a smaller header/divider on MainSheet as a landmark —
Francesco chose full removal, no residual header.
Enforced by: Built in T28 — `npm run verify` green (220/41/50 tests).
Affects: `app/src/app/AppShell.tsx` (topbar gains the chip + tooltip),
`app/src/views/MainSheet/IdentityStrip.tsx` (retired or emptied),
`app/src/app/appShell.css`, `app/src/views/MainSheet/mainSheet.css`
(`.identity*` rules move/retire).

### D55 — Spellcasting on Main tab: shared tiles, no source list, Atk rolls · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 1 round.
Raw note: "spellcasting should feature its tile design also in main tab,
atk tile should be clickable to roll."
Chosen: `Defense.tsx`'s `SpellcastingSummary` (today: a per-source-row list
with repeated Save/Atk chips) is replaced by the same shared `.stat`-tile
treatment T27 D43 built for the Spells tab (ability/DC/Atk tiles from the
first source) — **tiles only, no collapsible "N sources" list** on Main
(that stays a Spells-tab-only feature, one tap away via the tab bar; Main
stays the dense at-a-glance view). The Atk tile becomes clickable — rolls
an attack roll using the casting source's `attackMod`, matching the
existing `rollCheck`/`rollableProps` convention.
Rejected: bringing the full Spells-tab treatment (tiles + source list) to
Main too — offered, rejected as duplicating content that's already one tap
away and adding height to the dense Main view.
Enforced by: Built in T28 — `npm run verify` green (220/41/50 tests).
Affects: `app/src/views/MainSheet/Defense.tsx` (`SpellcastingSummary`
rebuilt on `.stat-row`/`.stat` from `components/primitives.css`).

### D56 — Hover-state consistency: full app-wide inventory · 2026-08-24 · DECIDED

Mechanism: AskUserQuestion, 1 round.
Raw note: "make sure hover states are used more and are consistent."
Chosen: beyond the specific surfaces already scoped in D50 (check rows,
tiles, the identity chip), do a full inventory of every interactive element
app-wide (buttons, tabs, cards, menu items, library refs, dialog controls)
against the app's own hover conventions, fixing whatever's missing or
inconsistent — same audit discipline as D45's typography pass, not a
spot-fix-as-noticed approach.
Rejected: fixing only surfaces Francesco calls out explicitly as he notices
them — offered as the lighter option, full inventory chosen instead.
Enforced by: Built in T28 — `npm run verify` green (220/41/50 tests).
Affects: app-wide (audit scope, not a single file).

### D57 — No tracking anywhere; prose leading matched to monster-forge's 1.5 · 2026-08-25 · DECIDED

Mechanism: direct handoff document (`docs/HANDOFF-monster-forge-B310.md`,
written from inside monster-forge immediately after its own B310 pass, not
a secondhand summary) + one AskUserQuestion round for the one call the
handoff explicitly flagged as not its author's to make.
Source of truth on the other side: monster-forge `DECISIONS.md` **D-053**,
its `DEVELOPMENT.md` § "The design system in `styles.css`", `AUDIT.md`,
CHANGELOG batch **B310**.
Raw note (Francesco, in the monster-forge session that produced B310, per
the handoff): "Remove extra tracking and make it standard across all.
Useless extra tracking is to be avoided as it as AI tell" — then,
clarifying: "when I said extra tracking I meant any tracking that isn't the
default one." The handoff's author flagged the counter-argument (tracking
small uppercase type is a typographic convention, not an AI tell) at the
time; Francesco overruled it. Settled taste, not a misunderstanding — carries
over here as the same rule, not re-litigated.
Chosen (tracking): `--letter-spacing-chrome` and `--letter-spacing-title`
(`app/src/tokens/tokens.css`) both set to `normal` — the handoff's
"cheapest, most reversible" recommended step, one edit moves the whole app,
trivially revertible if it reads wrong on a phone. The two stray
non-tokenized literals found alongside them (`edge-badge`'s `0.05em`,
`ability-chip__value`'s explicit `letter-spacing: normal` reset) are also
resolved — the former routed through `var(--letter-spacing-chrome)`, the
latter deleted outright since it's now fully redundant (the parent it
overrode no longer sets any tracking to override). Verified: `grep` for
`letter-spacing` across `app/src` now returns only the two token
definitions themselves — nothing else in the codebase sets tracking.
Tokens are **kept, not deleted** in this pass; monster-forge's own second
step (deleting the tokens entirely, so nothing can silently reintroduce
tracking) is the deliberate follow-up, done after Francesco has seen this
first pass live on a phone — not bundled into the same commit.
Chosen (line-height): asked directly rather than assumed, per the
handoff's own flag — monster-forge separately standardized its prose
leading on `1.5` (absorbing several drifted values); character-forge's
`--line-height-prose` was `1.4`, chosen deliberately in T26 (D29) and
verified live against real wrapped text with an inline chip present.
Offered "keep 1.4" as the recommendation (same category as the other locked
per-device divergences in `docs/DESIGN-SYSTEM.md` §1) against "match
monster-forge's 1.5." Francesco chose to match: `--line-height-prose` is
now `1.5`. The five stray non-tokenized `line-height` literals found
alongside it (four `1.5`, one `1.4` — `library.css`'s `.md-p`/`.md-list`,
`manage.css`'s `.cf-empty__body`/`.mng-dialog__lede`/`.mng-variant__about`)
are all routed through `var(--line-height-prose)` now too; `.md-h`'s
`line-height: 1.25` is a different role (tight heading leading, not
wrapping prose) and correctly left alone.
Rejected: keeping `--line-height-prose` at 1.4 (the recommended option) —
Francesco chose sibling-app consistency over the phone-density argument.
Checked and found clean, no action needed: the handoff's "a weight the font
never loaded is not a weight" finding (monster-forge had declared 800/900
with only 400–700 loaded) — character-forge only ever declares 400/600/700
in its CSS, and loads 400/500/600/700 via `@fontsource/inter`
(`main.tsx`), so no phantom-weight bug exists here.
Not done in this pass (informational findings from the handoff, not part
of its "Done when" checklist): a full duplicate-rule-block sweep or a
dead-selector sweep (the handoff's findings #2/#3) — worth a future pass,
not undertaken here since neither was flagged as required and the
resolved-declaration diff tool (`monster-forge`'s `scripts/diff-css.mjs`)
wasn't ported. This was a small, mechanical, two-value token edit plus
seven literal-to-token routings — verified by direct `grep` (every
`letter-spacing`/stray-`line-height` call site found and accounted for)
rather than a resolved-declaration diff, which the handoff's own "trap"
section warns screenshots/DOM measurement can't substitute for; `grep`
verification here is exhaustive enough for a change this size, but the diff
tool remains the right method for a larger refactor.
Enforced by: `npm run verify` green (220/41/50 tests) after the change.
`docs/HANDOFF-monster-forge-B310.md` deleted per its own "Done when" —
this entry plus the `DESIGN-SYSTEM.md` §2 edits are where its content now
lives.
Affects: `app/src/tokens/tokens.css`, `app/src/components/chips/chips.css`,
`app/src/views/MainSheet/mainSheet.css`, `app/src/library/library.css`,
`app/src/manage/manage.css`, `docs/DESIGN-SYSTEM.md` (§0 intro, §2, §3
"Confirmed violations," §4).

---

> **2026-09-29 — moved.** D58–D61 (the successor turn: MPMB's engine inside, an
> MPMB-structured sheet, private, the A-first ladder) now live in
> **character-forge v2**, `~/Documents/GitHub/character-forge/DECISIONS.md`, as
> its founding entries. This repo is v1, read-only; it is archived on GitHub at
> v2's PLAN T0.2.

- **D58** — moved → v2 `DECISIONS.md#d58` (MPMB's engine runs inside v2, headless).
- **D59** — moved → v2 (play in our own app structured like MPMB; MPMB-look PDF; no Acrobat).
- **D60** — moved → v2 (private forever; WotC scripts loaded as data).
- **D61** — moved → v2 (the A-first ladder).
