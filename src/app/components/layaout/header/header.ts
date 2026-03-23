import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from './logo/logo';
import { ApplicationName } from './application-name/application-name';
import { UserBadge } from './user-badge/user-badge';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Logo, ApplicationName, UserBadge, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
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
