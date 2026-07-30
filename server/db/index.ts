import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

type DrizzleClient = ReturnType<typeof createDb>

function createDb() {
  const sql = neon(process.env.DATABASE_URL!)
  return drizzle({ client: sql, schema })
}

// Lazily initialise so importing `db` (e.g. via server/utils re-exports pulled
// into unrelated route bundles) doesn't connect until a query actually runs.
let _db: DrizzleClient | undefined
export const db: DrizzleClient = new Proxy({} as DrizzleClient, {
  get(_target, prop, receiver) {
    _db ??= createDb()
    return Reflect.get(_db, prop, receiver)
  }
})
