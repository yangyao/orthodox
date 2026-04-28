import { request } from "./request";
import { ResourcePack, PaginatedResponse } from "./types";

export async function getResourcePacks(bankId?: string, page = 1, pageSize = 20): Promise<PaginatedResponse<ResourcePack>> {
  return request<PaginatedResponse<ResourcePack>>({
    url: "/api/v1/resource-packs",
    method: "GET",
    data: { bankId, page, pageSize },
  });
}

export async function getResourcePackDetail(id: string): Promise<ResourcePack> {
  return request<ResourcePack>({
    url: `/api/v1/resource-packs/${id}`,
    method: "GET",
  });
}
