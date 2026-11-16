import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { lecturePages, topics } from '../../core/data/content';
import { topicLessons } from '../../core/data/topic-lessons';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topic-page.html',
  styleUrl: './topic-page.scss',
})
export class TopicPage {
  private readonly route = inject(ActivatedRoute);
  private readonly topicId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id'))), {
    initialValue: null,
  });
  readonly topic = computed(() => topics.find((topic) => topic.id === this.topicId()) ?? null);
  readonly sections = computed(() => topicLessons[this.topicId() ?? ''] ?? []);
  readonly safetyPages = lecturePages;
}
