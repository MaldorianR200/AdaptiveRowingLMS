import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LmsStateService } from './state.service';
export const roleGuard = (roles: string[]): CanActivateFn => () => { const state = inject(LmsStateService); return roles.includes(state.role()) ? true : inject(Router).parseUrl('/'); };
export const quizGuard: CanActivateFn = () => { const state = inject(LmsStateService); return state.lectureComplete() && state.attempts().length < 2 ? true : inject(Router).parseUrl('/course/lecture'); };
