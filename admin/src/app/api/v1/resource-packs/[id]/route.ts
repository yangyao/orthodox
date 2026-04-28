import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { resourcePacks, resourceItems } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { success, error } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const packId = BigInt(id);

  const [pack] = await db
    .select()
    .from(resourcePacks)
    .where(eq(resourcePacks.id, packId));

  if (!pack) {
    return error("Resource pack not found", 404);
  }

  const items = await db
    .select()
    .from(resourceItems)
    .where(eq(resourceItems.packId, packId))
    .orderBy(asc(resourceItems.sortOrder), asc(resourceItems.createdAt));

  return success({
    ...pack,
    id: String(pack.id),
    bankId: pack.bankId ? String(pack.bankId) : null,
    items: items.map(item => ({
      ...item,
      id: String(item.id),
      packId: String(item.packId),
    })),
  });
}
