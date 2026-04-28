export interface Banner {
  id: string;
  imageUrl: string;
  link?: string;
  title?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  order: number;
}

export interface QuestionBank {
  id: string;
  title: string;
  icon: string;
  categoryId: string;
  questionCount: number;
  updateDate: string;
  isFeatured?: boolean;
  description?: string;
  tags?: string[];
  isOpened?: boolean;
}

export interface MockPaper {
  id: string;
  bankId: string;
  title: string;
  paperYear?: number;
  totalQuestions: number;
  totalScore: number;
  passingScore?: number;
  durationMinutes: number;
  status: string;
}

export interface HomeData {
  banners: Banner[];
  featuredBanks: QuestionBank[];
}

export interface CatalogData {
  categories: Category[];
  banks: QuestionBank[];
}

export interface QuestionOption {
  label: string;
  text: string;
}

export interface Question {
  id: string;
  bankId: string;
  sectionId?: string | null;
  questionType: 'single' | 'multiple' | 'true_false';
  stem: string;
  options: QuestionOption[] | null;
  correctAnswer: string | string[];
  explanation?: string | null;
  difficulty: number;
}

export interface PracticeSession {
  id: string;
  userId: string;
  bankId: string;
  bankName?: string;
  sectionId?: string | null;
  mode: 'sequential' | 'random' | 'mistake';
  status: 'started' | 'finished';
  score?: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  createdAt: string;
  updatedAt: string;
  answers?: PracticeAnswer[];
}

export interface WrongQuestion {
  id: string;
  bankId: string;
  bankName: string;
  questionId: string;
  questionStem: string;
  wrongCount: number;
  masteryCount: number;
  updatedAt: string;
}

export interface FavoriteQuestion {
  id: string;
  bankId: string;
  bankName: string;
  questionId: string;
  questionStem: string;
  createdAt: string;
}

export interface NoteQuestion {
  id: string;
  bankId: string;
  bankName: string;
  questionId: string;
  questionStem: string;
  content: string;
  updatedAt: string;
}

export interface ResourcePack {
  id: string;
  bankId?: string | null;
  title: string;
  coverUrl?: string | null;
  description?: string | null;
  sortOrder: number;
  createdAt: string;
  items?: ResourceItem[];
}

export interface ResourceItem {
  id: string;
  packId: string;
  title: string;
  type: 'pdf' | 'link' | 'image';
  url: string;
  content?: string | null;
  sortOrder: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface PracticeAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  createdAt: string;
}

export interface StartSessionResponse {
  sessionId: string;
  questionIds: string[];
  totalQuestions: number;
}

export interface StartMockSessionResponse extends StartSessionResponse {
  durationMinutes: number;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  correctAnswer: string | string[];
  explanation?: string;
}
