export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  userAnswer?: number;
}

export interface QuestionGroup {
  id: string;
  part: number;
  context: string;
  questions: Question[];
}

export type AppMode = 'home' | 'learning_select' | 'learning_play' | 'exam_play' | 'result';

export interface ExamResult {
  groups: QuestionGroup[];
  totalQuestions: number;
  correctAnswers: number;
  timeSpentSeconds: number;
}
