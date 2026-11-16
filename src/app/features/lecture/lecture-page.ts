import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map } from 'rxjs';
import { lecturePages } from '../../core/data/content';
import { PageBase } from '../../core/state/page-base';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lecture-page.html',
})
export class LecturePageView extends PageBase {
  readonly pages = lecturePages;
  private readonly route = inject(ActivatedRoute);
  private readonly pageRouter = inject(Router);
  private readonly pageNumber = toSignal(
    this.route.paramMap.pipe(
      map((params) => Number(params.get('page') ?? 1)),
      map((page) =>
        Number.isInteger(page) && page >= 1 && page <= lecturePages.length ? page : 1,
      ),
      distinctUntilChanged(),
    ),
    { initialValue: 1 },
  );
  readonly current = computed(() => this.pageNumber() - 1);
  readonly page = computed(() => this.pages[this.current()]);

  mark(): void {
    this.state.markPage(this.page().id);
  }
  go(page: number): void {
    this.pageRouter.navigate(['/course/lecture', Math.max(1, Math.min(this.pages.length, page))]);
  }
  finish(): void {
    this.state.completeLecture();
    this.pageRouter.navigate(['/course/quiz']);
  }
}
