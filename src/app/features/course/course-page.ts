import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageBase } from '../../core/state/page-base';
import { lecturePages, topics } from '../../core/data/content';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-page.html',
  styleUrl: './course-page.scss',
})
export class CoursePage extends PageBase {
  readonly safetyPages = lecturePages;
  readonly visibleTopics = computed(() =>
    topics.filter((topic) => this.state.topicVisibility()[topic.id] !== false),
  );
  readonly safetyProgress = computed(() =>
    Math.round(
      (this.state.completedPageIds().length / 4) * 80 + (this.state.bestScore() >= 4 ? 20 : 0),
    ),
  );
}
