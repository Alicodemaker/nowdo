# Do Now

A phone-first, offline todo app for people with ADHD that makes *starting* easy: one tiny step on screen, one tap to start a 2-minute timer.

- **Now:** the next Step of your Focus project, with Start, Done, Make it smaller, Not now and quick capture (+).
- **Projects:** a Brain dump, spoken or typed, turns into tiny Steps you check before saving.
- **Claude (optional):** add your own Anthropic API key in Settings, and Claude writes the Steps and suggests first moves. Without a key or a connection, the app uses its offline rules instead.
- **Your data** stays in this browser. Use Settings → Export backup now and then.

## Develop

- `npm install`, then `npm run dev`
- `npm test` runs the logic tests (Node's built-in test runner)
- `npm run build` builds the installable PWA into `dist/`

Every push to `main` deploys to GitHub Pages (one-time setup: repo **Settings → Pages → Source: GitHub Actions**).

Project rules are in [AGENTS.md](AGENTS.md), the brief in [BRIEF.md](BRIEF.md), terms in [GLOSSARY.md](GLOSSARY.md) and decisions in [docs/adr/](docs/adr/).
