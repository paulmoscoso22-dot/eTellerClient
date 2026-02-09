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
  

  protected readonly title = signal('eTellerClient');

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

 


}
