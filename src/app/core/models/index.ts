export type Role = 'athlete' | 'coach' | 'assistant';
export type QuestionType = 'single' | 'multiple' | 'matching' | 'short' | 'boolean';

export interface LocalProfile {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
  isDemo?: boolean;
}

export interface LecturePage {
  id: string;
  title: string;
  text: string[];
  takeaways: string[];
  illustration?: string;
  alt?: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  outcome: string;
  materials: string[];
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correct: string | string[] | Record<string, string>;
  explanation: string;
}

export interface Attempt {
  id: string;
  profileId: string;
  answers: Record<string, unknown>;
  scores: number[];
  total: number;
  passed: boolean;
  completedAt: string;
}

export interface StoredLmsState {
  version: 3;
  activeProfileId: string | null;
  profiles: LocalProfile[];
  completedPages: Record<string, string[]>;
  completedLectures: Record<string, boolean>;
  attempts: Attempt[];
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  topicVisibility: Record<string, boolean>;
}

export interface QuizRules {
  questionCount: number;
  lecturePageCount: number;
  maxAttempts: number;
  passingScore: number;
  matchingParts: number;
  totalScore: number;
}
