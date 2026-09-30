# AGENTS.md

This is the only rules file for this repo. `CLAUDE.md` points here, and rules must not be added anywhere else.

## Project brief

See `BRIEF.md` for detail, `GLOSSARY.md` for terms, and `docs/adr/` for decisions.

- **App:** Do Now: a phone-first, offline todo app that makes *starting* effortless for people with ADHD.
- **For:** the founder, an adult with ADHD and executive dysfunction who has quit every todo app they've tried.
- **Main problem:** starting, not listing. Big tasks cause freezing, and full-featured apps cost energy the person doesn't have.
- **Version 1 must:** have a Now screen (one Step, a 2-minute Start, Done, Make it smaller, Not now, Switch project, quick capture to Loose ends); Projects with a spoken or typed Brain dump turned into Steps (by Claude, or an offline splitter) that are reviewed before saving; edit, delete and move-to-top for Steps; a burst, vibration and "Steps today" on done; Settings with API key and Export/Import backup.
- **Version 1 must NOT:** have due dates, priorities, tags, reminders, streaks, points, sound, accounts, sync, nested steps, drag-reorder, a second language, or nagging or shame.
- **Look and feel:** bright and playful but restrained; warm, rounded, quick; light/dark follows the system; Start is the hero.
- **Data:** Projects and Steps on the device only (ADR 0001). AI calls go straight to Claude with the person's own key, with no server (ADR 0002).

## General rules

- **Mobile-first.** Design for a ~390px wide phone screen first, then scale up. Tap targets are at least 44px. Respect safe areas.
- **PWA that works offline.** The app must be installable and must load and work without a network. Anything new has to be cached by the service worker (`vite-plugin-pwa` in `vite.config.js`). If a feature needs the network, it fails gracefully offline.
- **One theme file.** All colours, fonts and spacing live in `src/theme.css` as CSS variables. Components use only those variables and never hard-code values. If you need a new value, add it to the theme file first.
- **Small commits.** Make one logical change per commit, with a plain one-line message. Push often.
- **Keep it simple.** Add no dependency, abstraction or feature that the current plan doesn't need. When in doubt, leave it out.
- **Stack.** Use Vite and `vite-plugin-pwa`, with plain JS/CSS by default. Add a UI framework only if a plan explicitly calls for one.
- **Merge automatically.** When a pull request is ready (the fstack-check verdict is ready to push, the testing rules in the skill map are done, there are no open review comments, and GitHub says it can merge), merge it into `main` yourself without asking. Never merge `prototype/*` branches.
- **Deploy.** Pushing to `main` deploys to GitHub Pages under `/<repo>/` (`.github/workflows/deploy.yml`). Never hard-code `/` as a root path: use relative paths or Vite's `import.meta.env.BASE_URL`.

## Agent skills

### Issue tracker

Local markdown files under `.scratch/<feature>/` (solo project, no GitHub Issues). See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Skill map

The fstack loop is the backbone. Other skills plug in only at the points below. Never use two skills for the same job. If a skill mentions a skill that isn't on this map (for example, `tdd` mentions `code-review`), use the mapped skill for that job instead (`fstack-check` for review, `fstack-simplify` for cleanup).

| When | Use |
|---|---|
| Starting an app (once) | Follow `KICKOFF.md` |
| Each feature | `fstack-nail` (only if the request is unclear) → `fstack-plan` → `fstack-build` → `fstack-check` → `fstack-push` |
| Inside `fstack-build`, for logic that must be correct (calculations, scheduling, data rules) | `tdd` |
| Visual style | `frontend-design` once at kickoff to create the style. After that, only `fstack-design` to keep new screens consistent with `src/theme.css` |
| Before any pull request that changes the UI | `webapp-testing` at a mobile screen size (390×844), then `web-design-guidelines`. Fix real problems and list minor ones in the PR description. If browser tools can't run here, say so and continue |
| Bug found by `fstack-check` or testing, with a cause that isn't obvious | `diagnosing-bugs` |
| Trying an idea | `prototype` on a separate throwaway branch (`prototype/<name>`). Never merge it. If it works, plan it properly with `fstack-plan` |
| Understanding the code | `zoom-out` (read-only, changes nothing) |
| Cleaning up | `fstack-simplify` first. Use `improve-codebase-architecture` only when asked, or when simplify isn't enough. Its changes go through `fstack-plan` before any code changes |
| Ending a session | When a session is long or the user says they're stopping, run `handoff` |
| Starting a session | Read the latest handoff in `docs/handoffs/` if one exists |

Helper skills: `grilling`, `domain-modeling` and `codebase-design` are installed only because `grill-with-docs`, `tdd` and `improve-codebase-architecture` load them. Don't invoke them on their own.

### Project overrides for skills

- **handoff:** cloud sessions are thrown away when they end, so save handoffs to `docs/handoffs/YYYY-MM-DD-HHMM.md` in the repo, not the OS temp folder, and commit and push them.
- **prototype:** there is no issue tracker. Record the prototype branch name and the verdict in `PLAN.md` or a commit message.
- **Asking questions:** when a skill asks the user something, ask and wait. Never answer for the user.
