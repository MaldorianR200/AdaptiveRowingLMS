import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { LmsStateService } from './core/state/lms-state.service';
import { lecturePages, questions } from './core/data/content';
import { OnboardingPage } from './features/onboarding/onboarding-page';

describe('Adaptive Rowing LMS', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App, OnboardingPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('creates the application router host', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });

  it('keeps onboarding outside the shared layout', () => {
    const route = routes.find((item) => item.path === 'onboarding');
    expect(route?.component).toBeUndefined();
    expect(route?.loadComponent).toBeDefined();
  });

  it('starts onboarding with no preselected role and preserves names when returning', () => {
    const fixture = TestBed.createComponent(OnboardingPage);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.controls.firstName.setValue(' Анна ');
    component.form.controls.lastName.setValue('Иванова');
    component.next();
    expect(component.currentStep).toBe(2);
    component.back();
    expect(component.form.controls.firstName.value).toBe('Анна');
    expect(component.form.controls.role.value).toBe('');
  });

  it('provides five source questions and four lecture pages', () => {
    expect(questions).toHaveLength(5);
    expect(lecturePages).toHaveLength(4);
  });

  it('keeps local profiles isolated and persists completion', () => {
    const state = TestBed.inject(LmsStateService);
    const anna = state.createProfile('Анна', 'Петрова', 'athlete');
    state.markPage('page-1');
    expect(state.completedPageIds()).toContain('page-1');
    const mikhail = state.createProfile('Михаил', 'Соколов', 'athlete');
    expect(state.completedPageIds()).toHaveLength(0);
    state.markPage('page-2');
    state.setProfile(anna.id);
    expect(state.completedPageIds()).toEqual(['page-1']);
    expect(mikhail.id).not.toBe(anna.id);
  });
});
