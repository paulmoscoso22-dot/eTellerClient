import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuItem } from '../../domain/menu-item';
import { MenuService } from '../../services/menu.service';
import { HeaderComponent } from '../layout/header/header.component';
import { Sidebar } from '../layout/sidebar/sidebar.component';
import { Theme } from '../../services/theme';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, Sidebar, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnDestroy {

  isDarkTheme = false;
  isSidebarCollapsed = signal(false);

  private routeTitleKey = signal<string | null>(null);

  pageTitle = computed(() => {
    const key = this.routeTitleKey();
    return key ? this.transloco.translate(key) : '';
  });

  private menuService = inject(MenuService);

  get rawMenuItems(): MenuItem[] {
    return this.menuService.getCurrentMenuItems();
  }

  private navigationSubscription: any;
  private transloco = inject(TranslocoService);

  constructor(
    private router: Router,
    private themeService: Theme
  ) {
    effect(() => {
      this.isDarkTheme = this.themeService.currentTheme().includes('dark');
    });

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      let route = this.router.routerState.snapshot.root;
      while (route.firstChild) route = route.firstChild;
      this.routeTitleKey.set(route.data?.['titleKey'] ?? null);
    });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  onMenuIconClicked(): void {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  onUserIconClicked(): void {
    this.router.navigate(['/preferenze']);
  }

  onMenuItemClick(item: MenuItem): void {
    if (item.url && !item.children?.length) {
      this.router.navigateByUrl(item.url);
    }
  }
}
