# PLAN: Share to Do Now

## What we're doing

The founder wants to ramble in the Claude or ChatGPT app (free with their subscription, better voice input) and send the result into Do Now. Android's Share menu will list Do Now: sharing text opens the app on the new-project flow, with the shared lines already split into Steps for review. Nothing saves without the review, and there's no server, no new network host and no CSP change.

## Steps

1. ✅ **Clean list lines, test-first (`tdd`).** `splitBrainDump` in `src/braindump.js` strips leading list markers (`1.`, `1)`, `-`, `*`, `•`), so "1. Open boligportal.dk" becomes one Step, "Open boligportal.dk", and not "1" plus a Step.
2. ✅ **Register as a share target.** Add `share_target` to the manifest in `vite.config.js` (`GET`, `action` under the repo base, params `title`, `text`, `url`).
3. **Receive shared text.** At start-up, if the URL has shared text, combine `text`, `title` and `url`, clear the query string with `history.replaceState`, and open the new-project flow (`#new`) with the Steps pre-split by `splitBrainDump` (not Claude: the text is already steps).
4. **Name, then review.** The flow asks for the project name as usual, then goes straight to the review screen (skipping the Brain dump screen) because Steps already exist. Save and cancel work as today.
5. **Verify.** Unit tests pass. On the production build at 390×844, opening `?text=1.%20Open%20the%20laptop%0A2.%20Find%20the%20letter` shows the name screen, then a review with two clean Steps. Then run `web-design-guidelines`.

## What we're NOT doing

- No MCP server, sync, accounts or link-import (option 3).
- No adding shared Steps to an existing project: shared text always starts a new project.
- No sending shared text through Claude again.
- No project name guessed from the shared text.
- No `POST` or file sharing: text only.

## How we'll know it works

- Tests pass, and the URL check in step 5 shows two clean Steps with the query string gone from the address bar.
- On the S23, after reinstalling Do Now: select Claude's reply, tap **Share**, and **Do Now** appears. Tapping it opens the name screen, then the review with the Steps. (If Do Now doesn't appear from a Brave install, move to Chrome with Export/Import backup.)
