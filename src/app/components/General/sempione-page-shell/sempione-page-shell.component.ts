import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SempionePageHeaderComponent } from '../sempione-page-header/sempione-page-header.component';

@Component({
  selector: 'app-sempione-page-shell',
  standalone: true,
  imports: [CommonModule, SempionePageHeaderComponent],
  templateUrl: './sempione-page-shell.component.html',
  styleUrls: ['./sempione-page-shell.component.css'],
})
export class SempionePageShellComponent {
  @Input({ required: true }) title: string = '';
}
