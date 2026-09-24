import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "zod"

const postSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  description: z.string(),
})

// Slugs match the original Gatsby site's flat URLs (e.g. /journey-2020/),
// which are derived from each entry's containing folder name, not the collection name.
const folderNameAsId = ({ entry }: { entry: string }) => entry.split("/")[0]

const blog = defineCollection({
  loader: glob({
    pattern: "**/index.md",
    base: "./src/content/blog",
    generateId: folderNameAsId,
  }),
  schema: postSchema,
})

const portfolio = defineCollection({
  loader: glob({
    pattern: "**/index.md",
    base: "./src/content/portfolio",
    generateId: folderNameAsId,
  }),
  schema: postSchema,
})

export const collections = { blog, portfolio }
