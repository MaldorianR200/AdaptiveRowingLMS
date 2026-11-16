import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LmsStateService } from './lms-state.service';
export abstract class PageBase {
  protected state = inject(LmsStateService);
  protected router = inject(Router);
}
