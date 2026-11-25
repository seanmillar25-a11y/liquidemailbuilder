# Liquid Email Builder

A drag-and-drop builder for Gecko CRM email templates written in Liquid, used by Abertay University's marketing team. Live at https://seanmillar25-a11y.github.io/liquidemailbuilder/ (GitHub Pages from `main`, repo root).

The owner is Sean (marketing, not a developer). Explain changes in plain language, in UK English. User-facing text in the tool follows the same style: short, plain, no jargon.

## Hard constraints

- **One page, no build step.** The whole tool is `index.html` (HTML, CSS and JS in one file). Don't introduce a bundler, framework or npm runtime dependency. `package.json` exists only for the tests.
- **No requests to other servers.** Fonts, SheetJS (`vendor/xlsx.full.min.js`) and LiquidJS (`vendor/liquid.browser.min.js`) are stored in `vendor/`. A test fails if the page requests anything outside the site. Don't add CDN links, analytics or web fonts from elsewhere.
- **No AI and no Claude at runtime.** Abertay IT want staff to use Copilot for AI, so the tool must not call any AI or Claude service. (It still contains optional code for Claude-hosted capabilities, `window.claude.use(...)`, which does nothing on GitHub Pages. Leave it alone unless asked.)
- **The repository is public.** Never commit content matrices, real contact data or anything internal. Test fixtures must be clearly test or public copy.
- **Saved work lives in each person's browser** (localStorage: `leb.current`, `leb.library`, `leb.seqs`, `leb.seqCurrent`; `leb.device` remembers Desktop/Phone). Menu → Back up all my work saves them all to one file (`lebBackup:1`), and restoring only ever adds. Keep old saved emails and project files opening in new versions; don't break their format.

## How index.html is organised

There's a map in the comment at the top of the file. Search for the `/* ----` section markers. Key pieces:

- **Defaults:** `APP_VERSION`, `DEFAULT_PG`/`DEFAULT_UG` course lists, `DEFAULT_DOM` regions, `GECKO_FIELDS`, `DEFAULT_LINKS`, `DEFAULT_SNIPPETS`, `baseSettings()`. At runtime the team's real lists come from `team-lists.json`.
- **Keyword engine:** `computeCourses()` and `classifyCourse()`.
- **Rendering:** `inline()` (markdown-ish text to HTML: `**bold**`, `[text](url)`, `{first_name}`, `{field:tag}`, `{field:response.N}`), `renderBlockHTML()`, `buttonHTML()`, `tagUrl()` (UTM), `emojiSafe()`, `layout()`.
- **Liquid generation:** `generate()`, `shellTop()` with `SHELL_TOP`/`SHELL_BOTTOM`.
- **Importers:** `importLiquid()` (paste a live template; builder-made templates carry their data in a base64 Liquid comment, `liquid-email-builder:v1:`), `convertShorthand()`/`linkPhrase()`/`mxImport()`/`mxImportAll()` (content matrix .xlsx).
- **UI:** rail, canvas and inspector (`renderCanvas`, `renderInspector`), viewer ("Viewing as"), drawers, menus.
- **Sequences:** `SEQ`/`SEQS`, `adoptEmail()`, `renderSeqBar()`.
- **Hosting:** `team-lists.json` loading, `download()`, `checkForUpdate()` (reads `version.json`), `selfTest()`.

The email on screen is the global `state` (`{name, level, settings, blocks, utm}`). A block has `mode` `all | course | domicile | field`, and `split[mode] = {variants:[{targets|match, content}], fallback:{hide, content}}`.

## Gecko, Outlook and email rules (learned the hard way, don't undo)

- **Gecko dropdown values can contain an invisible character in place of a space.** Never match dropdown fields with `==`, `case`/`when`, or a multi-word `contains`. Each course is matched with single-word keywords joined by `and`, chosen so no other course matches. Sub-variants ("…with Industrial Practise") are checked before the base course. The generated code captures a clean `course_key` once, then blocks compare against it.
- Domicile: Scotland, rest of UK (England, Wales, Northern Ireland) and Republic of Ireland are separate groups. By default ROI is bucketed with rUK in content. Everyone else is International.
- PG course field is `contact.course_of_interest_pgt` (with a trailing "t"). UG is `contact.course_of_interest_ug`. There's an optional fallback to `course_of_interest_pgt_international`.
- Response fields are `{{ response.NUMBER }}` (only in emails sent from a form response).
- The Gecko template wrapper already includes the 700px header banner. Never add another, and keep the email column at the header width (`emailWidth`, default 700, with `width:Wpx;max-width:100%` and `table-layout:fixed` wrapper tables; no media query for width).
- Buttons: the link fills the cell (`display:block`, `line-height:50px`, cell `height="50"`). Outlook and Abertay's Check Point gateway strip padding from links, so never rely on link padding.
- Plain-text web addresses get rewritten by Check Point and look terrible. "Words (https://…)" is auto-linked everywhere, and Checks warns about any left over.
- Emoji are wrapped in an emoji font span, or Outlook on Windows shows a box. The self-hosted fonts declare a Latin `unicode-range` so the builder's own text boxes don't either.
- Every generated template starts with `Made with Liquid Email Builder vX.Y.Z`, so you can tell which version produced what's in Gecko.

## Testing

```bash
npm install
npx playwright install chromium   # once
npm test                          # serves the site locally, runs the in-app self-test plus interface checks
```

- `tests/run.mjs` runs `window.__leb.selfTest()` (course rules, save and re-open, valid Liquid, link conversion, layout) and imports `tests/fixtures/pg1.html` and `pg2.html`. It renders each original and rebuilt template with LiquidJS for every course or domicile, and they must match. It also tests drag and drop, undo/redo and sequences, and that there are no outside requests.
- In the app: Menu (⋯) → Run self-test.
- If a test is timing-sensitive, make it wait for the page to settle rather than loosening the check.
- Add a self-test or interface check for every bug fixed.

## Releasing a change

Use `/release`, or follow these steps by hand:

1. Bump the version in **three** places: `APP_VERSION` in `index.html`, `version.json` (open copies use it to show the "newer version" bar, and a test checks it matches) and `package.json`. Use semantic versioning: fixes are patch releases, features are minor.
2. Add an entry at the top of `CHANGELOG.md` in plain language.
3. Run `npm test`. Everything must pass.
4. Commit with a clear message and push to `main`. GitHub Actions ("Checks") runs the tests and Pages updates within a couple of minutes.
5. Tell Sean what changed, and remind him to refresh (Ctrl+F5) and do a Gecko test send for anything that affects the email output.

Don't change GitHub Pages or repository settings. Sean does that.

## Known open items

- Still to confirm in Gecko: response-field syntax, the builder-data comment surviving Gecko's editor, image + text rows stacking on phones, and the hidden preview-text block showing as the inbox preview (Gecko's wrapper puts the header banner before it).
- Course keys come from the full Gecko values. `upgradeCourseKeys()` moves course choices saved against an older list onto the current one; keep it when the lists change.
