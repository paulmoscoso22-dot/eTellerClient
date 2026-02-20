import { Component, computed, EventEmitter, Output, signal } from '@angular/core';
import { UserInfo } from '../../../../domain/user-info';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-user-badge',
  imports: [],
  templateUrl: './user-badge.html',
  styleUrl: './user-badge.scss',
})
export class UserBadge {
  private user = signal<UserInfo | undefined>(undefined);
  
  @Output() clicked = new EventEmitter<void>();

  // Computed signals per le proprietà derivate
  protected userInitials = computed(() => {
    const userInfo = this.user();
    if (!userInfo) {
      return '?';
    }

    const firstInitial = userInfo.firstName?.charAt(0).toUpperCase() || '?';
    const lastInitial = userInfo.lastName?.charAt(0).toUpperCase() || '?';

    return `${firstInitial}${lastInitial}`;
  });

  protected username = computed(() => {
    const userInfo = this.user();
    if (!userInfo) {
      return 'Unknown User';
    }
    
    return `${userInfo.firstName} ${userInfo.lastName}`.trim();
  });

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  private loadUserInfo(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user.set(user);
      },
      error: (error) => {
        console.error('Error loading user info in badge:', error);
      }
    });
  }

  onClick(): void {
    this.clicked.emit();
  }
}
