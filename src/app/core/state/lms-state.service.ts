import { Injectable, computed, signal } from '@angular/core';
import type { Attempt, LocalProfile, Role, StoredLmsState } from '../models';
import { topics } from '../data/content';

export const LMS_STATE_KEY = 'adaptive-rowing-lms-state';
const VERSION = 3 as const;
const LEGACY_PROFILE_KEY = 'adaptive-rowing-local-profile';
const topicDefaults = Object.fromEntries(topics.map((topic) => [topic.id, true]));

function emptyState(): StoredLmsState {
  return {
    version: VERSION,
    activeProfileId: null,
    profiles: [],
    completedPages: {},
    completedLectures: {},
    attempts: [],
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    topicVisibility: topicDefaults,
  };
}

const isRole = (value: unknown): value is Role =>
  value === 'athlete' || value === 'coach' || value === 'assistant';

const isProfile = (value: unknown): value is LocalProfile => {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<LocalProfile>;
  return (
    typeof profile.id === 'string' &&
    typeof profile.firstName === 'string' &&
    typeof profile.lastName === 'string' &&
    isRole(profile.role) &&
    typeof profile.createdAt === 'string'
  );
};

@Injectable({ providedIn: 'root' })
export class LmsStateService {
  private readonly state = signal<StoredLmsState>(this.load());
  readonly profile = computed(
    () =>
      this.state().profiles.find((profile) => profile.id === this.state().activeProfileId) ?? null,
  );
  readonly profiles = computed(() => this.state().profiles);
  readonly hasProfile = computed(() => this.profile() !== null);
  readonly role = computed<Role | null>(() => this.profile()?.role ?? null);
  readonly attempts = computed(() =>
    this.state().attempts.filter((attempt) => attempt.profileId === this.profile()?.id),
  );
  readonly completedPageIds = computed(() => {
    const id = this.profile()?.id;
    return id ? (this.state().completedPages[id] ?? []) : [];
  });
  readonly lectureComplete = computed(() => {
    const id = this.profile()?.id;
    return id ? (this.state().completedLectures[id] ?? false) : false;
  });
  readonly bestScore = computed(() =>
    this.attempts().reduce((best, attempt) => Math.max(best, attempt.total), 0),
  );
  readonly settings = computed(() => ({
    highContrast: this.state().highContrast,
    largeText: this.state().largeText,
    reducedMotion: this.state().reducedMotion,
  }));
  readonly topicVisibility = computed(() => this.state().topicVisibility);
  readonly persistenceWarning = signal(false);
  readonly storageMessage = signal<string | null>(null);

  constructor() {
    this.persist();
  }

