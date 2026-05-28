import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DxDateBoxModule } from 'devextreme-angular';

@Component({
  selector: 'app-sempione-toolbar-date-range',
  standalone: true,
  imports: [DxDateBoxModule],
  templateUrl: './sempione-toolbar-date-range.component.html',
  styleUrls: ['./sempione-toolbar-date-range.component.css'],
})
export class SempioneToolbarDateRangeComponent {
  @Input() labelDal   = 'Data dal';
  @Input() valueDal: Date | null = null;
  @Input() valueAl:  Date | null = null;
  @Input() displayFormat = 'dd/MM/yyyy';
  @Input() width = 130;

  @Output() dalChange = new EventEmitter<Date | null>();
  @Output() alChange  = new EventEmitter<Date | null>();
}
