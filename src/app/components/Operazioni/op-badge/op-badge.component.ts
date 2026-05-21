import { Component, Input } from '@angular/core';

export type OpBadgeMode = 'acquisto' | 'vendita' | 'versamento' | 'prelevamento';

@Component({
  selector: 'op-badge',
  standalone: true,
  templateUrl: './op-badge.component.html',
  styleUrls: ['./op-badge.component.css'],
})
export class OpBadgeComponent {
  @Input({ required: true }) mode!: OpBadgeMode;
  @Input({ required: true }) title!: string;
  @Input() operazioneNr: string | null = null;

  get isIncoming(): boolean {
    return this.mode === 'acquisto' || this.mode === 'versamento';
  }
}
