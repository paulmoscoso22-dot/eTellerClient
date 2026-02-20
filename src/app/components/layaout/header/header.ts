import { Component, EventEmitter, Output } from '@angular/core';
import { Logo } from './logo/logo';
import { ApplicationName } from './application-name/application-name';
import { VersionDisplay } from './version-display/version-display';
import { EnvironmentBadge } from './environment-badge/environment-badge';
import { UserBadge } from './user-badge/user-badge';

@Component({
  selector: 'app-header',
  imports: [Logo, ApplicationName, VersionDisplay, EnvironmentBadge, UserBadge],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  @Output() menuIconClicked = new EventEmitter<void>();
  @Output() userIconClicked = new EventEmitter<void>();

  onUserBadgeClick(): void {
    this.userIconClicked.emit();
  }

  onMenuIconClicked(): void {
    this.menuIconClicked.emit();
  }

}
