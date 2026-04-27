import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';

@Component({
  selector: 'app-card-toolbar',
  standalone: true,
  imports: [CommonModule, DxTextBoxModule],
  templateUrl: './card-toolbar.component.html',
  styleUrls: ['./card-toolbar.component.css']
})
export class CardToolbarComponent {
  @Input() searchValue: string = '';
  @Input() searchPlaceholder: string = 'Cerca...';
  @Input() showSearch: boolean = true;

  @Output() searchValueChange = new EventEmitter<string>();
}
