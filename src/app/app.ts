import { afterNextRender, Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { config } from 'devextreme/common';
import { licenseKey } from './devextreme-lincense';
import { BreadcrumbItem } from './domain/breadcrumb-item';
import { Theme } from './services/theme';
import { MenuItem } from './domain/menu-item';
import { MenuService } from './services/menu.service';
import { filter } from 'rxjs';
import { HeaderComponent } from './components/layaout/header/header';
import { Sidebar } from './components/layaout/sidebar/sidebar';
import { Breadcrumb } from './components/layaout/breadcrumb/breadcrumb';

config({ licenseKey });

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, Sidebar, Breadcrumb],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {

  protected readonly title = signal('eTeller.Angular');

  isDarkTheme = false;
  isSidebarVisible = signal(true);

  // Breadcrumb
  breadcrumbItems = signal<BreadcrumbItem[]>([]);

  // Menu reattivo dal service
  private menuService = inject(MenuService);
  menuItems = this.menuService.getMenuItems();
  
  // Espone rawMenuItems per il template
  get rawMenuItems(): MenuItem[] {
    return this.menuService.getCurrentMenuItems();
  }

  private navigationSubscription: any;

  constructor(
    private router: Router,
    private location: Location,
    private themeService: Theme
    //private lookupDataService: LookupDataService
  ) {
    // Effetto per reagire ai cambiamenti del tema
    effect(() => {
      this.isDarkTheme = this.themeService.currentTheme().includes('dark');
    });
  }

  async ngOnInit(): Promise<void> {
    // Inizializza il tema
    await this.initializeTheme();
   
  }

  private async initializeTheme(): Promise<void> {
    await this.themeService.initialize();
    this.isDarkTheme = this.themeService.isDarkTheme();
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  onMenuIconClicked(): void {
    this.isSidebarVisible.set(!this.isSidebarVisible());
    console.log('Menu icon clicked, sidebar visible:', this.isSidebarVisible());
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
    // Converti il trail di MenuItem in BreadcrumbItems
    const items: BreadcrumbItem[] = [];
    
    trail.forEach((item, index) => {
      items.push({
        label: item.label,
        link: item.url || '',
        isActive: index === trail.length - 1
      });
    });
    
    this.breadcrumbItems.set(items);
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
