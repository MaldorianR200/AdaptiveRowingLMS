import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LmsStateService } from '../../../core/state/lms-state.service';
import type { Role } from '../../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeaderComponent {
  protected readonly state = inject(LmsStateService);
  protected readonly router = inject(Router);
  protected readonly roleName: Record<Role, string> = {
    athlete: 'спортсмен',
    coach: 'тренер',
    assistant: 'ассистент',
  };

  protected addProfile(): void {
    this.router.navigate(['/onboarding'], { queryParams: { returnUrl: this.router.url } });
  }

  protected switchUser(): void {
    this.router.navigate(['/onboarding'], {
      queryParams: { returnUrl: this.router.url, mode: 'switch' },
    });
  }
}
