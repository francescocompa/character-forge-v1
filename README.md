# character-forge

![CI](https://github.com/francescocompa/character-forge/actions/workflows/ci.yml/badge.svg)

A local-first, installable **D&D 5e character sheet** (PWA). Claude Code compiles a
human-written build document into a validated, self-contained character file; this app
renders it on desktop and phone, tracks play-time state (HP, slots, uses, prepared
spells, loadouts), and pops the full official rules text for anything on the sheet. The
app has **no rules engine** — every derived number is computed at compile time.

**No game content lives in this repo.** It is public: WotC-copyrighted text and real
character files (which embed rules extracts) are git-ignored by design and kept in a
local, non-synced data folder. Tests use an invented synthetic fixture only.

- **Docs** — [`docs/PROJECT-SCOPE.md`](docs/PROJECT-SCOPE.md): the source of truth for
  scope, architecture, and decisions.
- **Pipeline** — [`pipeline/`](pipeline/): the Claude-facing compile/audit docs and the
  validator CLI.
- **License** — [MIT](LICENSE) (code only; no game content ships in this repo).

## Screenshot

_Owed: a screenshot of the Main sheet view (run `npm run dev`, open
`http://localhost:5173`, click "Load a sample character") — manual capture, not yet
taken._

## Architecture

```
   interview            compile             validate           render
      │                    │                    │                  │
  conversation        chassis doc          character.json      app/src/
  ──────────▶  *.chassis.md  ──────────▶  *.character.json  ──▶  Main / Features /
  (pipeline/           (pipeline/          (pipeline/validate/,   Spells / Equipment /
   interview.md)        compile.md)         schema/)              Companion views
```

- **`schema/`** — the contract: JSON Schema for `*.character.json` (compiled, WotC
  content embedded) and `*.session.json` (play-time state), plus the shared
  sheet-markup grammar/parser. Compiler, validator, and renderer all code against it.
- **`pipeline/`** — Claude-facing recipes that turn a build idea into a validated
  character file (interview → compile → validate), plus `kb-audit.md` for refreshing
  extracts after a knowledge-base update. Runs in the local data folder, never in
  this repo — see [`pipeline/README.md`](pipeline/README.md).
- **`app/`** — the React PWA. No rules engine: every derived number was computed at
  compile time, so the app only renders the sheet and tracks play-time state (HP,
  slots, uses, prepared spells, rests) in IndexedDB. Installable, works offline.

## Develop

```sh
npm install
npm run dev       # app dev server
npm run verify    # typecheck + lint + test
npm run build     # production build (deployed to GitHub Pages)
```

## Install as an app

See [`docs/INSTALL.md`](docs/INSTALL.md) for adding the deployed PWA to your home
screen (iOS/Android/desktop) and offline behavior.
