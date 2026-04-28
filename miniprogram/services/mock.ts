import { request } from "./request";
import { 
  MockPaper, 
  StartMockSessionResponse,
  PaginatedResponse
} from "./types";

export async function getMockPapers(bankId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<MockPaper>> {
  return request<PaginatedResponse<MockPaper>>({
    url: "/api/v1/mock/papers",
    method: "GET",
    data: { bankId, page, pageSize },
  });
}

export async function getMockPaperDetails(id: string): Promise<MockPaper> {
  return request<MockPaper>({
    url: `/api/v1/mock/papers/${id}`,
    method: "GET",
  });
}

export async function startMockSession(paperId: string): Promise<StartMockSessionResponse> {
  return request<StartMockSessionResponse>({
    url: "/api/v1/mock/sessions",
    method: "POST",
    data: { paperId },
  });
}
