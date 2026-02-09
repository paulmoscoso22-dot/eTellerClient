import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular';
import { config } from 'devextreme/common';
import { licenseKey } from './devextreme-lincense';

config({ licenseKey });

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DxButtonModule],
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('eTellerClient');
}
