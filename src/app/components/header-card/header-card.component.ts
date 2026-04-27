import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-card.component.html',
  styleUrls: ['./header-card.component.css']
})
export class HeaderCardComponent {
  @Input({ required: true }) title: string = '';
  @Input() count: string | number | null | undefined = undefined;
}
