import "dotenv/config";
import { db } from "../src/lib/db";
import { resourcePacks, resourceItems, questionBanks } from "../src/lib/schema";

async function seedResources() {
  console.log("Seeding resource packs and items...");

  const [bank] = await db.select().from(questionBanks).limit(1);
  const bankId = bank ? bank.id : null;

  const [pack] = await db.insert(resourcePacks).values({
    bankId,
    title: "考公必备资料包",
    description: "包含历年真题、面试技巧和高频考点总结。",
    coverUrl: "https://images.unsplash.com/photo-1512418490979-92798ccc13b0?q=80&w=2070&auto=format&fit=crop",
    status: "active",
    sortOrder: 1,
  }).returning();

  console.log(`Created resource pack: ${pack.title} (ID: ${pack.id})`);

  await db.insert(resourceItems).values([
    {
      packId: pack.id,
      title: "2024行测高频考点总结.pdf",
      type: "pdf",
      url: "https://example.com/materials/2024-xingce-points.pdf",
      content: "共50页，详细梳理了行测各个板块的核心考点。",
      sortOrder: 1,
    },
    {
      packId: pack.id,
      title: "申论写作万能模板.pdf",
      type: "pdf",
      url: "https://example.com/materials/shenlun-templates.pdf",
      content: "涵盖各类公文写作模板，助力申论高分。",
      sortOrder: 2,
    },
    {
      packId: pack.id,
      title: "面试礼仪视频教程",
      type: "link",
      url: "https://example.com/videos/interview-etiquette",
      content: "点击跳转至视频学习平台。",
      sortOrder: 3,
    },
    {
      packId: pack.id,
      title: "考公心态建设.jpg",
      type: "image",
      url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop",
      content: "一张励志背景图，陪你渡过备考难关。",
      sortOrder: 4,
    }
  ]);

  console.log("Seeded 4 resource items.");

  // Create another pack
  const [pack2] = await db.insert(resourcePacks).values({
    title: "零基础入门指南",
    description: "适合刚开始准备考试的同学。",
    status: "active",
    sortOrder: 2,
  }).returning();

  await db.insert(resourceItems).values([
    {
      packId: pack2.id,
      title: "考试大纲解析.pdf",
      type: "pdf",
      url: "https://example.com/materials/syllabus.pdf",
      sortOrder: 1,
    }
  ]);

  console.log("Finished seeding resources.");
}

seedResources()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
