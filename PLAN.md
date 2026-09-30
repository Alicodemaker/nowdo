# PLAN: Fix the repeating mic

## What we're doing

On Android (the founder's Samsung S23, Chromium-based browser), speaking into the Brain dump gives "so so I so I need…". The phone's browser reports every growing version of a sentence as a finished phrase, and the app adds each one. The mic test prototype (`prototype/local-ai`, way B) showed the fix on the real phone: when a new phrase just extends the previous one, replace it instead of adding it.

## Steps

1. ✅ **Phrase merging, test-first (`tdd`).** A pure `mergePhrase(phrases, phrase)` in `src/speech.js`:
   - a phrase that extends the last one replaces it;
   - a new phrase is added;
   - blank phrases are ignored.
2. ✅ **Use it in the mic.** `listen()` keeps the phrases heard in one listening session and hands the Brain dump the merged text, which replaces what that session added before. Text typed before tapping the mic stays.
3. ✅ **Verify.**
   - A fake Android-like speech engine gives clean text in the Brain dump.
   - The normal desktop pattern (separate phrases) still adds phrases.
   - Unit tests pass.

## What we're NOT doing

- No language picker for speech (still English, en-GB).
- No change to the local-AI prototype in this PR.
- No auto-restart listening mode (way C).

## How we'll know it works

- On the S23, say "so I need to find an apartment, then call the landlord" into a new project's Brain dump: it appears once, with no repeats.
