import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { topics } from '../../core/data/content';
import type { LocalProfile } from '../../core/models';
import { LmsStateService } from '../../core/state/lms-state.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trainer-page.html',
})
export class TrainerPage {
  readonly state = inject(LmsStateService);
  readonly topics = topics;
  readonly athletes = this.state.athleteProfiles;

  pageCount(id: string): number {
    return this.state.profileProgress(id).pages;
  }
  done(id: string): boolean {
    return this.state.profileProgress(id).lecture;
  }
  best(id: string): number {
    return this.state.profileProgress(id).best;
  }
  attemptCount(id: string): number {
    return this.state.profileProgress(id).attempts.length;
  }
  reset(profile: LocalProfile): void {
    if (confirm(`Сбросить учебные результаты профиля ${this.state.profileName(profile)}?`)) {
      this.state.resetProfile(profile.id);
    }
  }
}
