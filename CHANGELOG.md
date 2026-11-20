# Changelog

## 1.3.0 · 2026-11-20

Matrix import fixes, found in "Email 1 Course 2025 Version":
- Buttons with a link but an empty button-text column now appear, as "Find out more" (they were silently left out, so the CTA had no button).
- The programme/variant column, header image (Gecko's wrapper already adds the banner) and social-icon columns are no longer turned into blocks by default. The import report lists every column it didn't use.
- An image cell with several addresses uses the first one, and the report says so.
- New checks: image addresses containing spaces; buttons without text.

## 1.2.1 · 2026-11-20

- Shows a "newer version available" bar when the live site has been updated, so nobody builds or copies emails with an old cached copy.
- Every generated template now starts with `Made with Liquid Email Builder vX.Y.Z` (a Liquid comment, invisible to recipients), so you can tell which version produced a template in Gecko.

## 1.2.0 · 2026-11-20

Fixes from the first test send (new Outlook, through Abertay's email security):
- A web address in brackets after some words is now linked wherever the text comes from (typed, pasted or imported), so addresses no longer go out as plain text.
- Buttons: padding moved from the link to the table cell. Outlook and the security gateway were stripping link padding, which squashed the button into a thin bar.
- Email width: the 600px column no longer depends on a mobile media query (`width:600px;max-width:100%` with fixed-layout wrapper tables), so it can't stretch across the reading pane and still shrinks to fit phones.
- New check: warns when a web address would show as plain text.
- Self-test: checks for the link, button and width fixes.

## 1.1.0 · 2026-11-20

- Matrix import now links words followed by a web address in brackets, e.g. `Studying Accounting and Finance (https://…) at Abertay` → "Accounting and Finance" becomes the link. Bracketed text that isn't a web address, like "(Guardian University Guide 2027)", is left alone. `www.` addresses work too.
- Pasting matrix copy into a text block converts these links (and the `{?url?}`, `{?b?}` and `*link to:*` shorthand) automatically.
- Self-test: new "Matrix links" checks.
- Automated checks: the drag-and-drop test waits for the page to settle, so it no longer fails at random.

## 1.0.0 · 2026-11-20

First release on GitHub Pages.

- Drag-and-drop canvas with block palette, inspector and "Viewing as" contact preview.
- Block versions by course (UG or PG), domicile, or any Gecko contact or response field.
- Course matching with single-word keywords and most-specific-first ordering (Gecko hidden-character fix).
- Outlook-safe buttons, alt-text and empty-link checks, optional UTM tracking, saved links and snippets.
- Edit live templates by pasting their HTML; import from a content matrix (.xlsx).
- Team lists loaded from `team-lists.json`.
- Built-in self-test (Menu → Run self-test) and automated checks on every push.
- Fonts, spreadsheet reader and Liquid engine hosted in the repository: no requests to other servers.
