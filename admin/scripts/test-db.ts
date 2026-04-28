import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, {
  max: 5,
  idle_timeout: 10,
  connect_timeout: 10,
});

async function main() {
  try {
    const result = await sql`SELECT current_database(), current_user, version()`;
    const row = result[0];
    console.log("✅ 数据库连接成功！");
    console.log(`   数据库: ${row.current_database}`);
    console.log(`   用户:   ${row.current_user}`);
    console.log(`   版本:   ${row.version}`);
  } catch (err) {
    console.error("❌ 数据库连接失败:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
