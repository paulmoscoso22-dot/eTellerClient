import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

/**
 * Dashboard feature routes
 */
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'versamento',
        loadComponent: () => import('../operations/contiCorrenti/pages/versamento.component').then(m => m.VersamentoComponent)
      },
      {
        path: 'prelievo',
        loadComponent: () => import('../operations/contiCorrenti/pages/prelievo.component').then(m => m.PrelievoComponent)
      },
      {
        path: 'estratto-conto',
        loadComponent: () => import('../operations/contiCorrenti/pages/estratto-conto.component').then(m => m.EstratoContoComponent)
      },
      {
        path: 'biglietti-banca',
        loadComponent: () => import('../operations/cambi/pages/biglietti-banca.component').then(m => m.BigliettiAncaComponent)
      },
      {
        path: 'monete-metalli',
        loadComponent: () => import('../operations/cambi/pages/monete-metalli.component').then(m => m.MoneteMetalliComponent)
      },
      {
        path: 'travelers-acquisto',
        loadComponent: () => import('../operations/travelersCheques/pages/acquisto.component').then(m => m.AcquistoTravelersComponent)
      },
      {
        path: 'travelers-vendita',
        loadComponent: () => import('../operations/travelersCheques/pages/vendita.component').then(m => m.VenditaTravelersComponent)
      },
      {
        path: 'versamento-cc',
        loadComponent: () => import('../operations/assegniCheques/pages/versamento-cc.component').then(m => m.VersamentoCcComponent)
      },
      {
        path: 'ricerca',
        loadComponent: () => import('../archivi/ricercaReport/pages/ricerca.component').then(m => m.RicercaComponent)
      },
      {
        path: 'attesa-benefondo',
        loadComponent: () => import('../archivi/report/pages/attesa-benefondo/attesa-benefondo.component').then(m => m.AttesaBenefondoComponent)
      },
      {
        path: 'giornale-cassa',
        loadComponent: () => import('../archivi/report/pages/giornale-cassa/giornale-cassa.component').then(m => m.GiornaleCassaComponent)
      },
      {
        path: 'operazioni-annullate',
        loadComponent: () => import('../archivi/report/pages/operazioni-annullate/operazioni-annullate.component').then(m => m.OperazioniAnnullateComponent)
      },
      {
        path: 'totali-cassa',
        loadComponent: () => import('../archivi/report/pages/totali-cassa/totali-cassa.component').then(m => m.TotaliCassaComponent)
      },
      {
        path: 'ricerca-operazioni',
        loadComponent: () => import('../vigilanza/ricerca/pages/ricerca-operazioni.component').then(m => m.RicercaOperazioniComponent)
      },
      {
        path: 'gestione-regole',
        loadComponent: () => import('../vigilanza/gestione/pages/gestione-regole.component').then(m => m.GestioneRegoleComponent)
      },
      {
        path: 'gestione-comparenti-ade',
        loadComponent: () => import('../vigilanza/gestione/pages/gestione-comparenti-ade.component').then(m => m.GestioneComparentiAdeComponent)
      },
      {
        path: 'help',
        loadComponent: () => import('../help/pages/help.component').then(m => m.HelpComponent)
      },
      // Manager - Sicurezza
      {
        path: 'info-autorizzazioni',
        loadComponent: () => import('../manager/sicurezza/pages/info-autorizzazioni.component').then(m => m.InfoAutorizzazioniComponent)
      },
      {
        path: 'funzioni',
        loadComponent: () => import('../manager/sicurezza/pages/funzioni.component').then(m => m.FunzioniComponent)
      },
      {
        path: 'personalizzazioni',
        loadComponent: () => import('../manager/sicurezza/pages/personalizzazioni.component').then(m => m.PersonalizzazioniComponent)
      },
      {
        path: 'ruoli',
        loadComponent: () => import('../manager/sicurezza/pages/ruoli.component').then(m => m.RuoliComponent)
      },
      {
        path: 'utenti',
        loadComponent: () => import('../manager/sicurezza/pages/utenti.component').then(m => m.UtentiComponent)
      },
      {
        path: 'utenti-collegati',
        loadComponent: () => import('../manager/sicurezza/pages/utenti-collegati.component').then(m => m.UtentiCollegatiComponent)
      },
      // Manager - Casse Periferiche
      {
        path: 'casse',
        loadComponent: () => import('../manager/cassePerif/pages/casse.component').then(m => m.CasseComponent)
      },
      {
        path: 'conti-cassa',
        loadComponent: () => import('../manager/cassePerif/pages/conti-cassa.component').then(m => m.ContiCassaComponent)
      },
      {
        path: 'periferiche',
        loadComponent: () => import('../manager/cassePerif/pages/periferiche.component').then(m => m.PerifericheComponent)
      },
      // Manager - Informazioni
      {
        path: 'gestione-messaggi-host',
        loadComponent: () => import('../manager/informazioni/pages/gestione-messaggi-host.component').then(m => m.GestioneMessaggiHostComponent)
      },
      {
        path: 'trace',
        loadComponent: () => import('../manager/informazioni/pages/trace.component').then(m => m.TraceComponent)
      },
      {
        path: 'log-sched-task',
        loadComponent: () => import('../manager/informazioni/pages/log-sched-task.component').then(m => m.LogSchedTaskComponent)
      },
      // Manager - Divise
      {
        path: 'aggiorna-dati-anagrafici',
        loadComponent: () => import('../manager/divise/pages/aggiorna-dati-anagrafici.component').then(m => m.AggiornaDAtiAnagraficiComponent)
      },
      {
        path: 'coppie-divise',
        loadComponent: () => import('../manager/divise/pages/coppie-divise.component').then(m => m.CoppieDiviseComponent)
      },
      {
        path: 'corsi',
        loadComponent: () => import('../manager/divise/pages/corsi.component').then(m => m.CorsiComponent)
      },
      {
        path: 'dati-anagrafici',
        loadComponent: () => import('../manager/divise/pages/dati-anagrafici.component').then(m => m.DatiAnagraficiComponent)
      },
      {
        path: 'spread',
        loadComponent: () => import('../manager/divise/pages/spread.component').then(m => m.SpreadComponent)
      },
      // Manager - Tabelle
      {
        path: 'categorie-conti',
        loadComponent: () => import('../manager/tabelle/pages/categorie-conti.component').then(m => m.CategorieContiComponent)
      },
      {
        path: 'causale-movimenti',
        loadComponent: () => import('../manager/tabelle/pages/causale-movimenti.component').then(m => m.CausaleMovimentiComponent)
      },
      {
        path: 'force-trx',
        loadComponent: () => import('../manager/tabelle/pages/force-trx.component').then(m => m.ForceTrxComponent)
      },
      {
        path: 'funzioni-traccie',
        loadComponent: () => import('../manager/tabelle/pages/funzioni-traccie.component').then(m => m.FunzioniTracceComponent)
      },
      {
        path: 'gestione-errori',
        loadComponent: () => import('../manager/tabelle/pages/gestione-errori.component').then(m => m.GestioneErroriComponent)
      },
      {
        path: 'livello-accesso-funzioni',
        loadComponent: () => import('../manager/tabelle/pages/livello-accesso-funzioni.component').then(m => m.LivelloAccessoFunzioniComponent)
      },
      {
        path: 'nomi-tabelle',
        loadComponent: () => import('../manager/tabelle/pages/nomi-tabelle.component').then(m => m.NomiTabelleComponent)
      },
      {
        path: 'scheduled-tasks',
        loadComponent: () => import('../manager/tabelle/pages/scheduled-tasks.component').then(m => m.ScheduledTasksComponent)
      },
      {
        path: 'servizi',
        loadComponent: () => import('../manager/tabelle/pages/servizi.component').then(m => m.ServiziComponent)
      },
      {
        path: 'stato-benefondo',
        loadComponent: () => import('../manager/tabelle/pages/stato-benefondo.component').then(m => m.StatoBenefondoComponent)
      },
      {
        path: 'stato-transazione',
        loadComponent: () => import('../manager/tabelle/pages/stato-transazione.component').then(m => m.StatoTransazioneComponent)
      },
      {
        path: 'tipo-conti',
        loadComponent: () => import('../manager/tabelle/pages/tipo-conti.component').then(m => m.TipoContiComponent)
      },
      {
        path: 'tipo-device',
        loadComponent: () => import('../manager/tabelle/pages/tipo-device.component').then(m => m.TipoDeviceComponent)
      },
      {
        path: 'tipo-operazione',
        loadComponent: () => import('../manager/tabelle/pages/tipo-operazione.component').then(m => m.TipoOperazioneComponent)
      },
      {
        path: 'regole-limiti-is107',
        loadComponent: () => import('../manager/tabelle/pages/regole-limiti-is107.component').then(m => m.RegoleLimitiIs107Component)
      }
    ]
  }
];
