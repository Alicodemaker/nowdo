# PLAN: Do Now, version 1

## What we're doing

We're turning the sample Now screen into the working Do Now app from `BRIEF.md`. One Step is on screen with a 2-minute Start, and Projects are filled by a spoken or typed Brain dump. Everything is stored on the phone and works offline (ADR 0001). Claude improves the Brain dump and "Make it smaller" only when a key is set and the phone is online (ADR 0002).

## Steps

1. ✅ **Data and rules (with `tdd`).** Build a small store in localStorage for Projects and Steps. It covers: the Loose ends project, the Focus project, picking the Now Step, Done/undo, Not now, Move to top, Make it smaller (insert before the Now Step), the Steps today count (resets at midnight), a Project becoming Finished, and export/import as JSON. It also includes the offline Brain dump splitter, which splits on sentences, lines, "then" and "and also".
2. ✅ **Now screen, working.** Wire the sample screen to the store. Start runs the 2-minute ring, then asks "Keep going?". Done gives a burst animation, a vibration and an undo toast. Not now works. Steps today updates. There's an empty state for when there's nothing to do yet.
3. ✅ **Quick capture and Make it smaller.** The **+** opens a one-line field that saves to Loose ends. Make it smaller opens a sheet with built-in first moves: some match keywords in the Step, some are always there (such as "Open your PC"). There's also a "type your own" field.
4. ✅ **Projects screen.** List Projects, set the focus (the chip on Now opens the same picker), and show Finished Projects. Opening a Project lets you add a Step (a one-line field at the bottom), edit, delete and move Steps to the top, with done Steps under "Done (n)". Deleting a Project asks you to confirm. Finishing a Project brings a bigger celebration and "Pick your next focus".
5. ✅ **Brain dump.** Creating a Project goes: name → Brain dump with a big mic button (browser speech recognition, with a keyboard-mic hint where it isn't supported) or typing → offline splitter → review list you can edit and remove from → "Save steps" → becomes the Focus project.
6. **Settings and Claude.** Settings has the Claude API key, Export backup and Import backup (with confirmation). With a key and a connection, the Brain dump is turned into tiny Steps by Claude, and Make it smaller gets one tailored first move. Without either, the app falls back quietly to the offline behaviour. Use the `claude-api` skill for the request details.
7. **Ship check.** Add a Do Now app icon, then run `webapp-testing` at 390×844 and `web-design-guidelines` on every screen. Check offline in airplane mode, deploy to GitHub Pages, and install it on the phone.

## What we're NOT doing

- No due dates, priorities, tags, reminders or notifications
- No streaks, points, levels or sound
- No accounts, sync or server of our own; the only network call is Claude
- No nested Steps and no drag-to-reorder (Move to top only)
- No timer lengths other than 2 minutes
- No Danish or other languages
- No UI framework or new libraries; plain JS and CSS

## How we'll know it works

- In airplane mode, create a Project by typing a Brain dump, press Start, mark two Steps done: "2 steps today" shows, and it's all still there after closing and reopening the app.
- Speak a messy 20-second Brain dump with a key set: you get 4 or more tiny Steps to review, and none are saved until you tap "Save steps".
- Export a backup, delete everything, import it: every Project and Step is back.
