import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import type { Role } from './models';
import { LmsStateService } from './state/lms-state.service';

export const onboardingGuard: CanActivateFn = (route, state) => {
  const lms = inject(LmsStateService);
  if (lms.hasProfile()) return true;
  const returnUrl =
    state.url.startsWith('/') && !state.url.startsWith('/onboarding') ? state.url : '/';
  return inject(Router).createUrlTree(['/onboarding'], { queryParams: { returnUrl } });
};
export const roleGuard =
  (roles: Role[]): CanActivateFn =>
  () => {
    const lms = inject(LmsStateService);
    return lms.role() && roles.includes(lms.role()!) ? true : inject(Router).parseUrl('/');
  };
export const quizGuard: CanActivateFn = () => {
  const lms = inject(LmsStateService);
  return lms.lectureComplete() && lms.attempts().length < 2
    ? true
    : inject(Router).parseUrl('/course/lecture');
};
