# Liquid Email Builder

A drag-and-drop builder for Gecko email templates, made for Abertay University's marketing team.

Build an email from blocks (headings, text, images, buttons and more), show different versions to different people (by course, by domicile, or by any Gecko contact or form-response field), preview it as any contact, then copy the finished Liquid code into a Gecko template.

**Open the tool:** https://seanmillar25-a11y.github.io/liquidemailbuilder/

It runs entirely in your browser. It doesn't use AI, doesn't connect to any other service, and doesn't store personal data. Emails you save stay in your own browser unless you download them.

## Using it

1. Drag blocks from the left into the email.
2. Click a block to edit it on the right. Under **Who sees this**, choose *Everyone*, or *Course*, *Domicile* or *Other field* to give it versions.
3. Use **Viewing as** at the top to check what different contacts see.
4. Check the **Checks** list, then press **Copy for Gecko** and paste the code into your Gecko template.
5. Do a Gecko test send before the email goes live.

To change an email that's already live, open the menu (⋯) → **Edit a live Liquid template** and paste its HTML. Emails made in this builder re-open exactly. Older templates are rebuilt into blocks.

### Saving and sharing emails

- **Menu → Save / open** keeps emails in your browser.
- To share an email, use **Download project file** and put it in the team's SharePoint folder. A colleague opens it with **Open from project code**.

### Course lists, regions, saved links and snippets

These come from [`team-lists.json`](team-lists.json), so everyone uses the same lists. To change them for everyone, update that file. In the tool, **Menu → Team lists & settings → Download lists file** produces an updated copy.

## How the course matching works

Gecko dropdown values can contain an invisible character in place of a space, which breaks exact matching and multi-word `contains`. The builder therefore matches each course with one or more **single-word keywords** that no other course shares, joined with `and`, and checks sub-variants (for example "with Industrial Practise") before the base course. It never uses `case`/`when` for dropdown fields. The keyword table is under **Team lists & settings**.

## Releasing a change

1. Make the change in `index.html` (or `team-lists.json`).
2. Bump `APP_VERSION` in `index.html` and add a line to [`CHANGELOG.md`](CHANGELOG.md).
3. Push. The **Checks** workflow runs automatically and fails if the course rules, the Liquid output or the live-template comparisons break.
4. Open the site, run **Menu → Run self-test**, and do a Gecko test send.

Every change is in the commit history, so any earlier version can be restored.

## What's in this repository

| Path | What it is |
|---|---|
| `index.html` | The whole tool: one page, no build step. A map of its sections is at the top of the file. |
| `team-lists.json` | The team's course lists, regions, saved links, snippets and tracking settings. |
| `vendor/` | Fonts, the spreadsheet reader (for matrix import) and the Liquid engine (for the self-test), hosted here so the page loads nothing from elsewhere. Licences in `vendor/LICENSES.md`. |
| `tests/` | The automated checks and two test templates based on PG Emails 1 and 2. |
| `.github/workflows/test.yml` | Runs the checks on every push. |

Run the checks locally with `npm install`, `npx playwright install chromium` and `npm test`.
