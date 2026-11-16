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
  templateUrl: './not-found-page.html',
})
export class NotFoundPage {}
