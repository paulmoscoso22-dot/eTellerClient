import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';

@Component({
  selector: 'app-button-ricerca',
  standalone: true,
  imports: [DxButtonModule],
  templateUrl: './button-ricerca.component.html',
  styleUrl: './button-ricerca.component.css'
})
export class ButtonRicercaComponent {
  @Input() isLoading: boolean = false;
  @Input() text: string = 'Ricerca';
  @Output() onClick = new EventEmitter<void>();

  onButtonClick(): void {
    this.onClick.emit();
  }
}
