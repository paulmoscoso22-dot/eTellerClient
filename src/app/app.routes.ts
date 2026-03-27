import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      //Operazioni
      {
        path: 'versamento',
        loadComponent: () => import('./features/operations/contiCorrenti/pages/versamento/versamento.component').then(m => m.VersamentoComponent)
      },
      {
        path: 'prelievo',
        loadComponent: () => import('./features/operations/contiCorrenti/pages/prelevamento/prelievo.component').then(m => m.PrelievoComponent)
      },
      {
        path: 'estratto-conto',
        loadComponent: () => import('./features/operations/contiCorrenti/pages/estrattoConto/estratto-conto.component').then(m => m.EstratoContoComponent)
      },
      {
        path: 'ricerca',
        loadComponent: () => import('./features/archivi/ricerca/pages/ricerca.component').then(m => m.RicercaComponent)
      },
      {
        path: 'attesa-benefondo',
        loadComponent: () => import('./features/archivi/report/pages/attesa-benefondo/attesa-benefondo.component').then(m => m.AttesaBenefondoComponent)
      },
      {
        path: 'giornale-cassa',
        loadComponent: () => import('./features/archivi/report/pages/giornale-cassa/giornale-cassa.component').then(m => m.GiornaleCassaComponent)
      },

      {
        path: 'operazioni-annullate',
        loadComponent: () => import('./features/archivi/report/pages/operazioni-annullate/operazioni-annullate.component').then(m => m.OperazioniAnnullateComponent)
      },
      {
        path: 'totali-cassa',
        loadComponent: () => import('./features/archivi/report/pages/totali-cassa/totali-cassa.component').then(m => m.TotaliCassaComponent)
      },

      {
        path: 'ricerca-operazioni',
        loadComponent: () => import('./features/vigilanza/ricerca/pages/ricerca-operazioni.component').then(m => m.RicercaOperazioniComponent)
      },
      {
        path: 'gestione-regole',
        loadComponent: () => import('./features/vigilanza/gestione/pages/gestione-regole/gestione-regole.component').then(m => m.GestioneRegoleComponent)
      },
      {
        path: 'gestione-comparenti-ade',
        loadComponent: () => import('./features/vigilanza/gestione/pages/gestione-comparenti-ade/gestione-comparenti-ade.component').then(m => m.GestioneComparentiAdeComponent)
      },
      {
        path: 'help',
        loadComponent: () => import('./features/help/pages/help.component').then(m => m.HelpComponent)
      },
      {
        path: 'info-autorizzazioni',
        loadComponent: () => import('./features/manager/sicurezza/pages/info-autorizzazioni/info-autorizzazioni.component').then(m => m.InfoAutorizzazioniComponent)
      },
      {
        path: 'funzioni',
        loadComponent: () => import('./features/manager/sicurezza/pages/funzioni/funzioni.component').then(m => m.FunzioniComponent)
      },
      {
        path: 'personalizzazioni',
        loadComponent: () => import('./features/manager/sicurezza/pages/personalizzazioni/personalizzazioni.component').then(m => m.PersonalizzazioniComponent)
      },
      {
        path: 'ruoli',
        loadComponent: () => import('./features/manager/sicurezza/pages/ruoli/ruoli.component').then(m => m.RuoliComponent)
      },
      {
        path: 'utenti',
        loadComponent: () => import('./features/manager/sicurezza/pages/utenti/utenti.component').then(m => m.UtentiComponent)
      },
      {
        path: 'utenti-collegati',
        loadComponent: () => import('./features/manager/sicurezza/pages/utenti-collegati/utenti-collegati.component').then(m => m.UtentiCollegatiComponent)
      },
      {
        path: 'casse',
        loadComponent: () => import('./features/manager/cassePeriferiche/pages/casse.component').then(m => m.CasseComponent)
      },
      {
        path: 'conti-cassa',
        loadComponent: () => import('./features/manager/cassePeriferiche/pages/conti-cassa.component').then(m => m.ContiCassaComponent)
      },
      {
        path: 'periferiche',
        loadComponent: () => import('./features/manager/cassePeriferiche/pages/periferiche.component').then(m => m.PerifericheComponent)
      },
      {
        path: 'gestione-messaggi-host',
        loadComponent: () => import('./features/manager/informazioni/pages/gestione-messaggi-host/gestione-messaggi-host.component').then(m => m.GestioneMessaggiHostComponent)
      },
      {
        path: 'trace',
        loadComponent: () => import('./features/manager/informazioni/pages/trace/trace.component').then(m => m.TraceComponent)
      },
      {
        path: 'log-sched-task',
        loadComponent: () => import('./features/manager/informazioni/pages/log-sched-task/log-sched-task.component').then(m => m.LogSchedTaskComponent)
      },
      //divise
      {
        path: 'aggiorna-dati-anagrafici',
        loadComponent: () => import('./features/manager/divise/pages/aggiorna-dati-anagrafici.component').then(m => m.AggiornaDAtiAnagraficiComponent)
      },
      {
        path: 'coppie-divise',
        loadComponent: () => import('./features/manager/divise/pages/coppie-divise.component').then(m => m.CoppieDiviseComponent)
      },
      {
        path: 'corsi',
        loadComponent: () => import('./features/manager/divise/pages/corsi.component').then(m => m.CorsiComponent)
      },
      {
        path: 'dati-anagrafici',
        loadComponent: () => import('./features/manager/divise/pages/dati-anagrafici.component').then(m => m.DatiAnagraficiComponent)
      },
      {
        path: 'spread',
        loadComponent: () => import('./features/manager/divise/pages/spread.component').then(m => m.SpreadComponent)
      },
      //Tabelle
      {
        path: 'categorie-conti',
        loadComponent: () => import('./features/manager/tabelle/pages/categorie-conti.component').then(m => m.CategorieContiComponent)
      },
      {
        path: 'causale-movimenti',
        loadComponent: () => import('./features/manager/tabelle/pages/causale-movimenti.component').then(m => m.CausaleMovimentiComponent)
      },
      {
        path: 'force-trx',
        loadComponent: () => import('./features/manager/tabelle/pages/force-trx.component').then(m => m.ForceTrxComponent)
      },
      {
        path: 'funzioni-traccie',
        loadComponent: () => import('./features/manager/tabelle/pages/funzioni-traccie.component').then(m => m.FunzioniTracceComponent)
      },
      {
        path: 'gestione-errori',
        loadComponent: () => import('./features/manager/tabelle/pages/gestione-errori.component').then(m => m.GestioneErroriComponent)
      },
      {
        path: 'livello-accesso-funzioni',
        loadComponent: () => import('./features/manager/tabelle/pages/livello-accesso-funzioni.component').then(m => m.LivelloAccessoFunzioniComponent)
      },
      {
        path: 'nomi-tabelle',
        loadComponent: () => import('./features/manager/tabelle/pages/nomi-tabelle.component').then(m => m.NomiTabelleComponent)
      },
      {
        path: 'scheduled-tasks',
        loadComponent: () => import('./features/manager/tabelle/pages/scheduled-tasks.component').then(m => m.ScheduledTasksComponent)
      },
      {
        path: 'servizi',
        loadComponent: () => import('./features/manager/tabelle/pages/servizi.component').then(m => m.ServiziComponent)
      },
      {
        path: 'stato-benefondo',
        loadComponent: () => import('./features/manager/tabelle/pages/stato-benefondo.component').then(m => m.StatoBenefondoComponent)
      },
      {
        path: 'stato-transazione',
        loadComponent: () => import('./features/manager/tabelle/pages/stato-transazione.component').then(m => m.StatoTransazioneComponent)
      },
      {
        path: 'tipo-conti',
        loadComponent: () => import('./features/manager/tabelle/pages/tipo-conti.component').then(m => m.TipoContiComponent)
      },
      {
        path: 'tipo-device',
        loadComponent: () => import('./features/manager/tabelle/pages/tipo-device.component').then(m => m.TipoDeviceComponent)
      },
      {
        path: 'tipo-operazione',
        loadComponent: () => import('./features/manager/tabelle/pages/tipo-operazione.component').then(m => m.TipoOperazioneComponent)
      },
      {
        path: 'regole-limiti-is107',
        loadComponent: () => import('./features/manager/tabelle/pages/regole-limiti-is107.component').then(m => m.RegoleLimitiIs107Component)
      },
      //Operazioni - cambi biglietti banca
      {
        path: 'biglietti-banca-acquisto',
        loadComponent: () => import('./features/operations/cambi/pages/bigliettiBanca/acquisto.component').then(m => m.AcquistoComponent)
      },
      {
        path: 'biglietti-banca-vendita',
        loadComponent: () => import('./features/operations/cambi/pages/bigliettiBanca/vendita.component').then(m => m.VenditaComponent)
      },
      //Operazioni - cambi monete metalli
      {
        path: 'monete-metalli-acquisto',
        loadComponent: () => import('./features/operations/cambi/pages/moneteMetalli/acquisto.component').then(m => m.AcquistoComponent)
      },
      {
        path: 'monete-metalli-vendita',
        loadComponent: () => import('./features/operations/cambi/pages/moneteMetalli/vendita.component').then(m => m.VenditaComponent)
      },
      //Operazioni - cambi travelers cheques
      {
        path: 'travelers-cheques-acquisto',
        loadComponent: () => import('./features/operations/cambi/pages/travelersCheques/acquisto.component').then(m => m.AcquistoTravelersComponent)
      },
      {
        path: 'travelers-cheques-vendita',
        loadComponent: () => import('./features/operations/cambi/pages/travelersCheques/vendita.component').then(m => m.VenditaTravelersComponent)
      },
      //Operazioni - assegni cheques
      {
        path: 'versamento-cc',
        loadComponent: () => import('./features/operations/assegniCheques/pages/versamento-cc.component').then(m => m.VersamentoCcComponent)
      }


    ]
  }

];

