import { HomeData, CatalogData, QuestionBank, PaginatedResponse } from "./types";
import { request } from "./request";

export async function getHomeData(): Promise<HomeData> {
  const result = await request<PaginatedResponse<QuestionBank>>({
    url: "/api/v1/banks?isRecommended=true&pageSize=10",
  });
  
  // For banners, we might still want mock or a separate API
  // Returning mock banners for now as we don't have a banners API yet
  const { MOCK_BANNERS } = require("./mock");

  return {
    banners: MOCK_BANNERS,
    featuredBanks: result.items.map(mapBank),
  };
}

export async function getCatalogData(): Promise<CatalogData> {
  const result = await request<PaginatedResponse<QuestionBank>>({
    url: "/api/v1/banks?pageSize=1000",
  });
  
  // Group categories - we might need a separate categories API too
  // Assuming the backend returns category info in the bank object or we fetch it separately
  // For now, let's just return all banks and unique categories from them
  
  const banks = result.items.map(mapBank);
  const categoriesMap = new Map();
  
  banks.forEach(bank => {
    if (bank.categoryId && !categoriesMap.has(bank.categoryId)) {
      categoriesMap.set(bank.categoryId, {
        id: bank.categoryId,
        name: (bank as any).categoryName || "其他", // Assuming backend returns categoryName
        order: 0
      });
    }
  });

  return {
    categories: Array.from(categoriesMap.values()),
    banks,
  };
}

export async function getBankDetail(id: string): Promise<QuestionBank> {
  const bank = await request<QuestionBank>({
    url: `/api/v1/banks/${id}`,
  });
  return mapBank(bank);
}

export async function openBank(id: string): Promise<void> {
  await request({
    url: `/api/v1/banks/${id}/open`,
    method: "POST",
  });
}

function mapBank(b: any): QuestionBank {
  return {
    id: String(b.id),
    title: b.name,
    icon: b.coverUrl,
    categoryId: String(b.categoryId),
    questionCount: b.questionCount || 0,
    updateDate: b.createdAt ? b.createdAt.split('T')[0] : '',
    isFeatured: b.isRecommended,
    description: b.description,
    tags: b.subtitle ? [b.subtitle] : [],
    isOpened: b.isOpened,
  };
}
