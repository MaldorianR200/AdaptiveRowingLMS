import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { quizRules, questions } from '../../core/data/content';
import { LmsStateService } from '../../core/state/lms-state.service';
import { QuizGraderService } from '../../core/services/quiz-grader.service';
import { ForumService, ForumThread } from '../../core/services/forum.service';
import { QuizAnswer } from '../../core/services/quiz-grader.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './result-page.html',
})
export class ResultPage {
  state = inject(LmsStateService);
  questions = questions;
  readonly attempt =
    this.state
      .attempts()
      .find((attempt) => attempt.id === sessionStorage.getItem('adaptive-rowing-last-attempt')) ??
    this.state.attempts().at(-1);
  percent() {
    return Math.round(((this.attempt?.total ?? 0) / quizRules.totalScore) * 100);
  }
}
