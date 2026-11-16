# Counterpoint

The Counterpoint website. A static site built with [Eleventy](https://www.11ty.dev/) and hosted free on GitHub Pages. Every push to `main` rebuilds and republishes it automatically (about a minute).

## Everyday jobs

All of these can be done in the browser on GitHub: open the file, press the pencil icon, edit, then **Commit changes**.

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
| `image: /assets/img/photo.jpg` | Uses a photo (upload it to `src/assets/img/` first) |
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
| Add another column | `src/_data/columns.json` (it gets its own page, menu button and home page band) |
| Colours and type | the top of `src/assets/css/style.css` |

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
