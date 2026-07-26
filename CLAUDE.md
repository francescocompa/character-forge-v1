# CLAUDE.md — character-forge

> Local-first D&D 5e character sheet PWA. **Compile-time character builder, no
> rules engine**: Claude compiles a human-written build document into a
> validated, self-contained character file; the app only renders it and tracks
> play-time state. This file is deliberately an index — truth lives in `docs/`.

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
extracts) and copyrighted text are git-ignored by design and live in a local
Google Drive-synced data folder. Tests use synthetic fixtures only.

## The verify gate

**`npm run verify` = typecheck + lint + test — run after any code edit** before
treating it as done.

## Context boundary

Software engineering here; cross-project rules in `~/.claude/CLAUDE.md`. Don't
carry other projects' conventions in.
