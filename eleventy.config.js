import { HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import { readFileSync } from "node:fs";
import halftone, { wave } from "./lib/halftone.js";

const site = JSON.parse(readFileSync("./src/_data/site.json", "utf8"));
const FONT_DIR = "node_modules/@fontsource/courier-prime/files";
const FONTS = ["400-normal", "400-italic", "700-normal"];

export default function (cfg) {
  // Rewrites every internal link so the site works both at a custom domain
  // and under a sub-path such as username.github.io/counterpoint/
  cfg.addPlugin(HtmlBasePlugin);

  cfg.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "posts", limit: 20 },
    metadata: {
      language: "en",
      title: site.title,
      subtitle: site.description,
      base: new URL(site.url).origin + "/",
      author: { name: site.title },
    },
  });

  cfg.addPassthroughCopy("src/assets/css");
  cfg.addPassthroughCopy("src/assets/js");
  cfg.addPassthroughCopy("src/assets/img");

  // The editors' admin page is plain static files, copied as they are
  cfg.ignores.add("src/admin/**");
  cfg.addPassthroughCopy("src/admin");
  for (const f of FONTS) {
    cfg.addPassthroughCopy({
      [`${FONT_DIR}/courier-prime-latin-${f}.woff2`]: `assets/fonts/courier-prime-${f}.woff2`,
    });
  }

  // Every article, newest first
  cfg.addCollection("posts", (api) =>
    api.getFilteredByTag("articles").sort((a, b) => b.date - a.date)
  );

  cfg.addFilter("inColumn", (posts, slug) =>
    posts.filter((p) => p.data.column === slug)
  );
  cfg.addFilter("notColumn", (posts) => posts.filter((p) => !p.data.column));
  cfg.addFilter("limit", (arr, n) => arr.slice(0, n));
  cfg.addFilter("skip", (arr, n) => arr.slice(n));
  cfg.addFilter("pad", (n) => String(n).padStart(2, "0"));
  cfg.addFilter("findColumn", (columns, slug) =>
    columns.find((c) => c.slug === slug)
  );

  cfg.addFilter("readableDate", (d) =>
    new Date(d)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
      .toUpperCase()
  );
  cfg.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));

  cfg.addFilter("readingTime", (html) => {
    const words = String(html || "")
      .replace(/<[^>]+>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;
    return `${Math.max(1, Math.round(words / 230))} MIN READ`;
  });

  // Generated halftone artwork for articles that have no photo
  cfg.addFilter("halftone", (title, variant) => halftone(title, variant));

  // A strip of the same dots, used as each page's own signature
  cfg.addFilter("wave", (title, color) => wave(title, color));

  // Pulls the video id out of any normal YouTube link
  cfg.addFilter("youtubeId", (url) => {
    const m = String(url || "").match(
      /(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/
    );
    return m ? m[1] : "";
  });

  cfg.addGlobalData("build", { year: new Date().getFullYear() });

  return {
    dir: { input: "src", output: "_site" },
    pathPrefix: process.env.PATH_PREFIX || "/",
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
