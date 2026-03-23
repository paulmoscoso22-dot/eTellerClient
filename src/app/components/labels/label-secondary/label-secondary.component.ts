import { Component, Input } from '@angular/core';
import { DxFormModule } from 'devextreme-angular';

@Component({
  selector: 'app-label-secondary',
  standalone: true,
  imports: [],
  templateUrl: './label-secondary.component.html',
  styleUrls: ['./label-secondary.component.css']
})
export class LabelSecondaryComponent {
  @Input() label = '';
}
