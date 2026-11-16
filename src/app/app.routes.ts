import { Routes } from '@angular/router';
import { roleGuard, quizGuard } from './guards';
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages').then(m => m.HomePage) },
  { path: 'course', loadComponent: () => import('./pages').then(m => m.CoursePage) },
  { path: 'course/topics/:id', loadComponent: () => import('./pages').then(m => m.TopicPage) },
  { path: 'course/lecture', loadComponent: () => import('./pages').then(m => m.LecturePageView) },
  { path: 'course/lecture/:page', loadComponent: () => import('./pages').then(m => m.LecturePageView) },
  { path: 'course/quiz', canActivate: [quizGuard], loadComponent: () => import('./pages').then(m => m.QuizPage) },
  { path: 'course/quiz/result', loadComponent: () => import('./pages').then(m => m.ResultPage) },
  { path: 'materials', loadComponent: () => import('./pages').then(m => m.MaterialsPage) },
  { path: 'forum', loadComponent: () => import('./pages').then(m => m.ForumPage) },
  { path: 'forum/:id', loadComponent: () => import('./pages').then(m => m.ForumPage) },
  { path: 'dashboard', canActivate: [roleGuard(['athlete'])], loadComponent: () => import('./pages').then(m => m.DashboardPage) },
  { path: 'trainer', canActivate: [roleGuard(['coach', 'assistant'])], loadComponent: () => import('./pages').then(m => m.TrainerPage) },
  { path: 'accessibility', loadComponent: () => import('./pages').then(m => m.AccessibilityPage) },
  { path: 'report', loadComponent: () => import('./pages').then(m => m.ReportPage) },
  { path: '**', loadComponent: () => import('./pages').then(m => m.NotFoundPage) },
];
