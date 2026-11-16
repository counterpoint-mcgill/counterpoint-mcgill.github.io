# Counterpoint

The Counterpoint website. A static site built with [Eleventy](https://www.11ty.dev/) and hosted free on GitHub Pages. Every push to `main` rebuilds and republishes it automatically (about a minute).

## The admin page (for the team)

Editors do not need GitHub. They go to **https://counterpoint-mcgill.github.io/admin/**, type the team password, and get an editor where they can:

- write, edit and delete **Articles** (to make one an interview, pick Interviews under "Column"), with pictures uploaded straight from their computer or phone
- add **Videos** by pasting a YouTube link
- add or rename **Columns**
- edit the **About page** and the **Site settings** (description, contact email, Instagram)

Pressing **Save** publishes: the live site updates about a minute later. Closing the tab locks the editor again.

### One-time setup (site owner)

The first time the admin page is opened it shows a **Set up** screen with the steps: create a GitHub key limited to this repository, paste it in, and choose the team password. The key is saved in the repository encrypted with that password (`src/admin/key.json`), so the team only ever needs the password. To change the password or replace an expired key, use the small link under the password box and go through the same screen again.

Things to know:

- The password is the only lock, and this repository is public, so the encrypted key can be downloaded by anyone and guessed at offline. Pick a long password, share it privately, and never write it in this repository.
- Whoever has the password can change anything in this repository's files, not just articles. Every save is recorded in the repository's history under the key owner's name and can be undone from there.
- If the password leaks, delete the key on GitHub (Settings → Developer settings → Personal access tokens) and set up again with a new one.
- What the editor shows is defined in `src/admin/config.yml`; the editor itself is [Sveltia CMS](https://sveltiacms.app).

## Editing by hand

Everything the admin page does can also be done in the browser on GitHub: open the file, press the pencil icon, edit, then **Commit changes**.

### Publish an article

Add a new file to `src/articles/`, named like `my-headline.md` (the file name becomes the web address). Start it with this block, then write the piece underneath:

```
---
title: My headline
description: One sentence shown under the headline and on cards.
date: 2026-11-20
author: Your Name
---

The article starts here.
```

Optional extra lines for that top block:

| Line | What it does |
| --- | --- |
| `column: interviews` | Files the piece under the Interviews column |
| `image: /assets/img/photo.jpg` | Uses a photo (upload it to `src/assets/img/uploads/` first) |
| `imageAlt: A short description` | Describes the photo for screen readers |
| `imageCredit: Photo by Someone` | Caption under the photo |
| `cover: red` | Colour of the generated artwork when there is no photo: `paper`, `black`, `red`, `ruby` or `gray` |

Formatting (subheadings, pull quotes, lists) is shown in the sample article `src/articles/notes-on-form.md`. In interviews, write each question as `### The question?`.

The four articles there now are samples. Delete them when real ones are ready.

### Other edits

| To change | Edit |
| --- | --- |
| About page blurb | `src/about.md` |
| Site description, contact email, Instagram handle | `src/_data/site.json` |
| Add a video | `src/_data/videos.json`, e.g. `[{ "title": "Name", "url": "https://youtu.be/...", "date": "2026-11-20" }]` |
| Add another column | `src/_data/columnList.json` (it gets its own page, menu button and home page band) |
| Colours and type | the top of `src/assets/css/style.css` |
| The colour of a page's heading band | `tone:` at the top of the page file (`gray`, `red` or `ruby`; leave it out for plain paper). Each page's dotted waveform is drawn automatically from its title |
| The opening sequence (plays once per visit) | the "Opening sequence" section at the bottom of `src/assets/css/style.css` |
| The phone layout | the "Phones" section in `src/assets/css/style.css` |
| Animation (speeds, effects) | the "Motion" sections at the bottom of `src/assets/css/style.css` and `src/assets/js/site.js` |

### Contact form

The form sends through [FormSubmit](https://formsubmit.co) (free, no account) to the `contactEmail` in `src/_data/site.json`. The first message ever sent triggers a one-time activation email to that address; click the link in it and the form is live. That activation email also contains a random code you can put in `contactEmail` in place of the address if you would rather not show it on the site.

## Working on the design locally

```
npm install
npm start      # preview at http://localhost:8080
npm run build  # writes the finished site to _site/
```

## Hosting

`.github/workflows/deploy.yml` publishes to GitHub Pages. One-time setup: in the repository on GitHub, go to **Settings → Pages** and set **Source** to **GitHub Actions**. If you later move to a custom domain, add it on that same page and update `url` in `src/_data/site.json`.
