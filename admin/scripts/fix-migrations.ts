import "dotenv/config";
import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";

const fix = async () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  const sql = postgres(process.env.DATABASE_URL);

  const m15Path = path.join(process.cwd(), "drizzle/0015_tense_paper_doll.sql");
  const m15Sql = fs.readFileSync(m15Path, "utf8");

  console.log("Applying 0015 SQL...");
  await sql.unsafe(m15Sql);

  console.log("Updating migration log...");
  // 0014 hash was different in my manual check but let's use the one from shasum
  const h14 = "5b0ff4cdf61b2921f5cecaf9f6ef437def690c72a1197584a0953b347a4faafc";
  const h15 = "e20d703adc21a8a1584a5a63fd021ab6770d57695206368ccd11aaa72f2abfa3";

  await sql`INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (15, ${h14}, ${String(Date.now())}) ON CONFLICT (id) DO UPDATE SET hash = ${h14};`;
  await sql`INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (16, ${h15}, ${String(Date.now())}) ON CONFLICT (id) DO UPDATE SET hash = ${h15};`;

  console.log("✅ Done");
  process.exit(0);
};

fix().catch(err => {
  console.error(err);
  process.exit(1);
});
