import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sempione-currency-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sempione-currency-badge.component.html',
  styleUrls: ['./sempione-currency-badge.component.css'],
})
export class SempioneCurrencyBadgeComponent {
  @Input({ required: true }) code: string = '';
}
