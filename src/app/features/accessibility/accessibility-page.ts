import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  Attempt,
  DemoProfile,
  lecturePages,
  profiles,
  questions,
  topics,
} from '../../core/data/content';
import { LmsStateService } from '../../core/state/lms-state.service';
import { QuizGraderService } from '../../core/services/quiz-grader.service';
import { ForumService, ForumThread } from '../../core/services/forum.service';
import { QuizAnswer } from '../../core/services/quiz-grader.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accessibility-page.html',
})
export class AccessibilityPage {
  state = inject(LmsStateService);
  checks = [
    'Текстовые альтернативы иллюстраций',
    'Субтитры к видео',
    'Текстовая расшифровка видео',
    'Логичная структура и последовательная навигация',
    'Контраст и масштабирование текста',
    'Доступность управления с клавиатуры',
    'Возможность адаптации тестирования',
    'Понятные инструкции и критерии',
    'Структурированные доступные файлы',
    'Способ обратной связи и получения помощи',
  ];
  statuses: string[] = [];
  constructor() {
    try {
      this.statuses = JSON.parse(localStorage.getItem('adaptive-accessibility-checks') ?? '[]');
    } catch {
      this.statuses = [];
    }
    this.statuses = Array.from({ length: 10 }, (_, i) => this.statuses[i] ?? 'Не проверено');
  }
  setStatus(i: number, v: string) {
    this.statuses[i] = v;
    localStorage.setItem('adaptive-accessibility-checks', JSON.stringify(this.statuses));
  }
}
