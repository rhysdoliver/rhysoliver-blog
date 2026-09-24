# rhysoliver.dev

Personal blog and portfolio, built with [Astro](https://astro.build) and deployed on [Netlify](https://www.netlify.com/).

## Development

```shell
npm install
npm run dev
```

Site runs at `http://localhost:4321`.

## Content

- Blog posts live in `src/content/blog/<slug>/index.md`
- Portfolio entries live in `src/content/portfolio/<slug>/index.md`

Each entry needs `title`, `date` and `description` frontmatter. Images referenced with a relative path (e.g. `./photo.png`) can be placed alongside the markdown file and are optimized automatically.

URLs are flat (e.g. `/journey-2020/`, `/ftr/`) to preserve links from the previous version of the site.

## Build

```shell
npm run build
```

Outputs a static site to `dist/`. Netlify builds this automatically via `netlify.toml`.
