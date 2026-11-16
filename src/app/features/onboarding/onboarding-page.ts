import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { Role } from '../../core/models';
import { LmsStateService } from '../../core/state/lms-state.service';

const cleanName = (value: string) => value.trim().replace(/\s+/g, ' ');
const validName = (value: string) =>
  value.length >= 1 &&
  value.length <= 60 &&
  !Array.from(value).some(
    (character) => (character.codePointAt(0) ?? 0) < 32 || character.codePointAt(0) === 127,
  );

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './onboarding-page.html',
  styleUrl: './onboarding-page.scss',
})
export class OnboardingPage {
  private readonly fb = inject(FormBuilder);
  private readonly lms = inject(LmsStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly element = inject(ElementRef<HTMLElement>);
  readonly switchMode = this.route.snapshot.queryParamMap.get('mode') === 'switch';
  readonly existingProfiles = this.lms.profiles;
  readonly returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  roleLabel(role: Role): string {
    return role === 'athlete' ? 'Спортсмен' : role === 'coach' ? 'Тренер' : 'Ассистент';
  }
  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(60)]],
    lastName: ['', [Validators.required, Validators.maxLength(60)]],
    role: ['' as Role | '', Validators.required],
  });
  currentStep = 1;
  submitted = false;
  roleOptions: { id: Role; title: string; description: string }[] = [
    { id: 'athlete', title: 'Спортсмен', description: 'Личная лекция, прогресс, тест и форум.' },
    {
      id: 'coach',
      title: 'Тренер',
      description: 'Локальный обзор спортсменов и управление курсом.',
    },
    {
      id: 'assistant',
      title: 'Ассистент',
      description: 'Просмотр маршрута и разрешённой статистики без управления.',
    },
  ];

  chooseProfile(id: string): void {
    if (!this.lms.setProfile(id)) return;
    const requested = this.route.snapshot.queryParamMap.get('returnUrl');
    const safe =
      requested &&
      requested.startsWith('/') &&
      !requested.startsWith('//') &&
      !requested.startsWith('/onboarding')
        ? requested
        : null;
    this.router.navigateByUrl(safe ?? '/');
  }

  cancelSwitch(): void {
    this.router.navigateByUrl('/');
  }

  next(): void {
    this.submitted = true;
    this.normaliseNames();
    const first = this.form.controls.firstName;
    const last = this.form.controls.lastName;
    if (!validName(first.value)) first.setErrors({ nameInvalid: true });
    if (!validName(last.value)) last.setErrors({ nameInvalid: true });
    if (first.invalid || last.invalid) {
      (first.invalid ? first : last).markAsTouched();
      queueMicrotask(() => this.focusFirstInvalid());
      return;
    }
    this.currentStep = 2;
    this.submitted = false;
  }

  back(): void {
    this.currentStep = 1;
    this.submitted = false;
  }

  submit(): void {
    this.submitted = true;
    const role = this.form.controls.role;
    if (!role.value) {
      role.setErrors({ required: true });
      queueMicrotask(() => this.focusFirstInvalid());
      return;
    }
    const value = this.form.getRawValue();
    this.lms.createProfile(
      cleanName(value.firstName),
      cleanName(value.lastName),
      role.value as Role,
    );
    const requested = this.route.snapshot.queryParamMap.get('returnUrl');
    const safe =
      requested &&
      requested.startsWith('/') &&
      !requested.startsWith('//') &&
      !requested.startsWith('/onboarding')
        ? requested
        : null;
    const start = role.value === 'athlete' ? '/dashboard' : '/trainer';
    this.router.navigateByUrl(safe ?? start);
  }

  private normaliseNames(): void {
    this.form.controls.firstName.setValue(cleanName(this.form.controls.firstName.value));
    this.form.controls.lastName.setValue(cleanName(this.form.controls.lastName.value));
  }

  private focusFirstInvalid(): void {
    (this.element.nativeElement as HTMLElement)
      .querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }
}
