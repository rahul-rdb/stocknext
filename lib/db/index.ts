import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!)

// fire connection via drizzle itself
export const db = drizzle({ client: sql });

// fire raw queries to neon sql
export {sql}
