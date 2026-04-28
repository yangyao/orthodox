#!/usr/bin/env node
/**
 * One-click import: creates bank structure + imports 719 questions directly via DB.
 * Idempotent — safe to re-run.
 * Usage: node scripts/import-net-zero.mjs
 */

import postgres from "postgres";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATABASE_URL = "postgresql://yangyaoapp:Automizely2020%24@gz-postgres-29yzbk11.sql.tencentcdb.com:20980/postgres";

const sql = postgres(DATABASE_URL);

async function findOrCreate(table, uniqueKey, insertFn) {
  const keyCol = Object.keys(uniqueKey)[0];
  const keyVal = uniqueKey[keyCol];
  const [existing] = await sql`SELECT * FROM ${sql(table)} WHERE ${sql(keyCol)} = ${keyVal}`;
  if (existing) return existing;
  const [created] = await insertFn();
  return created;
}

async function insertQuestions(items, bankId, sectionId) {
  let count = 0;
  for (const item of items) {
    await sql`
      INSERT INTO questions (bank_id, section_id, question_type, stem, options, correct_answer, explanation, difficulty, source_label, sort_order)
      VALUES (
        ${bankId}, ${sectionId}, ${item.questionType}, ${item.stem},
        ${item.options ? JSON.stringify(item.options) : null}::jsonb,
        ${JSON.stringify(item.correctAnswer)}::jsonb,
        ${item.explanation ?? null}, ${item.difficulty}, ${item.sourceLabel}, ${item.sortOrder ?? 0}
      )
    `;
    count++;
    if (count % 50 === 0) {
      process.stdout.write(`   已导入 ${count}/${items.length}\r`);
    }
  }
  return count;
}

async function main() {
  console.log("=== 淨零碳規劃管理師 題庫一鍵導入 ===\n");

  // 1. Category
  console.log("1. 题库分类...");
  const category = await findOrCreate("bank_categories", { code: "net-zero" }, () => sql`
    INSERT INTO bank_categories (code, name, sort_order, is_visible)
    VALUES ('net-zero', '淨零碳規劃管理師', 1, true) RETURNING *
  `);
  console.log(`   ✓ 分类 ID: ${category.id}`);

  // 2. Bank
  console.log("2. 题库...");
  const bank = await findOrCreate("question_banks", { code: "net-zero-beginner" }, () => sql`
    INSERT INTO question_banks (category_id, code, name, subtitle, description, sale_type, status, sort_order)
    VALUES (${category.id}, 'net-zero-beginner', '淨零碳規劃管理師-初級能力鑑定', '考古題題庫（113-115 年度）', '彙整「淨零碳規劃管理師-初級能力鑑定」113-115 年度考古題，共 719 題。', 'free', 'published', 1)
    RETURNING *
  `);
  console.log(`   ✓ 题库 ID: ${bank.id}`);

  // Check if questions already exist for this bank
  const [{ count: existing }] = await sql`SELECT count(*)::int as count FROM questions WHERE bank_id = ${bank.id}`;
  if (existing > 0) {
    console.log(`\n   ⚠ 题库已有 ${existing} 题，跳过导入`);
    console.log(`   管理页面：http://localhost:3001/banks/${bank.id}/questions`);
    await sql.end();
    return;
  }

  // 3. Edition
  console.log("3. 卷册...");
  const [edition] = await sql`
    INSERT INTO bank_editions (bank_id, name, version_label, sort_order, is_active)
    VALUES (${bank.id}, '考古題合集', '2024', 1, true)
    RETURNING *
  `;
  console.log(`   ✓ 卷册 ID: ${edition.id}`);

  // 4. Sections
  console.log("4. 章节...");
  const [section1] = await sql`
    INSERT INTO bank_sections (edition_id, title, section_type, sort_order)
    VALUES (${edition.id}, '考科一（淨零碳規劃管理基礎概論）', 'chapter', 1)
    RETURNING *
  `;
  console.log(`   ✓ 考科一 section ID: ${section1.id}`);

  const [section2] = await sql`
    INSERT INTO bank_sections (edition_id, title, section_type, sort_order)
    VALUES (${edition.id}, '考科二（淨零碳盤查規範與程序概要）', 'chapter', 2)
    RETURNING *
  `;
  console.log(`   ✓ 考科二 section ID: ${section2.id}`);

  // 5. Import 考科一
  console.log("\n5. 导入考科一题目...");
  const data1 = JSON.parse(readFileSync(join(__dirname, "data", "kaokao1-questions.json"), "utf-8"));
  const count1 = await insertQuestions(data1.items, bank.id, section1.id);
  await sql`UPDATE bank_sections SET question_count = ${count1} WHERE id = ${section1.id}`;
  console.log(`   ✓ 考科一：${count1} 题              `);

  // 6. Import 考科二
  console.log("6. 导入考科二题目...");
  const data2 = JSON.parse(readFileSync(join(__dirname, "data", "kaokao2-questions.json"), "utf-8"));
  const count2 = await insertQuestions(data2.items, bank.id, section2.id);
  await sql`UPDATE bank_sections SET question_count = ${count2} WHERE id = ${section2.id}`;
  console.log(`   ✓ 考科二：${count2} 题              `);

  console.log(`\n=== 导入完成！共 ${count1 + count2} 题 ===`);
  console.log(`管理页面：http://localhost:3001/banks/${bank.id}/questions`);

  await sql.end();
}

main().catch(async (e) => {
  console.error("\n❌ 导入失败:", e.message);
  await sql.end();
  process.exit(1);
});
