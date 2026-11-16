import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { questions, quizRules } from '../../core/data/content';
import { LmsStateService } from '../../core/state/lms-state.service';
import { QuizAnswer, QuizGraderService } from '../../core/services/quiz-grader.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-page.html',
})
export class QuizPage {
  state = inject(LmsStateService);
  router = inject(Router);
  readonly rules = quizRules;
  readonly questions = questions;
  private readonly grader = inject(QuizGraderService);
  answers: Record<string, QuizAnswer> = {};
  typeName(t: string) {
    return (
      (
        {
          single: 'Один ответ',
          multiple: 'Несколько ответов',
          matching: 'Соответствие',
          short: 'Короткий ответ',
          boolean: 'Верно / неверно',
        } as Record<string, string>
      )[t] ?? t
    );
  }
  isChecked(id: string, value: string) {
    return ((this.answers[id] ?? []) as string[]).includes(value);
  }
  toggle(id: string, value: string, event: Event) {
    const list = [...((this.answers[id] ?? []) as string[])];
    const checked = (event.target as HTMLInputElement).checked;
    this.answers[id] = checked ? [...list, value] : list.filter((v) => v !== value);
  }
  matchValue(id: string, key: string) {
    const answer = this.answers[id];
    return answer && typeof answer === 'object' && !Array.isArray(answer)
      ? ((answer as Record<string, string>)[key] ?? '')
      : '';
  }
  setMatch(id: string, key: string, value: string) {
    const answer = this.answers[id];
    const pairs =
      answer && typeof answer === 'object' && !Array.isArray(answer)
        ? (answer as Record<string, string>)
        : {};
    this.answers[id] = { ...pairs, [key]: value };
  }
  submit() {
    const profile = this.state.profile();
    if (
      !profile ||
      this.state.attempts().length >= quizRules.maxAttempts ||
      !this.state.lectureComplete()
    )
      return;
    const attempt = this.grader.createAttempt(profile.id, questions, this.answers);
    this.state.addAttempt(attempt);
    sessionStorage.setItem('adaptive-rowing-last-attempt', attempt.id);
    this.router.navigate(['/course/quiz/result']);
  }
}
