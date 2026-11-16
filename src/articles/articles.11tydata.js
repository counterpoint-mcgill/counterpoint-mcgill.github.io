// Settings shared by every article in this folder.
export default {
  layout: "layouts/article.njk",
  tags: "articles",
  author: "Counterpoint",
  eleventyComputed: {
    permalink: (data) => `/articles/${data.page.fileSlug}/`,
    navKey: (data) => (data.column ? `/${data.column}/` : "/articles/"),
  },
};
