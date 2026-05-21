import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'op-page-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './op-page-layout.component.html',
  styleUrls: ['./op-page-layout.component.css'],
})
export class OpPageLayoutComponent {
  @Input({ required: true }) mode: 'acquisto' | 'vendita' | string = 'acquisto';
  @Input({ required: true }) title: string = '';
  @Input() operazioneNr: string | number | null = null;
}
