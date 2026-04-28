import { request } from "./request";
import { Question, PaginatedResponse, FavoriteQuestion, NoteQuestion } from "./types";

export async function getQuestion(id: string): Promise<Question> {
  try {
    return await request<Question>({
      url: `/api/v1/questions/${id}`,
      method: "GET",
    });
  } catch (error) {
    console.warn("Failed to fetch real question, using mock", error);
    return getMockQuestion(id);
  }
}

// Alias for compatibility
export const getQuestionDetail = getQuestion;

export async function toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
  return request<{ isFavorite: boolean }>({
    url: `/api/v1/questions/${id}/favorite`,
    method: "POST",
  });
}

export async function getFavoriteStatus(id: string): Promise<{ isFavorite: boolean }> {
  return request<{ isFavorite: boolean }>({
    url: `/api/v1/questions/${id}/favorite`,
    method: "GET",
  });
}

export async function upsertNote(id: string, content: string): Promise<void> {
  return request<void>({
    url: `/api/v1/questions/${id}/note`,
    method: "POST",
    data: { content },
  });
}

export async function getNote(id: string): Promise<{ note: string }> {
  return request<{ note: string }>({
    url: `/api/v1/questions/${id}/note`,
    method: "GET",
  });
}

export async function getMyFavorites(bankId?: string, page = 1, pageSize = 20): Promise<PaginatedResponse<FavoriteQuestion>> {
  return request<PaginatedResponse<FavoriteQuestion>>({
    url: "/api/v1/me/favorites",
    method: "GET",
    data: { bankId, page, pageSize },
  });
}

export async function getMyNotes(bankId?: string, page = 1, pageSize = 20): Promise<PaginatedResponse<NoteQuestion>> {
  return request<PaginatedResponse<NoteQuestion>>({
    url: "/api/v1/me/notes",
    method: "GET",
    data: { bankId, page, pageSize },
  });
}

function getMockQuestion(id: string): Question {
  return {
    id,
    bankId: "bank1",
    questionType: "single",
    stem: `这是题目 ${id} 的题干内容。请选择正确选项。`,
    options: [
      { label: "A", text: "选项 A 的内容" },
      { label: "B", text: "选项 B 的内容" },
      { label: "C", text: "选项 C 的内容" },
      { label: "D", text: "选项 D 的内容" },
    ],
    correctAnswer: "A",
    explanation: "这是题目解析内容，解释为什么要选 A。",
    difficulty: 1,
  };
}
