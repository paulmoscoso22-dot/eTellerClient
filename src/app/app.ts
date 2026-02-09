import { Component, DOCUMENT, Inject, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DxDataGridComponent, DxTemplateDirective } from 'devextreme-angular';
import { DxDataGridModule, DxiDataGridColumnComponent, DxoDataGridSortingComponent } from 'devextreme-angular/ui/data-grid';
import { licenseKey } from './devextreme-lincense';
import { config } from 'devextreme/common';
//import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxButtonModule } from 'devextreme-angular';

config({licenseKey});

@Component({
  selector: 'app-root',
  imports: [
    DxButtonModule,
    DxDataGridModule,
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  data = [
  { id: 1, nome: 'Mario Rossi', email: 'mario.rossi@test.it', ruolo: 'Admin' },
  { id: 2, nome: 'Luigi Bianchi', email: 'luigi.bianchi@test.it', ruolo: 'User' },
  { id: 3, nome: 'Anna Verdi', email: 'anna.verdi@test.it', ruolo: 'User' },
  { id: 4, nome: 'Paolo Neri', email: 'paolo.neri@test.it', ruolo: 'User' },
  { id: 5, nome: 'Giulia Conti', email: 'giulia.conti@test.it', ruolo: 'Admin' },
  { id: 6, nome: 'Francesco Gallo', email: 'francesco.gallo@test.it', ruolo: 'User' },
  { id: 7, nome: 'Sara Greco', email: 'sara.greco@test.it', ruolo: 'User' },
  { id: 8, nome: 'Alessandro Romano', email: 'alessandro.romano@test.it', ruolo: 'Admin' },
  { id: 9, nome: 'Elena Colombo', email: 'elena.colombo@test.it', ruolo: 'User' },
  { id: 10, nome: 'Davide Ricci', email: 'davide.ricci@test.it', ruolo: 'User' },

  { id: 11, nome: 'Chiara Marino', email: 'chiara.marino@test.it', ruolo: 'User' },
  { id: 12, nome: 'Marco De Luca', email: 'marco.deluca@test.it', ruolo: 'Admin' },
  { id: 13, nome: 'Valentina Costa', email: 'valentina.costa@test.it', ruolo: 'User' },
  { id: 14, nome: 'Stefano Ferri', email: 'stefano.ferri@test.it', ruolo: 'User' },
  { id: 15, nome: 'Ilaria Rizzo', email: 'ilaria.rizzo@test.it', ruolo: 'User' },
  { id: 16, nome: 'Andrea Moretti', email: 'andrea.moretti@test.it', ruolo: 'Admin' },
  { id: 17, nome: 'Federica Lombardi', email: 'federica.lombardi@test.it', ruolo: 'User' },
  { id: 18, nome: 'Giorgio Barbieri', email: 'giorgio.barbieri@test.it', ruolo: 'User' },
  { id: 19, nome: 'Martina Fontana', email: 'martina.fontana@test.it', ruolo: 'User' },
  { id: 20, nome: 'Simone Caruso', email: 'simone.caruso@test.it', ruolo: 'Admin' },

  { id: 21, nome: 'Roberta Fabbri', email: 'roberta.fabbri@test.it', ruolo: 'User' },
  { id: 22, nome: 'Nicola Santoro', email: 'nicola.santoro@test.it', ruolo: 'User' },
  { id: 23, nome: 'Laura Pellegrini', email: 'laura.pellegrini@test.it', ruolo: 'User' },
  { id: 24, nome: 'Matteo Villa', email: 'matteo.villa@test.it', ruolo: 'Admin' },
  { id: 25, nome: 'Silvia Donati', email: 'silvia.donati@test.it', ruolo: 'User' },
  { id: 26, nome: 'Lorenzo Rinaldi', email: 'lorenzo.rinaldi@test.it', ruolo: 'User' },
  { id: 27, nome: 'Alessia Marchetti', email: 'alessia.marchetti@test.it', ruolo: 'User' },
  { id: 28, nome: 'Fabio Serra', email: 'fabio.serra@test.it', ruolo: 'Admin' },
  { id: 29, nome: 'Claudia Testa', email: 'claudia.testa@test.it', ruolo: 'User' },
  { id: 30, nome: 'Riccardo Pini', email: 'riccardo.pini@test.it', ruolo: 'User' },

  { id: 31, nome: 'Marta Longo', email: 'marta.longo@test.it', ruolo: 'User' },
  { id: 32, nome: 'Emanuele Gatti', email: 'emanuele.gatti@test.it', ruolo: 'Admin' },
  { id: 33, nome: 'Francesca Bellini', email: 'francesca.bellini@test.it', ruolo: 'User' },
  { id: 34, nome: 'Daniele Morelli', email: 'daniele.morelli@test.it', ruolo: 'User' },
  { id: 35, nome: 'Cristina Vitale', email: 'cristina.vitale@test.it', ruolo: 'User' },
  { id: 36, nome: 'Pietro Ruggieri', email: 'pietro.ruggieri@test.it', ruolo: 'Admin' },
  { id: 37, nome: 'Noemi Palumbo', email: 'noemi.palumbo@test.it', ruolo: 'User' },
  { id: 38, nome: 'Luca Parisi', email: 'luca.parisi@test.it', ruolo: 'User' },
  { id: 39, nome: 'Serena D’Amico', email: 'serena.damico@test.it', ruolo: 'User' },
  { id: 40, nome: 'Alberto Sanna', email: 'alberto.sanna@test.it', ruolo: 'Admin' },

  { id: 41, nome: 'Beatrice Corsi', email: 'beatrice.corsi@test.it', ruolo: 'User' },
  { id: 42, nome: 'Gabriele Mancini', email: 'gabriele.mancini@test.it', ruolo: 'User' },
  { id: 43, nome: 'Irene Giordano', email: 'irene.giordano@test.it', ruolo: 'User' },
  { id: 44, nome: 'Tommaso Orlandi', email: 'tommaso.orlandi@test.it', ruolo: 'Admin' },
  { id: 45, nome: 'Veronica Silvestri', email: 'veronica.silvestri@test.it', ruolo: 'User' },
  { id: 46, nome: 'Michele Pagani', email: 'michele.pagani@test.it', ruolo: 'User' },
  { id: 47, nome: 'Elisa Monti', email: 'elisa.monti@test.it', ruolo: 'User' },
  { id: 48, nome: 'Antonio Farina', email: 'antonio.farina@test.it', ruolo: 'Admin' },
  { id: 49, nome: 'Laura Guidi', email: 'laura.guidi@test.it', ruolo: 'User' },
  { id: 50, nome: 'Stefano Riva', email: 'stefano.riva@test.it', ruolo: 'User' }
];

  protected readonly title = signal('eTellerClient');

  constructor(@Inject(DOCUMENT) private document: Document){
      
  }

  ngOnInit(): void {
    if (typeof document === 'undefined') {
        return;
    }
  }

  onSave(): void {
    console.log('Bottone DevExpress cliccato');
  }
}
