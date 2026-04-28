import { request } from "./request";
import { 
  PracticeSession, 
  StartSessionResponse, 
  SubmitAnswerResponse,
  PaginatedResponse,
  WrongQuestion
} from "./types";

export async function startPracticeSession(
  bankId: string, 
  sectionId?: string, 
  mode: 'sequential' | 'random' | 'mistake' = 'sequential'
): Promise<StartSessionResponse> {
  return request<StartSessionResponse>({
    url: "/api/v1/practice/sessions",
    method: "POST",
    data: { bankId, sectionId, mode },
  });
}

export async function getPracticeHistory(page = 1, pageSize = 20): Promise<PaginatedResponse<PracticeSession>> {
  return request<PaginatedResponse<PracticeSession>>({
    url: "/api/v1/practice/history",
    method: "GET",
    data: { page, pageSize },
  });
}

export async function getMistakes(bankId?: string, page = 1, pageSize = 20): Promise<PaginatedResponse<WrongQuestion>> {
  return request<PaginatedResponse<WrongQuestion>>({
    url: "/api/v1/practice/mistakes",
    method: "GET",
    data: { bankId, page, pageSize },
  });
}

export async function removeMistake(id: string): Promise<void> {
  return request<void>({
    url: `/api/v1/practice/mistakes/${id}`,
    method: "DELETE",
  });
}

export async function getPracticeSession(id: string): Promise<PracticeSession> {
  return request<PracticeSession>({
    url: `/api/v1/practice/sessions/${id}`,
    method: "GET",
  });
}

export async function submitAnswer(
  sessionId: string, 
  questionId: string, 
  userAnswer: string | string[]
): Promise<SubmitAnswerResponse> {
  return request<SubmitAnswerResponse>({
    url: `/api/v1/practice/sessions/${sessionId}/submit`,
    method: "POST",
    data: { questionId, userAnswer },
  });
}

export async function finishPracticeSession(id: string): Promise<PracticeSession> {
  return request<PracticeSession>({
    url: `/api/v1/practice/sessions/${id}/finish`,
    method: "POST",
  });
}
