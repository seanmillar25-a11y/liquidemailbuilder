---
name: release
description: Release a new version of the Liquid Email Builder – bump the version everywhere, update the changelog, run the tests, commit and push to GitHub Pages. Use after making a change to index.html or team-lists.json.
---

# Release a new version

1. **Decide the version.** Look at `APP_VERSION` in `index.html`. Fixes are a patch bump (1.6.0 → 1.6.1); new features are a minor bump (1.6.0 → 1.7.0). Updating only `team-lists.json` needs no version bump. Skip to step 4.
2. **Bump it in all three places**, to exactly the same value:
   - `const APP_VERSION='X.Y.Z';` in `index.html`
   - `version.json` → `{"version":"X.Y.Z"}`
   - `"version"` in `package.json`
3. **Add a CHANGELOG entry** at the top of `CHANGELOG.md`: `## X.Y.Z · YYYY-MM-DD`, then short plain-language bullets describing what changed for the team, not the code.
4. **Run the tests:** `npm test`. If Chromium isn't installed, run `npx playwright install chromium` first. Fix anything that fails before going further. Never skip or weaken a check to make it pass.
5. **Commit and push** to `main` with a message that starts with the version, e.g. `1.7.0: …`, and briefly says what changed and why.
6. **Confirm the GitHub check passed.** If `gh` is available, run `gh run list --workflow test.yml --limit 1`. Otherwise ask Sean to check the Actions tab.
7. **Tell Sean**, in plain language:
   - what changed
   - to refresh the builder (Ctrl+F5) and check the version in the ⋯ menu
   - for anything that changes the email output: re-copy affected emails into Gecko and do a test send (including Outlook and a phone)
