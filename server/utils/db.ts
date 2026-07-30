// Re-export the drizzle client and schema tables from server/utils so they are
// auto-imported into every server route / util (Nuxt only auto-imports
// server/utils, not server/db).
export { db } from '../db'
export * from '../db/schema'
