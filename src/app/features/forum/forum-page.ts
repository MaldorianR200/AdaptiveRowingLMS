import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ForumService, ForumThread } from '../../core/services/forum.service';
import { LmsStateService } from '../../core/state/lms-state.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forum-page.html',
})
export class ForumPage {
  readonly state = inject(LmsStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly forum = inject(ForumService);
  readonly threads = this.forum.threads;
  readonly selectedId = this.route.snapshot.paramMap.get('id');
  title = '';
  text = '';
  drafts: Record<string, string> = {};

  add(): void {
    if (!this.title.trim() || !this.text.trim()) return;
    this.forum.add(this.title, this.text, this.state.profileName(), this.state.profile());
    this.title = '';
    this.text = '';
  }
  reply(thread: ForumThread): void {
    const value = this.drafts[thread.id]?.trim();
    if (!value) return;
    this.forum.reply(thread.id, value, this.state.profileName(), this.state.profile());
    this.drafts[thread.id] = '';
  }
  remove(id: string): void {
    this.forum.remove(id, this.state.role() === 'coach');
  }
}
