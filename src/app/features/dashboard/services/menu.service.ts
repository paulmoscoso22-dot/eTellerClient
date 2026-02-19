import { Injectable } from '@angular/core';

interface MenuItem {
  Full_Name?: string;
  path?: string;
  icon?: string;
  items?: MenuItem[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
private menuItems: MenuItem[] = [
{
  Full_Name: 'Operations',
  icon: 'money',
  items: [{
    Full_Name: 'Conti Correnti',
    icon: 'card',
    items: [
        {
        Full_Name: 'Versamento',
        path: 'versamento',
        icon: 'arrowdown'
        }
        , 
        {
        Full_Name: 'Prelievo',
        path: 'prelievo',
        icon: 'arrowup'
        },
        {    
            Full_Name: 'Estratto conto',
            path: 'estratto-conto',
            icon: 'doc'
        }
    ],
 }, 
 {
    Full_Name: 'Cambi',
    icon: 'globe',
    items: [{
      Full_Name: 'Biglietti Banca',
      path: 'biglietti-banca',
      icon: 'money',
        items: [{ Full_Name: 'Acquisto', icon: 'purchase' },
                { Full_Name: 'Vendita', icon: 'sale' }
               ],
    
    }, {
      Full_Name: 'Monete Metalli',
      path: 'monete-metalli',
      icon: 'gold',
      items: [{
        Full_Name: 'Acquisto',
        icon: 'purchase'
      }, {
        Full_Name: 'Vendita',
        icon: 'sale'
      }],
    }],
  }, 
  {
    Full_Name: 'Travelers Cheques',
    icon: 'traveler',
    items: [{
      Full_Name: 'Acquisto',
      path: 'travelers-acquisto',
      icon: 'purchase'
    }
   ,{
      Full_Name: 'Vendita',
      path: 'travelers-vendita',
      icon: 'sale'
    }],
  },
  {
    Full_Name: 'Assegni/Cheques',
    icon: 'check',
    items: [{
      Full_Name: 'Versamento c/c',
      path: 'versamento-cc',
      icon: 'arrowdown'
    }],
  }],
},
{
    Full_Name: 'Archivi',
    icon: 'folder',
    items: [
      {
        Full_Name: 'Ricerca e Report',
        icon: 'search',
        items: [
          { Full_Name: 'Ricerca', path: 'ricerca', icon: 'search' }
        ]
      },
      {
        Full_Name: 'Report',
        icon: 'chart',
        items: [
          { Full_Name: 'Attesa benefondo', path: 'attesa-benefondo', icon: 'hourglass' },
          { Full_Name: 'Giornale cassa', path: 'giornale-cassa', icon: 'book' },
          { Full_Name: 'Operazioni annullate', path: 'operazioni-annullate', icon: 'close' },
          { Full_Name: 'Totali di cassa', path: 'totali-cassa', icon: 'sum' }
        ]
      }
    ]
},
{
    Full_Name: 'Vigilanza',
    icon: 'warning',
    items: [
      {
        Full_Name: 'Ricerca',
        icon: 'search',
        items: [
          { Full_Name: 'Ricerca operazioni', path: 'ricerca-operazioni', icon: 'search' }
        ]
      },
      {
        Full_Name: 'Gestione',
        icon: 'config',
        items: [
          { Full_Name: 'Gestione regole', path: 'gestione-regole', icon: 'ruler' },
          { Full_Name: 'Gestione comparenti e ADE', path: 'gestione-comparenti-ade', icon: 'group' }
        ]
      }
    ]
},
{
    Full_Name: 'Help',
    icon: 'help',
    items: [
      { Full_Name: 'Help', path: 'help', icon: 'help' }
    ]
},
{
    Full_Name: 'Manager',
    icon: 'menu',
    items: [
      {
        Full_Name: 'Sicurezza',
        icon: 'gear',
        items: [
          { Full_Name: 'Info Autorizzazioni', path: 'info-autorizzazioni', icon: 'key' },
          { Full_Name: 'Funzioni', path: 'funzioni', icon: 'tasks' },
          { Full_Name: 'Personalizzazioni', path: 'personalizzazioni', icon: 'palette' },
          { Full_Name: 'Ruoli', path: 'ruoli', icon: 'group' },
          { Full_Name: 'Utenti', path: 'utenti', icon: 'user' },
          { Full_Name: 'Utenti collegati', path: 'utenti-collegati', icon: 'people' }
        ]
      },
      {
        Full_Name: 'Casse Periferiche',
        icon: 'database',
        items: [
          { Full_Name: 'Casse', path: 'casse', icon: 'inbox' },
          { Full_Name: 'Conti cassa', path: 'conti-cassa', icon: 'card' },
          { Full_Name: 'Periferiche', path: 'periferiche', icon: 'resource' }
        ]
      },
      {
        Full_Name: 'Informazioni',
        icon: 'info',
        items: [
          { Full_Name: 'Gestione Messaggi host', path: 'gestione-messaggi-host', icon: 'message' },
          { Full_Name: 'Trace', path: 'trace', icon: 'tracepointlog' },
          { Full_Name: 'Log Sched. Task', path: 'log-sched-task', icon: 'file' }
        ]
      },
      {
        Full_Name: 'Divise',
        icon: 'globe',
        items: [
          { Full_Name: 'Aggiorna dati anagrafici', path: 'aggiorna-dati-anagrafici', icon: 'refresh' },
          { Full_Name: 'Coppie divise', path: 'coppie-divise', icon: 'link' },
          { Full_Name: 'Corsi', path: 'corsi', icon: 'chart' },
          { Full_Name: 'Dati anagrafici', path: 'dati-anagrafici', icon: 'doc' },
          { Full_Name: 'Spread', path: 'spread', icon: 'columnchooser' }
        ]
      },
      {
        Full_Name: 'Tabelle',
        icon: 'table',
        items: [
          { Full_Name: 'Categorie dei conti', path: 'categorie-conti', icon: 'folder' },
          { Full_Name: 'Causale Movimenti', path: 'causale-movimenti', icon: 'event' },
          { Full_Name: 'ForceTrx', path: 'force-trx', icon: 'lightning' },
          { Full_Name: 'Funzioni Traccie', path: 'funzioni-traccie', icon: 'tracer' },
          { Full_Name: 'Gestione Errori', path: 'gestione-errori', icon: 'warning' },
          { Full_Name: 'Livello Acesso Funzioni', path: 'livello-accesso-funzioni', icon: 'hierarchy' },
          { Full_Name: 'Nomi Tabelle', path: 'nomi-tabelle', icon: 'table' },
          { Full_Name: 'Scheduled Tasks', path: 'scheduled-tasks', icon: 'clock' },
          { Full_Name: 'Servizi', path: 'servizi', icon: 'service' },
          { Full_Name: 'Stato benefondo', path: 'stato-benefondo', icon: 'info' },
          { Full_Name: 'Stato transazione', path: 'stato-transazione', icon: 'info' },
          { Full_Name: 'Tipo conti', path: 'tipo-conti', icon: 'folder' },
          { Full_Name: 'Tipo Device', path: 'tipo-device', icon: 'desktop' },
          { Full_Name: 'Tipo Operazione', path: 'tipo-operazione', icon: 'tasks' },
          { Full_Name: 'Regole limiti IS107', path: 'regole-limiti-is107', icon: 'ruler' }
        ]
      }
    ]
}
];
  constructor() { }

  getMenuItems() {
    return this.menuItems;
  }

  searchMenuItems(query: string): MenuItem[] {
    const lowerQuery = query.toLowerCase();
    return this.filterMenuItems(this.menuItems, lowerQuery);
  }

  private filterMenuItems(items: MenuItem[], query: string): MenuItem[] {
    return items.filter(item => {
      const nameMatch = item.Full_Name?.toLowerCase().includes(query) || false;
      let hasMatchingChildren = false;

      if (item.items && item.items.length > 0) {
        item.items = this.filterMenuItems(item.items, query);
        hasMatchingChildren = item.items.length > 0;
      }

      return nameMatch || hasMatchingChildren;
    });
  }
}
