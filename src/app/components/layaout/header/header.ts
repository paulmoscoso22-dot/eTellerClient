import { Component, DestroyRef, EventEmitter, Output, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from './logo/logo';
import { ApplicationName } from './application-name/application-name';
import { UserBadge } from './user-badge/user-badge';
import { DxDropDownButtonModule, DxTooltipModule } from 'devextreme-angular';
import { TranslocoService } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Logo, ApplicationName, UserBadge, RouterLink, DxDropDownButtonModule, DxTooltipModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  @Output() menuIconClicked = new EventEmitter<void>();
  @Output() userIconClicked = new EventEmitter<void>();

  private transloco  = inject(TranslocoService);
  private destroyRef = inject(DestroyRef);

  languages = [
    { code: 'it', label: 'IT' },
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'de', label: 'DE' },
  ];

  currentLang   = signal(this.transloco.getActiveLang().toUpperCase());
  isOnline      = signal(false);
  lastUpdated   = signal<Date>(new Date());
  relativeTime  = signal<string>('adesso');

  get absoluteTimestamp(): string {
    return this.lastUpdated().toISOString();
  }

  get statusAriaLabel(): string {
    return this.isOnline()
      ? `Sistema operativo — aggiornato ${this.relativeTime()}`
      : `Sistema offline — aggiornato ${this.relativeTime()}`;
  }

  constructor() {
    this.transloco.langChanges$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => this.currentLang.set(lang.toUpperCase()));

    this.updateRelativeTime();
    interval(30_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateRelativeTime());
  }

  private updateRelativeTime(): void {
    const secs = Math.floor((Date.now() - this.lastUpdated().getTime()) / 1000);
    if (secs < 10)        this.relativeTime.set('adesso');
    else if (secs < 60)   this.relativeTime.set(`${secs}s fa`);
    else if (secs < 3600) this.relativeTime.set(`${Math.floor(secs / 60)}m fa`);
    else                  this.relativeTime.set(`${Math.floor(secs / 3600)}h fa`);
  }

  onLanguageSelect(e: any): void {
    this.transloco.setActiveLang(e.itemData.code);
  }

  onUserBadgeClick(): void {
    this.userIconClicked.emit();
  }

  onMenuIconClicked(): void {
    this.menuIconClicked.emit();
  }
}
