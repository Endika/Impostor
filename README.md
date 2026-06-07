<p align="center">
  <img src="./public/icon-512.png" width="128" alt="Impostor app icon" />
</p>

<h1 align="center">Impostor</h1>

<p align="center">
  Offline pass-the-phone impostor party game — everyone shares a word except the impostors; talk, vote, and unmask them. No login, no internet.
</p>

<p align="center">
  <a href="https://github.com/Endika/Impostor/releases/latest"><img src="https://img.shields.io/github/v/release/Endika/Impostor?style=flat-square&color=4f46e5&label=release" alt="Latest release" /></a>
  <a href="https://github.com/Endika/Impostor/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Endika/Impostor/ci.yml?style=flat-square&label=ci&branch=main" alt="CI" /></a>
  <a href="https://github.com/Endika/Impostor/commits/main"><img src="https://img.shields.io/github/last-commit/Endika/Impostor?style=flat-square" alt="Last commit" /></a>
  <a href="https://www.conventionalcommits.org"><img src="https://img.shields.io/badge/conventional_commits-1.0.0-FE5196?style=flat-square" alt="Conventional Commits" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/Endika/Impostor?style=flat-square&color=10B981" alt="License: MIT" /></a>
</p>

## What you can do

- Play on a single phone — no signup, no accounts, fully offline.
- Choose how many impostors join the round, from 1 up to the table size.
- Toggle whether impostors get a clue (the word's category) or fly completely blind.
- Toggle whether impostors know each other or play alone.
- Pick word categories — General, Music, Places — fully translated in six languages.
- Hold-to-reveal handoff: each player presses and holds to see their word, then passes the phone on.
- A random player is chosen to start the conversation each round.
- Vote in-app and get a win/lose reveal showing who the impostors were.
- Synthesized audio cues — no audio files to download, works offline.
- Install it as a PWA on any device.

## How to start

1. Open Impostor on any phone.
2. Set the number of players and impostors, pick categories, and tweak the toggles.
3. Pass the phone around to reveal words, talk it out, then vote.

## Install on your device

Open the URL in Chrome, Edge or Safari and use **"Add to Home Screen"** (mobile) or **"Install"** (desktop). Behaves like a native app and works fully offline by design.

## Languages

Catalan, English, Spanish, Basque, Galician, Valencian (`ca`, `en`, `es`, `eu`, `gl`, `va`).

## Privacy

No login, no accounts, no backend. Everything runs in your browser and stays on your device. No analytics, no tracking, no cookies (except your language preference).

---

## For developers

Open-source, MIT licensed. PRs welcome.

**Stack** — React 19, Vite, TypeScript (strict), Tailwind CSS 4, vite-plugin-pwa, i18next, uuidv7, Vitest.

**Architecture** — Hexagonal (domain → application → presentation). Tests use in-memory fakes — no mocks.

### Local dev

```sh
git clone git@github.com:Endika/Impostor.git
cd impostor
npm install
npm run dev
```

### Commands

| Command             | Description                               |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start the dev server                      |
| `npm run build`     | Production build (`tsc -b && vite build`) |
| `npm test`          | Run tests once                            |
| `npm run lint`      | ESLint (zero warnings)                    |
| `npm run typecheck` | TypeScript type check                     |

CI runs lint, typecheck, tests, and the production build on every PR.
