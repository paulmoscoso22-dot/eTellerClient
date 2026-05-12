import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DxPopupModule, DxButtonModule } from 'devextreme-angular';

@Component({
  selector: 'app-force-login',
  standalone: true,
  imports: [DxPopupModule, DxButtonModule],
  template: `
    <dx-popup
      [visible]="visible"
      title="Sessione attiva"
      [showCloseButton]="false"
      [dragEnabled]="false"
      [width]="420"
      [height]="'auto'"
    >
      <div *dxTemplate="let data of 'content'" style="padding: 16px;">
        <p>Esiste già una sessione attiva per questo account. Vuoi continuare e terminare la sessione esistente?</p>
        <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:16px;">
          <dx-button
            text="Annulla"
            type="normal"
            (onClick)="cancelled.emit()"
          ></dx-button>
          <dx-button
            text="Continua"
            type="danger"
            (onClick)="confirmed.emit()"
          ></dx-button>
        </div>
      </div>
    </dx-popup>
  `,
})
export class ForceLoginComponent {
  @Input() visible = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
