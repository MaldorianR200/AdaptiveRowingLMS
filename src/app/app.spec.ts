import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './pages';
import { LmsStateService } from './state.service';
import { questions } from './content';

describe('Adaptive Rowing LMS', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] }).compileComponents();
  });

  it('creates the application shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.brand')?.textContent).toContain('Adaptive Rowing');
  });

  it('provides five source questions and four lecture pages', async () => {
    const { lecturePages } = await import('./content');
    expect(questions).toHaveLength(5);
    expect(lecturePages).toHaveLength(4);
  });

  it('keeps demo profiles isolated and persists completion', () => {
    const state = TestBed.inject(LmsStateService);
    state.markPage('page-1');
    expect(state.completedPageIds()).toContain('page-1');
    state.setProfile('athlete-mikhail');
    expect(state.completedPageIds()).toHaveLength(0);
    state.markPage('page-2');
    state.setProfile('athlete-anna');
    expect(state.completedPageIds()).toEqual(['page-1']);
  });
});
