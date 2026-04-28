import "dotenv/config";
import postgres from "postgres";

const inspect = async () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  const sql = postgres(process.env.DATABASE_URL);
  
  const columns = await sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'activation_codes'
    ORDER BY ordinal_position;
  `;
  
  console.log("Table: activation_codes");
  console.table(columns);
  
  process.exit(0);
};

inspect();
