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
