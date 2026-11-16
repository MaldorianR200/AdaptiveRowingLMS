import { Injectable } from '@angular/core';
import { quizRules } from '../data/content';
import type { Attempt, QuizQuestion, QuizRules } from '../models';

export type QuizAnswer = string | string[] | Record<string, string> | undefined;

@Injectable({ providedIn: 'root' })
export class QuizGraderService {
  readonly rules: QuizRules = quizRules;

  grade(questions: QuizQuestion[], answers: Record<string, QuizAnswer>): number[] {
    return questions.map((question) => this.gradeQuestion(question, answers[question.id]));
  }

  createAttempt(
    profileId: string,
    questions: QuizQuestion[],
    answers: Record<string, QuizAnswer>,
  ): Attempt {
    const scores = this.grade(questions, answers);
    const total = scores.reduce((sum, score) => sum + score, 0);
    return {
      id: crypto.randomUUID(),
      profileId,
      answers,
      scores,
      total,
      passed: total >= this.rules.passingScore,
      completedAt: new Date().toISOString(),
    };
  }

  private gradeQuestion(question: QuizQuestion, answer: QuizAnswer): number {
    if (question.type === 'single' || question.type === 'boolean')
      return answer === question.correct ? 1 : 0;
    if (question.type === 'short')
      return this.normalise(answer) === this.normalise(question.correct as string) ? 1 : 0;
    if (question.type === 'multiple') {
      const correct = question.correct as string[];
      const chosen = Array.isArray(answer) ? answer : [];
      if (correct.length === chosen.length && correct.every((value) => chosen.includes(value)))
        return 1;
      return chosen.length === 2 && chosen.every((value) => correct.includes(value)) ? 0.5 : 0;
    }
    const correct = question.correct as Record<string, string>;
    const pairs = answer && !Array.isArray(answer) && typeof answer === 'object' ? answer : {};
    const matched = Object.keys(correct).filter((key) => pairs[key] === correct[key]).length;
    return matched / this.rules.matchingParts;
  }

  private normalise(value: unknown): string {
    return String(value ?? '')
      .trim()
      .toLocaleLowerCase('ru');
  }
}
