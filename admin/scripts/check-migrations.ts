import "dotenv/config";
import postgres from "postgres";

const check = async () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    const migrations = await sql`SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 5;`;
    console.log("Applied migrations in database:");
    console.table(migrations);
  } catch (e) {
    console.error("Failed to query migrations table", e);
  }
  
  process.exit(0);
};

check();
