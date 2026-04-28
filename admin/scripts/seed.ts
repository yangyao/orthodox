import "dotenv/config";
import bcrypt from "bcryptjs";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await sql`
    INSERT INTO admins (username, password_hash, role)
    VALUES (${"admin"}, ${passwordHash}, ${"super_admin"})
    ON CONFLICT (username) DO NOTHING
  `;

  console.log("✅ 种子数据插入完成 (admin / admin123)");
  await sql.end();
}

main().catch((err) => {
  console.error("❌ 种子数据插入失败:", err);
  process.exit(1);
});
