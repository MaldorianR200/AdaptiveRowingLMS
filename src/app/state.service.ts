import { Injectable, computed, signal } from '@angular/core';
import { Attempt, profiles, Role } from './content';

interface StoredState { version: 1; selectedProfileId: string; completedPages: Record<string, string[]>; completedLectures: Record<string, boolean>; attempts: Attempt[]; highContrast: boolean; largeText: boolean; reducedMotion: boolean; topicVisibility: Record<string, boolean>; }
const KEY = 'adaptive-rowing-lms-state';
const initial: StoredState = { version: 1, selectedProfileId: 'athlete-anna', completedPages: {}, completedLectures: {}, attempts: [], highContrast: false, largeText: false, reducedMotion: false, topicVisibility: { foundations: true, safety: true, rules: true, 'self-control': true } };

@Injectable({ providedIn: 'root' })
export class LmsStateService {
  private state = signal<StoredState>(this.load());
  readonly profile = computed(() => profiles.find(p => p.id === this.state().selectedProfileId) ?? profiles[0]);
  readonly role = computed<Role>(() => this.profile().role);
  readonly attempts = computed(() => this.state().attempts.filter(a => a.profileId === this.profile().id));
  readonly completedPageIds = computed(() => this.state().completedPages[this.profile().id] ?? []);
  readonly lectureComplete = computed(() => this.state().completedLectures[this.profile().id] ?? false);
  readonly bestScore = computed(() => this.attempts().reduce((best, a) => Math.max(best, a.total), 0));
  readonly settings = computed(() => ({ highContrast: this.state().highContrast, largeText: this.state().largeText, reducedMotion: this.state().reducedMotion }));
  readonly topicVisibility = computed(() => this.state().topicVisibility);

  constructor() { this.persist(); }
  setProfile(id: string): void { this.update({ selectedProfileId: id }); }
  markPage(id: string): void { const current = this.completedPageIds(); if (!current.includes(id)) this.update({ completedPages: { ...this.state().completedPages, [this.profile().id]: [...current, id] } }); }
  completeLecture(): void { if (this.completedPageIds().length === 4) this.update({ completedLectures: { ...this.state().completedLectures, [this.profile().id]: true } }); }
  addAttempt(attempt: Attempt): void { this.update({ attempts: [...this.state().attempts, attempt] }); }
  profileProgress(id: string): { pages: number; lecture: boolean; attempts: Attempt[]; best: number } { const attempts = this.state().attempts.filter(a => a.profileId === id); return { pages: (this.state().completedPages[id] ?? []).length, lecture: this.state().completedLectures[id] ?? false, attempts, best: attempts.reduce((best, a) => Math.max(best, a.total), 0) }; }
  resetProfile(id: string): void { this.update({ completedPages: { ...this.state().completedPages, [id]: [] }, completedLectures: { ...this.state().completedLectures, [id]: false }, attempts: this.state().attempts.filter(a => a.profileId !== id) }); }
  setSetting(key: 'highContrast' | 'largeText' | 'reducedMotion', value: boolean): void { this.update({ [key]: value } as Partial<StoredState>); }
  setTopicVisible(id: string, value: boolean): void { this.update({ topicVisibility: { ...this.state().topicVisibility, [id]: value } }); }
  resetAll(): void { this.state.set(initial); this.persist(); }
  private update(patch: Partial<StoredState>): void { this.state.update(s => ({ ...s, ...patch })); this.persist(); }
  private load(): StoredState { try { const raw = localStorage.getItem(KEY); if (!raw) return initial; const parsed = JSON.parse(raw) as StoredState; return parsed.version === 1 ? { ...initial, ...parsed } : initial; } catch { return initial; } }
  private persist(): void { try { localStorage.setItem(KEY, JSON.stringify(this.state())); } catch { /* local storage is optional */ } }
}
