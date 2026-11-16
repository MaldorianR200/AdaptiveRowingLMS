import { Injectable, signal } from '@angular/core';
import type { LocalProfile } from '../models';

export interface ForumReply {
  author: string;
  text: string;
  profileId?: string;
  isExample?: boolean;
}
export interface ForumThread {
  id: string;
  title: string;
  text: string;
  author: string;
  date: string;
  replies: ForumReply[];
  isExample?: boolean;
  profileId?: string;
}
const KEY = 'adaptive-rowing-forum';
const defaults: ForumThread[] = [
  {
    id: 'seed-1',
    title: 'Вопросы по технике безопасности',
    text: 'Какие сигналы важно согласовать перед занятием?',
    author: 'Анна Петрова',
    date: 'Пример темы',
    isExample: true,
    replies: [
      {
        author: 'Елена Волкова',
        text: 'Заранее обсудите сигналы начала, паузы и остановки.',
        isExample: true,
      },
    ],
  },
  {
    id: 'seed-2',
    title: 'Самоконтроль тренировочной нагрузки',
    text: 'Как удобнее фиксировать самочувствие после тренировки?',
    author: 'Михаил Соколов',
    date: 'Пример темы',
    isExample: true,
    replies: [],
  },
];

@Injectable({ providedIn: 'root' })
export class ForumService {
  readonly threads = signal<ForumThread[]>(this.load());
  add(title: string, text: string, author: string, profile?: LocalProfile | null): void {
    this.update([
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        text: text.trim(),
        author,
        date: new Date().toLocaleString('ru'),
        replies: [],
        profileId: profile?.id,
      },
      ...this.threads(),
    ]);
  }
  reply(threadId: string, text: string, author: string, profile?: LocalProfile | null): void {
    this.update(
      this.threads().map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              replies: [...thread.replies, { author, text: text.trim(), profileId: profile?.id }],
            }
          : thread,
      ),
    );
  }
  remove(threadId: string, canModerate: boolean): void {
    if (canModerate) this.update(this.threads().filter((thread) => thread.id !== threadId));
  }
  find(id: string): ForumThread | null {
    return this.threads().find((thread) => thread.id === id) ?? null;
  }
  private update(threads: ForumThread[]): void {
    this.threads.set(threads);
    try {
      localStorage.setItem(KEY, JSON.stringify(threads));
    } catch {
      /* session-only fallback is handled by the LMS state */
    }
  }
  private load(): ForumThread[] {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      return Array.isArray(parsed)
        ? parsed.filter(
            (thread): thread is ForumThread =>
              !!thread &&
              typeof thread === 'object' &&
              typeof (thread as ForumThread).id === 'string',
          )
        : defaults;
    } catch {
      return defaults;
    }
  }
}
