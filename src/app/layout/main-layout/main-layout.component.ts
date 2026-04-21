import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { BreadcrumbItem } from '../../domain/breadcrumb-item';
import { MenuItem } from '../../domain/menu-item';
import { MenuService } from '../../services/menu.service';
import { HeaderComponent } from '../../components/layaout/header/header';
import { Sidebar } from '../../components/layaout/sidebar/sidebar';
import { Breadcrumb } from '../../components/layaout/breadcrumb/breadcrumb';
import { Theme } from '../../services/theme';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, Sidebar, Breadcrumb, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnDestroy {

  isDarkTheme = false;
  isSidebarVisible = signal(true);

  // Breadcrumb
  breadcrumbItems = signal<BreadcrumbItem[]>([]);

  // Menu reattivo dal service
  private menuService = inject(MenuService);
  // menuItems = this.menuService.getMenuItems(); use direct access in template or getter
  
  // Espone rawMenuItems per il template
  get rawMenuItems(): MenuItem[] {
    return this.menuService.getCurrentMenuItems();
  }

  private navigationSubscription: any;

  private transloco = inject(TranslocoService);

  constructor(
    private router: Router,
    private themeService: Theme
  ) {
     // Effetto per reagire ai cambiamenti del tema - layout specific if needed, or rely on global styles
     effect(() => {
        this.isDarkTheme = this.themeService.currentTheme().includes('dark');
      });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  onMenuIconClicked(): void {
    this.isSidebarVisible.set(!this.isSidebarVisible());
  }

  onUserIconClicked(): void {
    console.log('User icon clicked - navigating to preferenze');
    this.router.navigate(['/preferenze']);
  }

  onMenuItemClick(item: MenuItem): void {
    console.log('Menu item clicked:', item.label, item.url);
    if (item.url) {
      this.router.navigateByUrl(item.url);
    }
  }

  onBreadcrumbChanged(trail: MenuItem[]): void {
    const items: BreadcrumbItem[] = trail.map((item, index) => ({
      label: this.formatBreadcrumbLabel(item.label),
      link: item.url || '',
      isActive: index === trail.length - 1
    }));
    this.breadcrumbItems.set(items);
  }

  private formatBreadcrumbLabel(label: string): string {
    const translated = this.transloco.translate(label);
    // Se la traduzione non è stata trovata transloco restituisce la chiave stessa
    const text = translated.startsWith('menu.') ? translated.slice(5) : translated;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  onBreadcrumbItemClick(item: BreadcrumbItem): void {
    if (item.link) {
      // Trova il MenuItem corrispondente nel menu
      const menuItem = this.menuService.findMenuItemByUrl(item.link);
      if (menuItem) {
        // Deseleziona tutti e seleziona quello cliccato
       this.deselectAllMenuItems(this.menuService.getCurrentMenuItems());
        menuItem.isSelected = true;
      }
      
      this.router.navigateByUrl(item.link);
    }
  }

  private deselectAllMenuItems(items: MenuItem[]): void {
    for (const item of items) {
      item.isSelected = false;
      if (item.children && item.children.length > 0) {
        this.deselectAllMenuItems(item.children);
      }
    }
  }
}
