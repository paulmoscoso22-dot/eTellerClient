import { Component, computed } from '@angular/core';
import { Theme } from '../../../services/theme';

@Component({
  selector: 'app-sempione-logo',
  standalone: true,
  imports: [],
  templateUrl: './sempione-logo.component.html',
  styleUrl: './sempione-logo.component.css',
})
export class SempioneLogoComponent {

  constructor(private themeService: Theme) {}

  fillColor = computed(() => {
    return this.themeService.isDarkTheme() ? '#ffffff' : '#1e293b';
  });

}
