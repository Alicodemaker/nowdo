# PLAN: Protect the Claude key

## What we're doing

The Claude key sits in the browser on the phone, so the main way to lose it would be foreign code running inside Do Now. We'll add a strict Content-Security-Policy: the page may only run its own files and may only talk to itself and `api.anthropic.com`. Even injected code then can't send the key anywhere else. We'll also tell the user in Settings how to cap the cost if a key ever leaks.

## Steps

1. ✅ **Make the timer ring CSP-safe.** Set the ring's animation delay from JavaScript after the screen renders, instead of writing a `style="…"` attribute into the HTML.
2. ✅ **Add the policy to production builds.** A small Vite plugin in `vite.config.js` adds a `<meta http-equiv="Content-Security-Policy">` to the built `index.html` only, because the dev server needs inline styles for hot reload. Policy: `default-src 'self'`, `connect-src 'self' https://api.anthropic.com`, `img-src 'self' data:`, `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`.
3. ✅ **Spend-limit tip in Settings.** One line under the key field: create a separate key for Do Now in a Console workspace with a low monthly spend limit, and delete it if the phone is lost.
4. ✅ **Verify.**
   - The full screen tour in light and dark, plus the mocked Claude calls, backup export/import and the offline reload, with zero CSP violations.
   - A test `fetch` to another site is blocked.

## What we're NOT doing

- No encrypting the key with a PIN or passphrase. It would add a step before every AI call, which is friction for the core user.
- No proxy server (ADR 0002 still holds).
- No CSP in the dev server.
- No changes to the local-AI prototype. It lives on its own throwaway branch.

## How we'll know it works

- Every screen and flow works in the production build with no CSP errors in the console.
- In the built app, `fetch('https://example.com')` from the console is blocked by the policy, while Claude requests still go through.
