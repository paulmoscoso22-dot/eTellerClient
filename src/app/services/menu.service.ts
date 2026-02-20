import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MenuItem } from '../domain/menu-item';
import { ApiService } from './api.service';
import { TranslocoService } from '@jsverse/transloco';

export interface MenuConfig {
  enableSearch: boolean;
  enableIcons: boolean;
  maxDepth: number;
  defaultExpanded: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MenuService  {
   private readonly api = inject(ApiService);
  private readonly transloco = inject(TranslocoService);
  
  // Menu items reattivo che si aggiorna quando cambia la lingua
  private menuItemsSignal = signal<MenuItem[]>([]);
  
  // Menu items filtrati per la ricerca
  private filteredMenuItemsSignal = signal<MenuItem[]>([]);
  
  // Query di ricerca corrente
  private searchQuerySignal = signal<string>('');
  
  // Menu items raw dal backend (con chiavi i18n)
  private rawMenuItems: MenuItem[] = [];

  // Menu items predefinito con struttura completa
  public menuItems: MenuItem[] = [
    {
      label: 'menu.operations',
      icon: 'money',
      isVisible: true,
      children: [
        {
          label: 'menu.contiCorrenti',
          icon: 'card',
          isVisible: true,
          children: [
            {
              label: 'menu.versamento',
              url: 'versamento',
              icon: 'arrowdown',
              isVisible: true
            },
            {
              label: 'menu.prelievo',
              url: 'prelievo',
              icon: 'arrowup',
              isVisible: true
            },
            {
              label: 'menu.estrattoConto',
              url: 'estratto-conto',
              icon: 'doc',
              isVisible: true
            }
          ]
        },
        {
          label: 'menu.cambi',
          icon: 'globe',
          isVisible: true,
          children: [
            {
              label: 'menu.bigliettiBanca',
              url: 'biglietti-banca',
              icon: 'money',
              isVisible: true,
              children: [
                { label: 'menu.acquisto', icon: 'purchase', isVisible: true },
                { label: 'menu.vendita', icon: 'sale', isVisible: true }
              ]
            },
            {
              label: 'menu.moneteMetalli',
              url: 'monete-metalli',
              icon: 'gold',
              isVisible: true,
              children: [
                { label: 'menu.acquisto', icon: 'purchase', isVisible: true },
                { label: 'menu.vendita', icon: 'sale', isVisible: true }
              ]
            }
          ]
        },
        {
          label: 'menu.travelersCheques',
          icon: 'traveler',
          isVisible: true,
          children: [
            {
              label: 'menu.acquisto',
              url: 'travelers-acquisto',
              icon: 'purchase',
              isVisible: true
            },
            {
              label: 'menu.vendita',
              url: 'travelers-vendita',
              icon: 'sale',
              isVisible: true
            }
          ]
        },
        {
          label: 'menu.assegniCheques',
          icon: 'check',
          isVisible: true,
          children: [
            {
              label: 'menu.versamentoCc',
              url: 'versamento-cc',
              icon: 'arrowdown',
              isVisible: true
            }
          ]
        }
      ]
    },
    {
      label: 'menu.archivi',
      icon: 'folder',
      isVisible: true,
      children: [
        {
          label: 'menu.ricercaReport',
          icon: 'search',
          isVisible: true,
          children: [
            { label: 'menu.ricerca', url: 'ricerca', icon: 'search', isVisible: true }
          ]
        },
        {
          label: 'menu.report',
          icon: 'chart',
          isVisible: true,
          children: [
            { label: 'menu.attesaBenefondo', url: 'attesa-benefondo', icon: 'hourglass', isVisible: true },
            { label: 'menu.giornaleCassa', url: 'giornale-cassa', icon: 'book', isVisible: true },
            { label: 'menu.operazioniAnnullate', url: 'operazioni-annullate', icon: 'close', isVisible: true },
            { label: 'menu.totaliCassa', url: 'totali-cassa', icon: 'sum', isVisible: true }
          ]
        }
      ]
    },
    {
      label: 'menu.vigilanza',
      icon: 'warning',
      isVisible: true,
      children: [
        {
          label: 'menu.ricerca',
          icon: 'search',
          isVisible: true,
          children: [
            { label: 'menu.ricercaOperazioni', url: 'ricerca-operazioni', icon: 'search', isVisible: true }
          ]
        },
        {
          label: 'menu.gestione',
          icon: 'config',
          isVisible: true,
          children: [
            { label: 'menu.gestioneRegole', url: 'gestione-regole', icon: 'ruler', isVisible: true },
            { label: 'menu.gestioneComparentiAde', url: 'gestione-comparenti-ade', icon: 'group', isVisible: true }
          ]
        }
      ]
    },
    {
      label: 'menu.help',
      icon: 'help',
      isVisible: true,
      children: [
        { label: 'menu.help', url: 'help', icon: 'help', isVisible: true }
      ]
    },
    {
      label: 'menu.manager',
      icon: 'menu',
      isVisible: true,
      children: [
        {
          label: 'menu.sicurezza',
          icon: 'gear',
          isVisible: true,
          children: [
            { label: 'menu.infoAutorizzazioni', url: 'info-autorizzazioni', icon: 'key', isVisible: true },
            { label: 'menu.funzioni', url: 'funzioni', icon: 'tasks', isVisible: true },
            { label: 'menu.personalizzazioni', url: 'personalizzazioni', icon: 'palette', isVisible: true },
            { label: 'menu.ruoli', url: 'ruoli', icon: 'group', isVisible: true },
            { label: 'menu.utenti', url: 'utenti', icon: 'user', isVisible: true },
            { label: 'menu.utentiCollegati', url: 'utenti-collegati', icon: 'people', isVisible: true }
          ]
        },
        {
          label: 'menu.cassePeriferiche',
          icon: 'database',
          isVisible: true,
          children: [
            { label: 'menu.casse', url: 'casse', icon: 'inbox', isVisible: true },
            { label: 'menu.contiCassa', url: 'conti-cassa', icon: 'card', isVisible: true },
            { label: 'menu.periferiche', url: 'periferiche', icon: 'resource', isVisible: true }
          ]
        },
        {
          label: 'menu.informazioni',
          icon: 'info',
          isVisible: true,
          children: [
            { label: 'menu.gestioneMessaggiHost', url: 'gestione-messaggi-host', icon: 'message', isVisible: true },
            { label: 'menu.trace', url: 'trace', icon: 'tracepointlog', isVisible: true },
            { label: 'menu.logSchedTask', url: 'log-sched-task', icon: 'file', isVisible: true }
          ]
        },
        {
          label: 'menu.divise',
          icon: 'globe',
          isVisible: true,
          children: [
            { label: 'menu.aggiornaDatiAnagrafici', url: 'aggiorna-dati-anagrafici', icon: 'refresh', isVisible: true },
            { label: 'menu.coppieDivise', url: 'coppie-divise', icon: 'link', isVisible: true },
            { label: 'menu.corsi', url: 'corsi', icon: 'chart', isVisible: true },
            { label: 'menu.datiAnagrafici', url: 'dati-anagrafici', icon: 'doc', isVisible: true },
            { label: 'menu.spread', url: 'spread', icon: 'columnchooser', isVisible: true }
          ]
        },
        {
          label: 'menu.tabelle',
          icon: 'table',
          isVisible: true,
          children: [
            { label: 'menu.categorieConti', url: 'categorie-conti', icon: 'folder', isVisible: true },
            { label: 'menu.causaleMovimenti', url: 'causale-movimenti', icon: 'event', isVisible: true },
            { label: 'menu.forceTrx', url: 'force-trx', icon: 'lightning', isVisible: true },
            { label: 'menu.funzioniTraccie', url: 'funzioni-traccie', icon: 'tracer', isVisible: true },
            { label: 'menu.gestioneErrori', url: 'gestione-errori', icon: 'warning', isVisible: true },
            { label: 'menu.livelloAccessoFunzioni', url: 'livello-accesso-funzioni', icon: 'hierarchy', isVisible: true },
            { label: 'menu.nomiTabelle', url: 'nomi-tabelle', icon: 'table', isVisible: true },
            { label: 'menu.scheduledTasks', url: 'scheduled-tasks', icon: 'clock', isVisible: true },
            { label: 'menu.servizi', url: 'servizi', icon: 'service', isVisible: true },
            { label: 'menu.statoBenefondo', url: 'stato-benefondo', icon: 'info', isVisible: true },
            { label: 'menu.statoTransazione', url: 'stato-transazione', icon: 'info', isVisible: true },
            { label: 'menu.tipoConti', url: 'tipo-conti', icon: 'folder', isVisible: true },
            { label: 'menu.tipoDevice', url: 'tipo-device', icon: 'desktop', isVisible: true },
            { label: 'menu.tipoOperazione', url: 'tipo-operazione', icon: 'tasks', isVisible: true },
            { label: 'menu.regoleLimitiIs107', url: 'regole-limiti-is107', icon: 'ruler', isVisible: true }
          ]
        }
      ]
    }
  ];

  constructor() {
    // Inizializza il menu con i dati predefiniti
    this.updateTranslatedMenu();
    
    // Sottoscrivi ai cambiamenti di lingua
    this.transloco.langChanges$.subscribe(async (lang) => {
      // Aspetta che la nuova lingua sia caricata prima di tradurre
      await firstValueFrom(this.transloco.load(lang));
      this.updateTranslatedMenu();
    });
  }

  /**
   * Carica il menu dal backend
   */
  async loadMenu(): Promise<void> {
    this.rawMenuItems = this.menuItems; // Usa il menu predefinito come fallback
    this.updateTranslatedMenu();
    
    // try {
    //   // Aspetta che le traduzioni siano caricate
    //   await firstValueFrom(this.transloco.load(this.transloco.getActiveLang()));
      
    //   const menuFromApi = await firstValueFrom(this.api.get<MenuItem[]>('menu'));
      
    //   if (menuFromApi) {
    //     this.rawMenuItems = menuFromApi;
    //     this.updateTranslatedMenu();
    //   } else {
    //     // Usa il menu predefinito se l'API non restituisce dati
    //     this.rawMenuItems = this.menuItems;
    //     this.updateTranslatedMenu();
    //   }
    // } catch (error) {
    //   console.error('Error loading menu from API:', error);
    //   // Fallback al menu predefinito in caso di errore
    //   this.rawMenuItems = this.menuItems;
    //   this.updateTranslatedMenu();
    // }
  }

  /**
   * Aggiorna il menu traducendo tutte le label
   */
  private updateTranslatedMenu(): void {
    const translated = this.translateMenuItems(this.menuItems);

    this.menuItemsSignal.set(translated);
    // Aggiorna anche i filtrati se non c'è ricerca attiva
    if (!this.searchQuerySignal()) {
      this.filteredMenuItemsSignal.set(translated);
    } else {
      // Riapplica la ricerca con il menu tradotto
      this.search(this.searchQuerySignal());
    }
  }

  /**
   * Traduce ricorsivamente tutti gli elementi del menu
   */
  private translateMenuItems(items: MenuItem[]): MenuItem[] {
    return items.map(item => ({
      ...item,
      label: this.transloco.translate(item.label),
      children: item.children ? this.translateMenuItems(item.children) : undefined
    }));
  }

  /**
   * Ritorna il signal reattivo del menu
   */
  getMenuItems() {
    //return this.menuItemsSignal;
    return this.menuItemsSignal();
  }

  /**
   * Ritorna il valore corrente del menu (non reattivo)
   */
  getCurrentMenuItems(): MenuItem[] {
    return this.menuItemsSignal();
  }

  findMenuItemByUrl(url: string): MenuItem | null {
    return this.findItemByUrl(this.menuItemsSignal(), url);
  }

  private findItemByUrl(items: MenuItem[], url: string): MenuItem | null {
    for (const item of items) {
      if (item.url === url) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const found = this.findItemByUrl(item.children, url);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  getChildrenOf(url: string): MenuItem[] {
    const item = this.findMenuItemByUrl(url);
    return item?.children?.filter(child => child.isVisible) ?? [];
  }

  getItemDescription(label: string): string {
    const descriptions: { [key: string]: string } = {
      'Anagrafica': 'Gestione dei dati anagrafici del sistema',
      'Pratiche Fido': 'Visualizza e gestisci le pratiche di fido',
      'Linee di Credito': 'Gestione delle linee di credito disponibili',
      'Coperture': 'Amministrazione delle coperture assicurative',
      'Utenti': 'Gestisci gli utenti del sistema',
      'Ruoli': 'Configura i ruoli e le relative autorizzazioni',
      'Rapporti': 'Gestione dei rapporti',
      'Relazioni': 'Gestione delle relazioni bancarie'
    };
    return descriptions[label] ?? 'Clicca per accedere';
  }

  /**
   * Cerca elementi del menu
   */
  search(query: string): void {
    this.searchQuerySignal.set(query);
    
    if (!query.trim()) {
      this.filteredMenuItemsSignal.set(this.menuItemsSignal());
      return;
    }

    const filtered = this.filterMenuItems(this.menuItemsSignal(), query.toLowerCase());
    this.filteredMenuItemsSignal.set(filtered);
  }

  /**
   * Filtra gli elementi del menu basandosi sulla query
   */
  private filterMenuItems(items: MenuItem[], query: string): MenuItem[] {
    const filtered: MenuItem[] = [];
    
    for (const item of items) {
      const labelMatch = item.label.toLowerCase().includes(query);
      const urlMatch = item.url?.toLowerCase().includes(query) || false;
      
      let matchingChildren: MenuItem[] | undefined;
      if (item.children) {
        matchingChildren = this.filterMenuItems(item.children, query);
      }

      const hasMatchingChildren = matchingChildren && matchingChildren.length > 0;

      if (labelMatch || urlMatch || hasMatchingChildren) {
        filtered.push({
          ...item,
          children: matchingChildren,
          isExpanded: hasMatchingChildren ? true : item.isExpanded,
        });
      }
    }
    
    return filtered;
  }

  /**
   * Ritorna il signal dei menu items filtrati
   */
  filteredMenuItems() {
    return this.filteredMenuItemsSignal();
  }

  /**
   * Pulisce la ricerca
   */
  clearSearch(): void {
    this.searchQuerySignal.set('');
    this.filteredMenuItemsSignal.set(this.menuItemsSignal());
  }

  /**
   * Ritorna la query di ricerca corrente
   */
  searchQuery() {
    return this.searchQuerySignal();
  }
}
