import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppFooterComponent } from './shared/components/app-footer/app-footer';
import { AppHeaderComponent } from './shared/components/app-header/app-header';
import { LmsStateService } from './core/state/lms-state.service';

@Component({
  standalone: true,
  imports: [RouterOutlet, AppHeaderComponent, AppFooterComponent],
  template: `<div
    class="shell"
    [class.contrast-mode]="state.settings().highContrast"
    [class.large-text]="state.settings().largeText"
    [class.reduce-motion]="state.settings().reducedMotion"
  >
    <app-header />
    <main class="app-main"><router-outlet /></main>
    <app-footer />
  </div>`,
})
export class AppLayout {
  readonly state = inject(LmsStateService);
}
