import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from './logo/logo';
import { ApplicationName } from './application-name/application-name';
import { UserBadge } from './user-badge/user-badge';
import { DxDropDownButtonModule, DxTooltipModule } from 'devextreme-angular';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Logo, ApplicationName, UserBadge, RouterLink, DxDropDownButtonModule, DxTooltipModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  @Output() menuIconClicked = new EventEmitter<void>();
  @Output() userIconClicked = new EventEmitter<void>();

  private transloco = inject(TranslocoService);

  languages = [
    { code: 'it', label: 'IT' },
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'de', label: 'DE' },
  ];

  currentLang = signal(this.transloco.getActiveLang().toUpperCase());
  isOnline = signal(false);

  constructor() {
    this.transloco.langChanges$.subscribe(lang => {
      this.currentLang.set(lang.toUpperCase());
    });
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
