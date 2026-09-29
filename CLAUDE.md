# CLAUDE.md — character-forge

> Local-first D&D 5e character sheet PWA. **Compile-time character builder, no
> rules engine**: Claude compiles a human-written build document into a
> validated, self-contained character file; the app only renders it and tracks
> play-time state. This file is deliberately an index — truth lives in `docs/`.
> ⚠ **2026-09-29:** a successor tool with MPMB's engine inside it is decided
> (D58–D61, now in v2 at `~/Documents/GitHub/character-forge`). **This repo is v1:
> read-only, archived on GitHub at v2's PLAN T0.2.** Don't extend it.

▶️ **A fresh session should read `docs/PROJECT-SCOPE.md` first** — the source of
truth for scope, architecture, and decisions.

## The pipeline (`pipeline/` — the Claude-facing compile/audit recipes)

- `interview.md` — guided conversation → a chassis doc (`chassis-format.md` is
  the format spec; `examples/thessaly-quill.chassis.md` a synthetic example).
- `compile.md` — chassis doc + knowledge base → `*.character.json` (the only
  step that reads WotC content; output is self-contained).
- `validate/` — the Node CLI: schema (ajv) + referential integrity + markup
  lint. Green means the app can import it.
- `kb-audit.md` — maintenance path: refresh embedded `library` extracts in
  already-compiled characters after a KB update. `proof-vice-diff.md` — the
  fidelity proof notes.

## The content boundary (this repo is PUBLIC)

**No WotC/game content in this repo.** Real character files (which embed rules
extracts) and copyrighted text are git-ignored by design and live in a local,
non-synced data folder (`~/Documents/D&D/D&D Character Builder`, its own
`CLAUDE.md`). Tests use synthetic fixtures only.

## Guardrails

- **The app never writes character files.** Only `compile` and `kb-audit`
  (Claude Code sessions, run in the data folder) do — see
  [`pipeline/README.md`](pipeline/README.md#guardrails-scope-4).
- **The contract is [`schema/`](schema/README.md)** — compiler, validator,
  and renderer all code against it; where a doc and the schema disagree, the
  schema wins.
- **No cross-contamination** from Francesco's other projects (design or
  code) — this repo's conventions and visual language are its own.

## The verify gate

**`npm run verify` = typecheck + lint + test — run after any code edit** before
treating it as done.

## Conventions

Strict TypeScript throughout (`app/`, `schema/`, `pipeline/validate/`).
Styling is tokens-only (`app/src/tokens/tokens.css` — no ad-hoc colors/sizes).
Conventional commits (`feat(app): … (T24)`, `fix(pipeline): …`), one task or
batch per commit, logged in [`CHANGELOG.md`](CHANGELOG.md).

**Component-level UX/UI skeleton: [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md)**
— read before touching component CSS. Shared primitives are a hard rule (no
per-view forks); what's a deliberate divergence from sibling app monster-forge
vs. what's still drift. Decisions D16+ in [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Context boundary

Software engineering here; cross-project rules in `~/.claude/CLAUDE.md`. Don't
carry other projects' conventions in.
