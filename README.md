# appstarter

A starter template for mobile-first PWA web apps built with Claude Code. It contains no app yet.

- **Rules:** [AGENTS.md](AGENTS.md) is the single rules file, including the skill map. `CLAUDE.md` only points to it.
- **Start a new app:** open a Claude Code session and say "Follow KICKOFF.md". See [KICKOFF.md](KICKOFF.md).
- **Skills:** project-level, in `.claude/skills/` (sources in `skills-lock.json`).
- **Run locally:** `npm install`, then `npm run dev`.
- **Deploy:** every push to `main` deploys to GitHub Pages. One-time setup: repo **Settings → Pages → Source: GitHub Actions**.

To use it as a template, go to repo **Settings → General → Template repository**, then click **Use this template** for each new app.
