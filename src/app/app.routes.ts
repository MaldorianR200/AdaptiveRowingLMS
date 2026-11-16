import { Routes } from '@angular/router';
import { onboardingGuard, quizGuard, roleGuard } from './core/guards';
import { AppLayout } from './app-layout';

const appChildren: Routes = [
  {
    path: '',
    canActivate: [onboardingGuard],
    loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'course',
    canActivate: [onboardingGuard],
    loadComponent: () => import('./features/course/course-page').then((m) => m.CoursePage),
  },
  {
    path: 'course/topics/:id',
    canActivate: [onboardingGuard],
    loadComponent: () => import('./features/topics/topic-page').then((m) => m.TopicPage),
  },
  {
    path: 'course/lecture',
    canActivate: [onboardingGuard],
    loadComponent: () => import('./features/lecture/lecture-page').then((m) => m.LecturePageView),
  },
  {
    path: 'course/lecture/:page',
    canActivate: [onboardingGuard],
    loadComponent: () => import('./features/lecture/lecture-page').then((m) => m.LecturePageView),
  },
  {
    path: 'course/quiz',
    canActivate: [onboardingGuard, quizGuard],
    loadComponent: () => import('./features/quiz/quiz-pages').then((m) => m.QuizPage),
  },
  {
    path: 'course/quiz/result',
    canActivate: [onboardingGuard],
    loadComponent: () => import('./features/quiz/quiz-pages').then((m) => m.ResultPage),
  },
  {
    path: 'materials',
    canActivate: [onboardingGuard],
    loadComponent: () => import('./features/materials/materials-page').then((m) => m.MaterialsPage),
  },
  {
    path: 'forum',
    canActivate: [onboardingGuard],
    loadComponent: () => import('./features/forum/forum-page').then((m) => m.ForumPage),
  },
  {
    path: 'forum/:id',
    canActivate: [onboardingGuard],
    loadComponent: () => import('./features/forum/forum-page').then((m) => m.ForumPage),
  },
  {
    path: 'dashboard',
    canActivate: [onboardingGuard, roleGuard(['athlete'])],
    loadComponent: () => import('./features/dashboard/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'trainer',
    canActivate: [onboardingGuard, roleGuard(['coach', 'assistant'])],
    loadComponent: () => import('./features/trainer/trainer-page').then((m) => m.TrainerPage),
  },
  {
    path: 'accessibility',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./features/accessibility/accessibility-page').then((m) => m.AccessibilityPage),
  },
  {
    path: 'report',
    canActivate: [onboardingGuard],
    loadComponent: () => import('./features/report/report-page').then((m) => m.ReportPage),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];

export const routes: Routes = [
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./features/onboarding/onboarding-page').then((m) => m.OnboardingPage),
  },
  { path: '', component: AppLayout, canActivate: [onboardingGuard], children: appChildren },
  { path: '**', redirectTo: 'onboarding' },
];
