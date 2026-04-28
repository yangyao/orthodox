import "dotenv/config";
import { db } from "../src/lib/db";
import { users, questionBanks, questions, favorites, notes } from "../src/lib/schema";
import { eq, and } from "drizzle-orm";

async function testFavoritesAndNotes() {
  console.log("Testing Favorites and Notes logic...");

  // 1. Get or create a test user
  let [testUser] = await db.select().from(users).limit(1);
  if (!testUser) {
    console.log("Creating test user...");
    [testUser] = await db.insert(users).values({
      openid: "test_openid_fav_notes",
    }).returning();
  }
  console.log(`Using user: ${testUser.id}`);

  // 2. Get a question to favorite/note
  const [testQuestion] = await db.select().from(questions).limit(1);
  if (!testQuestion) {
    console.error("No questions found in database. Please run seed script first.");
    return;
  }
  console.log(`Using question: ${testQuestion.id}`);

  // 3. Test Toggle Favorite
  console.log("\n--- Testing Favorites ---");
  const userId = testUser.id;
  const questionId = testQuestion.id;
  const bankId = testQuestion.bankId;

  // Check initial state
  const [initialFav] = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.questionId, questionId)));
  console.log(`Initial favorite status: ${!!initialFav}`);

  // Toggle: Add
  if (!initialFav) {
    console.log("Adding to favorites...");
    await db.insert(favorites).values({ userId, questionId, bankId });
  } else {
    console.log("Removing from favorites...");
    await db.delete(favorites).where(eq(favorites.id, initialFav.id));
  }

  const [afterToggleFav] = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.questionId, questionId)));
  console.log(`After toggle favorite status: ${!!afterToggleFav}`);

  // 4. Test Notes Upsert
  console.log("\n--- Testing Notes ---");
  const testNoteContent = `This is a test note created at ${new Date().toISOString()}`;

  const [existingNote] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.questionId, questionId)));

  if (existingNote) {
    console.log("Updating existing note...");
    await db.update(notes).set({ content: testNoteContent, updatedAt: new Date() }).where(eq(notes.id, existingNote.id));
  } else {
    console.log("Creating new note...");
    await db.insert(notes).values({ userId, questionId, bankId, content: testNoteContent });
  }

  const [afterUpsertNote] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.questionId, questionId)));
  console.log(`After upsert note content: ${afterUpsertNote?.content}`);

  // 5. Test Listing
  console.log("\n--- Testing Listing ---");
  const userFavorites = await db.select().from(favorites).where(eq(favorites.userId, userId));
  console.log(`User has ${userFavorites.length} favorites.`);

  const userNotes = await db.select().from(notes).where(eq(notes.userId, userId));
  console.log(`User has ${userNotes.length} notes.`);

  console.log("\nFavorites and Notes test completed!");
}

testFavoritesAndNotes().catch(console.error).finally(() => process.exit());