  createProfile(firstName: string, lastName: string, role: Role): LocalProfile {
    const profile: LocalProfile = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      role,
      createdAt: new Date().toISOString(),
    };
    this.update({ profiles: [...this.state().profiles, profile], activeProfileId: profile.id });
    return profile;
  }

  setProfile(id: string): boolean {
    if (!this.state().profiles.some((profile) => profile.id === id)) return false;
    this.update({ activeProfileId: id });
    return true;
  }

  clearActiveProfile(): void {
    this.update({ activeProfileId: null });
  }

  profileName(profile: LocalProfile | null = this.profile()): string {
    return profile ? `${profile.firstName} ${profile.lastName}` : '';
  }

  markPage(id: string): void {
    const profile = this.profile();
    if (!profile || this.completedPageIds().includes(id)) return;
    this.update({
      completedPages: {
        ...this.state().completedPages,
        [profile.id]: [...this.completedPageIds(), id],
      },
    });
  }

  completeLecture(): void {
    const profile = this.profile();
    if (!profile || this.completedPageIds().length !== 4) return;
    this.update({
      completedLectures: { ...this.state().completedLectures, [profile.id]: true },
    });
  }

  addAttempt(attempt: Attempt): boolean {
    if (
      !this.profile() ||
      attempt.profileId !== this.profile()?.id ||
      this.attempts().length >= 2 ||
      !this.lectureComplete()
    ) {
      return false;
    }
    this.update({ attempts: [...this.state().attempts, attempt] });
    return true;
  }

  profileProgress(id: string) {
    const attempts = this.state().attempts.filter((attempt) => attempt.profileId === id);
    return {
      pages: (this.state().completedPages[id] ?? []).length,
      lecture: this.state().completedLectures[id] ?? false,
      attempts,
      best: attempts.reduce((best, attempt) => Math.max(best, attempt.total), 0),
    };
  }

  athleteProfiles(): LocalProfile[] {
    return this.state().profiles.filter((profile) => profile.role === 'athlete');
  }

  resetProfile(id: string): void {
    if (this.role() !== 'coach') return;
    this.update({
      completedPages: { ...this.state().completedPages, [id]: [] },
      completedLectures: { ...this.state().completedLectures, [id]: false },
      attempts: this.state().attempts.filter((attempt) => attempt.profileId !== id),
    });
  }

  setSetting(key: 'highContrast' | 'largeText' | 'reducedMotion', value: boolean): void {
    this.update({ [key]: value });
  }

  setTopicVisible(id: string, value: boolean): void {
    if (this.role() === 'coach') {
      this.update({ topicVisibility: { ...this.state().topicVisibility, [id]: value } });
    }
  }

  resetAll(): void {
    this.state.set(emptyState());
    this.persist();
  }

  private update(patch: Partial<StoredLmsState>): void {
    this.state.update((state) => ({ ...state, ...patch }));
    this.persist();
  }

  private load(): StoredLmsState {
    const raw = this.readStorage(LMS_STATE_KEY) ?? this.readStorage(LEGACY_PROFILE_KEY);
    if (!raw) return emptyState();

    try {
      const parsed: unknown = JSON.parse(raw);
      const migrated = this.migrate(parsed);
      if (migrated) return migrated;
      this.storageMessage.set(
        'Сохранённые данные устарели или повреждены. Создайте новый профиль.',
      );
      return emptyState();
    } catch {
      this.persistenceWarning.set(true);
      this.storageMessage.set('Данные браузера повреждены. Работа продолжается с пустым профилем.');
      return emptyState();
    }
  }

  private migrate(value: unknown): StoredLmsState | null {
    if (!value || typeof value !== 'object') return null;
    const candidate = value as Partial<StoredLmsState> & {
      selectedProfileId?: string;
      version?: number;
    };
    const legacyVersion = candidate.version as number | undefined;
    if (legacyVersion === VERSION && Array.isArray(candidate.profiles)) {
      const profiles = candidate.profiles.filter(isProfile);
      if (profiles.length !== candidate.profiles.length) return null;
      return {
        ...emptyState(),
        ...candidate,
        profiles,
        topicVisibility: { ...topicDefaults, ...(candidate.topicVisibility ?? {}) },
      } as StoredLmsState;
    }
    if (legacyVersion === 2 && Array.isArray(candidate.profiles)) {
      const profiles = candidate.profiles
        .filter(isProfile)
        .map((profile) => ({ ...profile, isDemo: true }));
      return {
        ...emptyState(),
        ...candidate,
        version: VERSION,
        activeProfileId: null,
        profiles,
        topicVisibility: { ...topicDefaults, ...(candidate.topicVisibility ?? {}) },
      };
    }
    if (legacyVersion === 1 && typeof candidate.selectedProfileId === 'string') {
      const demoProfiles: LocalProfile[] = [
        {
          id: 'legacy-athlete-anna',
          firstName: 'Анна',
          lastName: 'Петрова',
          role: 'athlete',
          createdAt: new Date().toISOString(),
          isDemo: true,
        },
        {
          id: 'legacy-athlete-mikhail',
          firstName: 'Михаил',
          lastName: 'Соколов',
          role: 'athlete',
          createdAt: new Date().toISOString(),
          isDemo: true,
        },
        {
          id: 'legacy-coach',
          firstName: 'Елена',
          lastName: 'Волкова',
          role: 'coach',
          createdAt: new Date().toISOString(),
          isDemo: true,
        },
        {
          id: 'legacy-assistant',
          firstName: 'Илья',
          lastName: 'Морозов',
          role: 'assistant',
          createdAt: new Date().toISOString(),
          isDemo: true,
        },
      ];
      const oldId = candidate.selectedProfileId;
      const profileMap: Record<string, string> = {
        'athlete-anna': 'legacy-athlete-anna',
        'athlete-mikhail': 'legacy-athlete-mikhail',
        coach: 'legacy-coach',
        assistant: 'legacy-assistant',
      };
      const remapPages = (map: Record<string, string[]>): Record<string, string[]> =>
        Object.fromEntries(Object.entries(map).map(([id, value]) => [profileMap[id] ?? id, value]));
      const remapLectures = (map: Record<string, boolean>): Record<string, boolean> =>
        Object.fromEntries(Object.entries(map).map(([id, value]) => [profileMap[id] ?? id, value]));
      return {
        ...emptyState(),
        version: VERSION,
        activeProfileId: null,
        profiles: demoProfiles,
        completedPages: remapPages(candidate.completedPages ?? {}),
        completedLectures: remapLectures(candidate.completedLectures ?? {}),
        attempts: (candidate.attempts ?? []).map((attempt) => ({
          ...attempt,
          profileId: profileMap[attempt.profileId] ?? attempt.profileId,
        })),
        topicVisibility: { ...topicDefaults, ...(candidate.topicVisibility ?? {}) },
      };
    }
    return null;
  }

  private readStorage(key: string): string | null {
    try {
      return localStorage.getItem(key) ?? sessionStorage.getItem(key);
    } catch {
      this.persistenceWarning.set(true);
      this.storageMessage.set(
        'Хранилище браузера недоступно. Данные сохраняются только до закрытия вкладки.',
      );
      return null;
    }
  }

  private persist(): void {
    const serialized = JSON.stringify(this.state());
    try {
      localStorage.setItem(LMS_STATE_KEY, serialized);
    } catch {
      try {
        sessionStorage.setItem(LMS_STATE_KEY, serialized);
        this.persistenceWarning.set(true);
        this.storageMessage.set('Данные сохраняются только до закрытия вкладки.');
      } catch {
        this.persistenceWarning.set(true);
        this.storageMessage.set('Хранилище браузера недоступно. Данные не будут сохранены.');
      }
    }
  }
}
